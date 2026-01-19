# Módulo 5: Newsletter - Fase 2: Diseño (UI Components)

## 1. Widget: Newsletter Form (Público)

```dart
// lib/features/newsletter/presentation/widgets/newsletter_form.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/newsletter_provider.dart';
import '../../domain/constants/newsletter_config.dart';

/// Formulario de suscripción para footer público
class NewsletterForm extends ConsumerStatefulWidget {
  const NewsletterForm({super.key});
  
  @override
  ConsumerState<NewsletterForm> createState() => _NewsletterFormState();
}

class _NewsletterFormState extends ConsumerState<NewsletterForm> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  
  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(newsletterSubscriptionProvider);
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Título
        Text(
          'Newsletter',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        
        // Descripción
        Text(
          'Recibe las últimas novedades y ofertas exclusivas.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
          ),
        ),
        const SizedBox(height: 16),
        
        // Estado: Éxito
        if (state.isSuccess)
          _SuccessMessage(
            message: state.successMessage ?? '¡Gracias por suscribirte! 🎉',
          )
        else
          _SubscriptionForm(
            controller: _controller,
            focusNode: _focusNode,
            isLoading: state.isLoading,
            errorMessage: state.errorMessage,
            onSubmit: _handleSubmit,
          ),
      ],
    );
  }
  
  Future<void> _handleSubmit() async {
    final email = _controller.text.trim();
    
    if (!isValidEmail(email)) {
      ref.read(newsletterSubscriptionProvider.notifier).setError(
        'Por favor, introduce un email válido',
      );
      return;
    }
    
    final success = await ref
        .read(newsletterSubscriptionProvider.notifier)
        .subscribe(email);
    
    if (success) {
      _controller.clear();
      _focusNode.unfocus();
    }
  }
}

class _SubscriptionForm extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onSubmit;
  
  const _SubscriptionForm({
    required this.controller,
    required this.focusNode,
    required this.isLoading,
    required this.errorMessage,
    required this.onSubmit,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Input + Button
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                enabled: !isLoading,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => onSubmit(),
                decoration: InputDecoration(
                  hintText: 'tu@email.com',
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: theme.colorScheme.outline.withValues(alpha: 0.5),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: theme.colorScheme.primary,
                      width: 2,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              height: 44,
              child: FilledButton(
                onPressed: isLoading ? null : onSubmit,
                style: FilledButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : const Text('Suscribirse'),
              ),
            ),
          ],
        ),
        
        // Error message
        if (errorMessage != null) ...[
          const SizedBox(height: 8),
          Text(
            errorMessage!,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.error,
            ),
          ),
        ],
      ],
    );
  }
}

class _SuccessMessage extends StatelessWidget {
  final String message;
  
  const _SuccessMessage({required this.message});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green.shade400,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.green.shade400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 2. Widget: Campaign Status Badge

```dart
// lib/features/newsletter/presentation/widgets/campaign_status_badge.dart

import 'package:flutter/material.dart';
import '../../domain/enums/campaign_status.dart';

/// Badge de estado de campaña
class CampaignStatusBadge extends StatelessWidget {
  final CampaignStatus status;
  final bool showIcon;
  
