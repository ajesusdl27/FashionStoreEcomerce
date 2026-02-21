# FashionStore (Astro)

Aplicación e-commerce construida con **Astro SSR**, **React**, **Tailwind**, **Supabase**, **Stripe** y **Resend**.

## ¿Qué es este proyecto?

FashionStore es una plataforma de venta online orientada a la gestión integral de una tienda de moda. Incluye catálogo público, flujo de compra con pago online, área de cliente y panel administrativo para operar pedidos, inventario, cupones, devoluciones y newsletter desde una misma base.

El proyecto está diseñado para ejecutarse en SSR con Astro, integrando Supabase como backend principal (auth + datos), Stripe para cobros y Resend para comunicaciones transaccionales. También contempla operación en contenedor (Docker/Coolify) y automatizaciones mediante Edge Functions en Supabase.

## Stack técnico

- Astro 5 (modo `server`) con `@astrojs/node` (standalone)
- React 19 + Tailwind CSS
- Supabase (auth, datos y funciones edge)
- Stripe (checkout + webhooks)
- Resend (emails transaccionales)
- Cloudinary (gestión de imágenes)

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto Supabase activo
- Cuenta Stripe (si habilitas pagos)
- Cuenta Resend (si habilitas emails)
- Cuenta Cloudinary (si subes imágenes)

## Instalación rápida

```bash
npm install
cp .env.example .env
npm run dev
```

App local por defecto: `http://localhost:4321`

## Scripts disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Ejecuta build SSR (dist/server/entry.mjs)
npm run preview  # Preview de Astro
npm run astro    # CLI Astro
```

> Nota: no hay script `test` en `package.json`. Si necesitas ejecutar tests unitarios existentes:
>
> ```bash
> npx vitest run
> ```

## Variables de entorno

Copia `.env.example` y ajusta valores reales.

### Obligatorias (mínimo funcional)

| Variable | Uso |
|---|---|
| `PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones server-side que saltan RLS |
| `STRIPE_SECRET_KEY` | Inicialización Stripe server |

### Recomendadas según módulos activos

| Variable | Uso |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | Verificación de webhook Stripe |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe en cliente |
| `RESEND_API_KEY` | Envío de emails |
| `RESEND_FROM_EMAIL` | Remitente de emails (fallback interno si falta) |
| `CLOUDINARY_CLOUD_NAME` | Subida/optimización de imágenes |
| `CLOUDINARY_API_KEY` | Credenciales Cloudinary |
| `CLOUDINARY_API_SECRET` | Credenciales Cloudinary |
| `PUBLIC_SITE_URL` | URL base pública (sitemap, robots, emails, links) |
| `CRON_SECRET` | Protección endpoint cron admin |
| `CONTACT_EMAIL` | Email de contacto en plantillas |
| `COMPANY_NAME` | Datos empresa para PDF/factura |
| `COMPANY_NIF` | Datos empresa para PDF/factura |
| `COMPANY_ADDRESS` | Datos empresa para PDF/factura |
| `COMPANY_EMAIL` | Datos empresa para PDF/factura |
| `COMPANY_PHONE` | Datos empresa para PDF/factura |
| `NODE_ENV` | Entorno (`development`/`production`) |
| `HOST` | Host del servidor Astro |
| `PORT` | Puerto del servidor Astro |

## Desarrollo local

```bash
npm run dev
```

El servidor usa por defecto:

- `HOST=0.0.0.0`
- `PORT=4321` (en desarrollo)

## Build y ejecución en producción

```bash
npm run build
npm run start
```

Por defecto en runtime productivo:

- `HOST=0.0.0.0`
- `PORT=3000`

Health endpoint: `GET /health`

## Docker (local)

```bash
docker compose up --build
```

- Puerto publicado: `3000`
- Healthcheck configurado contra `/health`
- También puedes usar scripts auxiliares:
  - Windows: `./test-docker.ps1`
  - Unix: `./test-docker.sh`

## Deploy (Coolify / Dockerfile)

El proyecto incluye `Dockerfile` multi-stage listo para despliegue.

Comandos esperados en plataforma:

- Build: `npm run build`
- Start: `npm run start`
- Puerto: `3000`

Recomendación: usar healthcheck en `/health` para consistencia con el contenedor local.

## Supabase Edge Functions

Ubicación:

- `supabase/functions/daily-low-stock-alert`
- `supabase/functions/send-invoice-email`

Secrets requeridos en Supabase (Functions):

- `SUPABASE_URL` (normalmente autogestionado)
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (opcional)

Cron de stock bajo:

- Revisa `Doc/migrations/setup_daily_low_stock_cron.sql` para la configuración programada.

## Estructura principal

```text
src/
  pages/              # Rutas Astro + endpoints API
  components/         # Componentes UI
  layouts/            # Layouts
  lib/                # Integraciones (supabase, stripe, email, cloudinary...)
  stores/             # Estado cliente
supabase/
  functions/          # Edge Functions
Doc/
  DocsFashionStore/   # Documentación funcional/arquitectura
  migrations/         # SQL y utilidades de migración
```

## Referencia adicional

- Documentación funcional y técnica ampliada: `Doc/DocsFashionStore/fashionstore.md`
- Plan técnico (histórico): `Doc/DocsFashionStore/plan_desarrollo.md`

---

Si quieres, en un siguiente paso también puedo actualizar `.env.example` para alinearlo 100% con estas variables y evitar confusiones al clonar el proyecto.