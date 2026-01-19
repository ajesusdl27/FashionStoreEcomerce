# Módulo 4: Panel de Administración - Fase 1: Preparación

## 1. Modelos de Datos Completos

### 1.1 Modelos de Analytics

```dart
// lib/features/admin/common/models/analytics_data.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'analytics_data.freezed.dart';
part 'analytics_data.g.dart';

/// Datos completos del dashboard
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
  
  factory AnalyticsData.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsDataFromJson(json);
}

/// Ingresos mensuales con comparación
@freezed
class MonthlyRevenue with _$MonthlyRevenue {
  const factory MonthlyRevenue({
    required double total,
    required int orderCount,
    required double trend,
    required RevenueComparison comparison,
  }) = _MonthlyRevenue;
  
  factory MonthlyRevenue.fromJson(Map<String, dynamic> json) =>
      _$MonthlyRevenueFromJson(json);
}

@freezed
class RevenueComparison with _$RevenueComparison {
  const factory RevenueComparison({
    required double current,
    required double previous,
    required double difference,
  }) = _RevenueComparison;
  
  factory RevenueComparison.fromJson(Map<String, dynamic> json) =>
      _$RevenueComparisonFromJson(json);
}

/// Información de pedidos pendientes
@freezed
class PendingOrdersInfo with _$PendingOrdersInfo {
  const factory PendingOrdersInfo({
    required int total,
    required int pending,
    required int paid,
    required List<OrderSummary> orders,
  }) = _PendingOrdersInfo;
  
  factory PendingOrdersInfo.fromJson(Map<String, dynamic> json) =>
      _$PendingOrdersInfoFromJson(json);
}

/// Resumen de pedido para listados
@freezed
class OrderSummary with _$OrderSummary {
  const factory OrderSummary({
    required String id,
    required String orderNumber,
    required String customerName,
    required double totalAmount,
    required OrderStatus status,
    required DateTime createdAt,
  }) = _OrderSummary;
  
  factory OrderSummary.fromJson(Map<String, dynamic> json) =>
      _$OrderSummaryFromJson(json);
}

/// Producto más vendido
@freezed
class BestSellingProduct with _$BestSellingProduct {
  const factory BestSellingProduct({
    required String productId,
    required String productName,
    required double productPrice,
    double? offerPrice,
    required int totalQuantity,
    required double totalRevenue,
  }) = _BestSellingProduct;
  
  factory BestSellingProduct.fromJson(Map<String, dynamic> json) =>
      _$BestSellingProductFromJson(json);
}

/// Ventas diarias para gráfico
@freezed
class DailySales with _$DailySales {
  const factory DailySales({
    required DateTime date,
    required String label,
    required double revenue,
    required int orderCount,
  }) = _DailySales;
  
  factory DailySales.fromJson(Map<String, dynamic> json) =>
      _$DailySalesFromJson(json);
}

/// Producto con stock bajo
@freezed
class LowStockProduct with _$LowStockProduct {
  const factory LowStockProduct({
    required String id,
    required String name,
    required String? imageUrl,
    required int totalStock,
    required List<VariantStock> variants,
  }) = _LowStockProduct;
  
  factory LowStockProduct.fromJson(Map<String, dynamic> json) =>
      _$LowStockProductFromJson(json);
}

@freezed
class VariantStock with _$VariantStock {
  const factory VariantStock({
    required String size,
    required int stock,
  }) = _VariantStock;
  
  factory VariantStock.fromJson(Map<String, dynamic> json) =>
      _$VariantStockFromJson(json);
}
```

### 1.2 Modelo de Usuario Admin

