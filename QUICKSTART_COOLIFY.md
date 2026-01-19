# 🚀 Guía Rápida de Deployment en Coolify

## ✅ Checklist Pre-Deployment

Antes de desplegar en Coolify, asegúrate de tener:

- [ ] Repositorio Git con el código actualizado
- [ ] Proyecto de Supabase configurado con todas las migraciones aplicadas
- [ ] Credenciales de servicios externos (Cloudinary, Stripe, Resend)
- [ ] Dominio configurado (opcional, Coolify también genera URLs)
- [ ] Instancia de Coolify instalada y accesible

## 📦 Archivos Creados para Coolify

Tu proyecto ahora incluye:

- ✅ **Dockerfile**: Construcción optimizada de la imagen Docker
- ✅ **.dockerignore**: Excluye archivos innecesarios del build
- ✅ **.coolify**: Configuración específica de Coolify
- ✅ **.env.example**: Template de variables de entorno
- ✅ **astro.config.mjs**: Actualizado para leer variables de entorno
- ✅ **src/pages/health.astro**: Endpoint de health check
- ✅ **DEPLOYMENT.md**: Guía detallada de deployment
- ✅ **COOLIFY_CONFIG.md**: Configuración detallada de Coolify

## 🎯 Pasos Rápidos

### 1. Push a Git
```bash
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 2. Crear Proyecto en Coolify

1. Login a tu instancia de Coolify
2. **New Resource** → **Public Repository**
3. Pega la URL de tu repositorio
4. Selecciona la rama (main)
5. Coolify detectará automáticamente el Dockerfile

### 3. Configurar Variables de Entorno

En Coolify → **Environment Variables**, añade:

```env
# MÍNIMO OBLIGATORIO:
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
PUBLIC_SITE_URL=https://tu-dominio.com

PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

Ver [.env.example](.env.example) para todas las variables disponibles.

### 4. Configurar Dominio (Opcional)

En Coolify → **Domains**:
- Añade tu dominio personalizado
- Coolify generará SSL automáticamente
- Apunta tu DNS a la IP del servidor Coolify

### 5. Deploy!

Click en **Deploy** y espera 3-5 minutos para el primer build.

## 🔍 Verificar que Funciona

Después del deployment:

1. **Health Check**: Visita `https://tu-dominio.com/health`
   - Deberías ver "OK" y "Status: Healthy"

2. **Página Principal**: Visita `https://tu-dominio.com`
   - Verifica que el sitio carga correctamente

3. **Logs**: En Coolify → Logs
   - No deberías ver errores críticos

## 🔄 Re-deployments Automáticos

Configura webhook en tu repositorio Git:

**Webhook URL**: Coolify → Webhooks → Copia la URL

### GitHub:
Settings → Webhooks → Add webhook → Pega la URL

### GitLab:
Settings → Webhooks → Add webhook → Pega la URL

Ahora cada `git push` desplegará automáticamente.

## ⚠️ Problemas Comunes

### Build falla con error de memoria
**Solución**: Aumenta la RAM del servidor a mínimo 2GB

### "Cannot connect to Supabase"
**Solución**: Verifica las variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`

### Página en blanco
**Solución**: Revisa los logs del contenedor. Probablemente faltan variables de entorno.

### SSL no funciona
**Solución**: Espera 2-3 minutos para que se genere el certificado. Verifica DNS.

## 📚 Documentación Completa

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía completa de deployment
- [COOLIFY_CONFIG.md](COOLIFY_CONFIG.md) - Configuración detallada de Coolify
- [.env.example](.env.example) - Todas las variables de entorno

## 🆘 Necesitas Ayuda?

1. Revisa los logs en Coolify
2. Verifica que todas las variables de entorno estén configuradas
3. Consulta la [documentación de Coolify](https://coolify.io/docs)
4. Verifica el health check endpoint

## 🎉 ¡Listo!

Tu aplicación FashionStore está lista para desplegarse en Coolify. El proceso debería ser:

1. Push a Git (30 segundos)
2. Configurar en Coolify (5 minutos)
3. Deploy (3-5 minutos)
4. **Total: ~10 minutos** ⚡

---

**Nota**: La primera vez tardará más por la descarga de dependencias. Los siguientes deployments serán más rápidos gracias al cache de Docker.
