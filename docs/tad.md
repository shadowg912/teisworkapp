# TEIS workapp
## Technical Architecture Document (TAD)

**Versión:** 0.1  
**Estado:** Borrador inicial  
**Documento relacionado:** PRD 0.1  
**Arquitectura:** Cliente-servidor, modular y offline-first

---

# 1. Propósito del documento

Este documento define la arquitectura técnica de TEIS workapp.

Establece las tecnologías, componentes, responsabilidades, flujos de información y criterios técnicos necesarios para construir una aplicación web y Android capaz de operar sin conexión y sincronizar información entre dispositivos.

El objetivo es disponer de una arquitectura suficientemente sólida para proteger la integridad de los datos, pero sin introducir complejidad innecesaria para un proyecto desarrollado inicialmente por una sola persona.

# 2. Visión general de la arquitectura

TEIS workapp utilizará una arquitectura cliente-servidor con persistencia local y sincronización centralizada.

Los clientes no accederán directamente a la base de datos PostgreSQL. Las operaciones remotas pasarán por una API que controlará la autenticación, validación y lógica de negocio.

## 2.1 Componentes principales

1. **Cliente web:** interfaz para navegadores.
2. **Cliente Android:** aplicación instalable para dispositivos Android.
3. **Almacenamiento local:** persistencia de datos y operaciones offline.
4. **Motor de sincronización:** transferencia de cambios entre clientes y servidor.
5. **Backend API:** autenticación, validaciones y lógica de negocio.
6. **Base de datos central:** PostgreSQL.
7. **Almacenamiento de archivos:** documentos, imágenes y otros archivos.
8. **Infraestructura de red privada:** acceso remoto seguro mediante Tailscale.

## 2.2 Diagrama conceptual

```text
              TEIS WORKAPP
                    |
          +---------+---------+
          |                   |
       Cliente Web       Cliente Android
          |                   |
       SQLite/WASM       SQLite local
          |                   |
          +---------+---------+
                    |
             Sincronización
                    |
             Backend API
                    |
          +---------+---------+
          |                   |
      PostgreSQL       Almacenamiento
          |              de archivos
          |
       Datos centrales

       Acceso remoto mediante
            Tailscale
```

Este esquema representa la separación lógica de componentes. Los detalles de despliegue se definirán posteriormente.

# 3. Stack tecnológico

## 3.1 Frontend

| Tecnología | Responsabilidad | Estado |
|---|---|---|
| React | Construcción de interfaces | Aprobado |
| TypeScript | Tipado y mantenibilidad | Aprobado |
| Vite | Herramienta de desarrollo y compilación | Aprobado |
| Ionic | Componentes y experiencia multiplataforma | Aprobado |
| Capacitor | Integración con Android | Aprobado |

El stack del frontend fue aprobado el 2026-11-18 para iniciar la base del proyecto. Las decisiones de backend, ORM, almacenamiento local y sincronización continúan pendientes y no deben darse por confirmadas.

Se busca mantener una base de código compartida entre web y Android, permitiendo adaptar la experiencia a cada plataforma.

## 3.2 Backend

| Tecnología | Responsabilidad | Estado |
|---|---|---|
| Node.js | Entorno de ejecución | Propuesto |
| TypeScript | Lenguaje del backend | Propuesto |
| Fastify | Framework HTTP/API | Candidato |
| Drizzle ORM | Acceso y modelado de datos | Candidato |

El backend será responsable de las operaciones que requieren validación centralizada, integridad transaccional o acceso a recursos protegidos.

## 3.3 Base de datos

**PostgreSQL** será la base de datos central.

Se utilizará para almacenar:

- Usuarios y dispositivos.
- Productos y catálogos.
- Compras y ventas.
- Movimientos de inventario.
- Registros financieros.
- Experimentos y proyectos.
- Tareas.
- Metadatos de archivos.
- Estado de sincronización y auditoría.

La base de datos deberá garantizar relaciones, restricciones y transacciones consistentes.

## 3.4 Almacenamiento local

Se utilizará SQLite como base de persistencia local.

La implementación deberá adaptarse a cada plataforma:

- Android: SQLite mediante una integración nativa compatible con Capacitor.
- Web: SQLite mediante una solución compatible con el entorno web, potencialmente WebAssembly.

La tecnología exacta para la implementación web queda pendiente de validación.

## 3.5 Sincronización

