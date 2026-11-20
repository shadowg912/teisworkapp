import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearDerivedKey,
  decrypt,
  deriveKey,
  encrypt,
  getDerivedKey,
  setDerivedKey,
} from './crypto';

describe('cifrado local', () => {
  beforeEach(() => {
    clearDerivedKey();
  });

  it('deriva una clave a partir de una contraseña', async () => {
    const key = await deriveKey('mi-contrasena-123');

    expect(key).toBeInstanceOf(CryptoKey);
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('cifra y descifra correctamente', async () => {
    const key = await deriveKey('mi-contrasena-123');
    const plaintext = 'Datos sensibles de TEIS workapp';

    const ciphertext = await encrypt(plaintext, key);
    const decrypted = await decrypt(ciphertext, key);

    expect(ciphertext).not.toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });

  it('falla al descifrar con una clave diferente', async () => {
    const key1 = await deriveKey('contrasena-uno');
    const key2 = await deriveKey('contrasena-dos');
    const plaintext = 'Texto de prueba';

    const ciphertext = await encrypt(plaintext, key1);

    await expect(decrypt(ciphertext, key2)).rejects.toThrow();
  });

  it('setDerivedKey y getDerivedKey funcionan', async () => {
    const key = await deriveKey('clave-de-prueba');

    setDerivedKey(key);
    expect(getDerivedKey()).toBe(key);

    clearDerivedKey();
    expect(getDerivedKey()).toBeNull();
  });
});
