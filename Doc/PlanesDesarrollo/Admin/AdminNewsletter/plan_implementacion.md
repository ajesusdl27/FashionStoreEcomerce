# 🔍 Deep Audit - Newsletter Module (FashionStore)

**Fecha de Auditoría:** 18 de Enero, 2026  
**Auditor:** Senior Full Stack Developer - Email Marketing Expert  
**Versión:** 2.0 (Actualización Completa)

---

## 📊 Resumen Ejecutivo de la Auditoría

### Estado General del Sistema

| Métrica                   | Valor                          |
| ------------------------- | ------------------------------ |
| **Archivos Analizados**   | 10                             |
| **Problemas Críticos**    | 6                              |
| **Problemas Importantes** | 9                              |
| **Mejoras Sugeridas**     | 8                              |
| **Salud General**         | 🔴 **CRÍTICO - NO PRODUCCIÓN** |

### Evaluación de Componentes

| Componente                  | Estado              | Notas                                              |
| --------------------------- | ------------------- | -------------------------------------------------- |
| Envío de emails             | 🟡 Funcional        | Batching correcto, pero sin reintentos persistidos |
| Gestión suscriptores        | 🟡 Básico           | Sin búsqueda, filtros, paginación ni exportación   |
| Editor de campañas          | 🔴 **Limitado**     | Solo HTML puro, inusable para Marketing Manager    |
| **Cumplimiento GDPR**       | 🔴 **BLOQUEANTE**   | **NO HAY LINK DE UNSUBSCRIBE** - Ilegal            |
| Seguridad anti-spam         | 🔴 **Vulnerable**   | Sin rate limiting ni honeypot                      |
| Dashboard/Stats             | 🟡 Mínimo           | Sin métricas de apertura/clics/bounces             |
| Protección envío duplicado  | 🔴 **Inexistente**  | Posible envío múltiple de misma campaña            |
| Validación de emails        | 🟡 Básica           | Solo comprueba `@`, no valida formato RFC          |

### 🚨 Veredicto

> **El sistema NO está listo para producción.** Existen problemas críticos de legalidad (GDPR) y seguridad que deben resolverse antes de cualquier envío real a suscriptores.

---

## 🔴 Problemas Críticos (Bloquean Producción)

### 1. ❌ GDPR: Falta link de "Darse de Baja" (Unsubscribe)

| Campo            | Detalle                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| **Archivo**      | `src/pages/api/admin/newsletter/send-chunk.ts` (líneas 113-180)             |
| **Severidad**    | 🔴 **BLOQUEANTE LEGAL**                                                     |
| **Problema**     | La plantilla HTML de emails NO incluye ningún enlace funcional para baja    |
| **Impacto**      | Violación GDPR Art. 7.3 + CAN-SPAM Act. Multas hasta 4% facturación anual   |
| **Evidencia**    | Función `generateNewsletterHTML()` no incluye link de unsubscribe en footer |

**Código actual problemático:**
```html
<!-- Footer actual - SIN LINK DE BAJA -->
<p style="...">Recibiste este email porque te suscribiste a nuestra newsletter.</p>
<p style="...">© 2026 FashionStore. Todos los derechos reservados.</p>
```

**Solución requerida:**
1. Crear tabla/campo `unsubscribe_token` único por suscriptor
2. Crear endpoint `/api/newsletter/unsubscribe?token=XXX`
3. Crear página `/newsletter/unsubscribe` para confirmación visual
4. Añadir link en TODOS los emails enviados

---

### 2. ❌ Sin protección contra bots (List Bombing)

| Campo         | Detalle                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| **Archivo**   | `src/pages/api/newsletter/subscribe.ts` + `src/components/islands/NewsletterForm.tsx` |
| **Severidad** | 🔴 **CRÍTICO SEGURIDAD**                                                             |
| **Problema**  | Endpoint público sin rate limiting ni honeypot                                       |
| **Impacto**   | Vulnerable a list bombing, spam masivo, DoS, y contaminación de lista                |

