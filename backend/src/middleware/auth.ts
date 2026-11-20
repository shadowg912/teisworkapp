import type { FastifyPluginAsync } from 'fastify';
import cookie from '@fastify/cookie';

/**
 * Middleware de autenticación y sesiones.
 *
 * Configura cookies firmadas y un decorador `request.user` para identificar
 * al usuario autenticado. La validación real de credenciales y el cifrado
 * local se implementan en una siguiente etapa (TAD-06, TAD-07).
 */
export const authMiddleware: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cookie, {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    parseOptions: {},
  });

  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request) => {
    const sessionId = request.cookies?.session_id;

    if (!sessionId) {
      return;
    }

    // TODO: validar sesión contra la base de datos / almacenamiento local
    (request as { user?: { sessionId: string; authenticated: boolean } }).user =
      { sessionId, authenticated: false };
  });
};
