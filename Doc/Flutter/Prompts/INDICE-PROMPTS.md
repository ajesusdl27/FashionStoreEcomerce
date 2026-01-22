# Índice de Prompts por Fase - FashionStore Flutter

## 📖 Cómo Usar Estos Prompts

### Para el Desarrollador (tú)

1. **Abre el prompt de la fase actual** (ej: `FASE-01-SETUP.md`)
2. **Copia TODO el contenido** del archivo
3. **Pégalo en tu agente IA** (Claude, ChatGPT, etc.)
4. **El agente leerá las instrucciones y ejecutará las tareas**
5. **Espera a que reporte "FASE XX COMPLETADA"**
6. **Continúa con la siguiente fase**

### Para el Agente IA

Cada prompt contiene:
- ✅ Contexto de la fase
- ✅ Documentación a leer
- ✅ Tareas específicas paso a paso
- ✅ Checklist de verificación
- ✅ Código esperado
- ✅ Comandos de prueba
- ✅ Formato de reporte final

## 📋 Lista de Prompts

### ✅ Prompts Completados

#### 🏗️ Core (Módulos 1-5)

| Fase | Archivo | Módulo | Tiempo Est. | Estado |
|------|---------|--------|-------------|--------|
| 01 | `FASE-01-SETUP.md` | Setup Inicial | 1-2h | ✅ Listo |
| 02 | `FASE-02-SISTEMA-DISENO.md` | Sistema de Diseño | 2-3h | ✅ Listo |
| 03 | `FASE-03-WIDGETS-BASE.md` | Widgets Base | 4-6h | ✅ Listo |
| 04 | `FASE-04-AUTENTICACION.md` | Autenticación | 6-8h | ✅ Listo |
| 05 | `FASE-05-NAVEGACION.md` | Navegación | 3-4h | ✅ Listo |

#### 🛍️ E-commerce (Módulos 6-8)

| Fase | Archivo | Módulo | Tiempo Est. | Estado |
|------|---------|--------|-------------|--------|
| 06 | `FASE-06-CATALOGO.md` | Catálogo | 8-10h | ✅ Listo |
| 07 | `FASE-07-CARRITO.md` | Carrito | 4-6h | ✅ Listo |
| 08 | `FASE-08-CHECKOUT.md` | Checkout | 8-10h | ✅ Listo |

#### 📦 Gestión (Módulos 9-10)

| Fase | Archivo | Módulo | Tiempo Est. | Estado |
|------|---------|--------|-------------|--------|
| 09 | `FASE-09-PEDIDOS.md` | Pedidos/Devoluciones | 8-10h | ✅ Listo |
| 10 | `FASE-10-PERFIL.md` | Perfil Usuario | 4-6h | ✅ Listo |

**Subtotal MVP:** 10 fases | 50-65 horas | **APP FUNCIONAL COMPLETA** ✅

### 🔄 Prompts Pendientes (Opcionales)

| Fase | Archivo | Módulo | Tiempo Est. | Estado |
|------|---------|--------|-------------|--------|
| 11 | `FASE-11-NEWSLETTER.md` | Newsletter | 2-3h | 📝 Por crear |
| 12 | `FASE-12-ADMIN.md` | Panel Admin | 15-20h | 📝 Por crear |
| 13 | `FASE-13-TESTING.md` | Testing | 6-8h | 📝 Por crear |
| 14 | `FASE-14-DEPLOY.md` | Despliegue | 4-6h | 📝 Por crear |

**Total opcional:** 4 fases | 27-37 horas adicionales

## 🎯 Orden de Ejecución Recomendado

### Opción 1: Secuencial Completo (Recomendado)

```
Fase 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14
```

**Resultado:** Aplicación 100% completa con todas las funcionalidades.

### Opción 2: MVP Rápido (Para producir rápido)

```
Fases Core: 01 → 02 → 03 → 04 → 05
Fases E-commerce: 06 → 07 → 08
```

**Resultado:** Tienda funcional básica (usuarios compran productos).

**Luego agregar:** 09 → 10 (gestión) → 12 (admin) → 13 (testing) → 14 (deploy)

### Opción 3: Solo Cliente (Sin Admin)

```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10
```

**Resultado:** App completa para clientes, admin se maneja desde web.

## 📝 Template de Uso

### Prompt Inicial para el Agente

