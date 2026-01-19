# Módulo 4: Panel de Administración - Plan de Implementación Flutter

## 1. Visión del Módulo en Flutter

### 1.1 Decisión Arquitectónica

**Recomendación**: Implementar el Admin como **aplicación separada** o **módulo protegido dentro de la app principal**.

#### Opción A: App Separada (Recomendada para producción)
```
fashionstore_admin/
├── lib/
│   ├── main.dart
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── returns/
│   │   ├── coupons/
│   │   ├── promotions/
│   │   ├── categories/
│   │   ├── newsletter/
│   │   └── settings/
│   └── shared/
```

**Ventajas:**
- Mayor seguridad (app no accesible por usuarios)
- Bundle size independiente
- Despliegue separado
- Políticas de store diferentes

#### Opción B: Módulo Protegido (Para este proyecto educativo)
```
lib/
├── features/
│   ├── admin/                    # Todo el admin aquí
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── ...
│   ├── catalog/                  # App cliente
│   └── ...
```

**Ventajas:**
- Código compartido (modelos, servicios)
- Un solo proyecto
- Desarrollo más rápido

### 1.2 Arquitectura de Features Admin

```
lib/features/admin/
├── common/
│   ├── widgets/
│   │   ├── admin_scaffold.dart       # Layout con sidebar
│   │   ├── admin_app_bar.dart
│   │   ├── side_menu.dart
│   │   ├── stat_card.dart            # KPI cards
│   │   ├── data_table_widget.dart    # Tablas genéricas
│   │   ├── confirmation_dialog.dart
│   │   ├── image_uploader.dart
│   │   ├── rich_text_editor.dart
│   │   └── form_widgets/
│   │       ├── text_field_widget.dart
│   │       ├── dropdown_widget.dart
│   │       ├── date_picker_widget.dart
│   │       └── switch_widget.dart
│   └── providers/
│       └── admin_auth_provider.dart
│
├── dashboard/
│   ├── presentation/
│   │   ├── screens/
│   │   │   └── dashboard_screen.dart
│   │   └── widgets/
│   │       ├── kpi_grid.dart
│   │       ├── sales_chart.dart
│   │       ├── recent_orders_list.dart
│   │       └── low_stock_alert.dart
│   └── providers/
│       └── analytics_provider.dart
│
├── products/
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── products_list_screen.dart
│   │   │   ├── product_form_screen.dart
│   │   │   └── product_detail_screen.dart
│   │   └── widgets/
│   │       ├── product_filters.dart
│   │       ├── product_card_admin.dart
│   │       ├── variant_editor.dart
│   │       └── image_gallery_editor.dart
│   └── providers/
│       └── admin_products_provider.dart
│
├── categories/
│   ├── presentation/
│   │   ├── screens/
│   │   │   └── categories_screen.dart
│   │   └── widgets/
│   │       ├── category_form_dialog.dart
│   │       └── category_list_item.dart
│   └── providers/
│       └── admin_categories_provider.dart
│
├── orders/
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── orders_list_screen.dart
│   │   │   └── order_detail_screen.dart
│   │   └── widgets/
│   │       ├── order_status_badge.dart
│   │       ├── order_timeline.dart
│   │       ├── order_items_list.dart
│   │       └── shipping_form.dart
│   └── providers/
│       └── admin_orders_provider.dart
│
├── returns/
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── returns_list_screen.dart
│   │   │   └── return_detail_screen.dart
│   │   └── widgets/
│   │       ├── return_status_tabs.dart
│   │       ├── return_action_buttons.dart
│   │       └── refund_calculator.dart
│   └── providers/
│       └── admin_returns_provider.dart
│
├── coupons/
│   ├── presentation/
│   │   ├── screens/
│   │   │   └── coupons_screen.dart
│   │   └── widgets/
│   │       ├── coupon_form_dialog.dart
│   │       ├── coupon_status_badge.dart
│   │       └── coupon_list_item.dart
│   └── providers/
│       └── admin_coupons_provider.dart
│
├── promotions/
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── promotions_list_screen.dart
│   │   │   ├── promotion_wizard_screen.dart
│   │   │   └── promotion_calendar_screen.dart
│   │   └── widgets/
│   │       ├── promotion_template_grid.dart
│   │       ├── promotion_preview.dart
│   │       ├── style_config_panel.dart
│   │       ├── rule_builder.dart
│   │       └── promotion_calendar.dart
│   └── providers/
│       └── admin_promotions_provider.dart
│
├── newsletter/
│   ├── presentation/
│   │   ├── screens/
│   │   │   └── newsletter_screen.dart
│   │   └── widgets/
│   │       └── subscriber_list.dart
│   └── providers/
│       └── admin_newsletter_provider.dart
│
└── settings/
    ├── presentation/
    │   ├── screens/
    │   │   └── settings_screen.dart
    │   └── widgets/
    │       ├── store_settings_form.dart
    │       ├── shipping_settings_form.dart
    │       └── offers_settings_form.dart
    └── providers/
        └── admin_settings_provider.dart
```

