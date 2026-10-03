import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { initBoardLocalStorage, type SavedBoard } from './useAlphabetState';
import { api, setStoredPin } from '../services/api';
import { STORAGE_KEYS, PIN_REGEX } from '../constants';
import { getErrorMessage } from '../utils/errors';

export function useHome() {
  const router = useRouter();

  const partners = ref(['', '']);
  const email = ref('');
  const pin = ref('');
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const savedBoards = ref<SavedBoard[]>([]);

  onMounted(() => {
    const list = localStorage.getItem(STORAGE_KEYS.SAVED_BOARDS);
    if (list) {
      try {
        savedBoards.value = JSON.parse(list);
      } catch (e) {
        console.error('Failed to parse saved boards:', e);
      }
    }
  });

  const openBoard = (key: string) => {
    router.push(`/${key}`);
  };

  const createBoard = async () => {
    errorMessage.value = null;
    const validPartners = partners.value.map((p) => p.trim()).filter(Boolean);
    if (validPartners.length < 1) {
      errorMessage.value = 'Будь ласка, введіть хоча б одне ім’я.';
      return;
    }

    const trimmedEmail = email.value.trim();
    if (!trimmedEmail) {
      errorMessage.value = 'Будь ласка, введіть електронну пошту.';
      return;
    }

    const trimmedPin = pin.value.trim();
    if (trimmedPin && !PIN_REGEX.test(trimmedPin)) {
      errorMessage.value = 'PIN-код повинен складатися рівно з 4 цифр.';
      return;
    }

    isLoading.value = true;
    try {
      const data = await api.createBoard(validPartners, trimmedEmail, trimmedPin || undefined);
      if (data.success && data.key) {
        if (trimmedPin) {
          await setStoredPin(data.key, trimmedPin);
        }

        // Save board details to localStorage history list
        const existingList: SavedBoard[] = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.SAVED_BOARDS) || '[]'
        );
        const newEntry: SavedBoard = {
          key: data.key,
          partners: validPartners,
          createdAt: new Date().toISOString()
        };
        const updated = [newEntry, ...existingList.filter((b) => b.key !== data.key)];
        localStorage.setItem(STORAGE_KEYS.SAVED_BOARDS, JSON.stringify(updated));

        // Initialize the board metadata safely into localStorage without triggering out-of-context watchers
        initBoardLocalStorage(data.key, validPartners, Boolean(trimmedPin));

        router.push(`/${data.key}`);
      } else {
        errorMessage.value = 'Не вдалося створити дошку. Спробуйте ще раз.';
      }
    } catch (error: unknown) {
      console.error('Error creating board:', error);
      errorMessage.value = getErrorMessage(
        error,
        'Помилка при створенні дошки. Перевірте зʼєднання з сервером.'
      );
    } finally {
      isLoading.value = false;
    }
  };

  const removeSavedBoard = (key: string) => {
    savedBoards.value = savedBoards.value.filter((b) => b.key !== key);
    localStorage.setItem(STORAGE_KEYS.SAVED_BOARDS, JSON.stringify(savedBoards.value));
  };

  return {
    partners,
    email,
    pin,
    isLoading,
    errorMessage,
    savedBoards,
    openBoard,
    createBoard,
    removeSavedBoard
  };
}
