# 📋 Guía de Logs de Debug - FashionStore

Esta guía te ayudará a interpretar los logs detallados agregados al sistema para diagnosticar problemas en producción (Coolify).

## 🔍 Cómo Ver los Logs en Coolify

1. Accede a tu proyecto en Coolify
2. Ve a la sección **Logs** o **Terminal**
3. Los logs se muestran en tiempo real
4. Busca los emojis indicadores para filtrar rápidamente

---

## 🔐 Logs de Autenticación (Login)

### Identificadores:
- `🔐 [AUTH LOGIN]` - Endpoint de API de login
- `🔑 [CLIENT LOGIN]` - Cliente/Navegador
- `🔒 [MIDDLEWARE]` - Middleware de autenticación

### Flujo Normal de Login Exitoso:

```
🔑 [CLIENT LOGIN] Starting login process...
🔑 [CLIENT LOGIN] Email: user@example.com
🔑 [CLIENT LOGIN] Sending request to /api/auth/login...
🔐 [AUTH LOGIN] Request received
🔐 [AUTH LOGIN] Email: user@example.com, RedirectTo: /cuenta
🔐 [AUTH LOGIN] Environment: { SUPABASE_URL: ✓ Set, SUPABASE_ANON_KEY: ✓ Set, IS_PROD: true }
🔐 [AUTH LOGIN] Attempting Supabase signInWithPassword...
🔐 [AUTH LOGIN] Supabase response: { hasData: true, hasSession: true, hasUser: true, error: null }
🔐 [AUTH LOGIN] ✓ Session obtained, setting cookies...
🔐 [AUTH LOGIN] ✅ Login successful, cookies set
🔑 [CLIENT LOGIN] Response received in 234ms
🔑 [CLIENT LOGIN] Response status: 200 OK
🔑 [CLIENT LOGIN] ✅ Login successful!
🔑 [CLIENT LOGIN] Redirecting to: /cuenta
```

### Errores Comunes y Diagnóstico:

#### ❌ Error: Variables de entorno faltantes
```
🔐 [AUTH LOGIN] Environment: { SUPABASE_URL: ✗ Missing, ... }
```
**Solución**: Configurar `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` en Coolify

---

#### ❌ Error: Credenciales incorrectas
```
🔐 [AUTH LOGIN] ❌ Supabase auth error: { message: "Invalid login credentials", status: 400 }
```
**Causa**: Email/contraseña incorrectos
**Solución**: Verificar credenciales del usuario

---

#### ❌ Error: Timeout/Conexión
```
🔑 [CLIENT LOGIN] ❌ Exception caught: TypeError: Failed to fetch
🔑 [CLIENT LOGIN] Error details: { name: 'TypeError', message: 'Failed to fetch' }
```
**Posibles causas**:
1. No hay conectividad entre Coolify y Supabase
2. Firewall bloqueando requests
3. URL de Supabase incorrecta
4. CORS issues

**Diagnóstico**:
```bash
# Ejecutar desde el contenedor de Coolify:
curl -v https://daopmchzdcumlhirskoq.supabase.co/auth/v1/health
```

---

#### ❌ Error: Cookies no se establecen
```
🔐 [AUTH LOGIN] ✅ Login successful, cookies set
🔑 [CLIENT LOGIN] Response received... but redirect fails
🔒 [MIDDLEWARE] Has access token: false
```
**Posibles causas**:
1. Configuración de cookies `secure: true` pero proxy no envía HTTPS correctamente
2. Dominio de cookies no coincide
3. SameSite issues

**Solución**: Verificar configuración de proxy en Coolify

---

## 🔒 Logs del Middleware

### Rutas Protegidas:
```
🔒 [MIDDLEWARE] Auth check for: /cuenta/pedidos
🔒 [MIDDLEWARE] Has access token: true
🔒 [MIDDLEWARE] Has refresh token: true
🔒 [MIDDLEWARE] Validating access token...
🔒 [MIDDLEWARE] ✅ User authenticated: user@example.com
```

### Tokens Expirados (Refresh):
```
🔒 [MIDDLEWARE] Access token invalid, attempting refresh...
🔒 [MIDDLEWARE] ✅ Session refreshed successfully
🔒 [MIDDLEWARE] ✅ User authenticated: user@example.com
```

### Sin Autenticación:
```
🔒 [MIDDLEWARE] ❌ No authenticated user, redirecting to login
🔒 [MIDDLEWARE] Redirect to: /cuenta/login
```

---

## 📧 Logs de Correos Electrónicos

### Identificador: `📧 [EMAIL]`

### Flujo Normal de Envío:
```
📧 [EMAIL] Starting order confirmation email...
📧 [EMAIL] Order: 17 Customer: user@example.com
📧 [EMAIL] From address: FashionStore <info@bookoro.es>
📧 [EMAIL] RESEND_FROM_EMAIL env: Set
📧 [EMAIL] Template options: { siteUrl: '...', contactEmail: '...', storeName: 'FashionStore' }
📧 [EMAIL] Formatted order ID: #A000017
📧 [EMAIL] Generating PDF ticket...
📧 [EMAIL] ✅ Ticket PDF generated successfully
📧 [EMAIL] Adding PDF attachment to email
📧 [EMAIL] Sending email via Resend...
📧 [EMAIL] ✅ Order confirmation email sent successfully. Resend ID: abc123...
```

