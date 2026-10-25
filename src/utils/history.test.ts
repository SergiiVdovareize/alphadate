import { describe, it, expect } from 'vitest';
import { buildDisplayHistory, filterLetterHistory, getPartnerAvatarType } from './history';
import type { LetterHistoryItem, LetterState } from '../types';

describe('utils/history', () => {


  const sampleHistory: LetterHistoryItem[] = [
    {
      letter: 'А',
      status: 'used',
      note: 'Перше побачення',
      completedAt: '2026-09-20T10:00:00Z'
    }
  ];

  const sampleLetters: LetterState[] = [
    { letter: 'А', status: 'used', note: 'Перше побачення' },
    { letter: 'Б', status: 'used', note: 'Друге побачення' },
    { letter: 'В', status: 'excluded' },
    { letter: 'Г', status: 'available' }
  ];

  it('builds combined display history in reverse order, falling back to used/excluded letters', () => {
    const result = buildDisplayHistory(sampleHistory, sampleLetters);

    expect(result).toHaveLength(3);
    expect(result[0].letter).toBe('В');
    expect(result[1].letter).toBe('Б');
    expect(result[2].letter).toBe('А');
  });

  it('filters letter history items by selected letter', () => {
    const displayHistory = buildDisplayHistory(sampleHistory, sampleLetters);

    const filteredA = filterLetterHistory(displayHistory, 'А', sampleLetters);
    expect(filteredA).toHaveLength(1);
    expect(filteredA[0].letter).toBe('А');

    const filteredEmpty = filterLetterHistory(displayHistory, 'Г', sampleLetters);
    expect(filteredEmpty).toHaveLength(0);

    const filteredNull = filterLetterHistory(displayHistory, null, sampleLetters);
    expect(filteredNull).toHaveLength(0);
  });

  it('returns appropriate avatar types for player IDs', () => {
    expect(getPartnerAvatarType(1)).toBe('male');
    expect(getPartnerAvatarType(3)).toBe('male');
    expect(getPartnerAvatarType(2)).toBe('female');
    expect(getPartnerAvatarType(4)).toBe('female');
    expect(getPartnerAvatarType(null)).toBe('neutral');
    expect(getPartnerAvatarType(undefined)).toBe('neutral');
  });
});


