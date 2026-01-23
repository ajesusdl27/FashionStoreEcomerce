# Prompt: Análisis de Compatibilidad y Despliegue en Coolify

**Rol:** Desarrollador Senior Full Stack / DevOps con +10 años de experiencia en despliegues con Docker, Coolify, Node.js y Astro.

**Contexto:**
Tengo una aplicación web (FashionStore) desarrollada con Astro/Node.js.

- **Localmente (`npm run dev`)**: Todo funciona correctamente (inicio de sesión, envío de correos, base de datos).
- **Servidor Coolify**: El despliegue parece exitoso (Build Pack: Nixpacks), pero funcionalidades críticas fallan:
  - **No se envían correos** (SMTP/Stripe Webhooks).
  - **No funciona el inicio de sesión** (posible problema de sesiones/cookies o conexión a DB).
  - Las variables de entorno están configuradas en Coolify, pero parece haber incoherencias o fallos silenciosos.

**Objetivo:**
Realizar un **análisis profundo de "compatibilidad de la web entera"** en el entorno de Coolify. Debes actuar como un auditor técnico riguroso.

**Instrucciones para el Agente:**

1.  **Diagnóstico de Fallos (Deep Dive):**
    - **Variables de Entorno:** Analiza si las variables definidas en Coolify se están pasando correctamente al _runtime_ o solo al _build time_. Verifica `PUBLIC_` vs privadas en Astro/Next.js.
    - **Conectividad de Red:**
      - ¿La aplicación en Docker puede ver a la base de datos? (Revisar `host` vs `localhost` vs `nombre-servicio-docker`).
      - ¿Están abiertos los puertos SMTP de salida? (Muchos hostings bloquean puerto 25/587 por defecto).
    - **Sesiones y Cookies:** Al estar detrás de un Proxy Inverso (Coolify/Traefik), ¿se están manejando bien las cabeceras `X-Forwarded-Proto`? ¿Las cookies tienen `Secure` y `SameSite` configurados correctamente para HTTPS?
    - **Persistencia:** ¿El sistema de archivos es efímero? Si usas SQLite o guardas archivos locales, ¿se pierden al reiniciar?

2.  **Revisión del Sistema y Arquitectura:**
    - Explica cómo está funcionando el flujo de datos en producción vs local.
    - Identifica incoherencias en la configuración de Nixpacks/Docker.
    - Evalúa si la integración con servicios externos (Stripe, SMTP) es robusta.

3.  **Propuesta de Mejoras Técnicas:**
    - ¿Cómo podemos hacer el sistema más resiliente a fallos de red?
    - Mejoras en el logging: ¿Cómo podemos ver logs detallados en Coolify para depurar estos errores de "silencio"?

4.  **Experiencia de Usuario (UX) para 'No Técnicos':**
    - "Facilitar la experiencia": Si algo falla (ej. login incorrecto o error de servidor), ¿el usuario recibe un mensaje claro y amigable en lugar de un error genérico o pantalla blanca?
    - Propón mejoras para que un administrador no técnico pueda entender el estado del sistema sin ver logs. (Ej. Dashboard de estado en la web, notificaciones de salud).

5.  **Entregable:**
    - Lista de **Errores Críticos** detectados (o posibles causas raíz).
    - **Plan de Acción** paso a paso para solucionar el Login y los Correos.
    - Sugerencias de **Mejora de UX** y robustez.

---

_Por favor, solicita los archivos de configuración (`astro.config.mjs`, `Dockerfile` o configuración de Nixpacks si existe, `package.json`, y ejemplos de cómo se consumen las variables de entorno en el código) para comenzar el análisis._
