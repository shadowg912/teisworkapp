# Memoria del proyecto — TEIS workapp

**Última actualización:** 2026-11-20  
**Uso:** punto de referencia para retomar el desarrollo. No sustituye al PRD, TAD, DLS ni al registro de decisiones.

## Estado en una frase

Frontend web/Android navegable y **sin datos de demostración**. Finanzas, Objetivo e Inventario tienen formularios reales y persistencia local con cola de cambios. El esquema PostgreSQL está migrado y verificado. Todavía **no existe API de sincronización, autenticación ni lógica de servidor**.

## Stack

- React 19 + TypeScript + Vite 8.
- Ionic 9 + Capacitor 8.
- Variables CSS + CSS Modules.
- Vitest + Testing Library.
- PostgreSQL 17 central, migraciones SQL aplicadas con `pg`.
- Persistencia local provisional: `localStorage` + outbox.
- Sin Supabase. Sin ORM. Sin API todavía.
- Tema oscuro predeterminado y tema claro manual.

## Implementado

### Base

- Scaffold completo, tokens del DLS, componentes compartidos, AppShell adaptable y tema persistente.
- Rutas con React Router dentro de Ionic.
- Se eliminaron `demo.ts`, `DemoNotice` y todos los datos ficticios.
- Estado de sincronización visible en la barra lateral: guardado local o cambios pendientes.

### Persistencia local y offline-first

- `src/services/local/store.ts`: estado tipado en `localStorage` bajo `teis.workapp.local.v1`.
- `useLocalStore`: suscripción con `useSyncExternalStore`.
- `outbox`: cola local de operaciones pendientes de sincronizar, en orden de dependencia (lo más antiguo primero).
- IDs UUIDv4 generados con `crypto.randomUUID()`; decisión UUIDv4/UUIDv7 sigue pendiente (TAD-03).
- Las operaciones se guardan primero en el dispositivo. Si el almacenamiento falla, la sesión sigue en memoria.
- La sincronización con el servidor todavía no existe.

### Finanzas

- Dos cuentas fijas: **Caja** y **Banco**.
- Formulario para los siete tipos aprobados: aporte de capital, ingreso, gasto, transferencia, capital guardado, retiro para inversión y corrección.
- Validaciones: fecha, descripción, importe positivo, transferencia con cuenta destino distinta y dirección explícita en correcciones.
- Los movimientos de capital guardado y retiro para inversión exigen un objetivo activo y generan su `goal_entry` vinculada.
- Filtros: Todos / Ingresos / Gastos / Capital.
- Resumen de Caja, Banco, capital disponible y capital guardado.
- **Pendiente:** validación de saldo por cuenta (las reglas de saldos siguen sin aprobarse).

### Objetivo de utilidad

- Ruta `/goal`, una sola meta activa.
- Formulario de creación y actualización de meta.
- Formulario de aportes y retiros.
- El avance se calcula como **aportes − retiros**.
- Cada aporte o retiro genera también el movimiento financiero correspondiente en la misma operación local.
- Retiro con nota obligatoria y validación provisional de no retirar más que el capital guardado.
- Aviso de que el retiro reduce el capital guardado y **no es un gasto**.
- Cálculo cubierto por pruebas en `src/modules/goal/model.test.ts`.

### Inventario

- Alta de productos con SKU único, unidad, mínimo, costo y precio.
- Movimientos de entrada y salida; las existencias se calculan desde los movimientos.
- Validación de cantidad positiva y de que una salida no supere la existencia disponible.
- Estados Disponible / Bajo / Agotado y búsqueda por nombre o SKU.
- Cálculo cubierto por pruebas en `src/modules/inventory/model.test.ts`.

### Dashboard

- Capital disponible y capital total (disponible + guardado).
- Ingresos, gastos y resultado del mes actual.
- Franja del objetivo con capital guardado, meta, avance, restante y retirado.
- Actividad reciente desde movimientos reales.
- Alertas de inventario por existencias bajas o agotadas.
- Experimentos sin datos, con estado vacío.

### Compras, ventas y experimentos

- Sin datos ficticios. Muestran estados vacíos hasta su próxima etapa.
- El modelo de compras conserva sus pruebas de totales con datos de prueba locales al test.

### Base de datos

