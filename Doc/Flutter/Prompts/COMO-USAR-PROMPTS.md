# Cómo Usar los Prompts con tu Agente IA

## 🎯 Objetivo

Este sistema de prompts está diseñado para que puedas **delegar completamente** el desarrollo de FashionStore Flutter a tu agente IA, fase por fase, con resultados consistentes y validables.

## 📖 Sistema de Fases

### Archivos Disponibles

```
Doc/Flutter/Prompts/
├── INDICE-PROMPTS.md              (Índice general)
├── COMO-USAR-PROMPTS.md           (Este archivo)
│
├── FASE-01-SETUP.md               (1-2h)  ✅ Creado
├── FASE-02-SISTEMA-DISENO.md      (2-3h)  ✅ Creado
├── FASE-03-WIDGETS-BASE.md        (4-6h)  ✅ Creado
├── FASE-04-AUTENTICACION.md       (6-8h)  ✅ Creado
├── FASE-05-NAVEGACION.md          (3-4h)  ✅ Creado
├── FASE-06-CATALOGO.md            (8-10h) ✅ Creado
├── FASE-07-CARRITO.md             (4-6h)  ✅ Creado
├── FASE-08-CHECKOUT.md            (8-10h) ✅ Creado
├── FASE-09-PEDIDOS.md             (8-10h) ✅ Creado
└── FASE-10-PERFIL.md              (4-6h)  ✅ Creado
```

**Total:** 10 fases | 50-65 horas | **MVP Completo**

## 🚀 Workflow Paso a Paso

### Paso 1: Preparación Inicial (Solo Primera Vez)

#### 1.1 Obtener Credenciales

```bash
# Necesitas estas variables:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
CLOUDINARY_CLOUD_NAME=fashionstore
```

**Obtener de:**
- Supabase: https://app.supabase.com → Tu proyecto → Settings → API
- Stripe: https://dashboard.stripe.com → Developers → API keys (Test mode)
- Cloudinary: Tu configuración actual

#### 1.2 Crear Archivo de Variables

Crea archivo `.env.local` en tu proyecto (NO commitear):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CLOUDINARY_CLOUD_NAME=fashionstore
```

---

### Paso 2: Ejecutar Fase por Fase

#### 2.1 Abrir Conversación con Agente IA

Usa Claude, ChatGPT, o cualquier agente IA con capacidad de desarrollo.

#### 2.2 Copiar Prompt Completo

**Abrir:** `Doc/Flutter/Prompts/FASE-01-SETUP.md`

**Copiar TODO el contenido** (desde el título hasta el final)

#### 2.3 Pegar en el Agente

```
[Pegar TODO el contenido del archivo FASE-01-SETUP.md]
```

#### 2.4 Dejar que el Agente Trabaje

El agente IA:
1. Leerá el prompt completo
2. Leerá la documentación referenciada
3. Ejecutará TODAS las tareas en orden
4. Marcará cada checklist item
5. Ejecutará comandos de verificación
6. Reportará "FASE XX COMPLETADA"

#### 2.5 Revisar Resultado

El agente debe responder con:

```
✅ FASE 01 COMPLETADA

Resumen:
- Proyecto Flutter creado: ✅
- Dependencias instaladas: 25 paquetes
- Estructura de carpetas: ✅ 
...

Archivos creados:
- lib/core/config/env_config.dart
- lib/core/config/app_constants.dart
...

Estado: LISTO PARA FASE 02
```

#### 2.6 Validación Manual (Opcional pero Recomendado)

```bash
# Navegar a carpeta del proyecto
cd fashionstore

# Verificar
flutter pub get
flutter analyze
```

#### 2.7 Commit (Recomendado)

```bash
git add .
git commit -m "feat: completar Fase 01 - Setup Inicial"
git tag fase-01
```

---

### Paso 3: Continuar con Siguiente Fase

#### 3.1 Abrir Siguiente Prompt

**Abrir:** `Doc/Flutter/Prompts/FASE-02-SISTEMA-DISENO.md`

#### 3.2 Copiar y Pegar

En la **misma conversación** con el agente (o nueva si prefieres):

```
Perfecto. La Fase 01 está completada.

Ahora continuamos con la FASE 02: Sistema de Diseño

[Pegar TODO el contenido de FASE-02-SISTEMA-DISENO.md]
```

#### 3.3 Repetir Proceso

El agente ejecutará la Fase 02 completa.

---

### Paso 4: Repetir hasta Fase 10

Continuar secuencialmente:
```
Fase 01 ✅ → Fase 02 ✅ → Fase 03 ✅ → ... → Fase 10 ✅
```

## 🎨 Template de Prompt (Para Copiar)

### Primera Fase de la Conversación

```
Hola, voy a desarrollar la aplicación Flutter de FashionStore siguiendo un sistema estructurado de fases.

