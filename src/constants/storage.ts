export const STORAGE_KEYS = {
  SAVED_BOARDS: 'alphadate_saved_boards',
  STATE_PREFIX: 'alphadate_state_',
  PIN_PREFIX: 'alphadate_pin_',
  PIN_DISMISSED_PREFIX: 'alphadate_pin_dismissed_',
  PIN_FIRST_SEEN_PREFIX: 'alphadate_pin_first_seen_',
  DEVICE_SALT: 'alphadate_sec_salt'
} as const;

export const getBoardStateStorageKey = (boardId: string): string =>
  `${STORAGE_KEYS.STATE_PREFIX}${boardId}`;

export const getBoardPinStorageKey = (boardId: string): string =>
  `${STORAGE_KEYS.PIN_PREFIX}${boardId}`;

export const getPinDismissedStorageKey = (boardId: string): string =>
  `${STORAGE_KEYS.PIN_DISMISSED_PREFIX}${boardId}`;

export const getPinFirstSeenStorageKey = (boardId: string): string =>
  `${STORAGE_KEYS.PIN_FIRST_SEEN_PREFIX}${boardId}`;
