import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlphabetGrid from './AlphabetGrid.vue';
import type { LetterState } from '../types';

describe('AlphabetGrid.vue', () => {
  const letters: LetterState[] = [
    { letter: 'А', status: 'available' },
    { letter: 'Б', status: 'used' },
    { letter: 'В', status: 'excluded' }
  ];

  it('renders all letter buttons', () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].text()).toContain('А');
    expect(buttons[1].text()).toContain('Б');
    expect(buttons[2].text()).toContain('В');
  });

  it('emits select when clicking an available letter', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([letters[0]]);
  });

  it('emits view-history when clicking a used letter', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    await wrapper.findAll('button')[1].trigger('click'); // used
    expect(wrapper.emitted('view-history')).toBeTruthy();
    expect(wrapper.emitted('view-history')![0]).toEqual([letters[1]]);
    expect(wrapper.emitted('select')).toBeFalsy();
  });

  it('emits view-history when clicking an excluded letter', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    await wrapper.findAll('button')[2].trigger('click'); // excluded
    expect(wrapper.emitted('view-history')).toBeTruthy();
    expect(wrapper.emitted('view-history')![0]).toEqual([letters[2]]);
    expect(wrapper.emitted('select')).toBeFalsy();
  });

  it('does not emit select when grid is disabled', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters, disabled: true }
    });

    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select')).toBeFalsy();
  });

  it('renders check badge for used letters and cross badge for excluded letters', () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[0].find('.used-check-badge').exists()).toBe(false);
    expect(buttons[0].find('.excluded-cross-badge').exists()).toBe(false);

    expect(buttons[1].find('.used-check-badge').exists()).toBe(true);
    expect(buttons[1].find('.used-check-badge').text()).toBe('✓');
    expect(buttons[1].find('.excluded-cross-badge').exists()).toBe(false);

    expect(buttons[2].find('.excluded-cross-badge').exists()).toBe(true);
    expect(buttons[2].find('.excluded-cross-badge').text()).toBe('✕');
    expect(buttons[2].find('.used-check-badge').exists()).toBe(false);
  });

  it('provides descriptive aria-labels for assistive technologies', () => {
    const wrapper = mount(AlphabetGrid, {
      props: {
        letters,
        activeLetter: 'А'
      }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('aria-label')).toBe('Літера А, поточна активна літера');
    expect(buttons[1].attributes('aria-label')).toBe('Літера Б, побачення виконано. Переглянути спогад');
    expect(buttons[2].attributes('aria-label')).toBe('Літера В, виключено з щоденника. Переглянути спогад');
  });
});
