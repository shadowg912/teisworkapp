/**
 * Cliente de PowerSync para TEIS workapp.
 *
 * Conecta el cliente web/Android con el servidor PowerSync, que a su vez se
 * sincroniza con PostgreSQL. Mientras el servidor PowerSync no esté desplegado
 * ni exista autenticación de backend, el cliente sigue funcionando con datos
 * locales (offline-first) y los cambios se acumulan en el outbox local.
 */

import { PowerSyncDatabase } from '@powersync/web';
import { powersyncSchema } from './powersync.schema';
import type { PowersyncDatabase as PowersyncDatabaseType } from './powersync.schema';

export const POWERSYNC_URL =
  import.meta.env.VITE_POWERSYNC_URL ?? 'http://localhost:8080';

export const db = new PowerSyncDatabase({
  schema: powersyncSchema,
  database: {
    dbFilename: 'teisworkapp.db',
  },
});

export type { PowersyncDatabaseType };
