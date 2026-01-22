# Módulo 09: Pedidos y Devoluciones

## 🎯 Objetivo

Implementar el sistema completo de gestión de pedidos: historial, detalle con tracking, sistema de devoluciones y solicitud de facturas.

## 🗄️ Backend (Supabase)

### Tablas Involucradas

**orders:**
- `id`: UUID
- `order_number`: BIGINT (visible: #1001, #1002...)
- `customer_id`: UUID (FK auth.users)
- `customer_name`, `customer_email`, `customer_phone`
- `shipping_address`, `shipping_city`, `shipping_postal_code`, `shipping_country`
- `total_amount`: NUMERIC
- `status`: TEXT ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- `stripe_session_id`: TEXT
- `refunded_amount`: NUMERIC (default 0)
- `delivered_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ

**order_items:**
- `id`: UUID
- `order_id`: UUID (FK)
- `product_id`: UUID (FK, nullable)
- `variant_id`: UUID (FK, nullable)
- `quantity`: INTEGER
- `price_at_purchase`: NUMERIC (snapshot del precio)

**order_shipments:**
- `id`: UUID
- `order_id`: UUID (FK, único)
- `carrier`: TEXT (ej: "Correos", "SEUR")
- `tracking_number`: TEXT
- `tracking_url`: TEXT
- `shipped_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ

**returns:**
- `id`: UUID
- `order_id`: UUID (FK)
- `customer_id`: UUID (FK)
- `reason`: TEXT
- `comments`: TEXT
- `status`: TEXT ('pending', 'approved', 'rejected', 'completed')
- `refund_amount`: NUMERIC
- `return_label_url`: TEXT
- `created_at`: TIMESTAMPTZ

**return_items:**
- `id`: UUID
- `return_id`: UUID (FK)
- `order_item_id`: UUID (FK)
- `quantity`: INTEGER

**invoices:**
- `id`: UUID
- `order_id`: UUID (FK, único)
- `invoice_number`: TEXT (INV-2026-0001)
- `customer_nif`: TEXT
- `pdf_url`: TEXT
- `generated_at`: TIMESTAMPTZ

### Funciones RPC Disponibles

```sql
-- Obtener pedidos del cliente
get_customer_orders(p_customer_id UUID)
→ orders[] con items, shipment

-- Obtener detalle de pedido
get_customer_order_detail(p_order_id UUID, p_customer_id UUID)
→ order completo con items, productos, tracking

-- Cancelar pedido (solo si status = 'pending' o 'paid')
cancel_order(p_order_id UUID)
→ void (cambia status a 'cancelled', restaura stock)

-- Crear solicitud de devolución
create_return_request(
  p_order_id UUID,
  p_reason TEXT,
  p_comments TEXT,
  p_items JSONB -- [{ order_item_id, quantity }]
)
→ return_id UUID

-- Calcular monto de reembolso
calculate_return_refund(p_return_id UUID)
→ refund_amount NUMERIC

-- Solicitar factura
request_invoice(p_order_id UUID, p_customer_nif TEXT)
→ invoice_id UUID
```

## 🏗️ Arquitectura del Módulo

```
features/orders/
├── data/
│   ├── datasources/
│   │   ├── orders_datasource.dart
│   │   └── returns_datasource.dart
│   └── repositories/
│       ├── orders_repository_impl.dart
│       └── returns_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── order.dart (Freezed)
│   │   ├── order_item.dart (Freezed)
│   │   ├── order_shipment.dart (Freezed)
│   │   ├── return_request.dart (Freezed)
│   │   ├── return_item.dart (Freezed)
│   │   └── invoice.dart (Freezed)
│   └── repositories/
│       ├── orders_repository.dart
│       └── returns_repository.dart
│
├── providers/
│   ├── orders_providers.dart
│   └── returns_providers.dart
│
└── presentation/
    ├── screens/
    │   ├── orders_list_screen.dart
    │   ├── order_detail_screen.dart
    │   ├── return_request_screen.dart
    │   └── returns_list_screen.dart
    └── widgets/
        ├── order_card.dart
        ├── order_status_badge.dart
        ├── order_timeline.dart
        ├── shipment_tracking.dart
        ├── return_items_selector.dart
        └── invoice_card.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. Order

```dart
enum OrderStatus {
  pending,
  paid,
  processing,
  shipped,
  delivered,
  cancelled,
  refunded;
  
  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return 'Pendiente';
      case OrderStatus.paid:
        return 'Pagado';
      case OrderStatus.processing:
        return 'Procesando';
      case OrderStatus.shipped:
        return 'Enviado';
      case OrderStatus.delivered:
        return 'Entregado';
      case OrderStatus.cancelled:
        return 'Cancelado';
      case OrderStatus.refunded:
        return 'Reembolsado';
    }
  }
  
  Color get color {
    switch (this) {
      case OrderStatus.pending:
      case OrderStatus.paid:
        return AppColors.warning;
      case OrderStatus.processing:
      case OrderStatus.shipped:
        return AppColors.info;
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
        return AppColors.error;
    }
  }
}

