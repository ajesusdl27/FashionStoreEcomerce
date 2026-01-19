# Módulo 5: Newsletter - Fase 4: Frontend (Screens)

## 1. Dashboard Newsletter (Admin)

```dart
// lib/features/newsletter/presentation/screens/newsletter_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../admin/common/widgets/admin_scaffold.dart';
import '../../providers/campaigns_provider.dart';
import '../widgets/newsletter_stats_cards.dart';
import '../widgets/campaign_card.dart';

class NewsletterDashboardScreen extends ConsumerStatefulWidget {
  const NewsletterDashboardScreen({super.key});
  
  @override
  ConsumerState<NewsletterDashboardScreen> createState() => 
      _NewsletterDashboardScreenState();
}

class _NewsletterDashboardScreenState 
    extends ConsumerState<NewsletterDashboardScreen> {
  
  @override
  void initState() {
    super.initState();
    // Cargar campañas al iniciar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(campaignsListProvider.notifier).loadCampaigns();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final statsAsync = ref.watch(newsletterStatsProvider);
    final campaignsState = ref.watch(campaignsListProvider);
    
    return AdminScaffold(
      title: 'Newsletter',
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () {
            ref.invalidate(newsletterStatsProvider);
            ref.read(campaignsListProvider.notifier).loadCampaigns();
          },
          tooltip: 'Actualizar',
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/admin/newsletter/new'),
        icon: const Icon(Icons.add),
        label: const Text('Nueva Campaña'),
      ),
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(newsletterStatsProvider);
          await ref.read(campaignsListProvider.notifier).loadCampaigns();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Estadísticas
              statsAsync.when(
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (error, _) => Center(
                  child: Text('Error: $error'),
                ),
                data: (stats) => NewsletterStatsCards(stats: stats),
              ),
              
              const SizedBox(height: 24),
              
              // Link a suscriptores
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.outlineVariant
                        .withValues(alpha: 0.5),
                  ),
                ),
                child: ListTile(
                  leading: const Icon(Icons.people_outline),
                  title: const Text('Ver todos los suscriptores'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/admin/newsletter/subscribers'),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Título de campañas
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Campañas',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (campaignsState.campaigns.isNotEmpty)
                    TextButton(
                      onPressed: () {
                        // TODO: Filtros de campañas
                      },
                      child: const Text('Filtrar'),
                    ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Lista de campañas
              if (campaignsState.isLoading && campaignsState.campaigns.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (campaignsState.campaigns.isEmpty)
                _EmptyCampaignsView(
                  onCreateCampaign: () => context.push('/admin/newsletter/new'),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: campaignsState.campaigns.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final campaign = campaignsState.campaigns[index];
                    return CampaignCard(
                      campaign: campaign,
                      onEdit: campaign.canEdit
                          ? () => context.push('/admin/newsletter/edit/${campaign.id}')
                          : null,
                      onSend: campaign.canSend
                          ? () => context.push('/admin/newsletter/send/${campaign.id}')
                          : null,
                      onDelete: campaign.canEdit
                          ? () => _deleteCampaign(campaign.id, campaign.subject)
                          : null,
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
  
  Future<void> _deleteCampaign(String id, String subject) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar campaña'),
        content: Text('¿Eliminar "$subject"? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      final success = await ref
          .read(campaignsListProvider.notifier)
          .deleteCampaign(id);
      
      if (mounted && success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Campaña eliminada')),
        );
      }
    }
  }
}

class _EmptyCampaignsView extends StatelessWidget {
  final VoidCallback onCreateCampaign;
  
  const _EmptyCampaignsView({required this.onCreateCampaign});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.mail_outline,
              size: 64,
              color: theme.colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              'No hay campañas todavía',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Crea tu primera campaña de email',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onCreateCampaign,
              icon: const Icon(Icons.add),
              label: const Text('Crear Campaña'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 2. Pantalla de Suscriptores

```dart
// lib/features/newsletter/presentation/screens/subscribers_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

import '../../../admin/common/widgets/admin_scaffold.dart';
import '../../providers/subscribers_provider.dart';
import '../widgets/subscriber_list_tile.dart';

class SubscribersScreen extends ConsumerStatefulWidget {
  const SubscribersScreen({super.key});
  
  @override
  ConsumerState<SubscribersScreen> createState() => _SubscribersScreenState();
}

