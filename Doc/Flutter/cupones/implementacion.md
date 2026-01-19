# Módulo Cupones - Implementación Flutter

## 1. Modelo de Datos

```dart
// lib/features/coupons/domain/models/coupon.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'coupon.freezed.dart';
part 'coupon.g.dart';

/// Tipos de descuento
enum DiscountType {
  @JsonValue('fixed')
  fixed,
  @JsonValue('percentage')
  percentage,
}

/// Modelo de cupón completo (admin)
@freezed
class Coupon with _$Coupon {
  const factory Coupon({
    required String id,
    required String code,
    required String stripeCouponId,
    required DiscountType discountType,
    required double discountValue,
    @Default(0) double minPurchaseAmount,
    double? maxDiscountAmount,
    DateTime? startDate,
    DateTime? endDate,
    int? maxUses,
    @Default(0) int currentUses,
    @Default(1) int maxUsesPerCustomer,
    @Default(true) bool isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Coupon;

  factory Coupon.fromJson(Map<String, dynamic> json) => _$CouponFromJson(json);
}

/// Cupón validado (respuesta de validación)
@freezed
class ValidatedCoupon with _$ValidatedCoupon {
  const factory ValidatedCoupon({
    required String id,
    required String stripeCouponId,
    required DiscountType discountType,
    required double discountValue,
    double? maxDiscountAmount,
    required double calculatedDiscount,
  }) = _ValidatedCoupon;

  factory ValidatedCoupon.fromJson(Map<String, dynamic> json) => 
      _$ValidatedCouponFromJson(json);
}

/// Resultado de validación
@freezed
class CouponValidationResult with _$CouponValidationResult {
  const factory CouponValidationResult.valid(ValidatedCoupon coupon) = _Valid;
  const factory CouponValidationResult.invalid(String error) = _Invalid;
  const factory CouponValidationResult.loading() = _Loading;
  const factory CouponValidationResult.initial() = _Initial;
}
```

---

## 2. Repositorio

```dart
// lib/features/coupons/data/repositories/coupons_repository.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/models/coupon.dart';
import '../../../../core/config/supabase_config.dart';

final couponsRepositoryProvider = Provider<CouponsRepository>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return CouponsRepository(supabase);
});

class CouponsRepository {
  final SupabaseClient _supabase;

  CouponsRepository(this._supabase);

  /// Valida un cupón
  Future<CouponValidationResult> validateCoupon({
    required String code,
    required double cartTotal,
    String? customerEmail,
  }) async {
    try {
      final response = await _supabase.rpc('validate_coupon', params: {
        'p_code': code,
        'p_cart_total': cartTotal,
        'p_customer_email': customerEmail,
      });

      final data = response is List ? response.first : response;

      if (data['is_valid'] == true) {
        return CouponValidationResult.valid(
          ValidatedCoupon(
            id: data['coupon_id'],
            stripeCouponId: data['stripe_coupon_id'],
            discountType: data['discount_type'] == 'fixed' 
                ? DiscountType.fixed 
                : DiscountType.percentage,
            discountValue: (data['discount_value'] as num).toDouble(),
            maxDiscountAmount: data['max_discount_amount'] != null 
                ? (data['max_discount_amount'] as num).toDouble() 
                : null,
            calculatedDiscount: (data['calculated_discount'] as num).toDouble(),
          ),
        );
      } else {
        return CouponValidationResult.invalid(
          data['error_message'] ?? 'Código no válido',
        );
      }
    } catch (e) {
      return CouponValidationResult.invalid('Error al validar el cupón');
    }
  }

  /// Registra el uso de un cupón (llamado tras checkout exitoso)
  Future<bool> useCoupon({
    required String couponId,
    required String customerEmail,
    required String orderId,
  }) async {
    try {
      final result = await _supabase.rpc('use_coupon', params: {
        'p_coupon_id': couponId,
        'p_customer_email': customerEmail,
        'p_order_id': orderId,
      });
      return result == true;
    } catch (e) {
      return false;
    }
  }
}
```

