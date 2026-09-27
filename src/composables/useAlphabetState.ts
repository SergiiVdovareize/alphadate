import { ref, watch } from 'vue';
import { api } from '../services/api';
import type {
  LetterStatus,
  LetterState,
  Partner,
  BoardMetadata,
  SavedBoard,
  LetterHistoryItem
} from '../types';
export type { LetterStatus, LetterState, BoardMetadata, SavedBoard, LetterHistoryItem };

const UKRAINIAN_ALPHABET = [
  'А',
  'Б',
  'В',
  'Г',
  'Ґ',
  'Д',
  'Е',
  'Є',
  'Ж',
  'З',
  'И',
  'І',
  'Ї',
  'Й',
  'К',
  'Л',
  'М',
  'Н',
  'О',
  'П',
  'Р',
  'С',
  'Т',
  'У',
  'Ф',
  'Х',
  'Ц',
  'Ч',
  'Ш',
  'Щ',
  'Ь',
  'Ю',
  'Я'
];

const defaultState: LetterState[] = UKRAINIAN_ALPHABET.map((letter) => ({
  letter,
  status: 'available'
}));

/**
 * Initializes localStorage for a new board key without triggering component reactive watchers.
 */
export function initBoardLocalStorage(boardId: string, partnersArray: string[]): void {
  const LOCAL_STORAGE_KEY = `alphadate_state_${boardId}`;
  const mappedPartners: Partner[] = partnersArray.map((name, index) => ({
    id: index + 1,
    name
  }));

  const initialMetadata: BoardMetadata = {
    partners: mappedPartners,
    pinHash: null,
    currentPartnerId: 1,
    currentLetter: null,
    currentLetterSelectedAt: null
  };

  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      metadata: initialMetadata,
      letters: structuredClone(defaultState)
    })
  );
}