@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    required int orderNumber,
    required String customerId,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    required String shippingCountry,
    required double totalAmount,
    required OrderStatus status,
    String? stripeSessionId,
    @Default(0.0) double refundedAmount,
    DateTime? deliveredAt,
    required DateTime createdAt,
    @Default([]) List<OrderItem> items,
    OrderShipment? shipment,
    Invoice? invoice,
  }) = _Order;
  
  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  
  const Order._();
  
  String get displayOrderNumber => '#$orderNumber';
  
  bool get canCancel => 
      status == OrderStatus.pending || 
      status == OrderStatus.paid;
  
  bool get canReturn {
    if (status != OrderStatus.delivered) return false;
    if (deliveredAt == null) return false;
    
    final daysSinceDelivery = DateTime.now().difference(deliveredAt!).inDays;
    return daysSinceDelivery <= 30; // Ventana de 30 días
  }
  
  bool get canRequestInvoice =>
      status == OrderStatus.delivered ||
      status == OrderStatus.shipped;
}
```

### 2. OrderItem

```dart
@freezed
class OrderItem with _$OrderItem {
  const factory OrderItem({
    required String id,
    required String orderId,
    String? productId,
    String? variantId,
    required int quantity,
    required double priceAtPurchase,
    // Relaciones
    Product? product,
    ProductVariant? variant,
  }) = _OrderItem;
  
  factory OrderItem.fromJson(Map<String, dynamic> json) => 
      _$OrderItemFromJson(json);
  
  const OrderItem._();
  
  double get subtotal => priceAtPurchase * quantity;
}
```

### 3. OrderShipment

```dart
@freezed
class OrderShipment with _$OrderShipment {
  const factory OrderShipment({
    required String id,
    required String orderId,
    required String carrier,
    String? trackingNumber,
    String? trackingUrl,
    required DateTime shippedAt,
    DateTime? createdAt,
  }) = _OrderShipment;
  
  factory OrderShipment.fromJson(Map<String, dynamic> json) => 
      _$OrderShipmentFromJson(json);
  
  const OrderShipment._();
  
  bool get hasTracking => trackingNumber != null;
}
```

### 4. ReturnRequest

```dart
enum ReturnStatus {
  pending,
  approved,
  rejected,
  completed;
  
  String get displayName {
    switch (this) {
      case ReturnStatus.pending:
        return 'Pendiente';
      case ReturnStatus.approved:
        return 'Aprobada';
      case ReturnStatus.rejected:
        return 'Rechazada';
      case ReturnStatus.completed:
        return 'Completada';
    }
  }
}

@freezed
class ReturnRequest with _$ReturnRequest {
  const factory ReturnRequest({
    required String id,
    required String orderId,
    required String customerId,
    required String reason,
    String? comments,
    required ReturnStatus status,
    double? refundAmount,
    String? returnLabelUrl,
    required DateTime createdAt,
    @Default([]) List<ReturnItem> items,
    Order? order,
  }) = _ReturnRequest;
  
  factory ReturnRequest.fromJson(Map<String, dynamic> json) => 
      _$ReturnRequestFromJson(json);
}
```

### 5. ReturnItem

```dart
@freezed
class ReturnItem with _$ReturnItem {
  const factory ReturnItem({
    required String id,
    required String returnId,
    required String orderItemId,
    required int quantity,
    OrderItem? orderItem,
  }) = _ReturnItem;
  
