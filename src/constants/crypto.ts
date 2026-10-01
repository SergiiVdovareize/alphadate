export const CRYPTO_KEYSTORE_CONFIG = {
  DB_NAME: 'alphadate_keystore',
  DB_VERSION: 1,
  STORE_NAME: 'keys',
  KEY_NAME: 'device_pin_key'
} as const;

export const CRYPTO_CIPHER_CONFIG = {
  AES_GCM_KEY_LENGTH: 256,
  IV_LENGTH_BYTES: 12,
  SALT_LENGTH_BYTES: 32,
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_HASH: 'SHA-256'
} as const;
