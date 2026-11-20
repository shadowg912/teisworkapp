import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const healthRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/health',
    async (): Promise<{ status: string; service: string; timestamp: string }> => {
      return {
        status: 'ok',
        service: 'teis-workapp-backend',
        timestamp: new Date().toISOString(),
      };
    }
  );
};
