import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMemoriesPage } from './useMemoriesPage';
import { ref } from 'vue';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockQuery: Record<string, string> = {};

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'test-board' },
    query: mockQuery
  }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}));

const mockUpdateCompletedLetter = vi.fn().mockResolvedValue(true);
const mockUnlockWithPin = vi.fn().mockResolvedValue(true);

vi.mock('./useAlphabetState', () => ({
  useAlphabetState: () => ({
    letters: ref([
      { letter: 'А', status: 'used', note: 'Кава', photo: 'photo.webp' },
      { letter: 'Б', status: 'available' }
    ]),
    metadata: ref({
      partners: [{ id: 1, name: 'Олена', playerId: 2 }]
    }),
    history: ref([
      {
        letter: 'А',
        status: 'used',
        note: 'Кава',
        photo: 'photo.webp',
        partnerId: 1,
        completedAt: '2026-09-20T10:00:00Z'
      }
    ]),
    isPinRequired: ref(false),
    pinError: ref(null),
    isLoadingBackend: ref(false),
    unlockWithPin: mockUnlockWithPin,
    updateCompletedLetter: mockUpdateCompletedLetter
  })
}));

describe('useMemoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = {};
  });

  it('initializes with default values and navigation helpers', () => {
    const page = useMemoriesPage('test-board');

    expect(page.boardId).toBe('test-board');
    expect(page.editingLetter.value).toBeNull();
    expect(page.expandedPhoto.value).toBeNull();

    page.goBackToBoard();
    expect(mockPush).toHaveBeenCalledWith({ name: 'board', params: { id: 'test-board' } });

    page.handleViewAll();
    expect(mockReplace).toHaveBeenCalledWith({
      name: 'memories',
      params: { id: 'test-board' },
      query: {}
    });

    page.handleCancelPin();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('manages photo lightbox state', () => {
    const page = useMemoriesPage('test-board');

    page.openPhoto('https://test.com/pic.jpg', 'А');
    expect(page.expandedPhoto.value).toEqual({
      src: 'https://test.com/pic.jpg',
      alt: 'Фото з побачення на літеру «А»'
    });

    page.closePhoto();
    expect(page.expandedPhoto.value).toBeNull();
  });

  it('handles inline edit lifecycle and save', async () => {
    const page = useMemoriesPage('test-board');

    page.startEditing({
      letter: 'А',
      status: 'used',
      note: 'Старий',
      completedAt: '2026-09-20T10:00:00Z'
    });
    expect(page.editingLetter.value).toBe('А');

    await page.handleSaveInline({ note: 'Новий коментар', photo: 'new.webp' });
    expect(mockUpdateCompletedLetter).toHaveBeenCalledWith('А', {
      note: 'Новий коментар',
      photo: 'new.webp'
    });
    expect(page.editingLetter.value).toBeNull();
  });

  it('resolves partner playerId and emojis correctly', () => {
    const page = useMemoriesPage('test-board');

    expect(page.getPartnerEmoji(1)).toBe('👨');
    expect(page.getPartnerEmoji(2)).toBe('👩');
    expect(page.getPartnerEmoji(null)).toBe('👤');
    expect(page.getPartnerEmoji(undefined)).toBe('👤');

    const resolved = page.resolvePlayerId({
      letter: 'А',
      status: 'used',
      partnerId: 1,
      completedAt: '2026-09-20T10:00:00Z'
    });
    expect(resolved).toBe(2);
  });
});