  factory ReturnItem.fromJson(Map<String, dynamic> json) => 
      _$ReturnItemFromJson(json);
}
```

### 6. Invoice

```dart
@freezed
class Invoice with _$Invoice {
  const factory Invoice({
    required String id,
    required String orderId,
    required String invoiceNumber,
    String? customerNif,
    String? pdfUrl,
    required DateTime generatedAt,
  }) = _Invoice;
  
  factory Invoice.fromJson(Map<String, dynamic> json) => 
      _$InvoiceFromJson(json);
}
```

## 🔌 Repository (Data Layer)

### Orders Repository

```dart
abstract class OrdersRepository {
  Future<List<Order>> getCustomerOrders(String customerId);
  Future<Order> getOrderDetail(String orderId);
  Future<void> cancelOrder(String orderId);
}

class OrdersRepositoryImpl implements OrdersRepository {
  final OrdersDatasource _datasource;
  
  @override
  Future<List<Order>> getCustomerOrders(String customerId) async {
    final result = await _datasource.getCustomerOrders(customerId);
    return result.map((json) => Order.fromJson(json)).toList();
  }
  
  @override
  Future<Order> getOrderDetail(String orderId) async {
    final result = await _datasource.getOrderDetail(orderId);
    return Order.fromJson(result);
  }
  
  @override
  Future<void> cancelOrder(String orderId) async {
    await _datasource.cancelOrder(orderId);
  }
}
```

### Returns Repository

```dart
abstract class ReturnsRepository {
  Future<String> createReturnRequest({
    required String orderId,
    required String reason,
    String? comments,
    required List<Map<String, dynamic>> items,
  });
  
  Future<List<ReturnRequest>> getCustomerReturns(String customerId);
  Future<ReturnRequest> getReturnDetail(String returnId);
}
```

## 🎣 Providers (Riverpod)

```dart
// Orders
@riverpod
Future<List<Order>> customerOrders(CustomerOrdersRef ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) throw Exception('Usuario no autenticado');
  
  final repository = ref.watch(ordersRepositoryProvider);
  return repository.getCustomerOrders(user.id);
}

@riverpod
Future<Order> orderDetail(OrderDetailRef ref, String orderId) async {
  final repository = ref.watch(ordersRepositoryProvider);
  return repository.getOrderDetail(orderId);
}

@riverpod
class OrderController extends _$OrderController {
  @override
  FutureOr<void> build() {}
  
  Future<void> cancelOrder(String orderId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(ordersRepositoryProvider);
      await repository.cancelOrder(orderId);
      // Invalidar lista de pedidos
      ref.invalidate(customerOrdersProvider);
    });
  }
}

// Returns
@riverpod
Future<List<ReturnRequest>> customerReturns(CustomerReturnsRef ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) throw Exception('Usuario no autenticado');
  
  final repository = ref.watch(returnsRepositoryProvider);
  return repository.getCustomerReturns(user.id);
}

@riverpod
class ReturnController extends _$ReturnController {
  @override
  FutureOr<void> build() {}
  
