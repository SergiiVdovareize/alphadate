import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, getStoredPin, setStoredPin, clearStoredPin } from './api';

describe('ApiError', () => {
  it('instantiates with status, message, and responseBody', () => {
    const error = new ApiError(404, 'Board not found', { code: 'NOT_FOUND' });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Board not found');
    expect(error.responseBody).toEqual({ code: 'NOT_FOUND' });
  });
});

describe('api service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    localStorage.clear();
  });

  it('manages PIN storage helpers with encryption', async () => {
    expect(await getStoredPin('board-1')).toBeNull();
    await setStoredPin('board-1', '1234');
    expect(await getStoredPin('board-1')).toBe('1234');

    // Confirm that the value stored in localStorage is encrypted and not plaintext
    const rawStored = localStorage.getItem('alphadate_pin_board-1');
    expect(rawStored).not.toBe('1234');
    expect(rawStored).toContain('"iv"');
    expect(rawStored).toContain('"data"');

    clearStoredPin('board-1');
    expect(await getStoredPin('board-1')).toBeNull();
  });

  it('createBoard makes a POST request with optional PIN and returns data', async () => {
    const mockData = { success: true, key: 'abc-123' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    const result = await api.createBoard(['Саша', 'Юля'], 'test@example.com', '1234');
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partners: ['Саша', 'Юля'], email: 'test@example.com', pin: '1234' })
      })
    );
  });

  it('getBoard makes a GET request with encoded key', async () => {
    const mockBoard = {
      success: true,
      letters: [],
      metadata: {
        partners: [],
        pinHash: null,
        currentPartnerId: null,
        currentLetter: null,
        currentLetterSelectedAt: null
      }
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBoard
    } as Response);

    const result = await api.getBoard('key/with spaces');
    expect(result).toEqual(mockBoard);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/key%2Fwith%20spaces'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('includes x-board-pin header when pin is passed or stored in localStorage', async () => {
    const mockBoard = { success: true, letters: [], metadata: { partners: [] } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBoard
    } as Response);

    // Explicit pin argument
    await api.getBoard('protected-board', undefined, '5678');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/protected-board'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-board-pin': '5678' })
      })
    );

    // Stored pin fallback
    await setStoredPin('stored-board', '9999');
    await api.getBoard('stored-board');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/stored-board'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-board-pin': '9999' })
      })
    );
  });

  it('updateBoard makes a PUT request with letters and currentLetter', async () => {
    const mockResponse = { success: true, currentPartnerId: 1 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await api.updateBoard('board-1', [{ letter: 'А', status: 'used' }], 'Б');
    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/board-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          letters: [{ letter: 'А', status: 'used' }],
          currentLetter: 'Б'
        })
      })
    );
  });

  it('deleteBoard makes a DELETE request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);

    const result = await api.deleteBoard('board-1');
    expect(result).toEqual({ success: true });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/board-1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('getSuggestions returns local mock data for "default" board without network request', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const result = await api.getSuggestions('default', 'В');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.letter).toBe('В');
    expect(result.suggestions).toHaveLength(2);
  });

  it('getSuggestions makes network request for non-default board', async () => {
    const mockSuggestions = {
      success: true,
      letter: 'Г',
      suggestions: [{ title: 'Гори', description: 'Похід в гори' }]
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSuggestions
    } as Response);

    const result = await api.getSuggestions('board-custom', 'Г');
    expect(result).toEqual(mockSuggestions);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alphadate/board-custom/suggestions?letter=%D0%93'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('throws ApiError with server message when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid board data' })
    } as Response);

    await expect(api.getBoard('invalid')).rejects.toThrow('Invalid board data');
  });

  it('throws ApiError with status fallback when json parsing fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('JSON parse error');
      }
    } as unknown as Response);

    await expect(api.getBoard('error')).rejects.toThrow('API error: 500');
  });
});