---

## 2. Modelos de Datos Admin

### 2.1 Modelos Específicos de Admin

```dart
// lib/features/admin/common/models/

// analytics_data.dart
@freezed
class AnalyticsData with _$AnalyticsData {
  const factory AnalyticsData({
    required MonthlyRevenue monthlyRevenue,
    required PendingOrdersInfo pendingOrders,
    BestSellingProduct? bestSellingProduct,
    required List<DailySales> salesLast7Days,
    required List<LowStockProduct> lowStockProducts,
    required List<OrderSummary> recentOrders,
  }) = _AnalyticsData;
}

@freezed
class MonthlyRevenue with _$MonthlyRevenue {
  const factory MonthlyRevenue({
    required double total,
    required int orderCount,
    required double trend,
    required RevenueComparison comparison,
  }) = _MonthlyRevenue;
}

@freezed
class DailySales with _$DailySales {
  const factory DailySales({
    required DateTime date,
    required String label,
    required double revenue,
    required int orderCount,
  }) = _DailySales;
}

// admin_user.dart
@freezed
class AdminUser with _$AdminUser {
  const factory AdminUser({
    required String id,
    required String userId,
    required AdminRole role,
    required DateTime createdAt,
    String? name,
    String? email,
  }) = _AdminUser;
}

enum AdminRole {
  superAdmin,
  admin,
  editor,
  viewer,
}
```

### 2.2 Modelos Extendidos

```dart
// Extensión del modelo Order para admin
@freezed
class AdminOrderDetail with _$AdminOrderDetail {
  const factory AdminOrderDetail({
    required Order order,
    required List<OrderItem> items,
    required CustomerInfo customer,
    List<Shipment>? shipments,
    List<Return>? returns,
    List<OrderNote>? notes,
    Invoice? invoice,
  }) = _AdminOrderDetail;
}

// Modelo de promoción completo
@freezed
class Promotion with _$Promotion {
  const factory Promotion({
    required String id,
    required String title,
    String? description,
    required String imageUrl,
    String? mobileImageUrl,
    required String ctaText,
    required String ctaLink,
    required CtaLinkType ctaLinkType,
    String? ctaLinkCategory,
    String? couponId,
    required List<PromotionLocation> locations,
    required int priority,
    required PromotionStyleConfig styleConfig,
    required DateTime startDate,
    DateTime? endDate,
    required bool isActive,
    String? templateId,
    List<PromotionRule>? rules,
    required DateTime createdAt,
  }) = _Promotion;
}

@freezed
class PromotionStyleConfig with _$PromotionStyleConfig {
  const factory PromotionStyleConfig({
    @Default(TextColorOption.white) TextColorOption textColor,
    @Default(TextAlign.left) TextAlign textAlign,
    @Default(true) bool overlayEnabled,
    @Default(OverlayPosition.left) OverlayPosition overlayPosition,
    @Default(50) int overlayOpacity,
  }) = _PromotionStyleConfig;
}
```

---

## 3. Providers Específicos de Admin

### 3.1 Provider de Autenticación Admin

```dart
// lib/features/admin/common/providers/admin_auth_provider.dart

@riverpod
class AdminAuth extends _$AdminAuth {
  @override
  FutureOr<AdminUser?> build() async {
    final authState = await ref.watch(authStateProvider.future);
    if (authState == null) return null;
    
    return await _loadAdminUser(authState.id);
  }
  
  Future<AdminUser?> _loadAdminUser(String userId) async {
    final supabase = ref.read(supabaseClientProvider);
    
    final response = await supabase
        .from('admin_users')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
    
    if (response == null) return null;
    return AdminUser.fromJson(response);
  }
  
  bool get isAdmin => state.valueOrNull != null;
  
  bool hasPermission(AdminPermission permission) {
    final admin = state.valueOrNull;
    if (admin == null) return false;
    
    return switch (admin.role) {
      AdminRole.superAdmin => true,
      AdminRole.admin => permission != AdminPermission.manageAdmins,
      AdminRole.editor => [
        AdminPermission.viewDashboard,
        AdminPermission.manageProducts,
        AdminPermission.viewOrders,
      ].contains(permission),
      AdminRole.viewer => permission == AdminPermission.viewDashboard,
    };
  }
}

enum AdminPermission {
  viewDashboard,
  manageProducts,
  manageCategories,
  viewOrders,
  manageOrders,
  manageReturns,
  manageCoupons,
  managePromotions,
  manageNewsletter,
  manageSettings,
  manageAdmins,
}
```

