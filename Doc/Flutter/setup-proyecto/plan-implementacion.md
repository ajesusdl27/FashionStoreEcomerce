# Plan de Implementación por Fases - FashionStore Flutter

## 📋 Resumen del Plan

Este documento establece el orden correcto de implementación del proyecto FashionStore, desde la inicialización hasta el despliegue. Cada fase referencia la documentación específica que debes seguir.

**Duración Estimada Total**: 25-30 días (1 desarrollador)

---

## 🎯 Fase 0: Inicialización del Proyecto (Día 1)

### Objetivo
Crear la estructura base del proyecto Flutter con todas las dependencias configuradas.

### Tareas

#### 0.1 Crear Proyecto Flutter
```bash
flutter create fashionstore
cd fashionstore
```

#### 0.2 Configurar pubspec.yaml
- **Referencia**: [setup-completo.md - Sección 1](./setup-completo.md#1-pubspecyaml-completo)
- Copiar todas las dependencias
- Ejecutar `flutter pub get`

#### 0.3 Descargar Fuentes
- Descargar Bebas Neue: https://fonts.google.com/specimen/Bebas+Neue
- Descargar Oswald: https://fonts.google.com/specimen/Oswald
- Descargar Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk
- Colocar en `assets/fonts/`

#### 0.4 Crear Estructura de Carpetas
- **Referencia**: [setup-completo.md - Sección 2](./setup-completo.md#2-estructura-de-carpetas)
- Crear todos los directorios listados
- Crear archivos `.gitkeep` para mantener carpetas vacías

#### 0.5 Configurar Variables de Entorno
- Obtener credenciales de Supabase (URL + anon key)
- Obtener clave de Stripe (pk_test_...)
- Obtener cloud name de Cloudinary
- Guardar en archivo `.env.local` (no commitear)

#### 0.6 Configurar Archivos Base
- **Referencia**: [setup-completo.md - Secciones 3-7](./setup-completo.md)
- Crear `lib/main.dart`
- Crear `lib/app.dart`
- Crear `lib/core/config/env_config.dart`
- Crear `lib/core/config/supabase_config.dart`
- Crear `lib/core/config/stripe_config.dart`
- Crear `lib/core/constants/*.dart`

### ✅ Verificación Fase 0
```bash
# Debe compilar sin errores
flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=xxx \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**Resultado Esperado**: App muestra pantalla en blanco pero sin errores.

---

## 🎨 Fase 1: Sistema de Diseño (Días 2-3)

### Objetivo
Implementar el sistema de diseño completo (colores, tipografía, espaciado, widgets base).

### Tareas

#### 1.1 Implementar Theme System
- **Referencia**: [../sistema-diseno/theme-completo.md](../sistema-diseno/theme-completo.md)
- Crear `lib/core/theme/app_colors.dart` (Sección 1)
- Crear `lib/core/theme/app_typography.dart` (Sección 2)
- Crear `lib/core/theme/app_spacing.dart` (Sección 3)
- Crear `lib/core/theme/app_theme.dart` (Sección 4)

#### 1.2 Implementar Widgets Base
- **Referencia**: [../sistema-diseno/widgets-base.md](../sistema-diseno/widgets-base.md)
- Crear `lib/core/widgets/app_button.dart` (Sección 1)
- Crear `lib/core/widgets/app_text_field.dart` (Sección 2)
- Crear `lib/core/widgets/app_card.dart` (Sección 3)
- Crear `lib/core/widgets/glass_card.dart` (Sección 4)
- Crear `lib/core/widgets/app_badge.dart` (Sección 5)
- Crear `lib/core/widgets/shimmer_loading.dart` (Sección 6)
- Crear `lib/core/widgets/loading_overlay.dart` (Sección 7)
- Crear `lib/core/widgets/error_view.dart` (Sección 8)
- Crear `lib/core/widgets/empty_state.dart` (Sección 9)

#### 1.3 Implementar Utilidades
- Crear `lib/core/utils/formatters.dart` (formatear precios, fechas)
- Crear `lib/core/utils/validators.dart` (validar email, contraseña, NIF)
- Crear `lib/core/utils/extensions.dart` (extensiones de String, DateTime)

### ✅ Verificación Fase 1
```dart
// Crear screen de prueba con todos los widgets
class DesignSystemDemo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            AppButton.primary(onPressed: () {}, child: Text('Primary')),
            AppButton.secondary(onPressed: () {}, child: Text('Secondary')),
            AppTextField(label: 'Email'),
            AppCard(child: Text('Card Test')),
            GlassCard(child: Text('Glass Test')),
            AppBadge(text: 'NEW'),
            ErrorView(message: 'Test error'),
            EmptyState(message: 'No items'),
          ],
        ),
      ),
    );
  }
}
```

**Resultado Esperado**: Todos los widgets se renderizan correctamente en ambos temas.

---

## 🔐 Fase 2: Autenticación (Días 4-6)

### Objetivo
Implementar login, registro, recuperación de contraseña y gestión de sesión.

### Tareas

#### 2.1 Implementar Modelos
- **Referencia**: `Doc/Flutter/auth/` (Módulo Auth completo)
- Crear `lib/features/auth/domain/models/auth_user.dart`
- Crear `lib/features/auth/domain/models/auth_state.dart`
- Ejecutar `flutter pub run build_runner build`

#### 2.2 Implementar Repository
- **Referencia**: `Doc/Flutter/auth/`
- Crear `lib/features/auth/data/auth_repository.dart`
- Implementar métodos: signUp, signIn, signOut, resetPassword
- Manejar errores con `SupabaseErrorHandler`

#### 2.3 Implementar Providers
- **Referencia**: `Doc/Flutter/auth/`
- Crear `lib/features/auth/providers/auth_provider.dart`
- Usar Riverpod + Freezed para estado reactivo

#### 2.4 Implementar Screens
- **Referencia**: `Doc/Flutter/auth/`
- Crear `lib/features/auth/presentation/screens/login_screen.dart`
- Crear `lib/features/auth/presentation/screens/register_screen.dart`
- Crear `lib/features/auth/presentation/screens/forgot_password_screen.dart`
- Usar `AppButton` y `AppTextField` del sistema de diseño

### ✅ Verificación Fase 2
- ✅ Usuario puede registrarse
- ✅ Usuario puede iniciar sesión
- ✅ Usuario puede cerrar sesión
- ✅ Errores se muestran correctamente
- ✅ Estado de autenticación es reactivo

---

## 🧭 Fase 3: Navegación y Rutas (Día 7)

### Objetivo
Configurar GoRouter con guards de autenticación y estructura de navegación.

### Tareas

#### 3.1 Configurar Router
- Crear `lib/core/router/app_router.dart`
- Configurar rutas para todas las screens
- Implementar `AuthGuard` para rutas protegidas

#### 3.2 Definir Rutas
- Crear `lib/core/router/routes.dart`
```dart
abstract class AppRoutes {
  // Public
  static const home = '/';
  static const catalog = '/catalog';
  static const productDetail = '/product/:id';
  static const login = '/login';
  static const register = '/register';
  
