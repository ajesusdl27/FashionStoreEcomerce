# Prompt para Fase 05: Navegación y Router

## 📋 Contexto

Continuando con FashionStore Flutter. Fases 01-04 completadas. Ahora implementaré el sistema de navegación con GoRouter, guards de autenticación y bottom navigation bar.

## 🎯 Objetivo de esta Fase

Configurar GoRouter con protección de rutas, deep linking y navegación principal con 4 tabs.

## 📚 Documentación a Leer

**IMPORTANTE:** Lee:
- `Doc/Flutter/05-NAVEGACION-ROUTER.md`

## ✅ Tareas a Completar

### Tarea 5.1: Crear Constantes de Rutas

**Archivo:** `lib/core/router/routes.dart`

```dart
class AppRoutes {
  // Auth
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const resetPassword = '/reset-password';
  
  // Public
  static const home = '/home';
  static const catalog = '/productos';
  static String productDetail(String slug) => '/productos/$slug';
  static String category(String slug) => '/categoria/$slug';
  
  // Authenticated
  static const cart = '/carrito';
  static const checkout = '/checkout';
  static const checkoutSuccess = '/checkout/success';
  static const checkoutCancelled = '/checkout/cancelled';
  
  static const account = '/cuenta';
  static const profile = '/cuenta/perfil';
  static const orders = '/cuenta/pedidos';
  static String orderDetail(String id) => '/cuenta/pedidos/$id';
  
  // Admin
  static const adminDashboard = '/admin/dashboard';
  static const adminProducts = '/admin/productos';
  // ... más rutas admin
}
```

**Checklist:**
- [ ] Todas las rutas definidas
- [ ] Rutas dinámicas con parámetros

---

### Tarea 5.2: Crear GoRouter con Guards

**Archivo:** `lib/core/router/app_router.dart`

**Acción:** Configurar GoRouter completo.

**IMPORTANTE:** Usar `@riverpod` para crear el router provider.

```dart
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@riverpod
GoRouter goRouter(GoRouterRef ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/home',
    debugLogDiagnostics: true,
    
    refreshListenable: GoRouterRefreshStream(authState),
    
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isAdmin = authState.value?.isAdmin ?? false;
      
      // 1. Usuario autenticado → auth screens → redirect home
      if (isLoggedIn && (state.matchedLocation.startsWith('/login') || 
                        state.matchedLocation.startsWith('/register'))) {
        return '/home';
      }
      
      // 2. Usuario NO autenticado → rutas protegidas → redirect login
      if (!isLoggedIn) {
        if (state.matchedLocation.startsWith('/cuenta') ||
            state.matchedLocation.startsWith('/carrito') ||
            state.matchedLocation.startsWith('/checkout') ||
            state.matchedLocation.startsWith('/admin')) {
          return '/login?redirectTo=${Uri.encodeComponent(state.matchedLocation)}';
        }
      }
      
      // 3. Usuario NO admin → /admin → redirect home
      if (state.matchedLocation.startsWith('/admin') && !isAdmin) {
        return '/home';
      }
      
      return null;
    },
    
    routes: [
      // Rutas de auth (ver especificaciones)
      // Rutas con bottom nav (ShellRoute)
      // Rutas de detalle (sin bottom nav)
      // ... todas las rutas
    ],
    
    errorBuilder: (context, state) => ErrorScreen(
      error: state.error.toString(),
    ),
  );
}

// Helper para refresh cuando cambia auth
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<AsyncValue<AuthUser?>> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }
  
  late final StreamSubscription _subscription;
  
  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
```

**EJECUTAR:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Checklist:**
- [ ] goRouter provider creado
- [ ] Lógica de redirect implementada
- [ ] GoRouterRefreshStream helper
- [ ] build_runner ejecutado

---

### Tarea 5.3: Definir Rutas

**En el mismo archivo app_router.dart**

**Definir dentro de routes:**