### 3.2 Provider de Analytics

```dart
// lib/features/admin/dashboard/providers/analytics_provider.dart

@riverpod
Future<AnalyticsData> dashboardAnalytics(Ref ref) async {
  final supabase = ref.read(supabaseClientProvider);
  
  // Ejecutar todas las queries en paralelo
  final results = await Future.wait([
    _getMonthlyRevenue(supabase),
    _getPendingOrders(supabase),
    _getBestSellingProduct(supabase),
    _getSalesLast7Days(supabase),
    _getLowStockProducts(supabase),
    _getRecentOrders(supabase),
  ]);
  
  return AnalyticsData(
    monthlyRevenue: results[0] as MonthlyRevenue,
    pendingOrders: results[1] as PendingOrdersInfo,
    bestSellingProduct: results[2] as BestSellingProduct?,
    salesLast7Days: results[3] as List<DailySales>,
    lowStockProducts: results[4] as List<LowStockProduct>,
    recentOrders: results[5] as List<OrderSummary>,
  );
}

Future<MonthlyRevenue> _getMonthlyRevenue(SupabaseClient supabase) async {
  final now = DateTime.now();
  final monthStart = DateTime(now.year, now.month, 1);
  
  // Ingresos del mes actual
  final currentMonth = await supabase
      .from('orders')
      .select('total_amount, refunded_amount')
      .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed'])
      .gte('created_at', monthStart.toIso8601String());
  
  final total = (currentMonth as List).fold<double>(0, (sum, order) {
    final amount = (order['total_amount'] as num?)?.toDouble() ?? 0;
    final refunded = (order['refunded_amount'] as num?)?.toDouble() ?? 0;
    return sum + amount - refunded;
  });
  
  // Mes anterior para comparación
  final lastMonthStart = DateTime(now.year, now.month - 1, 1);
  final lastMonthEnd = monthStart.subtract(const Duration(seconds: 1));
  
  final lastMonth = await supabase
      .from('orders')
      .select('total_amount, refunded_amount')
      .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed'])
      .gte('created_at', lastMonthStart.toIso8601String())
      .lte('created_at', lastMonthEnd.toIso8601String());
  
  final lastTotal = (lastMonth as List).fold<double>(0, (sum, order) {
    final amount = (order['total_amount'] as num?)?.toDouble() ?? 0;
    final refunded = (order['refunded_amount'] as num?)?.toDouble() ?? 0;
    return sum + amount - refunded;
  });
  
  final trend = lastTotal > 0 ? ((total - lastTotal) / lastTotal) * 100 : 0;
  
  return MonthlyRevenue(
    total: total,
    orderCount: (currentMonth as List).length,
    trend: trend.roundToDouble(),
    comparison: RevenueComparison(
      current: total,
      previous: lastTotal,
      difference: total - lastTotal,
    ),
  );
}
```

### 3.3 Provider de Productos Admin