**Código actual vulnerable:**
```typescript
// subscribe.ts - Sin ninguna protección
export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  // Directamente inserta sin validar origen, frecuencia ni honeypot
```

**Ataques posibles:**
- **List Bombing**: Bot añade miles de emails falsos → degrada reputación del dominio
- **Email Harassment**: Suscribir emails de terceros sin consentimiento
- **DoS**: Saturar la base de datos con suscripciones falsas

---

### 3. ❌ Reenvío accidental de campañas (Sin protección de estado)

| Campo         | Detalle                                                              |
| ------------- | -------------------------------------------------------------------- |
| **Archivo**   | `src/pages/admin/newsletter/send/[id].astro`                         |
| **Severidad** | 🔴 **CRÍTICO**                                                       |
| **Problema**  | No valida `campaign.status` antes de permitir envío                  |
| **Impacto**   | Una campaña ya enviada (`sent`) puede reenviarse múltiples veces     |

**Código actual problemático:**
```typescript
// No hay validación de estado al cargar la página
const { data: campaign } = await supabase
  .from("newsletter_campaigns")
  .select("*")
  .eq("id", id)
  .single();
// Debería verificar: if (campaign.status !== 'draft') redirect...
```

---

### 4. ❌ Falta estado "sending" al iniciar (Envío duplicado)

| Campo         | Detalle                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| **Archivo**   | `src/pages/admin/newsletter/send/[id].astro` (script cliente)                    |
| **Severidad** | 🔴 **CRÍTICO**                                                                   |
| **Problema**  | No se marca `status: 'sending'` al iniciar el proceso                            |
| **Impacto**   | Usuario puede abrir otra pestaña e iniciar envío duplicado simultáneo            |

**Flujo actual defectuoso:**
```
Usuario → Click "Comenzar Envío" → Inicia chunks → (otra pestaña) → Click de nuevo → DUPLICADO
```

---

### 5. ❌ No existe estado "failed" en schema

| Campo         | Detalle                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| **Archivo**   | `Doc/migrations/013_create_newsletter_tables.sql`                        |
| **Severidad** | 🔴 **CRÍTICO**                                                           |
| **Problema**  | CHECK constraint: `status IN ('draft', 'sending', 'sent')` - falta `failed` |
| **Impacto**   | Si el envío falla a mitad, la campaña queda en `sending` eternamente     |

---

### 6. ❌ Falta confirmación antes de envío masivo

| Campo         | Detalle                                                                |
| ------------- | ---------------------------------------------------------------------- |
| **Archivo**   | `src/pages/admin/newsletter/send/[id].astro`                           |
| **Severidad** | 🔴 **ALTO**                                                            |
| **Problema**  | Botón "Comenzar Envío" ejecuta inmediatamente sin confirmación         |
| **Impacto**   | Envío accidental de borrador incompleto a toda la lista                |

---

## 🟡 Problemas Importantes (Robustez Técnica)

### 7. Magic Strings para estados de campaña

| Archivos    | `index.astro`, `send-chunk.ts`, `mark-sent.ts`, `send/[id].astro` |
| ----------- | ----------------------------------------------------------------- |
| **Problema** | Estados hardcodeados: `'draft'`, `'sending'`, `'sent'` dispersos  |
| **Solución** | Crear `src/lib/constants/newsletter.ts` con enums/constantes      |

### 8. Plantillas de email duplicadas y hardcodeadas

| Archivos    | `send-chunk.ts`, `subscribe.ts`                             |
| ----------- | ----------------------------------------------------------- |
| **Problema** | ~150 líneas de HTML duplicadas en ambos archivos            |
| **Solución** | Extraer a `src/lib/email-templates/newsletter-templates.ts` |

### 9. Validación de email insuficiente

| Archivo     | `subscribe.ts` línea 10                            |
| ----------- | -------------------------------------------------- |
| **Problema** | Solo verifica `email.includes('@')` - muy básico   |
| **Solución** | Regex RFC 5322 o librería `email-validator`        |

