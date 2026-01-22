# Guía para Agente IA - Desarrollo Flutter FashionStore

## 🎯 Objetivo del Proyecto

Migrar la aplicación web FashionStore (Astro + React + Supabase) a una aplicación móvil Flutter nativa, manteniendo:
- **Backend compartido**: Mismo Supabase (PostgreSQL + Auth + Storage + RPC)
- **Diseño visual idéntico**: Colores, tipografías, spacing, componentes
- **Funcionalidad completa**: Cliente + Admin
- **Arquitectura de producción**: Escalable, mantenible, testeada

## 📋 Estructura de esta Documentación

Esta carpeta contiene módulos independientes que puedes implementar secuencialmente:

```
Doc/Flutter/
├── 00-GUIA-PARA-AGENTE-IA.md          (este archivo)
├── 01-SETUP-INICIAL.md                 (Proyecto base + dependencias)
├── 02-SISTEMA-DISENO.md                (Theme, colores, tipografía)
├── 03-WIDGETS-BASE.md                  (Componentes reutilizables)
├── 04-AUTENTICACION.md                 (Auth con Supabase)
├── 05-NAVEGACION.md                    (Router + guards)
├── 06-CATALOGO-PRODUCTOS.md            (Products, categories, filtros)
├── 07-CARRITO.md                       (Cart local con persistencia)
├── 08-CHECKOUT-PAGOS.md                (Stripe + cupones)
├── 09-PEDIDOS-DEVOLUCIONES.md          (Orders + returns)
├── 10-PERFIL-USUARIO.md                (Profile + addresses)
├── 11-NEWSLETTER-PROMOCIONES.md        (Newsletter + banners)
├── 12-PANEL-ADMIN.md                   (Admin completo)
├── 13-TESTING-OPTIMIZACION.md          (Tests + performance)
└── 14-DESPLIEGUE.md                    (Build + stores)
```

## 🚀 Flujo de Trabajo Recomendado

### Para el Agente IA

1. **Leer un módulo completo** antes de empezar a codear
2. **Implementar secuencialmente** (no saltar módulos)
3. **Ejecutar build_runner** después de crear modelos Freezed
4. **Validar funcionamiento** antes de pasar al siguiente módulo
5. **No inventar**: Seguir exactamente las especificaciones de diseño

### Para el Desarrollador (tú)

Al solicitar implementación al agente, usa este formato:

```
Estoy en el Módulo [número]: [nombre]

Lee primero:
- Doc/Flutter/[número]-[nombre].md

Necesito implementar:
[descripción específica de la tarea]

Contexto adicional:
[cualquier información relevante]
```

**Ejemplo:**
```
Estoy en el Módulo 04: Autenticación

Lee primero:
- Doc/Flutter/04-AUTENTICACION.md

Necesito implementar:
- Modelos Freezed para AuthUser y AuthState
- AuthRepository con Supabase
- AuthProvider con Riverpod

Ya tengo completados los módulos 01, 02 y 03.
```

## 📊 Información del Backend (Compartido con Web)

### Supabase Configuration

```dart
// Variables de entorno (usar --dart-define)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CLOUDINARY_CLOUD_NAME=fashionstore
```

### Tablas Principales

| Tabla | Descripción | Acceso |
|-------|-------------|--------|
| `categories` | Categorías con size_type | Pública (lectura) |
| `products` | Productos con soft delete | Pública (lectura) |
| `product_variants` | Tallas y stock | Pública (lectura) |
| `product_images` | Imágenes ordenadas | Pública (lectura) |
| `orders` | Pedidos con order_number | RLS por customer_id |
| `order_items` | Items del pedido | RLS por order_id |
| `coupons` | Cupones de descuento | Admin only |
| `promotions` | Promociones activas | Pública (lectura) |
| `returns` | Devoluciones | RLS por customer_id |
| `customer_profiles` | Perfiles extendidos | RLS own profile |
| `newsletter_subscribers` | Suscriptores | Insert público |
| `settings` | Config key-value | Admin only |

### Funciones RPC Críticas

