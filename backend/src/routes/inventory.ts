import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import { createDatabaseClient } from '../db/client';
import {
  createProduct,
  createStockMovement,
  listProducts,
  listStockMovements,
} from '../db/queries';
import { requireAuthHook } from '../middleware/auth';

const productSchema = z.object({
  body: z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    unit: z.string().default('u'),
    minStock: z.number().nonnegative().default(0),
    cost: z.number().nonnegative().default(0),
    price: z.number().nonnegative().default(0),
  }),
});

type ProductInput = z.infer<typeof productSchema>['body'];

const stockMovementSchema = z.object({
  body: z.object({
    productId: z.string(),
    type: z.enum(['in', 'out']),
    quantity: z.number().positive(),
    unitCost: z.number().nonnegative().optional(),
    reason: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

type StockMovementInput = z.infer<typeof stockMovementSchema>['body'];

export const inventoryRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Listar productos
  fastify.get(
    '/inventory/products',
    {
      preHandler: requireAuthHook,
    },
    async () => {
      const client = createDatabaseClient();
      await client.connect();

      try {
        const products = await listProducts(client);
        return { products };
      } finally {
        await client.end();
      }
    }
  );

  // Crear producto
  fastify.post(
    '/inventory/products',
    {
      schema: productSchema,
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const input = request.body as ProductInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        const product = await createProduct(client, {
          sku: input.sku,
          name: input.name,
          unit: input.unit,
          minStock: input.minStock,
          cost: input.cost,
          price: input.price,
        });

        return reply.status(201).send({ product });
      } finally {
        await client.end();
      }
    }
  );

  // Listar movimientos de inventario
  fastify.get(
    '/inventory/stock-movements',
    {
      preHandler: requireAuthHook,
    },
    async () => {
      const client = createDatabaseClient();
      await client.connect();

      try {
        const movements = await listStockMovements(client);
        return { movements };
      } finally {
        await client.end();
      }
    }
  );

  // Crear movimiento de inventario
  fastify.post(
    '/inventory/stock-movements',
    {
      schema: stockMovementSchema,
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const input = request.body as StockMovementInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        await client.query('begin');

        const movement = await createStockMovement(client, {
          operationId: randomUUID(),
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          unitCost: input.unitCost,
          reason: input.reason,
          occurredAt: `${input.date}T00:00:00Z`,
        });

        await client.query('commit');
        return reply.status(201).send({ movement });
      } catch (error) {
        await client.query('rollback');
        throw error;
      } finally {
        await client.end();
      }
    }
  );
};
