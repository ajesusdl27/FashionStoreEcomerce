Actúa como un Desarrollador Senior Full Stack con más de 10 años de experiencia y experto en UX/UI para sistemas de gestión (Admin Panels).

**Objetivo:**
Realizar una "Deep Audit" (Auditoría Profunda) del módulo de **Pedidos ("Orders")** en el panel de administración de FashionStore.
Debes buscar errores, incoherencias, malas prácticas, y evaluar la integración del sistema.
Tu enfoque principal debe ser mejorar la robustez técnica y facilitar la experiencia para un usuario **NO TÉCNICO** (Marketing Managers, Operadores de Logística).

**Archivos Clave a Analizar:**

- `src/pages/admin/pedidos/index.astro`: Listado de pedidos, filtros y paginación.
- `src/pages/admin/pedidos/[id].astro`: Vista de detalle del pedido.
- `src/components/orders/OrderActions.tsx`: Lógica compleja de acciones (Cancelar, Solicitar Devolución, etc.).
- `src/pages/api/admin/pedidos.ts`: Endpoints para actualización de estados y gestión de envíos.
- `src/lib/order-utils.ts`: Utilidades y formateo.

**Puntos de Análisis Requeridos:**

1.  **Calidad de Código y Arquitectura:**
    - Identificar "Magic Strings" (estados hardcodeados como 'pending', 'paid') y proponer constantes unificadas.
    - Revisar el manejo de errores en `OrderActions.tsx` y la API. ¿Se capturan todas las excepciones?
    - Evaluar la seguridad: ¿Se validan correctamente los permisos en la API?

2.  **Funcionalidad e Integración:**
    - Analizar el flujo de estados: Pendiente -> Pagado -> Enviado -> Entregado. ¿Hay bloqueos lógicos?
    - Revisar la integración con el sistema de Devoluciones (`OrderActions` parece manejar esto). ¿Funciona correctamente la lógica de "Ventana de devolución de 30 días"?
    - Verificar la lógica de "Envíos" y notificaciones por email en `pages/api/admin/pedidos.ts`.

3.  **Experiencia de Usuario (UX) - CRÍTICO:**
    - Evaluación visual y funcional para usuarios no técnicos.
    - ¿Los estados de los pedidos usan colores intuitivos (Semáforo)?
    - ¿Las acciones destructivas (Cancelar) tienen confirmaciones claras y amigables?
    - ¿El sistema da feedback visual inmediato (Toasts, Spinners) al realizar una acción?
    - ¿Los mensajes de error son comprensibles (ej: "Error 500" vs "No pudimos guardar los cambios")?

**Entregable:**
Generar un **Plan de Implementación** detallado en el archivo:
`Doc/PlanesDesarrollo/Admin/AdminPedidos/plan_implementacion.md`

El plan debe seguir esta estructura:

1.  **Resumen de la Auditoría**: Estado actual y salud del módulo.
2.  **Lista de Problemas Detectados**: Clasificados por Severidad (Crítico, Importante, Mejora).
3.  **Propuestas de Mejora**:
    - Técnicas (Refactorización, Validaciones).
    - UX/UI (Mejoras visuales, Feedback, Simplificación).
4.  **Plan de Acción por Fases**:
    - Fase 1: Correcciones Críticas (Bugs y Seguridad).
    - Fase 2: Mejoras de UX y Feedback (Modales, Toasts).
    - Fase 3: Optimización y Nuevas Funcionalidades.

**Nota:** Sé extremadamente crítico y detallista. Queremos un sistema a prueba de balas y delicioso de usar.
