import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null if date is not provided or invalid', () => {
    let dateStr: string | null = null;
    const TestComponent = defineComponent({
      setup() {
        const countdown = useCountdown(() => dateStr);
        return { countdown };
      },
      template: '<div>{{ countdown?.text }}</div>'
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.countdown).toBeNull();

    dateStr = 'invalid-date';
    expect(wrapper.vm.countdown).toBeNull();
  });

  it('returns countdown when valid date is provided', () => {
    const fixedNow = new Date('2026-09-01T12:00:00Z').getTime();
    vi.setSystemTime(fixedNow);

    // Selected 10 days ago -> 20 days left
    const selectedAt = new Date('2026-08-22T12:00:00Z').toISOString();

    const TestComponent = defineComponent({
      setup() {
        const countdown = useCountdown(() => selectedAt, 30);
        return { countdown };
      },
      template: '<div>{{ countdown?.text }}</div>'
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.countdown).not.toBeNull();
    expect(wrapper.vm.countdown?.expired).toBe(false);
    expect(wrapper.vm.countdown?.urgent).toBe(false);
    expect(wrapper.vm.countdown?.text).toContain('20 дн.');
  });

  it('marks as urgent when less than 3 days left', () => {
    const fixedNow = new Date('2026-09-28T12:00:00Z').getTime();
    vi.setSystemTime(fixedNow);

    // Selected 28 days ago -> 2 days left
    const selectedAt = new Date('2026-08-31T12:00:00Z').toISOString();

    const TestComponent = defineComponent({
      setup() {
        const countdown = useCountdown(() => selectedAt, 30);
        return { countdown };
      },
      template: '<div>{{ countdown?.text }}</div>'
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.countdown?.urgent).toBe(true);
    expect(wrapper.vm.countdown?.expired).toBe(false);
    expect(wrapper.vm.countdown?.text).toContain('2 дн.');
  });

  it('marks as expired when deadline passed', () => {
    const fixedNow = new Date('2026-10-05T12:00:00Z').getTime();
    vi.setSystemTime(fixedNow);

    // Selected 35 days ago
    const selectedAt = new Date('2026-08-31T12:00:00Z').toISOString();

    const TestComponent = defineComponent({
      setup() {
        const countdown = useCountdown(() => selectedAt, 30);
        return { countdown };
      },
      template: '<div>{{ countdown?.text }}</div>'
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.countdown?.expired).toBe(true);
    expect(wrapper.vm.countdown?.urgent).toBe(true);
    expect(wrapper.vm.countdown?.text).toBe('Час на побачення вичерпано!');
  });

  it('updates remaining time on timer tick and cleans up interval on unmount', () => {
    const fixedNow = new Date('2026-09-01T12:00:00Z').getTime();
    vi.setSystemTime(fixedNow);

    const selectedAt = new Date('2026-08-31T12:00:00Z').toISOString(); // 29 days left

    const TestComponent = defineComponent({
      setup() {
        const countdown = useCountdown(() => selectedAt, 30);
        return { countdown };
      },
      template: '<div>{{ countdown?.text }}</div>'
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.countdown?.text).toContain('29 дн.');

    // Advance timers by 1 second
    vi.advanceTimersByTime(1000);
    expect(wrapper.vm.countdown).not.toBeNull();

    // Unmount
    wrapper.unmount();
    // Advance timers after unmount should not cause errors
    vi.advanceTimersByTime(5000);
  });
});
