# Referencia Rápida - Flutter FashionStore

## 🚀 Quick Start para Agente IA

### Prompt Template

```
Estoy en el Módulo [XX]: [Nombre]

Lee el archivo completo:
- Doc/Flutter/[XX]-[NOMBRE].md

Necesito implementar:
[Descripción específica de la tarea]

Ya he completado los módulos previos (01-[XX-1]).

Requisitos:
- Seguir EXACTAMENTE el diseño visual especificado
- Usar Freezed para modelos
- Ejecutar build_runner después de crear modelos
- Implementar manejo de errores robusto
- Todos los estados: loading, error, success
```

### Ejemplo Práctico

```
Estoy en el Módulo 04: Autenticación

Lee el archivo completo:
- Doc/Flutter/04-AUTENTICACION.md

Necesito implementar:
1. Modelos Freezed (AuthUser, CustomerProfile, AuthState)
2. AuthRepository con datasource de Supabase
3. Providers Riverpod (authState, currentUser, authController)
4. LoginScreen con validaciones

Ya he completado los módulos 01-03 (Setup, Diseño, Widgets Base).

Requisitos:
- Colores: Primary #CCFF00 (dark mode), #4F7A1F (light mode)
- Tipografía: Oswald para headings, Space Grotesk para body
- Spacing: múltiplos de 4px
- Manejo de errores de Supabase traducidos al español
```

## 📚 Índice Rápido de Módulos

| # | Módulo | Tiempo | Complejidad | Archivos Clave |
|---|--------|--------|-------------|----------------|
| 00 | Guía IA | - | - | Lectura obligatoria |
| 01 | Setup | 1-2h | Baja | pubspec.yaml, main.dart, env_config.dart |
| 02 | Diseño | 2-3h | Media | app_colors.dart, app_typography.dart, app_theme.dart |
| 03 | Widgets | 4-6h | Media-Alta | app_button.dart, app_text_field.dart, +8 widgets |
| 04 | Auth | 6-8h | Alta | auth_repository.dart, auth_providers.dart, login_screen.dart |
| 05 | Navegación | 3-4h | Media | app_router.dart, main_navigation_screen.dart |
| 06 | Catálogo | 8-10h | Alta | product.dart, catalog_screen.dart, product_detail_screen.dart |
| 07 | Carrito | 4-6h | Media | cart.dart, cart_repository.dart, cart_screen.dart |
| 08 | Checkout | 8-10h | Alta | checkout_screen.dart, stripe_webview.dart, coupon_input.dart |
| 09 | Pedidos | 8-10h | Alta | order.dart, orders_list_screen.dart, return_request_screen.dart |
| 10 | Perfil | 4-6h | Media | user_profile.dart, edit_profile_screen.dart |
| 11 | Newsletter | 2-3h | Baja | (Pendiente de crear) |
| 12 | Admin | 15-20h | Muy Alta | (Pendiente de crear) |
| 13 | Testing | 6-8h | Alta | (Pendiente de crear) |
| 14 | Deploy | 4-6h | Media | (Pendiente de crear) |

**Total Completado:** 12/14 módulos | ~50-65 horas de implementación

## 🎨 Diseño Visual - Valores Exactos

### Colores HSL

```dart
// Dark Mode (Principal)
static const darkBackground = Color(0xFF0A0A0A);      // #0A0A0A
static const darkForeground = Color(0xFFFAFAFA);      // #FAFAFA
static const darkPrimary = Color(0xFFCCFF00);         // #CCFF00 ⭐
static const darkCard = Color(0xFF141414);            // #141414
static const darkMuted = Color(0xFF1F1F1F);           // #1F1F1F
static const darkBorder = Color(0xFF262626);          // #262626

// Light Mode
static const lightBackground = Color(0xFFFFFFFF);     // #FFFFFF
static const lightForeground = Color(0xFF0A0A0A);     // #0A0A0A
static const lightPrimary = Color(0xFF4F7A1F);        // #4F7A1F

// Semánticos
static const accent = Color(0xFFFF4757);              // #FF4757 🔴
static const success = Color(0xFF10B981);             // #10B981 ✅
static const error = Color(0xFFFF4757);               // #FF4757
static const warning = Color(0xFFFBBF24);             // #FBBF24
static const info = Color(0xFF3B82F6);                // #3B82F6
```

