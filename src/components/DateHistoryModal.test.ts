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
    expect(wrapper.text()).toContain('Спільні спогади');
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
    expect(wrapper.text()).toContain('Поки що немає спільних спогадів');
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
    expect(viewAllBtn.text()).toContain('Відкрити спільні спогади');

    await viewAllBtn.trigger('click');

    expect(wrapper.emitted('view-all')).toBeTruthy();
    expect(wrapper.text()).toContain('Спільні спогади');
    expect(wrapper.text()).toContain('Андрій');
  });

  it('renders photo in history list and single letter memory view when present', () => {
    const historyWithPhoto: LetterHistoryItem[] = [
      {
        letter: 'Ф',
        partnerName: 'Марія',
        partnerId: 1,
        status: 'used',
        note: 'Фотосесія в парку',
        photo: 'data:image/jpeg;base64,sample-photo-data',
        selectedAt: '2026-09-20T10:00:00Z',
        completedAt: '2026-09-24T10:00:00Z'
      }
    ];

    // Single letter view
    const singleWrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: historyWithPhoto,
        selectedLetter: 'Ф'
      }
    });

    const singlePhoto = singleWrapper.find('.memory-photo-img');
    expect(singlePhoto.exists()).toBe(true);
    expect(singlePhoto.attributes('src')).toBe('data:image/jpeg;base64,sample-photo-data');

    // List view
    const listWrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: historyWithPhoto
      }
    });

    const listPhoto = listWrapper.find('.item-photo-img');
    expect(listPhoto.exists()).toBe(true);
    expect(listPhoto.attributes('src')).toBe('data:image/jpeg;base64,sample-photo-data');
  });

  it('renders excluded letters with excluded pill and notice in list view', () => {
    const historyWithExcluded: LetterHistoryItem[] = [
      {
        letter: 'Ь',
        partnerName: 'Олена',
        partnerId: 1,
        status: 'excluded',
        completedAt: '2026-09-25T12:00:00Z'
      }
    ];

    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: historyWithExcluded
      }
    });

    expect(wrapper.find('.excluded-pill').exists()).toBe(true);
    expect(wrapper.find('.excluded-pill').text()).toContain('✕ Виключено');
    expect(wrapper.find('.badge-sub-cross').exists()).toBe(true);
    expect(wrapper.text()).toContain('Літеру виключено з челенджу');
  });

  it('renders single letter memory view for excluded letter with excluded badge and status', () => {
    const historyWithExcluded: LetterHistoryItem[] = [
      {
        letter: 'Ь',
        partnerName: 'Олена',
        partnerId: 1,
        status: 'excluded',
        completedAt: '2026-09-25T12:00:00Z'
      }
    ];

    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: historyWithExcluded,
        selectedLetter: 'Ь'
      }
    });

    expect(wrapper.find('.excluded-badge').exists()).toBe(true);
    expect(wrapper.find('.excluded-badge').text()).toContain('✕ Виключено');
    expect(wrapper.text()).toContain('Дата виключення:');
    expect(wrapper.text()).toContain('Цю літеру було виключено з челенджу.');
  });

  it('synthesizes excluded letter from letters array when not yet in history array', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [],
        letters: [{ letter: 'Ї', status: 'excluded' }]
      }
    });

    expect(wrapper.find('.excluded-pill').exists()).toBe(true);
    expect(wrapper.text()).toContain('Ї');
    expect(wrapper.text()).toContain('Літеру виключено з челенджу');
  });

  it('emits close on backdrop click', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: { isOpen: true, history: sampleHistory }
    });

    const backdrop = wrapper.find('.backdrop-dismiss');
    await backdrop.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close on Escape keydown', () => {
    const wrapper = mount(DateHistoryModal, {
      props: { isOpen: true, history: sampleHistory }
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('toggles body overflow and cleans up on unmount', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: { isOpen: false, history: sampleHistory }
    });

    expect(document.body.style.overflow).toBe('');
    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ isOpen: false });
    expect(document.body.style.overflow).toBe('');

    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    wrapper.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders man emoji (👨) for odd playerId, woman emoji (👩) for even playerId, and default (👤) for null', () => {
    const genderHistory: LetterHistoryItem[] = [
      {
        letter: 'А',
        partnerName: 'Тарас',
        playerId: 1, // odd -> man
        status: 'used',
        completedAt: '2026-09-01T10:00:00Z'
      },
      {
        letter: 'Б',
        partnerName: 'Оксана',
        playerId: 2, // even -> woman
        status: 'used',
        completedAt: '2026-09-02T10:00:00Z'
      },
      {
        letter: 'В',
        partnerName: 'Гість',
        playerId: null, // null -> default 👤
        status: 'used',
        completedAt: '2026-09-03T10:00:00Z'
      }
    ];

    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: genderHistory
      }
    });

    const icons = wrapper.findAll('.partner-icon');
    expect(icons[0].text()).toBe('👨');
    expect(icons[1].text()).toBe('👩');
    expect(icons[2].text()).toBe('👤');
  });

  it('renders correct partner emoji in single letter memory view', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [
          {
            letter: 'М',
            partnerName: 'Марія',
            playerId: 4, // even -> woman
            status: 'used',
            completedAt: '2026-09-05T10:00:00Z'
          }
        ],
        selectedLetter: 'М'
      }
    });

    const icon = wrapper.find('.partner-icon');
    expect(icon.text()).toBe('👩');
  });
});
