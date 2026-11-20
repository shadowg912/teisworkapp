import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import jwt from 'jsonwebtoken';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { financeRoutes } from './routes/finance';
import { goalRoutes } from './routes/goal';
import { inventoryRoutes } from './routes/inventory';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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

function extractToken(headers: Record<string, string | string[] | undefined>): string | null {
  const auth = headers.authorization;
  const authStr = Array.isArray(auth) ? auth[0] : auth;
  if (authStr && authStr.startsWith('Bearer ')) {
    return authStr.slice(7);
  }

  const cookie = headers.cookie;
  const cookieStr = Array.isArray(cookie) ? cookie[0] : cookie;
  const match = cookieStr?.match(/(?:^|;\s*)session_id=([^;]+)/);
  return match ? match[1] : null;
}

export async function buildApp() {
  const app = fastify({
    logger: true,
    requestIdHeader: 'x-request-id',
  });

  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'TEIS workapp API',
        description: 'API del backend de TEIS workapp (finanzas, inventario, objetivo, autenticación)',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3333}`,
          description: 'Servidor de desarrollo local',
        },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // Hook global de autenticación: lee el JWT de Authorization: Bearer o cookie session_id
  app.addHook('onRequest', async (request) => {
    const token = extractToken(request.headers);

    if (!token) {
      request.user = null;
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        sub: string;
        email: string;
      };

      request.user = { id: decoded.sub, email: decoded.email, authenticated: true };
    } catch {
      request.user = null;
    }
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(financeRoutes);
  await app.register(goalRoutes);
  await app.register(inventoryRoutes);

  // Ruta raíz de información
  app.get('/', async () => {
    return {
      name: 'TEIS workapp API',
      version: '0.1.0',
      docs: '/docs',
      health: '/health',
      auth: [
        '/auth/register',
        '/auth/login',
        '/auth/session',
        '/auth/logout',
      ],
      finance: [
        'GET /finance/movements',
        'POST /finance/movements',
      ],
      goal: [
        'GET /goal',
        'POST /goal',
        'PUT /goal/:id',
        'GET /goal/entries',
        'POST /goal/entries',
      ],
      inventory: [
        'GET /inventory/products',
        'POST /inventory/products',
        'GET /inventory/stock-movements',
        'POST /inventory/stock-movements',
      ],
    };
  });

  return app;
}
