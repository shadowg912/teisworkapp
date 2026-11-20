import pg from 'pg';

type PgClientConfig =
  | { connectionString: string }
  | {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      connectionString?: never;
    };

/**
 * Crea un cliente PostgreSQL a partir de las variables de entorno del backend.
 *
 * Admite DB_URL con credenciales incluidas o DB_USER / DB_PASSWORD por separado.
 */
export function createDatabaseClient() {
  const rawUrl = process.env.DB_URL;

  if (!rawUrl) {
    throw new Error('Falta DB_URL en el entorno del backend.');
  }

  const url = new URL(rawUrl);
  const hasCredentials = Boolean(url.username || url.password);

  const user = process.env.DB_USER ?? url.username ?? '';
  const password = process.env.DB_PASSWORD ?? url.password ?? '';

  if (!hasCredentials && (!user || !password)) {
    throw new Error('Faltan DB_USER y DB_PASSWORD para la conexión del backend.');
  }

  const baseConfig: PgClientConfig = hasCredentials
    ? { connectionString: rawUrl }
    : {
        host: url.hostname,
        port: Number(url.port || 5432),
        database: decodeURIComponent(url.pathname.replace(/^\//, '')),
        user,
        password,
      };

  const config: pg.ClientConfig = {
    ...baseConfig,
    ssl:
      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };

  return new pg.Client(config);
}
