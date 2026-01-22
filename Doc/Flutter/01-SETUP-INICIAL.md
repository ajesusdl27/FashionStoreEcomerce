# Módulo 01: Setup Inicial del Proyecto

## 🎯 Objetivo

Crear la estructura base del proyecto Flutter con todas las dependencias necesarias, configuración de entorno y estructura de carpetas.

## 📦 Dependencias Requeridas

### pubspec.yaml - Sección dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management & Code Generation
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0
  
  # Models & Serialization
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  
  # Navigation
  go_router: ^13.0.0
  
  # Backend & Auth
  supabase_flutter: ^2.0.0
  
  # Payments
  flutter_stripe: ^10.0.0
  webview_flutter: ^4.4.0
  
  # Local Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.0
  
  # Network & Images
  http: ^1.1.0
  cached_network_image: ^3.3.0
  
  # UI Components
  shimmer: ^3.0.0
  photo_view: ^0.14.0
  flutter_svg: ^2.0.9
  lucide_icons: ^0.1.0  # Similar a lucide-react en web
  
  # Utils
  intl: ^0.19.0
  url_launcher: ^6.2.0
  equatable: ^2.0.5
```

### pubspec.yaml - Sección dev_dependencies

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  
  # Code Generation
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
  freezed: ^2.4.5
  json_serializable: ^6.7.0
  
  # Testing
  mockito: ^5.4.0
```

### pubspec.yaml - Fuentes (assets)

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

## 🏗️ Estructura de Carpetas Completa

Crear esta estructura exacta:

```
lib/
├── core/
│   ├── config/
│   │   ├── env_config.dart
│   │   └── app_constants.dart
│   │
│   ├── router/
│   │   ├── app_router.dart
│   │   └── routes.dart
│   │
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── app_spacing.dart
│   │
│   ├── utils/
│   │   ├── formatters.dart
│   │   ├── validators.dart
│   │   ├── extensions.dart
│   │   └── logger.dart
│   │
│   ├── widgets/
│   │   ├── buttons/
│   │   │   └── app_button.dart
│   │   ├── inputs/
│   │   │   ├── app_text_field.dart
│   │   │   └── app_search_field.dart
│   │   ├── cards/
│   │   │   ├── app_card.dart
│   │   │   └── glass_card.dart
│   │   ├── feedback/
│   │   │   ├── loading_overlay.dart
│   │   │   ├── error_view.dart
│   │   │   ├── empty_state.dart
│   │   │   └── shimmer_loading.dart
│   │   └── badges/
│   │       └── app_badge.dart
│   │
│   └── services/
│       ├── supabase_service.dart
│       ├── storage_service.dart
│       └── analytics_service.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── providers/
│   │   └── presentation/
│   │       ├── screens/
│   │       └── widgets/
│   │
│   ├── catalog/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── cart/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── checkout/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── orders/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── profile/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── returns/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   ├── newsletter/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── providers/
│   │   └── presentation/
│   │
│   └── admin/
│       ├── dashboard/
│       ├── products/
│       ├── orders/
│       ├── categories/
│       ├── coupons/
│       ├── promotions/
│       ├── newsletter/
│       ├── returns/
│       └── settings/
│
└── main.dart

assets/
├── fonts/
│   ├── BebasNeue-Regular.ttf
│   ├── Oswald-Regular.ttf
│   ├── Oswald-Medium.ttf
│   ├── Oswald-SemiBold.ttf
│   ├── Oswald-Bold.ttf
│   ├── SpaceGrotesk-Regular.ttf
│   ├── SpaceGrotesk-Medium.ttf
│   └── SpaceGrotesk-Bold.ttf
│
└── images/
    ├── logo.svg
    └── empty_states/
```

## ⚙️ Configuración de Variables de Entorno

### lib/core/config/env_config.dart

```dart
/// Configuración de variables de entorno
/// 
/// Usar con --dart-define al ejecutar:
/// flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
class EnvConfig {
  // Supabase
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );
  
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );
  
  // Stripe
  static const stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue: '',
  );
  
  // Cloudinary
  static const cloudinaryCloudName = String.fromEnvironment(
    'CLOUDINARY_CLOUD_NAME',
    defaultValue: 'fashionstore',
  );
  
  // Validación
  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && 
      supabaseAnonKey.isNotEmpty &&
      stripePublishableKey.isNotEmpty;
}
```

### lib/core/config/app_constants.dart