```typescript
// Actual - Insuficiente
if (!email || !email.includes('@')) { ... }

// Requerido - Validación robusta
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !EMAIL_REGEX.test(email)) { ... }
```

### 10. Lógica de reintentos sin límite

| Archivo     | `send/[id].astro` líneas 156-167                                  |
| ----------- | ----------------------------------------------------------------- |
| **Problema** | `while(true)` con retry infinito en cliente                       |
| **Impacto** | Si hay error persistente, bucle infinito                          |
| **Solución** | Máximo 3 reintentos con backoff exponencial (3s, 6s, 12s)         |

### 11. Errores de envío no persistidos

| Archivo     | `send-chunk.ts` líneas 83-87                                |
| ----------- | ----------------------------------------------------------- |
| **Problema** | `console.error()` pero no se guarda en DB                   |
| **Impacto** | Imposible saber qué emails fallaron para reintentar         |
| **Solución** | Crear tabla `newsletter_send_logs`                          |

### 12. Toggle de suscriptor sin feedback

| Archivo     | `subscribers.astro` script cliente                   |
| ----------- | ---------------------------------------------------- |
| **Problema** | Catch silencioso con `console.error`                 |
| **Solución** | Mostrar toast de error al usuario                    |

### 13. No existe página de edición de campañas

| Problema    | No hay `/admin/newsletter/edit/[id].astro`         |
| ----------- | -------------------------------------------------- |
| **Impacto** | Para editar un borrador hay que crear uno nuevo    |
| **Solución** | Crear página reutilizando componentes de `new.astro` |

### 14. Suscriptores sin paginación

| Archivo     | `subscribers.astro`                                       |
| ----------- | --------------------------------------------------------- |
| **Problema** | Carga TODOS los suscriptores en memoria                   |
| **Impacto** | Con miles de registros, la página será muy lenta          |
| **Solución** | Paginación server-side con offset/limit                   |

### 15. Emails de bienvenida también sin link de baja

| Archivo     | `subscribe.ts` función `sendWelcomeEmail()`               |
| ----------- | --------------------------------------------------------- |
| **Problema** | El email de bienvenida tampoco tiene opción de darse baja |
| **Impacto** | Incluso el primer email viola GDPR                        |

---

## 💡 Mejoras de UX para Marketing Manager

### 16. Editor HTML puro (Inutilizable para no-técnicos)

| Archivo     | `new.astro` líneas 47-66                                   |
| ----------- | ---------------------------------------------------------- |
| **Problema** | Solo `<textarea>` con HTML manual                          |
| **Impacto** | Un Marketing Manager no puede crear emails                 |
| **Solución** | Integrar TipTap, Quill, o Unlayer (react-email-editor)     |

### 17. Sin búsqueda/filtros de suscriptores

| Archivo     | `subscribers.astro`                                  |
| ----------- | ---------------------------------------------------- |
| **Problema** | Lista plana sin buscar por email ni filtrar estado   |
| **Solución** | Input de búsqueda + dropdown filtro activo/inactivo  |

### 18. Sin exportación de lista

| Problema    | No hay forma de exportar suscriptores a CSV          |
| ----------- | ---------------------------------------------------- |
| **Solución** | Botón "Exportar CSV" con descarga client-side        |

### 19. Sin preview de email antes de enviar

| Archivo     | `send/[id].astro`                                   |
| ----------- | --------------------------------------------------- |
| **Problema** | Admin no ve cómo queda el email antes de enviar     |
| **Solución** | Iframe con preview del HTML renderizado             |

### 20. Sin envío de prueba

| Problema    | No hay forma de enviar test a un email específico    |
| ----------- | ---------------------------------------------------- |
| **Solución** | Botón "Enviar prueba a mi email" antes de masivo     |

### 21. Sin estadísticas de campañas

| Problema    | No hay tracking de apertura, clics, bounces           |
| ----------- | ----------------------------------------------------- |
| **Solución** | Integrar Resend Analytics o pixel tracking propio     |

---

## 📋 Propuestas de Mejora - Código