```
Hola, voy a desarrollar la aplicación Flutter de FashionStore siguiendo un sistema de fases estructuradas.

Estoy en la FASE [número]: [nombre]

Por favor:
1. Lee el prompt completo que te voy a proporcionar
2. Ejecuta TODAS las tareas en orden
3. Marca cada checklist item al completar
4. Al final, proporciona el reporte de "FASE XX COMPLETADA"

¿Listo para empezar?

[Pegar aquí el contenido completo del archivo FASE-XX-XXX.md]
```

### Continuación entre Fases

```
Perfecto, la Fase [X] está completada.

Ahora continuamos con la FASE [X+1]: [nombre]

[Pegar contenido del siguiente archivo]
```

## ⚙️ Configuración Previa (Solo Primera Vez)

Antes de empezar con Fase 01, asegúrate de tener:

### 1. Variables de Entorno

Necesitarás estas variables para ejecutar la app:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
CLOUDINARY_CLOUD_NAME=fashionstore
```

**Obtener desde:**
- Supabase: https://app.supabase.com → Tu proyecto → Settings → API
- Stripe: https://dashboard.stripe.com → Developers → API keys
- Cloudinary: https://cloudinary.com → Dashboard

### 2. Fuentes Tipográficas

Descargar de Google Fonts:
- Bebas Neue: https://fonts.google.com/specimen/Bebas+Neue
- Oswald: https://fonts.google.com/specimen/Oswald
- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk

**Colocar en:** `assets/fonts/` después de Fase 01.

### 3. Backend Supabase

El backend ya debe estar configurado:
- ✅ Tablas creadas (ver `Doc/migrations/`)
- ✅ RLS policies habilitadas
- ✅ RPC functions creadas
- ✅ Storage buckets configurados

## 🔍 Tracking de Progreso

### Método Manual

Crear archivo `PROGRESO.md` en la raíz del proyecto:

```markdown
# Progreso Desarrollo Flutter

## Fases Completadas

- [x] Fase 01: Setup Inicial (21/01/2026)
- [x] Fase 02: Sistema de Diseño (21/01/2026)
- [ ] Fase 03: Widgets Base
- [ ] Fase 04: Autenticación
...

## Notas
- Fase 01: Sin problemas
- Fase 02: Fuentes pendientes de instalar
```

### Método con Git

```bash
# Después de cada fase completada
git add .
git commit -m "feat: completar Fase 02 - Sistema de Diseño"
git tag fase-02
```

## 🆘 Troubleshooting

### Problema: Agente IA no sigue instrucciones

**Solución:** 
1. Asegúrate de copiar el prompt COMPLETO
2. Pídele explícitamente que lea todo antes de empezar
3. Si se salta pasos, señálale el checklist

### Problema: Errores de compilación entre fases

**Solución:**
```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### Problema: Agente inventa código no especificado

**Solución:**
- Recuérdale: "Sigue EXACTAMENTE las especificaciones del archivo .md"
- Muéstrale la sección específica del documento

### Problema: No encuentra archivos de documentación

**Solución:**
- Verifica que la ruta sea correcta: `Doc/Flutter/XX-NOMBRE.md`
- Si es necesario, copia y pega secciones relevantes del documento en el prompt

## 📞 Soporte

Si un prompt no está claro o falta información:

1. **Revisa la documentación del módulo** (`Doc/Flutter/XX-NOMBRE.md`)
2. **Consulta REFERENCIA-RAPIDA.md** para valores exactos
3. **Revisa 00-GUIA-PARA-AGENTE-IA.md** para contexto general

## ✨ Tips para Mejores Resultados

### 1. Un Prompt a la Vez
No mezcles múltiples fases en una conversación. Completa una antes de continuar.

### 2. Verifica Cada Checklist
Asegúrate de que el agente marca cada item del checklist antes de continuar.

### 3. Prueba Después de Cada Fase
Ejecuta `flutter run` después de cada fase para detectar problemas temprano.

### 4. Commits Frecuentes
Haz commit después de cada fase completada para poder revertir si es necesario.

### 5. Lee el Reporte Final
El agente debe proporcionar un reporte estructurado al final. Revísalo.

---

**Última actualización:** 21 Enero 2026  
**Versión:** 1.0  
**Prompts creados:** 2/14  
**Estado:** En construcción
