import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createDatabaseClient } from './client.mjs';

const migrationsDirectory = fileURLToPath(new URL('./migrations/', import.meta.url));

async function main() {
  const client = createDatabaseClient();
  await client.connect();

  try {
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort();
    const applied = await client.query(
      'select name, applied_at from schema_migrations order by name',
    );
    const appliedNames = new Set(applied.rows.map((row) => row.name));

    for (const file of files) {
      const row = applied.rows.find((item) => item.name === file);
      console.log(
        `${row ? 'aplicada' : 'pendiente'}  ${file}${row ? `  ${row.applied_at.toISOString()}` : ''}`,
      );
    }

    const orphaned = applied.rows.filter((row) => !files.includes(row.name));
    for (const row of orphaned) {
      console.log(`huérfana   ${row.name}  (ya no existe en db/migrations)`);
    }

    if (appliedNames.size === files.length) {
      console.log('Base de datos al día.');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
