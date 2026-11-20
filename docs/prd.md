# TEIS workapp
## Product Requirements Document (PRD)

**Versión:** 0.1  
**Estado:** Borrador inicial  
**Tipo de producto:** Aplicación interna de gestión empresarial y financiera  
**Plataformas objetivo:** Web y Android  
**Nombre interno:** TEIS workapp

---

# 1. Visión del producto

TEIS workapp es una aplicación de gestión diseñada para centralizar, organizar y analizar las operaciones empresariales, financieras y experimentales del proyecto TEIS.

Su propósito es proporcionar una herramienta propia que permita administrar los recursos disponibles, controlar el movimiento del dinero, gestionar inventarios, registrar operaciones comerciales y evaluar oportunidades de negocio.

La aplicación debe facilitar la toma de decisiones mediante información organizada, registros confiables y datos que representen las operaciones reales.

No se desarrollará inicialmente como un producto comercial para terceros. Su primera finalidad será satisfacer las necesidades internas del proyecto.

# 2. Problema que busca resolver

Las operaciones comerciales y financieras generan información que, si se mantiene dispersa, dificulta el control y el análisis.

TEIS workapp busca resolver los siguientes problemas:

- Falta de centralización de la información empresarial.
- Dificultad para conocer el estado real del capital disponible.
- Falta de seguimiento estructurado de compras y ventas.
- Dificultad para controlar existencias y movimientos de inventario.
- Falta de trazabilidad sobre los resultados de cada experimento comercial.
- Dificultad para consultar el historial de operaciones.
- Dependencia de herramientas externas o registros manuales dispersos.
- Falta de acceso a la información cuando no existe conexión a Internet.

# 3. Objetivos del producto

## 3.1 Objetivos principales

1. Centralizar la información operativa y financiera.
2. Mantener un registro confiable de ingresos, gastos y movimientos de capital.
3. Controlar las compras, ventas y existencias.
4. Facilitar el seguimiento de experimentos comerciales.
5. Proporcionar indicadores que permitan evaluar el rendimiento de las operaciones.
6. Permitir trabajar sin conexión a Internet.
7. Sincronizar la información entre los dispositivos autorizados.
8. Facilitar la consulta del historial y la evolución del proyecto.

## 3.2 Objetivos secundarios

- Reducir el trabajo administrativo.
- Facilitar la identificación de pérdidas y oportunidades.
- Mejorar la planificación de actividades.
- Mantener organizada la documentación.
- Permitir incorporar nuevos módulos sin tener que reconstruir la aplicación.

# 4. Usuarios objetivo

## 4.1 Usuario inicial

La primera versión estará diseñada para un único usuario principal: el responsable de administrar y ejecutar las operaciones de TEIS.

Sus necesidades incluyen:

- Registrar operaciones rápidamente.
- Consultar información financiera.
- Controlar inventario.
- Gestionar compras y ventas.
- Evaluar experimentos.
- Consultar información desde diferentes dispositivos.

## 4.2 Escalabilidad de usuarios

La arquitectura podrá permitir incorporar más usuarios en el futuro.

Sin embargo, la gestión de equipos, roles, permisos avanzados y colaboración multiusuario no forma parte del alcance confirmado del MVP.

# 5. Plataformas y entorno de uso

La aplicación deberá estar disponible en:

### Aplicación web
- Acceso desde navegadores modernos.
- Interfaz adaptada a computadoras.
- Navegación y distribución apropiadas para pantallas grandes.

### Aplicación Android
- Instalación como aplicación móvil.
- Interfaz adaptada a pantallas táctiles.
- Acceso a las operaciones esenciales sin conexión.
- Persistencia local de la información.

### Adaptabilidad

La interfaz deberá adaptarse al dispositivo utilizado. No se pretende limitar la experiencia móvil a una versión reducida de la interfaz de escritorio.

# 6. Requisito fundamental: funcionamiento offline

El funcionamiento sin conexión es un requisito central del producto.

El usuario deberá poder consultar y registrar información esencial aunque no tenga acceso a Internet.

