# Fase 4: Frontend/UI - Carrito y Checkout

## 1. Objetivos de la Fase
- Implementar todas las pantallas del flujo de compra
- Conectar UI con providers
- Implementar navegación completa
- Testing de integración

---

## 2. Pantallas

### 2.1 Cart Screen

**Archivo:** `lib/features/cart/presentation/screens/cart_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import '../widgets/cart_item_tile.dart';
import '../widgets/cart_summary.dart';
import '../widgets/shipping_progress_bar.dart';
import '../../domain/constants/cart_constants.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(cartNotifierProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final shipping = ref.watch(cartShippingProvider);
    final total = ref.watch(cartTotalProvider);
    final itemCount = ref.watch(cartItemCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Mi Carrito ($itemCount)'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (cartItems.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () => _showClearCartDialog(context, ref),
            ),
        ],
      ),
      body: cartItems.isEmpty
          ? _EmptyCart()
          : _CartContent(
              items: cartItems,
              subtotal: subtotal,
              shipping: shipping,
              total: total,
            ),
      bottomNavigationBar: cartItems.isNotEmpty
          ? _CheckoutButton(total: total)
          : null,
    );
  }

  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Vaciar carrito'),
        content: const Text(
          '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              ref.read(cartNotifierProvider.notifier).clearCart();
              Navigator.pop(context);
            },
            child: const Text(
              'Vaciar',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyCart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_cart_outlined,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              'Tu carrito está vacío',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Explora nuestros productos y añade tus favoritos al carrito',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => context.go('/productos'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
              child: const Text('Ver Productos'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CartContent extends ConsumerWidget {
  final List<CartItem> items;
  final double subtotal;
  final double shipping;
  final double total;

  const _CartContent({
    required this.items,
    required this.subtotal,
    required this.shipping,
    required this.total,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final amountToFreeShipping = ref.watch(amountToFreeShippingProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Barra de envío gratis
        ShippingProgressBar(
          currentAmount: subtotal,
          threshold: CartConstants.freeShippingThreshold,
          shippingCost: CartConstants.shippingCost,
        ),
        const SizedBox(height: 24),

        // Lista de items
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: CartItemTile(
            item: item,
            onIncrement: () => ref
                .read(cartNotifierProvider.notifier)
                .incrementQuantity(item.variantId),
            onDecrement: () => ref
                .read(cartNotifierProvider.notifier)
                .decrementQuantity(item.variantId),
            onRemove: () => _confirmRemove(context, ref, item),
          ),
        )),

        const SizedBox(height: 24),

        // Resumen
        CartSummary(
          subtotal: subtotal,
          shipping: shipping,
          total: total,
        ),

        const SizedBox(height: 100), // Espacio para bottom bar
      ],
    );
  }

  void _confirmRemove(BuildContext context, WidgetRef ref, CartItem item) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${item.productName} eliminado'),
        action: SnackBarAction(
          label: 'Deshacer',
          onPressed: () {
            ref.read(cartNotifierProvider.notifier).addItem(item);
          },
        ),
        duration: const Duration(seconds: 3),
      ),
    );
    ref.read(cartNotifierProvider.notifier).removeItem(item.variantId);
  }
}

class _CheckoutButton extends StatelessWidget {
  final double total;

  const _CheckoutButton({required this.total});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => context.push('/checkout'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  'Finalizar compra · ${total.toStringAsFixed(2)}€',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.go('/productos'),
              child: const Text('Seguir comprando →'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2.2 Checkout Screen

**Archivo:** `lib/features/cart/presentation/screens/checkout_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import '../providers/checkout_provider.dart';
import '../providers/payment_provider.dart';
import '../widgets/checkout_stepper.dart';
import '../widgets/contact_form_step.dart';
import '../widgets/shipping_form_step.dart';
import '../widgets/confirmation_step.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final checkoutState = ref.watch(checkoutNotifierProvider);
    final cartItems = ref.watch(cartNotifierProvider);

    // Redirigir si el carrito está vacío
    if (cartItems.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/carrito');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Escuchar cambios de paso para animar PageView
    ref.listen(checkoutNotifierProvider.select((s) => s.currentStep), (prev, next) {
      _pageController.animateToPage(
        next - 1,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (checkoutState.currentStep > 1) {
              ref.read(checkoutNotifierProvider.notifier).previousStep();
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: Column(
        children: [
          // Stepper indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: CheckoutStepper(
              currentStep: checkoutState.currentStep,
              onStepTapped: (step) {
                // Solo permitir ir a pasos anteriores
                if (step < checkoutState.currentStep) {
                  ref.read(checkoutNotifierProvider.notifier).goToStep(step);
                }
              },
            ),
          ),
          
          // Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                ContactFormStep(
                  formData: checkoutState.formData,
                  onChanged: (data) => ref
                      .read(checkoutNotifierProvider.notifier)
                      .updateFormData(data),
                  onNext: () => ref
                      .read(checkoutNotifierProvider.notifier)
                      .nextStep(),
                ),
                ShippingFormStep(
                  formData: checkoutState.formData,
                  onChanged: (data) => ref
                      .read(checkoutNotifierProvider.notifier)
                      .updateFormData(data),
                  onNext: () => ref
                      .read(checkoutNotifierProvider.notifier)
                      .nextStep(),
                  onBack: () => ref
                      .read(checkoutNotifierProvider.notifier)
                      .previousStep(),
                ),
                ConfirmationStep(
                  onBack: () => ref
                      .read(checkoutNotifierProvider.notifier)
                      .previousStep(),
                  onPay: _handlePayment,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handlePayment() async {
    final checkout = ref.read(checkoutNotifierProvider.notifier);
    final payment = ref.read(paymentNotifierProvider.notifier);

    // 1. Crear PaymentIntent
    final success = await checkout.createPaymentIntent();
    if (!success) {
      _showError(ref.read(checkoutNotifierProvider).error ?? 'Error desconocido');
      return;
    }

    // 2. Procesar pago con Stripe
    final paymentSuccess = await payment.processPayment();
    
    if (paymentSuccess) {
      // 3. Navegar a confirmación
      final paymentState = ref.read(paymentNotifierProvider);
      context.go('/checkout/success/${paymentState.orderId}');
      
      // 4. Reset states
      checkout.reset();
      payment.reset();
    } else {
      final paymentState = ref.read(paymentNotifierProvider);
      if (paymentState.status != PaymentStatus.cancelled) {
        _showError(paymentState.error ?? 'Error procesando el pago');
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

### 2.3 Step Widgets

**Archivo:** `lib/features/cart/presentation/widgets/contact_form_step.dart`

```dart
import 'package:flutter/material.dart';
import '../../data/models/checkout_form_data.dart';

class ContactFormStep extends StatefulWidget {
  final CheckoutFormData formData;
  final ValueChanged<CheckoutFormData> onChanged;
  final VoidCallback onNext;

  const ContactFormStep({
    super.key,
    required this.formData,
    required this.onChanged,
    required this.onNext,
  });

  @override
  State<ContactFormStep> createState() => _ContactFormStepState();
}

class _ContactFormStepState extends State<ContactFormStep> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.formData.customerName);
    _emailController = TextEditingController(text: widget.formData.customerEmail);
    _phoneController = TextEditingController(text: widget.formData.customerPhone);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Datos de contacto',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),

            // Nombre
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Nombre completo *',
                hintText: 'Tu nombre y apellidos',
                prefixIcon: Icon(Icons.person_outline),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El nombre es obligatorio';
                }
                return null;
              },
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 16),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email *',
                hintText: 'tu@email.com',
                prefixIcon: Icon(Icons.email_outlined),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El email es obligatorio';
                }
                if (!_isValidEmail(value)) {
                  return 'Introduce un email válido';
                }
                return null;
              },
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 16),

            // Teléfono
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Teléfono (opcional)',
                hintText: '+34 612 345 678',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              keyboardType: TextInputType.phone,
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 32),

            // Botón continuar
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _handleNext,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Continuar'),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward, size: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _updateFormData() {
    widget.onChanged(widget.formData.copyWith(
      customerName: _nameController.text,
      customerEmail: _emailController.text,
      customerPhone: _phoneController.text,
    ));
  }

  void _handleNext() {
    if (_formKey.currentState?.validate() ?? false) {
      widget.onNext();
    }
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}
```

**Archivo:** `lib/features/cart/presentation/widgets/shipping_form_step.dart`

```dart
import 'package:flutter/material.dart';
import '../../data/models/checkout_form_data.dart';

class ShippingFormStep extends StatefulWidget {
  final CheckoutFormData formData;
  final ValueChanged<CheckoutFormData> onChanged;
  final VoidCallback onNext;
  final VoidCallback onBack;

  const ShippingFormStep({
    super.key,
    required this.formData,
    required this.onChanged,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<ShippingFormStep> createState() => _ShippingFormStepState();
}

class _ShippingFormStepState extends State<ShippingFormStep> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _postalCodeController;
  bool _saveAddress = false;

  @override
  void initState() {
    super.initState();
    _addressController = TextEditingController(text: widget.formData.shippingAddress);
    _cityController = TextEditingController(text: widget.formData.shippingCity);
    _postalCodeController = TextEditingController(text: widget.formData.shippingPostalCode);
    _saveAddress = widget.formData.saveAddress;
  }

  @override
  void dispose() {
    _addressController.dispose();
    _cityController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dirección de envío',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),

            // Dirección
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Dirección *',
                hintText: 'Calle, número, piso...',
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
              textCapitalization: TextCapitalization.sentences,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'La dirección es obligatoria';
                }
                return null;
              },
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 16),

            // Ciudad
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(
                labelText: 'Ciudad *',
                hintText: 'Tu ciudad',
                prefixIcon: Icon(Icons.location_city),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'La ciudad es obligatoria';
                }
                return null;
              },
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 16),

            // Código Postal
            TextFormField(
              controller: _postalCodeController,
              decoration: const InputDecoration(
                labelText: 'Código Postal *',
                hintText: '28001',
                prefixIcon: Icon(Icons.markunread_mailbox_outlined),
              ),
              keyboardType: TextInputType.number,
              maxLength: 5,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El código postal es obligatorio';
                }
                if (!RegExp(r'^\d{5}$').hasMatch(value)) {
                  return 'Introduce un código postal válido (5 dígitos)';
                }
                return null;
              },
              onChanged: (_) => _updateFormData(),
            ),
            const SizedBox(height: 16),

            // Checkbox guardar dirección
            CheckboxListTile(
              value: _saveAddress,
              onChanged: (value) {
                setState(() => _saveAddress = value ?? false);
                _updateFormData();
              },
              title: const Text('Guardar dirección para futuras compras'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 32),

            // Botones
            Row(
              children: [
                // Atrás
                TextButton.icon(
                  onPressed: widget.onBack,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Atrás'),
                ),
                const Spacer(),
                
                // Continuar
                ElevatedButton(
                  onPressed: _handleNext,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Continuar'),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward, size: 20),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _updateFormData() {
    widget.onChanged(widget.formData.copyWith(
      shippingAddress: _addressController.text,
      shippingCity: _cityController.text,
      shippingPostalCode: _postalCodeController.text,
      saveAddress: _saveAddress,
    ));
  }

  void _handleNext() {
    if (_formKey.currentState?.validate() ?? false) {
      widget.onNext();
    }
  }
}
```

**Archivo:** `lib/features/cart/presentation/widgets/confirmation_step.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/cart_provider.dart';
import '../providers/checkout_provider.dart';
import 'coupon_input.dart';
import 'order_summary_card.dart';

class ConfirmationStep extends ConsumerWidget {
  final VoidCallback onBack;
  final VoidCallback onPay;

  const ConfirmationStep({
    super.key,
    required this.onBack,
    required this.onPay,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(cartNotifierProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final shipping = ref.watch(cartShippingProvider);
    final checkout = ref.watch(checkoutNotifierProvider);
    final total = ref.watch(checkoutTotalProvider);
    final discount = ref.watch(appliedDiscountProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Título
          Text(
            'Resumen del pedido',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),

          // Lista de productos
          ...cartItems.map((item) => _OrderItemRow(item: item)),
          
          const Divider(height: 32),

          // Cupón
          CouponInput(
            appliedCoupon: checkout.validatedCoupon,
            isLoading: checkout.isCouponLoading,
            error: checkout.couponError,
            onApply: (code) => ref
                .read(checkoutNotifierProvider.notifier)
                .validateCoupon(code),
            onRemove: () => ref
                .read(checkoutNotifierProvider.notifier)
                .removeCoupon(),
          ),

          const SizedBox(height: 24),

          // Resumen de precios
          OrderSummaryCard(
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            discountLabel: checkout.validatedCoupon?.coupon?.description,
            total: total,
          ),

          const SizedBox(height: 24),

          // Dirección de envío
          _ShippingAddressCard(formData: checkout.formData),

          const SizedBox(height: 32),

          // Error message
          if (checkout.error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: Colors.red.shade700),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      checkout.error!,
                      style: TextStyle(color: Colors.red.shade700),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Botones
          Row(
            children: [
              TextButton.icon(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back),
                label: const Text('Atrás'),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: checkout.isLoading ? null : onPay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: checkout.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.credit_card),
                label: Text(
                  checkout.isLoading ? 'Procesando...' : 'Pagar ${total.toStringAsFixed(2)}€',
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _OrderItemRow extends StatelessWidget {
  final CartItem item;

  const _OrderItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              item.imageUrl ?? '',
              width: 60,
              height: 75,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 60,
                height: 75,
                color: Colors.grey[200],
                child: const Icon(Icons.image_not_supported),
              ),
            ),
          ),
          const SizedBox(width: 12),
          
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Talla: ${item.size} · x${item.quantity}',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          
          // Precio
          Text(
            '${item.subtotal.toStringAsFixed(2)}€',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _ShippingAddressCard extends StatelessWidget {
  final CheckoutFormData formData;

  const _ShippingAddressCard({required this.formData});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on, color: Colors.grey[600], size: 20),
              const SizedBox(width: 8),
              const Text(
                'Envío a:',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(formData.customerName),
          Text(formData.shippingAddress),
          Text('${formData.shippingPostalCode} ${formData.shippingCity}'),
          Text(formData.shippingCountry),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.email_outlined, color: Colors.grey[600], size: 16),
              const SizedBox(width: 8),
              Text(formData.customerEmail),
            ],
          ),
          if (formData.customerPhone.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.phone_outlined, color: Colors.grey[600], size: 16),
                const SizedBox(width: 8),
                Text(formData.customerPhone),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
```

### 2.4 Order Confirmation Screen

**Archivo:** `lib/features/cart/presentation/screens/order_confirmation_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/order.dart';
import '../providers/checkout_provider.dart';
import '../widgets/success_check_animation.dart';

class OrderConfirmationScreen extends ConsumerWidget {
  final String orderId;

  const OrderConfirmationScreen({
    super.key,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderByIdProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.home),
            onPressed: () => context.go('/'),
          ),
        ],
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Ir al inicio'),
              ),
            ],
          ),
        ),
        data: (order) => _ConfirmationContent(order: order),
      ),
    );
  }
}

class _ConfirmationContent extends StatelessWidget {
  final Order order;

  const _ConfirmationContent({required this.order});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Animación de check
          const SuccessCheckAnimation(),
          const SizedBox(height: 24),

          // Título
          Text(
            '¡Pedido confirmado!',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),

          // Mensaje
          Text(
            'Gracias por tu compra, ${order.customerName.split(' ').first}.',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Hemos enviado la confirmación a',
            style: TextStyle(color: Colors.grey[600]),
          ),
          Text(
            order.customerEmail,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),

          const SizedBox(height: 32),

          // Card del pedido
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Número de pedido
                Row(
                  children: [
                    const Icon(Icons.inventory_2_outlined),
                    const SizedBox(width: 8),
                    Text(
                      'Pedido ${order.formattedOrderNumber}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),

                const Divider(height: 32),

                // Items
                if (order.items != null) ...[
                  ...order.items!.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            item.productImage ?? '',
                            width: 50,
                            height: 65,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 50,
                              height: 65,
                              color: Colors.grey[300],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.productName ?? 'Producto',
                                style: const TextStyle(fontWeight: FontWeight.w500),
                              ),
                              Text(
                                'Talla: ${item.variantSize ?? '-'} · x${item.quantity}',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${(item.priceAtPurchase * item.quantity).toStringAsFixed(2)}€',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  )),
                  const Divider(height: 24),
                ],

                // Total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total pagado',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      '${order.totalAmount.toStringAsFixed(2)}€',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),

                const Divider(height: 24),

                // Dirección
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.location_on_outlined, color: Colors.grey[600], size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Se enviará a:',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 4),
                          Text(order.shippingAddress),
                          Text('${order.shippingPostalCode} ${order.shippingCity}'),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // Botones
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => context.go('/cuenta/pedidos'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Ver mis pedidos'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: OutlinedButton(
              onPressed: () => context.go('/productos'),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Seguir comprando'),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 3. Navegación

### 3.1 Rutas del Módulo

**Archivo:** `lib/core/router/cart_routes.dart`

```dart
import 'package:go_router/go_router.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/cart/presentation/screens/checkout_screen.dart';
import '../../features/cart/presentation/screens/order_confirmation_screen.dart';

final cartRoutes = [
  GoRoute(
    path: '/carrito',
    name: 'cart',
    builder: (context, state) => const CartScreen(),
  ),
  GoRoute(
    path: '/checkout',
    name: 'checkout',
    builder: (context, state) => const CheckoutScreen(),
    routes: [
      GoRoute(
        path: 'success/:orderId',
        name: 'checkout-success',
        builder: (context, state) => OrderConfirmationScreen(
          orderId: state.pathParameters['orderId']!,
        ),
      ),
    ],
  ),
];
```

### 3.2 Integración en Router Principal

```dart
// lib/core/router/router.dart
final router = GoRouter(
  initialLocation: '/',
  routes: [
    ...homeRoutes,
    ...catalogRoutes,
    ...cartRoutes,    // Añadir rutas del carrito
    ...authRoutes,
    ...profileRoutes,
  ],
);
```

---

## 4. Integración con Catálogo

### 4.1 Botón Añadir al Carrito

**Modificar:** `lib/features/catalog/presentation/widgets/add_to_cart_button.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../cart/data/models/cart_item_model.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../cart/domain/entities/cart_item.dart';

class AddToCartButton extends ConsumerStatefulWidget {
  final String variantId;
  final String productId;
  final String productName;
  final String productSlug;
  final String? imageUrl;
  final double price;
  final double? originalPrice;
  final String size;
  final int stock;

  const AddToCartButton({
    super.key,
    required this.variantId,
    required this.productId,
    required this.productName,
    required this.productSlug,
    this.imageUrl,
    required this.price,
    this.originalPrice,
    required this.size,
    required this.stock,
  });

  @override
  ConsumerState<AddToCartButton> createState() => _AddToCartButtonState();
}

class _AddToCartButtonState extends ConsumerState<AddToCartButton> {
  bool _isAdding = false;

  @override
  Widget build(BuildContext context) {
    final isOutOfStock = widget.stock <= 0;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isOutOfStock || _isAdding ? null : _addToCart,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          disabledBackgroundColor: Colors.grey[300],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isAdding
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(
                isOutOfStock ? 'Sin stock' : 'Añadir al carrito',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Future<void> _addToCart() async {
    setState(() => _isAdding = true);

    try {
      final item = CartItem(
        variantId: widget.variantId,
        productId: widget.productId,
        productName: widget.productName,
        productSlug: widget.productSlug,
        imageUrl: widget.imageUrl,
        price: widget.price,
        originalPrice: widget.originalPrice,
        size: widget.size,
        quantity: 1,
        availableStock: widget.stock,
        addedAt: DateTime.now(),
      );

      await ref.read(cartNotifierProvider.notifier).addItem(item);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.productName} añadido al carrito'),
            action: SnackBarAction(
              label: 'Ver carrito',
              onPressed: () => context.push('/carrito'),
            ),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isAdding = false);
      }
    }
  }
}
```

### 4.2 Badge del Carrito en AppBar

**Archivo:** `lib/core/widgets/cart_badge.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/cart/presentation/providers/cart_provider.dart';

class CartBadge extends ConsumerWidget {
  const CartBadge({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemCount = ref.watch(cartItemCountProvider);

    return Stack(
      children: [
        IconButton(
          icon: const Icon(Icons.shopping_bag_outlined),
          onPressed: () => context.push('/carrito'),
        ),
        if (itemCount > 0)
          Positioned(
            right: 4,
            top: 4,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.black,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 18,
                minHeight: 18,
              ),
              child: Text(
                itemCount > 99 ? '99+' : itemCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}
```

---

## 5. Testing

### 5.1 Widget Test - Cart Screen

**Archivo:** `test/features/cart/presentation/screens/cart_screen_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CartScreen', () {
    testWidgets('shows empty state when cart is empty', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            cartNotifierProvider.overrideWith((ref) => []),
          ],
          child: MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('Tu carrito está vacío'), findsOneWidget);
      expect(find.text('Ver Productos'), findsOneWidget);
    });

    testWidgets('shows cart items when cart has items', (tester) async {
      final items = [
        CartItem(
          variantId: '1',
          productId: 'p1',
          productName: 'Test Product',
          productSlug: 'test-product',
          price: 29.99,
          size: 'M',
          quantity: 2,
          availableStock: 10,
          addedAt: DateTime.now(),
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            cartNotifierProvider.overrideWith((ref) => items),
          ],
          child: MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('Test Product'), findsOneWidget);
      expect(find.text('59,98€'), findsOneWidget); // 29.99 * 2
    });
  });
}
```

### 5.2 Integration Test - Checkout Flow

**Archivo:** `integration_test/checkout_flow_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Checkout Flow', () {
    testWidgets('complete checkout flow', (tester) async {
      await tester.pumpWidget(MyApp());
      await tester.pumpAndSettle();

      // 1. Ir a un producto
      await tester.tap(find.text('Ver Productos'));
      await tester.pumpAndSettle();

      // 2. Seleccionar talla
      await tester.tap(find.text('M'));
      await tester.pumpAndSettle();

      // 3. Añadir al carrito
      await tester.tap(find.text('Añadir al carrito'));
      await tester.pumpAndSettle();

      // 4. Ir al carrito
      await tester.tap(find.byIcon(Icons.shopping_bag_outlined));
      await tester.pumpAndSettle();

      expect(find.text('Mi Carrito'), findsOneWidget);

      // 5. Ir a checkout
      await tester.tap(find.text('Finalizar compra'));
      await tester.pumpAndSettle();

      expect(find.text('Checkout'), findsOneWidget);

      // 6. Llenar formulario paso 1
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Nombre completo *'),
        'Test User',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email *'),
        'test@example.com',
      );
      await tester.tap(find.text('Continuar'));
      await tester.pumpAndSettle();

      // 7. Llenar formulario paso 2
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Dirección *'),
        'Calle Test 123',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Ciudad *'),
        'Madrid',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Código Postal *'),
        '28001',
      );
      await tester.tap(find.text('Continuar'));
      await tester.pumpAndSettle();

      // 8. Verificar paso 3 (confirmación)
      expect(find.text('Resumen del pedido'), findsOneWidget);
      expect(find.text('Test User'), findsOneWidget);
      expect(find.text('Calle Test 123'), findsOneWidget);
    });
  });
}
```

---

## 6. Checklist de Fase 4

- [ ] Implementar `CartScreen` completa
- [ ] Implementar `CheckoutScreen` con 3 pasos
- [ ] Implementar `ContactFormStep`
- [ ] Implementar `ShippingFormStep`
- [ ] Implementar `ConfirmationStep`
- [ ] Implementar `OrderConfirmationScreen`
- [ ] Crear `AddToCartButton` reutilizable
- [ ] Crear `CartBadge` para AppBar
- [ ] Configurar rutas del módulo
- [ ] Conectar con Stripe PaymentSheet
- [ ] Probar flujo completo de compra
- [ ] Escribir widget tests
- [ ] Escribir integration tests
- [ ] Verificar estados de error
- [ ] Verificar estados de carga
- [ ] Probar en iOS y Android

---

## 7. Resumen del Módulo Completo

### Archivos Creados
```
lib/features/cart/
├── data/
│   ├── datasources/
│   │   ├── cart_local_datasource.dart
│   │   └── checkout_remote_datasource.dart
│   ├── models/
│   │   ├── cart_item_model.dart
│   │   ├── cart_item_model.g.dart (generado)
│   │   ├── order_model.dart
│   │   ├── order_model.freezed.dart (generado)
│   │   ├── order_model.g.dart (generado)
│   │   ├── order_item_model.dart
│   │   ├── coupon_model.dart
│   │   └── checkout_form_data.dart
│   └── repositories/
│       ├── cart_repository_impl.dart
│       └── checkout_repository_impl.dart
├── domain/
│   ├── constants/
│   │   └── cart_constants.dart
│   ├── entities/
│   │   ├── cart_item.dart
│   │   └── order.dart
│   ├── repositories/
│   │   ├── cart_repository.dart
│   │   └── checkout_repository.dart
│   └── usecases/
│       ├── add_to_cart.dart
│       └── process_checkout.dart
└── presentation/
    ├── providers/
    │   ├── cart_provider.dart
    │   ├── cart_provider.g.dart (generado)
    │   ├── checkout_provider.dart
    │   └── payment_provider.dart
    ├── screens/
    │   ├── cart_screen.dart
    │   ├── checkout_screen.dart
    │   └── order_confirmation_screen.dart
    └── widgets/
        ├── cart_item_tile.dart
        ├── cart_summary.dart
        ├── shipping_progress_bar.dart
        ├── checkout_stepper.dart
        ├── contact_form_step.dart
        ├── shipping_form_step.dart
        ├── confirmation_step.dart
        ├── coupon_input.dart
        ├── order_summary_card.dart
        └── success_check_animation.dart
```

### Endpoints Necesarios
1. `POST /api/checkout/create-payment-intent` - **NUEVO**
2. `POST /api/coupons/validate` - Existente
3. `POST /api/webhooks/stripe` - Modificar para `payment_intent.succeeded`
4. `GET /api/orders/:id` - Para confirmación

### Dependencias Flutter
```yaml
dependencies:
  flutter_stripe: ^10.1.1
  hive: ^2.2.3
  hive_flutter: ^1.1.0
```