### Tipografías

```dart
// Familias
Display:  'BebasNeue'      // Títulos hero, números grandes
Heading:  'Oswald'         // H1-H6, botones
Body:     'SpaceGrotesk'   // Texto general, UI

// Tamaños Display
displayLarge:   72px, weight 700, height 0.9, letterSpacing -1.5
displayMedium:  56px, weight 700, height 0.95, letterSpacing -1.0
displaySmall:   40px, weight 700, height 1.0, letterSpacing -0.5

// Tamaños Heading
headingLarge:   32px, weight 600, height 1.2, letterSpacing 0.5
headingMedium:  24px, weight 600, height 1.3, letterSpacing 0.25
headingSmall:   20px, weight 600, height 1.4, letterSpacing 0.15
headingXSmall:  18px, weight 600, height 1.4, letterSpacing 0.1

// Tamaños Body
bodyLarge:      16px, weight 400, height 1.5, letterSpacing 0.15
bodyMedium:     14px, weight 400, height 1.5, letterSpacing 0.1
bodySmall:      12px, weight 400, height 1.5, letterSpacing 0.0

// Labels
labelLarge:     16px, weight 600, height 1.25, letterSpacing 0.5
labelMedium:    14px, weight 600, height 1.3, letterSpacing 0.25
labelSmall:     12px, weight 600, height 1.3, letterSpacing 0.5
```

### Spacing System

```dart
xs:    4px
sm:    8px
md:    16px
lg:    24px
xl:    32px
xxl:   48px
xxxl:  64px

// Especiales
minTouchTarget:    44px    // Mínimo para accesibilidad
buttonPaddingV:    12px
buttonPaddingH:    24px
cardPadding:       16px
screenPadding:     16px

// Border Radius
radiusSm:   4px
radiusMd:   8px
radiusLg:   12px
radiusXl:   16px
radiusFull: 9999px
```

## 🗄️ Backend (Supabase) - Tablas Principales

### Schema Overview

```
auth.users ──┬── customer_profiles
             ├── orders ──┬── order_items
             │            └── order_shipments
             └── returns ─── return_items

categories ─── products ──┬── product_variants
                          └── product_images

coupons ─── coupon_usages

promotions ─── promotion_history

newsletter_subscribers

invoices

settings (key-value)
```

### RPC Functions Críticas

```sql
-- Auth & Profile
get_customer_profile()
upsert_customer_profile(...)

-- Coupons
validate_coupon(p_coupon_code TEXT)

-- Stock
reserve_stock_atomic(p_items JSONB)
release_stock_atomic(p_items JSONB)

-- Orders
create_order_with_items(...)
get_customer_orders(p_customer_id UUID)
cancel_order(p_order_id UUID)

-- Returns
create_return_request(...)
calculate_return_refund(p_return_id UUID)

-- Invoices
request_invoice(p_order_id UUID, p_customer_nif TEXT)
```

## 🔧 Comandos Esenciales

### Setup Inicial

```bash
# Crear proyecto
flutter create fashionstore --org com.fashionstore
cd fashionstore

# Instalar dependencias (después de configurar pubspec.yaml)
flutter pub get

# Descargar fuentes y colocar en assets/fonts/
# - BebasNeue-Regular.ttf
# - Oswald-{Regular,Medium,SemiBold,Bold}.ttf
# - SpaceGrotesk-{Regular,Medium,Bold}.ttf
```

### Desarrollo

```bash
# Ejecutar con variables de entorno
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...

# Generar código Freezed (después de crear modelos)
flutter pub run build_runner build --delete-conflicting-outputs

# Watch mode (regenerar automáticamente)
flutter pub run build_runner watch --delete-conflicting-outputs

# Análisis de código
flutter analyze

# Tests
flutter test
```

### Build Release

```bash
# Android APK
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://prod.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=xxx \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...

# Android App Bundle (para Play Store)
flutter build appbundle --release [mismas variables]

# iOS (requiere Mac + Xcode)
flutter build ipa --release [mismas variables]
```

