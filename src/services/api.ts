const BASE_URL = import.meta.env.PROD ? 'https://api.vdovareize.me' : 'http://localhost:3000';

export interface CreateBoardResponse {
  success: boolean;
  key: string;
}

export const api = {
  async createBoard(partners: string[]): Promise<CreateBoardResponse> {
    const response = await fetch(`${BASE_URL}/alphadate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ partners })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
};