```dart
// lib/features/admin/common/models/admin_user.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'admin_user.freezed.dart';
part 'admin_user.g.dart';

@freezed
class AdminUser with _$AdminUser {
  const AdminUser._();
  
  const factory AdminUser({
    required String id,
    required String userId,
    required AdminRole role,
    String? name,
    String? email,
    required DateTime createdAt,
    DateTime? lastLoginAt,
  }) = _AdminUser;
  
  factory AdminUser.fromJson(Map<String, dynamic> json) =>
      _$AdminUserFromJson(json);
  
  /// Verifica si tiene un permiso específico
  bool hasPermission(AdminPermission permission) {
    return switch (role) {
      AdminRole.superAdmin => true,
      AdminRole.admin => permission != AdminPermission.manageAdmins,
      AdminRole.editor => _editorPermissions.contains(permission),
      AdminRole.viewer => permission == AdminPermission.viewDashboard ||
                          permission == AdminPermission.viewOrders,
    };
  }
  
  static const _editorPermissions = {
    AdminPermission.viewDashboard,
    AdminPermission.manageProducts,
    AdminPermission.manageCategories,
    AdminPermission.viewOrders,
  };
}

@JsonEnum(valueField: 'value')
enum AdminRole {
  superAdmin('super_admin'),
  admin('admin'),
  editor('editor'),
  viewer('viewer');
  
  final String value;
  const AdminRole(this.value);
  
  String get displayName => switch (this) {
    AdminRole.superAdmin => 'Super Admin',
    AdminRole.admin => 'Administrador',
    AdminRole.editor => 'Editor',
    AdminRole.viewer => 'Solo lectura',
  };
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

### 1.3 Modelo de Promoción Completo

```dart
// lib/features/admin/promotions/models/promotion.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'promotion.freezed.dart';
part 'promotion.g.dart';

@freezed
class Promotion with _$Promotion {
  const Promotion._();
  
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
    @Default(10) int priority,
    required PromotionStyleConfig styleConfig,
    required DateTime startDate,
    DateTime? endDate,
    @Default(true) bool isActive,
    String? templateId,
    @Default([]) List<PromotionRule> rules,
    required DateTime createdAt,
    DateTime? updatedAt,
  }) = _Promotion;
  
  factory Promotion.fromJson(Map<String, dynamic> json) =>
      _$PromotionFromJson(json);
  
  /// Estado calculado de la promoción
  PromotionStatus get status {
    if (!isActive) return PromotionStatus.inactive;
    
    final now = DateTime.now();
    if (startDate.isAfter(now)) return PromotionStatus.scheduled;
    if (endDate != null && endDate!.isBefore(now)) return PromotionStatus.expired;
    
    return PromotionStatus.active;
  }
  
  /// Días restantes (null si no tiene fecha de fin)
  int? get daysRemaining {
    if (endDate == null) return null;
    final diff = endDate!.difference(DateTime.now());
    return diff.inDays;
  }
}

@JsonEnum(valueField: 'value')
enum CtaLinkType {
  products('products'),
  offers('offers'),
  category('category'),
  product('product');
  
  final String value;
  const CtaLinkType(this.value);
}

@JsonEnum(valueField: 'value')
enum PromotionLocation {
  homeHero('home_hero'),
  announcementTop('announcement_top'),
  cartSidebar('cart_sidebar'),
  productPage('product_page');
  
  final String value;
  const PromotionLocation(this.value);
  
  String get displayName => switch (this) {
    PromotionLocation.homeHero => 'Banner Principal',
    PromotionLocation.announcementTop => 'Barra de Anuncios',
    PromotionLocation.cartSidebar => 'Sidebar Carrito',
    PromotionLocation.productPage => 'Página de Producto',
  };
}

enum PromotionStatus {
  active,
  inactive,
  scheduled,
  expired,
}

@freezed
class PromotionStyleConfig with _$PromotionStyleConfig {
  const factory PromotionStyleConfig({
    @Default(TextColorOption.white) TextColorOption textColor,
    @Default(TextAlignOption.left) TextAlignOption textAlign,
    @Default(true) bool overlayEnabled,
    @Default(OverlayPosition.left) OverlayPosition overlayPosition,
    @Default(50) int overlayOpacity,
  }) = _PromotionStyleConfig;
  
  factory PromotionStyleConfig.fromJson(Map<String, dynamic> json) =>
      _$PromotionStyleConfigFromJson(json);
}

