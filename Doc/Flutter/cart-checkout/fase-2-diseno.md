# Fase 2: Diseño UI/UX - Carrito y Checkout

## 1. Objetivos de la Fase
- Definir wireframes de todas las pantallas
- Establecer sistema de diseño para checkout
- Crear componentes visuales reutilizables
- Diseñar animaciones y transiciones

---

## 2. Wireframes

### 2.1 CartScreen

```
┌─────────────────────────────────────────┐
│ ←  Mi Carrito                     🗑️   │  <- AppBar con limpiar carrito
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🚚 ¡Envío gratis a partir de 50€!  │ │  <- Barra progreso envío
│ │ ████████████░░░░░░░░  35€ / 50€    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│ ┌───┐ ─────────────────────────────     │  <- CartItemTile
│ │ 📷│ Camiseta Básica                   │
│ │   │ Talla: M                          │
│ │   │ ───────────────────               │
│ │   │  [ - ]  2  [ + ]     45,00 €      │
│ └───┘                           🗑️     │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ ┌───┐ ─────────────────────────────     │
│ │ 📷│ Pantalón Vaquero                  │
│ │   │ Talla: L                          │
│ │   │ ───────────────────               │
│ │   │  [ - ]  1  [ + ]     29,99 €      │
│ └───┘                           🗑️     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   Subtotal                    74,99 €   │  <- CartSummary
│   Envío                        4,99 €   │
│   ───────────────────────────────────   │
│   Total                       79,98 €   │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │         FINALIZAR COMPRA            │ │  <- Botón principal
│ └─────────────────────────────────────┘ │
│                                         │
│        Seguir comprando →               │  <- Link secundario
└─────────────────────────────────────────┘
```

### 2.2 CartScreen - Estado Vacío

```
┌─────────────────────────────────────────┐
│ ←  Mi Carrito                           │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│              🛒                         │
│                                         │
│        Tu carrito está vacío            │
│                                         │
│   Explora nuestros productos y añade    │
│      tus favoritos al carrito           │
│                                         │
│   ┌───────────────────────────────┐     │
│   │      VER PRODUCTOS            │     │
│   └───────────────────────────────┘     │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 2.3 CheckoutScreen - Paso 1: Contacto

```
┌─────────────────────────────────────────┐
│ ←  Checkout                             │
├─────────────────────────────────────────┤
│                                         │
│   ●───────○───────○                     │  <- CheckoutStepper
│   1       2       3                     │
│ Contacto Envío  Confirmar               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   Datos de contacto                     │
│                                         │
│   Nombre completo *                     │
│   ┌─────────────────────────────────┐   │
│   │ María García                    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Email *                               │
│   ┌─────────────────────────────────┐   │
│   │ maria@ejemplo.com               │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Teléfono (opcional)                   │
│   ┌─────────────────────────────────┐   │
│   │ +34 612 345 678                 │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │           CONTINUAR →               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2.4 CheckoutScreen - Paso 2: Envío

```
┌─────────────────────────────────────────┐
│ ←  Checkout                             │
├─────────────────────────────────────────┤
│                                         │
│   ●───────●───────○                     │
│   1       2       3                     │
│ Contacto Envío  Confirmar               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   Dirección de envío                    │
│                                         │
│   Dirección *                           │
│   ┌─────────────────────────────────┐   │
│   │ Calle Mayor 123, 2ºB            │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Ciudad *                              │
│   ┌─────────────────────────────────┐   │
│   │ Madrid                          │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Código Postal *                       │
│   ┌─────────────────────────────────┐   │
│   │ 28001                           │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ☑️ Guardar dirección para futuras     │
│      compras                            │
│                                         │
├─────────────────────────────────────────┤
│ ← Atrás        ┌─────────────────────┐  │
│                │   CONTINUAR →       │  │
│                └─────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.5 CheckoutScreen - Paso 3: Confirmación

```
┌─────────────────────────────────────────┐
│ ←  Checkout                             │
├─────────────────────────────────────────┤
│                                         │
│   ●───────●───────●                     │
│   1       2       3                     │
│ Contacto Envío  Confirmar               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   📋 Resumen del pedido                 │
│   ─────────────────────────────────     │
│                                         │
│   ┌───┐ Camiseta Básica (M) x2          │
│   │📷 │                        45,00 €  │
│   └───┘                                 │
│   ┌───┐ Pantalón Vaquero (L) x1         │
│   │📷 │                        29,99 €  │
│   └───┘                                 │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   🏷️ ¿Tienes un cupón?                  │
│   ┌─────────────────────────┐ ┌──────┐  │
│   │ DESCUENTO10             │ │Aplicar│ │
│   └─────────────────────────┘ └──────┘  │
│   ✓ Cupón aplicado: -10%                │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   Subtotal                    74,99 €   │
│   Descuento (10%)             -7,50 €   │
│   Envío                        4,99 €   │
│   ─────────────────────────────────     │
│   Total                       72,48 €   │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   📍 Envío a:                           │
│   María García                          │
│   Calle Mayor 123, 2ºB                  │
│   28001 Madrid, España                  │
│                                         │
│   📧 maria@ejemplo.com                  │
│                                         │
├─────────────────────────────────────────┤
│ ← Atrás        ┌─────────────────────┐  │
│                │ 💳 PAGAR AHORA      │  │
│                └─────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.6 PaymentScreen (Stripe PaymentSheet)

