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
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'менше 1 години';
  }

  if (diffDays < 1) {
    return pluralizeHours(diffHours);
  }

  if (diffDays < 7) {
    return pluralizeDays(diffDays);
  }

  const weeks = Math.floor(diffDays / 7);
  const remDays = diffDays % 7;
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

  const monthsUk = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня'
  ];

  const day = date.getDate();
  const month = monthsUk[date.getMonth()];
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
