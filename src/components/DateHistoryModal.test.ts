import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DateHistoryModal from './DateHistoryModal.vue';
import type { LetterHistoryItem } from '../types';

describe('DateHistoryModal.vue', () => {
  const sampleHistory: LetterHistoryItem[] = [
    {
      letter: 'К',
      partnerName: 'Олена',
      partnerId: 1,
      status: 'used',
      note: 'Каяки на заході сонця',
      selectedAt: '2026-09-20T10:00:00Z',
      completedAt: '2026-09-24T10:00:00Z'
    },
    {
      letter: 'Б',
      partnerName: 'Андрій',
      partnerId: 2,
      status: 'used',
      selectedAt: '2026-09-10T10:00:00Z',
      completedAt: '2026-09-12T10:00:00Z'
    }
  ];

  it('does not render when isOpen is false', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: false,
        history: sampleHistory
      }
    });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });

  it('renders history list when open without selectedLetter', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory
      }
    });

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Щоденник побачень');
    expect(wrapper.text()).toContain('Олена');
    expect(wrapper.text()).toContain('Андрій');
    expect(wrapper.text()).toContain('Каяки на заході сонця');
    expect(wrapper.text()).toContain('Без коментаря');
  });

  it('renders empty history state when history array is empty', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: []
      }
    });

    expect(wrapper.find('.empty-history').exists()).toBe(true);
    expect(wrapper.text()).toContain('Поки що немає виконаних побачень');
  });

  it('renders single letter memory view when selectedLetter is passed and does NOT show other letters', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'К'
      }
    });

    expect(wrapper.find('.single-memory-view').exists()).toBe(true);
    expect(wrapper.text()).toContain('Спогад про літеру «К»');
    expect(wrapper.text()).toContain('Олена');
    expect(wrapper.text()).toContain('Каяки на заході сонця');
    // Guarantees only this letter is shown and others are filtered out
    expect(wrapper.text()).not.toContain('Андрій');
  });

  it('falls back to letter state note if letter not yet in history array', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [],
        letters: [{ letter: 'Д', status: 'used', note: 'Дельфінарій' }],
        selectedLetter: 'Д'
      }
    });

    expect(wrapper.find('.single-memory-view').exists()).toBe(true);
    expect(wrapper.text()).toContain('Спогад про літеру «Д»');
    expect(wrapper.text()).toContain('Дельфінарій');
  });

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory
      }
    });

    const closeBtn = wrapper.find('.close-icon-btn');
    await closeBtn.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits view-all event and switches to all history when link is clicked', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'К'
      }
    });

    const viewAllBtn = wrapper.find('.view-all-history-link');
    expect(viewAllBtn.exists()).toBe(true);
    expect(viewAllBtn.text()).toContain('Відкрити щоденник побачень');

    await viewAllBtn.trigger('click');

    expect(wrapper.emitted('view-all')).toBeTruthy();
    expect(wrapper.text()).toContain('Щоденник побачень');
    expect(wrapper.text()).toContain('Андрій');
  });
});
