# Módulo 4: Panel de Administración - Fase 3: Backend (Providers)

## 1. Provider de Autenticación Admin

```dart
// lib/features/admin/common/providers/admin_auth_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../models/admin_user.dart';

part 'admin_auth_provider.g.dart';

/// Provider que verifica si el usuario actual es administrador
@riverpod
class AdminAuth extends _$AdminAuth {
  @override
  FutureOr<AdminUser?> build() async {
    // Observar cambios en la autenticación
    final authState = await ref.watch(authStateProvider.future);
    
    if (authState == null) return null;
    
    return await _loadAdminUser(authState.id);
  }
  
  Future<AdminUser?> _loadAdminUser(String userId) async {
    final supabase = ref.read(supabaseClientProvider);
    
    try {
      final response = await supabase
          .from('admin_users')
          .select()
          .eq('user_id', userId)
          .maybeSingle();
      
      if (response == null) return null;
      
      // Actualizar último login
      await supabase
          .from('admin_users')
          .update({'last_login_at': DateTime.now().toIso8601String()})
          .eq('user_id', userId);
      
      return AdminUser.fromJson(response);
    } catch (e) {
      return null;
    }
  }
  
  /// Verifica si el usuario actual es admin
  bool get isAdmin => state.valueOrNull != null;
  
  /// Verifica si tiene un permiso específico
  bool hasPermission(AdminPermission permission) {
    return state.valueOrNull?.hasPermission(permission) ?? false;
  }
  
  /// Obtiene el rol del admin actual
  AdminRole? get currentRole => state.valueOrNull?.role;
}

/// Provider simple para verificar acceso admin
@riverpod
Future<bool> isAdminUser(Ref ref) async {
  final adminUser = await ref.watch(adminAuthProvider.future);
  return adminUser != null;
}
```

---

## 2. Provider de Analytics (Dashboard)

