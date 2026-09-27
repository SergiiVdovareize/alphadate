import { describe, it, expect } from 'vitest';
import { formatDurationBetween, formatCompletionDate } from './formatDuration';

describe('formatDuration', () => {
  it('handles invalid or missing inputs', () => {
    expect(formatDurationBetween(null, null)).toBe('час не зафіксовано');
    expect(formatDurationBetween('2026-09-20', undefined)).toBe('час не зафіксовано');
    expect(formatDurationBetween('invalid', 'invalid')).toBe('час не зафіксовано');
    expect(formatDurationBetween('2026-09-25', '2026-09-20')).toBe('час не зафіксовано');
  });

  it('formats hours correctly', () => {
    const start = new Date('2026-09-20T10:00:00Z').toISOString();
    const end30m = new Date('2026-09-20T10:30:00Z').toISOString();
    expect(formatDurationBetween(start, end30m)).toBe('менше 1 години');

    const end1h = new Date('2026-09-20T11:15:00Z').toISOString();
    expect(formatDurationBetween(start, end1h)).toBe('1 година');

    const end3h = new Date('2026-09-20T13:00:00Z').toISOString();
    expect(formatDurationBetween(start, end3h)).toBe('3 години');

    const end5h = new Date('2026-09-20T15:00:00Z').toISOString();
    expect(formatDurationBetween(start, end5h)).toBe('5 годин');
  });

  it('formats days and weeks correctly', () => {
    const start = new Date('2026-09-01T10:00:00Z').toISOString();

    const end1d = new Date('2026-09-02T12:00:00Z').toISOString();
    expect(formatDurationBetween(start, end1d)).toBe('1 день');

    const end3d = new Date('2026-09-04T12:00:00Z').toISOString();
    expect(formatDurationBetween(start, end3d)).toBe('3 дні');

    const end5d = new Date('2026-09-06T12:00:00Z').toISOString();
    expect(formatDurationBetween(start, end5d)).toBe('5 днів');

    const end7d = new Date('2026-09-08T10:00:00Z').toISOString();
    expect(formatDurationBetween(start, end7d)).toBe('1 тиждень');

    const end9d = new Date('2026-09-10T10:00:00Z').toISOString();
    expect(formatDurationBetween(start, end9d)).toBe('1 тиждень 2 дні');
  });

  it('formats completion date correctly', () => {
    expect(formatCompletionDate(null)).toBe('');
    expect(formatCompletionDate('invalid')).toBe('');
    expect(formatCompletionDate('2026-09-27T10:00:00Z')).toContain('2026');
    expect(formatCompletionDate('2026-09-27T10:00:00Z')).toContain('вересня');
  });
});