## 6.1 Comportamiento esperado

- Consultar información previamente disponible en el dispositivo.
- Crear nuevos registros sin conexión.
- Modificar información que admita modificaciones.
- Registrar operaciones comerciales y financieras.
- Mantener los cambios localmente.
- Sincronizar los cambios cuando vuelva la conectividad.

## 6.2 Sincronización

La aplicación deberá mantener la consistencia de la información entre los dispositivos autorizados.

Deberá contemplar:

- Cambios pendientes de sincronización.
- Errores de sincronización.
- Conflictos entre modificaciones.
- Recuperación después de interrupciones.
- Prevención de registros duplicados.
- Identificación del estado de sincronización.

La sincronización no deberá provocar pérdidas silenciosas de información.

# 7. Módulos funcionales

Los siguientes módulos representan la visión funcional general. Su presencia en esta lista no implica que todos deban desarrollarse durante el MVP.

## 7.1 Dashboard

Panel principal para consultar el estado general de las operaciones.

Información prevista:

- Resumen financiero.
- Capital disponible.
- Ingresos y gastos.
- Estado del inventario.
- Compras y ventas recientes.
- Experimentos activos.
- Indicadores relevantes.

El contenido definitivo del dashboard dependerá de los módulos implementados.

## 7.2 Finanzas

Módulo encargado del control financiero.

La operación se organiza en dos cuentas fijas: **Caja** y **Banco**. Los movimientos financieros podrán ser:

- Aporte de capital.
- Ingreso.
- Gasto.
- Transferencia entre Caja y Banco.
- Capital guardado para el objetivo de utilidad.
- Retiro para inversión.
- Corrección.

Las transferencias y los movimientos de capital no se considerarán ingresos ni gastos. Las correcciones se registrarán como movimientos nuevos; un movimiento confirmado no se editará ni eliminará.

Capacidades previstas:

- Registrar los tipos de movimiento anteriores.
- Consultar movimientos financieros y saldos por cuenta.
- Clasificar operaciones.
- Consultar historial.
- Generar resúmenes e informes.

La información financiera deberá reflejar los movimientos reales y evitar confundir ingresos con beneficios. El capital guardado reduce el capital disponible, pero no el capital total.

## 7.3 Inventario

Módulo encargado de administrar los productos y sus existencias.

Capacidades previstas:

- Registrar productos.
- Consultar existencias.
- Registrar entradas.
- Registrar salidas.
- Consultar movimientos.
- Identificar productos con pocas unidades.
- Consultar el historial de inventario.

## 7.4 Compras y ventas

Módulo encargado de registrar las operaciones comerciales.

Compras:
- Registrar adquisiciones.
- Identificar los artículos adquiridos.
- Registrar cantidades y costos unitarios.
- Calcular el subtotal por artículo y el total de la compra.
- Consultar historial de compras.

Ventas:
- Registrar ventas.
- Identificar productos vendidos.
- Registrar cantidades y precios.
- Consultar historial de ventas.
- Consultar resultados de las operaciones.

Las operaciones deberán mantener coherencia con los registros financieros y de inventario. El total de una compra se calculará a partir de sus artículos y no se introducirá de forma independiente.

## 7.5 Capital e inversiones

Módulo destinado al seguimiento del capital y del objetivo de utilidad.

Existirá un único objetivo de utilidad activo. Su avance se medirá por el **capital guardado**, calculado como los aportes menos los retiros para inversión.

Capacidades previstas:

- Consultar capital disponible y capital guardado.
- Registrar aportes de capital.
- Guardar capital para el objetivo.
- Registrar de forma explícita cada retiro para inversión.
- Consultar el historial de aportes y retiros.
- Evaluar la evolución del objetivo.

El capital guardado reduce el capital disponible, pero no el capital total. Un retiro para inversión reduce el capital guardado y no se considera un gasto. No se admitirán retiros sin un movimiento registrado.

La relación exacta entre este módulo y los experimentos comerciales queda pendiente.