```dart
// lib/features/admin/dashboard/providers/analytics_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:intl/intl.dart';

import '../../../core/providers/supabase_provider.dart';
import '../../common/models/analytics_data.dart';

part 'analytics_provider.g.dart';

/// Provider principal del dashboard con todos los datos analíticos
@riverpod
Future<AnalyticsData> dashboardAnalytics(Ref ref) async {
  final supabase = ref.read(supabaseClientProvider);
  
  // Ejecutar todas las queries en paralelo para mejor rendimiento
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

/// Ingresos mensuales con comparación vs mes anterior
Future<MonthlyRevenue> _getMonthlyRevenue(SupabaseClient supabase) async {
  final now = DateTime.now();
  final monthStart = DateTime(now.year, now.month, 1);
  final monthEnd = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
  
  // Query del mes actual
  final currentMonthData = await supabase
      .from('orders')
      .select('total_amount, refunded_amount')
      .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
      .gte('created_at', monthStart.toIso8601String())
      .lte('created_at', monthEnd.toIso8601String());
  
  final total = _calculateNetRevenue(currentMonthData as List);
  final orderCount = (currentMonthData as List).length;
  
  // Query del mes anterior
  final lastMonthStart = DateTime(now.year, now.month - 1, 1);
  final lastMonthEnd = DateTime(now.year, now.month, 0, 23, 59, 59);
  
  final lastMonthData = await supabase
      .from('orders')
      .select('total_amount, refunded_amount')
      .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
      .gte('created_at', lastMonthStart.toIso8601String())
      .lte('created_at', lastMonthEnd.toIso8601String());
  
  final lastTotal = _calculateNetRevenue(lastMonthData as List);
  
  // Calcular tendencia
  final trend = lastTotal > 0 
      ? ((total - lastTotal) / lastTotal) * 100 
      : (total > 0 ? 100 : 0);
  
  return MonthlyRevenue(
    total: total,
    orderCount: orderCount,
    trend: double.parse(trend.toStringAsFixed(1)),
    comparison: RevenueComparison(
      current: total,
      previous: lastTotal,
      difference: total - lastTotal,
    ),
  );
}

double _calculateNetRevenue(List<dynamic> orders) {
  return orders.fold<double>(0, (sum, order) {
    final amount = (order['total_amount'] as num?)?.toDouble() ?? 0;
    final refunded = (order['refunded_amount'] as num?)?.toDouble() ?? 0;
    return sum + amount - refunded;
  });
}

/// Pedidos pendientes de procesar
Future<PendingOrdersInfo> _getPendingOrders(SupabaseClient supabase) async {
  final data = await supabase
      .from('orders')
      .select('id, order_number, customer_name, created_at, total_amount, status')
      .inFilter('status', ['pending', 'paid'])
      .order('created_at', ascending: false)
      .limit(10);
  
  final orders = (data as List).map((e) => OrderSummary(
    id: e['id'],
    orderNumber: e['order_number'] ?? 'N/A',
    customerName: e['customer_name'],
    totalAmount: (e['total_amount'] as num).toDouble(),
    status: OrderStatus.fromString(e['status']),
    createdAt: DateTime.parse(e['created_at']),
  )).toList();
  
  final pendingCount = orders.where((o) => o.status == OrderStatus.pending).length;
  final paidCount = orders.where((o) => o.status == OrderStatus.paid).length;
  
  return PendingOrdersInfo(
    total: orders.length,
    pending: pendingCount,
    paid: paidCount,
    orders: orders.take(5).toList(),
  );
}

/// Producto más vendido del mes
Future<BestSellingProduct?> _getBestSellingProduct(SupabaseClient supabase) async {
  final now = DateTime.now();
  final monthStart = DateTime(now.year, now.month, 1);
  
  // Obtener pedidos del mes
  final ordersData = await supabase
      .from('orders')
      .select('id')
      .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed'])
      .gte('created_at', monthStart.toIso8601String());
  
  if ((ordersData as List).isEmpty) return null;
  
  final orderIds = (ordersData).map((o) => o['id'] as String).toList();
  
  // Obtener items de esos pedidos
  final itemsData = await supabase
      .from('order_items')
      .select('''
        product_id,
        quantity,
        product:products(id, name, price, offer_price)
      ''')
      .inFilter('order_id', orderIds);
  
  if ((itemsData as List).isEmpty) return null;
  
  // Agrupar por producto
  final productSales = <String, Map<String, dynamic>>{};
  
  for (final item in itemsData) {
    final productId = item['product_id'] as String?;
    if (productId == null) continue;
    
    final product = item['product'];
    if (product == null) continue;
    
    final productData = product is List ? product.first : product;
    if (productData == null) continue;
    
    final quantity = (item['quantity'] as num).toInt();
    final price = (productData['offer_price'] ?? productData['price']) as num;
    
    if (!productSales.containsKey(productId)) {
      productSales[productId] = {
        'productId': productId,
        'productName': productData['name'],
        'productPrice': (productData['price'] as num).toDouble(),
        'offerPrice': productData['offer_price'] != null 
            ? (productData['offer_price'] as num).toDouble() 
            : null,
        'totalQuantity': 0,
        'totalRevenue': 0.0,
      };
    }
    
    productSales[productId]!['totalQuantity'] += quantity;
    productSales[productId]!['totalRevenue'] += quantity * price.toDouble();
  }
  
  if (productSales.isEmpty) return null;
  
  // Encontrar el más vendido
  final bestSelling = productSales.values.reduce((a, b) => 
      (a['totalQuantity'] as int) > (b['totalQuantity'] as int) ? a : b);
  
  return BestSellingProduct(
    productId: bestSelling['productId'],
    productName: bestSelling['productName'],
    productPrice: bestSelling['productPrice'],
    offerPrice: bestSelling['offerPrice'],
    totalQuantity: bestSelling['totalQuantity'],
    totalRevenue: bestSelling['totalRevenue'],
  );
}

/// Ventas de los últimos 7 días
Future<List<DailySales>> _getSalesLast7Days(SupabaseClient supabase) async {
  final dateFormat = DateFormat('EEE d', 'es');
  final sales = <DailySales>[];
  
  for (int i = 6; i >= 0; i--) {
    final date = DateTime.now().subtract(Duration(days: i));
    final dayStart = DateTime(date.year, date.month, date.day);
    final dayEnd = dayStart.add(const Duration(days: 1));
    
    final data = await supabase
        .from('orders')
        .select('total_amount, refunded_amount')
        .inFilter('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
        .gte('created_at', dayStart.toIso8601String())
        .lt('created_at', dayEnd.toIso8601String());
    
    final revenue = _calculateNetRevenue(data as List);
    
    sales.add(DailySales(
      date: date,
      label: dateFormat.format(date),
      revenue: revenue,
      orderCount: (data).length,
    ));
  }
  
  return sales;
}

/// Productos con stock bajo (< 5 unidades en alguna talla)
Future<List<LowStockProduct>> _getLowStockProducts(SupabaseClient supabase) async {
  final data = await supabase
      .from('products')
      .select('''
        id,
        name,
        images,
        variants:product_variants(size, stock)
      ''')
      .is_('deleted_at', null)
      .eq('is_active', true);
  
  final lowStockProducts = <LowStockProduct>[];
  
  for (final product in (data as List)) {
    final variants = (product['variants'] as List?) ?? [];
    final lowStockVariants = variants
        .where((v) => (v['stock'] as num).toInt() < 5)
        .map((v) => VariantStock(
          size: v['size'],
          stock: (v['stock'] as num).toInt(),
        ))
        .toList();
    
    if (lowStockVariants.isNotEmpty) {
      final images = product['images'] as List?;
      final totalStock = variants.fold<int>(
        0, 
        (sum, v) => sum + (v['stock'] as num).toInt(),
      );
      
      lowStockProducts.add(LowStockProduct(
        id: product['id'],
        name: product['name'],
        imageUrl: images?.isNotEmpty == true ? images!.first : null,
        totalStock: totalStock,
        variants: lowStockVariants,
      ));
    }
  }
  
  // Ordenar por stock total (menor primero)
  lowStockProducts.sort((a, b) => a.totalStock.compareTo(b.totalStock));
  
  return lowStockProducts;
}

/// Pedidos recientes (últimos 5)
Future<List<OrderSummary>> _getRecentOrders(SupabaseClient supabase) async {
  final data = await supabase
      .from('orders')
      .select('id, order_number, customer_name, created_at, total_amount, status')
      .order('created_at', ascending: false)
      .limit(5);
  
  return (data as List).map((e) => OrderSummary(
    id: e['id'],
    orderNumber: e['order_number'] ?? 'N/A',
    customerName: e['customer_name'],
    totalAmount: (e['total_amount'] as num).toDouble(),
    status: OrderStatus.fromString(e['status']),
    createdAt: DateTime.parse(e['created_at']),
  )).toList();
}
```