---

## 3. Provider de Estado

```dart
// lib/features/coupons/providers/coupon_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/repositories/coupons_repository.dart';
import '../domain/models/coupon.dart';

/// Estado del cupón aplicado en el carrito
@riverpod
class AppliedCoupon extends _$AppliedCoupon {
  @override
  CouponValidationResult build() => const CouponValidationResult.initial();

  /// Valida y aplica un cupón
  Future<void> applyCoupon({
    required String code,
    required double cartTotal,
    String? customerEmail,
  }) async {
    state = const CouponValidationResult.loading();
    
    final repository = ref.read(couponsRepositoryProvider);
    final result = await repository.validateCoupon(
      code: code.toUpperCase().trim(),
      cartTotal: cartTotal,
      customerEmail: customerEmail,
    );
    
    state = result;
  }

  /// Elimina el cupón aplicado
  void removeCoupon() {
    state = const CouponValidationResult.initial();
  }

  /// Obtiene el descuento calculado (0 si no hay cupón válido)
  double get discount {
    return state.maybeWhen(
      valid: (coupon) => coupon.calculatedDiscount,
      orElse: () => 0,
    );
  }

  /// Obtiene el ID del cupón de Stripe (para checkout)
  String? get stripeCouponId {
    return state.maybeWhen(
      valid: (coupon) => coupon.stripeCouponId,
      orElse: () => null,
    );
  }

  /// Verifica si hay un cupón válido aplicado
  bool get hasValidCoupon {
    return state.maybeWhen(
      valid: (_) => true,
      orElse: () => false,
    );
  }
}
```

---

## 4. Widget de Entrada de Cupón

```dart
// lib/features/coupons/presentation/widgets/coupon_input.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../providers/coupon_provider.dart';
import '../../domain/models/coupon.dart';
import '../../../../core/theme/app_spacing.dart';

class CouponInput extends ConsumerStatefulWidget {
  final double cartTotal;
  final String? customerEmail;

  const CouponInput({
    required this.cartTotal,
    this.customerEmail,
    super.key,
  });

  @override
  ConsumerState<CouponInput> createState() => _CouponInputState();
}

class _CouponInputState extends ConsumerState<CouponInput> {
  final _controller = TextEditingController();
  bool _isExpanded = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final couponState = ref.watch(appliedCouponProvider);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusLg,
        side: BorderSide(
          color: theme.colorScheme.outline.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header (clickeable para expandir)
            InkWell(
              onTap: () => setState(() => _isExpanded = !_isExpanded),
              child: Row(
                children: [
                  Icon(
                    LucideIcons.tag,
                    size: 20,
                    color: theme.colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '¿Tienes un código de descuento?',
                    style: theme.textTheme.titleSmall,
                  ),
                  const Spacer(),
                  Icon(
                    _isExpanded 
                        ? LucideIcons.chevronUp 
                        : LucideIcons.chevronDown,
                    size: 20,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  ),
                ],
              ),
            ),

            // Contenido expandible
            if (_isExpanded) ...[
              const SizedBox(height: 16),
              
              // Si ya hay cupón aplicado
              couponState.maybeWhen(
                valid: (coupon) => _AppliedCouponBanner(
                  coupon: coupon,
                  onRemove: () {
                    ref.read(appliedCouponProvider.notifier).removeCoupon();
                    _controller.clear();
                  },
                ),
                orElse: () => _CouponForm(
                  controller: _controller,
                  cartTotal: widget.cartTotal,
                  customerEmail: widget.customerEmail,
                  state: couponState,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CouponForm extends ConsumerWidget {
  final TextEditingController controller;
  final double cartTotal;
  final String? customerEmail;
  final CouponValidationResult state;

  const _CouponForm({
    required this.controller,
    required this.cartTotal,
    required this.customerEmail,
    required this.state,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isLoading = state is _Loading;
    final errorMessage = state.maybeWhen(
      invalid: (error) => error,
      orElse: () => null,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  hintText: 'Introduce tu código',
                  errorText: errorMessage,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                enabled: !isLoading,
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              height: 48,
              child: FilledButton(
                onPressed: isLoading || controller.text.isEmpty
                    ? null
                    : () {
                        ref.read(appliedCouponProvider.notifier).applyCoupon(
                          code: controller.text,
                          cartTotal: cartTotal,
                          customerEmail: customerEmail,
                        );
                      },
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Aplicar'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _AppliedCouponBanner extends StatelessWidget {
  final ValidatedCoupon coupon;
  final VoidCallback onRemove;

  const _AppliedCouponBanner({
    required this.coupon,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green.withValues(alpha: 0.1),
        borderRadius: AppSpacing.borderRadiusSm,
        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(
            LucideIcons.check,
            size: 20,
            color: Colors.green,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Código aplicado',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: Colors.green,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  _getDiscountText(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.x, size: 18),
            onPressed: onRemove,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
          ),
        ],
      ),
    );
  }

  String _getDiscountText() {
    if (coupon.discountType == DiscountType.percentage) {
      final text = '${coupon.discountValue.toInt()}% de descuento';
      if (coupon.maxDiscountAmount != null) {
        return '$text (máx. ${coupon.maxDiscountAmount!.toStringAsFixed(2)}€)';
      }
      return text;
    } else {
      return '${coupon.discountValue.toStringAsFixed(2)}€ de descuento';
    }
  }
}
```

