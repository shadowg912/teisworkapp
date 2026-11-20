# TEIS workapp

Aplicación interna de gestión empresarial, financiera y operativa. Web y Android, con arquitectura offline-first.

## Estado actual

Frontend y fundamentos visuales (DLS) implementados, sin datos de demostración. Finanzas, Objetivo e Inventario ya tienen formularios reales y guardan en el dispositivo con una cola local de cambios pendientes de sincronizar. El esquema PostgreSQL está migrado y verificado; la API de sincronización todavía no existe.

- Frontend: React 19 + TypeScript + Vite 8 + Ionic 9 + Capacitor 8.
- Estilos: variables CSS y CSS Modules.
- Tema oscuro predeterminado, con tema claro manual.
- Persistencia local provisional: `localStorage` + outbox (`src/services/local/`).
- Base central: PostgreSQL con migraciones SQL en `db/`.

Pantallas disponibles:

- Dashboard con capital disponible, objetivo, actividad reciente y alertas de inventario.
- Finanzas con las cuentas fijas **Caja** y **Banco**, formulario de los siete tipos de movimiento y filtros.
- Objetivo de utilidad con creación de meta, aportes, retiros explícitos y progreso.
- Inventario con alta de productos y movimientos de entrada/salida.
- Compras, ventas y experimentos muestran estados vacíos hasta su próxima etapa.

## Documentación

- [`docs/prd.md`](docs/prd.md) — requisitos de producto.
- [`docs/tad.md`](docs/tad.md) — arquitectura técnica.
- [`docs/dls.md`](docs/dls.md) — sistema de diseño.
- [`docs/decisions.md`](docs/decisions.md) — registro de decisiones pendientes y confirmadas.
- [`docs/memoria.md`](docs/memoria.md) — estado actual y punto de retomada del proyecto.
- [`docs/firts-promt.md`](docs/firts-promt.md) — instrucciones maestras del proyecto.

## Requisitos

- Node.js 20.19+ o 22.12+ (desarrollado con Node 22).
- npm.
- Para compilar Android: Android Studio con SDK 36 y Java 21.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # verificación de tipos + compilación de producción
npm run preview    # servir la compilación de producción
npm run typecheck  # solo verificación de tipos
npm test           # pruebas con Vitest
npm run db:migrate # aplica migraciones PostgreSQL (.env requerido)
npm run db:status  # estado de las migraciones
```

## Estructura

```text
src/
├── app/          # arranque, rutas, proveedores y configuración
├── modules/      # dashboard, finanzas, objetivo, inventario, compras, ventas, experimentos
├── shared/       # componentes, estilos, utilidades y tipos compartidos
├── services/     # almacén local y cola de sincronización
└── test/         # configuración de pruebas

db/
├── migrations/   # SQL versionado
├── migrate.mjs   # runner de migraciones
└── status.mjs    # estado de migraciones
```

Cada módulo contiene su pantalla, sus formularios y las reglas de cálculo en `model.ts`. Las pantallas sin módulo real muestran estados vacíos; no hay datos ficticios.

## Android

El proyecto nativo ya está generado en `android/` y se sincroniza con:

```bash
npm run build
npx cap sync android
npm run cap:android   # abre Android Studio
```

La compilación Android no se ha verificado en este entorno porque el SDK de Android no está instalado (`ANDROID_HOME` sin definir).

## Reglas del proyecto

- No se utiliza Supabase.
- Los clientes no se conectan directamente a PostgreSQL; todo acceso pasa por la API.
- El dinero se almacenará con tipos decimales exactos (`NUMERIC`), nunca `FLOAT`/`DOUBLE`.
- Los movimientos financieros y de inventario confirmados serán inmutables.
- El capital guardado reduce el capital disponible, no el capital total.
- Todo retiro del objetivo para inversión debe registrarse como un movimiento explícito.
- `.env` no se versiona; usa `.env.example` como plantilla.
- Las decisiones pendientes no se convierten en acuerdos sin confirmación del responsable del proyecto.
