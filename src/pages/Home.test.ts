import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Home from './Home.vue';
import { useHome } from '../composables/useHome';

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
      createBoard: mockCreateBoard
    });

    const wrapper = mount(Home);

    expect(wrapper.find('h1').text()).toBe('AlphaDate');
    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(4); // 2 partner inputs + 1 email input + 1 PIN input
    expect(wrapper.find('#board-pin').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Створити спільну дошку');
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
      createBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const banner = wrapper.find('.recent-suggestion');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Андрій та Іра');

    await banner.trigger('click');
    expect(mockOpenBoard).toHaveBeenCalledWith('saved-key');
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
      createBoard: vi.fn()
    });

    const wrapper = mount(Home);

    const errorBanner = wrapper.find('.form-error-banner');
    expect(errorBanner.exists()).toBe(true);
    expect(errorBanner.text()).toBe('Помилка сервера');
  });
});