---

## 3. Provider de Productos Admin

```dart
// lib/features/admin/products/providers/admin_products_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/supabase_provider.dart';
import '../../../features/catalog/models/product.dart';

part 'admin_products_provider.g.dart';

/// Filtro de estado de productos
enum ProductStatusFilter {
  all,
  active,
  inactive,
  offer,
  lowStock,
}

/// Provider para listado de productos con filtros
@riverpod
class AdminProductsList extends _$AdminProductsList {
  static const int _pageSize = 20;
  
  @override
  FutureOr<List<Product>> build({
    String? search,
    String? categoryId,
    ProductStatusFilter status = ProductStatusFilter.all,
    int page = 1,
  }) async {
    final supabase = ref.read(supabaseClientProvider);
    
    var query = supabase
        .from('products')
        .select('''
          *,
          category:categories(id, name, slug, size_type),
          variants:product_variants(id, size, stock, sku)
        ''')
        .is_('deleted_at', null)
        .order('created_at', ascending: false);
    
    // Filtro de búsqueda
    if (search != null && search.isNotEmpty) {
      query = query.ilike('name', '%$search%');
    }
    
    // Filtro de categoría
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    // Filtros de estado
    switch (status) {
      case ProductStatusFilter.active:
        query = query.eq('is_active', true);
      case ProductStatusFilter.inactive:
        query = query.eq('is_active', false);
      case ProductStatusFilter.offer:
        query = query.not('offer_price', 'is', null);
      case ProductStatusFilter.lowStock:
        // Se filtra en memoria después
        break;
      case ProductStatusFilter.all:
        break;
    }
    
    // Paginación
    final offset = (page - 1) * _pageSize;
    query = query.range(offset, offset + _pageSize - 1);
    
    final response = await query;
    var products = (response as List).map((e) => Product.fromJson(e)).toList();
    
    // Filtro post-query para stock bajo
    if (status == ProductStatusFilter.lowStock) {
      products = products.where((p) {
        final totalStock = p.variants.fold(0, (sum, v) => sum + v.stock);
        return totalStock < 5;
      }).toList();
    }
    
    return products;
  }
  
  /// Soft delete de producto
  Future<void> deleteProduct(String productId) async {
    state = const AsyncLoading();
    
    try {
      final supabase = ref.read(supabaseClientProvider);
      
      await supabase
          .from('products')
          .update({'deleted_at': DateTime.now().toIso8601String()})
          .eq('id', productId);
      
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
  
  /// Activar/Desactivar producto
  Future<void> toggleActive(String productId, bool isActive) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('products')
        .update({'is_active': isActive})
        .eq('id', productId);
    
    ref.invalidateSelf();
  }
}

/// Provider para un producto específico (edición)
@riverpod
Future<Product?> adminProductDetail(Ref ref, String productId) async {
  final supabase = ref.read(supabaseClientProvider);
  
  final response = await supabase
      .from('products')
      .select('''
        *,
        category:categories(id, name, slug, size_type),
        variants:product_variants(id, size, stock, sku)
      ''')
      .eq('id', productId)
      .maybeSingle();
  
  if (response == null) return null;
  return Product.fromJson(response);
}

/// Provider para crear/actualizar productos
@riverpod
class ProductMutations extends _$ProductMutations {
  @override
  FutureOr<void> build() {}
  
  /// Crear nuevo producto
  Future<String> createProduct(ProductFormData data) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Insertar producto
    final productResponse = await supabase
        .from('products')
        .insert({
          'name': data.name,
          'slug': data.slug,
          'description': data.description,
          'price': data.price,
          'offer_price': data.offerPrice,
          'category_id': data.categoryId,
          'images': data.images,
          'is_active': data.isActive,
          'is_featured': data.isFeatured,
        })
        .select()
        .single();
    
    final productId = productResponse['id'] as String;
    
    // Insertar variantes
    if (data.variants.isNotEmpty) {
      await supabase.from('product_variants').insert(
        data.variants.map((v) => {
          'product_id': productId,
          'size': v.size,
          'stock': v.stock,
          'sku': v.sku,
        }).toList(),
      );
    }
    
    // Invalidar cache
    ref.invalidate(adminProductsListProvider);
    
    return productId;
  }
  
  /// Actualizar producto existente
  Future<void> updateProduct(String productId, ProductFormData data) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Actualizar producto
    await supabase
        .from('products')
        .update({
          'name': data.name,
          'slug': data.slug,
          'description': data.description,
          'price': data.price,
          'offer_price': data.offerPrice,
          'category_id': data.categoryId,
          'images': data.images,
          'is_active': data.isActive,
          'is_featured': data.isFeatured,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', productId);
    
    // Actualizar variantes (delete + insert para simplificar)
    await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);
    
    if (data.variants.isNotEmpty) {
      await supabase.from('product_variants').insert(
        data.variants.map((v) => {
          'product_id': productId,
          'size': v.size,
          'stock': v.stock,
          'sku': v.sku,
        }).toList(),
      );
    }
    
    // Invalidar cache
    ref.invalidate(adminProductsListProvider);
    ref.invalidate(adminProductDetailProvider(productId));
  }
}

/// Datos del formulario de producto
class ProductFormData {
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? offerPrice;
  final String categoryId;
  final List<String> images;
  final bool isActive;
  final bool isFeatured;
  final List<VariantFormData> variants;
  
  const ProductFormData({
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.offerPrice,
    required this.categoryId,
    required this.images,
    required this.isActive,
    required this.isFeatured,
    required this.variants,
  });
}

class VariantFormData {
  final String size;
  final int stock;
  final String? sku;
  
  const VariantFormData({
    required this.size,
    required this.stock,
    this.sku,
  });
}
```

