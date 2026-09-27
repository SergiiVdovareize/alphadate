import { ref } from 'vue';
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
    if (activeLetter.value) return;
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
