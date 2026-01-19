# Módulo 5: Sistema de Newsletter - Análisis Completo

## 1. Visión General

El sistema de Newsletter de FashionStore permite:
- **Suscripción pública**: Formulario en footer con honeypot anti-bot
- **Gestión de suscriptores**: Activar/desactivar, exportar CSV
- **Campañas email**: Crear, editar, previsualizar y enviar masivamente
- **GDPR Compliance**: Token único de unsubscribe, logs de auditoría, rate limiting

---

## 2. Estructura de Archivos Fuente

```
src/
├── components/islands/
│   └── NewsletterForm.tsx          # Formulario público de suscripción
├── lib/
│   ├── constants/
│   │   └── newsletter.ts           # Constantes y validación
│   └── email-templates/
│       └── newsletter-templates.ts # Templates HTML de emails
├── pages/
│   ├── api/
│   │   ├── newsletter/
│   │   │   ├── subscribe.ts        # POST suscripción pública
│   │   │   └── unsubscribe.ts      # GET/POST baja GDPR
│   │   └── admin/newsletter/
│   │       ├── campaigns.ts        # POST crear campaña
│   │       ├── update-campaign.ts  # POST actualizar
│   │       ├── delete-campaign.ts  # POST eliminar
│   │       ├── send-chunk.ts       # POST envío por chunks
│   │       ├── send-test.ts        # POST email de prueba
│   │       ├── mark-sent.ts        # POST marcar enviada
│   │       ├── toggle-subscriber.ts # POST activar/desactivar
│   │       └── update-status.ts    # POST actualizar estado
│   ├── admin/newsletter/
│   │   ├── index.astro             # Lista de campañas + stats
│   │   ├── new.astro               # Crear campaña (WYSIWYG)
│   │   ├── subscribers.astro       # Gestión de suscriptores
│   │   ├── edit/[id].astro         # Editar campaña borrador
│   │   └── send/[id].astro         # Proceso de envío masivo
│   └── newsletter/
│       └── unsubscribe.astro       # Página confirmación baja
Doc/migrations/
├── 013_create_newsletter_tables.sql  # Tablas base
└── 034_newsletter_gdpr_compliance.sql # GDPR + rate limiting
```

---

## 3. Modelos de Datos

### 3.1 Newsletter Subscriber

```sql
-- newsletter_subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribe_token UUID DEFAULT uuid_generate_v4() UNIQUE, -- GDPR
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Interface:**
```typescript
interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  unsubscribe_token: string;
  created_at: string;
}
```

### 3.2 Newsletter Campaign

```sql
-- newsletter_campaigns
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,                    -- HTML content
  status TEXT DEFAULT 'draft' CHECK (
    status IN ('draft', 'sending', 'sent', 'failed', 'paused')
  ),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);
```

**TypeScript Interface:**
```typescript
interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;       // HTML
  status: CampaignStatus;
  sent_count: number;
  failed_count: number;
  total_recipients: number;
  last_error?: string;
  created_at: string;
  sent_at?: string;
}

type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed' | 'paused';
```

### 3.3 Send Log (Auditoría)

```sql
-- newsletter_send_logs (auditoría GDPR)
CREATE TABLE newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  subscriber_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Rate Limits

```sql
-- newsletter_rate_limits (anti-spam)
CREATE TABLE newsletter_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Estados de Campaña

| Estado | Color | Descripción |
|--------|-------|-------------|
| `draft` | Gris | Borrador, editable |
| `sending` | Amarillo | En proceso de envío |
| `sent` | Verde | Envío completado |
| `failed` | Rojo | Error durante envío |
| `paused` | Naranja | Pausada manualmente |

**Constantes:**
```typescript
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  PAUSED: 'paused',
} as const;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  sending: 'Enviando...',
  sent: 'Enviada',
  failed: 'Fallida',
  paused: 'Pausada',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sending: 'bg-yellow-500/20 text-yellow-400',
  sent: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  paused: 'bg-orange-500/20 text-orange-400',
};
```

---

## 5. Flujos de Usuario

### 5.1 Suscripción Pública

```
[Usuario] → NewsletterForm → POST /api/newsletter/subscribe
                                 ↓
                           Rate Limit Check
                                 ↓
                           Honeypot Check
                                 ↓
                           Email Validation
                                 ↓
                     ┌─── Ya existe ───┐
                     ↓                 ↓
                  Activo?          Insertar nuevo
                     ↓                 ↓
                  Error          Generar token
                     ↓                 ↓
                 Reactivar       Enviar Welcome Email
                     ↓                 ↓
              ← Success Response ←────┘
```

### 5.2 Baja GDPR (Unsubscribe)

```
[Email Link] → /api/newsletter/unsubscribe?token=UUID
                          ↓
                   Validar token UUID
                          ↓
                   Buscar subscriber
                          ↓
                ┌─── Ya inactivo ───┐
                ↓                   ↓
            Desactivar          Mensaje OK
                ↓                   ↓
         ← JSON Response ←─────────┘
                ↓
     [Redirección opcional a página confirmación]
