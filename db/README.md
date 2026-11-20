# Base de datos

PostgreSQL central de TEIS workapp. Las migraciones son SQL versionado y se aplican con un runner mínimo sobre `pg`.

## Configuración

`.env` (ignorado por Git):

```bash
DB_URL=postgresql://100.93.3.29:5432/teisworkapp
DB_USER=...
DB_PASSWORD=...
# DB_SSL=true  # solo si el servidor lo requiere
```

`DB_URL` también puede incluir usuario y contraseña:

```bash
DB_URL=postgresql://usuario:clave@host:5432/teisworkapp
```

## Comandos

```bash
npm run db:migrate  # aplica las migraciones pendientes
npm run db:status   # muestra aplicadas y pendientes
```

El runner guarda el checksum de cada migración. Si un archivo ya aplicado cambia, la ejecución falla: crea una migración nueva en lugar de editarlo.

## Esquema inicial

- `accounts`: cuentas fijas `caja` y `banco` (PRD-02).
- `goals`: objetivo de utilidad. Índice único parcial para un solo objetivo activo (PRD-13).
- `goal_entries`: aportes y retiros del objetivo. Inmutables.
- `financial_movements`: movimientos de Caja y Banco. Inmutables.
- `products`: catálogo modificable con borrado lógico.
- `stock_movements`: entradas y salidas. Inmutables y fuente de verdad del inventario.
- `inventory_balances`: vista calculada desde `stock_movements`.

## Reglas aplicadas

- Importes monetarios con `NUMERIC(14,2)`; cantidades con `NUMERIC(14,3)`.
- Movimientos financieros, del objetivo y de inventario protegidos por trigger de inmutabilidad.
- Los movimientos de capital guardado y retiro para inversión exigen `goal_entry_id`.
- Los retiros del objetivo exigen nota.
- Los timestamps se guardan con `timestamptz` en UTC.
- `updated_at` y `version` se actualizan en `goals` y `products`.

## Pendiente

- API de sincronización (TAD-04) y autenticación (TAD-07).
- Estrategia de identificadores UUIDv4/UUIDv7 (TAD-03). Hoy se usa `gen_random_uuid()` (v4).
- Reglas de saldo por cuenta y de idempotencia en el servidor.
- ORM (TAD-05). Las migraciones actuales son SQL directo.
