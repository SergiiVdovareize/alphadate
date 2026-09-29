import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { initBoardLocalStorage, type SavedBoard } from './useAlphabetState';
import { api, setStoredPin } from '../services/api';

export function useHome() {
  const router = useRouter();

  const partners = ref(['', '']);
  const email = ref('');
  const pin = ref('');
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const savedBoards = ref<SavedBoard[]>([]);

  onMounted(() => {
    const savedKey = 'alphadate_saved_boards';
    const list = localStorage.getItem(savedKey);
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
      errorMessage.value = "Будь ласка, введіть хоча б одне ім'я.";
      return;
    }

    const trimmedEmail = email.value.trim();
    if (!trimmedEmail) {
      errorMessage.value = 'Будь ласка, введіть електронну пошту.';
      return;
    }

    const trimmedPin = pin.value.trim();
    if (trimmedPin && !/^\d{4}$/.test(trimmedPin)) {
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
        const savedKey = 'alphadate_saved_boards';
        const existingList: SavedBoard[] = JSON.parse(localStorage.getItem(savedKey) || '[]');
        const newEntry: SavedBoard = {
          key: data.key,
          partners: validPartners,
          createdAt: new Date().toISOString()
        };
        const updated = [newEntry, ...existingList.filter((b) => b.key !== data.key)];
        localStorage.setItem(savedKey, JSON.stringify(updated));

        // Initialize the board metadata safely into localStorage without triggering out-of-context watchers
        initBoardLocalStorage(data.key, validPartners);

        router.push(`/${data.key}`);
      } else {
        errorMessage.value = 'Не вдалося створити дошку. Спробуйте ще раз.';
      }
    } catch (error: unknown) {
      console.error('Error creating board:', error);
      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'Помилка при створенні дошки. Перевірте зʼєднання з сервером.';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    partners,
    email,
    pin,
    isLoading,
    errorMessage,
    savedBoards,
    openBoard,
    createBoard
  };
}
