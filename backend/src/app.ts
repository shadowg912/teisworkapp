import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { authMiddleware } from './middleware/auth';
import { healthRoutes } from './routes/health';

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
        description: 'API del backend de TEIS workapp (finanzas, inventario, objetivo)',
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

  await app.register(authMiddleware);

  await app.register(healthRoutes);

  // Ruta raíz de información
  app.get('/', async () => {
    return {
      name: 'TEIS workapp API',
      version: '0.1.0',
      docs: '/docs',
      health: '/health',
    };
  });

  return app;
}