```sql
-- Auth & Profiles
get_customer_profile() → customer_profile
upsert_customer_profile(...) → void

-- Products
validate_coupon(p_coupon_code TEXT) → {valid, message, discount_type, discount_value}
reserve_stock_atomic(p_items JSONB) → void
release_stock_atomic(p_items JSONB) → void

-- Orders
create_order_with_items(...) → order_id
get_customer_orders(p_customer_id UUID) → orders[]
cancel_order(p_order_id UUID) → void

-- Returns
create_return_request(...) → return_id
calculate_return_refund(...) → refund_amount

-- Admin
get_dashboard_stats() → {orders_today, sales_month, pending_orders, ...}
update_order_status(...) → void
```

## 🎨 Diseño Visual (Identidad de Marca)

### Colores Base

**Light Mode:**
- Background: `#FFFFFF` (blanco puro)
- Foreground: `#0A0A0A` (negro profundo)
- Primary: `#4F7A1F` (verde oscuro)
- Accent: `#FF4757` (rojo coral)

**Dark Mode (principal):**
- Background: `#0A0A0A` (negro profundo)
- Foreground: `#FAFAFA` (blanco casi puro)
- Primary: `#CCFF00` (verde neón - color firma)
- Accent: `#FF4757` (rojo coral)

**Otros:**
- Card: `#141414`
- Muted: `#1F1F1F`
- Border: `#262626`
- Success: `#10B981`
- Error: `#FF4757`
- Warning: `#FBBF24`

### Tipografías

1. **Bebas Neue** (Display): Títulos hero, números grandes
2. **Oswald** (Heading): H1-H6, botones, labels
3. **Space Grotesk** (Body): Texto general, párrafos, UI

### Spacing System

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
xxxl: 64px
```

### Border Radius

```
sm: 4px
md: 8px
lg: 12px
xl: 16px
full: 9999px (circular)
```

## 🏗️ Arquitectura Flutter

### Stack Tecnológico Obligatorio

- **State Management**: Riverpod 2.x (con code generation)
- **Models**: Freezed + json_serializable
- **Navigation**: GoRouter
- **Backend**: supabase_flutter
- **Payments**: flutter_stripe + webview_flutter
- **Storage**: flutter_secure_storage (tokens) + shared_preferences (cart)
- **Images**: cached_network_image

### Estructura de Carpetas

```
lib/
├── core/
│   ├── config/          # EnvConfig, constants
│   ├── router/          # GoRouter setup
│   ├── theme/           # AppTheme, colors, typography
│   ├── utils/           # Formatters, validators, extensions
│   ├── widgets/         # Widgets base (buttons, inputs, cards)
│   └── services/        # SupabaseService, StorageService
│
├── features/            # Arquitectura por features
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
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── profile/
│   ├── returns/
│   ├── newsletter/
│   └── admin/
│
└── main.dart
```

### Convenciones de Código

1. **Modelos**: Siempre usar `@freezed` con `fromJson/toJson`
2. **Providers**: Usar `@riverpod` annotation (code generation)
3. **Repositories**: Interfaces en domain, implementaciones en data
4. **Widgets**: Nombrar con sufijo descriptivo (Screen, Widget, Button, etc.)
5. **Archivos**: snake_case.dart
6. **Clases**: PascalCase

## ⚙️ Comandos Esenciales

```bash
# Crear proyecto
flutter create fashionstore --org com.fashionstore

# Instalar dependencias
flutter pub get

# Generar código (Freezed, Riverpod, json_serializable)
flutter pub run build_runner build --delete-conflicting-outputs

# Watch mode (desarrollo)
flutter pub run build_runner watch --delete-conflicting-outputs

# Ejecutar con variables de entorno
flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx

# Tests
flutter test

# Análisis de código
flutter analyze

# Build release
flutter build apk --release
flutter build appbundle --release  # Para Play Store
flutter build ipa --release         # Para App Store
```

## 🔧 Manejo de Errores

### Estructura Estándar

```dart
// En repositorios
try {
  final result = await _supabase.from('table').select();
  return result.map((e) => Model.fromJson(e)).toList();
} on PostgrestException catch (e) {
  throw Exception('Error de base de datos: ${e.message}');
} on AuthException catch (e) {
  throw Exception('Error de autenticación: ${e.message}');
} catch (e) {
  throw Exception('Error inesperado: $e');
}

