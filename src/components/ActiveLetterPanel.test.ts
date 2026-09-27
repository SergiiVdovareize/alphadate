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

  it('switches to full-width confirmation and supports canceling', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    const closeBtn = wrapper.find('.close-panel-btn');
    await closeBtn.trigger('click');

    expect(wrapper.find('.confirm-expanded-btn').exists()).toBe(true);
    expect(wrapper.text()).toContain('Так, обрати іншу');
    expect(wrapper.find('.cancel-confirm-btn').exists()).toBe(true);
    expect(wrapper.text()).toContain('Скасувати');

    // Click cancel button
    await wrapper.find('.cancel-confirm-btn').trigger('click');
    expect(wrapper.find('.confirm-expanded-btn').exists()).toBe(false);
    expect(wrapper.text()).toContain('Обрати іншу');
  });

  it('submits completion note when confirmed', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    await wrapper.find('.complete-main-btn').trigger('click');
    const textarea = wrapper.find('.comment-textarea');
    await textarea.setValue('Чудова кава та прогулянка');
    await wrapper.find('.confirm-btn').trigger('click');

    expect(wrapper.emitted('complete')).toBeTruthy();
    expect(wrapper.emitted('complete')![0]).toEqual(['Чудова кава та прогулянка']);
    expect(wrapper.find('.completion-form').exists()).toBe(false);
  });

  it('cancels completion note form', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    await wrapper.find('.complete-main-btn').trigger('click');
    expect(wrapper.find('.completion-form').exists()).toBe(true);

    await wrapper.find('.completion-actions .cancel-btn').trigger('click');
    expect(wrapper.find('.completion-form').exists()).toBe(false);
  });

  it('confirms exclusion when exclude button is clicked twice', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    await wrapper.find('.action-buttons button.danger').trigger('click');
    expect(wrapper.text()).toContain('Так, виключити літеру');

    await wrapper.find('.confirm-expanded-btn').trigger('click');
    expect(wrapper.emitted('exclude')).toBeTruthy();
  });

  it('confirms cancel when "Обрати іншу" is clicked twice', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: { letter: 'К', status: 'available' },
        selectedAt: null,
        boardId: 'test-board',
        pickRandom
      }
    });

    await wrapper.find('.close-panel-btn').trigger('click');
    expect(wrapper.text()).toContain('Так, обрати іншу');

    await wrapper.find('.confirm-expanded-btn').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('passes isPicking prop to RandomPickButton when no letter is active', () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(ActiveLetterPanel, {
      props: {
        letter: null,
        selectedAt: null,
        boardId: 'test-board',
        pickRandom,
        isPicking: true
      }
    });

    const randomPickComponent = wrapper.findComponent({ name: 'RandomPickButton' });
    expect(randomPickComponent.exists()).toBe(true);
    expect(randomPickComponent.props('isPicking')).toBe(true);
  });
});
