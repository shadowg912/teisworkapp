# TEIS workapp — Design Language System (DLS)

**Versión:** 0.1  
**Estado:** Borrador inicial  
**Producto:** TEIS workapp  
**Plataformas:** Web y Android  
**Relación documental:** PRD y TAD

---

## 1. Propósito

El Design Language System (DLS) define los principios visuales, componentes, patrones de interacción y reglas de diseño que se utilizarán para construir TEIS workapp.

Su objetivo es garantizar que la aplicación:

- Mantenga una identidad visual coherente.
- Sea fácil de utilizar en computadoras y teléfonos.
- Presente información financiera y operativa con claridad.
- Permita trabajar cómodamente durante sesiones prolongadas.
- Mantenga consistencia entre la aplicación web y Android.
- Pueda ampliarse sin crear estilos y componentes incompatibles.

El DLS será la referencia de diseño para todas las interfaces actuales y futuras.

## 2. Dirección de diseño

### 2.1 Concepto visual

La interfaz combinará:

- Minimalismo tecnológico.
- Diseño editorial.
- Estética moderna y profesional.
- Jerarquía visual clara.
- Uso controlado de contrastes y profundidad.
- Componentes funcionales antes que decorativos.

La aplicación debe transmitir organización, precisión, control y profesionalidad.

No se pretende reproducir una estética cinematográfica de forma literal. La identidad debe adaptarse a una herramienta de gestión empresarial cuyo propósito principal es facilitar operaciones.

### 2.2 Principios de diseño

1. **Claridad:** cada pantalla debe comunicar rápidamente su propósito.
2. **Jerarquía:** la información importante debe destacar sin saturar la interfaz.
3. **Consistencia:** un mismo tipo de acción debe verse y comportarse de manera similar.
4. **Eficiencia:** las operaciones frecuentes deben requerir pocos pasos.
5. **Legibilidad:** los datos deben ser fáciles de consultar y comparar.
6. **Adaptabilidad:** la interfaz debe funcionar en pantallas grandes y pequeñas.
7. **Accesibilidad:** el diseño no debe depender exclusivamente del color o de elementos pequeños.
8. **Funcionalidad:** los efectos visuales nunca deben perjudicar el rendimiento o la usabilidad.

## 3. Sistema de color

### 3.1 Paleta base

Se utilizará como punto de partida la paleta visual definida en el contexto del proyecto.

| Token | Valor | Uso |
|---|---|---|
| `color-brand-950` | `#17151F` | Fondos oscuros principales |
| `color-brand-900` | `#241B38` | Superficies y bloques oscuros |
| `color-brand-800` | `#352451` | Elementos secundarios y profundidad |
| `color-neutral-0` | `#FFFFFF` | Blanco |
| `color-neutral-50` | `#F4F1FA` | Fondos claros y superficies editoriales |

### 3.2 Roles semánticos

Los colores se utilizarán mediante roles, no mediante valores arbitrarios repartidos por los componentes.

| Rol | Aplicación |
|---|---|
| `background` | Fondo general de la aplicación |
| `surface` | Tarjetas, paneles y contenedores |
| `surface-secondary` | Superficies de menor jerarquía |
| `text-primary` | Texto principal |
| `text-secondary` | Información complementaria |
| `text-muted` | Metadatos y texto de baja prioridad |
| `border` | Separadores y límites |
| `brand-primary` | Acciones principales y elementos de identidad |
| `brand-secondary` | Elementos destacados secundarios |
| `focus` | Indicador de foco accesible |

### 3.3 Colores de estado

Se reservarán colores semánticos para comunicar estados:

- Éxito: operaciones completadas y resultados positivos.
- Advertencia: situaciones que requieren atención.
- Error: operaciones fallidas o datos inválidos.
- Información: mensajes neutrales y orientativos.
- Neutral: estados pendientes o sin clasificación.