```
┌─────────────────────────────────────────┐
│           Procesando pago...            │
│                                         │
│               ⏳                        │
│                                         │
│         Fashion Store                   │
│         72,48 €                         │
│                                         │
└─────────────────────────────────────────┘
          ↓ Stripe PaymentSheet ↓
┌─────────────────────────────────────────┐
│ ×                         Fashion Store │
├─────────────────────────────────────────┤
│                                         │
│   Pay 72,48 €                           │
│                                         │
│   Card                                  │
│   ┌─────────────────────────────────┐   │
│   │ 💳 4242 4242 4242 4242          │   │
│   │    MM/YY    CVC                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ─ OR PAY WITH ─                       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      🍎 Apple Pay                │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      G  Google Pay               │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │            PAY                   │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 2.7 OrderConfirmationScreen

```
┌─────────────────────────────────────────┐
│                                 🏠      │  <- Solo icono home
├─────────────────────────────────────────┤
│                                         │
│                 ✓                       │  <- Animación check
│                                         │
│        ¡Pedido confirmado!              │
│                                         │
│   Gracias por tu compra, María.         │
│                                         │
│   Hemos enviado la confirmación a       │
│   maria@ejemplo.com                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   📦 Pedido #FS-000042                  │
│   ─────────────────────────────────     │
│                                         │
│   ┌───┐ Camiseta Básica (M) x2          │
│   │📷 │                        45,00 €  │
│   └───┘                                 │
│   ┌───┐ Pantalón Vaquero (L) x1         │
│   │📷 │                        29,99 €  │
│   └───┘                                 │
│                                         │
│   ─────────────────────────────────     │
│   Descuento                    -7,50 €  │
│   Envío                         4,99 €  │
│   ─────────────────────────────────     │
│   Total pagado                72,48 €   │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   📍 Se enviará a:                      │
│   Calle Mayor 123, 2ºB                  │
│   28001 Madrid                          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      VER MIS PEDIDOS            │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      SEGUIR COMPRANDO           │   │ <- Outlined
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. Sistema de Diseño

### 3.1 Colores del Módulo

```dart
class CheckoutColors {
  // Estados
  static const Color success = Color(0xFF22C55E);      // Verde éxito
  static const Color warning = Color(0xFFF59E0B);      // Amarillo advertencia
  static const Color error = Color(0xFFEF4444);        // Rojo error
  static const Color info = Color(0xFF3B82F6);         // Azul info
  
  // Checkout Stepper
  static const Color stepActive = Color(0xFF000000);    // Negro (activo)
  static const Color stepCompleted = Color(0xFF22C55E); // Verde (completado)
  static const Color stepInactive = Color(0xFFD1D5DB);  // Gris (inactivo)
  
  // Envío gratis
  static const Color shippingBar = Color(0xFF10B981);   // Verde esmeralda
  static const Color shippingBarBg = Color(0xFFD1FAE5); // Verde claro
  
  // Cupones
  static const Color couponValid = Color(0xFF22C55E);   // Verde
  static const Color couponInvalid = Color(0xFFEF4444); // Rojo
  
  // Precios
  static const Color priceOriginal = Color(0xFF9CA3AF); // Gris tachado
  static const Color priceDiscount = Color(0xFFEF4444); // Rojo oferta
}
```

### 3.2 Tipografía

