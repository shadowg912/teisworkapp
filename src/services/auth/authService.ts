/**
 * Servicio de autenticación para TEIS workapp.
 *
 * Se comunica con el backend Fastify para login, logout y sesión.
 * El JWT se almacena en memoria (variable de módulo) y se envía en
 * la cabecera `Authorization: Bearer <token>` de cada petición.
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

let token: string | null = null;
let user: { id: string; email: string } | null = null;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getToken(): string | null {
  return token;
}

export function getUser(): { id: string; email: string } | null {
  return user;
}

export function isAuthenticated(): boolean {
  return token !== null && user !== null;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function request(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const extraHeaders = options.headers as Record<string, string>;
    for (const key of Object.keys(extraHeaders)) {
      headers[key] = extraHeaders[key];
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ id: string; email: string; token: string }> {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? 'Error al iniciar sesión.');
  }

  const data = await response.json();

  token = data.token;
  user = { id: data.id, email: data.email };
  notify();

  return { id: data.id, email: data.email, token: data.token };
}

export async function register(
  email: string,
  password: string
): Promise<{ id: string; email: string }> {
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? 'Error al registrar usuario.');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Ignorar errores del servidor al cerrar sesión
  }

  token = null;
  user = null;
  notify();
}

export async function fetchSession(): Promise<{
  id: string;
  email: string;
} | null> {
  const response = await request('/auth/session');

  if (!response.ok) {
    token = null;
    user = null;
    notify();
    return null;
  }

  const data = await response.json();
  user = { id: data.id, email: data.email };
  notify();

  return user;
}

export function setSession(
  tokenValue: string,
  userValue: { id: string; email: string }
): void {
  token = tokenValue;
  user = userValue;
  notify();
}

export function clearSession(): void {
  token = null;
  user = null;
  notify();
}