Los valores HEX definitivos y sus variantes para temas claros y oscuros quedan pendientes de validación.

### 3.4 Reglas

- No utilizar el morado como único indicador de éxito o error.
- Mantener contraste suficiente entre texto y fondo.
- Evitar utilizar demasiados colores de acento en una misma pantalla.
- Mantener consistencia entre estados equivalentes.
- No introducir colores decorativos sin una función definida.

## 4. Tipografía

### 4.1 Objetivos

La tipografía debe facilitar la lectura de tablas, formularios, importes, indicadores y contenido operativo.

Se utilizará una familia sans-serif moderna, con buena legibilidad en escritorio y dispositivos móviles.

**Decidido el 2026-11-18 (DLS-001):** se utilizará **Inter** en su versión variable, autoalojada mediante `@fontsource-variable/inter` para no depender de servicios externos y mantener el funcionamiento offline.

### 4.2 Jerarquía tipográfica

| Token | Uso |
|---|---|
| `text-display` | Indicadores o cifras excepcionales |
| `text-heading-1` | Títulos principales de pantalla |
| `text-heading-2` | Secciones principales |
| `text-heading-3` | Subsecciones y paneles |
| `text-body` | Texto general |
| `text-body-small` | Información complementaria |
| `text-label` | Etiquetas de campos |
| `text-caption` | Metadatos y descripciones breves |
| `text-mono` | Códigos, identificadores y datos técnicos cuando convenga |

Los importes y métricas deben utilizar cifras tabulares cuando la fuente lo permita, para facilitar su comparación visual.

## 5. Espaciado y dimensiones

Se utilizará una escala de espaciado consistente basada en múltiplos de 4 px.

| Token | Valor |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

### Reglas

- Mantener separación suficiente entre secciones.
- Evitar interfaces excesivamente comprimidas.
- Utilizar el mismo espaciado para componentes equivalentes.
- Priorizar la densidad de información en tablas y vistas operativas sin sacrificar legibilidad.
- Adaptar el espaciado a pantallas pequeñas cuando sea necesario.

## 6. Bordes, radios y elevación

### 6.1 Bordes

Los bordes deben ser discretos y utilizarse para delimitar superficies, campos y agrupaciones.

### 6.2 Radios

Se establecerán tokens reutilizables:

- `radius-sm`: elementos compactos.
- `radius-md`: campos y botones.
- `radius-lg`: tarjetas y paneles.
- `radius-xl`: contenedores destacados.

Los valores concretos se definirán durante el sistema visual. Implementación provisional actual: `4 px`, `8 px`, `12 px` y `16 px`.

### 6.3 Elevación

La profundidad visual se utilizará de forma moderada.

- Las superficies principales deben distinguirse del fondo.
- Las ventanas modales y menús flotantes pueden utilizar elevación superior.
- No se utilizarán sombras intensas como recurso decorativo general.
- Los bordes y cambios de superficie serán suficientes en la mayoría de los casos.

## 7. Estructura y navegación

### 7.1 Navegación principal

La aplicación tendrá una estructura que permita acceder a los módulos principales sin perder contexto.

Módulos contemplados:

1. Dashboard.
2. Finanzas.
3. Inventario.
4. Compras y ventas.
5. Capital e inversiones.
6. Experimentos.
7. Proyectos y tareas.
8. Calendario.
9. Gestión de contenido.
10. Archivos y documentos.
11. Proveedores.
12. Analíticas e informes.

La lista representa la visión general del producto. La navegación del MVP incluirá solamente los módulos implementados.

### 7.2 Escritorio

Se priorizará una navegación lateral que permita acceder a los módulos y mantener visible la estructura general.

El área principal estará destinada al contenido de cada pantalla.

### 7.3 Móvil

La navegación se adaptará al espacio disponible.

Podrá utilizar navegación inferior, menú lateral o una combinación de ambos, según la cantidad de módulos disponibles y la frecuencia de uso.