enum TextColorOption { white, black }
enum TextAlignOption { left, center, right }
enum OverlayPosition { left, center, right, full }

/// Regla de visualización de promoción
@freezed
class PromotionRule with _$PromotionRule {
  const factory PromotionRule({
    required String id,
    required PromotionRuleType type,
    RuleOperator? operator,
    required dynamic value,
  }) = _PromotionRule;
  
  factory PromotionRule.fromJson(Map<String, dynamic> json) =>
      _$PromotionRuleFromJson(json);
}

@JsonEnum(valueField: 'value')
enum PromotionRuleType {
  cartValue('cart_value'),
  dayOfWeek('day_of_week'),
  firstVisit('first_visit'),
  newCustomer('new_customer'),
  returningCustomer('returning_customer');
  
  final String value;
  const PromotionRuleType(this.value);
  
  String get displayName => switch (this) {
    PromotionRuleType.cartValue => 'Valor del carrito',
    PromotionRuleType.dayOfWeek => 'Día de la semana',
    PromotionRuleType.firstVisit => 'Primera visita',
    PromotionRuleType.newCustomer => 'Cliente nuevo',
    PromotionRuleType.returningCustomer => 'Cliente recurrente',
  };
  
  String get description => switch (this) {
    PromotionRuleType.cartValue => 'El total del carrito supera/no supera un valor',
    PromotionRuleType.dayOfWeek => 'Solo ciertos días de la semana',
    PromotionRuleType.firstVisit => 'Solo visitantes nuevos',
    PromotionRuleType.newCustomer => 'Usuario que no ha comprado antes',
    PromotionRuleType.returningCustomer => 'Usuario con compras previas',
  };
  
  String get icon => switch (this) {
    PromotionRuleType.cartValue => '🛒',
    PromotionRuleType.dayOfWeek => '📅',
    PromotionRuleType.firstVisit => '👋',
    PromotionRuleType.newCustomer => '🆕',
    PromotionRuleType.returningCustomer => '🔄',
  };
}

enum RuleOperator { greaterThan, lessThan, equals }
```

### 1.4 Templates de Promoción

```dart
// lib/features/admin/promotions/models/promotion_template.dart

import 'promotion.dart';

class PromotionTemplate {
  final String id;
  final String name;
  final String emoji;
  final String description;
  final TemplateCategory category;
  final String? previewImagePath;
  final PromotionDefaults defaults;
  
  const PromotionTemplate({
    required this.id,
    required this.name,
    required this.emoji,
    required this.description,
    required this.category,
    this.previewImagePath,
    required this.defaults,
  });
}

enum TemplateCategory { seasonal, permanent, special }

class PromotionDefaults {
  final String title;
  final String? description;
  final String ctaText;
  final String ctaLink;
  final PromotionStyleConfig styleConfig;
  final int? suggestedDurationDays;
  final List<PromotionLocation> suggestedLocations;
  
  const PromotionDefaults({
    required this.title,
    this.description,
    required this.ctaText,
    required this.ctaLink,
    required this.styleConfig,
    this.suggestedDurationDays,
    required this.suggestedLocations,
  });
}