## 7.6 Experimentos comerciales

Módulo para planificar y evaluar oportunidades de negocio.

Cada experimento podrá incluir:

- Hipótesis.
- Producto o servicio.
- Cliente objetivo.
- Canal de adquisición.
- Capital requerido.
- Costos estimados.
- Precio de venta estimado.
- Margen esperado.
- Tiempo de validación.
- Criterios de éxito y fracaso.
- Resultados reales.
- Conclusiones y aprendizajes.

El objetivo es comparar las expectativas iniciales con los resultados obtenidos.

## 7.7 Tareas y proyectos

Módulo para organizar actividades y trabajos.

Funciones previstas:

- Crear tareas.
- Organizar proyectos.
- Consultar estados.
- Registrar fechas.
- Dar seguimiento al progreso.

## 7.8 Calendario

Módulo para organizar actividades y fechas importantes.

Su alcance funcional específico queda pendiente.

## 7.9 Gestión de contenido

Módulo para organizar la producción de contenido relacionado con el proyecto.

Podrá contemplar ideas, publicaciones, planificación y seguimiento de contenidos.

## 7.10 Archivos y documentos

Módulo para organizar documentación relevante.

Su alcance inicial y los tipos de archivos admitidos quedan pendientes.

## 7.11 Proveedores

Módulo para mantener información de proveedores y consultar su relación con las operaciones comerciales.

## 7.12 Analíticas e informes

Módulo para consultar información agregada y evaluar resultados.

Se espera que permita analizar información financiera, comercial y operativa.

Los indicadores y formatos específicos se definirán posteriormente.

# 8. Alcance del MVP

El MVP deberá resolver primero las necesidades operativas fundamentales.

## 8.1 Módulos prioritarios

1. Dashboard básico.
2. Finanzas.
3. Inventario.
4. Compras y ventas.
5. Experimentos comerciales.

## 8.2 Capacidades mínimas esperadas

- Crear y consultar productos.
- Registrar compras con el detalle de sus artículos.
- Registrar ventas.
- Mantener las existencias actualizadas.
- Operar con las cuentas Caja y Banco.
- Registrar los tipos de movimientos financieros definidos.
- Consultar movimientos financieros.
- Consultar el capital disponible y el capital guardado.
- Dar seguimiento al objetivo de utilidad y registrar sus retiros.
- Crear y dar seguimiento a experimentos.
- Consultar un resumen de la actividad.
- Trabajar offline con las operaciones esenciales.
- Sincronizar los cambios posteriormente.

## 8.3 Fuera del MVP inicial

Salvo que aparezca una necesidad operativa que justifique adelantar alguna función, quedan fuera del alcance inicial:

- Administración avanzada de equipos.
- Roles y permisos complejos.
- Automatizaciones empresariales avanzadas.
- Integraciones externas no esenciales.
- Analítica avanzada.
- Gestión de contenido completa.
- Calendario avanzado.
- Funcionalidades comerciales para clientes externos.

# 9. Requisitos no funcionales

## 9.1 Rendimiento

La aplicación deberá responder adecuadamente en los dispositivos previstos.

Las operaciones habituales, como consultar productos, registrar movimientos y navegar entre módulos, deberán sentirse ágiles.

Los objetivos cuantitativos de rendimiento se definirán durante el diseño técnico.

## 9.2 Integridad de la información

La aplicación deberá proteger la consistencia de los registros.

Las operaciones relacionadas entre sí deberán mantener coherencia, especialmente:

- Compras e inventario.
- Ventas e inventario.
- Ventas y finanzas.
- Gastos y finanzas.
- Correcciones de operaciones.

## 9.3 Seguridad

La aplicación deberá contemplar:

- Autenticación.
- Protección de sesiones.
- Control de acceso.
- Protección de información almacenada.
- Comunicación segura entre dispositivos y servidor.
- Protección frente a modificaciones no autorizadas.

Los mecanismos específicos se definirán en el documento de arquitectura técnica.

## 9.4 Disponibilidad de datos