---

## 4. Provider de Pedidos Admin

```dart
// lib/features/admin/orders/providers/admin_orders_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/supabase_provider.dart';
import '../../common/models/analytics_data.dart';

part 'admin_orders_provider.g.dart';

/// Provider para listado de pedidos con filtros y paginación
@riverpod
class AdminOrdersList extends _$AdminOrdersList {
  static const int _pageSize = 20;
  
  @override
  FutureOr<OrdersListResult> build({
    OrderStatus? statusFilter,
    String? search,
    int page = 1,
  }) async {
    final supabase = ref.read(supabaseClientProvider);
    
    var query = supabase
        .from('orders')
        .select('*', const FetchOptions(count: CountOption.exact));
    
    // Filtro de estado
    if (statusFilter != null) {
      query = query.eq('status', statusFilter.value);
    }
    
    // Filtro de búsqueda
    if (search != null && search.isNotEmpty) {
      query = query.or('customer_name.ilike.%$search%,order_number.ilike.%$search%,customer_email.ilike.%$search%');
    }
    
    // Ordenamiento y paginación
    final offset = (page - 1) * _pageSize;
    query = query
        .order('created_at', ascending: false)
        .range(offset, offset + _pageSize - 1);
    
    final response = await query;
    
    final orders = (response.data as List).map((e) => OrderSummary(
      id: e['id'],
      orderNumber: e['order_number'] ?? 'N/A',
      customerName: e['customer_name'],
      totalAmount: (e['total_amount'] as num).toDouble(),
      status: OrderStatus.fromString(e['status']),
      createdAt: DateTime.parse(e['created_at']),
    )).toList();
    
    return OrdersListResult(
      orders: orders,
      totalCount: response.count ?? 0,
      currentPage: page,
      pageSize: _pageSize,
    );
  }
  
  /// Actualizar estado de un pedido
  Future<void> updateStatus(String orderId, OrderStatus newStatus) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('orders')
        .update({
          'status': newStatus.value,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', orderId);
    
    ref.invalidateSelf();
  }
}

class OrdersListResult {
  final List<OrderSummary> orders;
  final int totalCount;
  final int currentPage;
  final int pageSize;
  
  const OrdersListResult({
    required this.orders,
    required this.totalCount,
    required this.currentPage,
    required this.pageSize,
  });
  
  int get totalPages => (totalCount / pageSize).ceil();
  bool get hasNextPage => currentPage < totalPages;
  bool get hasPreviousPage => currentPage > 1;
}

/// Provider para detalle de pedido
@riverpod
Future<OrderDetail?> adminOrderDetail(Ref ref, String orderId) async {
  final supabase = ref.read(supabaseClientProvider);
  
  final response = await supabase
      .from('orders')
      .select('''
        *,
        items:order_items(
          *,
          product:products(id, name, images)
        ),
        shipments:order_shipments(*),
        returns(*)
      ''')
      .eq('id', orderId)
      .maybeSingle();
  
  if (response == null) return null;
  return OrderDetail.fromJson(response);
}

/// Provider para acciones de pedidos
@riverpod
class OrderActions extends _$OrderActions {
  @override
  FutureOr<void> build() {}
  
  /// Añadir tracking de envío
  Future<void> addShipment({
    required String orderId,
    required String carrier,
    required String trackingNumber,
  }) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Crear shipment
    await supabase.from('order_shipments').insert({
      'order_id': orderId,
      'carrier': carrier,
      'tracking_number': trackingNumber,
      'shipped_at': DateTime.now().toIso8601String(),
    });
    
    // Actualizar estado del pedido
    await supabase
        .from('orders')
        .update({
          'status': 'shipped',
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', orderId);
    
    // Invalidar cache
    ref.invalidate(adminOrdersListProvider);
    ref.invalidate(adminOrderDetailProvider(orderId));
  }
  
  /// Marcar como entregado
  Future<void> markAsDelivered(String orderId) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('orders')
        .update({
          'status': 'delivered',
          'delivered_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', orderId);
    
    ref.invalidate(adminOrdersListProvider);
    ref.invalidate(adminOrderDetailProvider(orderId));
  }
  
  /// Cancelar pedido
  Future<void> cancelOrder(String orderId, String reason) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Llamar al RPC que restaura stock
    await supabase.rpc('cancel_order', params: {
      'p_order_id': orderId,
      'p_reason': reason,
    });
    
    ref.invalidate(adminOrdersListProvider);
    ref.invalidate(adminOrderDetailProvider(orderId));
  }
}
```