### Migración SQL Requerida (Fase 1)

```sql
-- ============================================
-- MIGRATION: 034_newsletter_gdpr_compliance.sql
-- ============================================

-- 1. Añadir estado 'failed' y 'paused' a campañas
ALTER TABLE newsletter_campaigns
  DROP CONSTRAINT IF EXISTS newsletter_campaigns_status_check;

ALTER TABLE newsletter_campaigns
  ADD CONSTRAINT newsletter_campaigns_status_check
  CHECK (status IN ('draft', 'sending', 'sent', 'failed', 'paused'));

-- 2. Añadir token único para unsubscribe (GDPR CRÍTICO)
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- Generar tokens para suscriptores existentes
UPDATE newsletter_subscribers
SET unsubscribe_token = uuid_generate_v4()
WHERE unsubscribe_token IS NULL;

-- 3. Tabla de logs de envío (auditoría y reintentos)
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  subscriber_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para queries frecuentes
CREATE INDEX idx_send_logs_campaign ON newsletter_send_logs(campaign_id);
CREATE INDEX idx_send_logs_status ON newsletter_send_logs(status);
CREATE INDEX idx_send_logs_email ON newsletter_send_logs(subscriber_email);

-- 4. RLS para logs
ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage send logs"
  ON newsletter_send_logs
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- 5. Añadir contador de errores a campaña
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT;
```

### Constantes de Estado (Fase 2)

```typescript
// src/lib/constants/newsletter.ts

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  PAUSED: 'paused',
} as const;

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];

export const SEND_LOG_STATUS = {
  SENT: 'sent',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked',
} as const;

// Configuración de envío
export const NEWSLETTER_CONFIG = {
  CHUNK_SIZE: 5,           // Emails por request
  DELAY_MS: 1000,          // Delay entre emails
  MAX_RETRIES: 3,          // Reintentos máximos
  RETRY_BACKOFF: [3000, 6000, 12000], // Backoff exponencial
} as const;

// Regex validación email (RFC 5322 simplificado)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
```

---

## 🚀 Plan de Acción por Fases

### Fase 1: Correcciones Críticas GDPR/Seguridad (BLOQUEANTE)

> [!CAUTION]
> **Estos cambios son OBLIGATORIOS antes de cualquier envío en producción.**
> Sin el link de unsubscribe estamos en violación directa del GDPR y CAN-SPAM Act.

| #   | Tarea                                       | Archivo(s)                     | Esfuerzo | Estado          |
| --- | ------------------------------------------- | ------------------------------ | -------- | --------------- |
| 1.1 | Crear migración GDPR compliance             | `034_newsletter_gdpr.sql`      | 1h       | ✅ Completado   |
| 1.2 | Crear API `/api/newsletter/unsubscribe`     | `unsubscribe.ts`               | 2h       | ✅ Completado   |
| 1.3 | Crear página `/newsletter/unsubscribe`      | `unsubscribe.astro`            | 1h       | ✅ Completado   |
| 1.4 | Añadir link de baja en template newsletter  | `send-chunk.ts`                | 30min    | ✅ Completado   |
| 1.5 | Añadir link de baja en email de bienvenida  | `subscribe.ts`                 | 30min    | ✅ Completado   |
| 1.6 | Añadir honeypot al formulario               | `NewsletterForm.tsx`           | 1h       | ✅ Completado   |
| 1.7 | Implementar rate limiting por IP            | `subscribe.ts`                 | 1h       | ✅ Completado   |
| 1.8 | Validar estado campaña antes de enviar      | `send/[id].astro`              | 30min    | ✅ Completado   |
| 1.9 | Marcar `sending` al iniciar proceso         | `send/[id].astro`              | 30min    | ✅ Completado   |
| 1.10| Añadir modal de confirmación antes de envío | `send/[id].astro`              | 1h       | ✅ Completado   |