```dart
class CheckoutTypography {
  // Títulos de sección
  static const TextStyle sectionTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
  );
  
  // Labels de formulario
  static const TextStyle formLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: Color(0xFF374151),
  );
  
  // Precio grande (total)
  static const TextStyle priceTotal = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
  );
  
  // Precio item
  static const TextStyle priceItem = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  );
  
  // Precio tachado
  static const TextStyle priceStrikethrough = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: Color(0xFF9CA3AF),
    decoration: TextDecoration.lineThrough,
  );
}
```

### 3.3 Espaciado

```dart
class CheckoutSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  
  // Padding de pantalla
  static const EdgeInsets screenPadding = EdgeInsets.all(16.0);
  
  // Padding de tarjeta
  static const EdgeInsets cardPadding = EdgeInsets.all(16.0);
  
  // Separación entre secciones
  static const double sectionGap = 24.0;
}
```

---

## 4. Componentes UI

### 4.1 ShippingProgressBar

```dart
class ShippingProgressBar extends StatelessWidget {
  final double currentAmount;
  final double threshold;
  final double shippingCost;

  const ShippingProgressBar({
    super.key,
    required this.currentAmount,
    this.threshold = 50.0,
    this.shippingCost = 4.99,
  });

  @override
  Widget build(BuildContext context) {
    final progress = (currentAmount / threshold).clamp(0.0, 1.0);
    final isFreeShipping = currentAmount >= threshold;
    final remaining = threshold - currentAmount;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isFreeShipping 
            ? CheckoutColors.shippingBar.withOpacity(0.1)
            : CheckoutColors.shippingBarBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isFreeShipping 
              ? CheckoutColors.shippingBar 
              : CheckoutColors.shippingBar.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isFreeShipping ? Icons.check_circle : Icons.local_shipping,
                color: CheckoutColors.shippingBar,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isFreeShipping
                      ? '¡Envío gratis!'
                      : 'Añade ${remaining.toStringAsFixed(2)}€ más para envío gratis',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: CheckoutColors.shippingBar,
                  ),
                ),
              ),
            ],
          ),
          if (!isFreeShipping) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white,
                valueColor: AlwaysStoppedAnimation(CheckoutColors.shippingBar),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${currentAmount.toStringAsFixed(2)}€',
                  style: const TextStyle(fontSize: 12),
                ),
                Text(
                  '${threshold.toStringAsFixed(2)}€',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
```

### 4.2 CartItemTile

```dart
class CartItemTile extends StatelessWidget {
  final CartItem item;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onRemove;

  const CartItemTile({
    super.key,
    required this.item,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(item.variantId),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: Colors.red,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: item.imageUrl ?? '',
                width: 80,
                height: 100,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  color: Colors.grey[200],
                  child: const Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (_, __, ___) => Container(
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
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Talla: ${item.size}',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Cantidad y precio
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Selector de cantidad
                      _QuantitySelector(
                        quantity: item.quantity,
                        canIncrement: item.canIncrement,
                        canDecrement: item.canDecrement,
                        onIncrement: onIncrement,
                        onDecrement: onDecrement,
                      ),
                      
                      // Precio
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          if (item.hasDiscount)
                            Text(
                              '${item.originalPrice!.toStringAsFixed(2)}€',
                              style: CheckoutTypography.priceStrikethrough,
                            ),
                          Text(
                            '${item.subtotal.toStringAsFixed(2)}€',
                            style: CheckoutTypography.priceItem.copyWith(
                              color: item.hasDiscount 
                                  ? CheckoutColors.priceDiscount 
                                  : null,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Botón eliminar
            IconButton(
              icon: Icon(Icons.close, color: Colors.grey[400]),
              onPressed: onRemove,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantitySelector extends StatelessWidget {
  final int quantity;
  final bool canIncrement;
  final bool canDecrement;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const _QuantitySelector({
    required this.quantity,
    required this.canIncrement,
    required this.canDecrement,
    required this.onIncrement,
    required this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _QuantityButton(
            icon: Icons.remove,
            onPressed: canDecrement ? onDecrement : null,
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              quantity.toString(),
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ),
          _QuantityButton(
            icon: Icons.add,
            onPressed: canIncrement ? onIncrement : null,
          ),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;

  const _QuantityButton({
    required this.icon,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Icon(
          icon,
          size: 20,
          color: onPressed != null ? Colors.black : Colors.grey[300],
        ),
      ),
    );
  }
}
```

### 4.3 CheckoutStepper

