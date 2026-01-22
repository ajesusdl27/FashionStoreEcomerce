# Prompt para Fase 09: Pedidos y Devoluciones

## 📋 Contexto

Fases 01-08 completadas. Implementaré gestión de pedidos, tracking y sistema de devoluciones.

## 📚 Documentación

Lee: `Doc/Flutter/09-PEDIDOS-DEVOLUCIONES.md`

## ✅ Tareas

### 9.1: Modelos Freezed

Crear en `lib/features/orders/domain/models/`:

1. **order.dart**: OrderStatus enum, helpers (canCancel, canReturn)
2. **order_item.dart**: Con relaciones a product/variant
3. **order_shipment.dart**: Tracking info
4. **return_request.dart**: ReturnStatus enum
5. **return_item.dart**: Items devueltos
6. **invoice.dart**: Factura PDF

**EJECUTAR:** build_runner

**Checklist:**
- [ ] 6 modelos
- [ ] Enums con displayName
- [ ] build_runner OK

---

### 9.2: Repositories

**OrdersRepository**:
- getCustomerOrders(customerId)
- getOrderDetail(orderId)
- cancelOrder(orderId)

**ReturnsRepository**:
- createReturnRequest()
- getCustomerReturns(customerId)

**InvoicesRepository**:
- requestInvoice(orderId, nif)

**Checklist:**
- [ ] 3 repositories
- [ ] RPC calls correctos

---

### 9.3: Providers

```dart
// orders_providers.dart
@riverpod
Future<List<Order>> customerOrders(...) {
  // Llamar repository
}

@riverpod
Future<Order> orderDetail(ref, String orderId) {
  // Detalle con items, shipment
}

@riverpod
class OrderController extends _$OrderController {
  Future<void> cancelOrder(String id) async { /* ... */ }
}

// returns_providers.dart
@riverpod
class ReturnController extends _$ReturnController {
  Future<String> createReturn({...}) async { /* ... */ }
}
```

**EJECUTAR:** build_runner

**Checklist:**
- [ ] Providers creados
- [ ] build_runner OK

---

### 9.4: OrdersListScreen

**UI:**
- AppBar "Mis Pedidos"
- Tabs filtros: Todos, Pendientes, Enviados, Entregados
- Lista OrderCard
- Pull to refresh
- Empty: "No tienes pedidos"

**Checklist:**
- [ ] UI completa
- [ ] Filtros funcionan
- [ ] Tap → detalle

---

### 9.5: OrderDetailScreen

**Secciones:**
1. Header: #número, badge status, fecha
2. OrderTimeline: Estados del pedido
3. Items: Lista con imágenes
4. Dirección de envío: Card
5. Tracking: ShipmentTracking si existe
6. Resumen: Totales
7. Botones: Cancelar, Devolver, Factura

**Checklist:**
- [ ] 7 secciones
- [ ] Timeline visual
- [ ] Botones según estado

---

### 9.6: Widgets

**OrderCard**: Card resumen (número, fecha, total, status)

**OrderStatusBadge**: Badge con color según status

**OrderTimeline**: Línea temporal vertical con dots

**ShipmentTracking**: Info carrier + botón tracking URL

**Checklist:**
- [ ] 4 widgets
- [ ] Diseño correcto

---

### 9.7: ReturnRequestScreen

**UI:**
1. Lista items (checkboxes + spinners cantidad)
2. Dropdown motivo
3. TextField comentarios
4. Resumen reembolso estimado
5. Checkbox términos
6. Botón "Solicitar Devolución"

**Flujo:**
1. Seleccionar items
2. Elegir motivo
3. Confirmar
4. Crear return
5. Navegar a confirmación

**Checklist:**
- [ ] Selector items
- [ ] Validaciones
- [ ] Create return funciona

---

## 🧪 Verificación

**Tests:**
- [ ] Ver lista de pedidos
- [ ] Ver detalle completo
- [ ] Cancelar pedido (si pending/paid)
- [ ] Solicitar devolución (si delivered < 30 días)
- [ ] Tracking link funciona
- [ ] Solicitar factura

## ✅ Checklist Final

- [ ] Modelos + build_runner
- [ ] 3 Repositories
- [ ] Providers
- [ ] OrdersListScreen
- [ ] OrderDetailScreen
- [ ] ReturnRequestScreen
- [ ] Widgets (card, timeline, tracking)
- [ ] Tests pasados

## 📝 Reporte

```
✅ FASE 09 COMPLETADA

Archivos: [listar]
Tests: Orders ✅, Returns ✅, Tracking ✅

Estado: LISTO PARA FASE 10 (Perfil)
```

## 🎯 Próximo

**FASE-10-PERFIL.md**