Vamos a empezar con la FASE 01: Setup Inicial.

Por favor:
1. Lee el prompt COMPLETO que te proporcionaré
2. Lee los archivos de documentación referenciados
3. Ejecuta TODAS las tareas en orden secuencial
4. Marca cada item del checklist al completarlo
5. Ejecuta los comandos de verificación
6. Al final, proporciona el reporte estructurado de "FASE 01 COMPLETADA"

¿Listo? Aquí va el prompt:

─────────────────────────────────────

[Pegar aquí COMPLETO el contenido de FASE-01-SETUP.md]
```

### Fases Subsiguientes (Misma Conversación)

```
Perfecto, la Fase [X] está completada.

Continuamos con la FASE [X+1]: [Nombre]

─────────────────────────────────────

[Pegar aquí COMPLETO el contenido de FASE-[X+1]-XXX.md]
```

## ⚙️ Configuración de Variables de Entorno

### Al Ejecutar la App (Todas las Fases)

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Crear Script Helper (Recomendado)

**Windows PowerShell:** `run-dev.ps1`
```powershell
$env:SUPABASE_URL="https://xxx.supabase.co"
$env:SUPABASE_ANON_KEY="eyJ..."
$env:STRIPE_PUBLISHABLE_KEY="pk_test_..."

flutter run `
  --dart-define=SUPABASE_URL=$env:SUPABASE_URL `
  --dart-define=SUPABASE_ANON_KEY=$env:SUPABASE_ANON_KEY `
  --dart-define=STRIPE_PUBLISHABLE_KEY=$env:STRIPE_PUBLISHABLE_KEY
```

**Mac/Linux:** `run-dev.sh`
```bash
#!/bin/bash
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Uso:**
```bash
# Windows
.\run-dev.ps1

# Mac/Linux
chmod +x run-dev.sh
./run-dev.sh
```

## 📊 Tracking de Progreso

### Método 1: Archivo Manual

**Crear:** `PROGRESO-FLUTTER.md` en raíz del proyecto

```markdown
# Progreso Desarrollo Flutter FashionStore

## Estado General
- Inicio: 21/01/2026
- Última actualización: 21/01/2026
- Fase actual: 01

## Fases Completadas

- [x] Fase 01: Setup Inicial (21/01/2026) - 1.5h
  - Proyecto creado ✅
  - Dependencias instaladas ✅
  - Estructura de carpetas ✅
  
- [ ] Fase 02: Sistema de Diseño
- [ ] Fase 03: Widgets Base
- [ ] Fase 04: Autenticación
- [ ] Fase 05: Navegación
- [ ] Fase 06: Catálogo
- [ ] Fase 07: Carrito
- [ ] Fase 08: Checkout
- [ ] Fase 09: Pedidos
- [ ] Fase 10: Perfil

## Notas
- Fase 01: Fuentes pendientes de descargar e instalar
- Esperando completar Fase 02 antes de probar visualmente
```

### Método 2: Git Tags

Después de cada fase:

```bash
git add .
git commit -m "feat: completar Fase [XX] - [Nombre]"
git tag -a fase-[XX] -m "Fase [XX]: [Nombre] completada"
```

Ver progreso:
```bash
git tag -l
```

### Método 3: Branches por Fase

```bash
# Crear branch para la fase
git checkout -b fase-01-setup

# Al completar
git checkout main
git merge fase-01-setup
git tag fase-01
```

## 🚨 Manejo de Errores

### El Agente No Lee la Documentación

**Síntoma:** Inventa código diferente a las especificaciones

**Solución:**
```
Por favor, lee PRIMERO el archivo completo:
Doc/Flutter/[XX]-[NOMBRE].md

Debes seguir EXACTAMENTE las especificaciones del documento.
No inventes código diferente al especificado.
```

### El Agente Se Salta Tareas

**Síntoma:** No completa todas las tareas del checklist

**Solución:**
```
Revisa el checklist de la Fase [XX].
Faltan estas tareas:
- [ ] Tarea X.X: [nombre]
- [ ] Tarea X.Y: [nombre]

Por favor, completa estas tareas antes de reportar la fase como completada.
```

### Errores de Compilación

**Síntoma:** `flutter analyze` o `flutter run` fallan

**Solución:**
```bash
# Limpiar y regenerar
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

