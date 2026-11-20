import pg from 'pg';

/**
 * Crea un cliente PostgreSQL a partir de .env.
 *
 * DB_URL puede ser:
 * - postgresql://host:5432/base (credenciales en DB_USER / DB_PASSWORD)
 * - postgresql://usuario:clave@host:5432/base (credenciales incluidas)
 */
export function createDatabaseClient() {
  const rawUrl = process.env.DB_URL;

  if (!rawUrl) {
    throw new Error('Falta DB_URL en el entorno.');
  }

  const url = new URL(rawUrl);
  const hasCredentials = Boolean(url.username || url.password);

  if (!hasCredentials && (!process.env.DB_USER || !process.env.DB_PASSWORD)) {
    throw new Error('Faltan DB_USER y DB_PASSWORD para la conexión.');
  }

  const config = hasCredentials
    ? { connectionString: rawUrl }
    : {
        host: url.hostname,
        port: Number(url.port || 5432),
        database: decodeURIComponent(url.pathname.replace(/^\//, '')),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };

  config.ssl =
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

  return new pg.Client(config);
}
