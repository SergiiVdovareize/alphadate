import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlphabetState } from './useAlphabetState';
import { DEFAULT_BOARD_ID } from '../constants';
import type { LetterHistoryItem } from '../types';
import { getErrorMessage } from '../utils/errors';
import { buildDisplayHistory, filterLetterHistory, getPartnerEmoji } from '../utils/history';

export function useMemoriesPage(initialBoardId?: string) {
  const route = useRoute();
  const router = useRouter();
  const boardId = initialBoardId || (route?.params?.id as string) || DEFAULT_BOARD_ID;

  const {
    letters,
    metadata,
    history,
    isPinRequired,
    pinError,
    isLoadingBackend,
    unlockWithPin,
    updateCompletedLetter
  } = useAlphabetState(boardId);

  const currentSelectedLetter = computed<string | null>(() => {
    return (route?.query?.letter as string) || null;
  });

  const goBackToBoard = () => {
    router.push({ name: 'board', params: { id: boardId } });
  };

  const handleViewAll = () => {
    router.replace({
      name: 'memories',
      params: { id: boardId },
      query: {}
    });
  };

  const handleCancelPin = () => {
    router.push('/');
  };

  const handleUnlockPin = async (enteredPin: string) => {
    await unlockWithPin(enteredPin);
  };

  const expandedPhoto = ref<{ src: string; alt: string } | null>(null);

  const openPhoto = (photo: string, letter: string) => {
    expandedPhoto.value = {
      src: photo,
      alt: `Фото з побачення на літеру «${letter}»`
    };
  };

  const closePhoto = () => {
    expandedPhoto.value = null;
  };

  // Inline memory editing state
  const editingLetter = ref<string | null>(null);
  const isSavingEdit = ref(false);
  const editError = ref<string | null>(null);

  const startEditing = (item: LetterHistoryItem) => {
    editingLetter.value = item.letter;
    editError.value = null;
  };

  const cancelEditing = () => {
    if (isSavingEdit.value) return;
    editingLetter.value = null;
    editError.value = null;
  };

  const handleSaveInline = async (payload: { note: string; photo?: string | null }) => {
    if (!editingLetter.value) return;
    isSavingEdit.value = true;
    editError.value = null;

    try {
      await updateCompletedLetter(editingLetter.value, {
        note: payload.note,
        photo: payload.photo
      });
      editingLetter.value = null;
    } catch (err) {
      editError.value = getErrorMessage(err, 'Не вдалося зберегти зміни. Спробуйте ще раз.');
    } finally {
      isSavingEdit.value = false;
    }
  };

  const displayHistory = computed<LetterHistoryItem[]>(() => {
    return buildDisplayHistory(history.value, letters.value);
  });

  const letterHistoryItems = computed<LetterHistoryItem[]>(() => {
    return filterLetterHistory(displayHistory.value, currentSelectedLetter.value, letters.value);
  });

  const resolvePlayerId = (item: LetterHistoryItem): number | null | undefined => {
    if (item.playerId !== undefined) return item.playerId;
    if (metadata.value?.partners) {
      const p = metadata.value.partners.find(
        (partner) =>
          (item.partnerId && partner.id === item.partnerId) ||
          (item.partnerName && partner.name === item.partnerName)
      );
      if (p?.playerId !== undefined) return p.playerId;
    }
    return null;
  };

  return {
    boardId,
    letters,
    metadata,
    history,
    isPinRequired,
    pinError,
    isLoadingBackend,
    currentSelectedLetter,
    displayHistory,
    letterHistoryItems,
    expandedPhoto,
    editingLetter,
    isSavingEdit,
    editError,
    goBackToBoard,
    handleViewAll,
    handleCancelPin,
    handleUnlockPin,
    openPhoto,
    closePhoto,
    startEditing,
    cancelEditing,
    handleSaveInline,
    resolvePlayerId,
    getPartnerEmoji
  };
}