  // Protected
  static const cart = '/cart';
  static const checkout = '/checkout';
  static const orders = '/orders';
  static const orderDetail = '/orders/:id';
  static const profile = '/profile';
  
  // Admin
  static const admin = '/admin';
}
```

#### 3.3 Implementar Bottom Navigation
- Crear `lib/core/presentation/main_navigation.dart`
- Tabs: Home, Catálogo, Carrito, Perfil

### ✅ Verificación Fase 3
- ✅ Navegación funciona entre todas las screens
- ✅ Deep links funcionan
- ✅ Rutas protegidas redirigen a login si no autenticado
- ✅ Bottom navigation mantiene estado

---

## 🛍️ Fase 4: Catálogo de Productos (Días 8-10)

### Objetivo
Implementar listado de productos, filtros, búsqueda y detalle de producto.

### Tareas

#### 4.1 Implementar Feature Completo
- **Referencia**: `Doc/Flutter/catalog/` (Módulo Catalog completo)
- Seguir estructura de 4 fases del módulo:
  1. Modelos (`Product`, `Category`, `ProductVariant`)
  2. Repository (`ProductsRepository`)
  3. Providers (`productsProvider`, `categoriesProvider`)
  4. Screens (`CatalogScreen`, `ProductDetailScreen`)

#### 4.2 Implementar Filtros
- Filtro por categoría
- Filtro por género
- Filtro por rango de precio
- Ordenamiento (precio, nombre, fecha)

#### 4.3 Implementar Búsqueda
- Búsqueda por texto
- Búsquedas recientes (almacenar en SharedPreferences)

#### 4.4 Integrar Cloudinary
- Usar `cloudinary_flutter` para optimizar imágenes
- Implementar transformaciones (resize, quality)

### ✅ Verificación Fase 4
- ✅ Productos se cargan desde Supabase
- ✅ Filtros funcionan correctamente
- ✅ Búsqueda retorna resultados relevantes
- ✅ Imágenes cargan con lazy loading
- ✅ Detalle de producto muestra variantes y tallas

---

## 🛒 Fase 5: Carrito de Compra (Días 11-12)

### Objetivo
Implementar carrito con persistencia local, cálculo de subtotales y envío.

### Tareas

#### 5.1 Implementar Feature Completo
- **Referencia**: `Doc/Flutter/cart/` (Módulo Cart completo)
- Modelos: `CartItem`, `Cart`
- Repository: almacenamiento en SharedPreferences
- Provider: estado reactivo con Riverpod
- Screen: `CartScreen`

#### 5.2 Implementar Lógica de Negocio
- Cálculo de subtotal
- Cálculo de envío (gratis si > 50€)
- Validación de stock disponible

#### 5.3 Implementar UI
- Lista de items con cantidades
- Botones +/- para ajustar cantidad
- Botón eliminar item
- Resumen de totales
- Botón "Proceder al Checkout"

### ✅ Verificación Fase 5
- ✅ Items se agregan al carrito
- ✅ Carrito persiste al cerrar app
- ✅ Cálculos son correctos
- ✅ Stock se valida antes de checkout
- ✅ UI es responsive

---

## 💳 Fase 6: Checkout y Pagos (Días 13-15)

### Objetivo
Implementar proceso de checkout con Stripe, cupones y creación de pedidos.

### Tareas

#### 6.1 Implementar Cupones
- **Referencia**: `Doc/Flutter/cupones/` (Módulo Cupones completo)
- Modelos: `Coupon`, `CouponValidationResult`
- Repository: llamadas RPC a `validate_coupon`
- Widget: `CouponInput`

#### 6.2 Implementar Checkout Screen
- Formulario de dirección de envío
- Selección de método de envío
- Aplicar cupón de descuento
- Resumen de pedido
- Botón "Pagar con Stripe"

#### 6.3 Integrar Stripe Checkout
- **Referencia**: [setup-completo.md - Sección 6](./setup-completo.md#6-configuración-de-stripe)
- Crear sesión de Stripe vía API
- Abrir WebView con Stripe Checkout
- Detectar resultado (success/cancel)

#### 6.4 Crear Pedido en Supabase
- Crear registro en tabla `orders`
- Crear registros en `order_items`
- Actualizar stock (restar cantidades)
- Vaciar carrito

### ✅ Verificación Fase 6
- ✅ Cupones se validan correctamente
- ✅ Stripe Checkout abre en WebView
- ✅ Pago test con tarjeta 4242... funciona
- ✅ Pedido se crea en base de datos
- ✅ Stock se actualiza
- ✅ Usuario es redirigido a pantalla de confirmación

---

## 📦 Fase 7: Pedidos y Devoluciones (Días 16-18)

### Objetivo
Implementar gestión de pedidos, seguimiento y sistema de devoluciones.

### Tareas

#### 7.1 Implementar Feature Orders
- **Referencia**: `Doc/Flutter/orders/` (Módulo Orders completo)
- Seguir las 4 fases del módulo completo
- Modelos: `Order`, `OrderItem`, `OrderStatus`
- Repository: `OrdersRepository`
- Providers: `ordersProvider`, `orderDetailProvider`
- Screens: `OrdersListScreen`, `OrderDetailScreen`

#### 7.2 Implementar Sistema de Devoluciones
- **Referencia**: `Doc/Flutter/orders/` (incluye Returns)
- Modelos: `ReturnRequest`, `ReturnStatus`
- Screen: `ReturnRequestScreen`
- Validar ventana de 30 días

#### 7.3 Implementar Facturas
- **Referencia**: `Doc/Flutter/facturas/` (Módulo Facturas completo)
- Widget: `InvoiceCard`
- Dialog: `RequestInvoiceDialog`
- Integración con API para generar PDF

### ✅ Verificación Fase 7
- ✅ Usuario ve lista de pedidos
- ✅ Usuario ve detalle de pedido con tracking
- ✅ Usuario puede solicitar devolución
- ✅ Usuario puede solicitar factura
- ✅ PDF de factura se genera correctamente

---

## 👤 Fase 8: Perfil de Usuario (Días 19-20)

### Objetivo
Implementar perfil, direcciones guardadas, historial y configuración.

### Tareas

#### 8.1 Implementar Profile Screen
- Datos del usuario
- Direcciones guardadas
- Preferencias (notificaciones, idioma)
- Botón cerrar sesión

#### 8.2 Implementar Edición de Perfil
- Editar nombre
- Editar email
- Cambiar contraseña

#### 8.3 Implementar Gestión de Direcciones
- Lista de direcciones guardadas
- Agregar nueva dirección
- Editar dirección
- Eliminar dirección
- Marcar como predeterminada

### ✅ Verificación Fase 8
- ✅ Usuario puede ver/editar perfil
- ✅ Direcciones se guardan correctamente
- ✅ Cambios persisten en Supabase

---

## 📰 Fase 9: Newsletter (Día 21)

### Objetivo
Implementar suscripción a newsletter con validación GDPR.

### Tareas

#### 9.1 Implementar Feature Newsletter
- **Referencia**: `Doc/Flutter/newsletter/` (Módulo Newsletter completo)
- Widget: `NewsletterSubscriptionForm`
- Checkbox de consentimiento GDPR
- Integración con tabla `newsletter_subscribers`

#### 9.2 Implementar en Screens
- Footer de home
- Modal en checkout
- Sección en perfil

### ✅ Verificación Fase 9
- ✅ Usuario puede suscribirse
- ✅ Consentimiento GDPR es obligatorio
- ✅ Email no se duplica en base de datos

---

## 🎯 Fase 10: Promociones (Día 22)

### Objetivo
Implementar sistema de promociones (banners, descuentos automáticos).

### Tareas

#### 10.1 Implementar Modelos
- `Promotion`, `PromotionType`
- Integración con tabla `promotions`

#### 10.2 Implementar Banner Carousel
- Widget: `PromotionBanner`
- Autoplay cada 5 segundos
- Navegar al hacer tap

#### 10.3 Aplicar Descuentos Automáticos
- Detectar promociones activas
- Aplicar descuento en checkout

### ✅ Verificación Fase 10
- ✅ Banners se muestran en home
- ✅ Promociones activas aplican descuento
- ✅ Promociones expiradas no aplican

---

## 🛠️ Fase 11: Admin Panel (Días 23-25)

### Objetivo
Implementar panel de administración para gestionar productos, pedidos y contenido.

### Tareas

#### 11.1 Implementar Feature Admin
- **Referencia**: `Doc/Flutter/admin/` (Módulo Admin completo)
- Guard: verificar `is_admin` en metadata
- Layout: `AdminLayout` con drawer navigation

#### 11.2 Implementar Secciones
1. **Dashboard**: Estadísticas, ventas recientes
2. **Productos**: CRUD completo
3. **Pedidos**: Lista, cambiar estado, ver detalles
4. **Categorías**: CRUD completo
5. **Cupones**: CRUD completo
6. **Promociones**: CRUD completo
7. **Newsletter**: Ver suscriptores, exportar CSV

### ✅ Verificación Fase 11
- ✅ Solo admins pueden acceder
- ✅ CRUD de productos funciona
- ✅ CRUD de categorías funciona
- ✅ Admins pueden cambiar estado de pedidos

---

## ✨ Fase 12: Optimización y Testing (Días 26-28)

### Objetivo
Optimizar rendimiento, agregar analytics y testing.

### Tareas

#### 12.1 Optimización de Rendimiento
- Implementar lazy loading en listas
- Optimizar imágenes (usar Cloudinary transformations)
- Implementar caché de datos (Riverpod keepAlive)
- Analizar bundle size

#### 12.2 Testing
- Unit tests para repositories
- Unit tests para providers
- Widget tests para widgets base
- Integration tests para flujos críticos (auth, checkout)

#### 12.3 Analytics
- Implementar Google Analytics o Mixpanel
- Trackear eventos clave:
  - `page_view`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`
  - `view_item`

