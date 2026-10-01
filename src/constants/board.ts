import { MS_PER_SECOND } from './time';

export const DEFAULT_BOARD_ID = 'default';

export const UKRAINIAN_ALPHABET = [
  'А',
  'Б',
  'В',
  'Г',
  'Ґ',
  'Д',
  'Е',
  'Є',
  'Ж',
  'З',
  'И',
  'І',
  'Ї',
  'Й',
  'К',
  'Л',
  'М',
  'Н',
  'О',
  'П',
  'Р',
  'С',
  'Т',
  'У',
  'Ф',
  'Х',
  'Ц',
  'Ч',
  'Ш',
  'Щ',
  'Ь',
  'Ю',
  'Я'
] as const;

export const PIN_LENGTH = 4;
export const PIN_REGEX = /^\d{4}$/;

export const DEFAULT_COUNTDOWN_DAYS = 30;
export const URGENT_DAYS_THRESHOLD = 3;
export const INITIAL_SELECTION_OFFSET_MS = 5 * MS_PER_SECOND;
