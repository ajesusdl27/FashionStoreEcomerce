# Módulo 05: Navegación y Router

## 🎯 Objetivo

Configurar GoRouter con protección de rutas (auth guards), deep linking, y navegación principal con bottom navigation bar.

## 📱 Estructura de Navegación

### Navegación Principal (Bottom Navigation)

4 tabs principales para usuarios:
1. **Home** (icon: home) → HomeScreen
2. **Catálogo** (icon: shopping-bag) → CatalogScreen  
3. **Carrito** (icon: shopping-cart, badge con cantidad) → CartScreen
4. **Perfil** (icon: user) → ProfileScreen

Admin tiene navegación separada (drawer/sidebar).

### Jerarquía de Rutas

```
/ (root)
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /home (tab 1)
├── /productos (tab 2)
│   └── /productos/:slug (detalle)
├── /categoria/:slug
├── /carrito (tab 3, protegida)
├── /checkout (protegida)
│   ├── /checkout/success
│   └── /checkout/cancelled
├── /cuenta (tab 4, protegida)
│   ├── /cuenta/perfil
│   ├── /cuenta/pedidos
│   │   └── /cuenta/pedidos/:id
│   └── /cuenta/devoluciones
│       └── /cuenta/devoluciones/:id
├── /admin (protegida + admin only)
│   ├── /admin/dashboard
│   ├── /admin/productos
│   │   ├── /admin/productos/nuevo
│   │   └── /admin/productos/:id/editar
│   ├── /admin/pedidos
│   │   └── /admin/pedidos/:id
│   ├── /admin/categorias
│   ├── /admin/cupones
│   ├── /admin/promociones
│   ├── /admin/newsletter
│   ├── /admin/devoluciones
│   └── /admin/configuracion
└── /newsletter/unsubscribe
```

## 🔐 Guards de Autenticación

### Tipos de Guards

1. **Public**: Accesible sin login (home, catalog, product detail)
2. **Authenticated**: Requiere login (cart, checkout, orders, profile)
3. **Admin**: Requiere login + `isAdmin = true`

### Lógica de Redirección

```
Usuario NO autenticado intenta acceder a ruta protegida:
→ Redirigir a /login?redirectTo=/ruta-original

Usuario NO admin intenta acceder a /admin:
→ Redirigir a /home

Usuario autenticado intenta acceder a /login o /register:
→ Redirigir a /home (ya está logueado)
```

## 🏗️ Implementación de GoRouter

### lib/core/router/app_router.dart

**Configuración base:**

```dart
@riverpod
GoRouter goRouter(GoRouterRef ref) {
  // Watch auth state para redirecciones reactivas
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/home',
    debugLogDiagnostics: true,
    
    // Refresh cuando cambia el estado de auth
    refreshListenable: GoRouterRefreshStream(authState),
    
    // Lógica de redirección global
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isAdmin = authState.value?.isAdmin ?? false;
      final isGoingToLogin = state.matchedLocation.startsWith('/login') ||
                             state.matchedLocation.startsWith('/register');
      final isGoingToAuth = isGoingToLogin ||
                             state.matchedLocation.startsWith('/forgot-password');
      
      // 1. Usuario autenticado intenta ir a pantallas de auth
      if (isLoggedIn && isGoingToAuth) {
        return '/home';
      }
      
      // 2. Usuario no autenticado intenta acceder a rutas protegidas
      if (!isLoggedIn) {
        if (state.matchedLocation.startsWith('/cuenta') ||
            state.matchedLocation.startsWith('/carrito') ||
            state.matchedLocation.startsWith('/checkout') ||
            state.matchedLocation.startsWith('/admin')) {
          return '/login?redirectTo=${Uri.encodeComponent(state.matchedLocation)}';
        }
      }
      
      // 3. Usuario no admin intenta acceder a /admin
      if (state.matchedLocation.startsWith('/admin') && !isAdmin) {
        return '/home';
      }
      
      return null; // No redirect
    },
    
    routes: [
      // Rutas definidas abajo
    ],
    
    // Error screen
    errorBuilder: (context, state) => ErrorScreen(
      error: state.error.toString(),
    ),
  );
}

// Helper para refresh stream
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<AsyncValue<AuthUser?>> stream) {
    _subscription = stream.listen((_) {
      notifyListeners();
    });
  }
  
  late final StreamSubscription _subscription;
  
  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
```

### lib/core/router/routes.dart

