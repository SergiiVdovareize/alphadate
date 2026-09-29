import { describe, it, expect, beforeEach } from 'vitest';
import {
  encryptPin,
  decryptPin,
  bufferToBase64,
  base64ToBuffer,
  resetCryptoKeyForTesting
} from './crypto';

describe('crypto utility', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCryptoKeyForTesting();
  });

  it('converts buffers to base64 and back accurately', () => {
    const original = new Uint8Array([1, 2, 3, 4, 10, 255, 128, 64]);
    const base64 = bufferToBase64(original);
    const restored = base64ToBuffer(base64);

    expect(Array.from(restored)).toEqual(Array.from(original));
  });

  it('encrypts a PIN and decrypts it back to original value', async () => {
    const pin = '4829';
    const encrypted = await encryptPin(pin);

    // Stored string is a JSON payload, NOT plaintext PIN
    expect(encrypted).not.toBe(pin);
    expect(encrypted).not.toContain(pin);

    const parsed = JSON.parse(encrypted);
    expect(parsed.v).toBe(1);
    expect(parsed.iv).toBeDefined();
    expect(parsed.data).toBeDefined();

    const decrypted = await decryptPin(encrypted);
    expect(decrypted).toBe(pin);
  });

  it('produces different ciphertexts and IVs for the same PIN', async () => {
    const pin = '1234';
    const enc1 = await encryptPin(pin);
    const enc2 = await encryptPin(pin);

    expect(enc1).not.toBe(enc2);

    const parsed1 = JSON.parse(enc1);
    const parsed2 = JSON.parse(enc2);
    expect(parsed1.iv).not.toBe(parsed2.iv);
    expect(parsed1.data).not.toBe(parsed2.data);
  });

  it('seamlessly decrypts legacy plaintext 4-digit PIN for backward compatibility', async () => {
    const legacyPin = '9876';
    const result = await decryptPin(legacyPin);
    expect(result).toBe('9876');
  });

  it('returns null for empty, corrupted, or tampered payloads', async () => {
    expect(await decryptPin('')).toBeNull();
    expect(await decryptPin('not-valid-json')).toBeNull();
    expect(await decryptPin(JSON.stringify({ v: 1 }))).toBeNull();

    // Tampered ciphertext
    const pin = '5555';
    const validEncrypted = await encryptPin(pin);
    const parsed = JSON.parse(validEncrypted);
    parsed.data = bufferToBase64(new Uint8Array([99, 98, 97]));
    expect(await decryptPin(JSON.stringify(parsed))).toBeNull();
  });
});
