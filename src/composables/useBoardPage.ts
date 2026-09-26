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
    fetchError
  } = useAlphabetState(boardId);

  const isDeleteModalOpen = ref(false);

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
    fetchError,
    isDeleteModalOpen,
    pickRandom,
    handleCompleteLetter,
    handleExcludeLetter,
    handleCancelLetter,
    handleSelectLetter,
    handleDeleteConfirm,
    goHome
  };
}