Si persiste, pedir al agente:
```
Hay errores de compilación. 
Por favor, ejecuta `flutter analyze` y corrige todos los errores.
```

### Build Runner No Genera Archivos

**Síntoma:** *.freezed.dart no se crean

**Solución:**
```
Ejecuta:
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs

Si hay errores en los modelos Freezed, corrígelos.
```

## ✅ Checklist por Fase

Antes de continuar a la siguiente fase, verificar:

- [ ] Agente reportó "FASE XX COMPLETADA"
- [ ] Checklist de la fase 100% marcado
- [ ] `flutter analyze` sin errores críticos
- [ ] `flutter run` compila (puede haber warnings)
- [ ] Commit realizado
- [ ] Tag creado (opcional)

## 🎓 Tips para Mejores Resultados

### 1. Una Fase a la Vez

No mezcles múltiples fases. Completa una antes de empezar la siguiente.

### 2. Revisa los Reportes

Lee el reporte "FASE XX COMPLETADA" cuidadosamente. Verifica que todos los archivos fueron creados.

### 3. Prueba Después de Fases Críticas

Ejecuta `flutter run` después de:
- Fase 02 (ver colores/fonts)
- Fase 03 (ver widgets)
- Fase 04 (test login)
- Fase 05 (test navegación)
- Fase 08 (test checkout completo)

### 4. Usa la Misma Conversación

Mantén la conversación con el agente para todas las fases. Esto le da contexto acumulativo.

### 5. Si el Agente Se Confunde

```
Por favor, resetea y lee nuevamente el archivo:
Doc/Flutter/[XX]-[NOMBRE].md

Sigue SOLO las especificaciones de ese archivo.
```

### 6. Commits Frecuentes

Haz commit después de cada fase. Esto te permite revertir si algo sale mal.

### 7. Valida Diseño Visual

Después de Fase 03, verifica que los colores sean exactos:
- Primary dark: #CCFF00 (verde neón)
- Accent: #FF4757 (rojo coral)
- Background dark: #0A0A0A

Si no coinciden, corrige inmediatamente.

## 📝 Ejemplo de Conversación Completa

### Mensaje 1: Iniciar

```
Hola, voy a desarrollar la app Flutter de FashionStore usando un sistema de 10 fases estructuradas.

Empezamos con FASE 01: Setup Inicial.

Instrucciones:
1. Lee el prompt COMPLETO
2. Lee la documentación referenciada
3. Ejecuta TODAS las tareas
4. Marca cada checklist
5. Reporta cuando termines

Aquí va el prompt:

─────────────────────────────────────

[PEGAR TODO FASE-01-SETUP.md]
```

### Respuesta Agente 1:

```
✅ FASE 01 COMPLETADA

Resumen:
- Proyecto creado: ✅
- Dependencias: 25 paquetes
...
```

### Mensaje 2: Continuar

```
Perfecto. Continuamos con FASE 02.

─────────────────────────────────────

[PEGAR TODO FASE-02-SISTEMA-DISENO.md]
```

### Respuesta Agente 2:

```
✅ FASE 02 COMPLETADA

Resumen:
- AppColors: ✅
- AppTypography: ✅
...
```

### Mensaje 3-10: Repetir

Seguir el mismo patrón hasta Fase 10.

## 🎯 Hitos Importantes

### Hito 1: Fundación (Fases 01-03)

**Resultado:** Proyecto base + widgets reutilizables

**Validación:**
```bash
flutter run
```

Debes ver TestWidgetsScreen con todos los widgets funcionando.

---

### Hito 2: Autenticación (Fases 04-05)

**Resultado:** Login funcional + navegación

**Validación:**
- Registrar usuario
- Login
- Ver bottom navigation
- Logout

---

### Hito 3: E-commerce Core (Fases 06-08)

**Resultado:** Tienda funcional con pagos

**Validación:**
- Explorar productos
- Añadir al carrito
- Checkout con Stripe
- Compra con tarjeta test

---

### Hito 4: Gestión (Fases 09-10)

**Resultado:** App completa de cliente

**Validación:**
- Ver pedidos
- Solicitar devolución
- Editar perfil

---

## 🔧 Herramientas Útiles

### VS Code Tasks (Opcional)