- `db/migrations/001_initial.sql` aplicada a PostgreSQL 17.10.
- Tablas: `accounts`, `goals`, `goal_entries`, `financial_movements`, `products`, `stock_movements`.
- Vista: `inventory_balances`.
- `schema_migrations` con checksum SHA-256 para impedir editar migraciones ya aplicadas.
- Cuentas `caja` y `banco` sembradas.
- Restricciones: un solo objetivo activo, importes `NUMERIC`, transferencias con cuentas distintas, retiros con nota, movimientos de objetivo vinculados.
- Triggers de inmutabilidad en movimientos financieros, del objetivo y de inventario.
- Prueba de humo transaccional: stock calculado, actualización de movimiento rechazada y segundo objetivo activo rechazado.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Dashboard |
| `/finance` | Finanzas |
| `/goal` | Objetivo de utilidad |
| `/inventory` | Inventario |
| `/purchases` | Compras |
| `/sales` | Ventas |
| `/experiments` | Experimentos |

## Datos iniciales

- La base central solo contiene las cuentas fijas `Caja` y `Banco`.
- El almacén local empieza vacío; no hay cifras de demostración.
- Los totales se calculan desde los movimientos y productos registrados.

## Decisiones confirmadas

Registradas en `docs/decisions.md`:

- Stack del frontend y estrategia de estilos.
- Inter, tema oscuro predeterminado y tema claro manual.
- **PRD-02:** cuentas fijas Caja y Banco. El capital guardado reduce el capital disponible, no el capital total.
- **PRD-03:** tipos de movimiento financieros aprobados.
- **PRD-13:** una sola meta activa; avance por capital guardado; retiros para inversión explícitos y no considerados gasto.

## Implementación provisional (no son decisiones aprobadas)

- PostgreSQL se consulta con SQL directo y `pg`; no se adoptó ORM (TAD-05 pendiente).
- La persistencia local usa `localStorage`, no SQLite (TAD-02 pendiente).
- No hay motor de sincronización; solo outbox local (TAD-01 pendiente).
- No hay API ni framework de backend (TAD-04 pendiente).
- Los IDs son UUIDv4 (TAD-03 pendiente).
- La validación de saldo por cuenta y la idempotencia del servidor siguen pendientes.

## Backend y sincronización (este incremento)

### Backend: Fastify

- `backend/` con Fastify, Zod, PostgreSQL (`pg`), CORS, cookies firmadas y Swagger.
- Endpoints operativos: `GET /` y `GET /health`.
- **Autenticación (TAD-07):**
  - Tabla `users` (migración `002_users.sql`): `id`, `email`, `password_hash`, `created_at`.
  - `POST /auth/register`: registra usuario con contraseña hasheada (bcrypt).
  - `POST /auth/login`: valida credenciales, devuelve JWT en cuerpo y cookie `session_id`.
  - `GET /auth/session`: devuelve el usuario autenticado desde JWT (header `Authorization: Bearer` o cookie).
  - `POST /auth/logout`: borra la cookie de sesión.
  - Hook global `onRequest` que extrae el JWT de `Authorization: Bearer` o cookie y decora `request.user`.
- Usuario creado: `shadow` / `J3sk0921`.
- Cliente de base de datos (`db/client.ts`) compatible con `DB_URL` o `DB_USER`/`DB_PASSWORD`.
- Puerto configurable vía `PORT` (default 3333).
- Scripts: `npm run backend:dev`, `npm run backend:start`, `npm run backend:typecheck`.

### Frontend: autenticación y rutas protegidas

- `src/services/auth/authService.ts`: login, registro, logout, sesión, estado de autenticación en memoria.
- `src/modules/auth/LoginPage.tsx`: pantalla de login en `/auth` con credenciales precargadas (`shadow` / `J3sk0921`).
- `src/shared/components/RequireAuth/RequireAuth.tsx`: protege rutas; redirige a `/auth` si no hay sesión.
- `src/app/router/AppRoutes.tsx`: ruta `/auth` pública; el resto requiere autenticación.
- `src/app/App.tsx`: verifica sesión al cargar antes de mostrar la UI.
- `src/shared/components/AppShell/AppShell.tsx`: muestra usuario conectado y botón de cerrar sesión.

### Sincronización: PowerSync (offline-first)

- `powersync/sync-config.yaml` — configuración del servidor PowerSync (reglas de sync por tabla).
- `powersync/README.md` — requisitos de despliegue (logical replication, JWT, Docker).
- `src/services/sync/powersync.schema.ts` — schema del cliente para las 6 tablas (accounts, goals, goal_entries, financial_movements, products, stock_movements).
- `src/services/sync/powersync.client.ts` — instancia de `PowerSyncDatabase` con SQLite local (WASM).
- `src/services/sync/PowerSyncProvider.tsx` — proveedor de React; el authenticator usa el JWT del almacén de auth del frontend.
- `src/app/App.tsx` — la app está envuelta en `PowerSyncProvider`.
- Variable de entorno: `VITE_POWERSYNC_URL` (default `http://localhost:8080`).
- Mientras el servidor PowerSync no esté disponible, la app funciona con `localStorage` + `outbox` (modo local).