```dart
class CheckoutStepper extends StatelessWidget {
  final int currentStep;
  final List<String> steps;

  const CheckoutStepper({
    super.key,
    required this.currentStep,
    this.steps = const ['Contacto', 'Envío', 'Confirmar'],
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: List.generate(
          steps.length * 2 - 1,
          (index) {
            if (index.isOdd) {
              // Línea conectora
              final stepIndex = index ~/ 2;
              final isCompleted = stepIndex < currentStep - 1;
              return Expanded(
                child: Container(
                  height: 2,
                  color: isCompleted 
                      ? CheckoutColors.stepCompleted 
                      : CheckoutColors.stepInactive,
                ),
              );
            } else {
              // Círculo con número
              final stepIndex = index ~/ 2;
              final isActive = stepIndex == currentStep - 1;
              final isCompleted = stepIndex < currentStep - 1;
              
              return _StepIndicator(
                number: stepIndex + 1,
                label: steps[stepIndex],
                isActive: isActive,
                isCompleted: isCompleted,
              );
            }
          },
        ),
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int number;
  final String label;
  final bool isActive;
  final bool isCompleted;

  const _StepIndicator({
    required this.number,
    required this.label,
    required this.isActive,
    required this.isCompleted,
  });

  @override
  Widget build(BuildContext context) {
    Color circleColor;
    Color textColor;
    Widget child;

    if (isCompleted) {
      circleColor = CheckoutColors.stepCompleted;
      textColor = CheckoutColors.stepCompleted;
      child = const Icon(Icons.check, color: Colors.white, size: 16);
    } else if (isActive) {
      circleColor = CheckoutColors.stepActive;
      textColor = CheckoutColors.stepActive;
      child = Text(
        number.toString(),
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      );
    } else {
      circleColor = CheckoutColors.stepInactive;
      textColor = CheckoutColors.stepInactive;
      child = Text(
        number.toString(),
        style: TextStyle(
          color: Colors.grey[600],
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isCompleted || isActive ? circleColor : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: circleColor, width: 2),
          ),
          child: Center(child: child),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            color: textColor,
          ),
        ),
      ],
    );
  }
}
```

### 4.4 CouponInput

```dart
class CouponInput extends StatefulWidget {
  final ValidatedCoupon? appliedCoupon;
  final bool isLoading;
  final String? error;
  final ValueChanged<String> onApply;
  final VoidCallback onRemove;

  const CouponInput({
    super.key,
    this.appliedCoupon,
    this.isLoading = false,
    this.error,
    required this.onApply,
    required this.onRemove,
  });

  @override
  State<CouponInput> createState() => _CouponInputState();
}

class _CouponInputState extends State<CouponInput> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Cupón aplicado
    if (widget.appliedCoupon != null && widget.appliedCoupon!.valid) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: CheckoutColors.couponValid.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: CheckoutColors.couponValid),
        ),
        child: Row(
          children: [
            Icon(
              Icons.check_circle,
              color: CheckoutColors.couponValid,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Cupón ${widget.appliedCoupon!.coupon!.code}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    widget.appliedCoupon!.coupon!.description,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '-${widget.appliedCoupon!.calculatedDiscount!.toStringAsFixed(2)}€',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: CheckoutColors.couponValid,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 20),
              onPressed: widget.onRemove,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      );
    }

    // Input para aplicar cupón
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.local_offer, size: 20),
            const SizedBox(width: 8),
            const Text(
              '¿Tienes un cupón?',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Código de descuento',
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  errorText: widget.error,
                ),
                textCapitalization: TextCapitalization.characters,
                enabled: !widget.isLoading,
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: widget.isLoading || _controller.text.isEmpty
                    ? null
                    : () => widget.onApply(_controller.text.trim()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: widget.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
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
```

### 4.5 OrderSummaryCard

```dart
class OrderSummaryCard extends StatelessWidget {
  final double subtotal;
  final double shipping;
  final double? discount;
  final String? discountLabel;
  final double total;

  const OrderSummaryCard({
    super.key,
    required this.subtotal,
    required this.shipping,
    this.discount,
    this.discountLabel,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          _SummaryRow(
            label: 'Subtotal',
            value: '${subtotal.toStringAsFixed(2)}€',
          ),
          const SizedBox(height: 8),
          if (discount != null && discount! > 0) ...[
            _SummaryRow(
              label: discountLabel ?? 'Descuento',
              value: '-${discount!.toStringAsFixed(2)}€',
              valueColor: CheckoutColors.couponValid,
            ),
            const SizedBox(height: 8),
          ],
          _SummaryRow(
            label: 'Envío',
            value: shipping == 0 
                ? 'Gratis' 
                : '${shipping.toStringAsFixed(2)}€',
            valueColor: shipping == 0 ? CheckoutColors.success : null,
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(),
          ),
          _SummaryRow(
            label: 'Total',
            value: '${total.toStringAsFixed(2)}€',
            isBold: true,
            fontSize: 18,
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final bool isBold;
  final double fontSize;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.isBold = false,
    this.fontSize = 14,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.w600 : FontWeight.w400,
            fontSize: fontSize,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
            fontSize: fontSize,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
```

