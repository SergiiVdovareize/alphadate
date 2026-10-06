export type LetterStatus = 'available' | 'used' | 'excluded' | 'skipped';

export interface LetterState {
  letter: string;
  status: LetterStatus;
  note?: string;
  photo?: string;
}

export interface Partner {
  id: number;
  name: string;
  playerId?: number | null;
}

export interface BoardMetadata {
  partners: Partner[];
  pinHash?: string | null;
  hasPin?: boolean;
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
  status: 'used' | 'excluded';
  note?: string;
  photo?: string;
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

export interface RecoverBoardResponse {
  success: boolean;
  message?: string;
}

export interface UpdateLetterResponse {
  success: boolean;
  letter: string;
  note?: string | null;
  photo?: string | null;
}