No se intentará reducir literalmente la interfaz de escritorio. Se reorganizarán los elementos para priorizar las tareas móviles.

### 7.4 Encabezados de pantalla

Las pantallas deberán identificar claramente:

- Nombre de la sección.
- Contexto o descripción cuando sea necesaria.
- Acción principal.
- Acciones secundarias disponibles.
- Filtros o controles de consulta cuando correspondan.

## 8. Componentes de interfaz

Los componentes deberán construirse de forma reutilizable y mantener una apariencia y comportamiento consistentes.

### 8.1 Botones

Variantes:

- Primary: acción principal.
- Secondary: acción alternativa.
- Tertiary o ghost: acción de baja prominencia.
- Destructive: acciones que eliminan o revierten información.
- Icon button: acciones representadas mediante iconos.

Estados:

- Normal.
- Hover.
- Focus.
- Pressed.
- Disabled.
- Loading.

Las acciones destructivas deberán comunicar claramente sus consecuencias.

### 8.2 Campos de entrada

Componentes:

- Input de texto.
- Input numérico.
- Campo monetario.
- Selector de fecha.
- Selector de opciones.
- Área de texto.
- Checkbox.
- Radio button.
- Switch.
- Búsqueda.

Cada campo deberá contemplar:

- Etiqueta.
- Valor.
- Placeholder cuando corresponda.
- Estado de foco.
- Estado deshabilitado.
- Error de validación.
- Texto de ayuda cuando sea necesario.

Los formularios deben evitar solicitar información innecesaria.

### 8.3 Tarjetas

Se utilizarán para agrupar información relacionada.

Tipos previstos:

- Tarjeta de resumen.
- Tarjeta de indicador financiero.
- Tarjeta de producto.
- Tarjeta de experimento.
- Tarjeta de actividad.
- Tarjeta de acceso a módulo.

Las tarjetas no deben utilizarse indiscriminadamente cuando una tabla o lista resulte más eficiente.

### 8.4 Tablas y listas

Las tablas serán fundamentales para las operaciones financieras y de inventario.

Deberán permitir, según el módulo:

- Consultar registros.
- Ordenar columnas.
- Filtrar información.
- Buscar registros.
- Consultar detalles.
- Acceder a acciones disponibles.

En móvil, las tablas podrán convertirse en listas o tarjetas compactas.

Los datos importantes no deben desaparecer simplemente porque la pantalla sea más pequeña.

### 8.5 Diálogos y menús

Se utilizarán para acciones contextuales, confirmaciones y formularios breves.

Las ventanas modales deben reservarse para tareas que realmente requieran interrumpir el flujo actual.

Los menús contextuales deben ser breves y mostrar únicamente las acciones pertinentes.

### 8.6 Notificaciones

Se utilizarán mensajes breves para comunicar:

- Operaciones completadas.
- Errores.
- Advertencias.
- Cambios de sincronización.
- Acciones que requieren atención.

Las notificaciones no deben ocultar información importante ni convertirse en interrupciones constantes.

## 9. Patrones de diseño por módulo

### 9.1 Dashboard

Debe priorizar información útil para tomar decisiones.

Elementos posibles:

- Resumen financiero.
- Saldo disponible.
- Ingresos y gastos.
- Estado del inventario.
- Actividad reciente.
- Experimentos activos.
- Tareas pendientes.

No se incluirán indicadores únicamente para llenar espacio. Cada métrica deberá tener una utilidad operativa.

### 9.2 Finanzas

La interfaz deberá priorizar:

- Importes legibles.
- Moneda claramente identificada.
- Cuentas Caja y Banco.
- Diferenciación entre ingresos, gastos, transferencias y movimientos de capital.
- Fechas y categorías.
- Historial de movimientos.
- Filtros y resúmenes.

Los valores negativos y positivos deben distinguirse visualmente, pero nunca depender exclusivamente del color. Las transferencias y el capital guardado no deben presentarse como ingresos o gastos.

