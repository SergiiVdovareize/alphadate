import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useActiveLetterPanel, type ActiveLetterPanelProps } from './useActiveLetterPanel';

vi.mock('../utils/image', () => ({
  compressImageFile: vi.fn().mockImplementation(async (file: File) => {
    if (file.name === 'error.jpg') {
      throw new Error('Помилка обробки фото');
    }
    return 'data:image/jpeg;base64,compressed-photo-data';
  })
}));

describe('useActiveLetterPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles startCompleting, cancelCompleting and submitComplete without photo', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available', note: 'Existing note' },
      selectedAt: new Date().toISOString(),
      boardId: 'test-board'
    };
    const emit = vi.fn();

    const vm = useActiveLetterPanel(props, emit);

    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');
    expect(vm.attachedPhoto.value).toBeNull();

    vm.startCompleting();
    expect(vm.isCompleting.value).toBe(true);
    expect(vm.completionNote.value).toBe('Existing note');

    vm.completionNote.value = ' Updated note ';
    vm.submitComplete();

    expect(emit).toHaveBeenCalledWith('complete', 'Updated note', undefined);
    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');
    expect(vm.attachedPhoto.value).toBeNull();
  });

  it('handles photo file upload, removal, and submitting with photo', async () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'Б', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.startCompleting();

    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
    await vm.handlePhotoFile(file);

    expect(vm.attachedPhoto.value).toBe('data:image/jpeg;base64,compressed-photo-data');
    expect(vm.photoError.value).toBeNull();

    vm.completionNote.value = 'Було чудово';
    vm.submitComplete();

    expect(emit).toHaveBeenCalledWith(
      'complete',
      'Було чудово',
      'data:image/jpeg;base64,compressed-photo-data'
    );
    expect(vm.attachedPhoto.value).toBeNull();
  });

  it('handles photo compression error gracefully', async () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'Б', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.startCompleting();

    const badFile = new File(['dummy'], 'error.jpg', { type: 'image/jpeg' });
    await vm.handlePhotoFile(badFile);

    expect(vm.photoError.value).toBe('Помилка обробки фото');
    expect(vm.attachedPhoto.value).toBeNull();

    // Remove photo clears error
    vm.removePhoto();
    expect(vm.photoError.value).toBeNull();
  });

  it('cancels completion correctly and clears photo state', async () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.startCompleting();
    vm.completionNote.value = 'Draft note';
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
    await vm.handlePhotoFile(file);

    expect(vm.attachedPhoto.value).toBeTruthy();

    vm.cancelCompleting();

    expect(vm.isCompleting.value).toBe(false);
    expect(vm.completionNote.value).toBe('');
    expect(vm.attachedPhoto.value).toBeNull();
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

  it('immediately cancels confirmation when cancelConfirmation is called', () => {
    const props: ActiveLetterPanelProps = {
      letter: { letter: 'А', status: 'available' },
      selectedAt: null,
      boardId: 'test-board'
    };
    const emit = vi.fn();
    const vm = useActiveLetterPanel(props, emit);

    vm.handleConfirmableAction('cancel');
    expect(vm.confirmingAction.value).toBe('cancel');

    vm.cancelConfirmation();
    expect(vm.confirmingAction.value).toBeNull();
    expect(emit).not.toHaveBeenCalled();
  });
});
