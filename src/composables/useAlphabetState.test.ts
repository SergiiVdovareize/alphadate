import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAlphabetState, initBoardLocalStorage } from './useAlphabetState';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getBoard: vi.fn(),
    updateBoard: vi.fn(),
    deleteBoard: vi.fn()
  }
}));

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
});