#### 12.4 Error Handling
- Implementar Sentry para crash reporting
- Mejorar mensajes de error
- Agregar retry logic en llamadas de red

### ✅ Verificación Fase 12
- ✅ Test coverage > 70%
- ✅ App carga en < 3 segundos
- ✅ Analytics trackea eventos
- ✅ Crashes se reportan a Sentry

---

## 🚀 Fase 13: Despliegue (Días 29-30)

### Objetivo
Preparar app para producción y publicar en stores.

### Tareas

#### 13.1 Configuración de Producción
- Cambiar a claves de producción (Supabase, Stripe)
- Configurar variables de entorno para release
- Actualizar `AndroidManifest.xml` y `Info.plist`
- Configurar permisos correctos

#### 13.2 Build de Release
```bash
# Android
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://prod.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...

# iOS (requiere Mac)
flutter build ios --release \
  --dart-define=SUPABASE_URL=https://prod.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### 13.3 Testing en Dispositivos Reales
- Probar en Android físico
- Probar en iPhone físico
- Probar en diferentes versiones de OS

#### 13.4 Publicación
- **Google Play Store**:
  - Crear cuenta de desarrollador
  - Completar ficha de la app
  - Subir APK/AAB
  - Configurar precios y distribución
  
- **Apple App Store**:
  - Crear cuenta de Apple Developer
  - Configurar App Store Connect
  - Subir IPA
  - Completar metadata

### ✅ Verificación Fase 13
- ✅ Build de release funciona sin errores
- ✅ App funciona en dispositivos reales
- ✅ Variables de producción configuradas
- ✅ App publicada en stores

---

## 📊 Diagrama de Dependencias entre Fases

```
Fase 0 (Setup)
    ↓
