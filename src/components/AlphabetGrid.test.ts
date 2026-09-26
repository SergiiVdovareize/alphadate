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
    expect(buttons[0].text()).toBe('А');
    expect(buttons[1].text()).toBe('Б');
    expect(buttons[2].text()).toBe('В');
  });

  it('emits select when clicking an available letter', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([letters[0]]);
  });

  it('does not emit select when clicking a used or excluded letter', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters }
    });

    await wrapper.findAll('button')[1].trigger('click'); // used
    await wrapper.findAll('button')[2].trigger('click'); // excluded
    expect(wrapper.emitted('select')).toBeFalsy();
  });

  it('does not emit select when grid is disabled', async () => {
    const wrapper = mount(AlphabetGrid, {
      props: { letters, disabled: true }
    });

    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select')).toBeFalsy();
  });
});
