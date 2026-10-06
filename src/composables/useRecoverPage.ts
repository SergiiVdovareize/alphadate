import { ref, computed, onUnmounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { EMAIL_REGEX } from '../constants';

export function useRecoverPage() {
  const router = useRouter();

  const email = ref('');
  const isLoading = ref(false);
  const isSuccess = ref(false);
  const errorMessage = ref<string | null>(null);

  const isEmailError = computed(
    () => !!errorMessage.value && errorMessage.value.includes('електронну пошту')
  );

  const isCopied = ref(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  const copyKeyword = async () => {
    const keyword = 'AlphaDate';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(keyword);
      } else if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        const textarea = document.createElement('textarea');
        textarea.value = keyword;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      isCopied.value = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (copyTimeout) clearTimeout(copyTimeout);
    });
  }

  const goHome = () => {
    router.push('/');
  };

  const handleRecover = async () => {
    const trimmed = email.value.trim();
    if (!trimmed) {
      errorMessage.value = 'Будь ласка, введіть електронну пошту.';
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      errorMessage.value = 'Будь ласка, введіть коректну електронну пошту.';
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
      const res = await api.recoverBoard(trimmed);
      if (res.success) {
        isSuccess.value = true;
      } else {
        errorMessage.value = getErrorMessage(
          res.message,
          'Не вдалося надіслати посилання. Спробуйте пізніше.'
        );
      }
    } catch (err: unknown) {
      errorMessage.value = getErrorMessage(
        err,
        'Помилка при відновленні щоденника. Перевірте з’єднання.'
      );
    } finally {
      isLoading.value = false;
    }
  };

  return {
    email,
    isLoading,
    isSuccess,
    errorMessage,
    isEmailError,
    isCopied,
    copyKeyword,
    goHome,
    handleRecover
  };
}
