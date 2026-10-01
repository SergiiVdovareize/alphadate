import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import Board from './Board.vue';
import { useBoardPage } from '../composables/useBoardPage';

vi.mock('../composables/useBoardPage');

function createMockBoardPage(overrides: Partial<ReturnType<typeof useBoardPage>> = {}) {
  return {
    boardId: 'test-board',
    letters: ref([{ letter: 'А', status: 'available' }]),
    metadata: ref({
      partners: [
        { id: 1, name: 'Андрій' },
        { id: 2, name: 'Олена' }
      ],
      pinHash: null,
      hasPin: true,
      currentPartnerId: 1,
      currentLetter: null,
      currentLetterSelectedAt: null
    }),
    activeLetter: ref(null),
    history: ref([]),
    fetchError: ref(null),
    isDeleteModalOpen: ref(false),
    isHistoryModalOpen: ref(false),
    isSetPinModalOpen: ref(false),
    setPinError: ref(null),
    isPinPromptVisible: computed(() => false),
    selectedHistoryLetter: ref(null),
    highlightedLetter: ref(null),
    isPickingRandom: ref(false),
    isWinner: ref(false),
    isPinRequired: ref(false),
    pinError: ref(null),
    isLoadingBackend: ref(false),
    isSyncing: ref(false),
    isBackgroundRefreshing: ref(false),
    refreshBackgroundState: vi.fn(),
    isMarkingLetter: ref(false),
    markingLetterMessage: ref(''),
    isPageLoaderVisible: computed(() => false),
    pageLoaderMessage: computed(() => 'Завантажуємо дошку... 💕'),
    pageLoaderSubmessage: computed(() => 'Синхронізуємо ваші побачення з сервером...'),
    handleUnlockPin: vi.fn(),
    handleCancelPin: vi.fn(),
    handleOpenSetPin: vi.fn(),
    handleCloseSetPin: vi.fn(),
    handleSetPin: vi.fn(),
    handlePickRandom: vi.fn(),
    openHistory: vi.fn(),
    closeHistory: vi.fn(),
    pickRandom: vi.fn(),
    handleCompleteLetter: vi.fn(),
    handleExcludeLetter: vi.fn(),
    handleCancelLetter: vi.fn(),
    handleSelectLetter: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    goHome: vi.fn(),
    ...overrides
  } as unknown as ReturnType<typeof useBoardPage>;
}

