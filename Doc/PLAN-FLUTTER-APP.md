# 📱 Plan de Desarrollo: FashionStore Flutter App

> **Proyecto**: App móvil nativa Flutter para FashionStore  
> **Coexistencia**: Este proyecto funcionará de forma independiente junto a la web Astro existente  
> **Backend compartido**: Supabase Self-Hosted (mismo que la web)  
> **Plataforma inicial**: Android

---
## 📋 Índice

1. [Contexto y Referencias del Proyecto Web](#-contexto-y-referencias-del-proyecto-web)
2. [Stack Tecnológico y Dependencias](#-stack-tecnológico-y-dependencias)
3. [Estructura de Carpetas Obligatoria](#-estructura-de-carpetas-obligatoria)
4. [Configuración de Supabase Flutter](#-configuración-de-supabase-flutter)
5. [Integración de Stripe](#-integración-de-stripe)
6. [Paleta de Colores y Tema](#-paleta-de-colores-y-tema)
7. [RPCs de Supabase](#-rpcs-de-supabase)
8. [Settings Completos del Sistema](#-settings-completos-del-sistema)
9. [Patrones de Arquitectura](#-patrones-de-arquitectura)
10. [Fases de Desarrollo](#-fases-de-desarrollo)
11. [Resumen de Modelos Freezed](#-resumen-de-modelos-freezed)
12. [Flujos de Usuario Detallados](#-flujos-de-usuario-detallados)
13. [Validadores Dart](#-validadores-dart)
14. [Flujo del Interruptor de Ofertas](#-flujo-del-interruptor-de-ofertas)
15. [Checklist Final Pre-Deploy](#-checklist-final-pre-deploy)

---

## 🔗 Contexto y Referencias del Proyecto Web

El agente debe consultar estos archivos del proyecto web para mantener coherencia:

### Base de Datos (Migraciones)

| Archivo | Contenido | Uso en Flutter |
|---------|-----------|----------------|
| `Doc/migrations/001_create_tables.sql` | Tablas principales (products, categories, orders) | Modelos Freezed |
| `Doc/migrations/004_seed_data.sql` | Datos de prueba | Entender estructura |
| `Doc/migrations/005_settings_value.sql` | Tabla settings (key-value) | Interruptor de ofertas |
| `Doc/migrations/006_stock_reservation_functions.sql` | RPCs de stock | Llamadas desde Flutter |
| `Doc/migrations/009_customer_auth.sql` | Auth de clientes | Lógica de roles |
| `Doc/migrations/015_create_coupons_table.sql` | Sistema de cupones | Feature cupones |
| `Doc/migrations/033_products_soft_delete.sql` | Soft delete de productos | Lógica de eliminación |

### Lógica de Negocio Web

| Archivo/Carpeta | Contenido | Equivalente Flutter |
|-----------------|-----------|---------------------|
| `src/lib/supabase.ts` | Cliente Supabase | `shared/services/supabase_service.dart` |
| `src/lib/validators/` | Validaciones Zod | Validadores Dart |
| `src/stores/cartStore.ts` | Estado del carrito | `features/cart/presentation/providers/` |
| `src/pages/api/` | Endpoints API | Llamadas directas a Supabase |

### Páginas de Referencia

| Ruta Web | Feature Flutter |
|----------|-----------------|
| `src/pages/productos/` | `features/products/` |
| `src/pages/checkout/` | `features/checkout/` |
| `src/pages/cuenta/` | `features/profile/` |
| `src/pages/admin/` | `features/admin/` (mismo rol) |

### Componentes UI de Referencia

| Componente Web | Widget Flutter |
|----------------|----------------|
| `src/components/ui/Button.astro` | `shared/widgets/custom_button.dart` |
| `src/components/product/ProductCard.astro` | `features/products/presentation/widgets/product_card.dart` |
| `src/components/islands/CartSlideOver.tsx` | `features/cart/presentation/widgets/cart_drawer.dart` |

---

## 🛠️ Stack Tecnológico y Dependencias

### Dependencias Principales (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Estado (OBLIGATORIO Riverpod 2.x con code generation)
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5
  
  # Inmutabilidad (OBLIGATORIO Freezed)
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  
  # Backend
  supabase_flutter: ^2.5.0
  
  # Pagos
  flutter_stripe: ^10.1.1
  
  # Variables de entorno
  flutter_dotenv: ^5.1.0
  
  # Navegación
  go_router: ^14.2.0
  
  # Programación funcional (Either para errores)
  fpdart: ^1.1.0
  
  # Utilidades
  flutter_image_compress: ^2.2.0
  image_picker: ^1.0.7
  cached_network_image: ^3.3.1
  google_fonts: ^6.2.1
  flutter_svg: ^2.0.10
  intl: ^0.19.0
  shared_preferences: ^2.2.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Code generation
  build_runner: ^2.4.9
  riverpod_generator: ^2.4.0
  freezed: ^2.5.2
  json_serializable: ^6.7.1
  
  # Linting
  flutter_lints: ^3.0.2
```

### Comando de Generación de Código

```bash
dart run build_runner build --delete-conflicting-outputs
```

---

## 📁 Estructura de Carpetas Obligatoria

```
lib/
├── main.dart                    # ProviderScope + MaterialApp.router
│
├── config/
│   ├── theme/
│   │   ├── app_theme.dart       # ThemeData principal
│   │   ├── app_colors.dart      # Paleta de colores
│   │   └── app_text_styles.dart # Estilos tipográficos
│   ├── router/
│   │   └── app_router.dart      # GoRouter config + guards
│   └── constants/
│       └── environment.dart     # Supabase URL, keys
│
├── shared/
│   ├── extensions/
│   │   ├── context_extensions.dart
│   │   └── string_extensions.dart
│   ├── exceptions/
│   │   └── failures.dart        # Clase Failure y subclases
│   ├── services/
│   │   ├── supabase_service.dart
│   │   ├── local_storage_service.dart
│   │   └── image_service.dart   # Compresión de imágenes
│   └── widgets/
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       ├── loading_indicator.dart
│       └── error_view.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   └── user_model.dart        # @freezed
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart   # abstract class
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart     # @riverpod
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   └── register_screen.dart
│   │       └── widgets/
│   │
│   ├── products/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   │   ├── product_model.dart
│   │   │   │   └── category_model.dart
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── providers/
│   │       ├── screens/
│   │       └── widgets/
│   │
│   ├── cart/
│   │   ├── data/
│   │   │   └── models/
│   │   │       ├── cart_item_model.dart
│   │   │       └── cart_state_model.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── cart_provider.dart
│   │       ├── screens/
│   │       └── widgets/
│   │           └── cart_drawer.dart
│   │
│   ├── checkout/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── offers/                  # Feature del interruptor de ofertas
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   └── offers_realtime_datasource.dart
│   │   │   └── repositories/
│   │   └── presentation/
│   │       └── providers/
│   │           └── offers_stream_provider.dart  # StreamProvider
│   │
│   ├── returns/                 # Feature de devoluciones (cliente)
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   └── returns_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── return_model.dart           # @freezed
│   │   │   │   └── return_item_model.dart      # @freezed
│   │   │   └── repositories/
│   │   │       └── returns_repository_impl.dart
│   │   ├── domain/
│   │   │   └── repositories/
│   │   │       └── returns_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── returns_provider.dart
│   │       ├── screens/
│   │       │   ├── return_request_screen.dart  # Formulario solicitud
│   │       │   ├── return_detail_screen.dart   # Estado de devolución
│   │       │   └── returns_list_screen.dart    # Historial
│   │       └── widgets/
│   │           ├── return_item_selector.dart
│   │           ├── return_reason_picker.dart
│   │           └── return_status_badge.dart
│   │
│   ├── invoices/                # Feature de facturas
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── invoice_model.dart          # @freezed
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── invoice_provider.dart
│   │       ├── screens/
│   │       │   └── invoice_detail_screen.dart
│   │       └── widgets/
│   │           └── request_invoice_form.dart   # Formulario datos fiscales
│   │
│   ├── promotions/              # Feature de banners promocionales
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── promotion_model.dart        # @freezed
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── promotions_provider.dart
│   │       └── widgets/
│   │           ├── promotion_banner.dart       # Banner individual
│   │           └── promotions_carousel.dart    # Carrusel home
│   │
│   └── admin/
│       ├── products_management/
│       │   ├── data/
│       │   ├── domain/
│       │   └── presentation/
│       ├── stock_management/
│       │   └── presentation/
│       ├── returns_management/  # Gestión de devoluciones (admin)
│       │   ├── data/
│       │   │   └── repositories/
│       │   └── presentation/
│       │       ├── providers/
│       │       │   └── admin_returns_provider.dart
│       │       ├── screens/
│       │       │   ├── returns_list_screen.dart     # Lista pendientes
│       │       │   ├── return_review_screen.dart    # Aprobar/rechazar
│       │       │   └── return_inspection_screen.dart # Inspeccionar items
│       │       └── widgets/
│       │           ├── return_status_filter.dart
│       │           └── inspection_form.dart
│       ├── orders_management/   # Gestión de pedidos (admin)
│       │   └── presentation/
│       │       ├── providers/
│       │       ├── screens/
│       │       │   └── orders_list_screen.dart
│       │       └── widgets/
│       │           └── order_status_updater.dart
│       └── settings/            # Control del interruptor
│           └── presentation/
│
└── app.dart                     # Widget raíz con GoRouter
```

---

## 🔌 Configuración de Supabase Flutter

### Variables de Entorno

**El desarrollador debe crear manualmente** el archivo `.env` en la raíz del proyecto Flutter con las siguientes variables:

```dotenv
# ========================================
# SUPABASE - OBLIGATORIAS
# ========================================
# Obtener de: Supabase Dashboard > Settings > API
# O del archivo .env del proyecto web Astro

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# STRIPE - OBLIGATORIAS PARA PAGOS
# ========================================
# Obtener de: Stripe Dashboard > Developers > API Keys
# Usar claves de TEST para desarrollo (pk_test_...)

STRIPE_PUBLISHABLE_KEY=pk_test_...

# Merchant ID para Google Pay (opcional, solo producción)
STRIPE_MERCHANT_ID=merchant.com.fashionstore
```

### Cargar Variables en Flutter

Crear `lib/config/constants/environment.dart`:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  static String get supabaseUrl => 
      dotenv.env['SUPABASE_URL'] ?? '';
  
  static String get supabaseAnonKey => 
      dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  
  static String get stripePublishableKey => 
      dotenv.env['STRIPE_PUBLISHABLE_KEY'] ?? '';
  
  static String get stripeMerchantId => 
      dotenv.env['STRIPE_MERCHANT_ID'] ?? 'merchant.com.fashionstore';
  
  /// Valida que todas las variables requeridas estén presentes
  static void validate() {
    if (supabaseUrl.isEmpty) {
      throw Exception('SUPABASE_URL no configurada en .env');
    }
    if (supabaseAnonKey.isEmpty) {
      throw Exception('SUPABASE_ANON_KEY no configurada en .env');
    }
    if (stripePublishableKey.isEmpty) {
      throw Exception('STRIPE_PUBLISHABLE_KEY no configurada en .env');
    }
  }
}
```

### Inicialización en main.dart

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Cargar variables de entorno
  await dotenv.load(fileName: '.env');
  Environment.validate();
  
  // 2. Inicializar Supabase
  await Supabase.initialize(
    url: Environment.supabaseUrl,
    anonKey: Environment.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
    realtimeClientOptions: const RealtimeClientOptions(
      logLevel: RealtimeLogLevel.info,
    ),
  );
  
  // 3. Inicializar Stripe
  Stripe.publishableKey = Environment.stripePublishableKey;
  Stripe.merchantIdentifier = Environment.stripeMerchantId;
  await Stripe.instance.applySettings();
  
  runApp(
    ProviderScope(
      child: const FashionStoreApp(),
    ),
  );
}
```

### Añadir .env a assets

En `pubspec.yaml`:

```yaml
flutter:
  assets:
    - .env
```

### Servicio Singleton

Crear `shared/services/supabase_service.dart` que exponga:
- `client` → SupabaseClient para queries
- `auth` → GoTrueClient para autenticación
- `storage` → SupabaseStorageClient para imágenes
- `realtime` → RealtimeClient para suscripciones

---

## 💳 Integración de Stripe

### Configuración Android

**android/app/build.gradle:**

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 21  // Mínimo requerido por Stripe
        targetSdkVersion 34
    }
}
```

**android/app/src/main/res/values/styles.xml:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="LaunchTheme" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Requerido para Stripe Payment Sheet -->
    </style>
</resources>
```

### Servicio de Pagos

Crear `shared/services/stripe_service.dart`:

```dart
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StripeService {
  final _supabase = Supabase.instance.client;

  /// Crea un PaymentIntent en el servidor y retorna el clientSecret
  Future<String> createPaymentIntent({
    required int amountInCents,  // Ej: 4999 = 49.99€
    required String currency,    // 'eur'
    required String orderId,
    String? customerEmail,
  }) async {
    // Llamar a Edge Function de Supabase
    final response = await _supabase.functions.invoke(
      'create-payment-intent',
      body: {
        'amount': amountInCents,
        'currency': currency,
        'order_id': orderId,
        'customer_email': customerEmail,
      },
    );

    if (response.status != 200) {
      throw Exception('Error creando PaymentIntent: ${response.data}');
    }

    return response.data['clientSecret'] as String;
  }

  /// Muestra el Payment Sheet de Stripe
  Future<PaymentResult> presentPaymentSheet({
    required String clientSecret,
    required String merchantName,
  }) async {
    try {
      // 1. Inicializar Payment Sheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: merchantName,
          style: ThemeMode.system,
          appearance: PaymentSheetAppearance(
            colors: PaymentSheetAppearanceColors(
              primary: const Color(0xFFCCFF00),  // Primary color
              background: const Color(0xFF09090B),
              componentBackground: const Color(0xFF27272A),
              componentText: const Color(0xFFFAFAFA),
            ),
            shapes: PaymentSheetShape(
              borderRadius: 12,
              borderWidth: 1,
            ),
          ),
          billingDetails: BillingDetails(
            address: Address(
              country: 'ES',
              city: null,
              line1: null,
              line2: null,
              postalCode: null,
              state: null,
            ),
          ),
        ),
      );

      // 2. Presentar Payment Sheet
      await Stripe.instance.presentPaymentSheet();
      
      return PaymentResult.success;
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) {
        return PaymentResult.cancelled;
      }
      return PaymentResult.failed(e.error.localizedMessage ?? 'Error desconocido');
    } catch (e) {
      return PaymentResult.failed(e.toString());
    }
  }

  /// Confirma el pago y actualiza el estado del pedido
  Future<void> confirmPayment(String orderId) async {
    await _supabase.rpc('update_order_status', params: {
      'p_order_id': orderId,
      'p_status': 'paid',
    });
  }
}

/// Resultado del pago
sealed class PaymentResult {
  const PaymentResult._();
  
  static const success = PaymentSuccess._();
  static const cancelled = PaymentCancelled._();
  static PaymentResult failed(String message) => PaymentFailed._(message);
}

class PaymentSuccess extends PaymentResult {
  const PaymentSuccess._() : super._();
}

class PaymentCancelled extends PaymentResult {
  const PaymentCancelled._() : super._();
}

class PaymentFailed extends PaymentResult {
  final String message;
  const PaymentFailed._(this.message) : super._();
}
```

### Edge Function para PaymentIntent

Crear `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { amount, currency, order_id, customer_email } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id,
        customer_email,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Flujo de Pago en Checkout

```dart
// En CheckoutNotifier o CheckoutScreen

Future<void> processPayment(Order order) async {
  final stripeService = ref.read(stripeServiceProvider);
  
  try {
    state = const AsyncLoading();
    
    // 1. Crear PaymentIntent
    final clientSecret = await stripeService.createPaymentIntent(
      amountInCents: (order.total * 100).round(),
      currency: 'eur',
      orderId: order.id,
      customerEmail: order.customerEmail,
    );
    
    // 2. Mostrar Payment Sheet
    final result = await stripeService.presentPaymentSheet(
      clientSecret: clientSecret,
      merchantName: 'FashionStore',
    );
    
    // 3. Manejar resultado
    switch (result) {
      case PaymentSuccess():
        await stripeService.confirmPayment(order.id);
        await ref.read(cartProvider.notifier).clear();
        state = AsyncData(CheckoutState.completed(order));
        
      case PaymentCancelled():
        state = AsyncData(CheckoutState.cancelled());
        
      case PaymentFailed(:final message):
        // Cancelar orden y restaurar stock
        await supabase.rpc('cancel_order', params: {'p_order_id': order.id});
        state = AsyncError(message, StackTrace.current);
    }
  } catch (e, st) {
    state = AsyncError(e, st);
  }
}
```

### Webhook (Recomendado para Producción)

Crear `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  )

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.order_id
    
    await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: 'paid',
    })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 🎨 Paleta de Colores y Tema

### Colores del Sistema

Extraídos de `src/styles/global.css` del proyecto web:

#### Modo Claro (Light)

| Variable | HEX | Uso |
|----------|-----|-----|
| `background` | `#FFFFFF` | Fondo principal |
| `foreground` | `#09090B` | Texto principal |
| `primary` | `#18181B` | Botones principales |
| `primary-foreground` | `#FAFAFA` | Texto sobre primary |
| `accent` | `#FF4757` | Acentos, ofertas, alertas |
| `muted` | `#F4F4F5` | Fondos secundarios |
| `muted-foreground` | `#71717A` | Texto secundario |
| `card` | `#FFFFFF` | Fondo de tarjetas |
| `border` | `#E4E4E7` | Bordes, divisores |
| `electric` | `#3B82F6` | Enlaces, acciones secundarias |

#### Modo Oscuro (Dark) - Por Defecto

| Variable | HEX | Uso |
|----------|-----|-----|
| `background` | `#09090B` | Fondo principal |
| `foreground` | `#FAFAFA` | Texto principal |
| `primary` | `#CCFF00` | ⭐ Color distintivo - Botones, CTAs |
| `primary-foreground` | `#09090B` | Texto sobre primary |
| `accent` | `#FF4757` | Ofertas, descuentos, alertas |
| `muted` | `#303036` | Fondos secundarios |
| `muted-foreground` | `#A1A1AA` | Texto secundario |
| `card` | `#27272A` | Fondo de tarjetas |
| `border` | `#3F3F46` | Bordes, divisores |
| `electric` | `#3B82F6` | Enlaces, info |

#### Colores Semánticos

| Nombre | HEX | Uso |
|--------|-----|-----|
| `success` | `#22C55E` | Confirmaciones, stock disponible |
| `warning` | `#F59E0B` | Alertas, stock bajo |
| `error` | `#EF4444` | Errores, validaciones fallidas |
| `info` | `#3B82F6` | Información, tooltips |

### Implementación en Flutter

**lib/config/theme/app_colors.dart:**

```dart
import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // ========================================
  // MODO OSCURO (Por defecto)
  // ========================================
  static const darkBackground = Color(0xFF09090B);
  static const darkForeground = Color(0xFFFAFAFA);
  static const darkPrimary = Color(0xFFCCFF00);      // ⭐ Verde lima distintivo
  static const darkPrimaryForeground = Color(0xFF09090B);
  static const darkAccent = Color(0xFFFF4757);       // Rojo coral
  static const darkMuted = Color(0xFF303036);
  static const darkMutedForeground = Color(0xFFA1A1AA);
  static const darkCard = Color(0xFF27272A);
  static const darkCardForeground = Color(0xFFFAFAFA);
  static const darkBorder = Color(0xFF3F3F46);
  static const darkElectric = Color(0xFF3B82F6);

  // ========================================
  // MODO CLARO
  // ========================================
  static const lightBackground = Color(0xFFFFFFFF);
  static const lightForeground = Color(0xFF09090B);
  static const lightPrimary = Color(0xFF18181B);
  static const lightPrimaryForeground = Color(0xFFFAFAFA);
  static const lightAccent = Color(0xFFFF4757);
  static const lightMuted = Color(0xFFF4F4F5);
  static const lightMutedForeground = Color(0xFF71717A);
  static const lightCard = Color(0xFFFFFFFF);
  static const lightCardForeground = Color(0xFF09090B);
  static const lightBorder = Color(0xFFE4E4E7);
  static const lightElectric = Color(0xFF3B82F6);

  // ========================================
  // SEMÁNTICOS (Compartidos)
  // ========================================
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);

  // ========================================
  // GRADIENTES
  // ========================================
  static const primaryGlow = [
    Color(0x4DCCFF00),  // 30% opacity
    Color(0x00CCFF00),  // 0% opacity
  ];
}
```

**lib/config/theme/app_theme.dart:**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  // ========================================
  // TEMA OSCURO (Por defecto)
  // ========================================
  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.darkBackground,
    
    colorScheme: const ColorScheme.dark(
      background: AppColors.darkBackground,
      surface: AppColors.darkCard,
      primary: AppColors.darkPrimary,
      onPrimary: AppColors.darkPrimaryForeground,
      secondary: AppColors.darkAccent,
      onSecondary: AppColors.darkForeground,
      error: AppColors.error,
      outline: AppColors.darkBorder,
    ),
    
    // Tipografía
    textTheme: GoogleFonts.latoTextTheme(
      ThemeData.dark().textTheme,
    ).copyWith(
      displayLarge: GoogleFonts.playfairDisplay(
        color: AppColors.darkForeground,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: GoogleFonts.playfairDisplay(
        color: AppColors.darkForeground,
      ),
      bodyLarge: GoogleFonts.lato(
        color: AppColors.darkForeground,
      ),
      bodyMedium: GoogleFonts.lato(
        color: AppColors.darkMutedForeground,
      ),
    ),
    
    // AppBar
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.darkBackground,
      foregroundColor: AppColors.darkForeground,
      elevation: 0,
      centerTitle: true,
    ),
    
    // Cards
    cardTheme: CardTheme(
      color: AppColors.darkCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.darkBorder),
      ),
    ),
    
    // Botones
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.darkPrimary,
        foregroundColor: AppColors.darkPrimaryForeground,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: GoogleFonts.lato(
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
    ),
    
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.darkForeground,
        side: const BorderSide(color: AppColors.darkBorder),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    
    // Inputs
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.darkPrimary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      hintStyle: GoogleFonts.lato(color: AppColors.darkMutedForeground),
    ),
    
    // Dividers
    dividerTheme: const DividerThemeData(
      color: AppColors.darkBorder,
      thickness: 1,
    ),
    
    // Bottom Navigation
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.darkCard,
      selectedItemColor: AppColors.darkPrimary,
      unselectedItemColor: AppColors.darkMutedForeground,
    ),
    
    // Chips (para filtros, tallas)
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.darkCard,
      selectedColor: AppColors.darkPrimary,
      labelStyle: GoogleFonts.lato(color: AppColors.darkForeground),
      secondaryLabelStyle: GoogleFonts.lato(color: AppColors.darkPrimaryForeground),
      side: const BorderSide(color: AppColors.darkBorder),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
  );

  // ========================================
  // TEMA CLARO (misma estructura, colores light)
  // ========================================
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBackground,
    colorScheme: const ColorScheme.light(
      background: AppColors.lightBackground,
      surface: AppColors.lightCard,
      primary: AppColors.lightPrimary,
      onPrimary: AppColors.lightPrimaryForeground,
      secondary: AppColors.lightAccent,
      error: AppColors.error,
      outline: AppColors.lightBorder,
    ),
    // ... (copiar estructura dark con colores light)
  );
}
```

### Uso en Widgets

```dart
// Acceder a colores del tema
final primaryColor = Theme.of(context).colorScheme.primary;

// Usar colores directamente
Container(
  color: AppColors.darkPrimary,
  child: Text(
    'Botón',
    style: TextStyle(color: AppColors.darkPrimaryForeground),
  ),
)

// Badge de oferta
Container(
  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  decoration: BoxDecoration(
    color: AppColors.darkAccent,
    borderRadius: BorderRadius.circular(4),
  ),
  child: Text(
    '-20%',
    style: GoogleFonts.lato(
      color: Colors.white,
      fontWeight: FontWeight.bold,
      fontSize: 12,
    ),
  ),
)

// Efecto glow del primary
BoxDecoration(
  color: AppColors.darkPrimary,
  borderRadius: BorderRadius.circular(8),
  boxShadow: [
    BoxShadow(
      color: AppColors.darkPrimary.withOpacity(0.3),
      blurRadius: 20,
      spreadRadius: 0,
    ),
  ],
)
```

---

## 📡 RPCs de Supabase

Funciones RPC disponibles en el backend que Flutter debe consumir:

### Cupones y Descuentos

| RPC | Parámetros | Retorno | Descripción | Feature |
|-----|------------|---------|-------------|--------|
| `validate_coupon` | `code TEXT, customer_email TEXT, subtotal NUMERIC` | `{ valid: bool, discount: numeric, error?: string }` | Valida cupón antes de aplicar | `checkout/` |
| `use_coupon` | `p_coupon_id UUID, p_customer_email TEXT, p_order_id UUID` | `void` | Registra uso del cupón tras pago exitoso | `checkout/` |

### Gestión de Pedidos

| RPC | Parámetros | Retorno | Descripción | Feature |
|-----|------------|---------|-------------|--------|
| `update_order_status` | `p_order_id UUID, p_status TEXT` | `void` | Cambia estado: pending→paid→shipped→delivered | `admin/orders/` |
| `get_order_items_with_details` | `p_order_id UUID` | `order_items[]` con producto y variante | Obtiene items con datos completos | `orders/` |
| `cancel_order` | `p_order_id UUID` | `void` | Cancela pedido y restaura stock automáticamente | `orders/`, `admin/` |
| `create_checkout_order` | `items JSON, shipping JSON, coupon_id? UUID` | `{ order_id, order_number }` | Crea orden completa con reserva de stock | `checkout/` |

### Stock

| RPC | Parámetros | Retorno | Descripción | Feature |
|-----|------------|---------|-------------|--------|
| `reserve_stock` | `p_variant_id UUID, p_quantity INT` | `bool` | Reserva stock (decrementa) | `checkout/` |
| `restore_stock` | `p_variant_id UUID, p_quantity INT` | `void` | Restaura stock (incrementa) | `returns/`, `admin/` |
| `check_stock_availability` | `p_variant_id UUID, p_quantity INT` | `bool` | Verifica disponibilidad sin reservar | `cart/`, `checkout/` |

### Facturas

| RPC | Parámetros | Retorno | Descripción | Feature |
|-----|------------|---------|-------------|--------|
| `create_invoice` | `p_order_id UUID, p_nif TEXT, p_fiscal_name TEXT, p_fiscal_address TEXT` | `{ invoice_id, invoice_number }` | Genera factura con número secuencial (FS-2026-XXXXX) | `invoices/` |

### Devoluciones

| RPC | Parámetros | Retorno | Descripción | Feature |
|-----|------------|---------|-------------|--------|
| `process_return` | `p_return_id UUID, p_action TEXT, p_notes? TEXT, p_rejection_reason? TEXT` | `void` | Admin: approve/reject/receive/complete | `admin/returns/` |
| `inspect_return_item` | `p_item_id UUID, p_status TEXT, p_restock BOOL, p_notes? TEXT` | `void` | Admin: inspeccionar item devuelto | `admin/returns/` |
| `mark_return_shipped` | `p_return_id UUID, p_tracking TEXT` | `void` | Cliente marca envío de devolución | `returns/` |
| `calculate_refund_amount` | `p_return_id UUID` | `NUMERIC` | Calcula monto a reembolsar | `returns/` |

### Ejemplo de Llamada desde Flutter

```dart
// Validar cupón
final result = await supabase.rpc(
  'validate_coupon',
  params: {
    'code': 'VERANO20',
    'customer_email': 'user@email.com',
    'subtotal': 75.50,
  },
);

// Crear orden
final order = await supabase.rpc(
  'create_checkout_order',
  params: {
    'items': jsonEncode(cartItems),
    'shipping': jsonEncode(shippingAddress),
    'coupon_id': selectedCouponId, // nullable
  },
);
```

---

## ⚙️ Settings Completos del Sistema

La tabla `settings` almacena configuraciones clave-valor. Flutter debe consumir estas al inicio y suscribirse a cambios en tiempo real para las críticas.

### Estructura de la Tabla

```sql
settings (
  key TEXT PRIMARY KEY,
  value_text TEXT,
  value_bool BOOLEAN,
  value_number NUMERIC,
  updated_at TIMESTAMPTZ
)
```

### Claves Disponibles

| Key | Tipo | Valor Default | Descripción | Realtime |
|-----|------|---------------|-------------|----------|
| **Tienda** |||||
| `store_name` | text | "FashionStore" | Nombre de la tienda | ❌ |
| `store_email` | text | - | Email de contacto | ❌ |
| `store_phone` | text | - | Teléfono de contacto | ❌ |
| `store_address` | text | - | Dirección física | ❌ |
| **Envío** |||||
| `shipping_cost` | number | 4.99 | Coste de envío estándar (€) | ❌ |
| `free_shipping_threshold` | number | 50.00 | Mínimo para envío gratis (€) | ❌ |
| **Impuestos** |||||
| `tax_rate` | number | 21 | IVA en porcentaje | ❌ |
| `prices_include_tax` | bool | true | Si los precios ya incluyen IVA | ❌ |
| **Devoluciones** |||||
| `return_window_days` | number | 30 | Días para solicitar devolución | ❌ |
| **Ofertas** |||||
| `offers_enabled` | bool | false | Activa/desactiva ofertas flash | ✅ |
| `flash_offers_end` | text | null | Fecha fin de ofertas (ISO 8601) | ✅ |
| **Redes Sociales** |||||
| `social_instagram` | text | - | URL de Instagram | ❌ |
| `social_twitter` | text | - | URL de Twitter/X | ❌ |
| `social_tiktok` | text | - | URL de TikTok | ❌ |
| `social_youtube` | text | - | URL de YouTube | ❌ |
| **Sistema** |||||
| `maintenance_mode` | bool | false | Modo mantenimiento activo | ✅ |
| `maintenance_message` | text | - | Mensaje a mostrar en mantenimiento | ✅ |

### Provider de Settings Global

Crear en `shared/providers/settings_provider.dart`:

```dart
@riverpod
class SettingsNotifier extends _$SettingsNotifier {
  @override
  Future<StoreSettings> build() async {
    // Cargar todos los settings al inicio
    final settings = await supabase
        .from('settings')
        .select();
    return StoreSettings.fromRows(settings);
  }

  // Método para refrescar
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => build());
  }
}

// Stream para settings críticos (realtime)
@riverpod
Stream<bool> offersEnabled(OffersEnabledRef ref) {
  return supabase
      .from('settings')
      .stream(primaryKey: ['key'])
      .eq('key', 'offers_enabled')
      .map((rows) => rows.first['value_bool'] as bool? ?? false);
}

@riverpod
Stream<bool> maintenanceMode(MaintenanceModeRef ref) {
  return supabase
      .from('settings')
      .stream(primaryKey: ['key'])
      .eq('key', 'maintenance_mode')
      .map((rows) => rows.first['value_bool'] as bool? ?? false);
}
```

### Modelo StoreSettings

```dart
@freezed
class StoreSettings with _$StoreSettings {
  const factory StoreSettings({
    required String storeName,
    String? storeEmail,
    String? storePhone,
    String? storeAddress,
    @Default(4.99) double shippingCost,
    @Default(50.0) double freeShippingThreshold,
    @Default(21) int taxRate,
    @Default(true) bool pricesIncludeTax,
    @Default(30) int returnWindowDays,
    @Default(false) bool offersEnabled,
    String? flashOffersEnd,
    String? socialInstagram,
    String? socialTwitter,
    String? socialTiktok,
    String? socialYoutube,
    @Default(false) bool maintenanceMode,
    String? maintenanceMessage,
  }) = _StoreSettings;

  factory StoreSettings.fromRows(List<Map<String, dynamic>> rows) {
    // Parsear filas key-value a objeto tipado
    final map = {for (var r in rows) r['key']: r};
    return StoreSettings(
      storeName: map['store_name']?['value_text'] ?? 'FashionStore',
      storeEmail: map['store_email']?['value_text'],
      // ... resto de campos
    );
  }
}
```

---

## 🏗️ Patrones de Arquitectura

### 1. Repository Pattern con Either

**Domain (Contrato)**:
- Clase abstracta que define el contrato
- Métodos retornan `Future<Either<Failure, T>>`
- No conoce implementación ni Supabase

**Data (Implementación)**:
- Implementa la interfaz del domain
- Llama al datasource
- Captura excepciones y retorna `Left(Failure)` o `Right(data)`

### 2. Clase Failure (shared/exceptions/failures.dart)

Jerarquía de errores usando `sealed class`:
- `Failure` (clase base sealed)
  - `ServerFailure` → Errores de Supabase/red
  - `CacheFailure` → Errores de almacenamiento local
  - `AuthFailure` → Errores de autenticación
  - `ValidationFailure` → Errores de validación de datos

Cada Failure debe tener propiedad `message` para mostrar al usuario.

### 3. Riverpod 2.x con Code Generation

**AsyncNotifier para datos async**:
- Usar annotation `@riverpod` en la clase
- Extender de `_$NombreClase` (generado)
- Método `build()` retorna el estado inicial async
- Usar `ref.watch()` para dependencias

**Notifier para estado síncrono (Carrito)**:
- Usar annotation `@riverpod` 
- Método `build()` retorna estado inicial síncrono
- Métodos para mutar: `addItem`, `removeItem`, etc.
- Estado persistido en local storage

**StreamProvider para Realtime (Ofertas)**:
- Usar annotation `@riverpod` con `Stream<T>` como retorno
- Escuchar cambios en tabla `settings` via `.stream()`
- Widgets se reconstruyen automáticamente

### 4. Modelos Freezed

Cada modelo debe:
- Usar `@freezed` annotation
- Implementar `fromJson` factory con `@JsonSerializable`
- Mapear exactamente las columnas de Supabase
- Generar con `build_runner`

**Referencia de tablas** → Ver `Doc/migrations/001_create_tables.sql`

---

## 📱 Fases de Desarrollo

---

### FASE 0: Configuración Inicial del Proyecto

- [x] **Fase 0 completada** ✅ (27/01/2026)

#### Tareas:

- [x] Crear proyecto Flutter: `flutter create fashion_store_app --org com.fashionstore`
- [x] Configurar `pubspec.yaml` con todas las dependencias listadas
- [x] Ejecutar `flutter pub get`
- [x] Crear estructura de carpetas completa según el árbol obligatorio
- [x] Configurar `analysis_options.yaml` con reglas estrictas
- [x] Crear archivo `environment.dart` con variables de Supabase
- [x] Configurar Android: `minSdkVersion 21` en `android/app/build.gradle`
- [ ] Agregar permisos Android en `AndroidManifest.xml`:
  - [x] Internet (por defecto)
  - [ ] Cámara
  - [ ] Galería (READ_EXTERNAL_STORAGE, READ_MEDIA_IMAGES)
- [x] Crear `main.dart` con `ProviderScope` vacío
- [x] Verificar que el proyecto compila: `flutter analyze` sin errores

#### Referencias del proyecto web:
- Revisar `.env` o `.env.example` para obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY`

---

### FASE 1: Core y Shared

- [x] **Fase 1 completada** ✅ (27/01/2026)

#### Tareas:

**Tema y Estilos:**
- [x] Crear `config/theme/app_colors.dart` con la paleta definida en [Paleta de Colores y Tema](#-paleta-de-colores-y-tema)
- [x] Crear `config/theme/app_text_styles.dart` con GoogleFonts (Playfair Display + Lato)
- [x] Crear `config/theme/app_theme.dart` con ThemeData completo
- [x] Aplicar tema en `MaterialApp`

**Servicios Shared:**
- [x] Crear `shared/services/supabase_service.dart` con inicialización
- [x] Crear `shared/services/local_storage_service.dart` (SharedPreferences)
- [x] Crear `shared/services/image_service.dart` con compresión usando `flutter_image_compress`

**Manejo de Errores:**
- [x] Crear `shared/exceptions/failures.dart` con clase sealed `Failure`
- [x] Implementar subclases: `ServerFailure`, `AuthFailure`, `CacheFailure`, `ValidationFailure` + NetworkFailure, PaymentFailure, StockFailure, PermissionFailure, UnknownFailure

**Widgets Atómicos:**
- [x] Crear `shared/widgets/custom_button.dart` (variantes: primary, secondary, outline, text, danger)
- [x] Crear `shared/widgets/custom_text_field.dart` (variantes: email, password, phone, postalCode, nif, search, multiline)
- [x] Crear `shared/widgets/loading_indicator.dart` (variantes: circular, linear, dots)
- [x] Crear `shared/widgets/error_view.dart` (variantes: network, server, notFound, auth, permission, empty)

**Router Base:**
- [x] Crear `config/router/app_router.dart` con GoRouter básico
- [x] Definir rutas iniciales: `/`, `/login`, `/register`, `/products`, `/cart`, `/checkout`, `/orders`, `/profile`, `/admin/*`

**Extras implementados:**
- [x] Validadores españoles: email, phone, postal_code, nif, text_sanitizer
- [x] Extensiones: context_extensions, string_extensions
- [x] Archivos .env y .env.example configurados

#### Referencias del proyecto web:
- `src/components/ui/` → Diseño de componentes atómicos
- `src/styles/` → Variables CSS para colores

---

### FASE 2: Feature Auth

- [x] **Fase 2 completada** ✅ (27/01/2026)

#### Tareas:

**Capa Data:**
- [x] Crear `auth/data/models/user_model.dart` con Freezed
- [x] Crear `auth/data/datasources/auth_remote_datasource.dart`
  - Métodos: `signIn`, `signUp`, `signOut`, `getCurrentUser`, `getProfile`, `updateProfile`
- [x] Crear `auth/data/repositories/auth_repository_impl.dart`

**Capa Domain:**
- [x] Crear `auth/domain/repositories/auth_repository.dart` (interfaz abstracta)

**Capa Presentation:**
- [x] Crear `auth/presentation/providers/auth_provider.dart` con `@riverpod`
  - AsyncNotifier para estado de autenticación
  - Métodos: `login`, `register`, `logout`, `updateProfile`, `refresh`
- [x] Crear `auth/presentation/providers/auth_state_provider.dart`
  - StreamProvider escuchando `onAuthStateChange`
- [x] Crear `auth/presentation/screens/login_screen.dart`
- [x] Crear `auth/presentation/screens/register_screen.dart` (con nombre, apellidos, teléfono - sin dirección)
- [x] Crear barrel file `auth/auth.dart` para exportaciones

**Lógica de Roles:**
- [x] Implementar detección de rol admin (`raw_user_meta_data.is_admin`)
- [x] Crear guard en GoRouter para rutas protegidas (redirect function)
- [x] Redirigir según rol después del login (home para cliente, /admin para admin)

**Sesión Persistente:**
- [x] Configurar `persistSession: true` en Supabase init
- [x] Implementar auto-login al iniciar app (AsyncNotifier build)

**Extras implementados:**
- [x] Permisos Android añadidos (CAMERA, READ_EXTERNAL_STORAGE, READ_MEDIA_IMAGES)
- [x] Manejo de errores con `Either<Failure, T>` (fpdart)
- [x] Validación de formularios con validadores existentes
- [x] Integración con GoRouter mediante `AppRouter.createRouter(ref)`
- [x] Provider auxiliares: `isAuthenticated`, `isAdmin`

#### Referencias del proyecto web:
- `Doc/migrations/009_customer_auth.sql` → Estructura de customer_profiles
- `Doc/migrations/010_fix_customer_profiles.sql` → Correcciones de perfiles
- `src/lib/supabase.ts` → Lógica de autenticación actual
- `src/pages/cuenta/login.astro` → UI de referencia

---

### FASE 3: Features Cliente (Tienda)

- [ ] **Fase 3 completada**

#### 3.1 Feature Products (Catálogo)

- [x] **Feature Products completada** ✅ (27/01/2026)
- [x] Crear `products/data/models/product_model.dart` con Freezed
- [x] Crear `products/data/models/category_model.dart` con Freezed
- [x] Crear `products/data/models/product_variant_model.dart` (stock por talla)
- [x] Crear `products/data/models/product_image_model.dart`
- [x] Crear datasource con queries a Supabase (con filtros y paginación)
- [x] Crear repository con Either
- [x] Crear providers:
  - [x] `productsProvider` → Lista paginada (infinite scroll)
  - [x] `productDetailProvider(id)` → Detalle con variantes
  - [x] `categoriesProvider` → Lista de categorías
  - [x] `productFiltersProvider` → Estado de filtros (selectedCategoryProvider, searchQueryProvider)
- [x] Crear `products_screen.dart` con infinite scroll
- [x] Crear `product_detail_screen.dart` con galería y selector de tallas
- [x] Crear widgets: `ProductCard`, `ProductGrid`, `CategoryChip`, `SizeSelector`
- [x] Implementar búsqueda por texto con debounce
- [ ] Implementar Hero Animations entre lista y detalle

#### 3.2 Feature Cart (Carrito)

- [x] **Feature Cart completada** ✅ (28/01/2026)
- [x] Crear `cart/data/models/cart_item_model.dart` con Freezed
- [x] Crear `cart/data/models/cart_state_model.dart` con Freezed
- [x] Crear `cart/presentation/providers/cart_provider.dart` con Notifier (síncrono)
  - Estado persistente en local storage
  - Métodos: `addItem`, `removeItem`, `updateQuantity`, `clear`
- [x] Crear `cart_drawer.dart` (slide-over como en la web)
- [x] Crear `cart_item_tile.dart`
- [x] Crear `cart_summary.dart` (subtotal, envío, total)
- [x] Implementar barra de progreso "envío gratis"
- [x] Crear `cart_screen.dart` (pantalla completa del carrito)
- [x] Crear `cart_badge.dart` (badge con contador para AppBar)
- [x] Crear Feature Settings (prerrequisito):
  - [x] `setting_model.dart` con Freezed
  - [x] `settings_remote_datasource.dart`
  - [x] `settings_repository.dart` + `settings_repository_impl.dart`
  - [x] `settings_providers.dart` con `shippingCostProvider` y `freeShippingThresholdProvider`
- [x] Integrar carrito en `ProductDetailScreen` y `ProductsScreen`
- [x] Registrar ruta `/cart` en router

#### 3.3 Feature Offers (Ofertas Flash con Realtime)

- [x] Crear `offers/data/datasources/offers_realtime_datasource.dart`
- [x] Crear `offers/presentation/providers/offers_stream_provider.dart`
  - StreamProvider escuchando `settings` donde `key = 'offers_enabled'`
- [x] Crear `offers/presentation/providers/flash_offers_provider.dart`
  - Productos donde `is_offer = true`
- [x] Crear widget `FlashOffersCarousel` para Home
- [x] Implementar lógica: si `offersEnabled = false`, el carrusel desaparece sin reload
- [x] Añadir `@Riverpod(keepAlive: true)` a filtros para persistir entre navegaciones

#### 3.4 Feature Checkout ✅

- [x] Crear modelos para dirección de envío
- [x] Crear flujo de checkout (datos → resumen → confirmación)
- [x] Implementar `StripeService` según [Integración de Stripe](#-integración-de-stripe)
- [x] Crear provider `checkoutProvider` con lógica de pago
- [x] Llamar RPC `create_checkout_order` de Supabase
- [x] Crear pantalla de confirmación de pedido
- [x] Manejar estados: loading, success, cancelled, failed

#### 3.5 Home Screen

- [x] Crear `home_screen.dart` con:
  - [x] Hero/Banner principal
  - [x] Sección de categorías
  - [x] Carrusel de ofertas flash (condicional por stream)
  - [x] Productos destacados
- [x] Implementar navegación a catálogo y detalle

#### Referencias del proyecto web:
- `Doc/migrations/001_create_tables.sql` → Estructura de products, categories, product_variants
- `Doc/migrations/005_settings_value.sql` → Tabla settings para ofertas
- `Doc/migrations/014_add_category_size_type.sql` → Tipos de talla por categoría
- `src/stores/cartStore.ts` → Lógica del carrito
- `src/pages/productos/` → UI del catálogo
- `src/components/product/` → Componentes de producto

---

### FASE 4: Features Admin (Backoffice Móvil)

- [ ] **Fase 4 completada**

#### 4.1 Navegación Admin

- [x] **Fase 4.1 completada** ✅ (29/01/2026)
- [x] Crear layout admin con drawer de navegación
- [x] Proteger rutas admin con guard de rol (ya existente)
- [x] Crear `admin_home_screen.dart` con resumen/KPIs
- [x] Crear `admin_drawer.dart` con navegación completa
- [x] Crear `kpi_card.dart` widget reutilizable
- [x] Crear `sales_chart.dart` con fl_chart para gráfico de ventas
- [x] Crear `dashboard_provider.dart` con métricas reales desde Supabase
- [x] Implementar grid responsive (1 col móvil / 2 col tablet)
- [x] Mostrar alertas de stock bajo con datos reales
- [x] Acciones rápidas a otras secciones admin


#### 4.2 Feature Products Management (CRUD)

- [x] **Fase 4.2 completada** ✅ (29/01/2026)
- [x] Crear `admin/products_management/` con estructura completa
- [x] Crear datasource con operaciones CRUD
- [x] Crear providers para:
  - [x] Lista de productos (admin ve todos, incluso inactivos)
  - [x] Crear producto
  - [x] Editar producto
  - [x] Eliminar producto (soft delete según `Doc/migrations/033_products_soft_delete.sql`)
- [x] Crear `product_form_screen.dart` para crear/editar
- [x] Integrar `image_picker` para cámara y galería
- [x] Implementar compresión de imagen antes de subir a Supabase Storage
- [x] Subir imágenes al bucket `product-images`

#### 4.3 Feature Stock Management

- [x] Crear pantalla de visualización de inventario
- [x] Mostrar alertas de stock bajo
- [x] Permitir edición rápida de cantidades por variante
- [x] Referenciar RPCs de `Doc/migrations/006_stock_reservation_functions.sql`

#### 4.4 Feature Settings (Interruptor de Ofertas)

- [x] **Fase 4.4 completada** ✅ (29/01/2026)

**Arquitectura de Datos:**
- [x] Extender `settings/domain/repositories/settings_repository.dart`
  - Método `Future<Either<Failure, void>> updateSettings(List<SettingModel> settings)`
- [x] Extender `settings/data/repositories/settings_repository_impl.dart`
  - Implementar updateSettings con manejo de errores (NetworkFailure, AuthFailure, ValidationFailure)
- [x] Extender `settings/data/datasources/settings_remote_datasource.dart`
  - Método `updateSettings` que llama a `PUT /api/admin/configuracion`
  - Estructura JSON: `{"settings": [{"key": "offers_enabled", "value_bool": true}]}`
  - Usar cliente autenticado para RLS
  - Parsear errores de validación

**Provider Admin:**
- [x] Crear `admin/settings/presentation/providers/admin_settings_provider.dart`
  - `AdminSettingsNotifier` con `@riverpod`
  - Método `toggleOffers(bool enabled)` con guardado automático
  - Método `updateFlashOffersEnd(DateTime? endDate)` con validación de fecha futura
  - Invalidación de providers realtime tras actualización

**UI Admin:**
- [x] Crear `admin/settings/presentation/screens/admin_settings_screen.dart`
  - Switch para `offers_enabled` con guardado automático
  - DateTimePicker para `flash_offers_end` con validación visual
  - Toast de confirmación en cada guardado
  - Estados AsyncValue (loading/error/data)
  - Card informativa de realtime

**Router:**
- [x] Actualizar `config/router/app_router.dart`
  - Reemplazar placeholder con `AdminSettingsScreen()`

#### 4.5 Feature Settings Avanzadas (Configuración Completa)

- [ ] **Fase 4.5 pendiente**

**Objetivo**: Extender panel administrativo con todas las configuraciones de la tienda.

**UI Admin - Pantalla con Tabs:**
- [ ] Extender `admin_settings_screen.dart` con TabBar
    [x] Tab 1: "Ofertas" (ya implementado en 4.4)
  -  [x] Tab 2: "Información de Tienda"
  -  [x] Tab 3: "Envío"
  -  [x] Tab 4: "Redes Sociales"
  -  [x] Tab 5: "Devoluciones"
  -  [x] Tab 6: "Modo Mantenimiento"

**Tab 2: Información de Tienda**
- [x] TextFields con guardado automático:
  - `store_name` (requerido, max 100 chars)
  - `store_email` (validación email)
  - `store_phone` (validación teléfono español)
  - `store_address` (textarea, max 500 chars)

**Tab 3: Envío**
- [x] NumberField `shipping_cost` (€0.00 - €50.00)
- [x] NumberField `free_shipping_threshold` (€0.00 - €999.99)
- [x] Card informativo: "Envío gratis cuando el subtotal supere €{threshold}"

**Tab 4: Redes Sociales**
- [x] URLs para Instagram, Twitter, TikTok, YouTube
- [x] Validación de URL opcional

**Tab 5: Devoluciones**
- [x] NumberField `return_window_days` (1-365 días)

**Tab 6: Modo Mantenimiento**
- [x] Switch con modal de confirmación crítica
- [x] TextField `maintenance_message` (solo visible si modo activo)

**Validaciones:**
- [x] Crear `shared/validators/settings_validators.dart`
- [x] Whitelist de keys permitidas según endpoint web

#### Referencias del proyecto web:
- `src/pages/admin/productos/` → UI de gestión de productos
- `src/pages/admin/configuracion/` → Pantalla de configuración
- `src/pages/api/admin/configuracion.ts` → Endpoint PUT con ALLOWED_KEYS
- `src/components/admin/` → Componentes del backoffice
- `Doc/migrations/003_storage_bucket.sql` → Configuración del bucket de imágenes
- `Doc/migrations/035_improve_settings_rls.sql` → Políticas RLS admin

---

### FASE 5: Pulido y Preparación para Deploy

- [ ] **Fase 5 completada**

#### Optimización:

- [ ] Revisar y optimizar queries a Supabase (select solo columnas necesarias)
- [ ] Implementar caché local para datos frecuentes
- [ ] Optimizar tamaño de imágenes cacheadas
- [ ] Verificar rendimiento de 60fps en animaciones

#### UI/UX:

- [ ] Revisar consistencia de estilos en toda la app
- [ ] Agregar estados de loading en todas las pantallas
- [ ] Agregar estados de error con retry
- [ ] Agregar estados vacíos (empty states)
- [ ] Implementar pull-to-refresh donde aplique

#### Testing:

- [ ] Probar flujo completo de cliente (browse → cart → checkout)
- [ ] Probar flujo completo de admin (CRUD productos, interruptor)
- [ ] Probar realtime del interruptor de ofertas
- [ ] Probar en diferentes tamaños de pantalla Android
- [ ] Probar offline/online transitions

#### Build Android:

- [ ] Configurar signing key para release
- [ ] Configurar `build.gradle` para release
- [ ] Generar APK: `flutter build apk --release`
- [ ] Generar App Bundle: `flutter build appbundle --release`
- [ ] Probar APK en dispositivo físico

#### Documentación:

- [ ] Documentar variables de entorno necesarias
- [ ] Documentar proceso de build
- [ ] Crear README del proyecto Flutter

---

## 📊 Resumen de Modelos Freezed

### Modelos Principales

| Modelo | Tabla Supabase | Migración de Referencia |
|--------|----------------|-------------------------|
| `UserModel` | auth.users + customer_profiles | `009_customer_auth.sql` |
| `ProductModel` | products | `001_create_tables.sql`, `033_products_soft_delete.sql` |
| `CategoryModel` | categories | `001_create_tables.sql`, `014_add_category_size_type.sql` |
| `ProductVariantModel` | product_variants | `001_create_tables.sql` |
| `ProductImageModel` | product_images | `001_create_tables.sql` |
| `CartItemModel` | (local only) | N/A |
| `CartStateModel` | (local only) | N/A |
| `OrderModel` | orders | `001_create_tables.sql`, `026_add_order_number_polished.sql` |
| `OrderItemModel` | order_items | `001_create_tables.sql` |
| `CouponModel` | coupons | `015_create_coupons_table.sql` |
| `SettingModel` | settings | `005_settings_value.sql` |
| `AddressModel` | (embebido en order/customer_profiles) | `009_customer_auth.sql` |

### Modelos Adicionales (Features Extendidas)

| Modelo | Tabla Supabase | Migración de Referencia |
|--------|----------------|-------------------------|
| `ReturnModel` | returns | `021_create_returns_system.sql` |
| `ReturnItemModel` | return_items | `021_create_returns_system.sql` |
| `InvoiceModel` | invoices | `024_create_invoices.sql` |
| `PromotionModel` | promotions | `017_create_promotions_table.sql`, `019_enhance_promotions_table.sql` |
| `CouponUsageModel` | coupon_usages | `015_create_coupons_table.sql` |
| `StoreSettings` | settings (agregado) | `005_settings_value.sql`, `008_social_settings.sql` |

---

### Detalle de Campos por Modelo

#### ProductModel
```dart
@freezed
class ProductModel with _$ProductModel {
  const factory ProductModel({
    required String id,
    required String name,
    required String slug,
    String? description,
    required double price,
    double? compareAtPrice,  // Precio anterior (ofertas)
    required String categoryId,
    required bool isActive,
    required bool isOffer,
    DateTime? deletedAt,      // Soft delete (null = activo)
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _ProductModel;
}
```

#### CategoryModel
```dart
@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    required String id,
    required String name,
    required String slug,
    String? description,
    String? imageUrl,
    required String sizeType,  // 'clothing' | 'footwear' | 'universal'
    required int sortOrder,
    required bool isActive,
  }) = _CategoryModel;
}
```

#### OrderModel
```dart
@freezed
class OrderModel with _$OrderModel {
  const factory OrderModel({
    required String id,
    required int orderNumber,        // #A000001 para display
    String? customerId,              // null = guest checkout
    required String status,          // pending|paid|shipped|delivered|cancelled
    required double subtotal,
    required double shippingCost,
    double? discountAmount,
    required double total,
    double? refundedAmount,
    required String shippingName,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    required String shippingPhone,
    required String customerEmail,
    String? couponId,
    String? stripeSessionId,
    DateTime? paidAt,
    DateTime? shippedAt,
    DateTime? deliveredAt,
    required DateTime createdAt,
  }) = _OrderModel;

  // Helper para formatear número de pedido
  String get formattedOrderNumber => '#A${orderNumber.toString().padLeft(6, '0')}';
}
```

#### CouponModel (Completo)
```dart
@freezed
class CouponModel with _$CouponModel {
  const factory CouponModel({
    required String id,
    required String code,
    String? stripeCouponId,
    required String discountType,    // 'fixed' | 'percentage'
    required double discountValue,
    double? minPurchaseAmount,
    double? maxDiscountAmount,       // Tope para porcentaje
    DateTime? startDate,
    DateTime? endDate,
    int? maxUses,                    // Total de usos permitidos
    @Default(0) int currentUses,
    int? maxUsesPerCustomer,
    @Default(true) bool isActive,
    required DateTime createdAt,
  }) = _CouponModel;

  // Helper para calcular descuento
  double calculateDiscount(double subtotal) {
    if (discountType == 'fixed') {
      return discountValue;
    }
    final discount = subtotal * (discountValue / 100);
    return maxDiscountAmount != null 
        ? discount.clamp(0, maxDiscountAmount!) 
        : discount;
  }
}
```

#### ReturnModel
```dart
@freezed
class ReturnModel with _$ReturnModel {
  const factory ReturnModel({
    required String id,
    required String orderId,
    required String userId,
    required String status,  // Ver enum abajo
    double? refundAmount,
    String? customerNotes,
    String? adminNotes,
    String? rejectionReason,
    String? trackingNumber,
    required DateTime createdAt,
    DateTime? updatedAt,
  }) = _ReturnModel;
}

// Estados posibles de una devolución
enum ReturnStatus {
  requested,   // Solicitada por cliente
  approved,    // Aprobada por admin
  rejected,    // Rechazada por admin
  shipped,     // Cliente envió el paquete
  received,    // Admin recibió el paquete
  completed,   // Reembolso procesado
}
```

#### ReturnItemModel
```dart
@freezed
class ReturnItemModel with _$ReturnItemModel {
  const factory ReturnItemModel({
    required String id,
    required String returnId,
    required String orderItemId,
    required String productVariantId,
    required int quantity,
    required String reason,           // Ver enum abajo
    String? reasonDetails,
    @Default('pending') String inspectionStatus,  // pending|approved|rejected
    @Default(false) bool restockApproved,
    double? refundAmount,
    String? inspectionNotes,
  }) = _ReturnItemModel;
}

// Razones de devolución
enum ReturnReason {
  sizeMismatch,     // Talla incorrecta
  defective,        // Producto defectuoso
  notAsDescribed,   // No coincide con descripción
  changedMind,      // Cambio de opinión
  arrivedLate,      // Llegó tarde
  other,            // Otro motivo
}
```

#### InvoiceModel
```dart
@freezed
class InvoiceModel with _$InvoiceModel {
  const factory InvoiceModel({
    required String id,
    required String orderId,
    required String invoiceNumber,    // Formato: 'FS-2026-00001'
    required String customerNif,
    required String customerFiscalName,
    required String customerFiscalAddress,
    required double subtotal,
    required double taxRate,          // 21
    required double taxAmount,
    required double total,
    String? pdfUrl,                   // URL en storage bucket
    required DateTime createdAt,
  }) = _InvoiceModel;
}
```

#### PromotionModel
```dart
@freezed
class PromotionModel with _$PromotionModel {
  const factory PromotionModel({
    required String id,
    required String title,
    String? description,
    required String imageUrl,
    String? couponId,                 // Cupón asociado (opcional)
    required List<String> locations,  // ['home_hero', 'announcement', 'checkout']
    @Default(0) int priority,
    Map<String, dynamic>? styleConfig,  // { textColor, textAlignment, overlayOpacity }
    DateTime? startDate,
    DateTime? endDate,
    @Default(true) bool isActive,
    required DateTime createdAt,
  }) = _PromotionModel;

  // Helper para verificar si está vigente
  bool get isCurrentlyActive {
    final now = DateTime.now();
    if (!isActive) return false;
    if (startDate != null && now.isBefore(startDate!)) return false;
    if (endDate != null && now.isAfter(endDate!)) return false;
    return true;
  }
}
```

#### CartItemModel (Local)
```dart
@freezed
class CartItemModel with _$CartItemModel {
  const factory CartItemModel({
    required String id,           // '${productId}-${variantId}'
    required String productId,
    required String productName,
    required String productSlug,
    required String variantId,
    required String size,
    required double price,
    required String imageUrl,
    required int quantity,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
}
```

---

## 🔄 Flujos de Usuario Detallados

### Flujo de Checkout con Cupones

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT CON CUPONES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CARRITO → Usuario tiene items en cart local                 │
│     └──► Navega a /checkout                                     │
│                                                                 │
│  2. DATOS ENVÍO → Formulario de dirección                       │
│     └──► Validar campos (validators/)                           │
│     └──► Guardar en estado temporal                             │
│                                                                 │
│  3. CUPÓN (Opcional)                                            │
│     └──► Usuario ingresa código                                 │
│     └──► RPC validate_coupon(code, email, subtotal)             │
│     └──► Si válido → mostrar descuento aplicado                 │
│     └──► Si inválido → mostrar error específico                 │
│                                                                 │
│  4. RESUMEN → Mostrar desglose                                  │
│     └──► Subtotal (sum items)                                   │
│     └──► Descuento cupón (si aplica)                            │
│     └──► Envío (settings.shipping_cost o gratis si > threshold) │
│     └──► Total final                                            │
│                                                                 │
│  5. RESERVAR STOCK                                              │
│     └──► Por cada item: RPC reserve_stock(variant_id, qty)      │
│     └──► Si alguno falla → restore_stock() de los previos       │
│     └──► Mostrar error "Stock insuficiente para [producto]"     │
│                                                                 │
│  6. CREAR ORDEN                                                 │
│     └──► RPC create_checkout_order(items, shipping, coupon_id)  │
│     └──► Retorna { order_id, order_number }                     │
│                                                                 │
│  7. PAGO STRIPE                                                 │
│     └──► Crear PaymentIntent o Checkout Session                 │
│     └──► Abrir Stripe SDK / WebView                             │
│     └──► Esperar resultado                                      │
│                                                                 │
│  8. CONFIRMACIÓN                                                │
│     └──► Si éxito → RPC update_order_status('paid')             │
│     └──► Si cupón → RPC use_coupon(coupon_id, email, order_id)  │
│     └──► Limpiar carrito local                                  │
│     └──► Navegar a pantalla de confirmación                     │
│                                                                 │
│  9. ERROR DE PAGO                                               │
│     └──► RPC cancel_order(order_id) → restaura stock            │
│     └──► Mostrar error y permitir reintentar                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Devolución (Cliente)

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVOLUCIÓN - CLIENTE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. VERIFICAR ELEGIBILIDAD                                      │
│     └──► Pedido con status = 'delivered'                        │
│     └──► delivered_at + return_window_days > hoy                │
│     └──► No tiene devolución activa previa                      │
│                                                                 │
│  2. SELECCIONAR ITEMS                                           │
│     └──► Mostrar items del pedido                               │
│     └──► Usuario selecciona cuáles devolver                     │
│     └──► Por cada item: cantidad y motivo (ReturnReason)        │
│                                                                 │
│  3. CREAR SOLICITUD                                             │
│     └──► INSERT INTO returns (order_id, user_id, status)        │
│     └──► INSERT INTO return_items (por cada item seleccionado)  │
│     └──► status inicial = 'requested'                           │
│                                                                 │
│  4. SUBIR FOTOS (Opcional pero recomendado)                     │
│     └──► image_picker → seleccionar fotos                       │
│     └──► image_service → comprimir                              │
│     └──► Subir a storage bucket 'return-images'                 │
│     └──► Guardar URLs en return_items                           │
│                                                                 │
│  5. ESPERAR APROBACIÓN                                          │
│     └──► Mostrar status 'Pendiente de revisión'                 │
│     └──► Admin recibe notificación                              │
│                                                                 │
│  6. SI APROBADA                                                 │
│     └──► Usuario ve instrucciones de envío                      │
│     └──► Introduce tracking number                              │
│     └──► RPC mark_return_shipped(return_id, tracking)           │
│     └──► status → 'shipped'                                     │
│                                                                 │
│  7. SI RECHAZADA                                                │
│     └──► Ver motivo de rechazo                                  │
│     └──► Puede crear nueva solicitud o contactar soporte        │
│                                                                 │
│  8. COMPLETADA                                                  │
│     └──► Admin procesa reembolso                                │
│     └──► Usuario ve monto reembolsado                           │
│     └──► status → 'completed'                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Devolución (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVOLUCIÓN - ADMIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. LISTAR SOLICITUDES                                          │
│     └──► Filtrar por status (requested, shipped, received...)   │
│     └──► Ordenar por fecha (más antiguas primero)               │
│                                                                 │
│  2. REVISAR SOLICITUD                                           │
│     └──► Ver datos del pedido original                          │
│     └──► Ver items solicitados con motivos                      │
│     └──► Ver fotos adjuntas                                     │
│     └──► Ver historial del cliente (devoluciones previas)       │
│                                                                 │
│  3. APROBAR O RECHAZAR                                          │
│     └──► RPC process_return(return_id, 'approve', notes)        │
│         ó                                                       │
│     └──► RPC process_return(return_id, 'reject', null, reason)  │
│                                                                 │
│  4. RECIBIR PAQUETE (si fue aprobada y enviada)                 │
│     └──► RPC process_return(return_id, 'receive')               │
│     └──► status → 'received'                                    │
│                                                                 │
│  5. INSPECCIONAR ITEMS                                          │
│     └──► Por cada item:                                         │
│         └──► RPC inspect_return_item(                           │
│                item_id,                                         │
│                status: 'approved'|'rejected',                   │
│                restock: true|false,                             │
│                notes: 'Estado del producto'                     │
│              )                                                  │
│                                                                 │
│  6. COMPLETAR DEVOLUCIÓN                                        │
│     └──► RPC process_return(return_id, 'complete')              │
│     └──► Automáticamente:                                       │
│         └──► Calcula refund_amount                              │
│         └──► Si restock=true → restore_stock()                  │
│         └──► Actualiza orders.refunded_amount                   │
│     └──► Procesar reembolso en Stripe (manual o automático)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Solicitud de Factura

```
┌─────────────────────────────────────────────────────────────────┐
│                   SOLICITUD DE FACTURA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. VERIFICAR ELEGIBILIDAD                                      │
│     └──► Pedido con status = 'paid' | 'shipped' | 'delivered'   │
│     └──► No tiene factura generada previamente                  │
│                                                                 │
│  2. FORMULARIO DATOS FISCALES                                   │
│     └──► NIF/CIF (validar formato español)                      │
│     └──► Nombre/Razón Social                                    │
│     └──► Dirección fiscal completa                              │
│                                                                 │
│  3. CREAR FACTURA                                               │
│     └──► RPC create_invoice(order_id, nif, name, address)       │
│     └──► Genera número secuencial: 'FS-2026-00001'              │
│     └──► Calcula desglose:                                      │
│         └──► Base imponible (subtotal sin IVA)                  │
│         └──► IVA (21%)                                          │
│         └──► Total                                              │
│                                                                 │
│  4. GENERAR PDF (Backend/Edge Function)                         │
│     └──► Trigger o llamada a Edge Function                      │
│     └──► Genera PDF con datos de factura                        │
│     └──► Sube a storage bucket 'documents'                      │
│     └──► Guarda URL en invoices.pdf_url                         │
│                                                                 │
│  5. DESCARGAR                                                   │
│     └──► Usuario descarga PDF desde la app                      │
│     └──► Opción de compartir (share intent)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Validadores Dart

Crear en `shared/validators/` los siguientes validadores, equivalentes a los del proyecto web:

### validators/email_validator.dart

```dart
/// Valida email según RFC 5322 simplificado
/// Máximo 254 caracteres, formato local@dominio.tld
class EmailValidator {
  static final _emailRegex = RegExp(
    r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
    caseSensitive: false,
  );

  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'El email es obligatorio';
    }
    if (value.length > 254) {
      return 'El email es demasiado largo';
    }
    if (!_emailRegex.hasMatch(value)) {
      return 'Introduce un email válido';
    }
    return null;
  }

  static bool isValid(String value) => validate(value) == null;
}
```

### validators/phone_validator.dart

```dart
/// Valida teléfono español: 9 dígitos, empieza por 6, 7, 8 o 9
class PhoneValidator {
  static final _phoneRegex = RegExp(r'^[6789]\d{8}$');

  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'El teléfono es obligatorio';
    }
    // Limpiar espacios, guiones y puntos
    final cleaned = value.replaceAll(RegExp(r'[\s\-\.]'), '');
    
    if (!_phoneRegex.hasMatch(cleaned)) {
      return 'Introduce un teléfono válido (9 dígitos)';
    }
    return null;
  }

  static bool isValid(String value) => validate(value) == null;

  /// Formatea el teléfono para display: 612 345 678
  static String format(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[\s\-\.]'), '');
    if (cleaned.length != 9) return phone;
    return '${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}';
  }
}
```

### validators/postal_code_validator.dart

```dart
/// Valida código postal español: 5 dígitos, rango 01000-52999
class PostalCodeValidator {
  static final _postalRegex = RegExp(r'^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$');

  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'El código postal es obligatorio';
    }
    if (!_postalRegex.hasMatch(value)) {
      return 'Introduce un código postal válido (5 dígitos)';
    }
    return null;
  }

  static bool isValid(String value) => validate(value) == null;

  /// Obtiene la provincia a partir del código postal
  static String? getProvince(String postalCode) {
    if (!isValid(postalCode)) return null;
    final prefix = int.parse(postalCode.substring(0, 2));
    return _provinces[prefix];
  }

  static const _provinces = {
    1: 'Álava', 2: 'Albacete', 3: 'Alicante', 4: 'Almería',
    5: 'Ávila', 6: 'Badajoz', 7: 'Baleares', 8: 'Barcelona',
    // ... resto de provincias
    50: 'Zaragoza', 51: 'Ceuta', 52: 'Melilla',
  };
}
```

### validators/nif_validator.dart

```dart
/// Valida NIF/NIE/CIF español
class NifValidator {
  static final _nifRegex = RegExp(r'^\d{8}[A-Z]$');
  static final _nieRegex = RegExp(r'^[XYZ]\d{7}[A-Z]$');
  static final _cifRegex = RegExp(r'^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$');
  
