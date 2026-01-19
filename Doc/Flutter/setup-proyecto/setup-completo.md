# Módulo Setup: Configuración Completa del Proyecto Flutter

## 1. pubspec.yaml Completo

```yaml
name: fashionstore
description: FashionStore - Tienda de Moda Streetwear
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # === SUPABASE ===
  supabase_flutter: ^2.3.0

  # === ESTADO Y ARQUITECTURA ===
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # === NAVEGACIÓN ===
  go_router: ^13.0.0

  # === MODELOS Y SERIALIZACIÓN ===
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

  # === ALMACENAMIENTO LOCAL ===
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # === UI Y DISEÑO ===
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # === FORMULARIOS ===
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0

  # === UTILIDADES ===
  intl: ^0.19.0
  url_launcher: ^6.2.2
  package_info_plus: ^5.0.1
  connectivity_plus: ^5.0.2

  # === PAGOS (Stripe) ===
  flutter_stripe: ^10.1.1
  webview_flutter: ^4.4.4

  # === IMÁGENES (Cloudinary) ===
  cloudinary_flutter: ^1.2.0
  cloudinary_url_gen: ^1.2.0

  # === ICONOS ===
  lucide_icons: ^0.257.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  
  # === GENERADORES ===
  build_runner: ^2.4.7
  freezed: ^2.4.5
  json_serializable: ^6.7.1
  riverpod_generator: ^2.3.9

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/fonts/

  fonts:
    - family: BebasNeue
      fonts:
        - asset: assets/fonts/BebasNeue-Regular.ttf
    - family: Oswald
      fonts:
        - asset: assets/fonts/Oswald-Regular.ttf
          weight: 400
        - asset: assets/fonts/Oswald-Medium.ttf
          weight: 500
        - asset: assets/fonts/Oswald-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Oswald-Bold.ttf
          weight: 700
    - family: SpaceGrotesk
      fonts:
        - asset: assets/fonts/SpaceGrotesk-Regular.ttf
          weight: 400
        - asset: assets/fonts/SpaceGrotesk-Medium.ttf
          weight: 500
        - asset: assets/fonts/SpaceGrotesk-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/SpaceGrotesk-Bold.ttf
          weight: 700
```

---

## 2. Estructura de Carpetas

```
lib/
├── main.dart
├── app.dart
├── 
├── core/
│   ├── config/
│   │   ├── env_config.dart
│   │   ├── supabase_config.dart
│   │   └── stripe_config.dart
│   │
│   ├── constants/
│   │   ├── app_constants.dart
│   │   ├── api_endpoints.dart
│   │   └── storage_keys.dart
│   │
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── app_spacing.dart
│   │
│   ├── router/
│   │   ├── app_router.dart
│   │   ├── routes.dart
│   │   └── auth_guard.dart
│   │
│   ├── utils/
│   │   ├── formatters.dart
│   │   ├── validators.dart
│   │   └── extensions.dart
│   │
│   └── widgets/
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── app_card.dart
│       ├── loading_overlay.dart
│       └── error_view.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   ├── catalog/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   ├── cart/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   ├── checkout/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   ├── orders/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   ├── profile/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── providers/
│   │
│   └── newsletter/
│       ├── data/
│       ├── domain/
│       ├── presentation/
│       └── providers/
│
├── shared/
│   ├── models/
│   ├── providers/
│   └── services/
│
assets/
├── images/
│   ├── logo.png
│   ├── logo_dark.png
│   └── placeholder.png
├── icons/
│   └── app_icon.svg
└── fonts/
    ├── BebasNeue-Regular.ttf
    ├── Oswald-*.ttf
    └── SpaceGrotesk-*.ttf
```

---

## 3. Archivo Principal (main.dart)

```dart
// lib/main.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import 'core/config/env_config.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configurar orientación (solo portrait para móvil)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Configurar barra de estado
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  // Inicializar Supabase
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
    realtimeClientOptions: const RealtimeClientOptions(
      eventsPerSecond: 2,
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
```