### Decisiones técnicas confirmadas (este incremento)

| ID | Decisión | Respuesta |
|---|---|---|
| TAD-01 | Motor de sincronización | PowerSync |
| TAD-03 | Identificadores | UUIDv4 |
| TAD-04 | Framework del backend | Fastify |
| TAD-06 | Cifrado y protección local | Cifrado local implementado (AES-GCM + PBKDF2) |
| TAD-07 | Autenticación y sesiones | Autenticación de sesiones implementada |

### Pendiente

### Rutas de API implementadas (este incremento)

Todas protegidas con `requireAuthHook` (JWT en `Authorization: Bearer` o cookie `session_id`):

**Finanzas:**
- `GET /finance/movements` — listar movimientos
- `POST /finance/movements` — crear movimiento (7 tipos aprobados)

**Objetivo de utilidad:**
- `GET /goal` — obtener objetivo activo
- `POST /goal` — crear objetivo
- `PUT /goal/:id` — actualizar meta
- `GET /goal/entries` — listar aportes y retiros
- `POST /goal/entries` — crear aporte o retiro

**Inventario:**
- `GET /inventory/products` — listar productos
- `POST /inventory/products` — crear producto
- `GET /inventory/stock-movements` — listar movimientos de stock
- `POST /inventory/stock-movements` — crear entrada/salida

### Pendiente

- Compras y ventas con sus artículos, inventario y finanzas en una transacción.
- Lógica real de experimentos, proyectos y tareas.
- Exportaciones, informes y respaldos.

### Decisiones todavía abiertas

- PRD-01, PRD-04 a PRD-12.
- TAD-02, TAD-05, TAD-08, TAD-09, TAD-10, TAD-11.
- DLS-004 a DLS-009.

No convertir propuestas en decisiones aprobadas sin confirmación del responsable.

### Entorno

- La compilación Android no está verificada porque falta el SDK (`ANDROID_HOME` sin definir).
- El bundle principal ronda 1.39 MB (Ionic); aceptable por ahora.

## Verificación

Última ejecución correcta:

- `npm test`: **8 archivos, 25 pruebas aprobadas**.
- `npm run typecheck`: sin errores.
- `npm run build`: compilación de producción correcta.
- `npm run db:migrate`: aplicada `001_initial.sql`.
- `npm run db:status`: base al día.
- Prueba de humo SQL: stock, inmutabilidad y objetivo único correctos.
- Flujo manual en navegador: crear objetivo, aportar, registrar ingreso, crear producto y registrar entrada de inventario; datos persistidos en `localStorage`.

## Estado del repositorio

- Commit inicial: `742d5d3`.
- El incremento actual (formularios, almacén local y migraciones) está **sin commit**.
- `.env` contiene credenciales reales y está ignorado por Git. Nunca versionarlo.
- `dist/` y los assets copiados de Android están ignorados.
- Dependencias nuevas: `pg`, `@types/pg`, `@powersync/web`.

## Cómo retomar

1. Leer este archivo y `docs/decisions.md`.
2. Ejecutar `npm install` si hace falta.
3. Ejecutar `npm test`, `npm run typecheck` y `npm run build`.
4. Ejecutar `npm run db:status`; aplicar migraciones con `npm run db:migrate` si hay pendientes.
5. Revisar las pantallas con `npm run dev`.
6. Elegir el siguiente incremento entre las tareas pendientes.
7. Actualizar este archivo, `docs/decisions.md` y los documentos afectados al terminar.

## Archivos clave

- `docs/firts-promt.md` — instrucciones maestras.
- `docs/prd.md` — producto.
- `docs/tad.md` — arquitectura técnica, incluido §6.8 del objetivo.
- `docs/dls.md` — sistema de diseño, incluido §9.7.
- `docs/decisions.md` — decisiones confirmadas y pendientes.
- `db/migrations/` — esquema PostgreSQL.
- `db/migrate.mjs` — runner de migraciones.
- `backend/` — API Fastify (package.json, tsconfig.json, src/).
- `src/services/local/store.ts` — estado local, validaciones y outbox.
- `src/modules/finance/` — modelo, formulario y pantalla de finanzas.
- `src/modules/goal/` — modelo, formularios y pantalla del objetivo.
- `src/modules/inventory/` — modelo, formularios y pantalla de inventario.
- `src/modules/dashboard/` — resumen general.
- `src/shared/components/Form/`, `Dialog/`, `Select/`, `TextArea/` — piezas de formularios.
- `src/shared/components/SyncStatus/` — estado de guardado local.
