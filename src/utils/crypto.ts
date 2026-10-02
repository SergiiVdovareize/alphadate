/**
 * Web Crypto API utility for encrypting and decrypting sensitive local board credentials (PINs).
 * Uses AES-GCM (256-bit) with random 12-byte IVs.
 * Key is stored as non-extractable CryptoKey in IndexedDB, with PBKDF2 device-salt fallback.
 */

import {
  CRYPTO_KEYSTORE_CONFIG,
  CRYPTO_CIPHER_CONFIG,
  STORAGE_KEYS,
  PIN_REGEX
} from '../constants';

const DB_NAME = CRYPTO_KEYSTORE_CONFIG.DB_NAME;
const DB_VERSION = CRYPTO_KEYSTORE_CONFIG.DB_VERSION;
const STORE_NAME = CRYPTO_KEYSTORE_CONFIG.STORE_NAME;
const KEY_NAME = CRYPTO_KEYSTORE_CONFIG.KEY_NAME;
const FALLBACK_SECRET_KEY = STORAGE_KEYS.DEVICE_SALT;

let inMemoryKey: CryptoKey | null = null;

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getKeyFromIndexedDb(): Promise<CryptoKey | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(KEY_NAME);
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function saveKeyToIndexedDb(key: CryptoKey): Promise<void> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(key, KEY_NAME);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getOrGenerateDeviceKey(): Promise<CryptoKey> {
  if (inMemoryKey) return inMemoryKey;

  // 1. Try IndexedDB if available in environment
  if (typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB) {
    try {
      const keyFromDb = await getKeyFromIndexedDb();
      if (keyFromDb) {
        inMemoryKey = keyFromDb;
        return keyFromDb;
      }
      const newKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: CRYPTO_CIPHER_CONFIG.AES_GCM_KEY_LENGTH },
        false, // non-extractable
        ['encrypt', 'decrypt']
      );
      await saveKeyToIndexedDb(newKey);
      inMemoryKey = newKey;
      return newKey;
    } catch {
      // Fallback below
    }
  }

  // 2. Fallback: PBKDF2 derived from persistent device salt in localStorage
  let salt = typeof localStorage !== 'undefined' ? localStorage.getItem(FALLBACK_SECRET_KEY) : null;
  if (!salt) {
    const rawSalt = crypto.getRandomValues(new Uint8Array(CRYPTO_CIPHER_CONFIG.SALT_LENGTH_BYTES));
    salt = bufferToBase64(rawSalt);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FALLBACK_SECRET_KEY, salt);
    }
  }

  const saltBytes = base64ToBuffer(salt);
  const baseKey = await crypto.subtle.importKey('raw', saltBytes, { name: 'PBKDF2' }, false, [
    'deriveKey'
  ]);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('alphadate_pin_encryption_v1'),
      iterations: CRYPTO_CIPHER_CONFIG.PBKDF2_ITERATIONS,
      hash: CRYPTO_CIPHER_CONFIG.PBKDF2_HASH
    },
    baseKey,
    { name: 'AES-GCM', length: CRYPTO_CIPHER_CONFIG.AES_GCM_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  inMemoryKey = derivedKey;
  return derivedKey;
}

interface EncryptedPinPayload {
  v: number;
  iv: string;
  data: string;
}

/**
 * Encrypts a PIN code using AES-GCM and returns a JSON payload string.
 */
export async function encryptPin(pin: string): Promise<string> {
  const key = await getOrGenerateDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CIPHER_CONFIG.IV_LENGTH_BYTES));
  const encoded = new TextEncoder().encode(pin);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const payload: EncryptedPinPayload = {
    v: 1,
    iv: bufferToBase64(iv),
    data: bufferToBase64(encrypted)
  };
  return JSON.stringify(payload);
}

/**
 * Decrypts a stored payload string. Supports legacy plaintext migration.
 */
export async function decryptPin(storedValue: string): Promise<string | null> {
  if (!storedValue) return null;

  // Backward compatibility: If 4 digits plain text was stored
  if (PIN_REGEX.test(storedValue)) {
    return storedValue;
  }

  try {
    const payload: EncryptedPinPayload = JSON.parse(storedValue);
    if (!payload.iv || !payload.data) return null;

    const key = await getOrGenerateDeviceKey();
    const iv = base64ToBuffer(payload.iv);
    const data = base64ToBuffer(payload.data);

    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    return null;
  }
}

export function resetCryptoKeyForTesting(): void {
  inMemoryKey = null;
}
