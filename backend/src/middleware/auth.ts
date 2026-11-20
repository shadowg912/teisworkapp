export type AuthenticatedUser = {
  id: string;
  email: string;
  authenticated: true;
};

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}

/**
 * Extrae el JWT de la cabecera Authorization: Bearer <token>
 * o de la cookie session_id.
 */
function extractToken(headers: Record<string, string | undefined>): string | null {
  const auth = headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }

  const cookie = headers.cookie ?? '';
  const match = cookie.match(/(?:^|;\s*)session_id=([^;]+)/);
  return match ? match[1] : null;
}

export function attachAuthHook(
  app: { addHook: (name: 'onRequest', fn: (request: { headers: Record<string, string | undefined>; user?: AuthenticatedUser | null }) => Promise<void> | void) => void },
  jwtSecret: string
): void {
  const jwt = require('jsonwebtoken');

  app.addHook('onRequest', async (request) => {
    const token = extractToken(request.headers);

    if (!token) {
      request.user = null;
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        sub: string;
        email: string;
      };

      request.user = { id: decoded.sub, email: decoded.email, authenticated: true };
    } catch {
      request.user = null;
    }
  });
}

export function requireAuth(
  request: { user: AuthenticatedUser | null },
  reply: { status: (code: number) => { send: (body: unknown) => unknown } }
): AuthenticatedUser | null {
  if (!request.user || !request.user.authenticated) {
    reply.status(401).send({ error: 'Autenticación requerida.' });
    return null;
  }

  return request.user;
}

/**
 * Hook de preHandler para Fastify: requiere autenticación.
 * Si no hay sesión válida, lanza un error que Fastify convierte en 401.
 */
export function requireAuthHook(
  request: { user: AuthenticatedUser | null },
  _reply: { status: (code: number) => { send: (body: unknown) => unknown } },
  done: (error?: Error) => void
): void {
  if (!request.user || !request.user.authenticated) {
    const error = new Error('Autenticación requerida.');
    (error as unknown as Record<string, unknown>).statusCode = 401;
    done(error);
    return;
  }

  done();
}
