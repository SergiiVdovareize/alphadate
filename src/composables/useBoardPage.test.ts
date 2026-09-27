import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useBoardPage } from './useBoardPage';
import { useAlphabetState } from './useAlphabetState';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'test-board-42' }
  }),
  useRouter: () => ({
    push: mockPush
  })
}));

const mockMarkAsStatus = vi.fn();
const mockPickRandom = vi.fn();
const mockDeleteBoardState = vi.fn().mockResolvedValue(undefined);
const mockSelectLetter = vi.fn();
const mockActiveLetter = ref<{ letter: string; status: 'available' } | null>(null);

vi.mock('./useAlphabetState', () => ({
  useAlphabetState: vi.fn(() => ({
    letters: ref([]),
    metadata: ref({ partners: [] }),
    history: ref([]),
    markAsStatus: mockMarkAsStatus,
    pickRandom: mockPickRandom,
    deleteBoardState: mockDeleteBoardState,
    activeLetter: mockActiveLetter,
    selectLetter: mockSelectLetter,
    fetchError: ref(null)
  }))
}));

describe('useBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveLetter.value = null;
  });

  it('initializes with route boardId and delegates to useAlphabetState', () => {
    const vm = useBoardPage();
    expect(vm.boardId).toBe('test-board-42');
    expect(useAlphabetState).toHaveBeenCalledWith('test-board-42');
  });

  it('completes active letter with note', () => {
    mockActiveLetter.value = { letter: 'К', status: 'available' };
    const vm = useBoardPage();

    vm.handleCompleteLetter('Класна кава');
    expect(mockMarkAsStatus).toHaveBeenCalledWith('К', 'used', 'Класна кава');
  });

  it('excludes active letter', () => {
    mockActiveLetter.value = { letter: 'Ь', status: 'available' };
    const vm = useBoardPage();

    vm.handleExcludeLetter();
    expect(mockMarkAsStatus).toHaveBeenCalledWith('Ь', 'excluded');
  });

  it('cancels active letter', () => {
    const vm = useBoardPage();
    vm.handleCancelLetter();
    expect(mockSelectLetter).toHaveBeenCalledWith(null);
  });

  it('selects letter if no letter is currently active', () => {
    mockActiveLetter.value = null;
    const vm = useBoardPage();

    vm.handleSelectLetter({ letter: 'Д', status: 'available' });
    expect(mockSelectLetter).toHaveBeenCalledWith({ letter: 'Д', status: 'available' });
  });

  it('does not select letter if another letter is already active', () => {
    mockActiveLetter.value = { letter: 'А', status: 'available' };
    const vm = useBoardPage();

    vm.handleSelectLetter({ letter: 'Б', status: 'available' });
    expect(mockSelectLetter).not.toHaveBeenCalled();
  });

  it('deletes board and redirects home on handleDeleteConfirm', async () => {
    const vm = useBoardPage();
    vm.isDeleteModalOpen.value = true;

    await vm.handleDeleteConfirm();

    expect(mockDeleteBoardState).toHaveBeenCalled();
    expect(vm.isDeleteModalOpen.value).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('manages history modal state and selected letter', () => {
    const vm = useBoardPage();
    expect(vm.isHistoryModalOpen.value).toBe(false);
    expect(vm.selectedHistoryLetter.value).toBeNull();

    vm.openHistory('Л');
    expect(vm.isHistoryModalOpen.value).toBe(true);
    expect(vm.selectedHistoryLetter.value).toBe('Л');

    vm.closeHistory();
    expect(vm.isHistoryModalOpen.value).toBe(false);
    expect(vm.selectedHistoryLetter.value).toBeNull();

    vm.openHistory();
    expect(vm.isHistoryModalOpen.value).toBe(true);
    expect(vm.selectedHistoryLetter.value).toBeNull();
  });

  it('runs roulette animation across available letters when handlePickRandom is called', () => {
    vi.useFakeTimers();
    const vm = useBoardPage();
    vm.letters.value = [
      { letter: 'А', status: 'available' },
      { letter: 'Б', status: 'available' },
      { letter: 'В', status: 'available' }
    ];

    vm.handlePickRandom({ letter: 'В', status: 'available' });

    expect(vm.isPickingRandom.value).toBe(true);
    expect(mockSelectLetter).not.toHaveBeenCalled();

    // Advance halfway through roulette
    vi.advanceTimersByTime(300);
    expect(vm.isPickingRandom.value).toBe(true);
    expect(vm.highlightedLetter.value).toBeTruthy();

    // Advance to final hop
    vi.advanceTimersByTime(3800);
    expect(vm.isWinner.value).toBe(true);
    expect(vm.highlightedLetter.value).toBe('В');

    // Advance to end of roulette
    vi.runAllTimers();
    expect(vm.isPickingRandom.value).toBe(false);
    expect(vm.isWinner.value).toBe(false);
    expect(vm.highlightedLetter.value).toBeNull();
    expect(mockSelectLetter).toHaveBeenCalledWith({ letter: 'В', status: 'available' });

    vi.useRealTimers();
  });

  it('selects immediately when only 1 available letter exists', () => {
    const vm = useBoardPage();
    vm.letters.value = [{ letter: 'Я', status: 'available' }];

    vm.handlePickRandom({ letter: 'Я', status: 'available' });

    expect(vm.isPickingRandom.value).toBe(false);
    expect(mockSelectLetter).toHaveBeenCalledWith({ letter: 'Я', status: 'available' });
  });
});
