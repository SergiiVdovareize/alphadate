import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useActiveLetterPanel, type ActiveLetterPanelProps } from './useActiveLetterPanel';

describe('useActiveLetterPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles startCompleting, cancelCompleting and submitComplete', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available', note: 'Existing note' },
      selectedAt: new Date().toISOString(),
      boardId: 'test-board'
    };
    const emit = vi.fn();

    const vm = useActiveLetterPanel(props, emit);

    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');

    vm.startCompleting();
    expect(vm.isCompleting.value).toBe(true);
    expect(vm.completionNote.value).toBe('Existing note');

    vm.completionNote.value = ' Updated note ';
    vm.submitComplete();

    expect(emit).toHaveBeenCalledWith('complete', 'Updated note');
    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');
  });

  it('cancels completion correctly', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.startCompleting();
    vm.completionNote.value = 'Draft note';
    vm.cancelCompleting();

    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');
    expect(emit).not.toHaveBeenCalled();
  });

  it('requires two-step confirmation for exclude action', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    // Step 1: Click once
    vm.handleConfirmableAction('exclude');
    expect(vm.confirmingAction.value).toBe('exclude');
    expect(emit).not.toHaveBeenCalled();

    // Step 2: Click again to confirm
    vm.handleConfirmableAction('exclude');
    expect(emit).toHaveBeenCalledWith('exclude');
    expect(vm.confirmingAction.value).toBeNull();
  });

  it('auto-resets confirmation if user does not confirm within 4 seconds', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.handleConfirmableAction('cancel');
    expect(vm.confirmingAction.value).toBe('cancel');

    // Advance 4 seconds
    vi.advanceTimersByTime(4000);
    expect(vm.confirmingAction.value).toBeNull();
    expect(emit).not.toHaveBeenCalled();
  });
});
