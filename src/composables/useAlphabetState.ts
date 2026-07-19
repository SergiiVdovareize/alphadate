import { ref, watch } from 'vue';
import { api } from '../services/api';

export type LetterStatus = 'available' | 'used' | 'excluded' | 'skipped';

export const STATUS_UI_STRINGS: Record<LetterStatus, string> = {
  available: 'нова',
  used: 'використана',
  excluded: 'виключена',
  skipped: 'пропущена'
};

export interface LetterState {
  letter: string;
  status: LetterStatus;
}

export interface Partner {
  id: number;
  name: string;
}

export interface BoardMetadata {
  partners: Partner[];
  pinHash: string | null;
  currentPartnerId: number | null;
}

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

const defaultState = UKRAINIAN_ALPHABET.map(
  (letter): LetterState => ({
    letter,
    status: 'available'
  })
);

export function useAlphabetState(boardId: string) {
  const LOCAL_STORAGE_KEY = `alphadate_state_${boardId}`;
  const letters = ref<LetterState[]>([]);
  const metadata = ref<BoardMetadata>({
    partners: [],
    pinHash: null,
    currentPartnerId: null
  });

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
                currentPartnerId: 1
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
                currentPartnerId: parsed.metadata.currentPartnerId || (mappedPartners[0]?.id || null)
              };
            }
          }
        } else {
          letters.value = JSON.parse(JSON.stringify(defaultState));
        }
      } catch (e) {
        letters.value = JSON.parse(JSON.stringify(defaultState));
      }
    } else {
      letters.value = JSON.parse(JSON.stringify(defaultState));
    }
  };

  fetchState();

  // Sync state from backend asynchronously
  const fetchBackendState = async () => {
    if (boardId === 'default') return;
    try {
      const data = await api.getBoard(boardId);
      if (data && data.letters && Array.isArray(data.letters) && data.letters.length > 0) {
        letters.value = data.letters;
        if (data.metadata) {
          metadata.value = data.metadata;

          // Save board to local storage history list
          const savedKey = 'alphadate_saved_boards';
          const savedBoards = JSON.parse(localStorage.getItem(savedKey) || '[]');
          const partnerNames = data.metadata.partners ? data.metadata.partners.map((p) => p.name) : [];
          const newEntry = {
            key: boardId,
            partners: partnerNames,
            createdAt: new Date().toISOString()
          };
          const existing = savedBoards.find((b: any) => b.key === boardId);
          if (existing) {
            newEntry.createdAt = existing.createdAt;
          }
          const updated = [newEntry, ...savedBoards.filter((b: any) => b.key !== boardId)];
          localStorage.setItem(savedKey, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Failed to sync state from backend:', e);
    }
  };

  fetchBackendState();

  // Watch for changes and save to local storage
  watch(
    [letters, metadata],
    () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          metadata: metadata.value,
          letters: letters.value
        })
      );
    },
    { deep: true }
  );

  const syncWithBackend = async () => {
    if (boardId === 'default') return;
    try {
      const data = await api.updateBoard(boardId, letters.value);
      if (data && typeof data.currentPartnerId === 'number') {
        metadata.value.currentPartnerId = data.currentPartnerId;
      }
    } catch (e) {
      console.error('Failed to sync board state to backend:', e);
    }
  };

  const initBoardMetadata = (partnersArray: string[]) => {
    metadata.value.partners = partnersArray.map((name, index) => ({
      id: index + 1,
      name
    }));
    syncWithBackend();
  };

  const markAsStatus = (letterChar: string, status: LetterStatus) => {
    const item = letters.value.find((l) => l.letter === letterChar);
    if (item) {
      item.status = status;
      syncWithBackend();
    }
  };

  const pickRandom = (): LetterState | null => {
    const available = letters.value.filter((l) => l.status === 'available');
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const resetState = () => {
    letters.value = JSON.parse(JSON.stringify(defaultState));
    syncWithBackend();
  };

  const deleteBoardState = async () => {
    if (boardId === 'default') return;
    try {
      await api.deleteBoard(boardId);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Cleanup from history list
      const savedKey = 'alphadate_saved_boards';
      const savedBoards = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const updated = savedBoards.filter((b: any) => b.key !== boardId);
      localStorage.setItem(savedKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete board state from backend:', e);
    }
  };

  return {
    letters,
    metadata,
    fetchState,
    markAsStatus,
    pickRandom,
    resetState,
    initBoardMetadata,
    deleteBoardState
  };
}