---

## 4. Configuración de Entorno

```dart
// lib/core/config/env_config.dart

abstract class EnvConfig {
  // Supabase
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );
  
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );

  // Stripe
  static const String stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue: 'pk_test_...',
  );

  // Cloudinary
  static const String cloudinaryCloudName = String.fromEnvironment(
    'CLOUDINARY_CLOUD_NAME',
    defaultValue: 'your-cloud-name',
  );

  // App Config
  static const String appName = 'FashionStore';
  static const String appVersion = '1.0.0';
  
  // Shipping
  static const double freeShippingThreshold = 50.0;
  static const double shippingCost = 4.99;

  // Environment flags
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');
  static const bool enableLogging = !isProduction;
}
```

---

## 5. Configuración de Supabase

```dart
// lib/core/config/supabase_config.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Provider para el cliente de Supabase
final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

/// Provider para el usuario actual (reactivo)
final currentUserProvider = StreamProvider<User?>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return supabase.auth.onAuthStateChange.map((event) => event.session?.user);
});

/// Provider para la sesión actual
final sessionProvider = Provider<Session?>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return supabase.auth.currentSession;
});

/// Provider para verificar si está autenticado
final isAuthenticatedProvider = Provider<bool>((ref) {
  final session = ref.watch(sessionProvider);
  return session != null && !session.isExpired;
});

/// Provider para verificar si es admin
final isAdminProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider).valueOrNull;
  if (user == null) return false;
  return user.userMetadata?['is_admin'] == true;
});

/// Helper para manejar errores de Supabase
class SupabaseErrorHandler {
  static String getMessage(Object error) {
    if (error is AuthException) {
      return _getAuthErrorMessage(error.message);
    }
    if (error is PostgrestException) {
      return _getPostgrestErrorMessage(error);
    }
    return 'Error inesperado. Por favor, inténtalo de nuevo.';
  }

  static String _getAuthErrorMessage(String message) {
    switch (message) {
      case 'Invalid login credentials':
        return 'Email o contraseña incorrectos';
      case 'Email not confirmed':
        return 'Por favor, confirma tu email antes de iniciar sesión';
      case 'User already registered':
        return 'Este email ya está registrado';
      default:
        return message;
    }
  }

  static String _getPostgrestErrorMessage(PostgrestException error) {
    if (error.code == '23505') {
      return 'Este registro ya existe';
    }
    if (error.code == '23503') {
      return 'No se puede eliminar, hay datos relacionados';
    }
    return error.message;
  }
}
```

---

## 6. Configuración de Stripe

```dart
// lib/core/config/stripe_config.dart

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'env_config.dart';

/// Servicio para manejar pagos con Stripe
class StripeService {
  /// Abre Stripe Checkout en WebView
  static Future<CheckoutResult> openCheckout({
    required BuildContext context,
    required String sessionUrl,
    required String successUrl,
    required String cancelUrl,
  }) async {
    final result = await Navigator.of(context).push<CheckoutResult>(
      MaterialPageRoute(
        builder: (context) => StripeCheckoutWebView(
          sessionUrl: sessionUrl,
          successUrl: successUrl,
          cancelUrl: cancelUrl,
        ),
      ),
    );
    return result ?? CheckoutResult.cancelled;
  }
}

enum CheckoutResult {
  success,
  cancelled,
  error,
}

/// WebView para Stripe Checkout
class StripeCheckoutWebView extends StatefulWidget {
  final String sessionUrl;
  final String successUrl;
  final String cancelUrl;

  const StripeCheckoutWebView({
    required this.sessionUrl,
    required this.successUrl,
    required this.cancelUrl,
    super.key,
  });

  @override
  State<StripeCheckoutWebView> createState() => _StripeCheckoutWebViewState();
}

class _StripeCheckoutWebViewState extends State<StripeCheckoutWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            setState(() => _isLoading = false);
          },
          onNavigationRequest: (request) {
            final url = request.url;
            
            // Detectar URL de éxito
            if (url.startsWith(widget.successUrl)) {
              Navigator.of(context).pop(CheckoutResult.success);
              return NavigationDecision.prevent;
            }
            
            // Detectar URL de cancelación
            if (url.startsWith(widget.cancelUrl)) {
              Navigator.of(context).pop(CheckoutResult.cancelled);
              return NavigationDecision.prevent;
            }
            
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.sessionUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pago Seguro'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(CheckoutResult.cancelled),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
```

