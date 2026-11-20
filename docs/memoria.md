# Memoria del proyecto — TEIS workapp

**Última actualización:** 2026-11-20  
**Uso:** punto de referencia para retomar el desarrollo. No sustituye al PRD, TAD, DLS ni al registro de decisiones.

## Estado en una frase

Frontend web/Android navegable y **sin datos de demostración**. Finanzas, Objetivo e Inventario tienen formularios reales, persistencia local cifrada, backend Fastify con autenticación (JWT + bcrypt) y rutas de API protegidas. El esquema PostgreSQL está migrado y verificado. PowerSync está configurado pero su servidor aún no está desplegado.

## Stack

- React 19 + TypeScript + Vite 8.
- Ionic 9 + Capacitor 8.
- Variables CSS + CSS Modules.
- Vitest + Testing Library.
- PostgreSQL 17 central, migraciones SQL aplicadas con `pg`.
- Backend: Fastify + Zod + `pg` + `bcrypt` + `jsonwebtoken`.
- Persistencia local: `localStorage` + outbox, cifrado con AES-GCM + PBKDF2 (TAD-06).
- Sincronización: PowerSync configurado (cliente listo, servidor pendiente de despliegue).
- Sin Supabase. Sin ORM.
- Tema oscuro predeterminado y tema claro manual.

## Implementado

### Base

- Scaffold completo, tokens del DLS, componentes compartidos, AppShell adaptable y tema persistente.
- Rutas con React Router dentro de Ionic.
- Se eliminaron `demo.ts`, `DemoNotice` y todos los datos ficticios.
- Estado de sincronización visible en la barra lateral.

### Persistencia local y offline-first

- `src/services/local/store.ts`: estado tipado en `localStorage` bajo `teis.workapp.local.v1`.
- `useLocalStore`: suscripción con `useSyncExternalStore`.
- `outbox`: cola local de operaciones pendientes de sincronizar.
- IDs UUIDv4 generados con `crypto.randomUUID()`.
- Las operaciones se guardan primero en el dispositivo.
- Cifrado local (TAD-06): `src/shared/utils/crypto.ts` con AES-GCM + PBKDF2 (SHA-256, 100.000 iteraciones). `unlockStore(password)` al hacer login, `lockStore()` al cerrar sesión. Si no hay clave, los datos solo viven en memoria.

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
- Cada aporte o retiro genera también el movimiento financiero correspondiente.
- Retiro con nota obligatoria y validación de no retirar más que el capital guardado.
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

### Base de datos (PostgreSQL 17)

- `db/migrations/001_initial.sql`: cuentas, objetivo, movimientos financieros, productos, movimientos de stock, vista `inventory_balances`, triggers de inmutabilidad.
- `db/migrations/002_users.sql`: tabla `users` para autenticación (`id`, `email`, `password_hash`, `created_at`).
- `schema_migrations` con checksum SHA-256.
- Cuentas `caja` y `banco` sembradas.
- Usuario `shadow` / `J3sk0921` sembrado en `users`.
- Restricciones: un solo objetivo activo, importes `NUMERIC`, transferencias con cuentas distintas, retiros con nota.
- Prueba de humo SQL: stock, inmutabilidad y objetivo único correctos.

## Rutas de la aplicación (frontend)

| Ruta | Pantalla | Público |
|---|---|---|
| `/auth` | Login | Sí |
| `/` | Dashboard | No (requiere sesión) |
| `/finance` | Finanzas | No |
| `/goal` | Objetivo de utilidad | No |
| `/inventory` | Inventario | No |
| `/purchases` | Compras | No |
| `/sales` | Ventas | No |
| `/experiments` | Experimentos | No |

## Rutas de la API (backend Fastify)

Todas las rutas de API requieren autenticación (JWT), excepto `/auth/register`, `/auth/login` y `/auth/session` (sin sesión previa).

| Módulo | Endpoint | Método | Descripción |
|--------|----------|--------|-------------|
| Sistema | `GET /` | GET | Información de la API |
| Sistema | `GET /health` | GET | Estado del servidor |
| Autenticación | `POST /auth/register` | POST | Registrar usuario (bcrypt) |
| Autenticación | `POST /auth/login` | POST | Login, devuelve JWT + cookie |
| Autenticación | `GET /auth/session` | GET | Usuario autenticado |
| Autenticación | `POST /auth/logout` | POST | Cerrar sesión |
| Finanzas | `GET /finance/movements` | GET | Listar movimientos |
| Finanzas | `POST /finance/movements` | POST | Crear movimiento (7 tipos) |
| Objetivo | `GET /goal` | GET | Obtener meta activa |
| Objetivo | `POST /goal` | POST | Crear objetivo |
| Objetivo | `PUT /goal/:id` | PUT | Actualizar meta |
| Objetivo | `GET /goal/entries` | GET | Listar aportes y retiros |
| Objetivo | `POST /goal/entries` | POST | Crear aporte o retiro |
| Inventario | `GET /inventory/products` | GET | Listar productos |
| Inventario | `POST /inventory/products` | POST | Crear producto |
| Inventario | `GET /inventory/stock-movements` | GET | Listar movimientos de stock |
| Inventario | `POST /inventory/stock-movements` | POST | Crear entrada/salida |

