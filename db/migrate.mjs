import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createDatabaseClient } from './client.mjs';

const migrationsDirectory = fileURLToPath(new URL('./migrations/', import.meta.url));

function checksum(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

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

    if (files.length === 0) {
      console.log('No hay migraciones pendientes.');
      return;
    }

    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      const sql = await readFile(`${migrationsDirectory}/${file}`, 'utf8');
      const hash = checksum(sql);
      const existing = await client.query(
        'select checksum from schema_migrations where name = $1',
        [file],
      );

      if (existing.rowCount === 1) {
        if (existing.rows[0].checksum !== hash) {
          throw new Error(
            `La migración ${file} cambió después de aplicarse. Crea una migración nueva en lugar de editarla.`,
          );
        }

        skipped += 1;
        continue;
      }

      await client.query('begin');

      try {
        await client.query(sql);
        await client.query(
          'insert into schema_migrations (name, checksum) values ($1, $2)',
          [file, hash],
        );
        await client.query('commit');
        applied += 1;
        console.log(`Aplicada: ${file}`);
      } catch (error) {
        await client.query('rollback');
        throw new Error(`Falló la migración ${file}: ${error.message}`);
      }
    }

    console.log(`Migraciones aplicadas: ${applied}. Omitidas: ${skipped}.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