---

## 5. Animaciones

### 5.1 Animación de Check (Confirmación)

```dart
class SuccessCheckAnimation extends StatefulWidget {
  final Duration duration;
  final VoidCallback? onComplete;

  const SuccessCheckAnimation({
    super.key,
    this.duration = const Duration(milliseconds: 800),
    this.onComplete,
  });

  @override
  State<SuccessCheckAnimation> createState() => _SuccessCheckAnimationState();
}

class _SuccessCheckAnimationState extends State<SuccessCheckAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _checkAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.elasticOut),
      ),
    );

    _checkAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.4, 1.0, curve: Curves.easeOut),
      ),
    );

    _controller.forward().then((_) => widget.onComplete?.call());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: CheckoutColors.success,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: CustomPaint(
                size: const Size(50, 50),
                painter: _CheckPainter(progress: _checkAnimation.value),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _CheckPainter extends CustomPainter {
  final double progress;

  _CheckPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Primera línea del check (hacia abajo)
    final firstLineEnd = Offset(
      size.width * 0.35,
      size.height * 0.55,
    );
    path.moveTo(size.width * 0.2, size.height * 0.45);
    
    if (progress < 0.5) {
      final t = progress * 2;
      path.lineTo(
        size.width * 0.2 + (firstLineEnd.dx - size.width * 0.2) * t,
        size.height * 0.45 + (firstLineEnd.dy - size.height * 0.45) * t,
      );
    } else {
      path.lineTo(firstLineEnd.dx, firstLineEnd.dy);
      
      // Segunda línea del check (hacia arriba)
      final t = (progress - 0.5) * 2;
      path.lineTo(
        firstLineEnd.dx + (size.width * 0.8 - firstLineEnd.dx) * t,
        firstLineEnd.dy + (size.height * 0.25 - firstLineEnd.dy) * t,
      );
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CheckPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
```

### 5.2 Transición entre pasos

```dart
class StepTransition extends StatelessWidget {
  final Widget child;
  final bool forward;

  const StepTransition({
    super.key,
    required this.child,
    this.forward = true,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (child, animation) {
        final offsetAnimation = Tween<Offset>(
          begin: Offset(forward ? 1.0 : -1.0, 0.0),
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: animation,
          curve: Curves.easeInOut,
        ));

        return SlideTransition(
          position: offsetAnimation,
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}
```

---

## 6. Responsive Design

### 6.1 Breakpoints

```dart
class CheckoutBreakpoints {
  static const double mobile = 600;
  static const double tablet = 900;
  
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobile;
      
  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= mobile &&
      MediaQuery.of(context).size.width < tablet;
      
  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= tablet;
}
```

### 6.2 Layout Adaptativo

```dart
class CheckoutLayout extends StatelessWidget {
  final Widget form;
  final Widget summary;

  const CheckoutLayout({
    super.key,
    required this.form,
    required this.summary,
  });

  @override
  Widget build(BuildContext context) {
    if (CheckoutBreakpoints.isDesktop(context)) {
      // Desktop: dos columnas
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 3, child: form),
          const SizedBox(width: 32),
          Expanded(flex: 2, child: summary),
        ],
      );
    }
    
    // Mobile/Tablet: una columna
    return Column(
      children: [
        form,
        const SizedBox(height: 24),
        summary,
      ],
    );
  }
}
```

---

## 7. Checklist de Fase 2

- [ ] Crear `ShippingProgressBar` widget
- [ ] Crear `CartItemTile` con swipe-to-delete
- [ ] Crear `CheckoutStepper` widget
- [ ] Crear `CouponInput` widget
- [ ] Crear `OrderSummaryCard` widget
- [ ] Implementar animación de éxito
- [ ] Implementar transiciones entre pasos
- [ ] Definir colores y tipografía
- [ ] Crear layout adaptativo
- [ ] Revisar accesibilidad (a11y)
