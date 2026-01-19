# Módulo Facturas - Implementación Flutter

## 1. Modelos de Datos

```dart
// lib/features/invoices/domain/models/invoice.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'invoice.freezed.dart';
part 'invoice.g.dart';

/// Información de factura existente
@freezed
class Invoice with _$Invoice {
  const factory Invoice({
    required String id,
    required String invoiceNumber,
    required DateTime issuedAt,
    String? pdfUrl,
    required String customerNif,
    required String customerFiscalName,
    required String customerFiscalAddress,
    required double subtotal,
    required double taxRate,
    required double taxAmount,
    required double total,
  }) = _Invoice;

  factory Invoice.fromJson(Map<String, dynamic> json) => _$InvoiceFromJson(json);
}

/// Datos para solicitar factura
@freezed
class InvoiceRequest with _$InvoiceRequest {
  const factory InvoiceRequest({
    required String orderId,
    required String customerNif,
    required String customerFiscalName,
    required String customerFiscalAddress,
  }) = _InvoiceRequest;

  factory InvoiceRequest.fromJson(Map<String, dynamic> json) => 
      _$InvoiceRequestFromJson(json);
}

/// Estado de la solicitud de factura
@freezed
class InvoiceState with _$InvoiceState {
  const factory InvoiceState({
    Invoice? existingInvoice,
    @Default(false) bool isLoading,
    @Default(false) bool isRequesting,
    String? error,
    String? successMessage,
  }) = _InvoiceState;
}
```

---

## 2. Repositorio

```dart
// lib/features/invoices/data/repositories/invoices_repository.dart

import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

import '../../domain/models/invoice.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../../core/config/env_config.dart';

final invoicesRepositoryProvider = Provider<InvoicesRepository>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return InvoicesRepository(supabase);
});

class InvoicesRepository {
  final SupabaseClient _supabase;

  InvoicesRepository(this._supabase);

  /// Verifica si existe factura para un pedido
  Future<Invoice?> checkInvoice(String orderId) async {
    final response = await _supabase
        .from('invoices')
        .select()
        .eq('order_id', orderId)
        .maybeSingle();

    if (response == null) return null;
    return Invoice.fromJson(_mapInvoiceResponse(response));
  }

  /// Solicita/genera factura
  /// Retorna el archivo PDF descargado y la información de factura
  Future<({File pdf, String invoiceNumber, String? pdfUrl})> requestInvoice({
    required String orderId,
    required String customerNif,
    required String customerFiscalName,
    required String customerFiscalAddress,
  }) async {
    final session = _supabase.auth.currentSession;
    if (session == null) throw Exception('No autenticado');

    // Llamar al API endpoint
    final response = await http.post(
      Uri.parse('${EnvConfig.supabaseUrl}/functions/v1/request-invoice'),
      headers: {
        'Authorization': 'Bearer ${session.accessToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'orderId': orderId,
        'customerNif': customerNif,
        'customerFiscalName': customerFiscalName,
        'customerFiscalAddress': customerFiscalAddress,
      }),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Error al generar factura');
    }

    // Obtener headers
    final invoiceNumber = response.headers['x-invoice-number'] ?? 'factura';
    final pdfUrl = response.headers['x-invoice-url'];

    // Guardar PDF temporalmente
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/$invoiceNumber.pdf');
    await file.writeAsBytes(response.bodyBytes);

    return (pdf: file, invoiceNumber: invoiceNumber, pdfUrl: pdfUrl);
  }

  /// Descarga PDF existente desde URL
  Future<File> downloadInvoice(String pdfUrl, String invoiceNumber) async {
    final response = await http.get(Uri.parse(pdfUrl));
    
    if (response.statusCode != 200) {
      throw Exception('Error al descargar factura');
    }

    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/$invoiceNumber.pdf');
    await file.writeAsBytes(response.bodyBytes);
    
    return file;
  }

  Map<String, dynamic> _mapInvoiceResponse(Map<String, dynamic> data) {
    return {
      'id': data['id'],
      'invoiceNumber': data['invoice_number'],
      'issuedAt': data['issued_at'],
      'pdfUrl': data['pdf_url'],
      'customerNif': data['customer_nif'],
      'customerFiscalName': data['customer_fiscal_name'],
      'customerFiscalAddress': data['customer_fiscal_address'],
      'subtotal': data['subtotal'],
      'taxRate': data['tax_rate'],
      'taxAmount': data['tax_amount'],
      'total': data['total'],
    };
  }
}
```

