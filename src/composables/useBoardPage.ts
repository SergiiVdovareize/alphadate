import { ref, onUnmounted } from 'vue';
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
    history
  } = useAlphabetState(boardId);

  const isDeleteModalOpen = ref(false);
  const isHistoryModalOpen = ref(false);
  const selectedHistoryLetter = ref<string | null>(null);

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
    selectedHistoryLetter,
    highlightedLetter,
    isPickingRandom,
    isWinner,
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
