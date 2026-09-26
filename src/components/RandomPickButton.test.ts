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
});
