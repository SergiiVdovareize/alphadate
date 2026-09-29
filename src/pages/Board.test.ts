import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Board from './Board.vue';
import { useBoardPage } from '../composables/useBoardPage';

vi.mock('../composables/useBoardPage');

describe('Board.vue', () => {
  it('renders header, turns, active panel, alphabet grid and delete button', () => {
    const mockGoHome = vi.fn();
    vi.mocked(useBoardPage).mockReturnValue({
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
      selectedHistoryLetter: ref(null),
      highlightedLetter: ref(null),
      isPickingRandom: ref(false),
      isWinner: ref(false),
      isPinRequired: ref(false),
      pinError: ref(null),
      isLoadingBackend: ref(false),
      handleUnlockPin: vi.fn(),
      handleCancelPin: vi.fn(),
      handlePickRandom: vi.fn(),
      openHistory: vi.fn(),
      closeHistory: vi.fn(),
      pickRandom: vi.fn(),
      handleCompleteLetter: vi.fn(),
      handleExcludeLetter: vi.fn(),
      handleCancelLetter: vi.fn(),
      handleSelectLetter: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      goHome: mockGoHome
    });

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
    vi.mocked(useBoardPage).mockReturnValue({
      boardId: 'test-board',
      letters: ref([]),
      metadata: ref({
        partners: [],
        pinHash: null,
        currentPartnerId: null,
        currentLetter: null,
        currentLetterSelectedAt: null
      }),
      activeLetter: ref(null),
      history: ref([]),
      fetchError: ref('Сервер недоступний'),
      isDeleteModalOpen: ref(false),
      isHistoryModalOpen: ref(false),
      selectedHistoryLetter: ref(null),
      highlightedLetter: ref(null),
      isPickingRandom: ref(false),
      isWinner: ref(false),
      isPinRequired: ref(false),
      pinError: ref(null),
      isLoadingBackend: ref(false),
      handleUnlockPin: vi.fn(),
      handleCancelPin: vi.fn(),
      handlePickRandom: vi.fn(),
      openHistory: vi.fn(),
      closeHistory: vi.fn(),
      pickRandom: vi.fn(),
      handleCompleteLetter: vi.fn(),
      handleExcludeLetter: vi.fn(),
      handleCancelLetter: vi.fn(),
      handleSelectLetter: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      goHome: vi.fn()
    });

    const wrapper = mount(Board);

    const banner = wrapper.find('.sync-warning-banner');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Сервер недоступний');
  });

  it('calls openHistory when history button is clicked', async () => {
    const mockOpenHistory = vi.fn();
    vi.mocked(useBoardPage).mockReturnValue({
      boardId: 'test-board',
      letters: ref([]),
      metadata: ref({
        partners: [],
        pinHash: null,
        currentPartnerId: null,
        currentLetter: null,
        currentLetterSelectedAt: null
      }),
      activeLetter: ref(null),
      history: ref([
        {
          letter: 'А',
          status: 'used',
          partnerName: 'Олена',
          completedAt: '2026-09-25T10:00:00Z'
        }
      ]),
      fetchError: ref(null),
      isDeleteModalOpen: ref(false),
      isHistoryModalOpen: ref(false),
      selectedHistoryLetter: ref(null),
      highlightedLetter: ref(null),
      isPickingRandom: ref(false),
      isWinner: ref(false),
      isPinRequired: ref(false),
      pinError: ref(null),
      isLoadingBackend: ref(false),
      handleUnlockPin: vi.fn(),
      handleCancelPin: vi.fn(),
      handlePickRandom: vi.fn(),
      openHistory: mockOpenHistory,
      closeHistory: vi.fn(),
      pickRandom: vi.fn(),
      handleCompleteLetter: vi.fn(),
      handleExcludeLetter: vi.fn(),
      handleCancelLetter: vi.fn(),
      handleSelectLetter: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      goHome: vi.fn()
    });

    const wrapper = mount(Board);
    const historyBtn = wrapper.find('.history-journal-link');
    expect(historyBtn.exists()).toBe(true);
    expect(wrapper.find('.history-count-pill').text()).toBe('1');

    await historyBtn.trigger('click');
    expect(mockOpenHistory).toHaveBeenCalled();
  });

  it('renders PinModal when isPinRequired is true', () => {
    vi.mocked(useBoardPage).mockReturnValue({
      boardId: 'test-board',
      letters: ref([]),
      metadata: ref({
        partners: [],
        pinHash: null,
        currentPartnerId: null,
        currentLetter: null,
        currentLetterSelectedAt: null
      }),
      activeLetter: ref(null),
      history: ref([]),
      fetchError: ref(null),
      isDeleteModalOpen: ref(false),
      isHistoryModalOpen: ref(false),
      selectedHistoryLetter: ref(null),
      highlightedLetter: ref(null),
      isPickingRandom: ref(false),
      isWinner: ref(false),
      isPinRequired: ref(true),
      pinError: ref('Невірний PIN-код'),
      isLoadingBackend: ref(false),
      handleUnlockPin: vi.fn(),
      handleCancelPin: vi.fn(),
      handlePickRandom: vi.fn(),
      openHistory: vi.fn(),
      closeHistory: vi.fn(),
      pickRandom: vi.fn(),
      handleCompleteLetter: vi.fn(),
      handleExcludeLetter: vi.fn(),
      handleCancelLetter: vi.fn(),
      handleSelectLetter: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      goHome: vi.fn()
    });

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
  });
});
