import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DateHistoryModal from './DateHistoryModal.vue';
import type { LetterHistoryItem, LetterState } from '../types';

describe('DateHistoryModal.vue', () => {
  const sampleHistory: LetterHistoryItem[] = [
    {
      letter: 'А',
      status: 'used',
      partnerName: 'Сергій',
      playerId: 1,
      selectedAt: '2026-09-20T10:00:00Z',
      completedAt: '2026-09-20T14:30:00Z',
      note: 'Чудове побачення в кав’ярні',
      photo: 'data:image/jpeg;base64,sample-photo'
    },
    {
      letter: 'Б',
      status: 'used',
      partnerName: 'Олена',
      playerId: 2,
      selectedAt: '2026-09-21T11:00:00Z',
      completedAt: '2026-09-21T13:00:00Z',
      note: 'Вечірня прогулянка'
    }
  ];

  const sampleLetters: LetterState[] = [
    { letter: 'А', status: 'used', note: 'Чудове побачення в кав’ярні', photo: 'data:image/jpeg;base64,sample-photo' },
    { letter: 'Б', status: 'used', note: 'Вечірня прогулянка' },
    { letter: 'В', status: 'excluded' },
    { letter: 'Г', status: 'available' }
  ];

  it('does not render when isOpen is false', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: false,
        history: sampleHistory,
        selectedLetter: 'А'
      }
    });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });

  it('renders single letter details when selectedLetter is provided', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        letters: sampleLetters,
        selectedLetter: 'А'
      }
    });

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toContain('Спогад про літеру «А»');
    expect(wrapper.find('.memory-letter-char').text()).toBe('А');
    expect(wrapper.text()).toContain('Сергій');
    expect(wrapper.text()).toContain('👨');
    expect(wrapper.text()).toContain('Враження від побачення:');
    expect(wrapper.text()).toContain('Чудове побачення в кав’ярні');
    expect(wrapper.find('.duration-badge').exists()).toBe(true);
    expect(wrapper.find('.memory-photo-box').exists()).toBe(true);
  });

  it('renders female partner emoji for even playerId and neutral for null', () => {
    const wrapperEven = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'Б'
      }
    });
    expect(wrapperEven.text()).toContain('👩');

    const wrapperNull = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [
          {
            letter: 'Д',
            status: 'used',
            partnerName: 'Гість',
            playerId: null,
            completedAt: '2026-09-22T10:00:00Z'
          }
        ],
        selectedLetter: 'Д'
      }
    });
    expect(wrapperNull.text()).toContain('👤');
  });

  it('renders excluded badge and hides note box and duration for excluded letter', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [],
        letters: sampleLetters,
        selectedLetter: 'В'
      }
    });

    expect(wrapper.find('.excluded-badge').exists()).toBe(true);
    expect(wrapper.find('.excluded-badge').text()).toBe('✕ Літеру виключено з щоденнику');
    expect(wrapper.find('.memory-note-box').exists()).toBe(false);
    expect(wrapper.find('.duration-badge').exists()).toBe(false);
  });

  it('renders fallback for used letter from letters array when not in history prop', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [],
        letters: sampleLetters,
        selectedLetter: 'А'
      }
    });

    expect(wrapper.find('.memory-letter-char').text()).toBe('А');
    expect(wrapper.text()).toContain('Чудове побачення в кав’ярні');
  });

  it('renders empty message when selectedLetter has no memory and status is available', () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: [],
        letters: sampleLetters,
        selectedLetter: 'Г'
      }
    });

    expect(wrapper.find('.empty-history').exists()).toBe(true);
    expect(wrapper.find('.empty-title').text()).toContain('Спогадів для літери «Г» ще немає');
  });

  it('emits close when close button or backdrop dismiss is clicked', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'А'
      }
    });

    await wrapper.find('.close-icon-btn').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.find('.backdrop-dismiss').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(2);
  });

  it('emits view-all when "Відкрити всі спільні спогади" button is clicked', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'А'
      }
    });

    await wrapper.find('.view-all-history-link').trigger('click');
    expect(wrapper.emitted('view-all')).toHaveLength(1);
  });

  it('opens and closes fullscreen lightbox on photo click', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'А'
      },
      attachTo: document.body
    });

    const photoBtn = wrapper.find('.memory-photo-box');
    expect(photoBtn.exists()).toBe(true);

    await photoBtn.trigger('click');
    const lightbox = document.body.querySelector('.lightbox-overlay');
    expect(lightbox).toBeTruthy();

    const closeBtn = document.body.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    closeBtn.click();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.lightbox-overlay')).toBeNull();

    wrapper.unmount();
  });

  it('handles Escape key to close photo or modal', async () => {
    const wrapper = mount(DateHistoryModal, {
      props: {
        isOpen: true,
        history: sampleHistory,
        selectedLetter: 'А'
      },
      attachTo: document.body
    });

    // With photo open, Escape closes photo
    await wrapper.find('.memory-photo-box').trigger('click');
    expect(document.body.querySelector('.lightbox-overlay')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.lightbox-overlay')).toBeNull();
    expect(wrapper.emitted('close')).toBeFalsy();

    // Without photo open, Escape emits close
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);

    wrapper.unmount();
  });
});