class _SubscribersScreenState extends ConsumerState<SubscribersScreen> {
  final _searchController = TextEditingController();
  bool? _filterActive;
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(subscribersListProvider.notifier).loadSubscribers(refresh: true);
    });
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(subscribersListProvider);
    final theme = Theme.of(context);
    
    return AdminScaffold(
      title: 'Suscriptores',
      actions: [
        IconButton(
          icon: const Icon(Icons.download),
          onPressed: _exportCsv,
          tooltip: 'Exportar CSV',
        ),
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => ref.read(subscribersListProvider.notifier)
              .loadSubscribers(refresh: true),
          tooltip: 'Actualizar',
        ),
      ],
      child: Column(
        children: [
          // Barra de búsqueda y filtros
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Búsqueda
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar por email...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  onChanged: (value) {
                    ref.read(subscribersListProvider.notifier).setSearch(value);
                  },
                ),
                
                const SizedBox(height: 12),
                
                // Filtros
                Row(
                  children: [
                    // Filtro de estado
                    Expanded(
                      child: SegmentedButton<bool?>(
                        segments: const [
                          ButtonSegment(
                            value: null,
                            label: Text('Todos'),
                          ),
                          ButtonSegment(
                            value: true,
                            label: Text('Activos'),
                            icon: Icon(Icons.check_circle_outline, size: 18),
                          ),
                          ButtonSegment(
                            value: false,
                            label: Text('Inactivos'),
                            icon: Icon(Icons.cancel_outlined, size: 18),
                          ),
                        ],
                        selected: {_filterActive},
                        onSelectionChanged: (selection) {
                          setState(() => _filterActive = selection.first);
                          ref.read(subscribersListProvider.notifier)
                              .setFilterActive(selection.first);
                        },
                      ),
                    ),
                  ],
                ),
                
                // Contador de resultados
                if (state.subscribers.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(
                      'Mostrando ${state.subscribers.length} suscriptores',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.outline,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          
          // Lista de suscriptores
          Expanded(
            child: state.isLoading && state.subscribers.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : state.subscribers.isEmpty
                    ? _EmptySubscribersView(hasFilters: _hasFilters)
                    : RefreshIndicator(
                        onRefresh: () async {
                          await ref.read(subscribersListProvider.notifier)
                              .loadSubscribers(refresh: true);
                        },
                        child: ListView.builder(
                          itemCount: state.subscribers.length + 
                              (state.hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index >= state.subscribers.length) {
                              // Cargar más
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                ref.read(subscribersListProvider.notifier)
                                    .loadSubscribers();
                              });
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }
                            
                            final subscriber = state.subscribers[index];
                            return SubscriberListTile(
                              subscriber: subscriber,
                              isTogglingStatus: state.isToggling(subscriber.id),
                              onToggleStatus: () {
                                ref.read(subscribersListProvider.notifier)
                                    .toggleSubscriberStatus(subscriber.id);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
  
  bool get _hasFilters => 
      _searchController.text.isNotEmpty || _filterActive != null;
  
  Future<void> _exportCsv() async {
    try {
      final csv = await ref.read(subscribersListProvider.notifier).exportToCsv();
      
      // Guardar en archivo temporal
      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/subscribers_${DateTime.now().millisecondsSinceEpoch}.csv');
      await file.writeAsString(csv);
      
      // Compartir
      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Suscriptores Newsletter FashionStore',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al exportar: $e')),
        );
      }
    }
  }
}

class _EmptySubscribersView extends StatelessWidget {
  final bool hasFilters;
  
  const _EmptySubscribersView({required this.hasFilters});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasFilters ? Icons.search_off : Icons.people_outline,
              size: 64,
              color: theme.colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              hasFilters
                  ? 'No se encontraron suscriptores'
                  : 'No hay suscriptores todavía',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              hasFilters
                  ? 'Prueba con otros filtros'
                  : 'Los usuarios pueden suscribirse desde la tienda',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 3. Pantalla de Formulario de Campaña

```dart
// lib/features/newsletter/presentation/screens/campaign_form_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_quill/flutter_quill.dart';

import '../../../admin/common/widgets/admin_scaffold.dart';
import '../../providers/campaign_form_provider.dart';

class CampaignFormScreen extends ConsumerStatefulWidget {
  final String? campaignId;
  
  const CampaignFormScreen({this.campaignId, super.key});
  
  @override
  ConsumerState<CampaignFormScreen> createState() => _CampaignFormScreenState();
}

class _CampaignFormScreenState extends ConsumerState<CampaignFormScreen> {
  late TextEditingController _subjectController;
  late QuillController _quillController;
  bool _showHtmlEditor = false;
  late TextEditingController _htmlController;
  
  bool get isEditing => widget.campaignId != null;
  
  @override
  void initState() {
    super.initState();
    _subjectController = TextEditingController();
    _quillController = QuillController.basic();
    _htmlController = TextEditingController();
    
    // Escuchar cambios del formulario si estamos editando
    if (isEditing) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final state = ref.read(editCampaignFormProvider(widget.campaignId!));
        _subjectController.text = state.subject;
        _htmlController.text = state.content;
        // TODO: Convertir HTML a Delta para el editor
      });
    }
  }
  
  @override
  void dispose() {
    _subjectController.dispose();
    _quillController.dispose();
    _htmlController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final formState = isEditing
        ? ref.watch(editCampaignFormProvider(widget.campaignId!))
        : ref.watch(newCampaignFormProvider);
    
    final formNotifier = isEditing
        ? ref.read(editCampaignFormProvider(widget.campaignId!).notifier)
        : ref.read(newCampaignFormProvider.notifier);
    
    return AdminScaffold(
      title: isEditing ? 'Editar Campaña' : 'Nueva Campaña',
      actions: [
        TextButton(
          onPressed: formState.isLoading
              ? null
              : () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
      ],
      child: formState.isLoading && formState.subject.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Asunto
                  _SectionCard(
                    title: 'Asunto del email',
                    child: TextField(
                      controller: _subjectController,
                      decoration: const InputDecoration(
                        hintText: '¡Novedades de esta semana!',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => formNotifier.setSubject(value),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Editor de contenido
                  _SectionCard(
                    title: 'Contenido',
                    action: TextButton(
                      onPressed: () {
                        setState(() => _showHtmlEditor = !_showHtmlEditor);
                      },
                      child: Text(
                        _showHtmlEditor ? 'Editor Visual' : 'Ver HTML',
                      ),
                    ),
                    child: SizedBox(
                      height: 400,
                      child: _showHtmlEditor
                          ? TextField(
                              controller: _htmlController,
                              maxLines: null,
                              expands: true,
                              style: const TextStyle(fontFamily: 'monospace'),
                              decoration: const InputDecoration(
                                hintText: 'Escribe HTML aquí...',
                                border: OutlineInputBorder(),
                                alignLabelWithHint: true,
                              ),
                              onChanged: (value) => formNotifier.setContent(value),
                            )
                          : Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Theme.of(context).colorScheme.outline,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                children: [
                                  // Toolbar
                                  QuillToolbar.simple(
                                    configurations: QuillSimpleToolbarConfigurations(
                                      controller: _quillController,
                                      showAlignmentButtons: true,
                                      showBackgroundColorButton: false,
                                      showClearFormat: true,
                                    ),
                                  ),
                                  const Divider(height: 1),
                                  // Editor
                                  Expanded(
                                    child: QuillEditor.basic(
                                      configurations: QuillEditorConfigurations(
                                        controller: _quillController,
                                        padding: const EdgeInsets.all(16),
                                        placeholder: 'Escribe el contenido de tu email...',
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Error message
                  if (formState.error != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        formState.error!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                  
                  // Botones de acción
                  Row(
                    children: [
                      // Guardar borrador
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: formState.isLoading
                              ? null
                              : () => _saveDraft(formNotifier),
                          icon: const Icon(Icons.save_outlined),
                          label: const Text('Guardar Borrador'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Guardar y enviar
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: formState.isLoading
                              ? null
                              : () => _saveAndSend(formNotifier),
                          icon: formState.isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(Colors.white),
                                  ),
                                )
                              : const Icon(Icons.send_outlined),
                          label: const Text('Guardar y Enviar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
  
  void _updateContentFromEditor() {
    // Convertir Delta a HTML
    final delta = _quillController.document.toDelta();
    // TODO: Usar un conversor de Delta a HTML
    // final html = deltaToHtml(delta);
    // ref.read(formProvider).setContent(html);
  }
  
  Future<void> _saveDraft(formNotifier) async {
    _updateContentFromEditor();
    final id = await formNotifier.saveDraft();
    
    if (id != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Borrador guardado')),
      );
      context.pop();
    }
  }
  
  Future<void> _saveAndSend(formNotifier) async {
    _updateContentFromEditor();
    final id = await formNotifier.saveAndPrepareToSend();
    
    if (id != null && mounted) {
      context.pushReplacement('/admin/newsletter/send/$id');
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? action;
  
  const _SectionCard({
    required this.title,
    required this.child,
    this.action,
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
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (action != null) action!,
              ],
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}
```

---

## 4. Pantalla de Envío de Campaña

```dart
// lib/features/newsletter/presentation/screens/campaign_send_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../admin/common/widgets/admin_scaffold.dart';
import '../../providers/send_campaign_provider.dart';
import '../widgets/send_progress_indicator.dart';
import '../dialogs/send_confirmation_dialog.dart';

class CampaignSendScreen extends ConsumerWidget {
  final String campaignId;
  
  const CampaignSendScreen({required this.campaignId, super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(sendCampaignProvider(campaignId));
    final theme = Theme.of(context);
    
    return AdminScaffold(
      title: 'Enviar Campaña',
      child: state.campaign == null && state.phase == SendingPhase.preparing
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.phase == SendingPhase.failed && state.campaign == null
              ? _ErrorView(error: state.error!)
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Título de la campaña
                      Center(
                        child: Column(
                          children: [
                            Text(
                              'Enviar Campaña',
                              style: theme.textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '"${state.campaign?.subject ?? ''}"',
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.colorScheme.outline,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Contador de destinatarios
                      if (!state.isComplete)
                        _RecipientsCard(count: state.totalCount),
                      
                      const SizedBox(height: 16),
                      
                      // Email de prueba (solo si no está enviando)
                      if (state.phase == SendingPhase.idle)
                        _TestEmailSection(
                          onSendTest: (email) => ref
                              .read(sendCampaignProvider(campaignId).notifier)
                              .sendTestEmail(email),
                        ),
                      
                      // Progreso de envío
                      if (state.phase == SendingPhase.sending ||
                          state.phase == SendingPhase.completed ||
                          state.phase == SendingPhase.cancelled)
                        SendProgressIndicator(
                          sentCount: state.sentCount,
                          failedCount: state.failedCount,
                          totalCount: state.totalCount,
                          statusMessage: state.statusMessage,
                        ),
                      
                      const SizedBox(height: 24),
                      
                      // Botones de acción
                      if (state.phase == SendingPhase.idle)
                        _ActionButtons(
                          onCancel: () => context.pop(),
                          onSend: () => _startSending(context, ref),
                        )
                      else if (state.phase == SendingPhase.sending)
                        OutlinedButton.icon(
                          onPressed: () => ref
                              .read(sendCampaignProvider(campaignId).notifier)
                              .cancelSending(),
                          icon: const Icon(Icons.stop),
                          label: const Text('Cancelar Envío'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: theme.colorScheme.error,
                          ),
                        )
                      else if (state.isComplete)
                        Column(
                          children: [
                            _CompletionMessage(
                              phase: state.phase,
                              sentCount: state.sentCount,
                              failedCount: state.failedCount,
                            ),
                            const SizedBox(height: 16),
                            FilledButton(
                              onPressed: () => context.go('/admin/newsletter'),
                              child: const Text('Volver al Dashboard'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
    );
  }
  
  Future<void> _startSending(BuildContext context, WidgetRef ref) async {
    final state = ref.read(sendCampaignProvider(campaignId));
    
    final confirmed = await SendConfirmationDialog.show(
      context,
      campaignSubject: state.campaign?.subject ?? '',
      subscriberCount: state.totalCount,
    );
    
    if (confirmed) {
      ref.read(sendCampaignProvider(campaignId).notifier).startSending();
    }
  }
}

class _RecipientsCard extends StatelessWidget {
  final int count;
  
  const _RecipientsCard({required this.count});
  
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
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              'Se enviará a',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$count',
              style: theme.textTheme.displayMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'suscriptores activos',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TestEmailSection extends StatefulWidget {
  final Future<bool> Function(String email) onSendTest;
  
  const _TestEmailSection({required this.onSendTest});
  
  @override
  State<_TestEmailSection> createState() => _TestEmailSectionState();
}

class _TestEmailSectionState extends State<_TestEmailSection> {
  final _controller = TextEditingController();
  bool _isSending = false;
  String? _result;
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
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
          children: [
            Text(
              '📧 Enviar email de prueba',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Envía una vista previa a tu correo antes del envío masivo.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'tu@email.com',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: _isSending ? null : _sendTest,
                  child: _isSending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Enviar prueba'),
                ),
              ],
            ),
            if (_result != null) ...[
              const SizedBox(height: 8),
              Text(
                _result!,
                style: TextStyle(
                  fontSize: 12,
                  color: _result!.contains('✓') 
                      ? Colors.green 
                      : theme.colorScheme.error,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  Future<void> _sendTest() async {
    final email = _controller.text.trim();
    if (email.isEmpty) return;
    
    setState(() {
      _isSending = true;
      _result = null;
    });
    
    final success = await widget.onSendTest(email);
    
    setState(() {
      _isSending = false;
      _result = success 
          ? '✓ Email de prueba enviado' 
          : '✗ Error al enviar';
    });
  }
}

class _ActionButtons extends StatelessWidget {
  final VoidCallback onCancel;
  final VoidCallback onSend;
  
  const _ActionButtons({
    required this.onCancel,
    required this.onSend,
  });
  
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: onCancel,
            child: const Text('Cancelar'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: FilledButton.icon(
            onPressed: onSend,
            icon: const Icon(Icons.send),
            label: const Text('Comenzar Envío'),
          ),
        ),
      ],
    );
  }
}

class _CompletionMessage extends StatelessWidget {
  final SendingPhase phase;
  final int sentCount;
  final int failedCount;
  
  const _CompletionMessage({
    required this.phase,
    required this.sentCount,
    required this.failedCount,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    final (icon, color, message) = switch (phase) {
      SendingPhase.completed => (
        Icons.check_circle,
        Colors.green,
        '¡Campaña enviada correctamente!',
      ),
      SendingPhase.cancelled => (
        Icons.pause_circle,
        Colors.orange,
        'Envío cancelado',
      ),
      SendingPhase.failed => (
        Icons.error,
        Colors.red,
        'Error durante el envío',
      ),
      _ => (Icons.info, theme.colorScheme.primary, ''),
    };
    
    return Column(
      children: [
        Icon(icon, size: 64, color: color),
        const SizedBox(height: 16),
        Text(
          message,
          style: theme.textTheme.titleLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          '$sentCount enviados${failedCount > 0 ? ', $failedCount fallidos' : ''}',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.outline,
          ),
        ),
      ],
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  
  const _ErrorView({required this.error});
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.pop(),
              child: const Text('Volver'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 5. Pantalla de Unsubscribe (Pública)

```dart
// lib/features/newsletter/presentation/screens/unsubscribe_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/unsubscribe_provider.dart';

class UnsubscribeScreen extends ConsumerWidget {
  final String? token;
  
  const UnsubscribeScreen({this.token, super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(unsubscribeProvider(token));
    final theme = Theme.of(context);
    
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Text(
                  'FASHIONSTORE',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                
                const SizedBox(height: 48),
                
                // Estado
                switch (state.status) {
                  UnsubscribeStatus.loading => const Column(
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Procesando tu solicitud...'),
                    ],
                  ),
                  
                  UnsubscribeStatus.success => _ResultCard(
                    icon: Icons.check_circle,
                    iconColor: Colors.green,
                    title: 'Baja confirmada',
                    message: 'Te has dado de baja correctamente de nuestra newsletter.',
                  ),
                  
                  UnsubscribeStatus.alreadyUnsubscribed => _ResultCard(
                    icon: Icons.info,
                    iconColor: Colors.blue,
                    title: 'Ya estás dado de baja',
                    message: 'Tu email ya estaba dado de baja de nuestra newsletter.',
                  ),
                  
                  UnsubscribeStatus.invalidToken => _ResultCard(
                    icon: Icons.error_outline,
                    iconColor: theme.colorScheme.error,
                    title: 'Enlace no válido',
                    message: state.errorMessage ?? 
                        'El enlace no es válido o ha expirado.',
                  ),
                  
                  UnsubscribeStatus.error => _ResultCard(
                    icon: Icons.error_outline,
                    iconColor: theme.colorScheme.error,
                    title: 'Error',
                    message: state.errorMessage ?? 
                        'Ha ocurrido un error. Por favor, inténtalo más tarde.',
                  ),
                },
                
                const SizedBox(height: 32),
                
                // Botón volver a la tienda
                if (state.status != UnsubscribeStatus.loading)
                  FilledButton(
                    onPressed: () => context.go('/'),
                    child: const Text('Volver a la tienda'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String message;
  
  const _ResultCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.message,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(icon, size: 64, color: iconColor),
            const SizedBox(height: 16),
            Text(
              title,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 6. Checklist de Screens

### Públicos
- [ ] `NewsletterForm` widget en footer (ya en fase-2)
- [ ] `UnsubscribeScreen` - Confirmación de baja

### Admin
- [ ] `NewsletterDashboardScreen` - Stats + campañas
- [ ] `SubscribersScreen` - Lista con búsqueda, filtros, export CSV
- [ ] `CampaignFormScreen` - Crear/editar con editor
- [ ] `CampaignSendScreen` - Prueba + envío masivo + progreso