### 9.3 Inventario

Debe facilitar la consulta de:

- Productos.
- Variantes.
- Cantidades disponibles.
- Costos.
- Precios.
- Movimientos.
- Alertas de existencias.

Las cantidades y los estados del inventario deben ser visibles sin necesidad de abrir cada producto.

### 9.4 Compras y ventas

Los flujos deben presentar claramente:

- Productos involucrados.
- Cantidades.
- Precios.
- Costos unitarios.
- Subtotales por artículo.
- Totales.
- Estado de la operación.
- Fecha.
- Relación con los movimientos financieros y de inventario.

En las compras, el detalle de los artículos podrá mostrarse de forma expandible para no saturar el listado. Las acciones que confirmen operaciones deberán distinguirse de las acciones de edición.

### 9.5 Experimentos

Cada experimento debe mostrar su estado y facilitar la comparación entre lo esperado y lo obtenido.

La interfaz podrá presentar:

- Hipótesis.
- Capital asignado.
- Costos.
- Precio estimado.
- Resultados reales.
- Periodo de validación.
- Criterios de éxito o fracaso.
- Conclusiones.

### 9.6 Proyectos y tareas

La presentación deberá facilitar la identificación de:

- Prioridad.
- Estado.
- Fecha límite.
- Proyecto asociado.
- Próxima acción.

La interfaz debe favorecer el seguimiento y la ejecución, no añadir complejidad administrativa.

### 9.7 Objetivo de utilidad

La pantalla del objetivo debe priorizar:

- El capital guardado y la meta.
- El porcentaje de avance, sin depender únicamente del color.
- El capital restante.
- Los aportes y los retiros para inversión.
- La diferencia entre capital guardado y capital disponible.

Los retiros para inversión deben mostrarse como movimientos explícitos, con tipo, cuenta, fecha e importe. La pantalla debe indicar que un retiro reduce el capital guardado y que no se considera un gasto.

El progreso se representará con una barra y con el porcentaje en texto. Cuando el objetivo se complete, el estado deberá ser comprensible sin depender solo del color.

## 10. Estados de interfaz

Todas las pantallas que dependan de datos deberán contemplar los estados correspondientes.

### 10.1 Loading

Mostrar que la información está siendo cargada sin bloquear innecesariamente toda la aplicación.

### 10.2 Empty state

Cuando no existan registros, explicar qué representa la ausencia de datos y ofrecer una acción útil cuando corresponda.

### 10.3 Error state

Comunicar el problema de forma comprensible y permitir reintentar cuando sea posible.

### 10.4 Success state

Confirmar que una operación se completó correctamente.

### 10.5 Offline state

La aplicación debe identificar claramente cuándo no existe conexión y diferenciar entre:

- Datos disponibles localmente.
- Operaciones pendientes de sincronización.
- Cambios sincronizados.
- Errores de sincronización.

No se debe presentar una operación como sincronizada si todavía no ha sido confirmada por el servidor.

### 10.6 Disabled state

Los controles deshabilitados deben conservar suficiente legibilidad para que el usuario comprenda que existen, pero no están disponibles en ese momento.

## 11. Diseño offline y sincronización

El funcionamiento offline es una característica central del producto y debe tener representación visual propia.

La interfaz deberá comunicar:

- Estado de conectividad.
- Estado de sincronización.
- Cantidad de operaciones pendientes cuando sea útil.
- Errores que requieren intervención.
- Última sincronización confirmada.

Las operaciones realizadas sin conexión deben seguir siendo comprensibles y consultables desde el dispositivo.

No se utilizarán indicadores ambiguos que confundan almacenamiento local con sincronización remota.

## 12. Diseño adaptable

### 12.1 Principios

- Escritorio: aprovechar el espacio para presentar información relacionada.
- Tablet: reorganizar paneles y navegación.
- Móvil: priorizar las acciones frecuentes y los datos esenciales.
- Evitar desplazamientos horizontales innecesarios.
- Mantener controles táctiles cómodos.
- No ocultar acciones críticas en pantallas pequeñas.