/// Templates predefinidos
const promotionTemplates = [
  PromotionTemplate(
    id: 'rebajas',
    name: 'Rebajas',
    emoji: '🛍️',
    description: 'Descuento general de temporada. Ideal para rebajas de verano o invierno.',
    category: TemplateCategory.seasonal,
    defaults: PromotionDefaults(
      title: '¡REBAJAS!',
      description: 'Hasta -50% en artículos seleccionados',
      ctaText: '¡Comprar ahora!',
      ctaLink: '/ofertas',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.left,
        overlayEnabled: true,
        overlayPosition: OverlayPosition.left,
        overlayOpacity: 60,
      ),
      suggestedDurationDays: 30,
      suggestedLocations: [PromotionLocation.homeHero, PromotionLocation.announcementTop],
    ),
  ),
  PromotionTemplate(
    id: 'san-valentin',
    name: 'San Valentín',
    emoji: '💝',
    description: 'Campaña romántica para febrero.',
    category: TemplateCategory.seasonal,
    defaults: PromotionDefaults(
      title: 'Especial San Valentín',
      description: 'Regala con amor. Encuentra el regalo perfecto.',
      ctaText: 'Ver regalos',
      ctaLink: '/productos',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.center,
        overlayEnabled: true,
        overlayPosition: OverlayPosition.center,
        overlayOpacity: 50,
      ),
      suggestedDurationDays: 14,
      suggestedLocations: [PromotionLocation.homeHero],
    ),
  ),
  PromotionTemplate(
    id: 'black-friday',
    name: 'Black Friday',
    emoji: '🖤',
    description: 'El evento de descuentos más esperado del año.',
    category: TemplateCategory.special,
    defaults: PromotionDefaults(
      title: 'BLACK FRIDAY',
      description: 'Los mejores descuentos del año. Solo por tiempo limitado.',
      ctaText: '¡No te lo pierdas!',
      ctaLink: '/ofertas',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.left,
        overlayEnabled: true,
        overlayPosition: OverlayPosition.left,
        overlayOpacity: 70,
      ),
      suggestedDurationDays: 4,
      suggestedLocations: [
        PromotionLocation.homeHero,
        PromotionLocation.announcementTop,
        PromotionLocation.productPage,
      ],
    ),
  ),
  PromotionTemplate(
    id: 'navidad',
    name: 'Navidad',
    emoji: '🎄',
    description: 'Campaña navideña con espíritu festivo.',
    category: TemplateCategory.seasonal,
    defaults: PromotionDefaults(
      title: 'Felices Fiestas',
      description: 'Descubre nuestra colección navideña.',
      ctaText: 'Ver colección',
      ctaLink: '/productos',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.center,
        overlayEnabled: true,
        overlayPosition: OverlayPosition.center,
        overlayOpacity: 55,
      ),
      suggestedDurationDays: 25,
      suggestedLocations: [PromotionLocation.homeHero, PromotionLocation.announcementTop],
    ),
  ),
  PromotionTemplate(
    id: 'nueva-coleccion',
    name: 'Nueva Colección',
    emoji: '🆕',
    description: 'Lanzamiento de nueva temporada.',
    category: TemplateCategory.permanent,
    defaults: PromotionDefaults(
      title: 'Nueva Colección',
      description: 'Descubre las últimas tendencias.',
      ctaText: 'Explorar',
      ctaLink: '/productos',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.left,
        overlayEnabled: true,
        overlayPosition: OverlayPosition.left,
        overlayOpacity: 45,
      ),
      suggestedDurationDays: 60,
      suggestedLocations: [PromotionLocation.homeHero],
    ),
  ),
  PromotionTemplate(
    id: 'envio-gratis',
    name: 'Envío Gratis',
    emoji: '🚚',
    description: 'Promoción de envío gratuito.',
    category: TemplateCategory.permanent,
    defaults: PromotionDefaults(
      title: 'Envío Gratis',
      description: 'En pedidos superiores a 50€',
      ctaText: 'Comprar',
      ctaLink: '/productos',
      styleConfig: PromotionStyleConfig(
        textColor: TextColorOption.white,
        textAlign: TextAlignOption.center,
        overlayEnabled: false,
        overlayPosition: OverlayPosition.full,
        overlayOpacity: 0,
      ),
      suggestedLocations: [PromotionLocation.announcementTop],
    ),
  ),
];
```

### 1.5 Modelo de Cupón Admin

```dart
// lib/features/admin/coupons/models/coupon_admin.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'coupon_admin.freezed.dart';
part 'coupon_admin.g.dart';

@freezed
class CouponAdmin with _$CouponAdmin {
  const CouponAdmin._();
  
  const factory CouponAdmin({
    required String id,
    required String code,
    required DiscountType discountType,
    required double discountValue,
    double? minPurchase,
    int? maxUses,
    @Default(0) int usesCount,
    DateTime? validFrom,
    DateTime? validUntil,
    @Default(true) bool isActive,
    required DateTime createdAt,
    DateTime? updatedAt,
  }) = _CouponAdmin;
  
