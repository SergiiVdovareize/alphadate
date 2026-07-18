import { ref, watch } from 'vue';
import { api } from '../services/api';

export type LetterStatus = 'available' | 'used' | 'excluded' | 'skipped';

export const STATUS_UI_STRINGS: Record<LetterStatus, string> = {
  available: 'доступна',
  used: 'використана',
  excluded: 'виключена',
  skipped: 'пропущена'
};

export interface LetterState {
  letter: string;
  status: LetterStatus;
}

export interface BoardMetadata {
  partners: string[];
  pinHash: string | null;
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
    pinHash: null
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
                partners: [parsed.metadata.partner1, parsed.metadata.partner2].filter(Boolean),
                pinHash: parsed.metadata.pinHash || null
              };
            } else {
              metadata.value = parsed.metadata;
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
      await api.updateBoard(boardId, letters.value, metadata.value);
    } catch (e) {
      console.error('Failed to sync board state to backend:', e);
    }
  };

  const initBoardMetadata = (partnersArray: string[]) => {
    metadata.value.partners = partnersArray;
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

  return {
    letters,
    metadata,
    fetchState,
    markAsStatus,
    pickRandom,
    resetState,
    initBoardMetadata
  };
}