### 12.2 Breakpoints

Los puntos de adaptación se definirán durante la implementación según el comportamiento real de los componentes. Implementación provisional actual: `767 px` para tablas y métricas, `899 px` para la navegación y `1023 px` para los paneles del dashboard.

No se asumirá que todos los dispositivos corresponden a una única resolución fija.

## 13. Iconografía

Se utilizará un sistema de iconos coherente.

Reglas:

- Mantener un estilo visual uniforme.
- Preferir iconos reconocibles.
- No utilizar iconos ambiguos para acciones importantes.
- Acompañar con texto las acciones que no sean universalmente reconocibles.
- Mantener tamaños y alineaciones consistentes.

Los iconos deben mejorar la comprensión, no sustituir etiquetas necesarias.

## 14. Gráficos y visualización de datos

Los gráficos se utilizarán cuando ayuden a identificar tendencias, comparar resultados o comprender el estado de una operación.

Tipos previstos:

- Gráficos de líneas.
- Gráficos de barras.
- Distribuciones porcentuales.
- Indicadores de progreso.
- Comparaciones entre periodos.

Reglas:

- Mostrar unidades y periodos.
- Evitar gráficos sin contexto.
- No distorsionar escalas.
- Mantener consistencia de colores entre categorías.
- Proporcionar alternativas textuales o tabulares cuando sea necesario.
- Diferenciar valores estimados de valores reales.

## 15. Accesibilidad

El sistema deberá contemplar:

- Contraste suficiente.
- Navegación mediante teclado en web.
- Indicadores visibles de foco.
- Etiquetas accesibles para controles.
- Tamaños táctiles adecuados.
- Jerarquía semántica de encabezados.
- Mensajes de error comprensibles.
- Información que no dependa exclusivamente del color.
- Compatibilidad razonable con lectores de pantalla.

La accesibilidad se considerará desde la construcción de los componentes, no como una corrección posterior.

## 16. Movimiento y animaciones

Las animaciones serán discretas y funcionales.

Usos permitidos:

- Transiciones entre estados.
- Apertura y cierre de menús.
- Confirmaciones visuales.
- Indicadores de carga.
- Cambios de selección.

Se evitarán animaciones prolongadas, excesivas o que retrasen operaciones frecuentes.

Se respetarán las preferencias del sistema para reducir movimiento cuando sea posible.

## 17. Temas visuales

**Decidido el 2026-11-18 (DLS-002 y DLS-003):** la aplicación utilizará **tema oscuro como predeterminado** y ofrecerá **tema claro con selección manual**. La preferencia se conserva en el dispositivo. En esta etapa no se seguirá automáticamente el tema del sistema operativo.

La arquitectura visual implementa ambos temas mediante tokens, sin duplicar los componentes.

## 18. Organización del sistema de diseño

Se propone organizar los recursos de diseño y componentes por niveles:

### Foundations

- Colores.
- Tipografía.
- Espaciado.
- Bordes.
- Radios.
- Elevación.
- Iconografía.
- Breakpoints.

### Components

- Botones.
- Inputs.
- Selectores.
- Tarjetas.
- Tablas.
- Listas.
- Diálogos.
- Menús.
- Notificaciones.
- Indicadores.

### Patterns

- Formularios.
- Navegación.
- Filtros.
- Búsquedas.
- Confirmaciones.
- Flujos de compra y venta.
- Registro financiero.
- Gestión de inventario.
- Sincronización offline.

### Templates

- Dashboard.
- Listado.
- Detalle.
- Formulario.
- Historial.
- Informe.

Esta organización permitirá reutilizar componentes y mantener el diseño consistente a medida que se incorporen módulos.

## 19. Relación con la arquitectura técnica