Los datos disponibles localmente deberán poder consultarse aunque el dispositivo pierda temporalmente la conexión.

La aplicación deberá contemplar mecanismos de respaldo y recuperación.

## 9.5 Mantenibilidad

El producto deberá organizarse de manera que sea posible corregir errores, incorporar funcionalidades y modificar módulos sin generar dependencias innecesarias.

## 9.6 Usabilidad

La interfaz deberá priorizar:

- Claridad.
- Consistencia.
- Navegación sencilla.
- Formularios comprensibles.
- Jerarquía visual.
- Adaptación a escritorio y móvil.

# 10. Principios de producto

El desarrollo deberá respetar los siguientes principios:

1. **Utilidad antes que complejidad:** cada funcionalidad debe resolver una necesidad real.
2. **Integridad financiera:** los registros deben representar operaciones reales.
3. **Offline-first:** la conexión no debe ser un requisito para las operaciones esenciales.
4. **Trazabilidad:** los movimientos importantes deben conservar su historial.
5. **Modularidad:** cada área funcional debe tener responsabilidades claras.
6. **Escalabilidad razonable:** permitir evolución sin sobreingeniería.
7. **Consistencia:** los módulos deben compartir información correctamente.
8. **Prioridad operativa:** desarrollar la aplicación no debe sustituir la ejecución de las actividades comerciales.

# 11. Indicadores de éxito del producto

El producto se considerará útil cuando permita:

- Consultar el capital disponible y los movimientos financieros.
- Conocer las existencias actuales.
- Registrar compras y ventas sin duplicar operaciones.
- Mantener coherencia entre inventario y finanzas.
- Consultar resultados de experimentos comerciales.
- Realizar operaciones esenciales sin Internet.
- Recuperar y sincronizar los cambios pendientes.
- Reducir la dependencia de registros manuales dispersos.

Los valores cuantitativos de aceptación se establecerán cuando definamos los criterios de prueba.

# 12. Restricciones y consideraciones

- El desarrollo será realizado inicialmente por una sola persona.
- El tiempo disponible de desarrollo es limitado.
- Se priorizará la implementación gradual.
- La aplicación tendrá inicialmente un uso interno.
- No se desarrollarán todos los módulos simultáneamente.
- La solución deberá funcionar en web y Android.
- El funcionamiento offline condicionará las decisiones de diseño y arquitectura.

# 13. Riesgos del producto

| Riesgo | Consideración |
|---|---|
| Exceso de funcionalidades | Puede retrasar la entrega del MVP |
| Sincronización incorrecta | Puede generar pérdida o duplicación de registros |
| Inconsistencia financiera | Puede producir información incorrecta para tomar decisiones |
| Complejidad innecesaria | Puede dificultar el mantenimiento |
| Dependencia de conexión | Contradice el requisito offline |
| Desarrollo sin validación | Puede generar módulos que no resuelvan necesidades reales |

# 14. Decisiones pendientes

Los siguientes puntos necesitan definición antes de considerar cerrado el PRD:

1. **PRD-01** — ¿Qué información exacta debe mostrar el dashboard?
2. **PRD-04** — ¿Cómo se manejarán devoluciones, cancelaciones y correcciones?
3. **PRD-05** — ¿Cómo se organizarán las variantes de productos?
4. **PRD-06** — ¿Se utilizará más de un almacén o ubicación de inventario?
5. **PRD-07** — ¿Qué monedas se admitirán inicialmente?
6. **PRD-08** — ¿Qué datos de proveedores y clientes serán necesarios?
7. **PRD-09** — ¿Qué operaciones podrán ejecutarse offline?
8. **PRD-10** — ¿Qué indicadores serán prioritarios?
9. **PRD-11** — ¿Qué funciones concretas deberán estar disponibles en la primera entrega?
10. **PRD-12** — ¿Qué mecanismos de exportación de información serán necesarios?