  static const _nifLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';

  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'El NIF/CIF es obligatorio';
    }
    final upper = value.toUpperCase().replaceAll(RegExp(r'[\s\-]'), '');
    
    if (_nifRegex.hasMatch(upper)) {
      return _validateNif(upper) ? null : 'NIF inválido';
    }
    if (_nieRegex.hasMatch(upper)) {
      return _validateNie(upper) ? null : 'NIE inválido';
    }
    if (_cifRegex.hasMatch(upper)) {
      return null; // CIF: validación simplificada
    }
    return 'Introduce un NIF/NIE/CIF válido';
  }

  static bool _validateNif(String nif) {
    final number = int.parse(nif.substring(0, 8));
    final letter = nif[8];
    return _nifLetters[number % 23] == letter;
  }

  static bool _validateNie(String nie) {
    final prefix = {'X': '0', 'Y': '1', 'Z': '2'}[nie[0]]!;
    final nif = '$prefix${nie.substring(1)}';
    return _validateNif(nif);
  }

  static bool isValid(String value) => validate(value) == null;
}
```

### validators/text_sanitizer.dart

```dart
/// Sanitiza texto para prevenir inyección de caracteres peligrosos
class TextSanitizer {
  static final _dangerousChars = RegExp(r'[<>\/\\{}\'\\"`&;:\[\]()]');
  
