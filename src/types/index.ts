export type LetterStatus = 'available' | 'used' | 'excluded' | 'skipped';

export const STATUS_UI_STRINGS: Record<LetterStatus, string> = {
  available: 'нова',
  used: 'використана',
  excluded: 'виключена',
  skipped: 'пропущена'
};

export interface LetterState {
  letter: string;
  status: LetterStatus;
  note?: string;
}

export interface Partner {
  id: number;
  name: string;
}

export interface BoardMetadata {
  partners: Partner[];
  pinHash: string | null;
  currentPartnerId: number | null;
  currentLetter: string | null;
  currentLetterSelectedAt: string | null;
}

export interface SavedBoard {
  key: string;
  partners: string[];
  createdAt: string;
}

export interface CreateBoardResponse {
  success: boolean;
  key: string;
}

export interface LetterHistoryItem {
  letter: string;
  partnerId?: number;
  partnerName?: string;
  playerId?: number | null;
  status: 'used';
  note?: string;
  selectedAt?: string | null;
  completedAt: string;
}

export interface BoardResponse {
  success: boolean;
  letters: LetterState[];
  metadata: BoardMetadata;
  history?: LetterHistoryItem[];
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
