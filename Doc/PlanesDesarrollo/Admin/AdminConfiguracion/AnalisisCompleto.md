# 🔍 Auditoría Completa del Módulo de Configuración - Admin Panel

**Proyecto:** FashionStore  
**Fecha:** 20 de enero de 2026  
**Versión:** 1.0  
**Autor:** Desarrollador Senior Full-Stack

---

## 📋 Resumen Ejecutivo

El módulo de Configuración del Admin Panel de FashionStore presenta una **funcionalidad básica implementada** pero con **múltiples carencias críticas** que impactan tanto la usabilidad como la consistencia del sistema. Se han identificado **47 hallazgos** clasificados por severidad:

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| 🔴 CRÍTICO | 8 | Funcionalidad rota o datos inconsistentes |
| 🟠 ALTO | 12 | Experiencia degradada o riesgo de seguridad |
| 🟡 MEDIO | 15 | Usabilidad afectada |
| 🟢 BAJO | 12 | Mejoras de calidad |

---

## 1. 📊 Estado Actual del Módulo

### 1.1 Estructura de Archivos

```
src/pages/admin/configuracion/
├── index.astro          # Única página de configuración

src/pages/api/admin/
├── configuracion.ts     # Único endpoint PUT para guardar

Doc/migrations/
├── 001_create_tables.sql    # Definición inicial de settings
├── 005_settings_value.sql   # Añade columna value
├── 008_social_settings.sql  # Redes sociales y value_number
```

### 1.2 Configuraciones Existentes (Base de Datos)

| Key | Tipo | Descripción | ¿En UI? |
|-----|------|-------------|---------|
| `offers_enabled` | boolean | Flash Offers activas | ✅ |
| `flash_offers_end` | text | Fecha fin ofertas | ✅ |
| `store_name` | text | Nombre tienda | ✅ |
| `store_email` | text | Email contacto | ✅ |
| `store_phone` | text | Teléfono | ✅ |
| `store_address` | text | Dirección | ✅ |
| `free_shipping_threshold` | number | Umbral envío gratis | ✅ |
| `shipping_cost` | number | Coste envío | ✅ |
| `social_instagram` | text | URL Instagram | ✅ |
| `social_twitter` | text | URL Twitter/X | ✅ |
| `social_tiktok` | text | URL TikTok | ✅ |
| `social_youtube` | text | URL YouTube | ✅ |
| `currency` | text | Moneda (EUR) | ❌ |
| `tax_rate` | number | IVA % | ❌ |
| `meta_description` | text | SEO | ❌ |
| `maintenance_mode` | boolean | Modo mantenimiento | ❌ |
| `return_window_days` | number | Días devolución | ❌ |

---

## 2. 🔴 HALLAZGOS CRÍTICOS

