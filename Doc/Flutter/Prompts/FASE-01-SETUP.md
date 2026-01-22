# Prompt para Fase 01: Setup Inicial

## 📋 Contexto

Soy un agente IA que va a desarrollar la aplicación móvil Flutter de FashionStore. Este es el primer módulo de implementación.

## 🎯 Objetivo de esta Fase

Crear la estructura base del proyecto Flutter con todas las dependencias necesarias, configuración de entorno y estructura de carpetas.

## 📚 Documentación a Leer

**IMPORTANTE:** Lee completamente estos archivos antes de empezar:

1. `Doc/Flutter/00-GUIA-PARA-AGENTE-IA.md` (Contexto general)
2. `Doc/Flutter/01-SETUP-INICIAL.md` (Especificaciones de este módulo)

## ✅ Tareas a Completar

### Tarea 1.1: Crear Proyecto Flutter

```bash
flutter create fashionstore --org com.fashionstore
cd fashionstore
```

**Checklist:**
- [ ] Proyecto creado sin errores
- [ ] Estructura de carpetas Flutter estándar generada

---

### Tarea 1.2: Configurar pubspec.yaml

**Archivo:** `pubspec.yaml`

**Acción:** Reemplazar el contenido del archivo con las dependencias especificadas en `01-SETUP-INICIAL.md` sección "Dependencias Requeridas".

**Dependencias principales a incluir:**
- flutter_riverpod: ^2.4.0
- riverpod_annotation: ^2.3.0
- freezed_annotation: ^2.4.1
- json_annotation: ^4.8.1
- go_router: ^13.0.0
- supabase_flutter: ^2.0.0
- flutter_stripe: ^10.0.0
- webview_flutter: ^4.4.0
- flutter_secure_storage: ^9.0.0
- shared_preferences: ^2.2.0
- http: ^1.1.0
- cached_network_image: ^3.3.0
- shimmer: ^3.0.0
- photo_view: ^0.14.0
- flutter_svg: ^2.0.9
- intl: ^0.19.0
- url_launcher: ^6.2.0

**Y dev_dependencies:**
- build_runner: ^2.4.0
- riverpod_generator: ^2.3.0
- freezed: ^2.4.5
- json_serializable: ^6.7.0

**Fuentes a configurar:**
```yaml
fonts:
  - family: BebasNeue
    fonts:
      - asset: assets/fonts/BebasNeue-Regular.ttf
  - family: Oswald
    fonts:
      - asset: assets/fonts/Oswald-Regular.ttf
      - asset: assets/fonts/Oswald-Medium.ttf
        weight: 500
      - asset: assets/fonts/Oswald-SemiBold.ttf
        weight: 600
      - asset: assets/fonts/Oswald-Bold.ttf
        weight: 700
  - family: SpaceGrotesk
    fonts:
      - asset: assets/fonts/SpaceGrotesk-Regular.ttf
      - asset: assets/fonts/SpaceGrotesk-Medium.ttf
        weight: 500
      - asset: assets/fonts/SpaceGrotesk-Bold.ttf
        weight: 700
```

**Checklist:**
- [ ] Todas las dependencias agregadas
- [ ] Fuentes configuradas
- [ ] `flutter pub get` ejecutado sin errores

---

### Tarea 1.3: Crear Estructura de Carpetas

**Acción:** Crear toda la estructura de carpetas especificada en `01-SETUP-INICIAL.md` sección "Estructura de Carpetas Completa".

**Carpetas principales:**
```
lib/
├── core/
│   ├── config/
│   ├── router/
│   ├── theme/
│   ├── utils/
│   ├── widgets/
│   └── services/
└── features/
    ├── auth/
    ├── catalog/
    ├── cart/
    ├── checkout/
    ├── orders/
    ├── profile/
    ├── returns/
    ├── newsletter/
    └── admin/
```

**Checklist:**
- [ ] Todas las carpetas creadas
- [ ] Archivos `.gitkeep` en carpetas vacías (opcional)

---

### Tarea 1.4: Configurar Variables de Entorno

**Archivo:** `lib/core/config/env_config.dart`

**Acción:** Crear archivo con la clase EnvConfig que maneja variables de entorno.

**Especificación:** Ver `01-SETUP-INICIAL.md` sección "Configuración de Variables de Entorno".

**Contenido esperado:**
```dart
class EnvConfig {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');
  static const stripePublishableKey = String.fromEnvironment('STRIPE_PUBLISHABLE_KEY', defaultValue: '');
  static const cloudinaryCloudName = String.fromEnvironment('CLOUDINARY_CLOUD_NAME', defaultValue: 'fashionstore');
  
  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && 
      supabaseAnonKey.isNotEmpty &&
      stripePublishableKey.isNotEmpty;
}
```

**Checklist:**
- [ ] Archivo creado
- [ ] Todas las variables definidas
- [ ] Validación `isConfigured` implementada

---

### Tarea 1.5: Crear AppConstants

**Archivo:** `lib/core/config/app_constants.dart`

**Acción:** Crear archivo con constantes de la aplicación.

**Especificación:** Ver `01-SETUP-INICIAL.md` sección correspondiente.

