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
  createBoard(partners: string[], email: string): Promise<CreateBoardResponse> {
    return request<CreateBoardResponse>('/alphadate', {
      method: 'POST',
      body: JSON.stringify({ partners, email })
    });
  },

  getBoard(key: string, signal?: AbortSignal): Promise<BoardResponse> {
    return request<BoardResponse>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'GET',
      signal
    });
  },

  updateBoard(
    key: string,
    letters: LetterState[],
    currentLetter: string | null,
    signal?: AbortSignal
  ): Promise<UpdateBoardResponse> {
    return request<UpdateBoardResponse>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ letters, currentLetter }),
      signal
    });
  },

  deleteBoard(key: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/alphadate/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
  },

  async getSuggestions(
    key: string,
    letter: string,
    signal?: AbortSignal
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
    return request<DateSuggestionsResponse>(
      `/alphadate/${encodedKey}/suggestions?letter=${encodedLetter}`,
      {
        method: 'GET',
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
