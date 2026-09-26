import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActiveLetterPanel from './ActiveLetterPanel.vue';

vi.mock('../services/api', () => ({
  api: {
    getSuggestions: vi.fn().mockResolvedValue({
      success: true,
      letter: 'А',
      suggestions: []
    })
  }
}));

describe('ActiveLetterPanel.vue', () => {
  it('renders random pick button when no active letter is selected', () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: null,
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    expect(wrapper.find('.active-letter-char').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'RandomPickButton' }).exists()).toBe(true);
  });

  it('renders active letter display and action buttons when letter is present', () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: new Date().toISOString(),
        boardId: 'test-board',
        pickRandom
      }
    });

    expect(wrapper.find('.active-letter-char').text()).toBe('К');
    expect(wrapper.text()).toContain('Виконано');
    expect(wrapper.text()).toContain('Обрати іншу');
    expect(wrapper.text()).toContain('Виключити');
  });

  it('switches to note form when "Виконано" is clicked', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    const completeBtn = wrapper.find('.complete-main-btn');
    expect(completeBtn.exists()).toBe(true);
    await completeBtn.trigger('click');

    expect(wrapper.find('.comment-textarea').exists()).toBe(true);
    expect(wrapper.find('.confirm-btn').exists()).toBe(true);
  });
});