**Archivos creados/modificados:**
- ✅ `Doc/migrations/034_newsletter_gdpr_compliance.sql` - Migración completa
- ✅ `src/lib/constants/newsletter.ts` - Constantes centralizadas
- ✅ `src/pages/api/newsletter/unsubscribe.ts` - API de baja GDPR
- ✅ `src/pages/newsletter/unsubscribe.astro` - Página de confirmación de baja
- ✅ `src/pages/api/admin/newsletter/update-status.ts` - API para cambiar estado
- ✅ `src/pages/api/admin/newsletter/send-chunk.ts` - Con logs y unsubscribe link
- ✅ `src/pages/api/newsletter/subscribe.ts` - Con honeypot y rate limiting
- ✅ `src/components/islands/NewsletterForm.tsx` - Con campo honeypot
- ✅ `src/pages/admin/newsletter/send/[id].astro` - Con modal y validación
- ✅ `src/pages/admin/newsletter/index.astro` - Con constantes y estado failed

**Tiempo estimado Fase 1:** 9 horas → **✅ Completado**

---

### Fase 2: Robustez Técnica y Calidad de Código

| #   | Tarea                                      | Archivo(s)                         | Esfuerzo | Estado          |
| --- | ------------------------------------------ | ---------------------------------- | -------- | --------------- |
| 2.1 | Crear constantes de estado                 | `src/lib/constants/newsletter.ts`  | 30min    | ✅ Completado   |
| 2.2 | Extraer templates a módulo separado        | `src/lib/email-templates/`         | 2h       | ✅ Completado   |
| 2.3 | Mejorar validación de email (RFC 5322)     | `subscribe.ts`                     | 30min    | ✅ Completado   |
| 2.4 | Persistir errores en tabla de logs         | `send-chunk.ts`                    | 1h       | ✅ Completado   |
| 2.5 | Límite de reintentos con backoff           | `send/[id].astro`                  | 1h       | ✅ Completado   |
| 2.6 | Reemplazar magic strings por constantes    | Múltiples archivos                 | 1h       | ✅ Completado   |
| 2.7 | Añadir feedback de error en toggle         | `subscribers.astro`                | 30min    | ✅ Completado   |

**Archivos creados/modificados en Fase 2:**
- ✅ `src/lib/email-templates/newsletter-templates.ts` - Templates centralizados con unsubscribe
- ✅ `src/pages/api/admin/newsletter/campaigns.ts` - Usando constantes
- ✅ `src/pages/admin/newsletter/subscribers.astro` - Con toast de feedback

**Tiempo estimado Fase 2:** 6.5 horas → **✅ Completado**

---

### Fase 3: Mejoras de UX para Marketing Manager

| #   | Tarea                                | Archivo(s)                         | Esfuerzo | Estado          |
| --- | ------------------------------------ | ---------------------------------- | -------- | --------------- |
| 3.1 | Búsqueda y filtros de suscriptores   | `subscribers.astro`                | 2h       | ✅ Completado   |
| 3.2 | Exportar suscriptores a CSV          | `subscribers.astro`                | 1h       | ✅ Completado   |
| 3.3 | Paginación de suscriptores           | `subscribers.astro`                | 2h       | ⏳ Pendiente    |
| 3.4 | Preview del email antes de enviar    | `send/[id].astro`                  | 2h       | ✅ Completado   |
| 3.5 | Envío de email de prueba             | `send/[id].astro` + API            | 2h       | ✅ Completado   |
| 3.6 | Página de edición de campañas        | `[NEW] edit/[id].astro`            | 3h       | ⏳ Pendiente    |
| 3.7 | Editor WYSIWYG (TipTap o Quill)      | `new.astro` + componente React     | 8h       | ⏳ Pendiente    |

**Archivos creados/modificados en Fase 3:**
- ✅ `src/pages/admin/newsletter/subscribers.astro` - Búsqueda, filtros y exportación CSV
- ✅ `src/pages/admin/newsletter/send/[id].astro` - Preview HTML y envío de prueba
- ✅ `src/pages/api/admin/newsletter/send-test.ts` - API para envío de prueba

**Tiempo estimado Fase 3:** 20 horas → **9 horas completadas**

