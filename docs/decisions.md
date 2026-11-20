# Registro de decisiones — TEIS workapp

**Última actualización:** 2026-11-19
**Autoridad:** el responsable del proyecto.

Este registro separa las decisiones de los documentos que las describen (PRD, TAD y DLS). Una decisión solo pasa a **Decidida** cuando el responsable la confirma. Las propuestas de implementación no son decisiones aprobadas.

Estados: `Pendiente`, `En consulta`, `Decidida`, `En revisión`, `Descartada`.

## Decisiones confirmadas

| ID | Decisión | Respuesta | Fecha | Documentos afectados |
|---|---|---|---|---|
| TAD-FE-01 | Stack del frontend | React 19, TypeScript, Vite 8, Ionic 9 y Capacitor 8 | 2026-11-18 | TAD §3.1 |
| DLS-001 | Familia tipográfica | Inter variable, autoalojada con `@fontsource-variable/inter` | 2026-11-18 | DLS §4.1, §21 |
| DLS-002 | Tema predeterminado | Oscuro | 2026-11-18 | DLS §17, §21 |
| DLS-003 | Soporte de temas | Claro y oscuro con selección manual y persistencia local; sin seguimiento automático del sistema | 2026-11-18 | DLS §17, §21 |
| DLS-010 | Estrategia de estilos | Variables CSS + CSS Modules; tokens en `src/shared/styles/tokens.css` | 2026-11-18 | DLS §21 |
| PRD-02 | Cuentas y capital | Dos cuentas fijas: **Caja** y **Banco**. El capital guardado reduce el capital disponible, no el capital total. | 2026-11-19 | PRD §7.2, §7.5, §8.2; TAD §6.8 |
| PRD-03 | Tipos de movimientos financieros | Aporte de capital, ingreso, gasto, transferencia Caja↔Banco, capital guardado, retiro para inversión y corrección | 2026-11-19 | PRD §7.2; TAD §6.8 |
| PRD-13 | Objetivo de utilidad | Una sola meta activa; el avance se mide por capital guardado. Los retiros para inversión se registran explícitamente y no se consideran gasto. | 2026-11-19 | PRD §7.5; TAD §6.8; DLS §9.7 |

Estas decisiones se registraron a partir de las respuestas del responsable al cuestionario de inicio del desarrollo.

## Decisiones de diseño pendientes

| ID | Decisión | Estado | Implementación provisional actual |
|---|---|---|---|
| DLS-004 | Valores definitivos de colores semánticos | Pendiente | Valores en `tokens.css` marcados como provisionales |
| DLS-005 | Radios y elevaciones definitivos | Pendiente | Radios 4 / 8 / 12 / 16 px |
| DLS-006 | Breakpoints | Pendiente | 767 px (tablas y métricas), 899 px (navegación), 1023 px (paneles) |
| DLS-007 | Navegación principal en Android | Pendiente | Cajón lateral con barra superior |
| DLS-008 | Biblioteca de iconos | Pendiente | Ionicons, incluido con Ionic |
| DLS-009 | Densidad de tablas y listados | Pendiente | Celdas con 16 px de espaciado |

## Decisiones técnicas confirmadas

| ID | Decisión | Respuesta | Fecha | Documentos afectados |
|---|---|---|---|---|
| TAD-01 | Motor de sincronización | PowerSync | 2026-11-20 | TAD §3.5 |
| TAD-03 | Identificadores | UUIDv4 | 2026-11-20 | TAD §6.1 |
| TAD-04 | Framework del backend | Fastify | 2026-11-20 | TAD §3.2, §5 |
| TAD-06 | Cifrado y protección local | Cifrador local aprobado | 2026-11-20 | TAD §3.4 |
| TAD-07 | Autenticación y sesiones | Autenticación de sesiones aprobada | 2026-11-20 | TAD §3.2, §5.1 |

## Decisiones técnicas pendientes

| ID | Decisión | Estado | Notas |
|---|---|---|---|
| TAD-02 | SQLite en web | Pendiente | Requiere validar opción WASM. Hoy se usa `localStorage` provisional |
| TAD-05 | ORM | Pendiente | Drizzle es candidato. Hoy las migraciones son SQL directo |
| TAD-08 | Almacenamiento de archivos | Pendiente | |
| TAD-09 | Reglas de conflicto offline | Pendiente | Bloquea ventas offline |
| TAD-10 | Agente de IA | Pendiente | Proveedor e integración |
| TAD-11 | Respaldos y restauración | Pendiente | Frecuencia y retención |

### Implementación actual y decisiones pendientes

| Tema | Implementación actual | Estado | Decisión pendiente |
|---|---|---|---|
| Persistencia local | `localStorage` + outbox en `src/services/local/` | Vigente | TAD-02 |
| Sincronización | Cola local; PowerSync aprobado, pendiente de integración | En camino | TAD-01 |
| Backend/API | Esqueleto Fastify en preparación | En camino | — |
| ORM | SQL directo en `db/migrations/` | Vigente | TAD-05 |
| Identificadores | UUIDv4 con `crypto.randomUUID()` y `gen_random_uuid()` | Confirmado | — |
| Cifrado local | Aprobado, pendiente de implementación | En camino | — |
| Autenticación y sesiones | Aprobado, pendiente de implementación | En camino | — |
| Validación de saldos | Solo se impide retirar más capital guardado del disponible; el saldo por cuenta no se valida | Vigente | PRD-04 / reglas de saldos |

## Decisiones de producto pendientes (PRD §14)

| ID | Decisión |
|---|---|
| PRD-01 | Contenido exacto del dashboard |
| PRD-04 | Devoluciones, cancelaciones y correcciones |
| PRD-05 | Variantes de productos |
| PRD-06 | Uso de más de un almacén o ubicación |
| PRD-07 | Monedas admitidas inicialmente |
| PRD-08 | Datos de proveedores y clientes |
| PRD-09 | Operaciones disponibles offline |
| PRD-10 | Indicadores prioritarios |
| PRD-11 | Alcance concreto de la primera entrega |
| PRD-12 | Mecanismos de exportación |

## Orden de resolución recomendado

1. **PRD-04:** define cómo corregir, devolver o cancelar operaciones confirmadas.
2. **TAD-09:** reglas de conflicto y validación de existencias antes de ventas offline.
3. **TAD-01, TAD-02, TAD-06 y TAD-07:** persistencia local, sincronización, cifrado y autenticación.
4. **PRD-05, PRD-06 y PRD-07:** modelo de inventario y monedas.
5. **DLS-004 a DLS-009:** pueden resolverse durante la evolución visual, sin bloquear los módulos.

No todas las decisiones deben responderse a la vez. Se preguntarán cuando la tarea en curso las necesite.