export function useAlphabetState(boardId: string) {
  const LOCAL_STORAGE_KEY = `alphadate_state_${boardId}`;
  const letters = ref<LetterState[]>([]);
  const metadata = ref<BoardMetadata>({
    partners: [],
    pinHash: null,
    currentPartnerId: null,
    currentLetter: null,
    currentLetterSelectedAt: null
  });
  const history = ref<LetterHistoryItem[]>([]);
  const activeLetter = ref<LetterState | null>(null);
  const fetchError = ref<string | null>(null);
  const isLoadingBackend = ref(boardId !== 'default');
  const isSyncing = ref(false);

  let currentSyncController: AbortController | null = null;

  // Load state from local storage or set default
  const fetchState = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Legacy migration
          letters.value = parsed;
        } else if (
          parsed &&
          parsed.letters &&
          Array.isArray(parsed.letters) &&
          parsed.letters.length > 0
        ) {
          letters.value = parsed.letters;
          if (parsed.metadata) {
            if (typeof parsed.metadata.partner1 === 'string') {
              // Legacy object struct migration
              metadata.value = {
                partners: [
                  { id: 1, name: parsed.metadata.partner1 },
                  { id: 2, name: parsed.metadata.partner2 || '' }
                ].filter((p) => p.name),
                pinHash: parsed.metadata.pinHash || null,
                currentPartnerId: 1,
                currentLetter: parsed.metadata.currentLetter || null,
                currentLetterSelectedAt: parsed.metadata.currentLetterSelectedAt || null
              };
            } else {
              const partnersList = parsed.metadata.partners || [];
              const mappedPartners =
                partnersList.length > 0 && typeof partnersList[0] === 'string'
                  ? partnersList.map((name: string, index: number) => ({ id: index + 1, name }))
                  : partnersList;

              metadata.value = {
                partners: mappedPartners,
                pinHash: parsed.metadata.pinHash || null,
                currentPartnerId: parsed.metadata.currentPartnerId || mappedPartners[0]?.id || null,
                currentLetter: parsed.metadata.currentLetter || null,
                currentLetterSelectedAt: parsed.metadata.currentLetterSelectedAt || null
              };
            }
          }
        } else {
          letters.value = structuredClone(defaultState);
        }

        if (parsed && parsed.history && Array.isArray(parsed.history)) {
          history.value = parsed.history;
        } else {
          history.value = [];
        }

        // Resolve activeLetter from currentLetter
        if (metadata.value.currentLetter) {
          activeLetter.value =
            letters.value.find((l) => l.letter === metadata.value.currentLetter) || null;
        }
      } catch (e) {
        letters.value = structuredClone(defaultState);
        history.value = [];
      }
    } else {
      letters.value = structuredClone(defaultState);
      history.value = [];
    }
  };

  fetchState();

  // Sync state from backend asynchronously
  const fetchBackendState = async () => {
    if (boardId === 'default') {
      isLoadingBackend.value = false;
      return;
    }
    isLoadingBackend.value = true;
    fetchError.value = null;

    try {
      const data = await api.getBoard(boardId);
      if (data && data.letters && Array.isArray(data.letters) && data.letters.length > 0) {
        letters.value = data.letters;
        if (data.history && Array.isArray(data.history)) {
          history.value = data.history;
        }
        if (data.metadata) {
          metadata.value = {
            ...data.metadata,
            currentLetterSelectedAt: data.metadata.currentLetterSelectedAt || null
          };
          activeLetter.value = data.metadata.currentLetter
            ? letters.value.find((l) => l.letter === data.metadata.currentLetter) || null
            : null;

          // Save board to local storage history list
          const savedKey = 'alphadate_saved_boards';
          const savedBoards: SavedBoard[] = JSON.parse(localStorage.getItem(savedKey) || '[]');
          const partnerNames = data.metadata.partners
            ? data.metadata.partners.map((p) => p.name)
            : [];
          const newEntry: SavedBoard = {
            key: boardId,
            partners: partnerNames,
            createdAt: new Date().toISOString()
          };
          const existing = savedBoards.find((b) => b.key === boardId);
          if (existing) {
            newEntry.createdAt = existing.createdAt;
          }
          const updated = [newEntry, ...savedBoards.filter((b) => b.key !== boardId)];
          localStorage.setItem(savedKey, JSON.stringify(updated));
        }
      }
    } catch (e: unknown) {
      console.error('Failed to sync state from backend:', e);
      fetchError.value = e instanceof Error ? e.message : 'Не вдалося завантажити дошку з сервера.';
    } finally {
      isLoadingBackend.value = false;
    }
  };

  fetchBackendState();

  // Watch for changes and save to local storage
  watch(
    [letters, metadata, history],
    () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          metadata: metadata.value,
          letters: letters.value,
          history: history.value
        })
      );
    },
    { deep: true }
  );

  // Sync with backend using AbortController to prevent race conditions
  const syncWithBackend = async () => {
    if (boardId === 'default') return;

    if (currentSyncController) {
      currentSyncController.abort();
    }
    currentSyncController = new AbortController();
    const signal = currentSyncController.signal;

    isSyncing.value = true;
    try {
      const data = await api.updateBoard(
        boardId,
        letters.value,
        metadata.value.currentLetter,
        signal
      );
      if (data) {
        if (typeof data.currentPartnerId === 'number') {
          metadata.value.currentPartnerId = data.currentPartnerId;
        }
        if (data.currentLetterSelectedAt !== undefined) {
          metadata.value.currentLetterSelectedAt = data.currentLetterSelectedAt;
        }
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // Request cancelled in favor of a newer state update
        return;
      }
      console.error('Failed to sync board state to backend:', e);
    } finally {
      isSyncing.value = false;
    }
  };

  const selectLetter = (letter: LetterState | null) => {
    activeLetter.value = letter;
    metadata.value.currentLetter = letter ? letter.letter : null;
    if (letter) {
      if (!metadata.value.currentLetterSelectedAt) {
        metadata.value.currentLetterSelectedAt = new Date(Date.now() - 5 * 1000).toISOString();
      }
    } else {
      metadata.value.currentLetterSelectedAt = null;
    }
    syncWithBackend();
  };

  const initBoardMetadata = (partnersArray: string[]) => {
    metadata.value.partners = partnersArray.map((name, index) => ({
      id: index + 1,
      name
    }));
    syncWithBackend();
  };

  const markAsStatus = (
    letterChar: string,
    status: LetterStatus,
    note?: string,
    clearActive: boolean = true
  ) => {
    const item = letters.value.find((l) => l.letter === letterChar);
    if (item) {
      item.status = status;
      if (note !== undefined) {
        item.note = note.trim() || undefined;
      }
      if (status === 'used') {
        const currentPartner = metadata.value.partners.find(
          (p) => p.id === metadata.value.currentPartnerId
        );
        history.value.unshift({
          letter: letterChar,
          partnerId: currentPartner?.id,
          partnerName: currentPartner?.name || 'Партнер',
          playerId: (currentPartner as { playerId?: number | null })?.playerId ?? null,
          status: 'used',
          note: note?.trim() || undefined,
          selectedAt: metadata.value.currentLetterSelectedAt,
          completedAt: new Date().toISOString()
        });
      }
    }
    if (clearActive && metadata.value.currentLetter === letterChar) {
      activeLetter.value = null;
      metadata.value.currentLetter = null;
      metadata.value.currentLetterSelectedAt = null;
    }
    syncWithBackend();
  };

  const pickRandom = (): LetterState | null => {
    const available = letters.value.filter(
      (l) => l.status === 'available' || l.status === 'skipped'
    );
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const resetState = () => {
    letters.value = structuredClone(defaultState);
    history.value = [];
    syncWithBackend();
  };

  const deleteBoardState = async () => {
    if (boardId === 'default') return;
    try {
      await api.deleteBoard(boardId);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Cleanup from history list
      const savedKey = 'alphadate_saved_boards';
      const savedBoards: SavedBoard[] = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const updated = savedBoards.filter((b) => b.key !== boardId);
      localStorage.setItem(savedKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete board state from backend:', e);
    }
  };

  return {
    letters,
    metadata,
    activeLetter,
    history,
    fetchError,
    isLoadingBackend,
    isSyncing,
    fetchState,
    markAsStatus,
    pickRandom,
    resetState,
    initBoardMetadata,
    deleteBoardState,
    selectLetter,
    reloadBackendState: fetchBackendState
  };
}