**Checklist:**
- [ ] Constantes de envío definidas
- [ ] Constantes de devoluciones
- [ ] Constantes de carrito
- [ ] Constantes de paginación
- [ ] Regex patterns

---

### Tarea 1.6: Configurar main.dart

**Archivo:** `lib/main.dart`

**Acción:** Configurar punto de entrada de la aplicación.

**Especificación:** Ver `01-SETUP-INICIAL.md` sección "Inicialización en main.dart".

**Debe incluir:**
- Inicialización de Supabase
- Inicialización de Stripe
- Validación de configuración
- ProviderScope de Riverpod

**Checklist:**
- [ ] Supabase inicializado correctamente
- [ ] Stripe configurado
- [ ] ProviderScope wrapper
- [ ] Error handling para variables faltantes

---

### Tarea 1.7: Descargar e Instalar Fuentes

**Acción:** Crear carpeta `assets/fonts/` y agregar placeholder para fuentes.

**Nota para usuario:** Las fuentes se deben descargar de:
- Bebas Neue: https://fonts.google.com/specimen/Bebas+Neue
- Oswald: https://fonts.google.com/specimen/Oswald
- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk

**Por ahora:** Crear la carpeta y un archivo README.md con instrucciones.

**Checklist:**
- [ ] Carpeta `assets/fonts/` creada
- [ ] README con links de descarga creado

---

### Tarea 1.8: Configurar Permisos (Android)

**Archivo:** `android/app/src/main/AndroidManifest.xml`

**Acción:** Agregar permisos de internet.

**Agregar dentro de `<manifest>`:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**Checklist:**
- [ ] Permiso de internet agregado

---

### Tarea 1.9: Configurar analysis_options.yaml

**Archivo:** `analysis_options.yaml` (raíz del proyecto)

**Acción:** Crear archivo con reglas de linting.

**Contenido:**
```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - prefer_final_fields
    - avoid_print
    - always_declare_return_types
    - require_trailing_commas
```

**Checklist:**
- [ ] Archivo creado
- [ ] Reglas configuradas

---

### Tarea 1.10: Crear .gitignore Entries

**Archivo:** `.gitignore`

**Acción:** Agregar entradas para archivos generados por Freezed.

**Agregar al final:**
```
# Freezed & Json Serializable
*.g.dart
*.freezed.dart

# Environment
.env
*.env
```

**Checklist:**
- [ ] Entradas agregadas

---

## 🧪 Verificación Final

Ejecutar estos comandos para verificar que todo está correcto:

```bash
# 1. Verificar dependencias
flutter pub get

# 2. Verificar análisis
flutter analyze

# 3. Intentar compilar (debe fallar porque faltan fuentes, pero sin errores de código)
flutter run --dart-define=SUPABASE_URL=test --dart-define=SUPABASE_ANON_KEY=test --dart-define=STRIPE_PUBLISHABLE_KEY=test
```

**Resultados esperados:**
- `pub get`: ✅ Sin errores
- `analyze`: ✅ Sin errores críticos (warnings menores OK)
- `run`: Puede fallar por fuentes faltantes, pero código compila

## ✅ Checklist Final de Fase 01

Marcar cada item al completar:

- [ ] **1.1** Proyecto Flutter creado
- [ ] **1.2** pubspec.yaml configurado con todas las dependencias
- [ ] **1.3** Estructura de carpetas completa creada
- [ ] **1.4** EnvConfig creado
- [ ] **1.5** AppConstants creado
- [ ] **1.6** main.dart configurado
- [ ] **1.7** Carpeta assets/fonts con README
- [ ] **1.8** Permisos Android configurados
- [ ] **1.9** analysis_options.yaml creado
- [ ] **1.10** .gitignore actualizado
- [ ] **Verificación** `flutter pub get` exitoso
- [ ] **Verificación** `flutter analyze` sin errores críticos

## 📝 Reportar Completado

Cuando hayas completado TODAS las tareas, responde con:

```
✅ FASE 01 COMPLETADA

Resumen:
- Proyecto Flutter creado: ✅
- Dependencias instaladas: [número] paquetes
- Estructura de carpetas: ✅ 
- Configuración: EnvConfig, AppConstants, main.dart
- Verificaciones pasadas: pub get ✅, analyze ✅

Archivos creados:
- lib/core/config/env_config.dart
- lib/core/config/app_constants.dart
- lib/main.dart
- analysis_options.yaml
- assets/fonts/README.md

Estado: LISTO PARA FASE 02 (Sistema de Diseño)

Notas:
[Cualquier observación importante]
```

## 🚨 Si Encuentras Problemas

**Problema:** Conflictos de versiones de dependencias

**Solución:** Ajustar versiones usando `flutter pub upgrade` o especificar rangos compatibles.

---

**Problema:** Error en flutter pub get

**Solución:** 
1. `flutter clean`
2. `flutter pub get`
3. Verificar versión de Flutter con `flutter --version`

---

**Problema:** Carpetas no se crean

**Solución:** Usar comandos del sistema:
- Windows: `mkdir lib\core\config`
- Mac/Linux: `mkdir -p lib/core/config`

---

## 🎯 Próximo Paso

Una vez completada esta fase, continuar con:
**FASE-02-SISTEMA-DISENO.md**
3