**Constantes de rutas:**

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
  static const returns = '/cuenta/devoluciones';
  static String returnDetail(String id) => '/cuenta/devoluciones/$id';
  
  // Admin
  static const adminDashboard = '/admin/dashboard';
  static const adminProducts = '/admin/productos';
  static const adminProductNew = '/admin/productos/nuevo';
  static String adminProductEdit(String id) => '/admin/productos/$id/editar';
  static const adminOrders = '/admin/pedidos';
  static String adminOrderDetail(String id) => '/admin/pedidos/$id';
  static const adminCategories = '/admin/categorias';
  static const adminCoupons = '/admin/cupones';
  static const adminPromotions = '/admin/promociones';
  static const adminNewsletter = '/admin/newsletter';
  static const adminReturns = '/admin/devoluciones';
  static const adminSettings = '/admin/configuracion';
  
  // Other
  static const newsletterUnsubscribe = '/newsletter/unsubscribe';
}
```

### Definición de Rutas (dentro de GoRouter)

```dart
routes: [
  // ========== AUTH ROUTES ==========
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
  
  // ========== MAIN NAVIGATION (con Bottom Nav Bar) ==========
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
  
  // ========== PRODUCT DETAIL (sin bottom nav) ==========
  GoRoute(
    path: '/productos/:slug',
    builder: (context, state) {
      final slug = state.pathParameters['slug']!;
      return ProductDetailScreen(slug: slug);
    },
  ),
  
  // ========== CATEGORY ==========
  GoRoute(
    path: '/categoria/:slug',
    builder: (context, state) {
      final slug = state.pathParameters['slug']!;
      return CategoryScreen(slug: slug);
    },
  ),
  
  // ========== CHECKOUT ==========
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
  
  // ========== ACCOUNT SUBPAGES ==========
  GoRoute(
    path: '/cuenta/perfil',
    builder: (context, state) => const ProfileScreen(),
  ),
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
  
  // ========== ADMIN ROUTES (con drawer navigation) ==========
  ShellRoute(
    builder: (context, state, child) {
      return AdminLayout(child: child);
    },
    routes: [
      GoRoute(
        path: '/admin/dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/productos',
        builder: (context, state) => const AdminProductsScreen(),
      ),
      // ... más rutas admin
    ],
  ),
  
  // ========== OTHER ==========
  GoRoute(
    path: '/newsletter/unsubscribe',
    builder: (context, state) {
      final email = state.uri.queryParameters['email'];
      final token = state.uri.queryParameters['token'];
      return NewsletterUnsubscribeScreen(
        email: email,
        token: token,
      );
    },
  ),
],
```

## 📱 Main Navigation Screen (Bottom Nav Bar)

### lib/core/presentation/main_navigation_screen.dart

**Características:**
- Bottom Navigation Bar con 4 tabs
- Iconos: home, shopping-bag, shopping-cart, user
- Badge en carrito con cantidad de items
- Mantiene estado de cada tab al cambiar
- Animación suave al cambiar tab

**Estructura:**

```dart
class MainNavigationScreen extends ConsumerWidget {
  final Widget child;
  
  const MainNavigationScreen({required this.child});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocation = GoRouterState.of(context).matchedLocation;
    final cartCount = ref.watch(cartCountProvider);
    
    // Determinar índice actual basado en ruta
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
            case 0:
              context.go('/home');
            case 1:
              context.go('/productos');
            case 2:
              context.go('/carrito');
            case 3:
              context.go('/cuenta');
          }
        },
        destinations: [
          const NavigationDestination(
            icon: Icon(LucideIcons.home),
            label: 'Inicio',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.shoppingBag),
            label: 'Catálogo',
          ),
          NavigationDestination(
            icon: Badge(
              label: Text('$cartCount'),
              isLabelVisible: cartCount > 0,
              child: const Icon(LucideIcons.shoppingCart),
            ),
            label: 'Carrito',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.user),
            label: 'Cuenta',
          ),
        ],
      ),
    );
  }
}
```

## 🎨 Consideraciones de UI/UX

### Transiciones

- **Push**: Slide from right (Android) / Slide from bottom (iOS modal)
- **Pop**: Reverse animation
- **Replace**: Fade transition
- Duración: 300ms

### Deep Links

**Android** (`AndroidManifest.xml`):
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https"
        android:host="fashionstore.com" />
  <data android:scheme="fashionstore" />
</intent-filter>
```

**iOS** (`Info.plist`):
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

### Estado de Navegación

- Mantener estado de scroll en cada tab
- Cache de screens visitados (limitado a 3 para performance)
- Pop hasta root al tocar tab actual

## ✅ Verificación del Módulo

### Checklist

- [ ] GoRouter configurado con todas las rutas
- [ ] Guards de autenticación funcionan correctamente
- [ ] MainNavigationScreen con bottom nav bar
- [ ] Badge de carrito muestra cantidad correcta
- [ ] Deep links configurados (Android/iOS)
- [ ] Redirecciones funcionan (login, admin, etc.)
- [ ] Parámetro `redirectTo` funciona en login
- [ ] No hay rutas huérfanas o inaccesibles

### Tests Manuales

1. **Navegación pública:**
   - Home → Catálogo → Producto → Volver
   - Navegación fluida, sin parpadeos

2. **Protección de rutas:**
   - Sin login → intenta /carrito → redirige a /login
   - Login → automáticamente a /carrito
   - Sin login → intenta /admin → redirige a /login
   - Login (no admin) → intenta /admin → redirige a /home

3. **Bottom navigation:**
   - Tap en tabs → navega correctamente
   - Badge de carrito actualiza en tiempo real
   - Estado de scroll se mantiene al volver

4. **Deep links:**
   - Abrir `fashionstore://productos/slug-producto`
   - Abrir `fashionstore://reset-password?token=xxx`
   - Ambos abren la app en pantalla correcta

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 06: Catálogo de Productos** - Implementar listado, filtros, búsqueda y detalle.

---

**Tiempo Estimado**: 3-4 horas
**Complejidad**: Media
**Dependencias**: Módulos 01-04 completados