  factory CouponAdmin.fromJson(Map<String, dynamic> json) =>
      _$CouponAdminFromJson(json);
  
  /// Estado calculado del cupón
  CouponStatus get status {
    if (!isActive) return CouponStatus.inactive;
    
    final now = DateTime.now();
    
    if (validUntil != null && validUntil!.isBefore(now)) {
      return CouponStatus.expired;
    }
    
    if (maxUses != null && usesCount >= maxUses!) {
      return CouponStatus.exhausted;
    }
    
    if (validFrom != null && validFrom!.isAfter(now)) {
      return CouponStatus.scheduled;
    }
    
    return CouponStatus.active;
  }
  
  /// Usos restantes (null si ilimitado)
  int? get usesRemaining {
    if (maxUses == null) return null;
    return maxUses! - usesCount;
  }
  
  /// Texto de descuento formateado
  String get discountText {
    if (discountType == DiscountType.percentage) {
      return '${discountValue.toStringAsFixed(0)}%';
    }
    return '${discountValue.toStringAsFixed(2)}€';
  }
}

@JsonEnum(valueField: 'value')
enum DiscountType {
  percentage('percentage'),
  fixed('fixed');
  
  final String value;
  const DiscountType(this.value);
  
  String get displayName => switch (this) {
    DiscountType.percentage => 'Porcentaje',
    DiscountType.fixed => 'Cantidad fija',
  };
}

enum CouponStatus {
  active,
  inactive,
  expired,
  exhausted,
  scheduled,
}

extension CouponStatusX on CouponStatus {
  String get displayName => switch (this) {
    CouponStatus.active => 'Activo',
    CouponStatus.inactive => 'Inactivo',
    CouponStatus.expired => 'Expirado',
    CouponStatus.exhausted => 'Agotado',
    CouponStatus.scheduled => 'Programado',
  };
  
  String get colorName => switch (this) {
    CouponStatus.active => 'green',
    CouponStatus.inactive => 'gray',
    CouponStatus.expired => 'red',
    CouponStatus.exhausted => 'orange',
    CouponStatus.scheduled => 'blue',
  };
}
```

### 1.6 Modelo de Devolución Admin

```dart
// lib/features/admin/returns/models/return_admin.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'return_admin.freezed.dart';
part 'return_admin.g.dart';

@freezed
class ReturnAdmin with _$ReturnAdmin {
  const factory ReturnAdmin({
    required String id,
    required String orderId,
    required String orderNumber,
    required String customerName,
    required String customerEmail,
    required String reason,
    required List<ReturnItemAdmin> items,
    required ReturnStatus status,
    double? refundAmount,
    String? adminNotes,
    String? trackingNumber,
    String? labelUrl,
    required DateTime createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
  }) = _ReturnAdmin;
  
  factory ReturnAdmin.fromJson(Map<String, dynamic> json) =>
      _$ReturnAdminFromJson(json);
}

@freezed
class ReturnItemAdmin with _$ReturnItemAdmin {
  const factory ReturnItemAdmin({
    required String orderItemId,
    required String productName,
    required String size,
    required int quantity,
    required double unitPrice,
    String? reason,
    String? imageUrl,
  }) = _ReturnItemAdmin;
  
  factory ReturnItemAdmin.fromJson(Map<String, dynamic> json) =>
      _$ReturnItemAdminFromJson(json);
}

@JsonEnum(valueField: 'value')
enum ReturnStatus {
  requested('requested'),
  approved('approved'),
  rejected('rejected'),
  shipped('shipped'),
  received('received'),
  completed('completed');
  
  final String value;
  const ReturnStatus(this.value);
  