Crear `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Flutter: Run Dev",
      "type": "shell",
      "command": "flutter",
      "args": [
        "run",
        "--dart-define=SUPABASE_URL=${env:SUPABASE_URL}",
        "--dart-define=SUPABASE_ANON_KEY=${env:SUPABASE_ANON_KEY}",
        "--dart-define=STRIPE_PUBLISHABLE_KEY=${env:STRIPE_PUBLISHABLE_KEY}"
      ]
    },
    {
      "label": "Flutter: Build Runner",
      "type": "shell",
      "command": "flutter",
      "args": [
        "pub",
        "run",
        "build_runner",
        "build",
        "--delete-conflicting-outputs"
      ]
    }
  ]
}
```

### Snippets VS Code (Opcional)

Crear `.vscode/snippets.code-snippets`:

```json
{
  "Freezed Model": {
    "prefix": "freezed-model",
    "body": [
      "import 'package:freezed_annotation/freezed_annotation.dart';",
      "",
      "part '${TM_FILENAME_BASE}.freezed.dart';",
      "part '${TM_FILENAME_BASE}.g.dart';",
      "",
      "@freezed",
      "class ${1:ModelName} with _$${1:ModelName} {",
      "  const factory ${1:ModelName}({",
      "    required String id,",
      "    $0",
      "  }) = _${1:ModelName};",
      "",
      "  factory ${1:ModelName}.fromJson(Map<String, dynamic> json) => ",
      "      _$${1:ModelName}FromJson(json);",
      "}"
    ]
  }
}
```

## 📊 Estimación de Tiempo

### Por Sesión con Agente IA

**Sesión corta (2-3h):**
- Fase 01 + Fase 02 + Fase 03 (parcial)

**Sesión media (4-6h):**
- Fase 03 + Fase 04 + Fase 05

**Sesión larga (8h):**
- Fase 06 + Fase 07

**Fin de semana intensivo:**
- Fases 01-10 completas (~50-65h totales)
- Dividir en 2-3 días de 8h cada uno

### Plan Sugerido (3 Días)

**Día 1 (Sábado, 8h):**
- Mañana: Fases 01-03 (Setup, Diseño, Widgets)
- Tarde: Fases 04-05 (Auth, Navegación)
- **Resultado:** Fundación completa

**Día 2 (Domingo, 8h):**
- Mañana: Fase 06 (Catálogo completo)
- Tarde: Fases 07-08 (Carrito, Checkout)
- **Resultado:** E-commerce funcional

**Día 3 (Lunes, 6h):**
- Mañana: Fase 09 (Pedidos/Devoluciones)
- Tarde: Fase 10 (Perfil)
- **Resultado:** MVP COMPLETO

## 🆘 Soporte y Troubleshooting

### Problema: Agente se queda atascado

```
Por favor, continúa con la siguiente tarea del checklist.

Tarea pendiente: [X.Y]
[Copiar descripción de la tarea]
```

### Problema: Código no compila

```
Hay errores de compilación.

Ejecuta:
flutter analyze

Y corrige TODOS los errores mostrados.
```

### Problema: Diseño incorrecto

```
El diseño no coincide con las especificaciones.

Revisa Doc/Flutter/REFERENCIA-RAPIDA.md

Colores correctos:
- Primary dark mode: #CCFF00
- Accent: #FF4757
- Background dark: #0A0A0A

Por favor, corrige los colores.
```

### Problema: Build runner falla

```
Ejecuta estos comandos en orden:

1. flutter clean
2. flutter pub get
3. flutter pub run build_runner build --delete-conflicting-outputs

Si hay errores en modelos Freezed, corrígelos antes de regenerar.
```

## 🎉 Al Completar Todas las Fases

Después de Fase 10:

```
🎉 ¡FELICITACIONES!

Has completado el desarrollo del MVP de FashionStore Flutter.

Tu app ahora tiene:
✅ Autenticación completa
✅ Catálogo con filtros y búsqueda
✅ Carrito persistente
✅ Checkout con Stripe
✅ Gestión de pedidos
✅ Sistema de devoluciones
✅ Perfil de usuario

Próximos pasos opcionales:
1. Fase 11: Newsletter (si quieres)
2. Fase 12: Panel Admin (si quieres gestionar desde móvil)
3. Testing extensivo
4. Deploy a stores

O puedes empezar a usar la app y agregar features gradualmente.
```

## 📞 Contacto

Si tienes dudas durante el proceso:

1. Revisa `INDICE-PROMPTS.md`
2. Consulta `REFERENCIA-RAPIDA.md` para valores exactos
3. Lee `00-GUIA-PARA-AGENTE-IA.md` para contexto general
4. Revisa la documentación del módulo específico

---

**Versión:** 1.0  
**Creado:** 21 Enero 2026  
**Fases disponibles:** 10/10 (MVP Completo)

**¡Éxito con el desarrollo!** 🚀
