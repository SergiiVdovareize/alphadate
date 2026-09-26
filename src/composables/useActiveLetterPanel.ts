import { ref, onUnmounted } from 'vue';
import { useCountdown } from './useCountdown';
import type { LetterState } from './useAlphabetState';

export interface ActiveLetterPanelProps {
  letter: LetterState | null;
  selectedAt?: string | null;
  boardId: string;
}

export type ActiveLetterPanelEmit = {
  (e: 'complete', note: string): void;
  (e: 'exclude'): void;
  (e: 'cancel'): void;
};

export function useActiveLetterPanel(props: ActiveLetterPanelProps, emit: ActiveLetterPanelEmit) {
  const countdownInfo = useCountdown(() => props.selectedAt);

  const isCompleting = ref(false);
  const completionNote = ref('');
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
    isCompleting.value = true;
  };

  const cancelCompleting = () => {
    isCompleting.value = false;
    completionNote.value = '';
  };

  const submitComplete = () => {
    emit('complete', completionNote.value.trim());
    isCompleting.value = false;
    completionNote.value = '';
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
      }
    } else {
      clearConfirmTimeout();
      confirmingAction.value = action;
      confirmTimeout = setTimeout(() => {
        confirmingAction.value = null;
      }, 4000);
    }
  };

  return {
    countdownInfo,
    isCompleting,
    completionNote,
    confirmingAction,
    startCompleting,
    cancelCompleting,
    submitComplete,
    handleConfirmableAction
  };
}