## ⚠️ Errores Comunes y Soluciones

### 1. Modelos Freezed no generan

**Error:** `The built value serializer ....`

**Solución:**
```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### 2. Supabase Auth Error

**Error:** `Invalid login credentials`

**Solución:** Verificar que:
- Email existe en auth.users
- Password es correcta
- Auth está configurada en Supabase Dashboard

### 3. Imágenes no cargan

**Error:** Imágenes no se muestran

**Solución:**
- Verificar URLs de Cloudinary
- Usar `CachedNetworkImage`
- Verificar permisos de internet (Android manifest)

### 4. GoRouter no navega

**Error:** Rutas no funcionan

**Solución:**
- Verificar que `goRouterProvider` está en MaterialApp.router
- Verificar sintaxis de rutas (paths)
- Revisar guards de autenticación

### 5. Stripe WebView no abre

**Error:** WebView muestra pantalla en blanco

**Solución:**
- Verificar que `webview_flutter` está instalado
- Habilitar JavaScript: `setJavaScriptMode(JavaScriptMode.unrestricted)`
- Verificar URL de Stripe es válida

## 📝 Checklist por Módulo

### Antes de Empezar un Módulo

- [ ] Leer el archivo `.md` completo del módulo
- [ ] Verificar que módulos previos están completados
- [ ] Tener backend Supabase configurado (tablas, RLS, RPCs)
- [ ] Tener variables de entorno configuradas

### Durante Implementación

- [ ] Crear modelos Freezed primero
- [ ] Ejecutar build_runner
- [ ] Implementar repository (data layer)
- [ ] Implementar providers (Riverpod)
- [ ] Implementar UI (screens, widgets)
- [ ] Probar en emulador/dispositivo

### Después de Completar un Módulo

- [ ] `flutter analyze` sin errores críticos
- [ ] Compilación exitosa (`flutter run`)
- [ ] UI sigue diseño visual especificado
- [ ] Todos los estados funcionan (loading, error, success)
- [ ] Navegación funciona correctamente
- [ ] Tests manuales del checklist pasados
- [ ] Commit con mensaje descriptivo

## 🎯 Prioridades de Implementación

### MVP Funcional (Módulos 01-08)

**Tiempo:** ~40-50 horas

Esto da una tienda e-commerce **completamente funcional**:
- ✅ Usuarios pueden registrarse/login
- ✅ Explorar catálogo con filtros
- ✅ Añadir productos al carrito
- ✅ Realizar checkout con Stripe
- ✅ Comprar productos reales

### Features Complementarias (Módulos 09-10)

**Tiempo:** +12-16 horas

- Historial de pedidos
- Sistema de devoluciones
- Edición de perfil

### Admin y Polish (Módulos 11-14)

**Tiempo:** +25-35 horas

- Newsletter
- Panel de administración
- Testing
- Despliegue en stores

## 📞 Troubleshooting

### Supabase Connection Issues

```dart
// Verificar configuración
print('Supabase URL: ${EnvConfig.supabaseUrl}');
print('Anon Key: ${EnvConfig.supabaseAnonKey.substring(0, 20)}...');

// Test connection
final response = await supabase.from('categories').select().limit(1);
print('Connection OK: ${response.length}');
```

### Debug Providers

```dart
// Ver estado actual de un provider
ref.listen(authStateProvider, (previous, next) {
  print('Auth State Changed: $next');
});
```

### Debug Navigation

```dart
// En GoRouter
debugLogDiagnostics: true,

// Ver ruta actual
print('Current route: ${GoRouterState.of(context).matchedLocation}');
```

## 🆘 Soporte

Si el agente IA tiene dudas:

1. **Revisar módulo correspondiente** completo
2. **Verificar módulos previos** completados
3. **Consultar 00-GUIA-PARA-AGENTE-IA.md**
4. **Revisar backend** (Doc/migrations/)
5. **Verificar variables** de entorno configuradas

---

**Última actualización:** 21 Enero 2026  
**Versión:** 2.0  
**Estado:** 12/14 módulos completados
