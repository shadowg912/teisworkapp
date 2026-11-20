/**
 * Utilidades de cifrado local para TEIS workapp (TAD-06).
 *
 * Cifra el almacén local (localStorage/outbox) con una clave derivada de la
 * contraseña del usuario. La clave nunca sale del dispositivo. Si el usuario
 * olvida su contraseña, los datos cifrados no se pueden recuperar.
 *
 * Algoritmo: AES-GCM con PBKDF2 (SHA-256, 100 000 iteraciones).
 */

const SALT_KEY = 'teis.workapp.local.salt';
const PBKDF2_ITERATIONS = 100_000;

let derivedKey: CryptoKey | null = null;

export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Deriva una clave de cifrado a partir de una contraseña y un sal almacenado.
 * El sal se genera la primera vez y se guarda en localStorage para poder
 * rederivar la misma clave en sesiones posteriores sin pedir el sal al usuario.
 */
export async function deriveKey(
  password: string,
  salt?: string
): Promise<CryptoKey> {
  if (!isCryptoAvailable()) {
    throw new Error('La API Web Crypto no está disponible en este entorno.');
  }

  const saltBytes =
    salt !== undefined
      ? new TextEncoder().encode(salt)
      : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64Decode(text: string): Uint8Array {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Cifra un texto plano con AES-GCM. Retorna base64(iv + ciphertext).
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return base64Encode(combined);
}

/**
 * Descifra un texto cifrado en formato base64(iv + ciphertext).
 */
export async function decrypt(
  ciphertextBase64: string,
  key: CryptoKey
): Promise<string> {
  const combined = base64Decode(ciphertextBase64);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Establece la clave derivada en el módulo (para usarla en cifrado/descifrado).
 */
export function setDerivedKey(key: CryptoKey): void {
  derivedKey = key;
}

export function getDerivedKey(): CryptoKey | null {
  return derivedKey;
}

export function clearDerivedKey(): void {
  derivedKey = null;
}

/**
 * Almacena el sal en localStorage para rederivar la clave más tarde.
 */
export function saveSalt(salt: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SALT_KEY, salt);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/**
 * Lee el sal guardado en localStorage.
 */
export function loadSalt(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem(SALT_KEY);
    } catch {
      return null;
    }
  }
  return null;
}