// En providers (Riverpod)
@riverpod
Future<List<Product>> products(ProductsRef ref) async {
  final repository = ref.watch(productsRepositoryProvider);
  return repository.getProducts();
}

// En UI
ref.watch(productsProvider).when(
  data: (products) => ProductsList(products: products),
  loading: () => ShimmerLoading(),
  error: (error, stack) => ErrorView(message: error.toString()),
);
```

## 📝 Validaciones Comunes

### Email
```dart
bool isValidEmail(String email) {
  return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
}
```

### Password
- Mínimo 6 caracteres (requisito de Supabase)
- Recomendado: 8+ caracteres con mayúsculas, números

### Teléfono (España)
- Formato: +34 XXX XXX XXX
- Opcional en la mayoría de formularios

### Código Postal (España)
- 5 dígitos
- Rango: 01000 - 52999

## 🎯 Prioridades de Implementación

### Crítico (Fase 1-6)
- Setup, Theme, Auth, Navigation, Catalog, Cart, Checkout

### Importante (Fase 7-10)
- Orders, Profile, Newsletter, Admin

### Mejoras (Fase 11-12)
- Testing, Optimización, Despliegue

## 🚨 Errores Comunes a Evitar

1. **No ejecutar build_runner** después de cambios en Freezed
2. **Olvidar RLS policies** al hacer queries
3. **No manejar estados de loading/error**
4. **Hardcodear strings** (usar constantes)
5. **No usar const constructors** (performance)
6. **Exponer secrets** en el código
7. **No validar stock** antes de checkout
8. **Olvidar limpiar carrito** después de compra exitosa

## 📚 Recursos de Referencia

### Documentación Oficial
- [Flutter Docs](https://docs.flutter.dev/)
- [Riverpod Docs](https://riverpod.dev/)
- [Supabase Flutter](https://supabase.com/docs/guides/getting-started/quickstarts/flutter)
- [Freezed](https://pub.dev/packages/freezed)
- [GoRouter](https://pub.dev/packages/go_router)

### Migración Web → Flutter

| Web | Flutter Equivalente |
|-----|---------------------|
| httpOnly cookies | flutter_secure_storage |
| LocalStorage | SharedPreferences |
| Nanostores | Riverpod StateNotifier |
| React Islands | StatefulWidget con providers |
| Astro routing | GoRouter |
| Tailwind classes | ThemeData + TextStyle |

## ✅ Checklist por Módulo

Antes de pasar al siguiente módulo, verificar:

- [ ] Código compila sin errores
- [ ] No hay warnings del linter
- [ ] Build_runner ejecutado si hay Freezed
- [ ] Estados de loading/error manejados
- [ ] Navegación funciona correctamente
- [ ] UI sigue el diseño visual especificado
- [ ] Datos persisten correctamente (si aplica)
- [ ] Probado en emulador/dispositivo

## 🎓 Tips para Desarrollo Eficiente

1. **Implementa por capas**: Modelos → Repository → Providers → UI
2. **Prueba cada capa** antes de avanzar
3. **Usa hot reload** (no hot restart innecesarios)
4. **Comenta decisiones complejas**, no código obvio
5. **Commits frecuentes** con mensajes descriptivos
6. **DRY**: Si copias código 3 veces, crea un helper/widget
7. **Performance**: Usa const, evita rebuilds, lazy loading

## 📞 Soporte

Si encuentras errores o dudas:

1. Verifica que completaste todos los módulos previos
2. Revisa los checklist de verificación
3. Consulta la documentación del módulo específico
4. Verifica que build_runner se ejecutó correctamente
5. Revisa los logs de Supabase (Dashboard → Logs)

---

**¡Éxito con el desarrollo!** 🚀

Recuerda: Implementa secuencialmente, valida cada módulo, y sigue exactamente el diseño visual especificado.