```dart
routes: [
  // Auth routes
  GoRoute(
    path: '/login',
    builder: (context, state) {
      final redirectTo = state.uri.queryParameters['redirectTo'];
      return LoginScreen(redirectTo: redirectTo);
    },
  ),
  GoRoute(
    path: '/register',
    builder: (context, state) => const RegisterScreen(),
  ),
  GoRoute(
    path: '/forgot-password',
    builder: (context, state) => const ForgotPasswordScreen(),
  ),
  GoRoute(
    path: '/reset-password',
    builder: (context, state) => const ResetPasswordScreen(),
  ),
  
  // Main navigation (con bottom nav bar) - usar ShellRoute
  ShellRoute(
    builder: (context, state, child) {
      return MainNavigationScreen(child: child);
    },
    routes: [
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/productos',
        builder: (context, state) => const CatalogScreen(),
      ),
      GoRoute(
        path: '/carrito',
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: '/cuenta',
        builder: (context, state) => const AccountScreen(),
      ),
    ],
  ),
  
  // Product detail (sin bottom nav)
  GoRoute(
    path: '/productos/:slug',
    builder: (context, state) {
      final slug = state.pathParameters['slug']!;
      return ProductDetailScreen(slug: slug);
    },
  ),
  
  // Checkout
  GoRoute(
    path: '/checkout',
    builder: (context, state) => const CheckoutScreen(),
    routes: [
      GoRoute(
        path: 'success',
        builder: (context, state) => const CheckoutSuccessScreen(),
      ),
      GoRoute(
        path: 'cancelled',
        builder: (context, state) => const CheckoutCancelledScreen(),
      ),
    ],
  ),
  
  // Orders
  GoRoute(
    path: '/cuenta/pedidos',
    builder: (context, state) => const OrdersListScreen(),
    routes: [
      GoRoute(
        path: ':id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return OrderDetailScreen(orderId: id);
        },
      ),
    ],
  ),
  
  // Profile
  GoRoute(
    path: '/cuenta/perfil',
    builder: (context, state) => const EditProfileScreen(),
  ),
  
  // ... más rutas según necesidad
],
```

**Checklist:**
- [ ] Rutas auth definidas
- [ ] ShellRoute para bottom nav
- [ ] Rutas protegidas configuradas
- [ ] Rutas con parámetros
- [ ] ErrorBuilder configurado

---

### Tarea 5.4: MainNavigationScreen (Bottom Nav)

**Archivo:** `lib/core/presentation/main_navigation_screen.dart`

**Acción:** Crear screen con bottom navigation bar.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class MainNavigationScreen extends ConsumerWidget {
  final Widget child;
  
  const MainNavigationScreen({required this.child, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocation = GoRouterState.of(context).matchedLocation;
    final cartCount = ref.watch(cartCountProvider);
    
    // Determinar tab activo
    int selectedIndex = 0;
    if (currentLocation.startsWith('/productos')) selectedIndex = 1;
    if (currentLocation.startsWith('/carrito')) selectedIndex = 2;
    if (currentLocation.startsWith('/cuenta')) selectedIndex = 3;
    
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/home');
            case 1: context.go('/productos');
            case 2: context.go('/carrito');
            case 3: context.go('/cuenta');
          }
        },
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          const NavigationDestination(
            icon: Icon(Icons.shopping_bag_outlined),
            selectedIcon: Icon(Icons.shopping_bag),
            label: 'Catálogo',
          ),
          NavigationDestination(
            icon: Badge(
              label: Text('$cartCount'),
              isLabelVisible: cartCount > 0,
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: Badge(
              label: Text('$cartCount'),
              isLabelVisible: cartCount > 0,
              child: const Icon(Icons.shopping_cart),
            ),
            label: 'Carrito',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Cuenta',
          ),
        ],
      ),
    );
  }
}
```

**Checklist:**
- [ ] Bottom nav con 4 tabs
- [ ] Badge en carrito con count
- [ ] Navegación funciona
- [ ] Tab activo detectado correctamente
- [ ] Icons correctos

---

### Tarea 5.5: Crear Screens Placeholder

**Acción:** Crear screens placeholder temporales para las rutas.

**Crear estos archivos simples:**

**1. lib/features/home/presentation/screens/home_screen.dart**
```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inicio')),
      body: const Center(
        child: Text('Home Screen - Por implementar'),
      ),
    );
  }
}
```

**2. lib/features/catalog/presentation/screens/catalog_screen.dart**
```dart
class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Catálogo')),
      body: const Center(
        child: Text('Catalog Screen - Por implementar'),
      ),
    );
  }
}
```

**3. lib/features/cart/presentation/screens/cart_screen.dart**
```dart
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Carrito')),
      body: const Center(
        child: Text('Cart Screen - Por implementar'),
      ),
    );
  }
}
```

**4. lib/features/profile/presentation/screens/account_screen.dart**
```dart
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi Cuenta')),
      body: const Center(
        child: Text('Account Screen - Por implementar'),
      ),
    );
  }
}
```

**5. Más placeholders necesarios:**
- ProductDetailScreen
- CheckoutScreen
- CheckoutSuccessScreen
- CheckoutCancelledScreen
- OrdersListScreen
- OrderDetailScreen
- EditProfileScreen

**Checklist:**
- [ ] Todos los placeholders creados
- [ ] Imports correctos en app_router.dart

---

### Tarea 5.6: Actualizar main.dart

**Acción:** Cambiar a usar GoRouter.

```dart
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
      themeMode: ThemeMode.dark,
      routerConfig: router,
    );
  }
}
```

**Checklist:**
- [ ] MaterialApp.router usado
- [ ] routerConfig con goRouter provider
- [ ] Import de go_router

---

### Tarea 5.7: Configurar Deep Links (Android)

**Archivo:** `android/app/src/main/AndroidManifest.xml`

**Acción:** Agregar intent-filter para deep links.

**Agregar dentro de `<activity>`:**
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <!-- Deep links -->
    <data android:scheme="fashionstore" />
    
    <!-- Universal links (opcional) -->
    <data android:scheme="https"
          android:host="fashionstore.com" />
</intent-filter>
```

