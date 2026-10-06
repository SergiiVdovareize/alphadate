import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Home from './Home.vue';
import { useHome } from '../composables/useHome';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

vi.mock('../composables/useHome');

describe('Home.vue', () => {
  it('renders title, inputs and button', () => {
    const mockCreateBoard = vi.fn();
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['Олег', 'Катя']),
      email: ref('test@example.com'),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([]),
      openBoard: vi.fn(),
      createBoard: mockCreateBoard,
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    expect(wrapper.find('h1').text()).toBe('AlphaDate');
    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(4); // 2 partner inputs + 1 email input + 1 PIN input
    expect(wrapper.find('#board-pin').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Створити спільний щоденник');
  });

  it('renders saved board quick continue banner when available', async () => {
    const mockOpenBoard = vi.fn();
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([
        {
          key: 'saved-key',
          partners: ['Андрій', 'Іра'],
          createdAt: new Date().toISOString()
        }
      ]),
      openBoard: mockOpenBoard,
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const banner = wrapper.find('.recent-suggestion');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Андрій та Іра');
    expect(wrapper.find('.toggle-boards-btn').exists()).toBe(false);

    await banner.trigger('click');
    expect(mockOpenBoard).toHaveBeenCalledWith('saved-key');
  });

  it('renders selector and allows selecting other boards when multiple boards exist', async () => {
    const mockOpenBoard = vi.fn();
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([
        {
          key: 'board-1',
          partners: ['Маргарита', 'Сергій'],
          createdAt: '2026-01-01'
        },
        {
          key: 'board-2',
          partners: ['Олена', 'Дмитро'],
          createdAt: '2026-01-02'
        }
      ]),
      openBoard: mockOpenBoard,
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const toggleBtn = wrapper.find('.toggle-boards-btn');
    expect(toggleBtn.exists()).toBe(true);
    expect(toggleBtn.text()).toContain('Обрати інший щоденник (1)');
    expect(wrapper.find('.saved-boards-dropdown').exists()).toBe(false);

    // Expand dropdown
    await toggleBtn.trigger('click');
    expect(wrapper.find('.saved-boards-dropdown').exists()).toBe(true);
    expect(toggleBtn.text()).toContain('Сховати список щоденників');

    // Click on the second board
    const selectButtons = wrapper.findAll('.board-select-btn');
    expect(selectButtons).toHaveLength(2);
    expect(selectButtons[1].text()).toContain('Олена та Дмитро');

    await selectButtons[1].trigger('click');
    expect(mockOpenBoard).toHaveBeenCalledWith('board-2');

    // Collapse dropdown
    await toggleBtn.trigger('click');
    expect(wrapper.find('.saved-boards-dropdown').exists()).toBe(false);
  });

  it('renders error message banner when errorMessage is set', () => {
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref('Помилка сервера'),
      savedBoards: ref([]),
      openBoard: vi.fn(),
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const errorBanner = wrapper.find('.form-error-banner');
    expect(errorBanner.exists()).toBe(true);
    expect(errorBanner.text()).toBe('Помилка сервера');
  });

  it('applies input-error class when email field has error', () => {
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref('Будь ласка, введіть коректну електронну пошту.'),
      savedBoards: ref([]),
      openBoard: vi.fn(),
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);
    expect(wrapper.find('#board-email').classes()).toContain('input-error');
  });

  it('renders recovery text button and navigates to /recover on click', async () => {
    mockPush.mockClear();
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([]),
      openBoard: vi.fn(),
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const recoverBtn = wrapper.find('.recover-text-btn');
    expect(recoverBtn.exists()).toBe(true);
    expect(recoverBtn.text()).toBe('Забули посилання на щоденник?');

    await recoverBtn.trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/recover');
  });

  it('renders "Як це працює" collapsed block when savedBoards is empty and toggles content on click', async () => {
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([]),
      openBoard: vi.fn(),
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const section = wrapper.find('.how-it-works-section');
    expect(section.exists()).toBe(true);

    const toggleBtn = wrapper.find('.how-it-works-toggle');
    expect(toggleBtn.exists()).toBe(true);
    expect(toggleBtn.text()).toContain('Як це працює?');

    // Initially collapsed
    expect(wrapper.find('.how-it-works-content').exists()).toBe(false);

    // Expand
    await toggleBtn.trigger('click');
    expect(wrapper.find('.how-it-works-content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Alphabet Dating');
    expect(wrapper.text()).toContain('Обирайте літеру по черзі');
    expect(wrapper.text()).toContain('Придумуйте ідею на обрану літеру');
    expect(wrapper.text()).toContain('Встигніть до завершення таймера');
    expect(wrapper.text()).toContain('Зберігайте спільні спогади');

    // Collapse
    await toggleBtn.trigger('click');
    expect(wrapper.find('.how-it-works-content').exists()).toBe(false);
  });

  it('does not render "Як це працює" block when savedBoards has items', () => {
    vi.mocked(useHome).mockReturnValue({
      partners: ref(['', '']),
      email: ref(''),
      pin: ref(''),
      isLoading: ref(false),
      errorMessage: ref(null),
      savedBoards: ref([
        {
          key: 'saved-key',
          partners: ['Олег', 'Катя'],
          createdAt: new Date().toISOString()
        }
      ]),
      openBoard: vi.fn(),
      createBoard: vi.fn(),
      removeSavedBoard: vi.fn()
    });

    const wrapper = mount(Home);
    expect(wrapper.find('.how-it-works-section').exists()).toBe(false);
  });
});
