import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHome } from './useHome';
import { api, getStoredPin } from '../services/api';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    api: {
      createBoard: vi.fn()
    }
  };
});

describe('useHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('validates required partner names', async () => {
    const vm = useHome();
    vm.partners.value = ['', ''];
    vm.email.value = 'test@example.com';

    await vm.createBoard();
    expect(vm.errorMessage.value).toBe("Будь ласка, введіть хоча б одне ім'я.");
    expect(api.createBoard).not.toHaveBeenCalled();
  });

  it('validates required email', async () => {
    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = '';

    await vm.createBoard();
    expect(vm.errorMessage.value).toBe('Будь ласка, введіть електронну пошту.');
    expect(api.createBoard).not.toHaveBeenCalled();
  });

  it('validates 4-digit format for PIN if provided', async () => {
    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = 'couple@example.com';
    vm.pin.value = '123'; // invalid length

    await vm.createBoard();
    expect(vm.errorMessage.value).toBe('PIN-код повинен складатися рівно з 4 цифр.');
    expect(api.createBoard).not.toHaveBeenCalled();

    vm.pin.value = '12ab'; // non-digit
    await vm.createBoard();
    expect(vm.errorMessage.value).toBe('PIN-код повинен складатися рівно з 4 цифр.');
  });

  it('creates board, saves to localStorage, and navigates on success', async () => {
    vi.mocked(api.createBoard).mockResolvedValue({
      success: true,
      key: 'new-board-key'
    });

    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = 'couple@example.com';
    vm.pin.value = '1234';

    await vm.createBoard();

    expect(api.createBoard).toHaveBeenCalledWith(['Оля', 'Максим'], 'couple@example.com', '1234');
    expect(mockPush).toHaveBeenCalledWith('/new-board-key');

    const saved = JSON.parse(localStorage.getItem('alphadate_saved_boards') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].key).toBe('new-board-key');
    expect(saved[0].partners).toEqual(['Оля', 'Максим']);

    // Check stored pin is encrypted in localStorage and can be decrypted
    const rawPin = localStorage.getItem('alphadate_pin_new-board-key');
    expect(rawPin).not.toBeNull();
    expect(rawPin).not.toBe('1234');
    expect(await getStoredPin('new-board-key')).toBe('1234');
  });

  it('handles server failure during board creation', async () => {
    vi.mocked(api.createBoard).mockRejectedValue(new Error('Server unavailable'));

    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = 'couple@example.com';

    await vm.createBoard();

    expect(vm.errorMessage.value).toBe('Server unavailable');
    expect(vm.isLoading.value).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles server response with success: false', async () => {
    vi.mocked(api.createBoard).mockResolvedValue({
      success: false,
      key: ''
    });

    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = 'couple@example.com';

    await vm.createBoard();

    expect(vm.errorMessage.value).toBe('Не вдалося створити дошку. Спробуйте ще раз.');
    expect(vm.isLoading.value).toBe(false);
  });

  it('handles non-Error thrown rejection during board creation', async () => {
    vi.mocked(api.createBoard).mockRejectedValue('unknown failure');

    const vm = useHome();
    vm.partners.value = ['Оля', 'Максим'];
    vm.email.value = 'couple@example.com';

    await vm.createBoard();

    expect(vm.errorMessage.value).toBe(
      'Помилка при створенні дошки. Перевірте зʼєднання з сервером.'
    );
  });

  it('openBoard routes to the board key', () => {
    const vm = useHome();
    vm.openBoard('my-board');
    expect(mockPush).toHaveBeenCalledWith('/my-board');
  });

  it('removeSavedBoard filters out board and updates localStorage', () => {
    const vm = useHome();
    vm.savedBoards.value = [
      { key: 'board-1', partners: ['А', 'Б'], createdAt: '2026-01-01' },
      { key: 'board-2', partners: ['В', 'Г'], createdAt: '2026-01-02' }
    ];

    vm.removeSavedBoard('board-1');

    expect(vm.savedBoards.value).toHaveLength(1);
    expect(vm.savedBoards.value[0].key).toBe('board-2');
    const stored = JSON.parse(localStorage.getItem('alphadate_saved_boards') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].key).toBe('board-2');
  });
});
