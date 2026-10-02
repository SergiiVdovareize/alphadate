import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useBoardPage } from './useBoardPage';
import { useAlphabetState } from './useAlphabetState';
import type { Partner } from '../types';

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
const mockUnlockWithPin = vi.fn().mockResolvedValue(true);
const mockSetBoardPin = vi.fn().mockResolvedValue(true);
const mockActiveLetter = ref<{ letter: string; status: 'available' } | null>(null);
let currentMetadata: { partners: Partner[]; hasPin?: boolean } = { partners: [] };
let currentIsPinRequired = false;
const mockIsSyncing = ref(false);
const mockIsLoadingBackend = ref(false);
const mockIsBackgroundRefreshing = ref(false);
const mockRefreshBackgroundState = vi.fn();

vi.mock('./useAlphabetState', () => ({
  useAlphabetState: vi.fn(() => ({
    letters: ref([]),
    metadata: ref(structuredClone(currentMetadata)),
    history: ref([]),
    markAsStatus: mockMarkAsStatus,
    pickRandom: mockPickRandom,
    deleteBoardState: mockDeleteBoardState,
    activeLetter: mockActiveLetter,
    selectLetter: mockSelectLetter,
    fetchError: ref(null),
    isPinRequired: ref(currentIsPinRequired),
    pinError: ref(null),
    isLoadingBackend: mockIsLoadingBackend,
    isSyncing: mockIsSyncing,
    isBackgroundRefreshing: mockIsBackgroundRefreshing,
    refreshBackgroundState: mockRefreshBackgroundState,
    unlockWithPin: mockUnlockWithPin,
    setBoardPin: mockSetBoardPin
  }))
}));

