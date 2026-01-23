# Prompt: Análisis Profundo del Sistema de Devoluciones (Admin y Cliente)

## Contexto

Eres un desarrollador senior con más de 10 años de experiencia especializado en sistemas e-commerce, arquitectura de software, y experiencia de usuario. Tu misión es realizar un análisis exhaustivo del módulo de **DEVOLUCIONES** tanto desde la perspectiva del **ADMINISTRADOR** como del **CLIENTE** en el proyecto FashionStore.

## Objetivos del Análisis

### 1. Análisis Técnico y de Arquitectura

Evalúa los siguientes aspectos con ojo crítico de arquitecto de software:

#### A. Coherencia con Base de Datos

- **Esquema de datos**: Analiza las tablas relacionadas con devoluciones (`returns`, `return_items`, `order_items`, `orders`, etc.)
- **Integridad referencial**: Verifica que todas las relaciones entre tablas estén correctamente definidas con foreign keys
- **Tipos de datos**: Confirma que los tipos de datos sean apropiados para cada campo
- **Índices**: Evalúa si existen índices necesarios para optimizar consultas frecuentes
- **Constraints**: Verifica restricciones, checks, y validaciones a nivel de base de datos
- **Estados y transiciones**: Analiza si los estados de devolución (`pending`, `approved`, `rejected`, `processing`, `completed`) están bien modelados
- **Triggers y funciones**: Revisa si existen triggers o funciones SQL relacionadas con el flujo de devoluciones

#### B. Lógica de Negocio y Flujo del Sistema

Examina el flujo completo de una devolución:

**Desde la perspectiva del CLIENTE:**

1. ¿Cómo solicita una devolución? (UI/UX del proceso)
2. ¿Qué validaciones existen antes de permitir solicitar una devolución?
3. ¿Puede ver el estado de sus devoluciones en tiempo real?
4. ¿Recibe notificaciones sobre cambios en el estado?
5. ¿Puede cancelar una solicitud de devolución?
6. ¿Puede adjuntar evidencia (fotos, comentarios)?

**Desde la perspectiva del ADMINISTRADOR:**

1. ¿Cómo visualiza las solicitudes de devolución?
2. ¿Qué acciones puede realizar? (aprobar, rechazar, procesar, completar)
3. ¿Existen validaciones de negocio? (ej: tiempo límite para devoluciones, estado del pedido)
4. ¿Cómo se gestiona el inventario al aprobar una devolución?
5. ¿Cómo se gestiona el reembolso? (integración con Stripe)
6. ¿Puede comunicarse con el cliente desde el panel?

**Flujo de datos completo:**

- Mapea el flujo desde la solicitud inicial hasta la finalización
- Identifica todos los puntos de validación
- Detecta posibles estados inconsistentes o "estados zombies"
- Verifica que no existan condiciones de carrera (race conditions)

#### C. Integración con Otros Módulos

Analiza cómo el módulo de devoluciones se integra con:

- **Módulo de Pedidos**: ¿Se actualiza correctamente el estado del pedido?
- **Módulo de Inventario**: ¿Se restaura el stock al aprobar una devolución?
- **Módulo de Pagos (Stripe)**: ¿Está implementado el reembolso automático?
- **Módulo de Notificaciones**: ¿Se envían emails/notificaciones en cada cambio de estado?
- **Módulo de Usuarios**: ¿Se registra el historial de devoluciones del cliente?
- **Sistema de Cupones**: ¿Qué pasa con cupones usados en pedidos devueltos?

#### D. Seguridad y Permisos (RLS - Row Level Security)

- **Políticas RLS**: Verifica que las políticas de Supabase estén correctamente configuradas
- **Autorización**: ¿Puede un cliente ver/modificar devoluciones de otros clientes?
- **Roles**: ¿Están bien definidos los permisos de admin vs cliente?
- **Validación de datos**: ¿Se validan los datos tanto en frontend como backend?
- **Inyección SQL**: ¿Existen vulnerabilidades en las consultas?

### 2. Análisis de Código

#### A. Frontend (React/TypeScript)

Examina los componentes relacionados con devoluciones:

**Componentes del Cliente:**

- Formulario de solicitud de devolución
- Lista de devoluciones del usuario
- Detalle de devolución individual
- Estados de carga y error

**Componentes del Admin:**

- Tabla/lista de todas las devoluciones
- Filtros y búsqueda
- Acciones de gestión (aprobar/rechazar/procesar)
- Dashboard de estadísticas de devoluciones

**Aspectos a evaluar:**

- ¿Hay duplicación de código?
- ¿Se siguen principios SOLID?
- ¿Hay separación de responsabilidades?
- ¿Se usan hooks personalizados apropiadamente?
- ¿Hay manejo adecuado de estados asíncronos?
- ¿Se implementa optimistic UI donde corresponde?