  String get displayName => switch (this) {
    ReturnStatus.requested => 'Solicitada',
    ReturnStatus.approved => 'Aprobada',
    ReturnStatus.rejected => 'Rechazada',
    ReturnStatus.shipped => 'En tránsito',
    ReturnStatus.received => 'Recibida',
    ReturnStatus.completed => 'Completada',
  };
  
  String get colorName => switch (this) {
    ReturnStatus.requested => 'yellow',
    ReturnStatus.approved => 'blue',
    ReturnStatus.rejected => 'red',
    ReturnStatus.shipped => 'purple',
    ReturnStatus.received => 'indigo',
    ReturnStatus.completed => 'green',
  };
  
  /// Siguiente estado posible
  ReturnStatus? get nextStatus => switch (this) {
    ReturnStatus.requested => ReturnStatus.approved,
    ReturnStatus.approved => ReturnStatus.shipped,
    ReturnStatus.shipped => ReturnStatus.received,
    ReturnStatus.received => ReturnStatus.completed,
    ReturnStatus.rejected => null,
    ReturnStatus.completed => null,
  };
}
```

### 1.7 Modelo de Configuración

```dart
// lib/features/admin/settings/models/store_settings.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'store_settings.freezed.dart';
part 'store_settings.g.dart';

@freezed
class StoreSettings with _$StoreSettings {
  const factory StoreSettings({
    // Información de la tienda
    @Default('FashionStore') String storeName,
    String? storeEmail,
    String? storePhone,
    
    // Configuración de envío
    @Default(50.0) double shippingFreeThreshold,
    @Default(4.95) double shippingStandardCost,
    
    // Ofertas
    @Default(true) bool offersEnabled,
    DateTime? flashOffersEnd,
    
    // Redes sociales
    String? instagramUrl,
    String? facebookUrl,
    String? twitterUrl,
    
    // Legal
    String? privacyPolicyUrl,
    String? termsUrl,
    String? returnsPolicy,
  }) = _StoreSettings;
  
  factory StoreSettings.fromJson(Map<String, dynamic> json) =>
      _$StoreSettingsFromJson(json);
  
  /// Convierte a mapa para guardar en la tabla key-value
  Map<String, dynamic> toSettingsMap() {
    return {
      'store_name': storeName,
      'store_email': storeEmail,
      'store_phone': storePhone,
      'shipping_free_threshold': shippingFreeThreshold,
      'shipping_standard_cost': shippingStandardCost,
      'offers_enabled': offersEnabled,
      'flash_offers_end': flashOffersEnd?.toIso8601String(),
      'instagram_url': instagramUrl,
      'facebook_url': facebookUrl,
      'twitter_url': twitterUrl,
      'privacy_policy_url': privacyPolicyUrl,
      'terms_url': termsUrl,
      'returns_policy': returnsPolicy,
    };
  }
  
  /// Crea desde la tabla de settings (key-value)
  factory StoreSettings.fromSettingsRows(List<Map<String, dynamic>> rows) {
    final map = <String, dynamic>{};
    
    for (final row in rows) {
      final key = row['key'] as String;
      // Determinar qué valor usar
      if (row['value_bool'] != null) {
        map[key] = row['value_bool'];
      } else if (row['value_number'] != null) {
        map[key] = row['value_number'];
      } else {
        map[key] = row['value'];
      }
    }
    
    return StoreSettings(
      storeName: map['store_name'] as String? ?? 'FashionStore',
      storeEmail: map['store_email'] as String?,
      storePhone: map['store_phone'] as String?,
      shippingFreeThreshold: (map['shipping_free_threshold'] as num?)?.toDouble() ?? 50.0,
      shippingStandardCost: (map['shipping_standard_cost'] as num?)?.toDouble() ?? 4.95,
      offersEnabled: map['offers_enabled'] as bool? ?? true,
      flashOffersEnd: map['flash_offers_end'] != null
          ? DateTime.tryParse(map['flash_offers_end'] as String)
          : null,
      instagramUrl: map['instagram_url'] as String?,
      facebookUrl: map['facebook_url'] as String?,
      twitterUrl: map['twitter_url'] as String?,
      privacyPolicyUrl: map['privacy_policy_url'] as String?,
      termsUrl: map['terms_url'] as String?,
      returnsPolicy: map['returns_policy'] as String?,
    );
  }
}
```

---

## 2. Configuración del Proyecto

### 2.1 Dependencias (pubspec.yaml)

```yaml
dependencies:
  # ... dependencias existentes ...
  
  # Gráficos para dashboard
  fl_chart: ^0.69.0
  
  # Editor de texto rico para descripciones
  flutter_quill: ^10.8.5
  
  # Tablas de datos avanzadas
  data_table_2: ^2.5.15
  
  # Calendario para promociones
  table_calendar: ^3.1.2
  
  # Reordenamiento de imágenes
  reorderable_grid_view: ^2.2.8
  
  # Wizard/Stepper
  im_stepper: ^1.0.1+1
  
  # Selector de archivos
  file_picker: ^8.1.2
  
  # Exportar CSV (newsletter)
  csv: ^6.0.0
  
  # Formateo de fechas localizado
  intl: ^0.19.0
