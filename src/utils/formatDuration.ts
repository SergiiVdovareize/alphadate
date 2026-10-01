import { MS_PER_HOUR, MS_PER_DAY, DAYS_PER_WEEK, UKRAINIAN_MONTHS } from '../constants';

export function formatDurationBetween(
  selectedAt?: string | null,
  completedAt?: string | null
): string {
  if (!selectedAt || !completedAt) {
    return 'час не зафіксовано';
  }

  const start = new Date(selectedAt).getTime();
  const end = new Date(completedAt).getTime();

  if (isNaN(start) || isNaN(end) || end < start) {
    return 'час не зафіксовано';
  }

  const diffMs = Math.max(0, end - start);
  const diffHours = Math.floor(diffMs / MS_PER_HOUR);
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  if (diffHours < 1) {
    return 'менше 1 години';
  }

  if (diffDays < 1) {
    return pluralizeHours(diffHours);
  }

  if (diffDays < DAYS_PER_WEEK) {
    return pluralizeDays(diffDays);
  }

  const weeks = Math.floor(diffDays / DAYS_PER_WEEK);
  const remDays = diffDays % DAYS_PER_WEEK;
  const weeksStr = pluralizeWeeks(weeks);

  if (remDays === 0) {
    return weeksStr;
  }

  return `${weeksStr} ${pluralizeDays(remDays)}`;
}

export function formatCompletionDate(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = UKRAINIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function pluralizeHours(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} година`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} години`;
  return `${n} годин`;
}

function pluralizeDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} дні`;
  return `${n} днів`;
}

function pluralizeWeeks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} тиждень`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} тижні`;
  return `${n} тижнів`;
}