  /// Elimina caracteres potencialmente peligrosos
  static String sanitize(String value) {
    return value.replaceAll(_dangerousChars, '');
  }

  /// Valida que no contenga caracteres peligrosos
  static String? validate(String? value, {String fieldName = 'Este campo'}) {
    if (value == null || value.isEmpty) return null;
    if (_dangerousChars.hasMatch(value)) {
      return '$fieldName contiene caracteres no permitidos';
    }
    return null;
  }

  /// Escapa HTML para display seguro
  static String escapeHtml(String value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
  }
}
```

### validators/index.dart (Barrel export)

```dart
export 'email_validator.dart';
export 'phone_validator.dart';
export 'postal_code_validator.dart';
export 'nif_validator.dart';
export 'text_sanitizer.dart';
```

### Uso en Formularios

```dart
TextFormField(
  decoration: const InputDecoration(labelText: 'Email'),
  validator: EmailValidator.validate,
  onChanged: (value) => email = value,
),

TextFormField(
  decoration: const InputDecoration(labelText: 'Teléfono'),
  validator: PhoneValidator.validate,
  keyboardType: TextInputType.phone,
  inputFormatters: [
    FilteringTextInputFormatter.digitsOnly,
    LengthLimitingTextInputFormatter(9),
  ],
),
```

---

## 🔄 Flujo del Interruptor de Ofertas

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO REALTIME                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ADMIN abre Settings                                         │
│     └──► Ve Switch "Ofertas Activas" (estado actual del DB)     │
│                                                                 │
│  2. ADMIN cambia el Switch                                      │
│     └──► UPDATE settings SET value_bool = true/false            │
│          WHERE key = 'offers_enabled'                           │
│                                                                 │
│  3. SUPABASE REALTIME detecta cambio                            │
│     └──► Broadcast a todos los suscriptores                     │
│                                                                 │
│  4. CLIENTES tienen StreamProvider activo                       │
│     └──► Stream emite nuevo valor automáticamente               │
│                                                                 │
│  5. RIVERPOD reconstruye widgets suscritos                      │
│     └──► FlashOffersCarousel aparece/desaparece                 │
│          SIN necesidad de reload manual                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementación en Riverpod:

**Provider que escucha el stream:**
- Usar `@riverpod` annotation
- Retornar `Stream<bool>` 
- Suscribirse a `supabase.from('settings').stream(primaryKey: ['key']).eq('key', 'offers_enabled')`
- Mapear el resultado a `bool` desde `value_bool`

**Widget que consume:**
- Usar `ref.watch(offersEnabledProvider)` 
- Manejar estados: `loading`, `data`, `error`
- Si `data == true` → mostrar carrusel
- Si `data == false` → ocultar carrusel (con animación)

---

## ✅ Checklist Final Pre-Deploy

- [ ] Todas las fases completadas (0-5)
- [ ] App funciona sin errores en modo release
- [ ] Probado en al menos 3 dispositivos Android diferentes
- [ ] Rendimiento de 60fps verificado
- [ ] Realtime funcionando correctamente
- [ ] Imágenes se comprimen antes de subir
- [ ] Sesión persiste entre reinicios de app
- [ ] Roles cliente/admin funcionan correctamente
- [ ] Guards de navegación funcionan correctamente
- [ ] APK firmado y listo para distribución

---

## 📝 Notas Adicionales

### Convenciones de Código

1. **Nombres de archivos**: snake_case (`product_model.dart`)
2. **Nombres de clases**: PascalCase (`ProductModel`)
3. **Nombres de providers**: camelCase con sufijo Provider (`productsProvider`)
4. **Nombres de métodos**: camelCase (`getProducts`)

### Generación de Código

Después de crear o modificar archivos con `@freezed` o `@riverpod`:

```bash
dart run build_runner build --delete-conflicting-outputs
```

Para desarrollo continuo (watch mode):

```bash
dart run build_runner watch --delete-conflicting-outputs
```

### Estructura de un Modelo Freezed

Los modelos deben:
1. Importar `freezed_annotation` y `json_annotation`
2. Incluir `part` directive para archivos generados
3. Usar `@freezed` en la clase
4. Implementar factory `fromJson`

### Estructura de un Provider Riverpod

Los providers deben:
1. Importar `riverpod_annotation`
2. Incluir `part` directive para archivo generado
3. Usar `@riverpod` en la clase o función
4. Para AsyncNotifier: extender de `_$NombreClase`
5. Implementar método `build()` obligatorio

---

## 🚀 Funcionalidades Extras (Futuras)

Esta sección documenta funcionalidades que pueden implementarse en fases posteriores.

### 📧 Email de Confirmación de Pedido

**Descripción**: Enviar automáticamente un email al cliente tras completar un checkout exitoso.

**Implementación sugerida**:
1. Crear Supabase Edge Function `send-order-confirmation`
2. Disparar mediante Database Trigger en `orders` cuando `status` cambie a `paid`
3. Usar servicio de email (Resend, SendGrid, o SMTP)
4. Template HTML con:
   - Número de pedido
   - Resumen de productos
   - Dirección de envío
   - Total pagado
   - Link para seguimiento

**Trigger SQL**:
```sql
CREATE OR REPLACE FUNCTION notify_order_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://[project-ref].supabase.co/functions/v1/send-order-confirmation',
      body := json_build_object('order_id', NEW.id)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_confirmation();
```

**Prioridad**: Media  
**Dependencias**: Fase 3.4 (Checkout) completada

### 🔔 Notificaciones Push

**Descripción**: Enviar notificaciones push para actualizaciones de pedido.

**Casos de uso**:
- Pedido confirmado
- Pedido enviado
- Pedido entregado
- Ofertas flash activas

**Implementación sugerida**:
- Firebase Cloud Messaging (FCM)
- Supabase Edge Function para disparar notificaciones
- Guardar tokens FCM en `customer_profiles`

**Prioridad**: Baja