---

## 5. Integración en Checkout

```dart
// En el resumen del carrito/checkout

class CartSummary extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartTotal = ref.watch(cartTotalProvider);
    final couponState = ref.watch(appliedCouponProvider);
    final discount = ref.watch(appliedCouponProvider.notifier).discount;
    
    final finalTotal = cartTotal - discount;

    return Column(
      children: [
        // ... otros items del resumen
        
        // Descuento (si hay cupón)
        couponState.maybeWhen(
          valid: (coupon) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Descuento'),
                Text(
                  '-${coupon.calculatedDiscount.toStringAsFixed(2)}€',
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          orElse: () => const SizedBox.shrink(),
        ),
        
        // Total final
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
            Text(
              '${finalTotal.toStringAsFixed(2)}€',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
```

---

## 6. Enviar Cupón a Stripe Checkout

```dart
// En el provider de checkout

Future<String> createCheckoutSession() async {
  final stripeCouponId = ref.read(appliedCouponProvider.notifier).stripeCouponId;
  
  final response = await _apiClient.post('/api/checkout/session', {
    'items': cartItems.map((i) => i.toJson()).toList(),
    'couponId': stripeCouponId,  // ID del cupón de Stripe
    // ... otros datos
  });
  
  return response['sessionUrl'];
}
```

---

## 7. Checklist de Implementación

### Modelos
- [ ] `Coupon` - Modelo completo del cupón
- [ ] `ValidatedCoupon` - Cupón con descuento calculado
- [ ] `CouponValidationResult` - Sealed class para estados

### Repositorio
- [ ] `validateCoupon()` - Llama a RPC de Supabase
- [ ] `useCoupon()` - Registra uso tras checkout

### Providers
- [ ] `appliedCouponProvider` - Estado del cupón aplicado
- [ ] Métodos: `applyCoupon`, `removeCoupon`
- [ ] Getters: `discount`, `stripeCouponId`, `hasValidCoupon`

### Widgets
- [ ] `CouponInput` - Widget expandible para código
- [ ] `_CouponForm` - Formulario de entrada
- [ ] `_AppliedCouponBanner` - Banner de cupón aplicado

### Integración
- [ ] Mostrar descuento en resumen del carrito
- [ ] Pasar `stripeCouponId` a la sesión de Stripe
- [ ] Mostrar cupón usado en detalle del pedido