```dart
/// Constantes de la aplicación
class AppConstants {
  // General
  static const appName = 'FashionStore';
  static const appVersion = '1.0.0';
  
  // Envío
  static const shippingCostDefault = 4.99;
  static const freeShippingThreshold = 50.0;
  static const defaultCountry = 'España';
  
  // Devoluciones
  static const returnWindowDays = 30;
  
  // Carrito
  static const cartStorageKey = 'fashionstore_cart';
  static const maxQuantityPerItem = 10;
  
  // Stock
  static const lowStockThreshold = 5;
  
  // Paginación
  static const productsPerPage = 20;
  static const ordersPerPage = 10;
  
  // Timeouts
  static const apiTimeoutSeconds = 30;
  static const imageLoadTimeoutSeconds = 10;
  
  // URLs
  static const termsUrl = '/terminos';
  static const privacyUrl = '/privacidad';
  static const contactEmail = 'info@fashionstore.com';
  
  // Regex Patterns
  static const emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const phonePattern = r'^\+?34?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}$';
  static const postalCodePattern = r'^\d{5}$';
}
```

## 🚀 Inicialización en main.dart

### lib/main.dart - Estructura Base

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import 'core/config/env_config.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() async {
  // Asegurar inicialización de widgets
  WidgetsFlutterBinding.ensureInitialized();
  
  // Validar configuración
  if (!EnvConfig.isConfigured) {
    throw Exception('Variables de entorno no configuradas. '
        'Ejecutar con --dart-define.');
  }
  
  // Inicializar Supabase
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );
  
  // Inicializar Stripe
  Stripe.publishableKey = EnvConfig.stripePublishableKey;
  await Stripe.instance.applySettings();
  
  runApp(
    const ProviderScope(
      child: FashionStoreApp(),
    ),
  );
}

class FashionStoreApp extends ConsumerWidget {
  const FashionStoreApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    
    return MaterialApp.router(
      title: 'FashionStore',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Por defecto dark mode
      routerConfig: router,
    );
  }
}
```

## 📥 Descargar Fuentes

### Fuentes Requeridas

1. **Bebas Neue**
   - Descargar de: https://fonts.google.com/specimen/Bebas+Neue
   - Archivo: `BebasNeue-Regular.ttf`

2. **Oswald**
   - Descargar de: https://fonts.google.com/specimen/Oswald
   - Archivos: Regular, Medium, SemiBold, Bold

3. **Space Grotesk**
   - Descargar de: https://fonts.google.com/specimen/Space+Grotesk
   - Archivos: Regular, Medium, Bold

### Ubicación

Colocar todos los archivos `.ttf` en `assets/fonts/`

## 🔧 Configuración Adicional

### android/app/build.gradle

Agregar en `defaultConfig`:

```gradle
minSdkVersion 21  // Requerido para Supabase
compileSdkVersion 34
```

### ios/Runner/Info.plist

Agregar permisos de internet y cámara:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### analysis_options.yaml

Crear en la raíz del proyecto:

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

## ✅ Verificación del Setup

### Checklist

- [ ] Proyecto creado con `flutter create fashionstore`
- [ ] Todas las dependencias agregadas en `pubspec.yaml`
- [ ] Fuentes descargadas y colocadas en `assets/fonts/`
- [ ] Estructura de carpetas creada completa
- [ ] `EnvConfig` creado con variables correctas
- [ ] `AppConstants` creado con constantes
- [ ] `main.dart` configurado con inicialización
- [ ] `flutter pub get` ejecutado sin errores
- [ ] `flutter analyze` no reporta errores críticos

### Comando de Verificación

```bash
# Ejecutar desde raíz del proyecto
flutter doctor -v
flutter pub get
flutter analyze
flutter run --dart-define=SUPABASE_URL=test --dart-define=SUPABASE_ANON_KEY=test --dart-define=STRIPE_PUBLISHABLE_KEY=test
```

Debe mostrar una pantalla en blanco sin errores de compilación.

## 📝 Notas Importantes

### Build Runner

Después de crear modelos Freezed (en siguientes módulos), siempre ejecutar:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Git Ignore

Asegurarse de que `.gitignore` incluya:

```
*.g.dart
*.freezed.dart
.env
*.env
```

### Variables de Entorno por Plataforma

**Desarrollo:**
```bash
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Producción:**
```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://prod.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 02: Sistema de Diseño** - Implementar theme, colores, tipografía y spacing.

---

**Tiempo Estimado**: 1-2 horas
**Complejidad**: Baja
**Dependencias**: Ninguna