  Future<String> createReturn({
    required String orderId,
    required String reason,
    String? comments,
    required List<Map<String, dynamic>> items,
  }) async {
    final repository = ref.read(returnsRepositoryProvider);
    return repository.createReturnRequest(
      orderId: orderId,
      reason: reason,
      comments: comments,
      items: items,
    );
  }
}
```

## 🖼️ Pantallas de Presentación

### 1. OrdersListScreen

**Ruta**: `/cuenta/pedidos`

**Elementos UI:**
- AppBar con título "Mis Pedidos"
- Filtros (tabs): Todos, Pendientes, Enviados, Entregados
- Lista de OrderCard
- Pull to refresh
- Empty state si no hay pedidos

**Estados:**
- Loading: ShimmerLoading
- Error: ErrorView con retry
- Empty: EmptyState "No tienes pedidos"
- Success: Lista de pedidos

**Especificaciones:**
- Lista con separadores
- Ordenar por fecha desc (más reciente primero)
- Tap en card → Navegar a detalle

### 2. OrderDetailScreen

**Ruta**: `/cuenta/pedidos/:id`

**Secciones:**

1. **Header**
   - Número de pedido (#1234)
   - OrderStatusBadge
   - Fecha de creación

2. **OrderTimeline**
   - Línea temporal con estados del pedido
   - Iconos y fechas por cada estado

3. **Productos**
   - Lista de OrderItems con:
     - Imagen thumbnail
     - Nombre + talla
     - Cantidad × precio
     - Subtotal

4. **Dirección de Envío**
   - Card con dirección completa
   - Icon: map-pin

5. **Tracking** (si existe shipment)
   - ShipmentTracking widget
   - Carrier, tracking number
   - Botón "Ver Seguimiento" (abre tracking_url)

6. **Resumen de Pago**
   - Subtotal, envío, descuento, total
   - Método de pago (Stripe)

7. **Acciones** (botones según estado)
   - "Cancelar Pedido" (si canCancel)
   - "Solicitar Devolución" (si canReturn)
   - "Solicitar Factura" (si canRequestInvoice)
   - "Descargar Factura" (si ya existe invoice)

### 3. ReturnRequestScreen

**Ruta**: `/cuenta/pedidos/:id/devolucion`

**Props**: orderId (desde navegación)

**Flujo:**

1. **Cargar pedido**
   - Verificar que se puede devolver (canReturn)
   - Mostrar lista de items

2. **Seleccionar items a devolver**
   - ReturnItemsSelector (checkboxes)
   - Cantidad a devolver por item (spinner)

3. **Motivo de devolución**
   - Dropdown con opciones:
     * "Talla incorrecta"
     * "Producto defectuoso"
     * "No coincide con la descripción"
     * "Cambié de opinión"
     * "Otro"
   - TextField para comentarios adicionales

4. **Revisión**
   - Resumen de items a devolver
   - Monto estimado de reembolso
   - Términos y condiciones (checkbox)

5. **Botón "Solicitar Devolución"**
   - Validar que al menos un item está seleccionado
   - Validar motivo y aceptación de términos
   - Crear return request
   - Navegar a confirmación

**Estados:**
- Loading: Cargando pedido
- Form: Formulario completo
- Submitting: Procesando solicitud
- Success: Confirmación y navegar a returns list

### 4. ReturnsListScreen

**Ruta**: `/cuenta/devoluciones`

**Elementos UI:**
- AppBar con título "Mis Devoluciones"
- Lista de cards de ReturnRequest
- Cada card muestra:
  - Número de pedido relacionado
  - Fecha de solicitud
  - Estado (pending, approved, rejected, completed)
  - Monto de reembolso (si aplica)
- Tap en card → Ver detalle

## 🎨 Widgets Personalizados

### 1. OrderCard

**Ubicación**: `lib/features/orders/presentation/widgets/order_card.dart`

**Props:**
- order: Order
- onTap: VoidCallback

**Layout:**
```
╔════════════════════════════════╗
║ #1234             [BADGE]      ║
║ 21 Ene 2026                    ║
║ ────────────────────────────── ║
║ 3 productos        €67.50      ║
╚════════════════════════════════╝
```

**Elementos:**
- Número de pedido (headingMedium)
- OrderStatusBadge
- Fecha (bodySmall, muted)
- Divider
- Resumen: cantidad de items + total

**Especificaciones:**
- AppCard con onTap
- Padding: AppSpacing.md
- Spacing: AppSpacing.gapSm

### 2. OrderStatusBadge

**Ubicación**: `lib/features/orders/presentation/widgets/order_status_badge.dart`

**Props:**
- status: OrderStatus

**Implementación:**
- AppBadge con color según status
- Texto: status.displayName
- Color: status.color

### 3. OrderTimeline

**Ubicación**: `lib/features/orders/presentation/widgets/order_timeline.dart`

**Props:**
- order: Order

**Elementos:**
- Línea vertical con dots
- Steps del pedido:
  1. Pedido realizado (createdAt)
  2. Pago confirmado (si status >= paid)
  3. En preparación (si status >= processing)
  4. Enviado (si status >= shipped, con fecha shipment.shippedAt)
  5. Entregado (si status == delivered, con deliveredAt)

**Estados:**
- Completed: Check icon, color success
- Current: Dot pulsante, color primary
- Pending: Dot gris, color muted

**Especificaciones:**
- Usar Timeline o Column con CustomPaint para líneas
- Icon size: 24px
- Font: bodySmall para fechas, bodyMedium para estados

### 4. ShipmentTracking

**Ubicación**: `lib/features/orders/presentation/widgets/shipment_tracking.dart`

**Props:**
- shipment: OrderShipment

**Layout:**
```
📦 Información de Envío
────────────────────────
Transportista: SEUR
Número de seguimiento: 123456789

