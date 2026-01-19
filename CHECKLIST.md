# ✅ Checklist de Pre-Deployment para Coolify

Usa este checklist antes de desplegar a producción.

## 📋 Base de Datos (Supabase)

- [ ] Todas las migraciones están aplicadas en producción
- [ ] Las políticas RLS están configuradas correctamente
- [ ] Los buckets de Storage están creados
- [ ] Las funciones RPC necesarias existen
- [ ] Los triggers y funciones SQL están en su lugar
- [ ] Hay un backup reciente de la base de datos

## 🔐 Credenciales y API Keys

- [ ] Tienes las claves de Supabase (URL, Anon Key, Service Role Key)
- [ ] Las claves de Cloudinary están listas (si usas subida de imágenes)
- [ ] Las claves de Stripe están configuradas (producción, no test)
- [ ] La clave de Resend está lista (si usas emails)
- [ ] Todas las claves están guardadas de forma segura

## 🔧 Configuración del Proyecto

- [ ] El código está en un repositorio Git accesible
- [ ] La rama principal (main/master) está actualizada
- [ ] El Dockerfile existe y está probado
- [ ] El .dockerignore existe
- [ ] No hay archivos .env en el repositorio
- [ ] El .gitignore está actualizado

## 🧪 Testing Local

- [ ] El proyecto compila sin errores (`npm run build`)
- [ ] El servidor inicia correctamente (`npm start`)
- [ ] Las páginas principales cargan correctamente
- [ ] La autenticación funciona
- [ ] El carrito y checkout funcionan
- [ ] Los emails se envían correctamente
- [ ] Las imágenes se cargan desde Cloudinary

## 🐳 Docker (Opcional pero Recomendado)

- [ ] El build de Docker funciona (`docker build -t test .`)
- [ ] El contenedor inicia correctamente
- [ ] La aplicación es accesible en `localhost:3000`
- [ ] El health check responde (`/health`)
- [ ] No hay errores en los logs del contenedor

**Comando rápido para probar:**
```bash
# Windows
.\test-docker.ps1

# Linux/Mac
./test-docker.sh
```

## 🌐 Dominio y DNS

- [ ] Tienes un dominio registrado (opcional, Coolify genera URLs)
- [ ] Sabes cómo acceder al panel de DNS de tu dominio
- [ ] Tienes la IP del servidor Coolify

## 🛠️ Servidor Coolify

- [ ] Coolify está instalado y accesible
- [ ] Tienes acceso al panel de administración
- [ ] El servidor tiene suficiente RAM (mínimo 2GB para build)
- [ ] El servidor tiene suficiente espacio en disco (mínimo 10GB)
- [ ] El puerto 80 y 443 están abiertos
- [ ] Docker está funcionando en el servidor

## 📝 Documentación

- [ ] Has leído QUICKSTART_COOLIFY.md
- [ ] Has revisado DEPLOYMENT.md
- [ ] Has revisado COOLIFY_CONFIG.md
- [ ] Tienes .env.example como referencia

## 🚦 Durante el Deployment

### En Coolify:

1. **Crear Proyecto**
   - [ ] Repositorio Git conectado
   - [ ] Rama correcta seleccionada
   - [ ] Dockerfile detectado

2. **Variables de Entorno**
   - [ ] NODE_ENV=production
   - [ ] HOST=0.0.0.0
   - [ ] PORT=3000
   - [ ] PUBLIC_SITE_URL configurada
   - [ ] Todas las claves de Supabase
   - [ ] Todas las claves de servicios externos

3. **Configuración**
   - [ ] Puerto 3000 configurado
   - [ ] Health check habilitado
   - [ ] Dominio añadido (si aplica)

4. **Deploy**
   - [ ] Click en "Deploy"
   - [ ] Monitorear logs del build
   - [ ] Esperar a que termine (3-5 minutos)

## ✅ Post-Deployment

- [ ] El sitio es accesible vía HTTPS
- [ ] El health check responde: `https://tu-dominio.com/health`
- [ ] La página principal carga correctamente
- [ ] El login/registro funciona
- [ ] El catálogo muestra productos
- [ ] Las imágenes se cargan
- [ ] El carrito funciona
- [ ] El checkout funciona
- [ ] Los emails se envían
- [ ] El panel de admin es accesible
- [ ] No hay errores en los logs

## 🔄 Configurar Auto-Deploy (Opcional)

- [ ] Webhook configurado en el repositorio
- [ ] Test del webhook (push de prueba)
- [ ] Verificar que el auto-deploy funciona

## 📊 Monitoreo

- [ ] Health check endpoint funcionando
- [ ] Logs accesibles en Coolify
- [ ] Alertas configuradas (opcional)
- [ ] Uptime monitoring configurado (opcional)

## 🔒 Seguridad

- [ ] SSL/TLS funcionando (HTTPS)
- [ ] Headers de seguridad configurados
- [ ] Rate limiting considerado
- [ ] Backups configurados
- [ ] Secrets no expuestos en el código

## 📈 Performance

- [ ] Images optimizadas
- [ ] CDN configurado (Cloudinary)
- [ ] Caché configurado
- [ ] Compresión habilitada

## 🎯 Puntos Críticos

### ⚠️ NUNCA OLVIDES:

1. **Aplica las migraciones de Supabase** antes del primer deploy
2. **Usa claves de producción**, no de test
3. **Configura PUBLIC_SITE_URL** con tu dominio real
4. **Verifica las políticas RLS** de Supabase
5. **Haz backup** de la base de datos antes de cambios importantes

---

## 🎉 Listo para Deploy?

Si has marcado todas las casillas relevantes, ¡estás listo!

```bash
# Último comando antes de desplegar
git add .
git commit -m "Ready for production deployment"
git push origin main
```

Luego ve a Coolify y haz click en **Deploy** 🚀

---

**Tiempo estimado total:** 10-15 minutos (primera vez)

**¿Problemas?** Revisa:
1. Logs en Coolify
2. Variables de entorno
3. Conexión a Supabase
4. [DEPLOYMENT.md](DEPLOYMENT.md) para soluciones