---

## 3. Provider

```dart
// lib/features/invoices/providers/invoice_provider.dart

import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:open_file/open_file.dart';
import 'package:share_plus/share_plus.dart';

import '../data/repositories/invoices_repository.dart';
import '../domain/models/invoice.dart';

/// Provider para el estado de factura de un pedido específico
@riverpod
class OrderInvoice extends _$OrderInvoice {
  @override
  Future<InvoiceState> build(String orderId) async {
    final repository = ref.watch(invoicesRepositoryProvider);
    
    try {
      final invoice = await repository.checkInvoice(orderId);
      return InvoiceState(existingInvoice: invoice);
    } catch (e) {
      return InvoiceState(error: e.toString());
    }
  }

  /// Solicita una nueva factura
  Future<void> requestInvoice({
    required String customerNif,
    required String customerFiscalName,
    required String customerFiscalAddress,
  }) async {
    final current = state.valueOrNull ?? const InvoiceState();
    state = AsyncValue.data(current.copyWith(isRequesting: true, error: null));

    try {
      final repository = ref.read(invoicesRepositoryProvider);
      final result = await repository.requestInvoice(
        orderId: orderId,
        customerNif: customerNif,
        customerFiscalName: customerFiscalName,
        customerFiscalAddress: customerFiscalAddress,
      );

      // Abrir PDF
      await OpenFile.open(result.pdf.path);

      // Actualizar estado con factura existente
      final newInvoice = await repository.checkInvoice(orderId);
      
      state = AsyncValue.data(InvoiceState(
        existingInvoice: newInvoice,
        successMessage: 'Factura generada correctamente',
      ));
    } catch (e) {
      state = AsyncValue.data(current.copyWith(
        isRequesting: false,
        error: e.toString(),
      ));
    }
  }

  /// Descarga factura existente
  Future<void> downloadExistingInvoice() async {
    final current = state.valueOrNull;
    final invoice = current?.existingInvoice;
    if (invoice?.pdfUrl == null) return;

    state = AsyncValue.data(current!.copyWith(isLoading: true));

    try {
      final repository = ref.read(invoicesRepositoryProvider);
      final file = await repository.downloadInvoice(
        invoice!.pdfUrl!,
        invoice.invoiceNumber,
      );

      await OpenFile.open(file.path);

      state = AsyncValue.data(current.copyWith(isLoading: false));
    } catch (e) {
      state = AsyncValue.data(current!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
    }
  }

  /// Comparte factura
  Future<void> shareInvoice() async {
    final invoice = state.valueOrNull?.existingInvoice;
    if (invoice?.pdfUrl == null) return;

    await Share.share(
      invoice!.pdfUrl!,
      subject: 'Factura ${invoice.invoiceNumber}',
    );
  }

  void clearMessages() {
    final current = state.valueOrNull;
    if (current != null) {
      state = AsyncValue.data(current.copyWith(
        error: null,
        successMessage: null,
      ));
    }
  }
}
```

---

## 4. Widget de Factura

