import { describe, it, expect } from 'vitest';
import { getDefaultBoardSuggestions } from './defaultSuggestions';

describe('getDefaultBoardSuggestions', () => {
  it('returns default suggestions containing the requested letter', () => {
    const suggestions = getDefaultBoardSuggestions('А');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].title).toContain('«А»');
    expect(suggestions[1].title).toContain('«А»');
    expect(suggestions[0].category).toBe('romantic');
    expect(suggestions[1].category).toBe('food');
  });

  it('handles letters dynamically', () => {
    const suggestions = getDefaultBoardSuggestions('Я');
    expect(suggestions[0].title).toContain('«Я»');
    expect(suggestions[0].description).toContain('«Я»');
  });
});