PowerSync se considera candidato para gestionar la sincronización entre la base de datos local y PostgreSQL.

Su adopción no está confirmada.

Antes de seleccionarlo deberán validarse:

- Compatibilidad con React e Ionic.
- Compatibilidad con Capacitor y Android.
- Madurez del SDK.
- Soporte de SQLite local.
- Estrategias de resolución de conflictos.
- Seguridad y cifrado.
- Viabilidad de despliegue propio.

El motor de sincronización no sustituirá la lógica de negocio del backend.

# 4. Arquitectura del frontend

## 4.1 Organización

El frontend deberá organizarse por módulos funcionales y componentes compartidos.

Estructura conceptual:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── config/
│
├── modules/
│   ├── dashboard/
│   ├── finance/
│   ├── inventory/
│   ├── purchases/
│   ├── sales/
│   ├── experiments/
│   ├── projects/
│   └── tasks/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── services/
│   ├── api/
│   ├── database/
│   └── sync/
│
└── assets/
```

La estructura es orientativa y podrá ajustarse durante la implementación.

## 4.2 Responsabilidades

El frontend deberá encargarse de:

- Presentar información.
- Capturar las acciones del usuario.
- Validar datos básicos antes de enviarlos.
- Consultar y actualizar la persistencia local.
- Mostrar el estado de sincronización.
- Gestionar navegación y experiencia de usuario.

Las reglas críticas de negocio deberán validarse también en el backend.

# 5. Arquitectura del backend

## 5.1 Responsabilidades

El backend será responsable de:

- Autenticación y autorización.
- Validación de operaciones.
- Ejecución de transacciones.
- Gestión de relaciones entre entidades.
- Control de integridad de datos.
- Procesamiento de operaciones sincronizadas.
- Gestión de archivos.
- Exposición de endpoints para los clientes.

## 5.2 Separación lógica

Se propone organizar el backend en las siguientes capas:

```text
API / Routes
     |
Controllers
     |
Application Services
     |
Domain Logic
     |
Repositories
     |
PostgreSQL
```

La separación deberá facilitar el mantenimiento sin crear capas innecesarias para operaciones sencillas.

## 5.3 Validación centralizada

Las operaciones críticas deberán validarse en el servidor.

Por ejemplo, registrar una venta deberá comprobar:

- Que los productos existen.
- Que las cantidades son válidas.
- Que la operación no fue procesada previamente.
- Que se cumplen las reglas de inventario.
- Que los registros relacionados se guardan correctamente.

# 6. Modelo de datos

## 6.1 Identificadores

Se utilizarán identificadores UUID para las entidades principales.

Se deberá decidir entre UUIDv4 y UUIDv7 antes de establecer la convención definitiva.

Los identificadores globales permitirán crear registros localmente antes de sincronizarlos.

## 6.2 Fechas y horas

Los timestamps centrales se almacenarán en UTC mediante tipos compatibles con `timestamptz`.

La aplicación podrá mostrar las fechas en la zona horaria local del usuario.

La hora del dispositivo no se considerará una fuente autoritativa para ordenar operaciones financieras.

## 6.3 Entidades modificables

Las entidades modificables podrán incluir:

- `id`
- `owner_id`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `version`
- `deleted_at`

Estos campos permitirán identificar registros, gestionar versiones y aplicar borrado lógico cuando corresponda.

## 6.4 Movimientos inmutables

Los movimientos financieros y de inventario deberán conservar su historial.

Una operación confirmada no se modificará ni eliminará directamente.

Cuando sea necesario corregirla, se registrará un movimiento compensatorio o de reversión.

## 6.5 Dinero

Los importes monetarios utilizarán tipos `NUMERIC` en PostgreSQL.

No se utilizarán `FLOAT` ni `DOUBLE PRECISION` para almacenar cantidades monetarias.

Se contempla admitir DOP y USD desde el inicio.

## 6.6 Inventario

Los movimientos de inventario serán la fuente de verdad.

Se podrá mantener una tabla de saldos calculados para facilitar las consultas.

Conceptualmente:

```text
stock_movements
       |
       v