  const CampaignStatusBadge({
    required this.status,
    this.showIcon = false,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            _StatusIcon(status: status),
            const SizedBox(width: 6),
          ],
          Text(
            status.label,
            style: TextStyle(
              color: status.color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusIcon extends StatelessWidget {
  final CampaignStatus status;
  
  const _StatusIcon({required this.status});
  
  @override
  Widget build(BuildContext context) {
    final icon = switch (status) {
      CampaignStatus.draft => Icons.edit_outlined,
      CampaignStatus.sending => Icons.send_outlined,
      CampaignStatus.sent => Icons.check_circle_outlined,
      CampaignStatus.failed => Icons.error_outline,
      CampaignStatus.paused => Icons.pause_circle_outline,
    };
    
    Widget iconWidget = Icon(
      icon,
      size: 14,
      color: status.color,
    );
    
    // Animación de rotación para "enviando"
    if (status == CampaignStatus.sending) {
      iconWidget = SizedBox(
        width: 14,
        height: 14,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation(status.color),
        ),
      );
    }
    
    return iconWidget;
  }
}
```

---

## 3. Widget: Campaign Card

```dart
// lib/features/newsletter/presentation/widgets/campaign_card.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/newsletter_campaign.dart';
import 'campaign_status_badge.dart';

/// Card de campaña para la lista
class CampaignCard extends StatelessWidget {
  final NewsletterCampaign campaign;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onSend;
  final VoidCallback? onDelete;
  
  const CampaignCard({
    required this.campaign,
    this.onTap,
    this.onEdit,
    this.onSend,
    this.onDelete,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('d MMM yyyy', 'es');
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Subject + Status
              Row(
                children: [
                  Expanded(
                    child: Text(
                      campaign.subject,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 12),
                  CampaignStatusBadge(status: campaign.status),
                ],
              ),
              
              const SizedBox(height: 8),
              
              // Meta info
              Row(
                children: [
                  // Fecha
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 14,
                    color: theme.colorScheme.outline,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    dateFormat.format(campaign.createdAt),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                  
                  // Stats de envío (si aplica)
                  if (campaign.status == CampaignStatus.sent) ...[
                    const SizedBox(width: 16),
                    Icon(
                      Icons.send_outlined,
                      size: 14,
                      color: theme.colorScheme.outline,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${campaign.sentCount} enviados',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.outline,
                      ),
                    ),
                    if (campaign.failedCount > 0) ...[
                      Text(
                        ' (${campaign.failedCount} fallidos)',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.error,
                        ),
                      ),
                    ],
                  ],
                  
                  // Error (si falló)
                  if (campaign.status == CampaignStatus.failed && 
                      campaign.lastError != null) ...[
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        campaign.lastError!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.error,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
              
              // Actions
              if (campaign.canEdit || campaign.canSend || onDelete != null) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (campaign.canEdit && onEdit != null)
                      TextButton.icon(
                        onPressed: onEdit,
                        icon: const Icon(Icons.edit_outlined, size: 18),
                        label: const Text('Editar'),
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    if (campaign.canSend && onSend != null)
                      TextButton.icon(
                        onPressed: onSend,
                        icon: const Icon(Icons.send_outlined, size: 18),
                        label: const Text('Enviar'),
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    if (campaign.canEdit && onDelete != null)
                      TextButton.icon(
                        onPressed: onDelete,
                        icon: Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: theme.colorScheme.error,
                        ),
                        label: Text(
                          'Eliminar',
                          style: TextStyle(color: theme.colorScheme.error),
                        ),
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 4. Widget: Subscriber List Tile

```dart
// lib/features/newsletter/presentation/widgets/subscriber_list_tile.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/newsletter_subscriber.dart';

/// Tile de suscriptor en la lista
class SubscriberListTile extends StatelessWidget {
  final NewsletterSubscriber subscriber;
  final VoidCallback? onToggleStatus;
  final bool isTogglingStatus;
  
  const SubscriberListTile({
    required this.subscriber,
    this.onToggleStatus,
    this.isTogglingStatus = false,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('d MMM yyyy', 'es');
    
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: _StatusIndicator(isActive: subscriber.isActive),
      title: Text(
        subscriber.email,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: subscriber.isActive 
              ? theme.colorScheme.onSurface 
              : theme.colorScheme.outline,
        ),
      ),
      subtitle: Text(
        dateFormat.format(subscriber.createdAt),
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.outline,
        ),
      ),
      trailing: isTogglingStatus
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : TextButton(
              onPressed: onToggleStatus,
              child: Text(
                subscriber.isActive ? 'Desactivar' : 'Activar',
                style: TextStyle(
                  color: subscriber.isActive 
                      ? theme.colorScheme.error 
                      : theme.colorScheme.primary,
                ),
              ),
            ),
    );
  }
}

class _StatusIndicator extends StatelessWidget {
  final bool isActive;
  
  const _StatusIndicator({required this.isActive});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? Colors.green : Colors.grey,
      ),
    );
  }
}
```

---

## 5. Widget: Send Progress Indicator

```dart
// lib/features/newsletter/presentation/widgets/send_progress_indicator.dart

import 'package:flutter/material.dart';

/// Indicador de progreso de envío de campaña
class SendProgressIndicator extends StatelessWidget {
  final int sentCount;
  final int failedCount;
  final int totalCount;
  final String? statusMessage;
  
  const SendProgressIndicator({
    required this.sentCount,
    required this.failedCount,
    required this.totalCount,
    this.statusMessage,
    super.key,
  });
  
  double get progress => totalCount > 0 
      ? (sentCount + failedCount) / totalCount 
      : 0;
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progreso',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                Text(
                  '${sentCount + failedCount} / $totalCount',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Progress bar
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 12,
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
                valueColor: AlwaysStoppedAnimation(
                  failedCount > 0 
                      ? Colors.amber 
                      : theme.colorScheme.primary,
                ),
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Stats row
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _StatChip(
                  icon: Icons.check_circle,
                  color: Colors.green,
                  label: '$sentCount enviados',
                ),
                if (failedCount > 0) ...[
                  const SizedBox(width: 16),
                  _StatChip(
                    icon: Icons.error,
                    color: Colors.red,
                    label: '$failedCount fallidos',
                  ),
                ],
              ],
            ),
            
            // Status message
            if (statusMessage != null) ...[
              const SizedBox(height: 12),
              Center(
                child: Text(
                  statusMessage!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  
  const _StatChip({
    required this.icon,
    required this.color,
    required this.label,
  });
  
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
```

---

## 6. Widget: Newsletter Stats Cards

```dart
// lib/features/newsletter/presentation/widgets/newsletter_stats_cards.dart

import 'package:flutter/material.dart';
import '../../data/models/newsletter_stats.dart';

/// Grid de estadísticas del newsletter
class NewsletterStatsCards extends StatelessWidget {
  final NewsletterStats stats;
  
  const NewsletterStatsCards({
    required this.stats,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 600 ? 4 : 2;
        
        return GridView.count(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _StatCard(
              title: 'Suscriptores Activos',
              value: '${stats.activeSubscribers}',
              color: Colors.green,
            ),
            _StatCard(
              title: 'Campañas Enviadas',
              value: '${stats.campaignsSent}',
              color: Colors.blue,
            ),
            _StatCard(
              title: 'Borradores',
              value: '${stats.campaignsDraft}',
              color: Colors.grey,
            ),
            _StatCard(
              title: 'Fallidas',
              value: '${stats.campaignsFailed}',
              color: Colors.red,
            ),
          ],
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  
  const _StatCard({
    required this.title,
    required this.value,
    required this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 7. Dialog: Send Confirmation

```dart
// lib/features/newsletter/presentation/dialogs/send_confirmation_dialog.dart

import 'package:flutter/material.dart';

/// Diálogo de confirmación antes de enviar campaña
class SendConfirmationDialog extends StatelessWidget {
  final String campaignSubject;
  final int subscriberCount;
  
  const SendConfirmationDialog({
    required this.campaignSubject,
    required this.subscriberCount,
    super.key,
  });
  
  /// Mostrar diálogo y retornar true si se confirma
  static Future<bool> show(
    BuildContext context, {
    required String campaignSubject,
    required int subscriberCount,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => SendConfirmationDialog(
        campaignSubject: campaignSubject,
        subscriberCount: subscriberCount,
      ),
    );
    return result ?? false;
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: const Row(
        children: [
          Icon(Icons.send, color: Colors.amber),
          SizedBox(width: 12),
          Text('Confirmar envío'),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '¿Estás seguro de que quieres enviar esta campaña?',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          
          // Campaign info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Asunto:',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                Text(
                  campaignSubject,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Destinatarios:',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                Text(
                  '$subscriberCount suscriptores activos',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Warning
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.amber.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber, color: Colors.amber, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Esta acción no se puede deshacer.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.amber.shade700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton.icon(
          onPressed: () => Navigator.of(context).pop(true),
          icon: const Icon(Icons.send, size: 18),
          label: const Text('Enviar ahora'),
        ),
      ],
    );
  }
}
```

---

## 8. Checklist de Widgets

### Públicos
- [ ] `NewsletterForm` - Formulario en footer
- [ ] Rate limit indicator (opcional)

### Admin - Listas
- [ ] `SubscriberListTile` - Item de suscriptor
- [ ] `CampaignCard` - Card de campaña
- [ ] `CampaignStatusBadge` - Badge de estado

### Admin - Dashboard
- [ ] `NewsletterStatsCards` - Grid de estadísticas

### Admin - Envío
- [ ] `SendProgressIndicator` - Progreso de envío
- [ ] `SendConfirmationDialog` - Confirmación

### Admin - Editor
- [ ] `HtmlContentEditor` - Editor con flutter_quill
- [ ] `HtmlPreviewCard` - Preview en WebView
