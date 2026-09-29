import type {
  LetterState,
  CreateBoardResponse,
  BoardResponse,
  UpdateBoardResponse,
  DateSuggestion,
  DateSuggestionsResponse
} from '../types';
import { getDefaultBoardSuggestions } from './mocks/defaultSuggestions';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly responseBody?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://api.vdovareize.me' : 'http://localhost:3000');

import { encryptPin, decryptPin } from '../utils/crypto';

const PIN_STORAGE_PREFIX = 'alphadate_pin_';
const pinMemoryCache = new Map<string, string>();

export async function getStoredPin(boardId: string): Promise<string | null> {
  if (pinMemoryCache.has(boardId)) {
    return pinMemoryCache.get(boardId)!;
  }
  if (typeof window === 'undefined' || !window.localStorage) return null;

  const raw = localStorage.getItem(`${PIN_STORAGE_PREFIX}${boardId}`);
  if (!raw) return null;

  const decrypted = await decryptPin(raw);
  if (decrypted) {
    pinMemoryCache.set(boardId, decrypted);
    // If it was stored in plaintext, upgrade it to encrypted
    if (raw === decrypted) {
      await setStoredPin(boardId, decrypted);
    }
  }
  return decrypted;
}

export async function setStoredPin(boardId: string, pin: string): Promise<void> {
  pinMemoryCache.set(boardId, pin);
  if (typeof window === 'undefined' || !window.localStorage) return;

  const encrypted = await encryptPin(pin);
  localStorage.setItem(`${PIN_STORAGE_PREFIX}${boardId}`, encrypted);
}

export function clearStoredPin(boardId: string): void {
  pinMemoryCache.delete(boardId);
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem(`${PIN_STORAGE_PREFIX}${boardId}`);
}

async function buildHeaders(boardKey?: string, pinOverride?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const pin = pinOverride || (boardKey ? await getStoredPin(boardKey) : null);
  if (pin) {
    headers['x-board-pin'] = pin;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    let errJson: unknown = null;
    try {
      errJson = await response.json();
      if (errJson && typeof errJson === 'object' && 'message' in errJson) {
        const msg = (errJson as { message?: unknown }).message;
        if (typeof msg === 'string') {
          errorMsg = msg;
        }
      }
    } catch {
      // Keep default error message
    }
    throw new ApiError(response.status, errorMsg, errJson);
  }

  return response.json();
}

export const api = {
  createBoard(partners: string[], email: string, pin?: string): Promise<CreateBoardResponse> {
    const payload: { partners: string[]; email: string; pin?: string } = { partners, email };
    if (pin && pin.trim()) {
      payload.pin = pin.trim();
    }
    return request<CreateBoardResponse>('/alphadate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getBoard(key: string, signal?: AbortSignal, pin?: string): Promise<BoardResponse> {
    const headers = await buildHeaders(key, pin);
    return request<BoardResponse>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers,
      signal
    });
  },

  async updateBoard(
    key: string,
    letters: LetterState[],
    currentLetter: string | null,
    signal?: AbortSignal,
    pin?: string
  ): Promise<UpdateBoardResponse> {
    const headers = await buildHeaders(key, pin);
    return request<UpdateBoardResponse>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ letters, currentLetter }),
      signal
    });
  },

  async deleteBoard(key: string, pin?: string): Promise<{ success: boolean }> {
    const headers = await buildHeaders(key, pin);
    return request<{ success: boolean }>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers
    });
  },

  async getSuggestions(
    key: string,
    letter: string,
    signal?: AbortSignal,
    pin?: string
  ): Promise<DateSuggestionsResponse> {
    if (key === 'default') {
      return {
        success: true,
        letter,
        lang: 'uk',
        suggestions: getDefaultBoardSuggestions(letter)
      };
    }

    const encodedKey = encodeURIComponent(key);
    const encodedLetter = encodeURIComponent(letter);
    const headers = await buildHeaders(key, pin);
    return request<DateSuggestionsResponse>(
      `/alphadate/${encodedKey}/suggestions?letter=${encodedLetter}`,
      {
        method: 'GET',
        headers,
        signal
      }
    );
  }
};

export type {
  CreateBoardResponse,
  BoardResponse,
  UpdateBoardResponse,
  DateSuggestion,
  DateSuggestionsResponse
};