Documentación interactiva: `GET /docs` (Swagger UI).

## Decisiones confirmadas

Registradas en `docs/decisions.md`:

| ID | Decisión | Respuesta |
|---|---|---|
| TAD-01 | Motor de sincronización | PowerSync |
| TAD-03 | Identificadores | UUIDv4 |
| TAD-04 | Framework del backend | Fastify |
| TAD-06 | Cifrado y protección local | Cifrado local implementado (AES-GCM + PBKDF2) |
| TAD-07 | Autenticación y sesiones | Autenticación de sesiones implementada |

También confirmadas: PRD-02, PRD-03, PRD-13 (ver `docs/decisions.md`).

## Implementación provisional (no son decisiones aprobadas)

- PostgreSQL se consulta con SQL directo y `pg`; no se adoptó ORM (TAD-05 pendiente).
- La persistencia local usa `localStorage`, no SQLite (TAD-02 pendiente).
- PowerSync cliente configurado, servidor no desplegado (TAD-01 pendiente de despliegue).
- Los IDs son UUIDv4 (TAD-03 confirmado).
- La validación de saldo por cuenta y la idempotencia del servidor siguen pendientes.

## Pendiente

- Compras y ventas con sus artículos, inventario y finanzas en una transacción.
- Lógica real de experimentos, proyectos y tareas.
- Exportaciones, informes y respaldos.
- Desplegar servidor PowerSync para sincronización real.

## Decisiones todavía abiertas

- PRD-01, PRD-04 a PRD-12.
- TAD-02, TAD-05, TAD-08, TAD-09, TAD-10, TAD-11.
- DLS-004 a DLS-009.

No convertir propuestas en decisiones aprobadas sin confirmación del responsable.

## Entorno

- La compilación Android no está verificada porque falta el SDK (`ANDROID_HOME` sin definir).
- El bundle principal ronda 1.39 MB (Ionic); aceptable por ahora.

## Verificación

Última ejecución correcta:

- `npm test`: **10 archivos, 34 pruebas aprobadas**.
- `npm run typecheck`: sin errores (frontend y backend).
- `npm run build`: compilación de producción correcta.
- `npm run db:migrate`: migraciones aplicadas.
- `npm run db:status`: base al día.
- Prueba de humo SQL: stock, inmutabilidad y objetivo único correctos.
- Prueba manual del backend: login, creación de movimiento, objetivo, producto y movimiento de inventario responden correctamente con JWT.

## Estado del repositorio

- Commit actual: `ef43f3f` (documentación de rutas de API).
- `.env` y `backend/.env` contienen credenciales reales y están ignorados por Git. Nunca versionarlos.
- `dist/` y los assets copiados de Android están ignorados.
- `android/` no está trackeado (generado por Capacitor).
- Dependencias nuevas: `pg`, `@types/pg`, `@powersync/web`, `bcrypt`, `@types/bcrypt`, `jsonwebtoken`, `@types/jsonwebtoken`.

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
- `backend/` — API Fastify (package.json, tsconfig.json, src/, db/migrations/).
- `src/services/local/store.ts` — estado local, validaciones y outbox.
- `src/shared/utils/crypto.ts` — cifrado local (AES-GCM + PBKDF2).
- `src/services/auth/authService.ts` — cliente de autenticación (login, registro, sesión).
- `src/modules/finance/` — modelo, formulario y pantalla de finanzas.
- `src/modules/goal/` — modelo, formularios y pantalla del objetivo.
- `src/modules/inventory/` — modelo, formularios y pantalla de inventario.
- `src/modules/auth/LoginPage.tsx` — pantalla de login.
- `src/modules/dashboard/` — resumen general.
- `src/shared/components/Form/`, `Dialog/`, `Select/`, `TextArea/` — piezas de formularios.
- `src/shared/components/RequireAuth/RequireAuth.tsx` — protección de rutas.
- `src/shared/components/SyncStatus/` — estado de guardado local.
- `powersync/sync-config.yaml` — configuración del servidor PowerSync.
- `powersync/README.md` — requisitos de despliegue de PowerSync.