**Checklist:**
- [ ] Intent filter agregado
- [ ] Scheme "fashionstore" configurado

---

### Tarea 5.8: Configurar Deep Links (iOS)

**Archivo:** `ios/Runner/Info.plist`

**Acción:** Agregar URL schemes.

**Agregar:**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fashionstore</string>
    </array>
  </dict>
</array>
```

**Checklist:**
- [ ] URL scheme agregado

---

### Tarea 5.9: Crear cartCountProvider Temporal

**Archivo:** `lib/features/cart/providers/cart_providers.dart`

**Acción:** Crear provider temporal que retorna 0.

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'cart_providers.g.dart';

@riverpod
int cartCount(CartCountRef ref) {
  // Temporal: retornar 0
  // Se implementará correctamente en Fase 07
  return 0;
}
```

**EJECUTAR:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Checklist:**
- [ ] Provider temporal creado
- [ ] build_runner ejecutado

---

## 🧪 Verificación Final

### Tests de Navegación

```bash
flutter run
```

**1. Navegación pública:**
- [ ] App abre en /home
- [ ] Tap tab "Catálogo" → navega a /productos
- [ ] Tap tab "Carrito" → navega a /carrito (o redirect a /login)
- [ ] Tap tab "Cuenta" → navega a /cuenta (o redirect a /login)
- [ ] Bottom nav marca tab correctamente

**2. Guards de autenticación:**
- [ ] Sin login → intenta /carrito → redirect /login
- [ ] Sin login → intenta /cuenta → redirect /login
- [ ] Login exitoso → redirect a /home o redirectTo
- [ ] Con login → puede acceder a /carrito y /cuenta

**3. Deep links (test manual):**
```bash
# Android (adb)
adb shell am start -W -a android.intent.action.VIEW -d "fashionstore://productos/test-slug"

# iOS (Terminal)
xcrun simctl openurl booted "fashionstore://productos/test-slug"
```

- [ ] Deep link abre la app
- [ ] Navega a la ruta correcta

**4. Transiciones:**
- [ ] Navegación suave entre pantallas
- [ ] No hay parpadeos
- [ ] Estado de scroll se mantiene (en tabs)

---

## ✅ Checklist Final de Fase 05

- [ ] **5.1** AppRoutes con todas las rutas
- [ ] **5.2** GoRouter provider configurado
- [ ] **5.3** Todas las rutas definidas
- [ ] **5.4** MainNavigationScreen con bottom nav
- [ ] **5.5** Screens placeholder creados
- [ ] **5.6** main.dart usa router
- [ ] **5.7** Deep links Android configurados
- [ ] **5.8** Deep links iOS configurados
- [ ] **5.9** cartCountProvider temporal
- [ ] **Verificación** Navegación funciona
- [ ] **Verificación** Guards redirigen correctamente
- [ ] **Verificación** Badge carrito visible
- [ ] **Verificación** Deep links funcionan

## 📝 Reportar Completado

```
✅ FASE 05 COMPLETADA

Resumen:
- GoRouter configurado: ✅
- Guards de autenticación: ✅
- Bottom Navigation Bar: 4 tabs
- Rutas definidas: [número] rutas
- Deep links: Android ✅, iOS ✅

Archivos creados:
- lib/core/router/routes.dart
- lib/core/router/app_router.dart
- lib/core/presentation/main_navigation_screen.dart
- lib/features/cart/providers/cart_providers.dart (temporal)
- [Screens placeholder]

Archivos modificados:
- lib/main.dart
- android/app/src/main/AndroidManifest.xml
- ios/Runner/Info.plist

Tests realizados:
- Navegación entre tabs: ✅
- Redirect a login sin auth: ✅
- Login → redirect a home: ✅
- Deep link test: ✅

Estado: LISTO PARA FASE 06 (Catálogo de Productos)

Notas:
[Observaciones]
```

## 🎯 Próximo Paso

**FASE-06-CATALOGO.md** - Implementar catálogo completo con filtros
