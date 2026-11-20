import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import { createDatabaseClient } from '../db/client';
import {
  createFinancialMovement,
  listFinancialMovements,
} from '../db/queries';
import { requireAuthHook } from '../middleware/auth';

const movementSchema = z.object({
  body: z.object({
    type: z.enum([
      'capital_contribution',
      'income',
      'expense',
      'transfer',
      'saved_capital',
      'investment_withdrawal',
      'correction',
    ]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().min(1),
    category: z.string().optional(),
    account: z.enum(['caja', 'banco']),
    counterpart: z.enum(['caja', 'banco']).optional(),
    amount: z.number().positive(),
    currency: z.enum(['DOP', 'USD']).default('DOP'),
    note: z.string().optional(),
    correctionDirection: z.enum(['in', 'out']).optional(),
  }),
});

type MovementInput = z.infer<typeof movementSchema>['body'];

export const financeRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Listar movimientos financieros
  fastify.get(
    '/finance/movements',
    {
      preHandler: requireAuthHook,
    },
    async () => {
      const client = createDatabaseClient();
      await client.connect();

      try {
        const movements = await listFinancialMovements(client);
        return movements;
      } finally {
        await client.end();
      }
    }
  );

  // Crear movimiento financiero
  fastify.post(
    '/finance/movements',
    {
      schema: movementSchema,
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const input = request.body as MovementInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        await client.query('begin');

        const movement = await createFinancialMovement(client, {
          operationId: randomUUID(),
          type: input.type,
          accountCode: input.account,
          counterpartAccountCode: input.counterpart,
          amount: input.amount,
          currency: input.currency,
          occurredAt: `${input.date}T00:00:00Z`,
          description: input.description,
          category: input.category ?? '',
          note: input.note,
        });

        await client.query('commit');
        return reply.status(201).send(movement);
      } catch (error) {
        await client.query('rollback');
        throw error;
      } finally {
        await client.end();
      }
    }
  );
};