### Errores Comunes:

#### ❌ Error: Resend no configurado
```
📧 [EMAIL] ⚠️ Resend not configured - skipping order confirmation email
📧 [EMAIL] RESEND_API_KEY: Missing
```
**Solución**: Configurar `RESEND_API_KEY` en Coolify

---

#### ❌ Error: Email "from" no verificado
```
📧 [EMAIL] From address: FashionStore <onboarding@resend.dev>
📧 [EMAIL] RESEND_FROM_EMAIL env: Using fallback
📧 [EMAIL] ❌ Error sending order confirmation email: { message: "Domain not verified" }
```
**Solución**: 
1. Configurar `RESEND_FROM_EMAIL=FashionStore <info@bookoro.es>` en Coolify
2. Verificar dominio `bookoro.es` en tu cuenta de Resend

---

#### ❌ Error: Generación de PDF falla
```
📧 [EMAIL] Generating PDF ticket...
📧 [EMAIL] ❌ Error generating ticket PDF: ...
📧 [EMAIL] No PDF attachment (generation failed)
📧 [EMAIL] Sending email via Resend...
```
**Nota**: El email se envía sin PDF. No es crítico, pero revisar errores de puppeteer/fonts.

---

## 🛒 Logs de Checkout y Órdenes

### Identificador: `🛒 [CHECKOUT SUCCESS]`

### Flujo Normal:
```
🛒 [CHECKOUT SUCCESS] Fetching order details...
🛒 [CHECKOUT SUCCESS] Order ID from session: 6e6df32e-0003-4b04-b602-c43fdebc9fa5
🛒 [CHECKOUT SUCCESS] Using client type: anonymous (supabase)
🛒 [CHECKOUT SUCCESS] ✅ Order fetched successfully
🛒 [CHECKOUT SUCCESS] Order result: YES, order_number: 17, email: user@example.com, status: paid
```

### Error PGRST116:
```
🛒 [CHECKOUT SUCCESS] ❌ Error fetching order: {
  code: 'PGRST116',
  message: 'Cannot coerce the result to a single JSON object',
  details: 'The result contains 0 rows',
  orderId: '6e6df32e-...'
}
🛒 [CHECKOUT SUCCESS] Order result: NO
```

**Posibles causas**:
1. **Políticas RLS demasiado restrictivas**: El cliente anónimo no puede ver la orden
2. **Order ID incorrecto**: El ID en la sesión de Stripe no coincide con la BD
3. **Cliente incorrecto**: Debería usar cliente autenticado en lugar de anónimo

**Solución recomendada**: Usar cliente autenticado en checkout/exito.astro

---

## 🚀 Cómo Usar Estos Logs en Producción

### 1. Reproducir el Error
1. Intenta hacer login en tu web en producción
2. Mira los logs en tiempo real en Coolify
3. Busca los emojis correspondientes

### 2. Filtrar Logs Relevantes
En Coolify, puedes filtrar por:
- `🔐` - Solo logs de auth API
- `🔑` - Solo logs del cliente
- `📧` - Solo logs de emails
- `🛒` - Solo logs de checkout

### 3. Ejemplos de Comandos para Filtrar

Si tienes acceso a shell:
```bash
# Ver solo logs de autenticación
docker logs [container-id] 2>&1 | grep "🔐\|🔑\|🔒"

# Ver solo logs de emails
docker logs [container-id] 2>&1 | grep "📧"

# Ver últimas 100 líneas en tiempo real
docker logs -f --tail 100 [container-id]
```

---

## ✅ Checklist de Variables de Entorno en Coolify

Asegúrate de que estas variables estén configuradas:

### Build-time (necesarias para compilar):
- [ ] `PUBLIC_SUPABASE_URL`
- [ ] `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `PUBLIC_SITE_URL` (debe ser tu dominio de producción)
- [ ] `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `NIXPACKS_NODE_VERSION=22` ⚠️ **Crítico para que compile**

### Runtime (necesarias en ejecución):
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL` (formato: `Nombre <email@dominio.com>`)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NODE_ENV=production` (no `development`)

---

## 🔧 Próximos Pasos para Resolver tu Error

Basándonos en tu error original:

1. **Primero**: Agregar `NIXPACKS_NODE_VERSION=22` para que compile
2. **Segundo**: Hacer redeploy y verificar que compile exitosamente
3. **Tercero**: Una vez compilado, intentar login y revisar logs:
   - Buscar `🔐 [AUTH LOGIN] Environment:` para verificar variables
   - Buscar errores de Supabase
   - Verificar si las cookies se establecen correctamente
4. **Cuarto**: Verificar emails con `📧 [EMAIL]` logs
5. **Quinto**: Corregir error PGRST116 si persiste después del login funcional

---

## 📞 Soporte

Si después de revisar los logs el problema persiste, comparte:
1. Los logs completos del flujo (desde `Starting login` hasta el error)
2. Las variables de entorno configuradas (sin los valores secretos)
3. El mensaje de error específico

¡Los logs ahora te dirán exactamente dónde falla! 🎯