```dart
// lib/features/admin/products/providers/admin_products_provider.dart

@riverpod
class AdminProductsList extends _$AdminProductsList {
  @override
  FutureOr<List<Product>> build({
    String? search,
    String? categoryId,
    ProductStatusFilter status = ProductStatusFilter.all,
    int page = 1,
    int pageSize = 20,
  }) async {
    final supabase = ref.read(supabaseClientProvider);
    
    var query = supabase
        .from('products')
        .select('''
          *,
          category:categories(id, name, slug),
          variants:product_variants(id, size, stock)
        ''')
        .is_('deleted_at', null)
        .order('created_at', ascending: false);
    
    // Aplicar filtros
    if (search != null && search.isNotEmpty) {
      query = query.ilike('name', '%$search%');
    }
    
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    // Filtro por estado
    switch (status) {
      case ProductStatusFilter.active:
        query = query.eq('is_active', true);
      case ProductStatusFilter.inactive:
        query = query.eq('is_active', false);
      case ProductStatusFilter.offer:
        query = query.not('offer_price', 'is', null);
      case ProductStatusFilter.lowStock:
        // Se filtra después en memoria
        break;
      case ProductStatusFilter.all:
        break;
    }
    
    // Paginación
    final offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);
    
    final response = await query;
    var products = (response as List).map((e) => Product.fromJson(e)).toList();
    
    // Filtro de low stock (post-query)
    if (status == ProductStatusFilter.lowStock) {
      products = products.where((p) {
        final totalStock = p.variants.fold(0, (sum, v) => sum + v.stock);
        return totalStock < 5;
      }).toList();
    }
    
    return products;
  }
  
  Future<void> deleteProduct(String productId) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Soft delete
    await supabase
        .from('products')
        .update({'deleted_at': DateTime.now().toIso8601String()})
        .eq('id', productId);
    
    ref.invalidateSelf();
  }
  
  Future<void> toggleActive(String productId, bool isActive) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('products')
        .update({'is_active': isActive})
        .eq('id', productId);
    
    ref.invalidateSelf();
  }
}

enum ProductStatusFilter {
  all,
  active,
  inactive,
  offer,
  lowStock,
}
```

---

## 4. Navegación Admin

### 4.1 Rutas Admin con GoRouter

```dart
// lib/features/admin/admin_routes.dart

final adminRoutes = ShellRoute(
  builder: (context, state, child) => AdminShell(child: child),
  routes: [
    GoRoute(
      path: '/admin',
      redirect: (context, state) => '/admin/dashboard',
    ),
    GoRoute(
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/admin/products',
      name: 'admin-products',
      builder: (context, state) => const ProductsListScreen(),
      routes: [
        GoRoute(
          path: 'new',
          name: 'admin-product-new',
          builder: (context, state) => const ProductFormScreen(),
        ),
        GoRoute(
          path: ':id',
          name: 'admin-product-edit',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ProductFormScreen(productId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/admin/categories',
      name: 'admin-categories',
      builder: (context, state) => const CategoriesScreen(),
    ),
    GoRoute(
      path: '/admin/orders',
      name: 'admin-orders',
      builder: (context, state) => const OrdersListScreen(),
      routes: [
        GoRoute(
          path: ':id',
          name: 'admin-order-detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return OrderDetailScreen(orderId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/admin/returns',
      name: 'admin-returns',
      builder: (context, state) => const ReturnsListScreen(),
      routes: [
        GoRoute(
          path: ':id',
          name: 'admin-return-detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ReturnDetailScreen(returnId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/admin/coupons',
      name: 'admin-coupons',
      builder: (context, state) => const CouponsScreen(),
    ),
    GoRoute(
      path: '/admin/promotions',
      name: 'admin-promotions',
      builder: (context, state) => const PromotionsListScreen(),
      routes: [
        GoRoute(
          path: 'wizard',
          name: 'admin-promotion-wizard',
          builder: (context, state) => const PromotionWizardScreen(),
        ),
        GoRoute(
          path: 'calendar',
          name: 'admin-promotion-calendar',
          builder: (context, state) => const PromotionCalendarScreen(),
        ),
        GoRoute(
          path: ':id',
          name: 'admin-promotion-edit',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return PromotionWizardScreen(promotionId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/admin/newsletter',
      name: 'admin-newsletter',
      builder: (context, state) => const NewsletterScreen(),
    ),
    GoRoute(
      path: '/admin/settings',
      name: 'admin-settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
```

### 4.2 Guard de Autenticación Admin

```dart
// En router principal
GoRoute(
  path: '/admin/login',
  builder: (context, state) => const AdminLoginScreen(),
),
...adminRoutes,

// Redirect si no es admin
redirect: (context, state) {
  final isAdminRoute = state.matchedLocation.startsWith('/admin');
  final isLoginRoute = state.matchedLocation == '/admin/login';
  
  if (isAdminRoute && !isLoginRoute) {
    final container = ProviderScope.containerOf(context);
    final adminUser = container.read(adminAuthProvider).valueOrNull;
    
    if (adminUser == null) {
      return '/admin/login?redirect=${state.matchedLocation}';
    }
  }
  
  return null;
},
```

---

## 5. Widgets Compartidos Admin

### 5.1 AdminShell (Layout Principal)