---

### Fase 4 (Futura): Analytics y Optimización

| Tarea                        | Descripción                               | Complejidad |
| ---------------------------- | ----------------------------------------- | ----------- |
| Dashboard de estadísticas    | Tasa de apertura, clics, bounces          | Alta        |
| Integración Resend Analytics | Webhooks + storage de eventos             | Media       |
| Segmentación de audiencia    | Enviar a grupos específicos               | Alta        |
| Plantillas prediseñadas      | Galería de templates reutilizables        | Media       |
| Programación de envíos       | Cron + job queue para fecha/hora futura   | Alta        |
| A/B Testing                  | Múltiples versiones de asunto             | Alta        |

---

## 📋 Checklist de Verificación

### ✅ Tests Manuales Fase 1

- [ ] **Test Unsubscribe GDPR**:
  - Suscribirse con email de prueba
  - Crear campaña y enviar
  - Verificar link de baja visible en footer
  - Click en link → confirma que desactiva suscriptor
  - Verificar que no recibe más emails

- [ ] **Test Honeypot**:
  - Llenar campo honeypot (invisible al usuario)
  - Enviar formulario → debe ser rechazado silenciosamente
  - Verificar que NO se guarda en DB

- [ ] **Test Rate Limiting**:
  - Intentar suscribirse 6 veces en 1 minuto
  - La 6ta debe ser bloqueada con mensaje apropiado

- [ ] **Test Prevención Reenvío**:
  - Enviar campaña completa
  - Intentar acceder a `/admin/newsletter/send/[id]`
  - Debe redirigir o mostrar "Ya enviada"

- [ ] **Test Estado Sending**:
  - Iniciar envío
  - Verificar en DB: `status = 'sending'`
  - Abrir otra pestaña → botón deshabilitado

- [ ] **Test Modal Confirmación**:
  - Click en "Comenzar Envío"
  - Modal con resumen + checkbox obligatorio
  - Cancelar → no inicia envío

### 🛠️ Comandos de Verificación

```bash
# Verificar build sin errores TypeScript
npm run build

# Verificar tipos
npx tsc --noEmit

# Iniciar servidor local
npm run dev

# Verificar migración en Supabase
supabase db push --dry-run
```

---

## 📝 Notas Importantes

> [!IMPORTANT]
> ### Prioridad #1: Link de Unsubscribe
> Sin esto, cada email enviado es una **violación legal**:
> - GDPR Art. 7.3: Derecho a retirar consentimiento en cualquier momento
> - CAN-SPAM Act: Multas hasta $46,517 por email sin opción de baja
> - Reputación: Gmail/Outlook penalizan dominios sin unsubscribe

> [!NOTE]
> ### Batching Actual es Correcto
> El sistema de chunks (5 emails/request, 1s delay) es apropiado para:
> - Evitar timeouts del servidor
> - Respetar rate limits de Resend (10 emails/segundo plan gratuito)
> - Mantener barra de progreso responsive

> [!WARNING]
> ### No Usar en Producción
> Hasta completar la Fase 1, el sistema **NO DEBE** usarse para enviar emails reales:
> 1. Viola GDPR por falta de unsubscribe
> 2. Vulnerable a spam por falta de protección
> 3. Riesgo de envío duplicado por falta de estados

---

## 📊 Métricas de Éxito Post-Implementación

| Métrica                     | Objetivo            | Método de Medición               |
| --------------------------- | ------------------- | -------------------------------- |
| Tasa de entrega             | > 95%               | Resend Dashboard                 |
| Tasa de spam complaints     | < 0.1%              | Resend Analytics                 |
| Tiempo de carga suscriptores| < 2s (1000 users)   | Performance testing              |
| Errores de envío loggeados  | 100%                | Tabla `newsletter_send_logs`     |
| Cobertura unsubscribe       | 100% emails         | Auditoría manual de templates    |

---

**Documento actualizado:** 18/01/2026  
**Próxima revisión:** Tras completar Fase 1