inventory_balances
```

Los saldos deberán poder reconstruirse a partir de los movimientos registrados.

## 6.7 Transacciones

Las operaciones comerciales relacionadas deberán ejecutarse de forma atómica.

Por ejemplo, una venta confirmada deberá registrar dentro de una misma transacción:

- Cabecera de venta.
- Productos vendidos.
- Movimientos de inventario.
- Registros financieros correspondientes.

Si alguna parte falla, la operación completa deberá revertirse.

## 6.8 Objetivo de utilidad y capital guardado

Existirá un único objetivo de utilidad activo. El avance se calcula a partir de movimientos inmutables de dos tipos:

- `contribution`: aporte de capital al objetivo.
- `investment_withdrawal`: retiro explícito para inversión.

Conceptualmente:

```text
goal_entries
     |
     v
saved_capital = aportes - retiros
```

Reglas:

- `saved_capital` no es un gasto ni un ingreso.
- El capital guardado reduce el capital disponible, pero no el capital total.
- Todo retiro para inversión debe registrarse como un movimiento con cuenta, fecha, importe y nota.
- No se admiten retiros sin movimiento registrado.
- El progreso es `saved_capital / target`, limitado al rango de 0 a 100%.
- Los movimientos del objetivo son inmutables; las correcciones se registran con un movimiento compensatorio.

Cuando exista persistencia real, los aportes y retiros del objetivo deberán generar los movimientos financieros correspondientes dentro de la misma transacción. Las reglas de idempotencia y validación de saldos quedan pendientes.

# 7. Sincronización y funcionamiento offline

## 7.1 Principio de funcionamiento

Cada dispositivo tendrá una copia local de los datos necesarios para trabajar.

Las operaciones podrán ejecutarse localmente cuando no exista conexión.

Posteriormente, el motor de sincronización transferirá los cambios al servidor.

## 7.2 Identificación de operaciones

Cada operación sincronizable deberá tener un identificador único.

Se propone utilizar un `operation_id` para evitar que una misma operación se procese más de una vez.

El backend deberá aplicar restricciones de unicidad e idempotencia.

## 7.3 Estrategia de conflictos

No se utilizará una política global de último cambio gana (Last Write Wins).

Se propone:

- Datos maestros: control de versiones y resolución de modificaciones concurrentes.
- Movimientos financieros: registros inmutables y correcciones compensatorias.
- Movimientos de inventario: registros inmutables y validación centralizada.
- Tareas y proyectos: control de versiones y resolución de conflictos según el tipo de dato.

## 7.4 Consistencia del inventario

Existe un riesgo específico cuando dos dispositivos trabajan offline y registran ventas sobre las mismas existencias.

La sincronización por sí sola no garantiza que ambas operaciones sean válidas.

El servidor deberá validar las existencias al procesar las operaciones pendientes.

La política de resolución de estos casos deberá definirse antes de implementar las ventas offline.

## 7.5 Estado de sincronización

La aplicación deberá poder identificar:

- Operaciones pendientes.
- Operaciones sincronizadas.
- Operaciones con errores.
- Conflictos que necesitan intervención.

No se permitirá descartar silenciosamente operaciones pendientes.

# 8. Seguridad

## 8.1 Autenticación

Se propone utilizar:

- Access tokens de corta duración.
- Refresh tokens con rotación.
- Revocación de sesiones y dispositivos.

Los tiempos definitivos deberán establecerse durante la implementación.

## 8.2 Almacenamiento de credenciales

En Android se priorizará el almacenamiento seguro mediante Android Keystore.

En web se preferirán cookies `HttpOnly`, `Secure` y `SameSite` cuando el diseño de autenticación lo permita.

No se deberán almacenar tokens sensibles directamente en `localStorage`.

## 8.3 Red privada

Tailscale se utilizará como capa de conectividad privada entre los dispositivos autorizados y la infraestructura.

No sustituye la autenticación propia de la aplicación.

PostgreSQL no deberá exponerse directamente a Internet ni utilizarse como endpoint de conexión desde los clientes.

## 8.4 Cifrado

El cifrado de datos locales y la protección de información sensible siguen pendientes de definición técnica.

No se deberá considerar resuelto este requisito únicamente por utilizar una red privada o un sistema de autenticación.

# 9. Gestión de archivos

Los archivos binarios se almacenarán fuera de PostgreSQL.

La base de datos conservará sus metadatos y relaciones.

Se propone:

- Almacenamiento inicial en sistema de archivos.
- Una interfaz de abstracción para el almacenamiento.
- Posibilidad futura de utilizar almacenamiento compatible con S3.
- Acceso controlado mediante el backend.
- Validación de archivos durante la carga.

La sincronización gestionará metadatos; el contenido de los archivos se transferirá mediante la API.

Los respaldos de archivos deberán contemplarse por separado de los respaldos de PostgreSQL.

# 10. Infraestructura y despliegue

## 10.1 Contenedores

Se propone Docker Compose para organizar los servicios del backend y la infraestructura.

## 10.2 Componentes de despliegue

- Backend API.
- PostgreSQL.
- Servicio de sincronización, si la solución seleccionada lo requiere.
- Almacenamiento de archivos.
- Servicios auxiliares necesarios.

## 10.3 Acceso

Los dispositivos accederán a la infraestructura a través de la red privada definida para el proyecto.

El diseño deberá permitir una conexión segura y estable sin exponer innecesariamente los servicios internos.

# 11. Copias de seguridad y recuperación

El sistema deberá contemplar:

- Copias de seguridad de PostgreSQL.
- Copias independientes de archivos.
- Almacenamiento de respaldos fuera del servidor principal.
- Procedimientos de restauración.
- Protección de los cambios locales todavía no sincronizados.

Una copia del servidor no sustituye los datos pendientes que solamente existen en un dispositivo.

Los procedimientos y frecuencias definitivos quedan pendientes.

# 12. Agente de IA para seguimiento de decisiones

## 12.1 Objetivo

La aplicación deberá contemplar un agente de IA que mantenga actualizado el registro de decisiones pendientes del proyecto y su documentación técnica y funcional.

## 12.2 Arquitectura funcional

El agente deberá trabajar sobre un registro estructurado de decisiones, separado de los documentos que utiliza como referencia.

Cada decisión podrá contener:

- Identificador.
- Pregunta o descripción.
- Estado.
- Prioridad.
- Respuesta confirmada.
- Fecha de creación y actualización.
- Documentos afectados.
- Dependencias.
- Historial de cambios.

## 12.3 Funciones

El agente podrá:

1. Detectar decisiones pendientes.
2. Formular preguntas al usuario.
3. Priorizar las preguntas según dependencias e importancia.
4. Registrar respuestas confirmadas.
5. Actualizar los estados.
6. Identificar documentos afectados.
7. Proponer cambios documentales.
8. Detectar contradicciones.
9. Solicitar confirmación antes de modificar decisiones ya establecidas.

## 12.4 Separación de responsabilidades

El agente no será responsable de ejecutar directamente operaciones críticas de negocio.

Su función inicial será asistir en la planificación, seguimiento y documentación.

La selección del proveedor de IA, modelo, integración y mecanismos de ejecución queda pendiente.

# 13. Mantenibilidad y evolución

La arquitectura deberá permitir:

- Incorporar módulos funcionales.
- Modificar reglas de negocio.
- Añadir nuevos tipos de entidades.
- Ampliar las capacidades de sincronización.
- Incorporar nuevos dispositivos.
- Sustituir componentes técnicos sin reconstruir toda la aplicación.

Se evitará introducir microservicios o infraestructura distribuida mientras el volumen y las necesidades del proyecto no lo justifiquen.

# 14. Decisiones técnicas pendientes

| Área | Decisión pendiente |
|---|---|
| Sincronización | Confirmar PowerSync u otra alternativa |
| SQLite web | Seleccionar implementación |
| Identificadores | UUIDv4 o UUIDv7 |
| Backend | Confirmar Fastify |
| ORM | Confirmar Drizzle |
| Seguridad local | Definir cifrado y protección |
| Autenticación | Definir estrategia y duración de sesiones |
| Archivos | Definir solución inicial de almacenamiento |
| Conflictos | Cerrar reglas para operaciones offline |
| Agente de IA | Seleccionar proveedor e integración |
| Respaldos | Definir frecuencia, retención y restauración |

# 15. Criterios de aceptación técnica

La arquitectura se considerará suficientemente definida para iniciar la implementación cuando:

1. Se haya validado el stack principal.
2. Se haya establecido la persistencia local en web y Android.
3. Se haya definido el mecanismo de sincronización.
4. Se hayan especificado las reglas de consistencia.
5. Se haya definido la protección de datos sensibles.
6. Se haya establecido el modelo inicial de datos.
7. Se haya definido el flujo de autenticación.
8. Se haya establecido el mecanismo de respaldo y recuperación.

No es necesario resolver anticipadamente todos los detalles de módulos futuros.

---

**Estado:** Borrador 0.1  
**Documento relacionado:** PRD 0.1  
**Siguiente documento:** DLS — Design Language System.