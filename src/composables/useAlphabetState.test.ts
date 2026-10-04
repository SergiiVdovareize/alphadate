import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAlphabetState, initBoardLocalStorage } from './useAlphabetState';
import { api, ApiError, getStoredPin } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    api: {
      getBoard: vi.fn(),
      updateBoard: vi.fn(),
      deleteBoard: vi.fn()
    }
  };
});

describe('useAlphabetState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with default Ukrainian alphabet', () => {
    const state = useAlphabetState('default');
    expect(state.letters.value).toHaveLength(33);
    expect(state.letters.value[0].letter).toBe('А');
    expect(state.letters.value[0].status).toBe('available');
    expect(state.activeLetter.value).toBeNull();
  });

  it('selects and deselects a letter', () => {
    const state = useAlphabetState('test-board');
    const letterA = state.letters.value[0];

    state.selectLetter(letterA);
    expect(state.activeLetter.value?.letter).toBe('А');
    expect(state.metadata.value.currentLetter).toBe('А');
    expect(state.metadata.value.currentLetterSelectedAt).toBeTruthy();

    state.selectLetter(null);
    expect(state.activeLetter.value).toBeNull();
    expect(state.metadata.value.currentLetter).toBeNull();
    expect(state.metadata.value.currentLetterSelectedAt).toBeNull();
  });

  it('marks letter status and attaches completion note', () => {
    const state = useAlphabetState('test-board');
    const letterB = state.letters.value[1];

    state.selectLetter(letterB);
    state.markAsStatus('Б', 'used', 'Сходили в боулінг');

    const updatedB = state.letters.value.find((l) => l.letter === 'Б');
    expect(updatedB?.status).toBe('used');
    expect(updatedB?.note).toBe('Сходили в боулінг');
    expect(state.activeLetter.value).toBeNull();
    expect(state.metadata.value.currentLetter).toBeNull();
    expect(state.history.value).toHaveLength(1);
    expect(state.history.value[0].letter).toBe('Б');
    expect(state.history.value[0].note).toBe('Сходили в боулінг');
  });

  it('marks letter status and attaches completion note with photo', () => {
    const state = useAlphabetState('test-board');
    const letterB = state.letters.value[1];

    state.selectLetter(letterB);
    state.markAsStatus('Б', 'used', 'Сходили в боулінг', true, 'data:image/jpeg;base64,sample-photo');

    const updatedB = state.letters.value.find((l) => l.letter === 'Б');
    expect(updatedB?.status).toBe('used');
    expect(updatedB?.note).toBe('Сходили в боулінг');
    expect(updatedB?.photo).toBe('data:image/jpeg;base64,sample-photo');
    expect(state.history.value[0].photo).toBe('data:image/jpeg;base64,sample-photo');
  });

  it('marks letter status as excluded and records in history', () => {
    const state = useAlphabetState('test-board');
    const letterC = state.letters.value[2];

    state.selectLetter(letterC);
    state.markAsStatus('В', 'excluded');

    const updatedC = state.letters.value.find((l) => l.letter === 'В');
    expect(updatedC?.status).toBe('excluded');
    expect(state.activeLetter.value).toBeNull();
    expect(state.history.value).toHaveLength(1);
    expect(state.history.value[0].letter).toBe('В');
    expect(state.history.value[0].status).toBe('excluded');
  });

  it('pickRandom selects an available letter or returns null if all used', () => {
    const state = useAlphabetState('test-board');
    const random = state.pickRandom();
    expect(random).not.toBeNull();
    expect(random?.status).toBe('available');

    // Mark all letters as excluded
    state.letters.value.forEach((l) => {
      l.status = 'excluded';
    });
    expect(state.pickRandom()).toBeNull();
  });

  it('loads state from local storage if available', () => {
    const customLetters = [
      { letter: 'А', status: 'used', note: 'Done' },
      { letter: 'Б', status: 'available' }
    ];
    localStorage.setItem(
      'alphadate_state_custom-board',
      JSON.stringify({
        metadata: {
          partners: [{ id: 1, name: 'Іван' }],
          currentLetter: 'Б',
          currentLetterSelectedAt: '2026-09-01T00:00:00Z'
        },
        letters: customLetters
      })
    );

    const state = useAlphabetState('custom-board');
    expect(state.letters.value).toEqual(customLetters);
    expect(state.metadata.value.partners[0].name).toBe('Іван');
    expect(state.activeLetter.value?.letter).toBe('Б');
  });

  it('fetches remote board state and updates local state', async () => {
    vi.mocked(api.getBoard).mockResolvedValue({
      success: true,
      letters: [{ letter: 'В', status: 'available' }],
      metadata: {
        partners: [{ id: 1, name: 'Марія' }],
        pinHash: null,
        currentPartnerId: 1,
        currentLetter: 'В',
        currentLetterSelectedAt: null
      }
    });

    const state = useAlphabetState('remote-board');
    await vi.waitFor(() => expect(state.isLoadingBackend.value).toBe(false));

    expect(state.letters.value).toHaveLength(1);
    expect(state.letters.value[0].letter).toBe('В');
    expect(state.metadata.value.partners[0].name).toBe('Марія');
    expect(state.activeLetter.value?.letter).toBe('В');
  });

  it('refreshBackgroundState silently fetches updates in background without setting isLoadingBackend', async () => {
    const state = useAlphabetState('silent-board');
    await vi.waitFor(() => expect(state.isLoadingBackend.value).toBe(false));

    vi.mocked(api.getBoard).mockResolvedValueOnce({
      success: true,
      letters: [{ letter: 'Г', status: 'available' }],
      metadata: {
        partners: [{ id: 1, name: 'Світлана' }],
        pinHash: null,
        currentPartnerId: 1,
        currentLetter: null,
        currentLetterSelectedAt: null
      }
    });

    const refreshPromise = state.refreshBackgroundState();
    expect(state.isBackgroundRefreshing.value).toBe(true);
    expect(state.isLoadingBackend.value).toBe(false);

    await refreshPromise;
    expect(state.isBackgroundRefreshing.value).toBe(false);
    expect(state.isLoadingBackend.value).toBe(false);
    expect(state.letters.value[0].letter).toBe('Г');
    expect(state.metadata.value.partners[0].name).toBe('Світлана');
  });

  it('initBoardLocalStorage safely pre-initializes board storage', () => {
    initBoardLocalStorage('pre-init-board', ['Катя', 'Дмитро']);

    const raw = localStorage.getItem('alphadate_state_pre-init-board');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.letters).toHaveLength(33);
    expect(parsed.metadata.partners).toEqual([
      { id: 1, name: 'Катя' },
      { id: 2, name: 'Дмитро' }
    ]);
  });

  it('sets isPinRequired to true when backend responds with 401 PIN required', async () => {
    const error = new ApiError(401, 'Board is protected by PIN code', { isPinRequired: true });
    vi.mocked(api.getBoard).mockRejectedValue(error);

    const state = useAlphabetState('pin-protected');
    await vi.waitFor(() => expect(state.isLoadingBackend.value).toBe(false));

    expect(state.isPinRequired.value).toBe(true);
    expect(state.fetchError.value).toBeNull();
  });

  it('unlockWithPin validates PIN length, attempts unlock, and stores PIN on success', async () => {
    const state = useAlphabetState('pin-board');

    // Invalid format
    const invalidResult = await state.unlockWithPin('12');
    expect(invalidResult).toBe(false);
    expect(state.pinError.value).toBe('PIN-код повинен складатися рівно з 4 цифр.');

    // Successful unlock
    vi.mocked(api.getBoard).mockResolvedValue({
      success: true,
      letters: [{ letter: 'А', status: 'available' }],
      metadata: {
        partners: [{ id: 1, name: 'Олег' }],
        pinHash: 'hash',
        hasPin: true,
        currentPartnerId: 1,
        currentLetter: 'А',
        currentLetterSelectedAt: null
      }
    });

    const success = await state.unlockWithPin('1234');
    expect(success).toBe(true);
    expect(state.isPinRequired.value).toBe(false);
    const stored = localStorage.getItem('alphadate_pin_pin-board');
    expect(stored).not.toBeNull();
    expect(stored).not.toBe('1234');
    expect(await getStoredPin('pin-board')).toBe('1234');
  });

  it('unlockWithPin handles incorrect PIN rejection', async () => {
    const state = useAlphabetState('pin-board-fail');

    vi.mocked(api.getBoard).mockRejectedValue(new Error('Invalid PIN code'));

    const success = await state.unlockWithPin('0000');
    expect(success).toBe(false);
    expect(state.pinError.value).toBe('Невірний PIN-код. Спробуйте ще раз.');
  });

  it('unlockWithPin preserves Ukrainian error if provided', async () => {
    const state = useAlphabetState('pin-board-fail-ua');

    vi.mocked(api.getBoard).mockRejectedValue(new Error('Спробуйте через 5 хвилин'));

    const success = await state.unlockWithPin('0000');
    expect(success).toBe(false);
    expect(state.pinError.value).toBe('Спробуйте через 5 хвилин');
  });

  it('deleteBoardState deletes board and cleans up storage and PIN', async () => {
    localStorage.setItem('alphadate_pin_delete-board', '1234');
    localStorage.setItem('alphadate_state_delete-board', '{}');
    localStorage.setItem('alphadate_pin_first_seen_delete-board', '1234567890');
    localStorage.setItem('alphadate_pin_dismissed_delete-board', 'true');

    const state = useAlphabetState('delete-board');
    await state.deleteBoardState();

    expect(api.deleteBoard).toHaveBeenCalledWith('delete-board');
    expect(localStorage.getItem('alphadate_pin_delete-board')).toBeNull();
    expect(localStorage.getItem('alphadate_state_delete-board')).toBeNull();
    expect(localStorage.getItem('alphadate_pin_first_seen_delete-board')).toBeNull();
    expect(localStorage.getItem('alphadate_pin_dismissed_delete-board')).toBeNull();
  });

  it('setBoardPin validates 4-digit requirement', async () => {
    const state = useAlphabetState('pin-set-board');
    const result = await state.setBoardPin('12');
    expect(result).toBe(false);
    expect(state.pinError.value).toBe('PIN-код повинен складатися рівно з 4 цифр.');
  });

  it('setBoardPin sets PIN, updates board on backend and saves encrypted pin', async () => {
    const state = useAlphabetState('pin-set-board');
    vi.mocked(api.updateBoard).mockResolvedValue({
      success: true,
      currentPartnerId: 1
    });

    const result = await state.setBoardPin('5678');
    expect(result).toBe(true);
    expect(api.updateBoard).toHaveBeenCalledWith(
      'pin-set-board',
      expect.any(Array),
      null,
      undefined,
      undefined,
      { pin: '5678' }
    );
    expect(state.metadata.value.hasPin).toBe(true);
    expect(await getStoredPin('pin-set-board')).toBe('5678');
  });

  it('setBoardPin handles api rejection gracefully', async () => {
    const state = useAlphabetState('pin-set-board');
    vi.mocked(api.updateBoard).mockRejectedValue(new Error('Network error'));

    const result = await state.setBoardPin('5678');
    expect(result).toBe(false);
    expect(state.pinError.value).toBe('Немає зв’язку з сервером. Перевірте інтернет.');
  });

  it('initBoardLocalStorage respects hasPin parameter', () => {
    initBoardLocalStorage('test-has-pin', ['Оля', 'Ігор'], true);
    const stored = JSON.parse(localStorage.getItem('alphadate_state_test-has-pin') || '{}');
    expect(stored.metadata.hasPin).toBe(true);
  });
});
