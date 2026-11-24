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

  it('expands drawer and renders suggestions list when clicked with AI disclaimer', async () => {
    let resolveFn: (val: {
      success: boolean;
      letter: string;
      suggestions: Array<{ title: string; description: string }>;
    }) => void;
    const promise = new Promise<{
      success: boolean;
      letter: string;
      suggestions: Array<{ title: string; description: string }>;
    }>((resolve) => {
      resolveFn = resolve;
    });
    vi.mocked(api.getSuggestions).mockReturnValue(
      promise as unknown as ReturnType<typeof api.getSuggestions>
    );

    const wrapper = mount(DateSuggestions, {
      props: {
        boardId: 'test-board',
        letter: 'Д'
      }
    });

    await wrapper.find('.suggestions-link-btn').trigger('click');
    expect(wrapper.find('.suggestions-drawer').exists()).toBe(true);
    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.ai-disclaimer-loading').text()).toContain('AI');

    resolveFn!({
      success: true,
      letter: 'Д',
      suggestions: [{ title: 'Дельфінарій', description: 'Спільний похід в дельфінарій' }]
    });

    await vi.waitFor(() => {
      expect(wrapper.find('.suggestion-title').exists()).toBe(true);
    });

    expect(wrapper.find('.suggestion-title').text()).toBe('Дельфінарій');
    expect(wrapper.find('.suggestion-desc').text()).toBe('Спільний похід в дельфінарій');
    expect(wrapper.find('.ai-disclaimer').exists()).toBe(true);
    expect(wrapper.find('.ai-disclaimer').text()).toContain('штучним інтелектом');
    expect(wrapper.find('.ai-disclaimer').text()).toContain('адаптуйте');
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