#### B. Backend (Supabase Edge Functions / API)

Analiza las funciones serverless:

- **Endpoints**: ¿Están bien estructurados los endpoints?
- **Validación**: ¿Se validan los datos de entrada?
- **Manejo de errores**: ¿Hay try-catch apropiados y mensajes de error claros?
- **Transacciones**: ¿Se usan transacciones para operaciones críticas?
- **Idempotencia**: ¿Las operaciones son idempotentes cuando es necesario?

#### C. Modelos de Datos (TypeScript/Freezed para Flutter)

- ¿Los modelos reflejan exactamente el esquema de base de datos?
- ¿Hay campos calculados o derivados bien implementados?
- ¿Se usan tipos apropiados (enums para estados, etc.)?
- ¿Hay serialización/deserialización correcta?

### 3. Análisis de Experiencia de Usuario (UX)

#### A. Para Usuarios NO Técnicos (Clientes)

Evalúa la facilidad de uso desde la perspectiva de un usuario común:

**Claridad:**

- ¿Es obvio cómo solicitar una devolución?
- ¿Los mensajes de estado son claros y comprensibles?
- ¿Se explican los tiempos de procesamiento?
- ¿Hay ayuda contextual o tooltips?

**Simplicidad:**

- ¿Cuántos pasos requiere solicitar una devolución?
- ¿Se pueden reducir los campos del formulario?
- ¿Hay valores por defecto inteligentes?
- ¿El proceso es mobile-friendly?

**Feedback:**

- ¿Hay confirmaciones visuales de acciones?
- ¿Se muestran estados de carga?
- ¿Los errores son comprensibles y accionables?
- ¿Hay notificaciones push/email en cada etapa?

**Transparencia:**

- ¿Puede el cliente ver el progreso de su devolución?
- ¿Se explican los motivos de rechazo?
- ¿Hay estimaciones de tiempo de reembolso?

#### B. Para Usuarios NO Técnicos (Administradores)

Evalúa la eficiencia del panel de administración:

**Eficiencia:**

- ¿Puede procesar devoluciones rápidamente?
- ¿Hay acciones en lote?
- ¿Existen atajos de teclado?
- ¿Hay filtros y búsqueda efectivos?

**Información:**

- ¿Se muestra toda la información necesaria de un vistazo?
- ¿Hay contexto suficiente para tomar decisiones?
- ¿Se puede ver el historial del pedido original?
- ¿Hay métricas y estadísticas útiles?

**Prevención de errores:**

- ¿Hay confirmaciones para acciones destructivas?
- ¿Se previenen acciones inválidas (ej: aprobar una devolución ya procesada)?
- ¿Hay validaciones antes de enviar?

### 4. Identificación de Errores e Inconsistencias

Busca específicamente:

#### Errores Críticos

- [ ] Estados inconsistentes en la base de datos
- [ ] Falta de transacciones en operaciones críticas
- [ ] Vulnerabilidades de seguridad (RLS mal configurado)
- [ ] Pérdida de datos en el flujo
- [ ] Condiciones de carrera
- [ ] Falta de validación de datos

#### Errores de Lógica

- [ ] Flujos incompletos (estados sin transiciones)
- [ ] Validaciones faltantes o incorrectas
- [ ] Cálculos erróneos (montos de reembolso)
- [ ] Manejo inadecuado de casos edge
- [ ] Falta de rollback en errores

#### Inconsistencias

- [ ] Nomenclatura inconsistente (campos, variables, funciones)
- [ ] Tipos de datos que no coinciden entre frontend y backend
- [ ] Estados duplicados o redundantes
- [ ] Lógica duplicada en múltiples lugares
- [ ] Comentarios desactualizados o código muerto

#### Problemas de UX

- [ ] Mensajes de error genéricos o técnicos
- [ ] Falta de feedback visual
- [ ] Procesos demasiado largos o complejos
- [ ] Información importante oculta o difícil de encontrar
- [ ] Diseño no responsive

### 5. Propuestas de Mejora

Para cada problema identificado, proporciona:

#### A. Mejoras Técnicas

- **Refactorización**: Código que debe ser refactorizado
- **Optimización**: Consultas SQL que pueden optimizarse
- **Arquitectura**: Cambios arquitectónicos recomendados
- **Seguridad**: Mejoras de seguridad necesarias
- **Testing**: Áreas que requieren más cobertura de tests

#### B. Mejoras de UX

- **Simplificación**: Cómo reducir la complejidad del proceso
- **Claridad**: Mejoras en mensajes, labels, y ayuda contextual
- **Automatización**: Procesos que pueden automatizarse
- **Personalización**: Experiencias adaptadas al contexto del usuario
- **Accesibilidad**: Mejoras para usuarios con discapacidades