Las decisiones **PRD-02** (cuentas y capital), **PRD-03** (tipos de movimientos financieros) y **PRD-13** (objetivo de utilidad) se resolvieron el 2026-11-19. Su detalle queda en `docs/decisions.md`, en las secciones §7.2 y §7.5 de este documento y en el TAD §6.8.

# 15. Relación con los documentos del proyecto

Este PRD define el comportamiento esperado y el alcance funcional de TEIS workapp.

Se complementará con:

- **TAD — Technical Architecture Document:** definirá cómo se implementará el producto.
- **DLS — Design Language System:** definirá el lenguaje visual, los componentes y las reglas de interfaz.

Los tres documentos deberán mantenerse coherentes entre sí.

---

**Estado:** Borrador 0.1  
**Próximo paso:** revisión funcional y definición de las decisiones pendientes.  
**Criterio de cierre:** requisitos del MVP suficientemente claros para comenzar su diseño técnico y visual.
# 16. Agente de IA para seguimiento de decisiones

## 16.1 Objetivo

TEIS workapp contará con un agente de inteligencia artificial encargado de identificar, consultar y dar seguimiento a las decisiones que todavía no se hayan definido durante el desarrollo y la evolución del producto.

Su propósito será evitar que las decisiones pendientes queden olvidadas, desactualizadas o dispersas entre conversaciones y documentos.

## 16.2 Responsabilidades

El agente deberá:

1. Identificar decisiones pendientes en el PRD, TAD, DLS y demás documentación del proyecto.
2. Mantener un registro de las decisiones que todavía no se han tomado.
3. Preguntar progresivamente al usuario sobre esas decisiones.
4. Priorizar las preguntas según su importancia y el momento en que sean necesarias.
5. Registrar las respuestas y decisiones confirmadas.
6. Actualizar el estado de cada decisión.
7. Actualizar los documentos afectados cuando una decisión sea tomada.
8. Identificar contradicciones entre decisiones nuevas y requisitos previamente establecidos.
9. Informar cuando una decisión tenga consecuencias sobre otros módulos o documentos.

## 16.3 Estados de las decisiones

Cada decisión deberá tener uno de los siguientes estados:

- **Pendiente:** todavía no se ha tomado una decisión.
- **En consulta:** el agente ya ha preguntado y espera una respuesta.
- **Decidida:** existe una respuesta confirmada.
- **En revisión:** una decisión anterior está siendo reconsiderada.
- **Descartada:** se determinó que ya no es necesaria.

## 16.4 Comportamiento del agente

El agente no deberá presentar todas las decisiones pendientes simultáneamente.

En su lugar, deberá:

- Formular preguntas de manera progresiva y contextual.
- Evitar interrumpir tareas que no dependan de esa decisión.
- Preguntar cuando una decisión sea necesaria para continuar con una actividad.
- Aprovechar el contexto disponible para no repetir preguntas ya respondidas.
- Explicar brevemente por qué necesita una decisión cuando no resulte evidente.
- Permitir posponer decisiones que no sean prioritarias.

## 16.5 Actualización documental

Cuando el usuario confirme una decisión, el agente deberá:

1. Registrar la decisión y su estado.
2. Identificar los documentos y apartados afectados.
3. Actualizar los requisitos correspondientes.
4. Mantener la coherencia entre PRD, TAD y DLS.
5. Conservar un historial de los cambios importantes.

El agente no deberá convertir una sugerencia propia en una decisión confirmada sin autorización del usuario.

## 16.6 Registro de decisiones

Cada decisión deberá conservar, como mínimo:

- Identificador.
- Descripción.
- Estado.
- Respuesta o decisión confirmada.
- Fecha de actualización.
- Documento o módulo afectado.
- Dependencias relevantes, cuando existan.

## 16.7 Límites

El agente actuará como asistente de seguimiento y documentación, no como autoridad que decide unilateralmente el comportamiento del producto.

Podrá recomendar alternativas y explicar sus consecuencias, pero las decisiones importantes corresponderán al usuario.

La automatización de preguntas y actualizaciones deberá evitar notificaciones excesivas y consultas repetitivas.