# Configuración de PowerSync — TEIS workapp

## Descripción

PowerSync sincroniza PostgreSQL (servidor central) con SQLite local (cliente
web/Android) para funcionamiento offline-first.

## Componentes

- `powersync/sync-config.yaml` — configuración del servidor PowerSync.
- `src/services/sync/powersync.schema.ts` — schema del cliente.
- `src/services/sync/powersync.client.ts` — cliente de PowerSync.
- `src/services/sync/PowerSyncProvider.tsx` — proveedor de React.

## Requisitos del servidor PostgreSQL

PowerSync lee el write-ahead log (WAL) de PostgreSQL mediante logical
replication. Antes de desplegar PowerSync, en PostgreSQL debe habilitarse:

```sql
ALTER SYSTEM SET wal_level = logical;
-- Reiniciar PostgreSQL después de este cambio.
```

Además, el usuario de la base de datos necesita privilegios de replicación:

```sql
ALTER USER <DB_USER> WITH REPLICATION;
GRANT CONNECT ON DATABASE teisworkapp TO <DB_USER>;
GRANT USAGE ON SCHEMA public TO <DB_USER>;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO <DB_USER>;
```

## Despliegue del servidor PowerSync

PowerSync se despliega por separado (Docker) y se conecta a PostgreSQL:

```bash
docker run -d \
  --name powersync \
  -p 8080:8080 \
  -e DATABASE_URL="${DB_URL}" \
  -e POWERSYNC_JWT_SECRET="${JWT_SECRET}" \
  ghcr.io/powersync-ja/powersync-server:latest
```

Luego aplicar `powersync/sync-config.yaml` al servidor PowerSync.

## Variables de entorno del frontend

```bash
VITE_POWERSYNC_URL=http://localhost:8080
```

## Integración con el backend Fastify

El backend Fastify (TAD-04) es responsable de:
1. Autenticación y emisión de JWT (TAD-07).
2. Validación de operaciones críticas antes de escribir en PostgreSQL.
3. Exponer endpoints para operaciones que PowerSync no cubre.

PowerSync maneja la replicación de datos directamente entre PostgreSQL y
SQLite local. El backend no necesita endpoints CRUD para las tablas
sincronizadas; solo necesita auth y validación de negocio.

## Estado actual

- Cliente configurado y proveedor integrado en la app.
- Mientras el servidor PowerSync no esté disponible, la app funciona con el
  almacén local (`localStorage` + `outbox`).
- Una vez desplegado PowerSync, el outbox puede migrarse a sincronización
  directa vía PowerSync.
