import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DateSuggestions from './DateSuggestions.vue';
import { clearSuggestionsCache } from '../composables/useDateSuggestions';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getSuggestions: vi.fn()
  }
}));

describe('DateSuggestions.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSuggestionsCache();
  });

  it('renders toggle button with letter and initially closed drawer', () => {
    const wrapper = mount(DateSuggestions, {
      props: {
        boardId: 'test-board',
        letter: 'Д'
      }
    });

    expect(wrapper.text()).toContain('Ідеї для побачення на літеру «Д»');
    expect(wrapper.find('.suggestions-drawer').exists()).toBe(false);
  });

  it('expands drawer and renders suggestions list when clicked', async () => {
    vi.mocked(api.getSuggestions).mockResolvedValue({
      success: true,
      letter: 'Д',
      suggestions: [{ title: 'Дельфінарій', description: 'Спільний похід в дельфінарій' }]
    });

    const wrapper = mount(DateSuggestions, {
      props: {
        boardId: 'test-board',
        letter: 'Д'
      }
    });

    await wrapper.find('.suggestions-link-btn').trigger('click');
    expect(wrapper.find('.suggestions-drawer').exists()).toBe(true);

    await vi.waitFor(() => {
      expect(wrapper.find('.suggestion-title').exists()).toBe(true);
    });

    expect(wrapper.find('.suggestion-title').text()).toBe('Дельфінарій');
    expect(wrapper.find('.suggestion-desc').text()).toBe('Спільний похід в дельфінарій');
  });

  it('renders error message and retry button on fetch failure', async () => {
    vi.mocked(api.getSuggestions).mockRejectedValue(new Error('Помилка сервера'));

    const wrapper = mount(DateSuggestions, {
      props: {
        boardId: 'test-board',
        letter: 'Д'
      }
    });

    await wrapper.find('.suggestions-link-btn').trigger('click');

    await vi.waitFor(() => {
      expect(wrapper.find('.error-state').exists()).toBe(true);
    });

    expect(wrapper.find('.error-text').text()).toBe('Помилка сервера');
    expect(wrapper.find('.retry-btn').exists()).toBe(true);
  });
});