```dart
// lib/features/invoices/presentation/widgets/invoice_card.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../providers/invoice_provider.dart';
import '../dialogs/request_invoice_dialog.dart';
import '../../../../core/theme/app_spacing.dart';

class InvoiceCard extends ConsumerWidget {
  final String orderId;
  final String orderNumber;
  final String orderStatus;

  const InvoiceCard({
    required this.orderId,
    required this.orderNumber,
    required this.orderStatus,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Solo mostrar para pedidos pagados/enviados/entregados
    if (!['paid', 'shipped', 'delivered'].contains(orderStatus)) {
      return const SizedBox.shrink();
    }

    final invoiceState = ref.watch(orderInvoiceProvider(orderId));
    final theme = Theme.of(context);

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
            Text(
              'Factura',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),

            invoiceState.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (error, _) => _ErrorContent(
                error: error.toString(),
                onRetry: () => ref.invalidate(orderInvoiceProvider(orderId)),
              ),
              data: (state) {
                final invoice = state.existingInvoice;
                final hasDownload = invoice?.pdfUrl != null;

                if (hasDownload) {
                  return _DownloadContent(
                    invoiceNumber: invoice!.invoiceNumber,
                    isLoading: state.isLoading,
                    onDownload: () => ref
                        .read(orderInvoiceProvider(orderId).notifier)
                        .downloadExistingInvoice(),
                    onShare: () => ref
                        .read(orderInvoiceProvider(orderId).notifier)
                        .shareInvoice(),
                  );
                } else {
                  return _RequestContent(
                    isZombie: invoice != null, // Existe pero sin URL
                    isRequesting: state.isRequesting,
                    onRequest: () => _showRequestDialog(context, ref),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showRequestDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => RequestInvoiceDialog(
        orderId: orderId,
        orderNumber: orderNumber,
        onSubmit: (nif, name, address) {
          ref.read(orderInvoiceProvider(orderId).notifier).requestInvoice(
            customerNif: nif,
            customerFiscalName: name,
            customerFiscalAddress: address,
          );
          Navigator.pop(context);
        },
      ),
    );
  }
}

class _DownloadContent extends StatelessWidget {
  final String invoiceNumber;
  final bool isLoading;
  final VoidCallback onDownload;
  final VoidCallback onShare;

  const _DownloadContent({
    required this.invoiceNumber,
    required this.isLoading,
    required this.onDownload,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.1),
            borderRadius: AppSpacing.borderRadiusSm,
            border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.2),
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: const Icon(
                  LucideIcons.fileText,
                  color: Colors.green,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Factura disponible',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      'Nº $invoiceNumber',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                onPressed: isLoading ? null : onDownload,
                icon: isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(LucideIcons.download, size: 18),
                label: const Text('Descargar'),
              ),
            ),
            const SizedBox(width: 8),
            OutlinedButton(
              onPressed: onShare,
              child: const Icon(LucideIcons.share2, size: 18),
            ),
          ],
        ),
      ],
    );
  }
}

class _RequestContent extends StatelessWidget {
  final bool isZombie;
  final bool isRequesting;
  final VoidCallback onRequest;

  const _RequestContent({
    required this.isZombie,
    required this.isRequesting,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Text(
          isZombie
              ? 'Hubo un error al generar la factura. Por favor, solicítala de nuevo.'
              : 'Si necesitas una factura con tus datos fiscales, puedes solicitarla aquí.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: isRequesting ? null : onRequest,
            icon: isRequesting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(LucideIcons.fileText, size: 18),
            label: Text(isZombie ? 'Regenerar Factura' : 'Solicitar Factura'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.blue,
              side: BorderSide(color: Colors.blue.withValues(alpha: 0.3)),
              backgroundColor: Colors.blue.withValues(alpha: 0.1),
            ),
          ),
        ),
      ],
    );
  }
}

class _ErrorContent extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorContent({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          error,
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: onRetry,
          child: const Text('Reintentar'),
        ),
      ],
    );
  }
}
```

---

## 5. Diálogo de Solicitud