---

## 5. Provider de Devoluciones Admin

```dart
// lib/features/admin/returns/providers/admin_returns_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/supabase_provider.dart';
import '../models/return_admin.dart';

part 'admin_returns_provider.g.dart';

/// Provider para listado de devoluciones con filtro de estado
@riverpod
class AdminReturnsList extends _$AdminReturnsList {
  @override
  FutureOr<ReturnsListResult> build({
    ReturnStatus? statusFilter,
  }) async {
    final supabase = ref.read(supabaseClientProvider);
    
    var query = supabase
        .from('returns')
        .select('''
          *,
          order:orders(id, order_number, customer_name, customer_email)
        ''', const FetchOptions(count: CountOption.exact));
    
    if (statusFilter != null) {
      query = query.eq('status', statusFilter.value);
    }
    
    query = query.order('created_at', ascending: false);
    
    final response = await query;
    
    final returns = (response.data as List).map((e) {
      final order = e['order'];
      return ReturnAdmin(
        id: e['id'],
        orderId: e['order_id'],
        orderNumber: order?['order_number'] ?? 'N/A',
        customerName: order?['customer_name'] ?? 'Desconocido',
        customerEmail: order?['customer_email'] ?? '',
        reason: e['reason'],
        items: (e['items'] as List?)?.map((i) => ReturnItemAdmin.fromJson(i)).toList() ?? [],
        status: ReturnStatus.values.firstWhere(
          (s) => s.value == e['status'],
          orElse: () => ReturnStatus.requested,
        ),
        refundAmount: (e['refund_amount'] as num?)?.toDouble(),
        adminNotes: e['admin_notes'],
        trackingNumber: e['tracking_number'],
        labelUrl: e['label_url'],
        createdAt: DateTime.parse(e['created_at']),
        updatedAt: e['updated_at'] != null ? DateTime.parse(e['updated_at']) : null,
        completedAt: e['completed_at'] != null ? DateTime.parse(e['completed_at']) : null,
      );
    }).toList();
    
    // Contar por estado
    final statusCounts = <ReturnStatus, int>{};
    for (final status in ReturnStatus.values) {
      final countResponse = await supabase
          .from('returns')
          .select('*', const FetchOptions(count: CountOption.exact, head: true))
          .eq('status', status.value);
      statusCounts[status] = countResponse.count ?? 0;
    }
    
    return ReturnsListResult(
      returns: returns,
      totalCount: response.count ?? 0,
      statusCounts: statusCounts,
    );
  }
}

class ReturnsListResult {
  final List<ReturnAdmin> returns;
  final int totalCount;
  final Map<ReturnStatus, int> statusCounts;
  
  const ReturnsListResult({
    required this.returns,
    required this.totalCount,
    required this.statusCounts,
  });
}

/// Provider para detalle de devolución
@riverpod
Future<ReturnAdmin?> adminReturnDetail(Ref ref, String returnId) async {
  final supabase = ref.read(supabaseClientProvider);
  
  final response = await supabase
      .from('returns')
      .select('''
        *,
        order:orders(
          id,
          order_number,
          customer_name,
          customer_email,
          items:order_items(*, product:products(id, name, images))
        )
      ''')
      .eq('id', returnId)
      .maybeSingle();
  
  if (response == null) return null;
  
  final order = response['order'];
  final items = (response['items'] as List?)?.map((i) {
    // Buscar el item del pedido correspondiente
    final orderItems = order?['items'] as List? ?? [];
    final orderItem = orderItems.firstWhere(
      (oi) => oi['id'] == i['order_item_id'],
      orElse: () => null,
    );
    
    return ReturnItemAdmin(
      orderItemId: i['order_item_id'],
      productName: orderItem?['product']?['name'] ?? 'Producto',
      size: orderItem?['size'] ?? '',
      quantity: i['quantity'],
      unitPrice: (orderItem?['unit_price'] as num?)?.toDouble() ?? 0,
      reason: i['reason'],
      imageUrl: (orderItem?['product']?['images'] as List?)?.firstOrNull,
    );
  }).toList() ?? [];
  
  return ReturnAdmin(
    id: response['id'],
    orderId: response['order_id'],
    orderNumber: order?['order_number'] ?? 'N/A',
    customerName: order?['customer_name'] ?? 'Desconocido',
    customerEmail: order?['customer_email'] ?? '',
    reason: response['reason'],
    items: items,
    status: ReturnStatus.values.firstWhere(
      (s) => s.value == response['status'],
      orElse: () => ReturnStatus.requested,
    ),
    refundAmount: (response['refund_amount'] as num?)?.toDouble(),
    adminNotes: response['admin_notes'],
    trackingNumber: response['tracking_number'],
    labelUrl: response['label_url'],
    createdAt: DateTime.parse(response['created_at']),
    updatedAt: response['updated_at'] != null ? DateTime.parse(response['updated_at']) : null,
    completedAt: response['completed_at'] != null ? DateTime.parse(response['completed_at']) : null,
  );
}

/// Provider para acciones de devoluciones
@riverpod
class ReturnActions extends _$ReturnActions {
  @override
  FutureOr<void> build() {}
  
  /// Aprobar devolución
  Future<void> approve(String returnId, {String? notes}) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('returns')
        .update({
          'status': 'approved',
          'admin_notes': notes,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', returnId);
    
    // También actualizar estado del pedido
    final returnData = await supabase
        .from('returns')
        .select('order_id')
        .eq('id', returnId)
        .single();
    
    await supabase
        .from('orders')
        .update({'status': 'return_approved'})
        .eq('id', returnData['order_id']);
    
    ref.invalidate(adminReturnsListProvider);
    ref.invalidate(adminReturnDetailProvider(returnId));
  }
  
  /// Rechazar devolución
  Future<void> reject(String returnId, String reason) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('returns')
        .update({
          'status': 'rejected',
          'admin_notes': reason,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', returnId);
    
    ref.invalidate(adminReturnsListProvider);
    ref.invalidate(adminReturnDetailProvider(returnId));
  }
  
  /// Marcar como recibida
  Future<void> markAsReceived(String returnId) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase
        .from('returns')
        .update({
          'status': 'received',
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', returnId);
    
    // Actualizar estado del pedido
    final returnData = await supabase
        .from('returns')
        .select('order_id')
        .eq('id', returnId)
        .single();
    
    await supabase
        .from('orders')
        .update({'status': 'return_received'})
        .eq('id', returnData['order_id']);
    
    ref.invalidate(adminReturnsListProvider);
    ref.invalidate(adminReturnDetailProvider(returnId));
  }
  
  /// Completar devolución (procesar reembolso)
  Future<void> complete(String returnId, double refundAmount) async {
    final supabase = ref.read(supabaseClientProvider);
    
    // Llamar al RPC que procesa el reembolso
    await supabase.rpc('complete_return', params: {
      'p_return_id': returnId,
      'p_refund_amount': refundAmount,
    });
    
    ref.invalidate(adminReturnsListProvider);
    ref.invalidate(adminReturnDetailProvider(returnId));
  }
}
```