### HC-01: Valores de Envío Hardcodeados (No Usan Configuración)

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** 
- [src/lib/stripe.ts](src/lib/stripe.ts#L14-L15)
- [src/pages/carrito.astro](src/pages/carrito.astro#L107-L108)
- [src/pages/envios.astro](src/pages/envios.astro#L45-L60)

**Problema:**
Los valores de envío están **hardcodeados en múltiples lugares** en vez de usar la tabla `settings`:

```typescript
// src/lib/stripe.ts
export const FREE_SHIPPING_THRESHOLD = 50;  // ❌ Hardcodeado
export const SHIPPING_COST = 499;           // ❌ Hardcodeado

// src/pages/carrito.astro
const FREE_SHIPPING_THRESHOLD = 50;  // ❌ Duplicado
const SHIPPING_COST = 4.99;          // ❌ Duplicado
```

**Impacto:**
- Cambios en el admin panel **NO afectan** al checkout real
- Inconsistencia entre lo que muestra el carrito y lo que se cobra
- El administrador cree que ha cambiado el precio pero nada cambia

**Reproducción:**
1. Ir a `/admin/configuracion`
2. Cambiar "Coste de envío estándar" a 6.99€
3. Guardar cambios
4. Ir al carrito con productos
5. **Observar que sigue mostrando 4.99€**

---

### HC-02: Datos de Contacto Hardcodeados en Páginas Públicas

**Severidad:** 🔴 CRÍTICO  
**Ubicación:**
- [src/pages/contacto.astro](src/pages/contacto.astro#L52-L54)
- [src/pages/privacidad.astro](src/pages/privacidad.astro#L36-L39)
- [src/pages/envios.astro](src/pages/envios.astro#L45-L55)

**Problema:**
Las páginas públicas tienen datos de contacto **hardcodeados** que no leen de la configuración:

```astro
<!-- contacto.astro -->
<p class="text-primary">soporte@fashionstore.com</p>  <!-- ❌ Hardcodeado -->
<p class="text-primary">+34 900 123 456</p>           <!-- ❌ Hardcodeado -->

<!-- privacidad.astro -->
<strong>Email:</strong> privacidad@fashionstore.com   <!-- ❌ Hardcodeado -->
<strong>Domicilio:</strong> Calle de la Moda 123...   <!-- ❌ Hardcodeado -->
```

**Impacto:**
- Información de contacto desactualizada para clientes
- Inconsistencia entre admin y web pública
- Problemas legales potenciales (RGPD requiere datos actualizados)

---

### HC-03: Moneda EUR Hardcodeada en Todo el Sistema

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** +20 archivos con `currency: "EUR"` o `es-ES`

**Problema:**
Aunque existe el setting `currency` en la base de datos, **nunca se lee ni usa**:

```typescript
// src/lib/formatters.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',  // ❌ Hardcodeado, ignora settings.currency
  }).format(price);
};
```

**Archivos afectados:**
- `src/lib/formatters.ts`
- `src/lib/email-templates.ts`
- `src/pages/index.astro`
- `src/pages/carrito.astro`
- `src/pages/productos/[slug].astro`
- `src/pages/cuenta/*.astro` (todos)
- `src/pages/checkout/exito.astro`
- ... y más

**Impacto:**
- Imposible expandir a otros mercados (UK, USA, etc.)
- El setting de moneda es inútil

---

### HC-04: Plazo de Devolución Inconsistente

**Severidad:** 🔴 CRÍTICO  
**Ubicación:**
- [src/pages/index.astro](src/pages/index.astro#L322) - "30 días devolución"
- [src/pages/envios.astro](src/pages/envios.astro#L117-L119) - "30 días naturales"
- [src/pages/api/returns.ts](src/pages/api/returns.ts#L67-L72) - Lee de settings

**Problema:**
El plazo de devolución está hardcodeado en el frontend pero la API sí lee de configuración:

```astro
<!-- index.astro - HARDCODEADO -->
<span>30 días devolución</span>

<!-- envios.astro - HARDCODEADO -->
<p>Tienes 30 días naturales...</p>
```

```typescript
// api/returns.ts - LEE DE SETTINGS ✅
const returnWindowDays = settings?.value_number || 30;
```

**Impacto:**
- Si admin cambia a 14 días, la web sigue diciendo 30
- Clientes confundidos por información contradictoria
- Posibles problemas legales

---

### HC-05: Email de Contacto Usa Variables de Entorno, No Configuración

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** [src/lib/email.ts](src/lib/email.ts#L178)

**Problema:**
El sistema de emails usa `import.meta.env.CONTACT_EMAIL` en vez del `store_email` de settings:

```typescript
// email.ts
const contactEmail = import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es';  // ❌
```

**Impacto:**
- Cambiar email en admin panel no afecta a los emails enviados
- Requiere redespliegue para cambiar email de contacto

---

### HC-06: Falta Validación Backend Robusta

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** [src/pages/api/admin/configuracion.ts](src/pages/api/admin/configuracion.ts)

**Problema:**
El endpoint acepta cualquier dato sin validar tipos ni rangos:

```typescript
// configuracion.ts - SIN VALIDACIÓN
const { settings } = await request.json();

for (const setting of settings) {
  // ❌ No valida que key sea válida
  // ❌ No valida tipos de datos
  // ❌ No valida rangos (ej: shipping_cost >= 0)
  // ❌ No valida formatos (emails, URLs)
  await authClient.from('settings').upsert(updateData);
}
```

**Impacto:**
- Se pueden guardar valores inválidos (shipping_cost = -100)
- Se pueden crear settings arbitrarias (key injection)
- Errores de tipo rompen la aplicación

---

### HC-07: Falta Endpoint GET para Configuración

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** [src/pages/api/admin/configuracion.ts](src/pages/api/admin/configuracion.ts)

**Problema:**
Solo existe el método `PUT`. No hay `GET` para obtener configuraciones desde el cliente.

**Impacto:**
- Imposible crear una librería/hook compartida para obtener settings
- Cada componente hace su propia query a Supabase
- Duplicación de código y queries innecesarias

---

### HC-08: RLS Policies Permiten Lectura Pública de Settings

**Severidad:** 🔴 CRÍTICO  
**Ubicación:** [Doc/migrations/002_rls_policies.sql](Doc/migrations/002_rls_policies.sql#L91-L96)

**Problema:**
La política permite lectura pública de TODAS las configuraciones:

```sql
-- Settings: Lectura pública
CREATE POLICY "Settings: Public read" 
  ON settings FOR SELECT 
  USING (true);  -- ❌ Todo público, incluyendo API keys si las hubiera
```

**Impacto:**
- Si se almacenan API keys o tokens, serían públicos
- Exposición de configuración interna del negocio

---

## 3. 🟠 HALLAZGOS ALTOS

### HA-01: Falta Sección de Impuestos (IVA)

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe en UI

**Problema:**
Aunque existe `tax_rate` en la base de datos, no hay forma de configurarlo desde el admin.

**Impacto:**
- IVA fijo al 21% sin posibilidad de cambio
- No soporta diferentes tasas por región
- No soporta productos exentos

---

### HA-02: Falta Configuración de Métodos de Pago

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe

**Problema:**
No hay forma de activar/desactivar métodos de pago o configurar credenciales desde el admin.

**Impacto:**
- Requiere acceso al código para cambiar métodos de pago
- No hay visibilidad de qué métodos están activos

---

### HA-03: Falta Modo Mantenimiento Funcional

**Severidad:** 🟠 ALTO  
**Ubicación:** Existe en BD pero no en UI ni middleware

**Problema:**
El setting `maintenance_mode` existe pero:
- No aparece en la UI de configuración
- El middleware no lo verifica
- No hay página de mantenimiento

---

### HA-04: Falta Configuración de Email/SMTP

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe

**Problema:**
Las credenciales de Resend están en variables de entorno sin visibilidad desde admin.

**Faltante:**
- Proveedor de email (Resend, SendGrid, SMTP)
- Email remitente
- Configuración de plantillas
- Test de conexión

---

### HA-05: Sin Logs de Auditoría

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe

**Problema:**
No se registra quién cambió qué configuración y cuándo.

**Impacto:**
- Imposible rastrear cambios problemáticos
- Sin cumplimiento de auditoría empresarial

---

### HA-06: Falta Validación Frontend de URLs

**Severidad:** 🟠 ALTO  
**Ubicación:** [src/pages/admin/configuracion/index.astro](src/pages/admin/configuracion/index.astro#L310-L370)

**Problema:**
Los campos de redes sociales son `type="url"` pero no validan el dominio correcto:

```html
<input type="url" id="social_instagram" ...>
<!-- ❌ Acepta cualquier URL, no valida que sea instagram.com -->
```

---

### HA-07: Falta Configuración de Logo y Favicon

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe

**Problema:**
No hay forma de subir/cambiar el logo y favicon desde configuración.

---

### HA-08: Sin Previsualización de Cambios

**Severidad:** 🟠 ALTO  
**Ubicación:** UI de configuración

**Problema:**
Los cambios se guardan directamente sin opción de previsualizar el impacto.

---

### HA-09: Falta Configuración de SEO

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe en UI

**Problema:**
Aunque `meta_description` existe en BD, no hay sección de SEO completa:
- Title por defecto
- Meta description
- OG tags
- Robots.txt settings

---

### HA-10: Falta Backup/Restore de Configuración

**Severidad:** 🟠 ALTO  
**Ubicación:** No existe

**Problema:**
No hay forma de exportar/importar configuración.

---

### HA-11: Sin Confirmación para Cambios Críticos

**Severidad:** 🟠 ALTO  
**Ubicación:** UI de configuración

**Problema:**
Cambios críticos (como deshabilitar ofertas) se guardan sin confirmación.

---

### HA-12: Falta Caché de Configuraciones

**Severidad:** 🟠 ALTO  
**Ubicación:** Todo el sistema

**Problema:**
Cada request hace query a la BD para obtener settings. Sin caché ni invalidación.

---

## 4. 🟡 HALLAZGOS MEDIOS

### HM-01: Sin Tooltips Explicativos

**Severidad:** 🟡 MEDIO  
**Impacto:** UX para usuarios no técnicos

Los campos no tienen explicaciones contextuales. Ejemplo:
- "Fecha y hora de fin de ofertas" - ¿Qué pasa si no pongo fecha?
- "Envío gratis desde" - ¿Se aplica automáticamente?

---

### HM-02: Falta Indicador de Cambios Sin Guardar

**Severidad:** 🟡 MEDIO  
**Impacto:** UX - Usuarios pueden perder cambios

No hay indicador visual de que hay cambios pendientes.

---

### HM-03: Sin Organización por Pestañas/Acordeones

**Severidad:** 🟡 MEDIO  
**Impacto:** UX - Página muy larga

Todo está en una sola página scroll. Para muchas más configuraciones, necesitará tabs.

---

### HM-04: Valores por Defecto No Documentados

**Severidad:** 🟡 MEDIO  
**Impacto:** Confusión sobre comportamiento

```typescript
value={getSettingValue("shipping_cost", "4.99")}  // ❓ ¿Por qué 4.99?
```

---

### HM-05: Falta Validación de Teléfono

**Severidad:** 🟡 MEDIO  
**Impacto:** Datos inválidos posibles

```html
<input type="tel" id="store_phone" ...>
<!-- ❌ Acepta cualquier texto, no valida formato -->
```

---

### HM-06: Sin Historial de Versiones de Configuración

**Severidad:** 🟡 MEDIO  
**Impacto:** No hay rollback

---

### HM-07: Falta Sección de Horarios de Atención

**Severidad:** 🟡 MEDIO  
**Impacto:** Información incompleta

---

### HM-08: Sin Configuración de Zonas de Envío

**Severidad:** 🟡 MEDIO  
**Impacto:** No soporta múltiples zonas con diferentes costes

---

### HM-09: Duplicación de Función formatPrice

**Severidad:** 🟡 MEDIO  
**Impacto:** Mantenibilidad

La función `formatPrice` está definida en:
- `src/lib/formatters.ts`
- `src/lib/email-templates.ts`
- `src/pages/index.astro`
- `src/pages/carrito.astro`
- ... y 5+ más lugares

---

### HM-10: Falta Configuración de Stock Mínimo/Alertas

**Severidad:** 🟡 MEDIO  
**Impacto:** Gestión de inventario limitada

---

### HM-11: Sin Configuración de Notificaciones Admin

**Severidad:** 🟡 MEDIO  
**Impacto:** Admin no configura qué alertas recibe

---

### HM-12: Falta Sección de Políticas Legales Editables

**Severidad:** 🟡 MEDIO  
**Impacto:** Páginas legales hardcodeadas

---

### HM-13: Sin Configuración de Cookies/GDPR

**Severidad:** 🟡 MEDIO  
**Impacto:** Cumplimiento legal

---

### HM-14: Mensaje de Éxito Desaparece Muy Rápido

**Severidad:** 🟡 MEDIO  
**Impacto:** UX - Puede no verse

```javascript
setTimeout(() => { messageDiv.className = "hidden"; }, 3000);  // 3s es poco
```

---

### HM-15: Sin Test de Conexión para Redes Sociales

**Severidad:** 🟡 MEDIO  
**Impacto:** No verifica que URLs sean accesibles

---

## 5. 🟢 HALLAZGOS BAJOS

### HL-01: Sin Iconos en Campos de Redes Sociales
### HL-02: Falta Placeholder en Campos Vacíos
### HL-03: Sin Contador de Caracteres para Descripciones
### HL-04: Falta Botón de Reset a Valores Por Defecto
### HL-05: Sin Keyboard Shortcuts para Guardar (Ctrl+S)
### HL-06: Falta Breadcrumb en la Página
### HL-07: Sin Estado Activo Visual en Sidebar
### HL-08: Falta Información de Última Modificación
### HL-09: Sin Autoguardado de Borradores
### HL-10: Falta Dark Mode Preview
### HL-11: Sin Formato de Moneda en Preview de Envío
### HL-12: Falta Link a Documentación

---

## 6. 📈 Matriz de Impacto

```
                    IMPACTO
                Bajo    Alto
              ┌──────┬──────┐
        Alta  │ HM-* │ HC-* │  ← Priorizar
URGENCIA      │      │ HA-* │
              ├──────┼──────┤
        Baja  │ HL-* │ HM-* │
              └──────┴──────┘
```

---

## 7. 📊 Análisis de Cobertura

### Configuraciones que DEBERÍAN existir pero NO existen:

| Categoría | Configuración | Prioridad |
|-----------|---------------|-----------|
| **E-commerce** | Métodos de pago activos | 🔴 Alta |
| | Zonas de envío | 🟠 Media |
| | Tiempos de entrega | 🟠 Media |
| | Stock mínimo para alertas | 🟡 Baja |
| **Email** | Proveedor (SMTP/Resend) | 🔴 Alta |
| | Email remitente | 🔴 Alta |
| | Activar/desactivar emails | 🟠 Media |
| **SEO** | Título por defecto | 🟠 Media |
| | Meta description | 🟠 Media |
| | Google Analytics ID | 🟡 Baja |
| **Legal** | Texto política privacidad | 🟠 Media |
| | Texto términos y condiciones | 🟠 Media |
| | Banner de cookies | 🟠 Media |
| **Branding** | Logo principal | 🔴 Alta |
| | Favicon | 🔴 Alta |
| | Colores tema | 🟡 Baja |
| **Avanzado** | Modo mantenimiento | 🔴 Alta |
| | Limite de items por página | 🟡 Baja |
| | Caché TTL | 🟡 Baja |

---

## 8. 🔐 Análisis de Seguridad

### 8.1 Autenticación/Autorización ✅

```typescript
// configuracion.ts - CORRECTO
if (!user?.user_metadata?.is_admin) {
  return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
}
```

### 8.2 RLS Policies ⚠️

```sql
-- PROBLEMA: Lectura pública de todo
CREATE POLICY "Settings: Public read" ON settings FOR SELECT USING (true);
```

**Recomendación:** Crear columna `is_public` y filtrar:
```sql
CREATE POLICY "Settings: Public read public" ON settings 
  FOR SELECT USING (is_public = true);
```

### 8.3 Validación de Entrada ❌

**No existe.** Se debe implementar schema validation (Zod).

### 8.4 Sanitización ⚠️

Los valores se guardan directamente sin sanitizar HTML/scripts.

---

## 9. 🎯 Conclusiones

El módulo de configuración actual es **funcional pero incompleto**. Los problemas más graves son:

1. **Desconexión total** entre configuración guardada y comportamiento real (envío, emails)
2. **Datos hardcodeados** en páginas públicas
3. **Sin validación** de datos en backend
4. **Falta de funcionalidades básicas** esperadas en un e-commerce

El módulo necesita una **refactorización significativa** para cumplir su propósito de permitir a usuarios no técnicos gestionar la tienda sin intervención de desarrolladores.

---

## 10. 📚 Referencias

- [Archivo principal de configuración](src/pages/admin/configuracion/index.astro)
- [API de configuración](src/pages/api/admin/configuracion.ts)
- [Migraciones de settings](Doc/migrations/008_social_settings.sql)
- [Constantes de envío](src/lib/stripe.ts)
