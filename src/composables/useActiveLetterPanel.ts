import { ref, onUnmounted } from 'vue';
import { useCountdown } from './useCountdown';
import { ACTION_CONFIRMATION_TIMEOUT_MS } from '../constants';
import { compressImageFile } from '../utils/image';
import type { LetterState } from './useAlphabetState';

export interface ActiveLetterPanelProps {
  letter: LetterState | null;
  selectedAt?: string | null;
  boardId: string;
}

export type ActiveLetterPanelEmit = {
  (e: 'complete', note: string, photo?: string): void;
  (e: 'exclude'): void;
  (e: 'cancel'): void;
};

export function useActiveLetterPanel(props: ActiveLetterPanelProps, emit: ActiveLetterPanelEmit) {
  const countdownInfo = useCountdown(() => props.selectedAt);

  const isCompleting = ref(false);
  const completionNote = ref('');
  const attachedPhoto = ref<string | null>(null);
  const isProcessingPhoto = ref(false);
  const photoError = ref<string | null>(null);

  const confirmingAction = ref<'exclude' | 'cancel' | null>(null);
  let confirmTimeout: ReturnType<typeof setTimeout> | null = null;

  const clearConfirmTimeout = () => {
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
      confirmTimeout = null;
    }
  };

  onUnmounted(() => {
    clearConfirmTimeout();
  });

  const startCompleting = () => {
    clearConfirmTimeout();
    confirmingAction.value = null;
    completionNote.value = props.letter?.note || '';
    attachedPhoto.value = props.letter?.photo || null;
    photoError.value = null;
    isCompleting.value = true;
  };

  const cancelCompleting = () => {
    isCompleting.value = false;
    completionNote.value = '';
    attachedPhoto.value = null;
    photoError.value = null;
  };

  const handlePhotoFile = async (file: File) => {
    if (!file) return;
    isProcessingPhoto.value = true;
    photoError.value = null;
    try {
      const compressed = await compressImageFile(file);
      attachedPhoto.value = compressed;
    } catch (err: unknown) {
      photoError.value =
        err instanceof Error ? err.message : 'Не вдалося обробити фото. Спробуйте інше.';
    } finally {
      isProcessingPhoto.value = false;
    }
  };

  const removePhoto = () => {
    attachedPhoto.value = null;
    photoError.value = null;
  };

  const submitComplete = () => {
    emit('complete', completionNote.value.trim(), attachedPhoto.value || undefined);
    isCompleting.value = false;
    completionNote.value = '';
    attachedPhoto.value = null;
    photoError.value = null;
    clearConfirmTimeout();
    confirmingAction.value = null;
  };

  const handleConfirmableAction = (action: 'exclude' | 'cancel') => {
    if (confirmingAction.value === action) {
      clearConfirmTimeout();
      confirmingAction.value = null;
      if (action === 'exclude') {
        emit('exclude');
      } else if (action === 'cancel') {
        emit('cancel');
        isCompleting.value = false;
        completionNote.value = '';
        attachedPhoto.value = null;
        photoError.value = null;
      }
    } else {
      clearConfirmTimeout();
      confirmingAction.value = action;
      confirmTimeout = setTimeout(() => {
        confirmingAction.value = null;
      }, ACTION_CONFIRMATION_TIMEOUT_MS);
    }
  };

  const cancelConfirmation = () => {
    clearConfirmTimeout();
    confirmingAction.value = null;
  };

  return {
    countdownInfo,
    isCompleting,
    completionNote,
    attachedPhoto,
    isProcessingPhoto,
    photoError,
    confirmingAction,
    startCompleting,
    cancelCompleting,
    handlePhotoFile,
    removePhoto,
    submitComplete,
    handleConfirmableAction,
    cancelConfirmation
  };
}