```dart
// lib/features/invoices/presentation/dialogs/request_invoice_dialog.dart

import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../../core/theme/app_spacing.dart';

class RequestInvoiceDialog extends StatefulWidget {
  final String orderId;
  final String orderNumber;
  final void Function(String nif, String name, String address) onSubmit;

  const RequestInvoiceDialog({
    required this.orderId,
    required this.orderNumber,
    required this.onSubmit,
    super.key,
  });

  @override
  State<RequestInvoiceDialog> createState() => _RequestInvoiceDialogState();
}

class _RequestInvoiceDialogState extends State<RequestInvoiceDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nifController = TextEditingController();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _nifController.dispose();
    _nameController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusLg,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: AppSpacing.paddingXl,
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Solicitar Factura',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Pedido ${widget.orderNumber}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // NIF/CIF
                TextFormField(
                  controller: _nifController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'NIF / CIF *',
                    hintText: '12345678A o B12345678',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Campo requerido';
                    }
                    if (!RegExp(r'^[A-Z0-9]{8,9}$').hasMatch(value)) {
                      return 'Formato inválido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Nombre/Razón Social
                TextFormField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Nombre / Razón Social *',
                    hintText: 'Nombre completo o empresa',
                  ),
                  validator: (value) {
                    if (value == null || value.length < 2) {
                      return 'Mínimo 2 caracteres';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Dirección Fiscal
                TextFormField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'Dirección Fiscal *',
                    hintText: 'Calle, número, CP, ciudad, provincia',
                  ),
                  maxLines: 2,
                  validator: (value) {
                    if (value == null || value.length < 10) {
                      return 'Dirección demasiado corta';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Nota informativa
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.1),
                    borderRadius: AppSpacing.borderRadiusSm,
                    border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        LucideIcons.info,
                        size: 16,
                        color: Colors.amber.shade700,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'La factura se generará y descargará automáticamente.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.amber.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Botones
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: _submit,
                        child: const Text('Generar'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      widget.onSubmit(
        _nifController.text.toUpperCase(),
        _nameController.text,
        _addressController.text,
      );
    }
  }
}
```

---

## 6. Integración en Detalle de Pedido

```dart
// En order_detail_screen.dart

@override
Widget build(BuildContext context, WidgetRef ref) {
  // ... otros widgets del pedido
  
  return Scaffold(
    body: SingleChildScrollView(
      child: Column(
        children: [
          // ... productos, resumen, envío, etc.
          
          // Card de factura
          Padding(
            padding: const EdgeInsets.all(16),
            child: InvoiceCard(
              orderId: order.id,
              orderNumber: order.displayId,
              orderStatus: order.status,
            ),
          ),
          
          // ... otras secciones
        ],
      ),
    ),
  );
}
```

---

## 7. Dependencias Adicionales

```yaml
# En pubspec.yaml
dependencies:
  open_file: ^3.3.2      # Para abrir PDF
  share_plus: ^7.2.1     # Para compartir
  path_provider: ^2.1.1  # Para guardar archivos temporales
```

---

## 8. Checklist de Implementación

### Modelos
- [ ] `Invoice` - Factura con todos los campos
- [ ] `InvoiceRequest` - Datos para solicitar factura
- [ ] `InvoiceState` - Estado de carga/solicitud

### Repositorio
- [ ] `checkInvoice()` - Verifica si existe
- [ ] `requestInvoice()` - Genera y descarga PDF
- [ ] `downloadInvoice()` - Descarga PDF existente

### Provider
- [ ] `orderInvoiceProvider(orderId)` - Estado por pedido
- [ ] `requestInvoice()` - Solicita nueva factura
- [ ] `downloadExistingInvoice()` - Descarga existente
- [ ] `shareInvoice()` - Comparte URL

### Widgets
- [ ] `InvoiceCard` - Card principal
- [ ] `_DownloadContent` - Si existe factura
- [ ] `_RequestContent` - Si no existe
- [ ] `RequestInvoiceDialog` - Modal con formulario

### Integración
- [ ] Añadir a OrderDetailScreen
- [ ] Validar solo para status: paid/shipped/delivered