---

## 7. App Root

```dart
// lib/app.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class FashionStoreApp extends ConsumerStatefulWidget {
  const FashionStoreApp({super.key});

  @override
  ConsumerState<FashionStoreApp> createState() => _FashionStoreAppState();
}

class _FashionStoreAppState extends ConsumerState<FashionStoreApp> {
  @override
  void initState() {
    super.initState();
    // Inicializar formato de fechas en español
    initializeDateFormatting('es_ES');
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'FashionStore',
      debugShowCheckedModeBanner: false,
      
      // Tema
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      
      // Router
      routerConfig: router,
      
      // Localización
      locale: const Locale('es', 'ES'),
      supportedLocales: const [
        Locale('es', 'ES'),
        Locale('en', 'US'),
      ],
    );
  }
}

/// Provider para el modo de tema
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>(
  (ref) => ThemeModeNotifier(),
);

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.system);

  void setThemeMode(ThemeMode mode) {
    state = mode;
  }

  void toggleTheme() {
    state = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
  }
}
```

---

## 8. Constantes de la App

```dart
// lib/core/constants/app_constants.dart

abstract class AppConstants {
  // Shipping
  static const double freeShippingThreshold = 50.0;
  static const double shippingCost = 4.99;
  
  // Stock
  static const int stockReservationMinutes = 30;
  
  // Returns
  static const int returnWindowDays = 30;
  
  // Tax
  static const double taxRate = 21.0;
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Images
  static const String placeholderImage = 'assets/images/placeholder.png';
  
  // Order number format: #A000001
  static const String orderNumberPrefix = '#A';
  static const int orderNumberPadding = 6;
}

// lib/core/constants/storage_keys.dart

abstract class StorageKeys {
  static const String cart = 'cart_items';
  static const String recentSearches = 'recent_searches';
  static const String wishlist = 'wishlist_ids';
  static const String themeMode = 'theme_mode';
  static const String onboardingComplete = 'onboarding_complete';
}

// lib/core/constants/api_endpoints.dart

abstract class ApiEndpoints {
  // Auth
  static const String signUp = '/auth/signup';
  static const String signIn = '/auth/signin';
  static const String signOut = '/auth/signout';
  
  // Checkout
  static const String createCheckoutSession = '/checkout/session';
  
  // Coupons
  static const String validateCoupon = '/coupons/validate';
  
  // Invoices
  static const String requestInvoice = '/invoices/request';
  static const String checkInvoice = '/invoices/check';
  
  // Orders
  static const String cancelOrder = '/orders/cancel';
  
  // Returns
  static const String createReturn = '/returns';
  
  // Newsletter
  static const String subscribeNewsletter = '/newsletter/subscribe';
}
```

---

## 9. Ejecutar con Variables de Entorno

```bash
# Desarrollo
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_... \
  --dart-define=CLOUDINARY_CLOUD_NAME=xxx

# Producción
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_... \
  --dart-define=CLOUDINARY_CLOUD_NAME=xxx
```

---

## 10. Checklist de Setup

- [ ] Crear proyecto Flutter: `flutter create fashionstore`
- [ ] Copiar `pubspec.yaml` y ejecutar `flutter pub get`
- [ ] Crear estructura de carpetas
- [ ] Descargar fuentes (Bebas Neue, Oswald, Space Grotesk)
- [ ] Configurar variables de entorno (Supabase, Stripe, Cloudinary)
- [ ] Ejecutar `flutter pub run build_runner build`
- [ ] Probar conexión con Supabase
- [ ] Probar Stripe Checkout en sandbox
