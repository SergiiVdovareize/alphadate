import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Memories from './Memories.vue';
import { useAlphabetState } from '../composables/useAlphabetState';
import type { LetterHistoryItem, LetterState, BoardMetadata } from '../types';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockRouteQuery: Record<string, string> = {};
let mockRouteParams: Record<string, string> = { id: 'test-board' };

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  }),
  useRoute: () => ({
    params: mockRouteParams,
    query: mockRouteQuery
  })
}));

vi.mock('../composables/useAlphabetState');

describe('Memories.vue', () => {
  const sampleHistory: LetterHistoryItem[] = [
    {
      letter: 'К',
      partnerName: 'Андрій',
      playerId: 1, // odd -> 👨
      status: 'used',
      note: 'Каяки на заході сонця',
      selectedAt: '2026-09-20T10:00:00Z',
      completedAt: '2026-09-24T10:00:00Z'
    },
    {
      letter: 'О',
      partnerName: 'Олена',
      playerId: 2, // even -> 👩
      status: 'used',
      note: 'Опера у театрі',
      selectedAt: '2026-09-10T10:00:00Z',
      completedAt: '2026-09-12T10:00:00Z',
      photo: 'data:image/jpeg;base64,mockphoto'
    },
    {
      letter: 'Е',
      partnerName: 'Гість',
      playerId: null, // null -> 👤
      status: 'excluded',
      completedAt: '2026-09-15T12:00:00Z'
    }
  ];

  const defaultLetters: LetterState[] = [
    { letter: 'К', status: 'used', note: 'Каяки на заході сонця' },
    { letter: 'О', status: 'used', note: 'Опера у театрі' },
    { letter: 'Е', status: 'excluded' },
    { letter: 'Б', status: 'available' }
  ];

  const defaultMetadata: BoardMetadata = {
    partners: [
      { id: 1, name: 'Андрій', playerId: 1 },
      { id: 2, name: 'Олена', playerId: 2 }
    ],
    pinHash: null,
    hasPin: false,
    currentPartnerId: 1,
    currentLetter: null,
    currentLetterSelectedAt: null
  };

  const createMockAlphabetState = (overrides = {}) => {
    return {
      letters: ref(defaultLetters),
      metadata: ref(defaultMetadata),
      history: ref(sampleHistory),
      isPinRequired: ref(false),
      pinError: ref(null),
      isLoadingBackend: ref(false),
      unlockWithPin: vi.fn().mockResolvedValue(true),
      ...overrides
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteQuery = {};
    mockRouteParams = { id: 'test-board' };
    vi.mocked(useAlphabetState).mockReturnValue(createMockAlphabetState() as never);
  });

  it('renders page-title and list of history-card-item elements', () => {
    const wrapper = mount(Memories);

    expect(wrapper.find('.page-title').text()).toBe('📖 Спільні спогади');
    expect(wrapper.findAll('.history-card-item')).toHaveLength(3);
    expect(wrapper.text()).toContain('Каяки на заході сонця');
    expect(wrapper.text()).toContain('Опера у театрі');
  });

  it('renders correct partner gender emojis: odd=👨, even=👩, null=👤 in reversed order', () => {
    const wrapper = mount(Memories);
    const partnerPills = wrapper.findAll('.partner-pill');

    expect(partnerPills).toHaveLength(3);
    // 1st (reversed from sampleHistory[2]): playerId null -> 👤
    expect(partnerPills[0].find('.partner-icon').text()).toBe('👤');
    expect(partnerPills[0].text()).toContain('Гість');

    // 2nd (reversed from sampleHistory[1]): playerId 2 (even) -> 👩
    expect(partnerPills[1].find('.partner-icon').text()).toBe('👩');
    expect(partnerPills[1].text()).toContain('Олена');

    // 3rd (reversed from sampleHistory[0]): playerId 1 (odd) -> 👨
    expect(partnerPills[2].find('.partner-icon').text()).toBe('👨');
    expect(partnerPills[2].text()).toContain('Андрій');
  });

  it('displays memories in reverse chronological order (newest first)', () => {
    const wrapper = mount(Memories);
    const letterBadges = wrapper.findAll('.item-letter-badge');
    expect(letterBadges).toHaveLength(3);
    expect(letterBadges[0].text()).toContain('Е');
    expect(letterBadges[1].text()).toContain('О');
    expect(letterBadges[2].text()).toContain('К');
  });

  it('resolves partner playerId from metadata if not directly on history item', () => {
    const historyWithoutPlayerId: LetterHistoryItem[] = [
      {
        letter: 'К',
        partnerName: 'Олена',
        partnerId: 2, // matches metadata partner with playerId: 2
        status: 'used',
        completedAt: '2026-09-24T10:00:00Z'
      }
    ];

    vi.mocked(useAlphabetState).mockReturnValue(
      createMockAlphabetState({
        history: ref(historyWithoutPlayerId),
        letters: ref([])
      }) as never
    );

    const wrapper = mount(Memories);
    const partnerPill = wrapper.find('.partner-pill');
    expect(partnerPill.find('.partner-icon').text()).toBe('👩');
  });

  it('renders excluded items with cross badge and excluded pill', () => {
    const wrapper = mount(Memories);
    const cards = wrapper.findAll('.history-card-item');
    const excludedCard = cards[0]; // letter 'Е' (first item in reversed order)

    expect(excludedCard.classes()).toContain('is-excluded-item');
    expect(excludedCard.find('.item-letter-badge').classes()).toContain('is-excluded');
    expect(excludedCard.find('.excluded-pill').text()).toContain('✕ Літеру виключено з щоденнику');
    expect(excludedCard.find('.item-note').exists()).toBe(false);
  });

  it('renders photo when present in memory item', () => {
    const wrapper = mount(Memories);
    const img = wrapper.find('.item-photo-img');

    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('data:image/jpeg;base64,mockphoto');
    expect(img.attributes('alt')).toContain('літеру «О»');
  });

  it('navigates back to board when back link is clicked', async () => {
    const wrapper = mount(Memories);

    await wrapper.find('.back-link-btn').trigger('click');
    expect(mockPush).toHaveBeenCalledWith({ name: 'board', params: { id: 'test-board' } });
  });

  it('filters by letter when route.query.letter is provided and shows single-memory-view', async () => {
    mockRouteQuery = { letter: 'К' };
    const wrapper = mount(Memories);

    expect(wrapper.find('.page-title').text()).toContain('Спогад про літеру «К»');
    expect(wrapper.find('.single-memory-view').exists()).toBe(true);
    expect(wrapper.text()).toContain('Каяки на заході сонця');
    expect(wrapper.text()).not.toContain('Опера у театрі');

    // Click open full memories link
    await wrapper.find('.view-all-history-link').trigger('click');
    expect(mockReplace).toHaveBeenCalledWith({
      name: 'memories',
      params: { id: 'test-board' },
      query: {}
    });
  });

  it('renders empty letter state when filtered letter has no memories', async () => {
    mockRouteQuery = { letter: 'Я' };
    const wrapper = mount(Memories);

    expect(wrapper.find('.empty-history').exists()).toBe(true);
    expect(wrapper.text()).toContain('Спогадів для літери «Я» ще немає');
    expect(wrapper.find('.memory-letter-char').text()).toBe('Я');
  });

  it('renders general empty state when no memories exist', async () => {
    vi.mocked(useAlphabetState).mockReturnValue(
      createMockAlphabetState({
        history: ref([]),
        letters: ref([{ letter: 'А', status: 'available' }])
      }) as never
    );

    const wrapper = mount(Memories);
    expect(wrapper.find('.empty-history').exists()).toBe(true);
    expect(wrapper.text()).toContain('Поки що немає спільних спогадів');
    expect(wrapper.find('.empty-icon').text()).toBe('💌');
  });

  it('falls back to letters state for completed/excluded letters not yet in history', () => {
    vi.mocked(useAlphabetState).mockReturnValue(
      createMockAlphabetState({
        history: ref([]),
        letters: ref([{ letter: 'Ж', status: 'used', note: 'Жива музика' }])
      }) as never
    );

    const wrapper = mount(Memories);
    expect(wrapper.findAll('.history-card-item')).toHaveLength(1);
    expect(wrapper.text()).toContain('Жива музика');
  });

  it('shows PinModal when isPinRequired is true and handles unlock/cancel', async () => {
    const mockUnlock = vi.fn().mockResolvedValue(true);
    vi.mocked(useAlphabetState).mockReturnValue(
      createMockAlphabetState({
        isPinRequired: ref(true),
        unlockWithPin: mockUnlock
      }) as never
    );

    const wrapper = mount(Memories);
    const pinModal = wrapper.findComponent({ name: 'PinModal' });
    expect(pinModal.exists()).toBe(true);
    expect(pinModal.props('isOpen')).toBe(true);

    pinModal.vm.$emit('unlock', '1234');
    expect(mockUnlock).toHaveBeenCalledWith('1234');

    pinModal.vm.$emit('cancel');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('expands photo to fullscreen when clicked, and closes with close button or Escape', async () => {
    const wrapper = mount(Memories, { attachTo: document.body });

    const photoBox = wrapper.find('.item-photo-box');
    expect(photoBox.exists()).toBe(true);

    // Open lightbox
    await photoBox.trigger('click');

    const overlay = document.body.querySelector('.lightbox-overlay');
    expect(overlay).not.toBeNull();

    const img = overlay?.querySelector('.lightbox-img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('data:image/jpeg;base64,mockphoto');

    // Close with close button
    const closeBtn = overlay?.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('.lightbox-overlay')).toBeNull();

    // Re-open and close with Escape
    await photoBox.trigger('click');
    expect(document.body.querySelector('.lightbox-overlay')).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('.lightbox-overlay')).toBeNull();

    wrapper.unmount();
  });
});