Fase 1 (Design System)
    ↓
Fase 2 (Auth)
    ↓
Fase 3 (Navigation)
    ↓
    ├─→ Fase 4 (Catalog) ──→ Fase 5 (Cart) ──→ Fase 6 (Checkout)
    │                                              ↓
    ├─→ Fase 7 (Orders) ←──────────────────────────┘
    │
    ├─→ Fase 8 (Profile)
    │
    ├─→ Fase 9 (Newsletter)
    │
    ├─→ Fase 10 (Promotions)
    │
    └─→ Fase 11 (Admin)
           ↓
       Fase 12 (Testing & Optimization)
           ↓
       Fase 13 (Deploy)
```

---

## 🎓 Consejos para Seguir el Plan

### 1. **No Saltarse Fases**
Las fases están ordenadas por dependencias. No puedes hacer Checkout sin tener Cart. No puedes hacer Cart sin tener Catalog.

### 2. **Verificar Cada Fase**
Usa los checkpoints ✅ para validar que cada fase funciona antes de continuar.

### 3. **Usar Documentación de Referencia**
Cada fase referencia documentación específica. Léela completamente antes de codear.

### 4. **Commits Frecuentes**
Haz commits al finalizar cada sub-tarea. Usa mensajes descriptivos:
```bash
git commit -m "feat(auth): implementar login screen"
git commit -m "feat(catalog): agregar filtros por categoría"
```

### 5. **Testing Continuo**
No esperes a Fase 12 para hacer testing. Escribe tests mientras desarrollas.

### 6. **Usar Delegación con IA**
Si usas un agente IA para delegar código:
- Usa `PROMPT_IA_AGENTE.md` como base
- Proporciona contexto de la fase actual
- Referencia la documentación específica
- Revisa el código generado antes de commitear

### 7. **Daily Workflow Recomendado**
```
09:00 - 09:15 → Review de ayer, planificar hoy
09:15 - 11:00 → Desarrollo (implementación)
11:00 - 11:15 → Break
11:15 - 13:00 → Desarrollo (implementación)
13:00 - 14:00 → Almuerzo
14:00 - 16:00 → Desarrollo (testing + fixes)
16:00 - 16:15 → Break
16:15 - 18:00 → Desarrollo (documentación + commit)
18:00 - 18:15 → Review del día, actualizar progreso
```

---

## 📁 Documentación de Referencia Completa

### Core
- `setup-proyecto/setup-completo.md` - Configuración base
- `sistema-diseno/analisis.md` - Análisis del diseño
- `sistema-diseno/theme-completo.md` - Theme y colores
- `sistema-diseno/widgets-base.md` - Widgets reutilizables

### Features
- `auth/` - 6 documentos sobre autenticación
- `catalog/` - 6 documentos sobre catálogo
- `cart/` - 6 documentos sobre carrito
- `orders/` - 6 documentos sobre pedidos y devoluciones
- `admin/` - 6 documentos sobre panel de administración
- `newsletter/` - 6 documentos sobre newsletter

### Extras
- `cupones/` - 2 documentos sobre sistema de cupones
- `facturas/` - 2 documentos sobre facturas

### Guías
- `GUIA_DESARROLLO.md` - Workflow diario
- `PROMPT_IA_AGENTE.md` - Instrucciones para delegación con IA

---

## 🏁 Estado Actual

**Fase Actual**: Fase 0 - Inicialización del Proyecto  
**Progreso Global**: 0/13 fases completadas (0%)  
**Siguiente Paso**: Crear proyecto Flutter y configurar dependencias

---

## 📞 Soporte

Si tienes dudas durante la implementación:
1. Revisa la documentación de la fase actual
2. Verifica que completaste la fase anterior
3. Consulta los checkpoints ✅ de verificación
4. Usa el `PROMPT_IA_AGENTE.md` para delegar con IA

¡Éxito con el desarrollo! 🚀
