import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import { createDatabaseClient } from '../db/client';
import {
  createGoal,
  createGoalEntry,
  getActiveGoal,
  listGoalEntries,
  updateGoal,
} from '../db/queries';
import { requireAuthHook } from '../middleware/auth';

const goalSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    target: z.number().positive(),
    currency: z.enum(['DOP', 'USD']).default('DOP'),
  }),
});

type GoalInput = z.infer<typeof goalSchema>['body'];

const goalEntrySchema = z.object({
  body: z.object({
    type: z.enum(['contribution', 'investment_withdrawal']),
    account: z.enum(['caja', 'banco']),
    amount: z.number().positive(),
    currency: z.enum(['DOP', 'USD']).default('DOP'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().optional(),
  }),
});

type GoalEntryInput = z.infer<typeof goalEntrySchema>['body'];

export const goalRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Obtener el objetivo activo
  fastify.get(
    '/goal',
    {
      preHandler: requireAuthHook,
    },
    async () => {
      const client = createDatabaseClient();
      await client.connect();

      try {
        const goal = await getActiveGoal(client);
        return { goal };
      } finally {
        await client.end();
      }
    }
  );

  // Crear objetivo
  fastify.post(
    '/goal',
    {
      schema: goalSchema,
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const input = request.body as GoalInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        const goal = await createGoal(client, {
          name: input.name,
          target: input.target,
          currency: input.currency,
        });

        return reply.status(201).send({ goal });
      } finally {
        await client.end();
      }
    }
  );

  // Actualizar objetivo
  fastify.put(
    '/goal/:id',
    {
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as { name: string; target: number; currency: string };

      const client = createDatabaseClient();
      await client.connect();

      try {
        if (!body.name || !body.target || !body.currency) {
          return reply.status(400).send({ error: 'name, target y currency son requeridos.' });
        }

        const goal = await updateGoal(client, {
          id: params.id,
          name: body.name,
          target: body.target,
          currency: body.currency,
        });

        return reply.send({ goal });
      } finally {
        await client.end();
      }
    }
  );

  // Listar entradas del objetivo (aportes y retiros)
  fastify.get(
    '/goal/entries',
    {
      preHandler: requireAuthHook,
    },
    async (_request, reply) => {
      const client = createDatabaseClient();
      await client.connect();

      try {
        const goal = await getActiveGoal(client);

        if (!goal) {
          return reply.status(404).send({ error: 'No hay objetivo activo.' });
        }

        const entries = await listGoalEntries(client, goal.id);
        return { goal, entries };
      } finally {
        await client.end();
      }
    }
  );

  // Crear entrada del objetivo (aporte o retiro)
  fastify.post(
    '/goal/entries',
    {
      schema: goalEntrySchema,
      preHandler: requireAuthHook,
    },
    async (request, reply) => {
      const input = request.body as GoalEntryInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        await client.query('begin');

        const goal = await getActiveGoal(client);

        if (!goal) {
          await client.query('rollback');
          return reply.status(404).send({ error: 'No hay objetivo activo.' });
        }

        const entry = await createGoalEntry(client, {
          operationId: randomUUID(),
          goalId: goal.id,
          type: input.type,
          accountCode: input.account,
          amount: input.amount,
          currency: input.currency,
          date: input.date,
          note: input.note ?? '',
        });

        await client.query('commit');
        return reply.status(201).send({ entry });
      } catch (error) {
        await client.query('rollback');
        throw error;
      } finally {
        await client.end();
      }
    }
  );
};
