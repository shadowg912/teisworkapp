import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createDatabaseClient } from '../db/client';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '24h';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

type RegisterInput = z.infer<typeof registerSchema>['body'];

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

type LoginInput = z.infer<typeof loginSchema>['body'];

export const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Registro de usuario
  fastify.post(
    '/auth/register',
    { schema: registerSchema },
    async (request, reply) => {
      const { email, password } = request.body as RegisterInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        const existing = await client.query(
          'select id from users where email = $1',
          [email],
        );

        if ((existing.rowCount ?? 0) > 0) {
          return reply.status(409).send({ error: 'El usuario ya existe.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await client.query(
          'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
          [email, passwordHash],
        );

        return reply.status(201).send(result.rows[0]);
      } finally {
        await client.end();
      }
    }
  );

  // Inicio de sesión: devuelve JWT en cookie httpOnly
  fastify.post(
    '/auth/login',
    { schema: loginSchema },
    async (request, reply) => {
      const { email, password } = request.body as LoginInput;

      const client = createDatabaseClient();
      await client.connect();

      try {
        const result = await client.query(
          'select id, email, password_hash from users where email = $1',
          [email],
        );

        if (result.rowCount === 0) {
          return reply.status(401).send({ error: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
          return reply.status(401).send({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
          expiresIn: JWT_EXPIRES_IN,
        });

        const cookieValue = `session_id=${token}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}; ${
          process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
        }SameSite=Lax`;

        reply.header('Set-Cookie', cookieValue);

        return {
          id: user.id,
          email: user.email,
          token,
        };
      } finally {
        await client.end();
      }
    }
  );

  // Sesión actual: devuelve el usuario autenticado (para PowerSync y frontend)
  fastify.get(
    '/auth/session',
    async (request, reply) => {
      if (!request.user || !request.user.authenticated) {
        return reply.status(401).send({ error: 'No hay sesión activa.' });
      }

      return { id: request.user.id, email: request.user.email };
    }
  );

  // Cerrar sesión
  fastify.post(
    '/auth/logout',
    async (_request, reply) => {
      reply.header(
        'Set-Cookie',
        'session_id=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax'
      );
      return { ok: true };
    }
  );
};