#### C. Nuevas Funcionalidades

Sugiere funcionalidades que mejorarían el sistema:

- Devoluciones parciales (solo algunos items del pedido)
- Motivos de devolución predefinidos con lógica específica
- Chat en vivo entre admin y cliente
- Generación automática de etiquetas de envío
- Integración con servicios de mensajería
- Sistema de crédito en tienda vs reembolso monetario
- Historial de devoluciones del cliente para detección de fraude

## Formato de Entrega

Estructura tu análisis en los siguientes documentos markdown:

### 1. `returns_audit_report.md`

Reporte principal con:

- Resumen ejecutivo
- Hallazgos críticos
- Matriz de riesgo (impacto vs probabilidad)
- Recomendaciones priorizadas

### 2. `returns_technical_analysis.md`

Análisis técnico detallado:

- Diagrama del esquema de base de datos actual
- Diagrama de flujo del proceso de devoluciones
- Análisis de código (con snippets específicos)
- Problemas de integración identificados
- Propuestas técnicas de solución

### 3. `returns_ux_analysis.md`

Análisis de experiencia de usuario:

- Journey map del cliente (solicitud de devolución)
- Journey map del administrador (gestión de devoluciones)
- Pain points identificados
- Wireframes o mockups de mejoras propuestas
- Comparación con mejores prácticas del mercado

### 4. `returns_implementation_plan.md`

Plan de implementación estructurado en fases:

**Fase 1 - Crítico (Bugs y Seguridad)**

- Corrección de errores críticos
- Implementación de seguridad faltante
- Tiempo estimado: X días

**Fase 2 - Mejoras de Lógica**

- Refactorización de código
- Optimización de consultas
- Completar flujos incompletos
- Tiempo estimado: X días

**Fase 3 - Mejoras de UX**

- Simplificación de procesos
- Mejora de mensajes y feedback
- Implementación de notificaciones
- Tiempo estimado: X días

**Fase 4 - Nuevas Funcionalidades**

- Features adicionales priorizadas
- Integraciones con servicios externos
- Tiempo estimado: X días

### 5. `returns_database_improvements.sql`

Script SQL con:

- Correcciones al esquema actual
- Nuevos índices recomendados
- Triggers y funciones sugeridas
- Políticas RLS mejoradas

## Criterios de Evaluación

Califica cada aspecto del 1 al 10 y justifica:

- **Coherencia con BD**: \_\_\_/10
- **Lógica de negocio**: \_\_\_/10
- **Integración con módulos**: \_\_\_/10
- **Seguridad**: \_\_\_/10
- **Calidad de código**: \_\_\_/10
- **UX Cliente**: \_\_\_/10
- **UX Admin**: \_\_\_/10
- **Mantenibilidad**: \_\_\_/10
- **Escalabilidad**: \_\_\_/10
- **Documentación**: \_\_\_/10

**Puntuación Total**: \_\_\_/100

## Instrucciones Finales

1. **Sé exhaustivo**: No asumas que algo funciona, verifica cada aspecto
2. **Sé específico**: Cita archivos, líneas de código, y tablas específicas
3. **Sé práctico**: Todas las recomendaciones deben ser implementables
4. **Piensa en el usuario**: Prioriza mejoras que impacten directamente la experiencia
5. **Considera el contexto**: Es un proyecto educativo pero debe seguir estándares profesionales
6. **Documenta con ejemplos**: Incluye ejemplos de código antes/después
7. **Prioriza**: No todo es urgente, clasifica por impacto y esfuerzo

## Archivos Clave a Revisar

### Base de Datos

- `schema.sql` (tablas: `returns`, `return_items`, `orders`, `order_items`)
- Políticas RLS relacionadas con returns
- Funciones y triggers de devoluciones

### Frontend (React/TypeScript)

- Componentes de cliente: `src/components/returns/*` (cliente)
- Componentes de admin: `src/components/admin/returns/*`
- Hooks: `src/hooks/useReturns.ts`, `src/hooks/useReturnManagement.ts`
- Páginas: `src/pages/returns/*`, `src/pages/admin/returns/*`

### Backend

- Edge Functions: `supabase/functions/returns/*`
- Tipos: `src/types/returns.ts`
- Servicios: `src/services/returnService.ts`

### Flutter (si aplica)

- Models: `lib/features/returns/domain/models/*`
- Repositories: `lib/features/returns/data/repositories/*`
- Screens: `lib/features/returns/presentation/screens/*`

---

**¡Comienza tu análisis profundo ahora!** 🔍

Recuerda: Un buen desarrollador senior no solo encuentra problemas, sino que propone soluciones elegantes, mantenibles y centradas en el usuario.