```dart
class AdminShell extends ConsumerWidget {
  final Widget child;
  
  const AdminShell({required this.child, super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    
    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          AdminSideMenu(currentPath: location),
          
          // Contenido principal
          Expanded(
            child: Column(
              children: [
                AdminAppBar(),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

### 5.2 Menu Items

```dart
final adminMenuItems = [
  AdminMenuItem(
    title: 'Dashboard',
    icon: Icons.dashboard_outlined,
    activeIcon: Icons.dashboard,
    path: '/admin/dashboard',
  ),
  AdminMenuItem(
    title: 'Productos',
    icon: Icons.inventory_2_outlined,
    activeIcon: Icons.inventory_2,
    path: '/admin/products',
  ),
  AdminMenuItem(
    title: 'Categorías',
    icon: Icons.category_outlined,
    activeIcon: Icons.category,
    path: '/admin/categories',
  ),
  AdminMenuItem(
    title: 'Cupones',
    icon: Icons.local_offer_outlined,
    activeIcon: Icons.local_offer,
    path: '/admin/coupons',
  ),
  AdminMenuItem(
    title: 'Promociones',
    icon: Icons.campaign_outlined,
    activeIcon: Icons.campaign,
    path: '/admin/promotions',
  ),
  AdminMenuItem(
    title: 'Pedidos',
    icon: Icons.shopping_bag_outlined,
    activeIcon: Icons.shopping_bag,
    path: '/admin/orders',
  ),
  AdminMenuItem(
    title: 'Devoluciones',
    icon: Icons.assignment_return_outlined,
    activeIcon: Icons.assignment_return,
    path: '/admin/returns',
  ),
  AdminMenuItem(
    title: 'Newsletter',
    icon: Icons.mail_outlined,
    activeIcon: Icons.mail,
    path: '/admin/newsletter',
  ),
  AdminMenuItem(
    title: 'Configuración',
    icon: Icons.settings_outlined,
    activeIcon: Icons.settings,
    path: '/admin/settings',
  ),
];
```

---

## 6. Dependencias Adicionales

```yaml
# pubspec.yaml - Dependencias específicas para Admin

dependencies:
  # Gráficos
  fl_chart: ^0.69.0
  
  # Editor de texto rico
  flutter_quill: ^10.8.5
  
  # Tablas de datos avanzadas
  data_table_2: ^2.5.15
  
  # Calendario
  table_calendar: ^3.1.2
  
  # Drag & drop para imágenes
  reorderable_grid_view: ^2.2.8
  
  # Stepper personalizado (wizard)
  im_stepper: ^1.0.1+1
  
  # Selector de archivos/imágenes
  file_picker: ^8.1.2
  
  # Exportar a CSV
  csv: ^6.0.0
```

---

## 7. Orden de Implementación

### Fase 1: Infraestructura Base (2-3 días)
1. ✅ Modelos de datos admin
2. ✅ Provider de autenticación admin
3. ✅ Layout AdminShell y SideMenu
4. ✅ Rutas y navegación

### Fase 2: Dashboard (1-2 días)
1. Provider de analytics
2. KPI Cards
3. Sales Chart
4. Alertas de stock bajo
5. Pedidos recientes

### Fase 3: Gestión de Productos (2-3 días)
1. Listado con filtros
2. Formulario crear/editar
3. Editor de variantes
4. Galería de imágenes
5. Soft delete

### Fase 4: Categorías y Cupones (1-2 días)
1. CRUD de categorías
2. CRUD de cupones
3. Validaciones

### Fase 5: Pedidos y Devoluciones (2-3 días)
1. Listado de pedidos con filtros
2. Detalle de pedido
3. Acciones de estado
4. Gestión de devoluciones
5. Workflow de reembolso

### Fase 6: Promociones (2-3 días)
1. Listado de promociones
2. Wizard de creación
3. Templates
4. Rule Builder
5. Calendario

### Fase 7: Newsletter y Settings (1 día)
1. Listado suscriptores
2. Export CSV
3. Formulario de configuración

**Total estimado: 11-17 días**

---

## 8. Consideraciones de Seguridad

1. **RLS en Supabase**: Crear políticas específicas para admin_users
2. **Validación de rol**: Verificar permisos antes de cada operación
3. **Audit log**: Registrar acciones administrativas
4. **Session timeout**: Cerrar sesión tras inactividad
5. **Input sanitization**: Validar todos los inputs en el servidor
