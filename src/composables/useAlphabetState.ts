import { ref, watch } from 'vue';

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

const UKRAINIAN_ALPHABET = [
  'А', 'Б', 'В', 'Г', 'Ґ', 'Д', 'Е', 'Є', 'Ж', 'З', 'И', 'І', 'Ї', 'Й',
  'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч',
  'Ш', 'Щ', 'Ь', 'Ю', 'Я'
];

const LOCAL_STORAGE_KEY = 'alphadate_state';

const defaultState = UKRAINIAN_ALPHABET.map((letter): LetterState => ({
  letter,
  status: 'available'
}));

export function useAlphabetState() {
  const letters = ref<LetterState[]>([]);

  // Load state from local storage or set default
  const fetchState = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 33) {
          letters.value = parsed;
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

  // Watch for changes and save to local storage
  watch(letters, (newState) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  }, { deep: true });

  const markAsStatus = (letterChar: string, status: LetterStatus) => {
    const item = letters.value.find(l => l.letter === letterChar);
    if (item) {
      item.status = status;
    }
  };

  const pickRandom = (): LetterState | null => {
    const available = letters.value.filter(l => l.status === 'available');
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const resetState = () => {
    letters.value = JSON.parse(JSON.stringify(defaultState));
  };

  return {
    letters,
    fetchState,
    markAsStatus,
    pickRandom,
    resetState
  };
}