El DLS deberá implementarse de forma compatible con el TAD.

Se propone:

- React y TypeScript para la interfaz.
- Componentes reutilizables.
- Tokens de diseño centralizados.
- Estilos compartidos entre las vistas web y Android cuando sea viable.
- Adaptaciones específicas para interacción táctil.
- Evitar duplicar componentes por plataforma sin necesidad.

La implementación concreta de los tokens y componentes se definirá en la arquitectura del frontend.

## 20. Criterios de aceptación

El sistema de diseño se considerará suficientemente establecido cuando:

1. Exista una paleta organizada mediante roles semánticos.
2. La tipografía y el espaciado estén definidos.
3. Los componentes principales tengan variantes y estados.
4. La navegación sea coherente entre módulos.
5. Las interfaces se adapten a escritorio y móvil.
6. Los estados offline y de sincronización sean comprensibles.
7. Los formularios y tablas mantengan patrones consistentes.
8. Se contemplen criterios básicos de accesibilidad.
9. Los componentes puedan reutilizarse sin estilos contradictorios.
10. El sistema permita incorporar nuevos módulos sin rediseñar la base visual.

## 21. Decisiones pendientes

Las siguientes decisiones deberán resolverse progresivamente:

| ID | Decisión | Estado |
|---|---|---|
| DLS-001 | Familia tipográfica definitiva | Decidida: Inter |
| DLS-002 | Tema predeterminado: oscuro o claro | Decidida: oscuro |
| DLS-003 | Soporte de tema claro y oscuro | Decidida: ambos, selección manual |
| DLS-004 | Valores definitivos de colores semánticos | Pendiente |
| DLS-005 | Radios y elevaciones definitivos | Pendiente |
| DLS-006 | Breakpoints de diseño adaptable | Pendiente |
| DLS-007 | Navegación principal en Android | Pendiente |
| DLS-008 | Biblioteca de iconos | Pendiente |
| DLS-009 | Densidad visual de tablas y listados | Pendiente |
| DLS-010 | Librería de componentes y estrategia de estilos | Decidida: CSS variables + CSS Modules |

Las decisiones pendientes ya cuentan con una implementación provisional documentada en `docs/decisions.md`. No deben considerarse valores definitivos.

Estas decisiones no deben bloquear la definición inicial de componentes ni la construcción de las primeras pantallas. Se podrán validar durante la implementación.

## 22. Agente de decisiones de diseño

El agente de IA del proyecto podrá ayudar a mantener actualizado el DLS.

Sus responsabilidades serán:

- Identificar decisiones visuales pendientes.
- Preguntar cuando una decisión sea necesaria.
- Registrar las respuestas confirmadas.
- Actualizar el estado de cada decisión.
- Identificar qué componentes o pantallas se ven afectados.
- Detectar contradicciones entre el DLS, el PRD y el TAD.
- Proponer ajustes cuando aparezcan nuevas necesidades.

El agente no deberá convertir automáticamente sus propias sugerencias en decisiones aprobadas.

Cuando una modificación afecte una regla ya establecida, deberá solicitar confirmación antes de reemplazarla.

## 23. Estado del documento

**Estado:** borrador inicial.

**Definido:**
- Dirección visual general.
- Paleta base provisional.
- Principios de diseño.
- Estructura conceptual de componentes.
- Patrones generales de interfaz.
- Requisitos de diseño adaptable y offline.
- Tipografía base (Inter) y estrategia de estilos (CSS variables + CSS Modules).
- Tema oscuro predeterminado con tema claro manual.

**Pendiente:**
- Valores visuales definitivos (colores semánticos, radios, elevación).
- Breakpoints definitivos.
- Biblioteca de iconos.
- Densidad definitiva de tablas y listados.
- Detalles de implementación restantes.

El DLS evolucionará junto con el producto. Su propósito es establecer una base coherente y útil, no imponer decisiones visuales innecesarias antes de que exista una necesidad real.