[Ver Seguimiento] ↗
```

**Elementos:**
- Icon: package
- Carrier name
- Tracking number (mono font)
- AppButton.secondary "Ver Seguimiento" (abre URL externa)

### 5. ReturnItemsSelector

**Ubicación**: `lib/features/orders/presentation/widgets/return_items_selector.dart`

**Props:**
- orderItems: List<OrderItem>
- onSelectionChanged: Function(List<ReturnItemInput>)

**Layout:**
```
[ ✓ ] [ Imagen ] Producto 1
                 Talla: M
                 Cantidad: [ - ] [ 1 ] [ + ]
      
[ ] [ Imagen ] Producto 2
               Talla: L
               (no seleccionado)
```

**Elementos:**
- Checkbox para seleccionar
- Imagen del producto
- Nombre + talla
- Spinner de cantidad (solo si checked)
- Validación: cantidad <= cantidad original

### 6. InvoiceCard

**Ubicación**: `lib/features/orders/presentation/widgets/invoice_card.dart`

**Props:**
- invoice: Invoice?
- orderId: String
- onRequest: VoidCallback (si invoice == null)

**Estados:**
- No existe: Botón "Solicitar Factura"
- Existe: Botón "Descargar Factura PDF"

**Layout si existe:**
```
╔════════════════════════════════╗
║ 🧾 Factura                     ║
║ INV-2026-0001                  ║
║ Generada: 21 Ene 2026          ║
║ [Descargar PDF] ↓              ║
╚════════════════════════════════╝
```

## 🔧 Lógica de Negocio

### Validación de Devoluciones

```dart
bool canReturnOrder(Order order) {
  // 1. Solo pedidos entregados
  if (order.status != OrderStatus.delivered) return false;
  
  // 2. Debe tener fecha de entrega
  if (order.deliveredAt == null) return false;
  
  // 3. Dentro de ventana de 30 días
  final daysSinceDelivery = DateTime.now().difference(order.deliveredAt!).inDays;
  return daysSinceDelivery <= 30;
}
```

### Cálculo de Reembolso

El servidor calcula el reembolso usando la función RPC:
- Suma el precio de los items devueltos
- Resta el costo de envío proporcional (si aplica)
- Retorna el monto final

### Solicitud de Factura

Flujo:
1. Usuario solicita factura (ingresa NIF)
2. Validar formato de NIF español
3. Llamar a RPC function `request_invoice`
4. Server genera PDF y sube a Supabase Storage
5. Retorna invoice_id
6. Usuario puede descargar PDF

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados y generados
- [ ] Repositories implementados
- [ ] Providers de orders y returns
- [ ] OrdersListScreen con filtros
- [ ] OrderDetailScreen con todas las secciones
- [ ] OrderCard con estados visuales
- [ ] OrderStatusBadge con colores correctos
- [ ] OrderTimeline funcional
- [ ] ShipmentTracking con link externo
- [ ] ReturnRequestScreen con formulario completo
- [ ] ReturnItemsSelector con validaciones
- [ ] InvoiceCard con descarga PDF
- [ ] Cancelación de pedidos funciona
- [ ] Solicitud de devolución funciona

### Tests Manuales

1. **Ver pedidos:**
   - Lista carga correctamente
   - Filtros funcionan
   - Tap en pedido → navega a detalle

2. **Detalle de pedido:**
   - Toda la info se muestra correctamente
   - Timeline refleja estado actual
   - Tracking link funciona (si existe)
   - Botones de acción aparecen según reglas

3. **Cancelar pedido:**
   - Solo disponible si status = pending/paid
   - Confirmación antes de cancelar
   - Order cambia a cancelled
   - Stock se restaura

4. **Solicitar devolución:**
   - Solo disponible en delivered < 30 días
   - Seleccionar items
   - Completar formulario
   - Enviar solicitud
   - Aparece en lista de devoluciones

5. **Factura:**
   - Solicitar factura (ingresar NIF)
   - PDF se genera
   - Descargar PDF funciona
   - PDF se abre correctamente

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 10: Perfil de Usuario** - Implementar edición de perfil, gestión de direcciones y preferencias.

---

**Tiempo Estimado**: 8-10 horas
**Complejidad**: Alta
**Dependencias**: Módulos 01-08 completados
