import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RandomPickButton from './RandomPickButton.vue';

describe('RandomPickButton.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits pick event when pickRandom returns a letter', async () => {
    const mockLetter = { letter: 'М', status: 'available' as const };
    const pickRandom = vi.fn().mockReturnValue(mockLetter);

    const wrapper = mount(RandomPickButton, {
      props: { pickRandom }
    });

    await wrapper.find('button').trigger('click');

    expect(pickRandom).toHaveBeenCalled();
    expect(wrapper.emitted('pick')).toBeTruthy();
    expect(wrapper.emitted('pick')![0]).toEqual([mockLetter]);
    expect(wrapper.find('.empty-notice').exists()).toBe(false);
  });

  it('displays temporary notice when pickRandom returns null', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);

    const wrapper = mount(RandomPickButton, {
      props: { pickRandom }
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('pick')).toBeFalsy();
    expect(wrapper.find('.empty-notice').exists()).toBe(true);
    expect(wrapper.find('.empty-notice').text()).toBe('Усі літери вже використано або виключено!');

    // After 3 seconds, notice disappears
    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.empty-notice').exists()).toBe(false);
  });

  it('renders disabled state and picking text when isPicking is true', async () => {
    const pickRandom = vi.fn();
    const wrapper = mount(RandomPickButton, {
      props: { pickRandom, isPicking: true }
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.picking-label').exists()).toBe(true);
    expect(wrapper.text()).toContain('Обираємо...');
    expect(wrapper.text()).toContain('🎲');

    await button.trigger('click');
    expect(pickRandom).not.toHaveBeenCalled();
  });

  it('cleans up notice timeout on unmount', async () => {
    const pickRandom = vi.fn().mockReturnValue(null);
    const wrapper = mount(RandomPickButton, {
      props: { pickRandom }
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.empty-notice').exists()).toBe(true);

    wrapper.unmount();
    vi.advanceTimersByTime(3000);
  });

  it('renders disabled state and ignores clicks when disabled is true', async () => {
    const pickRandom = vi.fn();
    const wrapper = mount(RandomPickButton, {
      props: { pickRandom, disabled: true }
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();

    await button.trigger('click');
    expect(pickRandom).not.toHaveBeenCalled();
  });
});
