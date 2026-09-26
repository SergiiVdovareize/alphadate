import type { LetterState, BoardMetadata } from '../composables/useAlphabetState';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://api.vdovareize.me' : 'http://localhost:3000');

export interface CreateBoardResponse {
  success: boolean;
  key: string;
}

export interface BoardResponse {
  success: boolean;
  letters: LetterState[];
  metadata: BoardMetadata;
}

export interface UpdateBoardResponse {
  success: boolean;
  currentPartnerId: number;
  currentLetterSelectedAt?: string | null;
}

export interface DateSuggestion {
  title: string;
  description: string;
  category?: 'romantic' | 'food' | 'active' | 'culture' | 'relax' | 'creative' | string;
  estimatedCost?: 'free' | 'budget' | 'moderate' | 'premium' | string;
}

export interface DateSuggestionsResponse {
  success: boolean;
  letter: string;
  lang?: string;
  suggestions: DateSuggestion[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errorMsg = errJson.message;
      }
    } catch {
      // Keep default error message
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  async createBoard(partners: string[], email: string): Promise<CreateBoardResponse> {
    const response = await fetch(`${BASE_URL}/alphadate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ partners, email })
    });

    return handleResponse<CreateBoardResponse>(response);
  },

  async getBoard(key: string, signal?: AbortSignal): Promise<BoardResponse> {
    const response = await fetch(`${BASE_URL}/alphadate/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal
    });

    return handleResponse<BoardResponse>(response);
  },

  async updateBoard(
    key: string,
    letters: LetterState[],
    currentLetter: string | null,
    signal?: AbortSignal
  ): Promise<UpdateBoardResponse> {
    const response = await fetch(`${BASE_URL}/alphadate/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ letters, currentLetter }),
      signal
    });

    return handleResponse<UpdateBoardResponse>(response);
  },

  async deleteBoard(key: string): Promise<{ success: boolean }> {
    const response = await fetch(`${BASE_URL}/alphadate/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return handleResponse<{ success: boolean }>(response);
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
        suggestions: [
          {
            title: `Побачення на літеру «${letter}»`,
            description: `Спільна прогулянка або затишний вечір, натхненний темою на літеру «${letter}».`,
            category: 'romantic',
            estimatedCost: 'budget'
          },
          {
            title: `Кулінарна або творча ідея на «${letter}»`,
            description: `Приготуйте особливу страву або відвідайте нове атмосферне місце на літеру «${letter}».`,
            category: 'food',
            estimatedCost: 'moderate'
          }
        ]
      };
    }

    const response = await fetch(
      `${BASE_URL}/alphadate/${encodeURIComponent(key)}/suggestions?letter=${encodeURIComponent(letter)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal
      }
    );

    return handleResponse<DateSuggestionsResponse>(response);
  }
};