---

## 6. Provider de Cupones y Promociones

```dart
// lib/features/admin/coupons/providers/admin_coupons_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/supabase_provider.dart';
import '../models/coupon_admin.dart';

part 'admin_coupons_provider.g.dart';

@riverpod
class AdminCouponsList extends _$AdminCouponsList {
  @override
  FutureOr<List<CouponAdmin>> build() async {
    final supabase = ref.read(supabaseClientProvider);
    
    final response = await supabase
        .from('coupons')
        .select()
        .order('created_at', ascending: false);
    
    return (response as List).map((e) => CouponAdmin.fromJson(e)).toList();
  }
  
  Future<void> createCoupon(CouponFormData data) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase.from('coupons').insert({
      'code': data.code.toUpperCase(),
      'discount_type': data.discountType.value,
      'discount_value': data.discountValue,
      'min_purchase': data.minPurchase,
      'max_uses': data.maxUses,
      'valid_from': data.validFrom?.toIso8601String(),
      'valid_until': data.validUntil?.toIso8601String(),
      'is_active': data.isActive,
    });
    
    ref.invalidateSelf();
  }
  
  Future<void> updateCoupon(String id, CouponFormData data) async {
    final supabase = ref.read(supabaseClientProvider);
    
    await supabase.from('coupons').update({
      'code': data.code.toUpperCase(),
      'discount_type': data.discountType.value,
      'discount_value': data.discountValue,
      'min_purchase': data.minPurchase,
      'max_uses': data.maxUses,
      'valid_from': data.validFrom?.toIso8601String(),
      'valid_until': data.validUntil?.toIso8601String(),
      'is_active': data.isActive,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', id);
    
    ref.invalidateSelf();
  }
  
  Future<void> deleteCoupon(String id) async {
    final supabase = ref.read(supabaseClientProvider);
    await supabase.from('coupons').delete().eq('id', id);
    ref.invalidateSelf();
  }
  
  Future<void> toggleActive(String id, bool isActive) async {
    final supabase = ref.read(supabaseClientProvider);
    await supabase.from('coupons').update({'is_active': isActive}).eq('id', id);
    ref.invalidateSelf();
  }
}

class CouponFormData {
  final String code;
  final DiscountType discountType;
  final double discountValue;
  final double? minPurchase;
  final int? maxUses;
  final DateTime? validFrom;
  final DateTime? validUntil;
  final bool isActive;
  
  const CouponFormData({
    required this.code,
    required this.discountType,
    required this.discountValue,
    this.minPurchase,
    this.maxUses,
    this.validFrom,
    this.validUntil,
    this.isActive = true,
  });
}
```

---

## 7. Checklist de Backend

### Providers de Autenticación
- [ ] `AdminAuthProvider` con verificación de roles
- [ ] `isAdminUser` provider simple
- [ ] Método `hasPermission` funcional

### Providers de Dashboard
- [ ] `dashboardAnalytics` con queries paralelas
- [ ] `MonthlyRevenue` con comparación
- [ ] `DailySales` para gráfico
- [ ] `LowStockProducts` con filtro
- [ ] `RecentOrders` limitado

### Providers de Entidades
- [ ] `AdminProductsList` con filtros y paginación
- [ ] `AdminOrdersList` con estado y búsqueda
- [ ] `AdminReturnsList` con conteos por estado
- [ ] `AdminCouponsList` con CRUD completo
- [ ] `AdminPromotionsList` con templates

### Providers de Mutaciones
- [ ] `ProductMutations` (create/update)
- [ ] `OrderActions` (status/shipping/cancel)
- [ ] `ReturnActions` (approve/reject/complete)
- [ ] Invalidación correcta de cache
