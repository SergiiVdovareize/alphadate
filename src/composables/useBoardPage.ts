import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlphabetState, type LetterState } from './useAlphabetState';

export function useBoardPage() {
  const route = useRoute();
  const router = useRouter();

  const boardId = (route.params.id as string) || 'default';

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
    isLoadingBackend
  } = useAlphabetState(boardId);

  const isDeleteModalOpen = ref(false);
  const isHistoryModalOpen = ref(false);
  const isSetPinModalOpen = ref(false);
  const setPinError = ref<string | null>(null);
  const selectedHistoryLetter = ref<string | null>(null);

  const ONE_HOUR_MS = 60 * 60 * 1000;
  const FIRST_SEEN_KEY = `alphadate_pin_first_seen_${boardId}`;
  const DISMISSED_KEY = `alphadate_pin_dismissed_${boardId}`;

  const isPinPromptDismissed = ref(false);
  const isPinPromptExpired = ref(false);
  let pinPromptExpiryTimer: ReturnType<typeof setTimeout> | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem(DISMISSED_KEY) === 'true') {
      isPinPromptDismissed.value = true;
    }
  }

  const checkPinPromptExpiry = (firstSeen: number) => {
    if (pinPromptExpiryTimer) {
      clearTimeout(pinPromptExpiryTimer);
      pinPromptExpiryTimer = null;
    }
    const elapsed = Date.now() - firstSeen;
    if (elapsed >= ONE_HOUR_MS) {
      isPinPromptExpired.value = true;
    } else {
      isPinPromptExpired.value = false;
      pinPromptExpiryTimer = setTimeout(() => {
        isPinPromptExpired.value = true;
      }, ONE_HOUR_MS - elapsed);
    }
  };

  watch(
    [() => metadata.value.hasPin, () => isPinRequired.value],
    ([hasPin, pinRequired]) => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      if (hasPin || pinRequired || isPinPromptDismissed.value) return;

      const stored = localStorage.getItem(FIRST_SEEN_KEY);
      const now = Date.now();
      let firstSeen = now;
      if (!stored) {
        localStorage.setItem(FIRST_SEEN_KEY, String(now));
      } else {
        const parsed = parseInt(stored, 10);
        firstSeen = isNaN(parsed) ? now : parsed;
      }
      checkPinPromptExpiry(firstSeen);
    },
    { immediate: true }
  );

  const isPinPromptVisible = computed(() => {
    if (metadata.value.hasPin || isPinRequired.value || isPinPromptDismissed.value || isPinPromptExpired.value) {
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

  onUnmounted(() => {
    clearRoulette();
    if (pinPromptExpiryTimer) {
      clearTimeout(pinPromptExpiryTimer);
      pinPromptExpiryTimer = null;
    }
  });

  const handlePickRandom = (targetLetter: LetterState) => {
    if (activeLetter.value || isPickingRandom.value) return;

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

    // Build jump sequence across available letters (22 hops for ~4s duration)
    const hopsCount = 22;
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

    // Deceleration delay curve (ms) across 22 hops = ~3.9s
    const delays = [
      45, 45, 45, 45, 50, 50, 55, 60, 65, 75,
      85, 100, 120, 145, 175, 210, 255, 310, 375, 455,
      550, 660
    ];

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

    // Pause while the one-time winner celebration pulse plays (650ms), then activate
    accumulatedTime += 650;
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

  const handleCompleteLetter = (note: string) => {
    if (!activeLetter.value) return;
    markAsStatus(activeLetter.value.letter, 'used', note);
  };

  const handleExcludeLetter = () => {
    if (!activeLetter.value) return;
    markAsStatus(activeLetter.value.letter, 'excluded');
  };

  const handleCancelLetter = () => {
    selectLetter(null);
  };

  const handleSelectLetter = (letter: LetterState) => {
    if (activeLetter.value || isPickingRandom.value) return;
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
    goHome
  };
}