```

### 2.2 Estructura de Barrels

```dart
// lib/features/admin/admin.dart
/// Barrel file para el módulo admin

// Common
export 'common/models/analytics_data.dart';
export 'common/models/admin_user.dart';
export 'common/providers/admin_auth_provider.dart';
export 'common/widgets/admin_scaffold.dart';
export 'common/widgets/side_menu.dart';
export 'common/widgets/stat_card.dart';

// Dashboard
export 'dashboard/presentation/screens/dashboard_screen.dart';
export 'dashboard/providers/analytics_provider.dart';

// Products
export 'products/presentation/screens/products_list_screen.dart';
export 'products/presentation/screens/product_form_screen.dart';
export 'products/providers/admin_products_provider.dart';

// Categories
export 'categories/presentation/screens/categories_screen.dart';
export 'categories/providers/admin_categories_provider.dart';

// Orders
export 'orders/presentation/screens/orders_list_screen.dart';
export 'orders/presentation/screens/order_detail_screen.dart';
export 'orders/providers/admin_orders_provider.dart';

// Returns
export 'returns/models/return_admin.dart';
export 'returns/presentation/screens/returns_list_screen.dart';
export 'returns/presentation/screens/return_detail_screen.dart';
export 'returns/providers/admin_returns_provider.dart';

// Coupons
export 'coupons/models/coupon_admin.dart';
export 'coupons/presentation/screens/coupons_screen.dart';
export 'coupons/providers/admin_coupons_provider.dart';

// Promotions
export 'promotions/models/promotion.dart';
export 'promotions/models/promotion_template.dart';
export 'promotions/presentation/screens/promotions_list_screen.dart';
export 'promotions/presentation/screens/promotion_wizard_screen.dart';
export 'promotions/providers/admin_promotions_provider.dart';

// Newsletter
export 'newsletter/presentation/screens/newsletter_screen.dart';
export 'newsletter/providers/admin_newsletter_provider.dart';

// Settings
export 'settings/models/store_settings.dart';
export 'settings/presentation/screens/settings_screen.dart';
export 'settings/providers/admin_settings_provider.dart';
```

---

## 3. Checklist de Preparación

### Modelos de Datos
- [ ] `AnalyticsData` y submodelos (MonthlyRevenue, DailySales, etc.)
- [ ] `AdminUser` con roles y permisos
- [ ] `Promotion` con StyleConfig y Rules
- [ ] `PromotionTemplate` (constantes)
- [ ] `CouponAdmin` con status calculado
- [ ] `ReturnAdmin` con workflow de estados
- [ ] `StoreSettings` con serialización key-value

### Configuración
- [ ] Agregar dependencias en pubspec.yaml
- [ ] Ejecutar build_runner para freezed
- [ ] Crear estructura de carpetas
- [ ] Configurar barrel exports

### Verificaciones
- [ ] Modelos compilan sin errores
- [ ] JSON serialización funciona correctamente
- [ ] Enums tienen valores correctos para Supabase