describe('Board.vue', () => {
  it('renders header, turns, active panel, alphabet grid and delete button', () => {
    const mockGoHome = vi.fn();
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({ goHome: mockGoHome }));

    const wrapper = mount(Board);

    expect(wrapper.find('.brand-title').text()).toBe('AlphaDate');
    expect(wrapper.find('.turn-container').exists()).toBe(true);
    expect(wrapper.text()).toContain('Андрій');
    expect(wrapper.text()).toContain('Олена');
    expect(wrapper.find('.alphabet-grid').exists()).toBe(true);
    expect(wrapper.find('.history-journal-link').exists()).toBe(true);
    expect(wrapper.find('.delete-board-link').text()).toBe('Видалити дошку');

    wrapper.find('.brand-wrap').trigger('click');
    expect(mockGoHome).toHaveBeenCalled();
  });

  it('renders sync error banner when fetchError is present', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      fetchError: ref('Сервер недоступний')
    }));

    const wrapper = mount(Board);

    const banner = wrapper.find('.sync-warning-banner');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Сервер недоступний');
  });

  it('calls openHistory when history button is clicked', async () => {
    const mockOpenHistory = vi.fn();
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      history: ref([
        {
          letter: 'А',
          status: 'used',
          partnerName: 'Олена',
          completedAt: '2026-09-25T10:00:00Z'
        }
      ]),
      openHistory: mockOpenHistory
    }));

    const wrapper = mount(Board);
    const historyBtn = wrapper.find('.history-journal-link');
    expect(historyBtn.exists()).toBe(true);
    expect(wrapper.find('.history-count-pill').text()).toBe('1');

    await historyBtn.trigger('click');
    expect(mockOpenHistory).toHaveBeenCalled();
  });

  it('renders PinModal when isPinRequired is true', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isPinRequired: ref(true),
      pinError: ref('Невірний PIN-код')
    }));

    const wrapper = mount(Board);
    expect(wrapper.findComponent({ name: 'PinModal' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('Доступ захищено');
    expect(wrapper.text()).toContain('Невірний PIN-код');

    // Only logo and project name should be rendered on background
    expect(wrapper.find('.brand-wrap').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AppLogo' }).exists()).toBe(true);
    expect(wrapper.find('.brand-title').text()).toBe('AlphaDate');

    // All other board elements must be hidden
    expect(wrapper.findComponent({ name: 'AlphabetGrid' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'ActiveLetterPanel' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'DateHistoryModal' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'DeleteConfirmModal' }).exists()).toBe(false);
    expect(wrapper.find('.turn-container').exists()).toBe(false);
    expect(wrapper.find('.history-trigger-section').exists()).toBe(false);
    expect(wrapper.find('.footer').exists()).toBe(false);
    expect(wrapper.find('.pin-attention-btn').exists()).toBe(false);
  });

  it('renders pin-attention-btn when isPinPromptVisible is true and triggers handleOpenSetPin on click', async () => {
    const mockOpenSetPin = vi.fn();
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isPinPromptVisible: computed(() => true),
      handleOpenSetPin: mockOpenSetPin
    }));

    const wrapper = mount(Board);
    const attentionBtn = wrapper.find('.pin-attention-btn');
    expect(attentionBtn.exists()).toBe(true);

    await attentionBtn.trigger('click');
    expect(mockOpenSetPin).toHaveBeenCalled();
  });

  it('does not render pin-attention-btn when isPinPromptVisible is false', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isPinPromptVisible: computed(() => false)
    }));

    const wrapper = mount(Board);
    expect(wrapper.find('.pin-attention-btn').exists()).toBe(false);
  });

  it('renders header-sync-indicator and hides pin-attention-btn when isBackgroundRefreshing is true', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isBackgroundRefreshing: ref(true),
      isPinPromptVisible: computed(() => true)
    }));

    const wrapper = mount(Board);
    expect(wrapper.find('.header-sync-indicator').exists()).toBe(true);
    expect(wrapper.find('.pin-attention-btn').exists()).toBe(false);
  });

  it('renders pin-attention-btn and hides header-sync-indicator when isBackgroundRefreshing is false and isPinPromptVisible is true', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isBackgroundRefreshing: ref(false),
      isPinPromptVisible: computed(() => true)
    }));

    const wrapper = mount(Board);
    expect(wrapper.find('.header-sync-indicator').exists()).toBe(false);
    expect(wrapper.find('.pin-attention-btn').exists()).toBe(true);
  });

  it('renders RomanticLoader when isPageLoaderVisible is true and passes message and submessage', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isPageLoaderVisible: computed(() => true),
      pageLoaderMessage: computed(() => 'Завантажуємо дошку... 💕'),
      pageLoaderSubmessage: computed(() => 'Синхронізуємо ваші побачення з сервером...')
    }));

    const wrapper = mount(Board);
    const loader = wrapper.findComponent({ name: 'RomanticLoader' });
    expect(loader.exists()).toBe(true);
    expect(loader.props('visible')).toBe(true);
    expect(loader.props('message')).toBe('Завантажуємо дошку... 💕');
    expect(loader.props('submessage')).toBe('Синхронізуємо ваші побачення з сервером...');
  });

  it('disables AlphabetGrid and ActiveLetterPanel when isSyncing or isPageLoaderVisible is true', () => {
    vi.mocked(useBoardPage).mockReturnValue(createMockBoardPage({
      isSyncing: ref(true),
      isPageLoaderVisible: computed(() => false)
    }));

    const wrapper = mount(Board);
    const grid = wrapper.findComponent({ name: 'AlphabetGrid' });
    expect(grid.props('disabled')).toBe(true);
    const panel = wrapper.findComponent({ name: 'ActiveLetterPanel' });
    expect(panel.props('disabled')).toBe(true);
  });
});
