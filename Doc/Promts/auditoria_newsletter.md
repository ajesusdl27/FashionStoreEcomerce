Actúa como un Desarrollador Senior Full Stack con más de 10 años de experiencia y experto en Email Marketing y Sistemas de Gestión.

**Objetivo:**
Realizar una "Deep Audit" (Auditoría Profunda) del módulo de **Newsletter** en el panel de administración de FashionStore.
Debes buscar errores, incoherencias, malas prácticas, vulnerabilidades de SPAM, y evaluar la robustez del sistema de envíos.
Tu enfoque principal debe ser mejorar la fiabilidad técnica (entregabilidad) y facilitar la experiencia para un usuario **NO TÉCNICO** (Marketing Manager).

**Archivos Clave a Analizar:**

- `src/pages/admin/newsletter/index.astro`: Dashboard y listado de campañas.
- `src/pages/admin/newsletter/new.astro`: Interfaz de creación de correos (Editor).
- `src/pages/admin/newsletter/subscribers.astro`: Gestión de suscriptores.
- `src/pages/admin/newsletter/send/[id].astro`: Interfaz de proceso de envío (barra de progreso, logs).
- `src/pages/api/admin/newsletter/campaigns.ts`: CRM de campañas.
- `src/pages/api/admin/newsletter/send-chunk.ts`: Lógica crítica de envío masivo (batching).
- `src/pages/api/newsletter/subscribe.ts`: Endpoint público de suscripción (seguridad y validación).
- `src/components/islands/NewsletterForm.tsx`: Componente de suscripción en el frontend.

**Puntos de Análisis Requeridos:**

1.  **Calidad de Código y Arquitectura:**
    - Identificar lógica de envío frágil. ¿Qué pasa si falla el envío a un lote (chunk)? ¿Hay reintentos?
    - Revisar "Magic Strings" en estados de campaña ('draft', 'sending', 'sent', 'failed').
    - Evaluar la seguridad en `subscribe.ts`: ¿Hay protección contra bots (Rate Limiting/Honeypot)?
    - ¿Cómo se manejan las plantillas de email? ¿Están hardcodeadas o son flexibles?

2.  **Funcionalidad e Integración (Deliverability):**
    - Analizar gestión de **Unsubscribe** (Darse de baja). ¿Es obligatorio y funcional? (CRÍTICO para GDPR).
    - Verificar la lógica de "Chunks" en `send-chunk.ts`. ¿Evita timeouts del servidor?
    - ¿Se validan los emails antes de guardar en base de datos?
    - ¿Existe prevención de duplicados en la lista de suscriptores?

3.  **Experiencia de Usuario (UX) - Admin:**
    - **Editor Supervitaminado**: ¿Es fácil redactar correos? (WYSIWYG vs HTML puro).
    - **Feedback de Envío**: ¿La barra de progreso en `send/[id].astro` es real y precisa?
    - **Gestión de Suscriptores**: ¿Se pueden buscar/filtrar suscriptores o exportar lista a CSV?
    - **Prevención de Errores**: ¿Hay confirmación antes de enviar a TODOS los usuarios?

**Entregable:**
Generar un **Plan de Implementación** detallado en el archivo:
`Doc/PlanesDesarrollo/Admin/AdminNewsletter/plan_implementacion.md`

El plan debe seguir esta estructura:

1.  **Resumen de la Auditoría**: Salud del sistema de envíos y gestión de listas.
2.  **Lista de Problemas Detectados**: Clasificados por Severidad (Crítico - e.j. falta unsubscribe, Importante, Mejora).
3.  **Propuestas de Mejora**:
    - Técnicas (Mejora de Batching, Logs de envío).
    - UX/UI (Editor visual, Feedback de progreso, Dashboard de estadísticas).
4.  **Plan de Acción por Fases**:
    - Fase 1: Correcciones Críticas (Legalidad/GDPR, Robustez de envío).
    - Fase 2: Mejoras de UX (Editor, Gestión de suscriptores).
    - Fase 3: Optimización y Estadísticas (Tasa de apertura, Clics).

**Nota:** En sistemas de newsletter, la confianza y la legalidad son clave. Prioriza que no acabemos en la carpeta de SPAM y que respetemos la privacidad del usuario.