```

### 5.3 Envío de Campaña

```
[Admin] → /admin/newsletter/send/[id]
                    ↓
            Preview + Test Email
                    ↓
             Confirmar envío
                    ↓
        ┌───── Chunked Loop ─────┐
        ↓                        ↑
   Fetch 5 subscribers      Actualizar UI
        ↓                        ↑
   Enviar emails            Reportar progreso
        ↓                        ↑
   Log resultados ───────────────┘
        ↓
   Marcar como 'sent'
```

---

## 6. Configuración de Envío

```typescript
export const NEWSLETTER_CONFIG = {
  CHUNK_SIZE: 5,                      // Emails por request
  DELAY_MS: 1000,                     // 1 segundo entre emails
  MAX_RETRIES: 3,                     // Reintentos por chunk
  RETRY_BACKOFF: [3000, 6000, 12000], // Backoff exponencial
  RATE_LIMIT_MAX_ATTEMPTS: 5,         // Max suscripciones por IP
  RATE_LIMIT_WINDOW_MINUTES: 60,      // Ventana de tiempo
} as const;
```

---

## 7. Templates de Email

### 7.1 Estructura del Template

```typescript
interface NewsletterTemplateOptions {
  subject: string;
  content: string;      // HTML del contenido
  siteUrl: string;
  unsubscribeUrl: string;
}

function generateNewsletterHTML(options: NewsletterTemplateOptions): string {
  // Wrapper con header FashionStore
  // + Content dinámico
  // + Footer con link de baja GDPR
}
```

### 7.2 Headers de Email GDPR

```typescript
// Al enviar con Resend:
await resend.emails.send({
  from: fromEmail,
  to: subscriber.email,
  subject: campaign.subject,
  html: emailHtml,
  headers: {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
});
```

---

## 8. Componentes React (Astro Islands)

### 8.1 NewsletterForm

```tsx
// Formulario de suscripción en footer
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Campo oculto anti-bot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Honeypot: si se llena, aceptar silenciosamente (bots)
  // Validación email antes de enviar
  // POST a /api/newsletter/subscribe
}
```

### 8.2 WysiwygEditor (Admin)

- Editor visual para crear contenido de campañas
- Permite alternar entre modo visual y HTML
- Sincroniza contenido con hidden input

---

## 9. RLS Policies

```sql
-- Subscribers: público puede suscribirse
CREATE POLICY "Public can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Subscribers: admin gestiona todo
CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- Campaigns: solo admin
CREATE POLICY "Admins can manage campaigns"
  ON newsletter_campaigns
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- Send logs: solo admin
CREATE POLICY "Admins can manage send logs"
  ON newsletter_send_logs
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- Rate limits: público (para su propia IP)
CREATE POLICY "Public can manage own rate limits"
  ON newsletter_rate_limits
  FOR ALL
  TO anon, authenticated
  WITH CHECK (true);
```

---

## 10. Características GDPR

| Requisito | Implementación |
|-----------|---------------|
| **Consentimiento** | Formulario opt-in explícito |
| **Derecho a baja** | Token único por subscriber |
| **One-click unsubscribe** | Header `List-Unsubscribe-Post` |
| **Auditoría** | Tabla `newsletter_send_logs` |
| **Rate limiting** | Límite por IP (5 intentos/hora) |
| **Honeypot** | Campo oculto anti-bot |

---

## 11. Funcionalidades Admin

### 11.1 Dashboard Newsletter (`/admin/newsletter`)

- Stats: activos, enviadas, borradores, fallidas
- Lista de campañas con badges de estado
- Acciones: editar (borradores), enviar, eliminar

### 11.2 Gestión de Suscriptores (`/admin/newsletter/subscribers`)

- Búsqueda por email
- Filtro por estado (activo/inactivo)
- Toggle activar/desactivar
- Export CSV

### 11.3 Creación de Campaña (`/admin/newsletter/new`)

- Editor WYSIWYG
- Alternar vista HTML
- Guardar borrador o continuar a envío

### 11.4 Edición de Campaña (`/admin/newsletter/edit/[id]`)

- Solo borradores y fallidas editables
- Mismo formulario que creación

### 11.5 Envío de Campaña (`/admin/newsletter/send/[id]`)

- Preview del contenido
- Email de prueba
- Confirmación antes de envío masivo
- Barra de progreso en tiempo real
- No cerrar pestaña durante envío

---

## 12. Diferencias Flutter

| Web (Astro) | Flutter |
|-------------|---------|
| Astro pages SSR | Flutter screens |
| React Islands | StatefulWidget/Riverpod |
| WYSIWYG editor (web) | `flutter_quill` package |
| Envío chunked desde cliente | Envío desde app o Cloud Function |
| HTML templates | HTML string rendering |
| localStorage/cookies | SharedPreferences |
