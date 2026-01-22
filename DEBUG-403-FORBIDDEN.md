# 🚨 Diagnóstico: Error 403 Forbidden en Login

## Problema Detectado

```
POST https://fashionstoreajesusdl.victoriafp.online/api/auth/login
Status: 403 Forbidden
```

**Este error indica que el request está siendo bloqueado ANTES de llegar a tu aplicación.**

---

## 🔍 Causas Más Probables

### 1. **Cloudflare WAF (Web Application Firewall)** ⚠️ MÁS PROBABLE

Cloudflare está bloqueando POST requests a `/api/*` por seguridad.

**Señales:**
- Headers incluyen `cf-ray`
- Respuesta HTML en lugar de JSON
- Solo afecta a POST, no a GET

**Solución:**
1. Accede a Cloudflare Dashboard
2. Ve a **Security** → **WAF**
3. Revisa **Security Events** para ver tu IP bloqueada
4. Agrega una regla de exclusión para `/api/auth/login`:
   ```
   (http.request.uri.path eq "/api/auth/login") and (http.request.method eq "POST")
   Action: Skip → All remaining rules
   ```

---

### 2. **Rate Limiting de Cloudflare/Coolify**

**Solución:**
1. En Cloudflare: **Security** → **Rate Limiting**
2. Aumenta límite o excluye `/api/auth/*`
3. En Coolify: Verifica configuración de rate limiting

---

### 3. **Bot Protection**

Cloudflare puede estar detectando el request como bot.

**Solución:**
1. Cloudflare Dashboard → **Security** → **Bots**
2. Configura a "Allow" para `/api/auth/*`
3. O agrega challenge/whitelist para tu dominio

---

### 4. **CORS/Security Headers Incorrectos**

El proxy de Coolify o Cloudflare puede estar bloqueando por headers.

**Verificar:**
```bash
curl -X POST https://fashionstoreajesusdl.victoriafp.online/api/auth/login \
  -H "Content-Type: multipart/form-data" \
  -H "Origin: https://fashionstoreajesusdl.victoriafp.online" \
  -F "email=test@example.com" \
  -F "password=test123" \
  -v
```

---

## 🛠️ Pasos de Diagnóstico

### 1. Verificar que es Cloudflare

En el navegador (DevTools → Network):
```
Response Headers:
  server: cloudflare
  cf-ray: xxxxx-xxxxx
```

Si ves estos headers, **definitivamente es Cloudflare**.

---

### 2. Ver el Body del Error 403

Abre DevTools → Network → Click en el request fallido → Response

Si ves HTML con:
```html
<title>403 Forbidden</title>
<!-- o -->
<title>Attention Required! | Cloudflare</title>
```

**Confirma que es Cloudflare bloqueando.**

---

### 3. Verificar Security Events en Cloudflare

1. Cloudflare Dashboard
2. Tu dominio
3. **Security** → **Events**
4. Filtra por tu IP y fecha/hora del error
5. Verás exactamente qué regla bloqueó el request

---

## ✅ Soluciones Implementables

### Opción A: Whitelist en Cloudflare (RECOMENDADO)

```
Cloudflare Dashboard → Security → WAF → Create Rule

Rule Name: Allow Auth API
Expression: 
  (http.request.uri.path contains "/api/auth/") and 
  (http.request.method eq "POST")
Action: Skip → All remaining custom rules
```

---

### Opción B: Desactivar Cloudflare para /api/* (TEMPORAL)

```
Cloudflare Dashboard → Rules → Page Rules

URL: fashionstoreajesusdl.victoriafp.online/api/*
Settings:
  - Security Level: Essentially Off
  - Browser Integrity Check: Off
  - WAF: Off
```

⚠️ **Esto reduce seguridad, úsalo solo para testing**

---

### Opción C: Cambiar Método a GET (NO RECOMENDADO)

Cambiar el login a GET con query params, pero **esto expone passwords en URLs/logs**.

---

### Opción D: Bypass Cloudflare (DESARROLLO)

Usar IP directa de Coolify en lugar del dominio con Cloudflare:

1. Encuentra IP del servidor:
```bash
ping fashionstoreajesusdl.victoriafp.online
# Si muestra IP de Cloudflare (104.x.x.x), busca la real
```

2. Agregar al `/etc/hosts` local (solo para testing):
```
[IP_REAL] fashionstoreajesusdl.victoriafp.online
```

---

## 🔧 Fix Inmediato para Testing

Si solo quieres testear rápidamente:

1. **Desactiva el Proxy de Cloudflare** (DNS Only):
   - Cloudflare Dashboard → DNS
   - Click en el icono naranja junto a tu dominio
   - Cámbialo a gris (DNS Only)
   - Espera 5 minutos

2. Intenta login nuevamente

3. Si funciona, **el problema es 100% Cloudflare**

---

## 📊 Checklist de Verificación

- [ ] Ver headers del response 403 (buscar `cf-ray`)
- [ ] Revisar Security Events en Cloudflare
- [ ] Verificar que `/api/auth/login` existe (GET request primero)
- [ ] Probar con curl desde línea de comandos
- [ ] Revisar logs de Coolify para ver si el request llega
- [ ] Verificar configuración de Coolify (no tiene rate limiting propio)

---

## 🎯 Acción Inmediata Recomendada

### 1. Ve a los logs de Coolify (ahora mismo)

Si NO ves el log `🔐 [AUTH LOGIN] Request received`, **el request está siendo bloqueado ANTES de llegar a tu app**.

### 2. Accede a Cloudflare Dashboard

**Security → Events** y busca tu IP en los últimos 30 minutos.

### 3. Crea la Regla de Whitelist

Sigue **Opción A** de arriba.

---

## 💡 Por Qué Sucede Esto

Cloudflare tiene protecciones automáticas que detectan:
- POST requests a rutas `/api/*`
- Form data (multipart/form-data)
- Requests sin User-Agent válido
- IPs con historial sospechoso

Tu aplicación Astro es legítima, pero Cloudflare no lo sabe.

---

## 📞 Si el Problema Persiste

Comparte:
1. Screenshot de DevTools → Network → Response del 403
2. Headers completos del response
3. Screenshot de Cloudflare Security Events
4. ¿Los logs de Coolify muestran `🔐 [AUTH LOGIN] Request received`?

Con eso sabré exactamente cuál es la causa específica.

---

## ⚡ Quick Test

Ejecuta esto desde tu terminal:

```bash
curl -X POST https://fashionstoreajesusdl.victoriafp.online/api/auth/login \
  -F "email=test@test.com" \
  -F "password=test123" \
  -v 2>&1 | grep -E "HTTP|server|cf-ray"
```

Si ves:
- `HTTP/1.1 403 Forbidden`
- `server: cloudflare`
- `cf-ray: xxxxx`

**Confirma que es Cloudflare bloqueando.**
