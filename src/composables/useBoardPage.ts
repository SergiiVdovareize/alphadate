import { ref, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlphabetState, type LetterState } from './useAlphabetState';
import {
  DEFAULT_BOARD_ID,
  getPinDismissedStorageKey,
  ROULETTE_CONFIG,
  VISIBILITY_REFRESH_COOLDOWN_MS
} from '../constants';

export function useBoardPage() {
  const route = useRoute();
  const router = useRouter();

  const boardId = (route.params.id as string) || DEFAULT_BOARD_ID;

  const {
    letters,
    metadata,
    markAsStatus,
    pickRandom,
    deleteBoardState,
    activeLetter,
    selectLetter,
    fetchError,
    history,
    isPinRequired,
    pinError,
    unlockWithPin,
    setBoardPin,
    isLoadingBackend,
    isSyncing,
    isBackgroundRefreshing,
    refreshBackgroundState
  } = useAlphabetState(boardId);

  const isMarkingLetter = ref(false);
  const markingLetterMessage = ref('');

  const isDeleteModalOpen = ref(false);
  const isHistoryModalOpen = ref(false);
  const isSetPinModalOpen = ref(false);
  const setPinError = ref<string | null>(null);
  const selectedHistoryLetter = ref<string | null>(null);

  const DISMISSED_KEY = getPinDismissedStorageKey(boardId);

  const isPinPromptDismissed = ref(false);

  if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem(DISMISSED_KEY) === 'true') {
      isPinPromptDismissed.value = true;
    }
  }

  const isPinPromptVisible = computed(() => {
    if (
      metadata.value.hasPin ||
      isPinRequired.value ||
      isPinPromptDismissed.value ||
      isBackgroundRefreshing.value
    ) {
      return false;
    }
    return true;
  });

  const highlightedLetter = ref<string | null>(null);
  const isPickingRandom = ref(false);
  const isWinner = ref(false);
  let rouletteTimers: ReturnType<typeof setTimeout>[] = [];

  const clearRoulette = () => {
    rouletteTimers.forEach((t) => clearTimeout(t));
    rouletteTimers = [];
    highlightedLetter.value = null;
    isPickingRandom.value = false;
    isWinner.value = false;
  };

  let lastRefreshedAt = 0;
  let isWindowFocused = typeof document !== 'undefined' ? document.hasFocus() : true;

  const triggerBackgroundRefreshIfNeeded = () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }
    const now = Date.now();
    if (now - lastRefreshedAt < VISIBILITY_REFRESH_COOLDOWN_MS) {
      return;
    }
    if (
      !isBackgroundRefreshing.value &&
      !isLoadingBackend.value &&
      !isSyncing.value &&
      !isMarkingLetter.value &&
      !isPickingRandom.value &&
      !isPinRequired.value &&
      boardId !== DEFAULT_BOARD_ID
    ) {
      lastRefreshedAt = now;
      refreshBackgroundState();
    }
  };

  const handleVisibilityChange = () => {
    triggerBackgroundRefreshIfNeeded();
  };

  const handleWindowBlur = () => {
    isWindowFocused = false;
  };

  const handleWindowFocus = () => {
    const wasUnfocused = !isWindowFocused;
    isWindowFocused = true;
    if (wasUnfocused) {
      triggerBackgroundRefreshIfNeeded();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focusin', handleWindowFocus);
  }

  onUnmounted(() => {
    clearRoulette();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focusin', handleWindowFocus);
    }
  });

  const handlePickRandom = (targetLetter: LetterState) => {
    if (activeLetter.value || isPickingRandom.value || isSyncing.value || isMarkingLetter.value)
      return;

    const available = letters.value.filter((l) => l.status === 'available');

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || available.length <= 1) {
      selectLetter(targetLetter);
      return;
    }

    clearRoulette();
    isPickingRandom.value = true;

    // Build jump sequence across available letters
    const hopsCount = ROULETTE_CONFIG.HOPS_COUNT;
    const hops: string[] = [];
    let lastChar = '';

    for (let i = 0; i < hopsCount - 1; i++) {
      const candidates = available.filter((l) => l.letter !== lastChar);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || available[0];
      hops.push(chosen.letter);
      lastChar = chosen.letter;
    }
    // Final hop stops on the chosen winner
    hops.push(targetLetter.letter);

    // Deceleration delay curve (ms)
    const delays = ROULETTE_CONFIG.DELAYS;

    let accumulatedTime = 0;
    hops.forEach((letterChar, idx) => {
      const delay = delays[idx] ?? 100;
      accumulatedTime += delay;
      const isFinalHop = idx === hops.length - 1;
      const timer = setTimeout(() => {
        highlightedLetter.value = letterChar;
        if (isFinalHop) {
          isWinner.value = true;
        }
      }, accumulatedTime);
      rouletteTimers.push(timer);
    });

    // Pause while the one-time winner celebration pulse plays, then activate
    accumulatedTime += ROULETTE_CONFIG.CELEBRATION_PAUSE_MS;
    const finalTimer = setTimeout(() => {
      clearRoulette();
      selectLetter(targetLetter);
    }, accumulatedTime);
    rouletteTimers.push(finalTimer);
  };

  const openHistory = (letterChar?: string) => {
    selectedHistoryLetter.value = letterChar || null;
    isHistoryModalOpen.value = true;
  };

  const closeHistory = () => {
    isHistoryModalOpen.value = false;
    selectedHistoryLetter.value = null;
  };

  const handleCompleteLetter = async (note: string) => {
    if (!activeLetter.value || isMarkingLetter.value || isSyncing.value) return;
    isMarkingLetter.value = true;
    markingLetterMessage.value = 'Зберігаємо побачення... 💕';
    try {
      await markAsStatus(activeLetter.value.letter, 'used', note);
    } finally {
      isMarkingLetter.value = false;
      markingLetterMessage.value = '';
    }
  };

  const handleExcludeLetter = async () => {
    if (!activeLetter.value || isMarkingLetter.value || isSyncing.value) return;
    isMarkingLetter.value = true;
    markingLetterMessage.value = 'Оновлюємо дошку... ✨';
    try {
      await markAsStatus(activeLetter.value.letter, 'excluded');
    } finally {
      isMarkingLetter.value = false;
      markingLetterMessage.value = '';
    }
  };

  const handleCancelLetter = () => {
    selectLetter(null);
  };

  const handleSelectLetter = (letter: LetterState) => {
    if (activeLetter.value || isPickingRandom.value || isSyncing.value || isMarkingLetter.value)
      return;
    selectLetter(letter);
  };

  const handleDeleteConfirm = async () => {
    await deleteBoardState();
    isDeleteModalOpen.value = false;
    goHome();
  };

  const handleUnlockPin = async (pin: string) => {
    await unlockWithPin(pin);
  };

  const handleCancelPin = () => {
    goHome();
  };

  const handleOpenSetPin = () => {
    setPinError.value = null;
    isSetPinModalOpen.value = true;
  };

  const handleCloseSetPin = () => {
    isSetPinModalOpen.value = false;
    setPinError.value = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
    isPinPromptDismissed.value = true;
  };

  const handleSetPin = async (newPin: string) => {
    setPinError.value = null;
    const success = await setBoardPin(newPin);
    if (success) {
      isSetPinModalOpen.value = false;
    } else {
      setPinError.value = pinError.value || 'Не вдалося встановити PIN-код.';
    }
  };

  const isPageLoaderVisible = computed(() => {
    if (isPinRequired.value) return false;
    return isMarkingLetter.value || isLoadingBackend.value;
  });

  const pageLoaderMessage = computed(() => {
    if (isMarkingLetter.value) {
      return markingLetterMessage.value || 'Зберігаємо побачення... 💕';
    }
    return 'Завантажуємо дошку... 💕';
  });

  const pageLoaderSubmessage = computed(() => {
    if (isMarkingLetter.value) {
      return 'Синхронізуємо ваші спогади з сервером...';
    }
    return 'Синхронізуємо ваші побачення з сервером...';
  });

  const goHome = () => {
    router.push('/');
  };

  return {
    boardId,
    letters,
    metadata,
    activeLetter,
    history,
    fetchError,
    isDeleteModalOpen,
    isHistoryModalOpen,
    isSetPinModalOpen,
    setPinError,
    isPinPromptVisible,
    selectedHistoryLetter,
    highlightedLetter,
    isPickingRandom,
    isWinner,
    isPinRequired,
    pinError,
    isLoadingBackend,
    isSyncing,
    isBackgroundRefreshing,
    refreshBackgroundState,
    isMarkingLetter,
    markingLetterMessage,
    isPageLoaderVisible,
    pageLoaderMessage,
    pageLoaderSubmessage,
    handleUnlockPin,
    handleCancelPin,
    handleOpenSetPin,
    handleCloseSetPin,
    handleSetPin,
    handlePickRandom,
    openHistory,
    closeHistory,
    pickRandom,
    handleCompleteLetter,
    handleExcludeLetter,
    handleCancelLetter,
    handleSelectLetter,
    handleDeleteConfirm,
    handleVisibilityChange,
    handleWindowFocus,
    handleWindowBlur,
    goHome
  };
}
