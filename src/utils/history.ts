import type { LetterHistoryItem, LetterState } from '../types';

export function buildDisplayHistory(
  history: LetterHistoryItem[],
  letters?: LetterState[]
): LetterHistoryItem[] {
  const items = [...history];
  const historyLetters = new Set(items.map((i) => i.letter));

  if (letters) {
    for (const l of letters) {
      if ((l.status === 'used' || l.status === 'excluded') && !historyLetters.has(l.letter)) {
        items.push({
          letter: l.letter,
          status: l.status,
          note: l.note,
          photo: l.photo,
          partnerName: 'Партнер',
          selectedAt: null,
          completedAt: ''
        });
      }
    }
  }
  return items.reverse();
}

export function filterLetterHistory(
  displayHistory: LetterHistoryItem[],
  selectedLetter?: string | null,
  letters?: LetterState[]
): LetterHistoryItem[] {
  if (!selectedLetter) return [];
  const found = displayHistory.filter((h) => h.letter === selectedLetter);
  if (found.length > 0) return found;

  const fallbackLetter = letters?.find((l) => l.letter === selectedLetter);
  if (fallbackLetter && (fallbackLetter.status === 'used' || fallbackLetter.status === 'excluded')) {
    return [
      {
        letter: fallbackLetter.letter,
        status: fallbackLetter.status,
        note: fallbackLetter.note,
        photo: fallbackLetter.photo,
        partnerName: 'Партнер',
        selectedAt: null,
        completedAt: ''
      }
    ];
  }
  return [];
}

export function getPartnerEmoji(playerId?: number | null): string {
  if (playerId === null || playerId === undefined) {
    return '👤';
  }
  return Math.abs(playerId) % 2 === 0 ? '👩' : '👨';
}
