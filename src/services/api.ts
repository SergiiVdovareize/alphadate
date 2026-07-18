import type { LetterState, BoardMetadata } from '../composables/useAlphabetState';

const BASE_URL = import.meta.env.PROD ? 'https://api.vdovareize.me' : 'http://localhost:3000';

export interface CreateBoardResponse {
  success: boolean;
  key: string;
}

export interface BoardResponse {
  success: boolean;
  letters: LetterState[];
  metadata: BoardMetadata;
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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async getBoard(key: string): Promise<BoardResponse> {
    const response = await fetch(`${BASE_URL}/alphadate/${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async updateBoard(
    key: string,
    letters: LetterState[]
  ): Promise<{ success: boolean; currentPartnerId: number }> {
    const response = await fetch(`${BASE_URL}/alphadate/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ letters })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
};