describe('useBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveLetter.value = null;
    currentMetadata = { partners: [] };
    currentIsPinRequired = false;
    mockIsSyncing.value = false;
    mockIsLoadingBackend.value = false;
    mockIsBackgroundRefreshing.value = false;
    mockRefreshBackgroundState.mockReset();
    localStorage.clear();
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

  it('handleUnlockPin delegates to unlockWithPin', async () => {
    const vm = useBoardPage();
    await vm.handleUnlockPin('1234');
    expect(mockUnlockWithPin).toHaveBeenCalledWith('1234');
  });

  it('handleCancelPin navigates home', () => {
    const vm = useBoardPage();
    vm.handleCancelPin();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('handleOpenSetPin and handleCloseSetPin toggle modal state', () => {
    const vm = useBoardPage();
    expect(vm.isSetPinModalOpen.value).toBe(false);

    vm.handleOpenSetPin();
    expect(vm.isSetPinModalOpen.value).toBe(true);

    vm.handleCloseSetPin();
    expect(vm.isSetPinModalOpen.value).toBe(false);
  });

  it('handleSetPin closes modal on success and sets error on failure', async () => {
    const vm = useBoardPage();
    vm.handleOpenSetPin();

    mockSetBoardPin.mockResolvedValueOnce(true);
    await vm.handleSetPin('4321');
    expect(mockSetBoardPin).toHaveBeenCalledWith('4321');
    expect(vm.isSetPinModalOpen.value).toBe(false);

    // Failure case
    vm.handleOpenSetPin();
    mockSetBoardPin.mockResolvedValueOnce(false);
    await vm.handleSetPin('0000');
    expect(vm.isSetPinModalOpen.value).toBe(true);
    expect(vm.setPinError.value).toBe('Не вдалося встановити PIN-код.');
  });

  describe('PIN prompt attention visibility', () => {
    it('isPinPromptVisible is true on eligible view when not dismissed', () => {
      const vm = useBoardPage();
      expect(vm.isPinPromptVisible.value).toBe(true);
    });

    it('hides pin prompt and saves dismissed flag to localStorage when modal is closed', () => {
      const vm = useBoardPage();
      expect(vm.isPinPromptVisible.value).toBe(true);

      vm.handleOpenSetPin();
      vm.handleCloseSetPin();

      expect(localStorage.getItem('alphadate_pin_dismissed_test-board-42')).toBe('true');
      expect(vm.isPinPromptVisible.value).toBe(false);
    });

    it('hides pin prompt on init if already dismissed in localStorage', () => {
      localStorage.setItem('alphadate_pin_dismissed_test-board-42', 'true');
      const vm = useBoardPage();

      expect(vm.isPinPromptVisible.value).toBe(false);
    });

    it('does not hide pin prompt by timer (stays visible over time)', () => {
      vi.useFakeTimers();
      const vm = useBoardPage();
      expect(vm.isPinPromptVisible.value).toBe(true);

      // Fast forward 5 hours
      vi.advanceTimersByTime(5 * 60 * 60 * 1000);
      expect(vm.isPinPromptVisible.value).toBe(true);

      vi.useRealTimers();
    });

    it('hides pin prompt while isBackgroundRefreshing is true', () => {
      const vm = useBoardPage();
      expect(vm.isPinPromptVisible.value).toBe(true);

      mockIsBackgroundRefreshing.value = true;
      expect(vm.isPinPromptVisible.value).toBe(false);

      mockIsBackgroundRefreshing.value = false;
      expect(vm.isPinPromptVisible.value).toBe(true);
    });

    it('keeps pin prompt hidden if board already has a PIN', () => {
      currentMetadata = { partners: [], hasPin: true };
      const vm = useBoardPage();

      expect(vm.isPinPromptVisible.value).toBe(false);
    });

    it('keeps pin prompt hidden if isPinRequired is true', () => {
      currentIsPinRequired = true;
      const vm = useBoardPage();

      expect(vm.isPinPromptVisible.value).toBe(false);
    });
  });

  describe('Page loader and sync/marking guards', () => {
    it('shows page loader with initial message when isLoadingBackend is true', () => {
      mockIsLoadingBackend.value = true;
      const vm = useBoardPage();

      expect(vm.isPageLoaderVisible.value).toBe(true);
      expect(vm.pageLoaderMessage.value).toBe('Завантажуємо дошку... 💕');
      expect(vm.pageLoaderSubmessage.value).toBe('Синхронізуємо ваші побачення з сервером...');
    });

    it('does not show page loader if isPinRequired is true even when isLoadingBackend is true', () => {
      mockIsLoadingBackend.value = true;
      currentIsPinRequired = true;
      const vm = useBoardPage();

      expect(vm.isPageLoaderVisible.value).toBe(false);
    });

    it('sets isMarkingLetter and custom message during handleCompleteLetter', async () => {
      mockActiveLetter.value = { letter: 'К', status: 'available' };
      let resolveMock: () => void;
      mockMarkAsStatus.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveMock = resolve;
          })
      );

      const vm = useBoardPage();
      const completePromise = vm.handleCompleteLetter('Класна кава');

      expect(vm.isMarkingLetter.value).toBe(true);
      expect(vm.isPageLoaderVisible.value).toBe(true);
      expect(vm.pageLoaderMessage.value).toBe('Зберігаємо побачення... 💕');
      expect(vm.pageLoaderSubmessage.value).toBe('Синхронізуємо ваші спогади з сервером...');

      resolveMock!();
      await completePromise;

      expect(vm.isMarkingLetter.value).toBe(false);
      expect(vm.isPageLoaderVisible.value).toBe(false);
      expect(mockMarkAsStatus).toHaveBeenCalledWith('К', 'used', 'Класна кава');
    });

    it('sets isMarkingLetter and custom message during handleExcludeLetter', async () => {
      mockActiveLetter.value = { letter: 'Ь', status: 'available' };
      let resolveMock: () => void;
      mockMarkAsStatus.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveMock = resolve;
          })
      );

      const vm = useBoardPage();
      const excludePromise = vm.handleExcludeLetter();

      expect(vm.isMarkingLetter.value).toBe(true);
      expect(vm.isPageLoaderVisible.value).toBe(true);
      expect(vm.pageLoaderMessage.value).toBe('Оновлюємо дошку... ✨');

      resolveMock!();
      await excludePromise;

      expect(vm.isMarkingLetter.value).toBe(false);
      expect(vm.isPageLoaderVisible.value).toBe(false);
      expect(mockMarkAsStatus).toHaveBeenCalledWith('Ь', 'excluded');
    });

    it('blocks handleSelectLetter when isSyncing is true', () => {
      mockIsSyncing.value = true;
      const vm = useBoardPage();

      vm.handleSelectLetter({ letter: 'Д', status: 'available' });
      expect(mockSelectLetter).not.toHaveBeenCalled();
    });

    it('blocks handlePickRandom when isSyncing is true', () => {
      mockIsSyncing.value = true;
      const vm = useBoardPage();

      vm.handlePickRandom({ letter: 'Д', status: 'available' });
      expect(mockSelectLetter).not.toHaveBeenCalled();
      expect(vm.isPickingRandom.value).toBe(false);
    });

    it('triggers refreshBackgroundState on visibilitychange when visible and idle', () => {
      useBoardPage();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      document.dispatchEvent(new Event('visibilitychange'));
      expect(mockRefreshBackgroundState).toHaveBeenCalled();
    });

    it('does not trigger refreshBackgroundState on visibilitychange when hidden', () => {
      useBoardPage();

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true
      });

      mockRefreshBackgroundState.mockClear();
      document.dispatchEvent(new Event('visibilitychange'));
      expect(mockRefreshBackgroundState).not.toHaveBeenCalled();
    });

    it('triggers refreshBackgroundState on window focus after blur', () => {
      useBoardPage();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      mockRefreshBackgroundState.mockClear();
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
      expect(mockRefreshBackgroundState).toHaveBeenCalled();
    });

    it('triggers refreshBackgroundState on window focusin after blur', () => {
      useBoardPage();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      mockRefreshBackgroundState.mockClear();
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focusin'));
      expect(mockRefreshBackgroundState).toHaveBeenCalled();
    });
  });
});
