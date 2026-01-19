# Módulo 5: Newsletter - Fase 3: Backend (Providers)

## 1. Provider: Suscripción Pública

```dart
// lib/features/newsletter/providers/newsletter_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/repositories/newsletter_repository.dart';
import '../data/services/local_rate_limiter.dart';
import '../domain/constants/newsletter_config.dart';

// ========== STATE ==========

class NewsletterSubscriptionState {
  final bool isLoading;
  final bool isSuccess;
  final String? errorMessage;
  final String? successMessage;
  
  const NewsletterSubscriptionState({
    this.isLoading = false,
    this.isSuccess = false,
    this.errorMessage,
    this.successMessage,
  });
  
  NewsletterSubscriptionState copyWith({
    bool? isLoading,
    bool? isSuccess,
    String? errorMessage,
    String? successMessage,
  }) {
    return NewsletterSubscriptionState(
      isLoading: isLoading ?? this.isLoading,
      isSuccess: isSuccess ?? this.isSuccess,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }
}

// ========== NOTIFIER ==========

class NewsletterSubscriptionNotifier 
    extends StateNotifier<NewsletterSubscriptionState> {
  final NewsletterRepository _repository;
  final LocalRateLimiter _rateLimiter;
  
  NewsletterSubscriptionNotifier(this._repository, this._rateLimiter)
      : super(const NewsletterSubscriptionState());
  
  /// Suscribirse al newsletter
  Future<bool> subscribe(String email) async {
    // Validar email
    if (!isValidEmail(email)) {
      state = state.copyWith(
        errorMessage: 'Por favor, introduce un email válido',
      );
      return false;
    }
    
    // Verificar rate limit local
    final canAttempt = await _rateLimiter.canAttempt();
    if (!canAttempt) {
      final remaining = await _rateLimiter.getRemainingBlockTime();
      final minutes = remaining?.inMinutes ?? 0;
      state = state.copyWith(
        errorMessage: 'Demasiados intentos. Espera $minutes minutos.',
      );
      return false;
    }
    
    state = state.copyWith(isLoading: true, errorMessage: null);
    
    try {
      await _repository.subscribe(email);
      
      state = state.copyWith(
        isLoading: false,
        isSuccess: true,
        successMessage: '¡Gracias por suscribirte! 🎉',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }
  
  /// Establecer error manualmente
  void setError(String message) {
    state = state.copyWith(errorMessage: message);
  }
  
  /// Resetear estado
  void reset() {
    state = const NewsletterSubscriptionState();
  }
}

// ========== PROVIDERS ==========

final newsletterRepositoryProvider = Provider<NewsletterRepository>((ref) {
  final supabase = Supabase.instance.client;
  return NewsletterRepository(supabase);
});

final localRateLimiterProvider = Provider<LocalRateLimiter>((ref) {
  return LocalRateLimiter();
});

final newsletterSubscriptionProvider = StateNotifierProvider<
    NewsletterSubscriptionNotifier, NewsletterSubscriptionState>((ref) {
  final repository = ref.watch(newsletterRepositoryProvider);
  final rateLimiter = ref.watch(localRateLimiterProvider);
  return NewsletterSubscriptionNotifier(repository, rateLimiter);
});
```

---

## 2. Provider: Gestión de Suscriptores (Admin)

```dart
// lib/features/newsletter/providers/subscribers_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/newsletter_subscriber.dart';
import '../data/repositories/newsletter_repository.dart';
import 'newsletter_provider.dart';

// ========== STATE ==========

class SubscribersListState {
  final List<NewsletterSubscriber> subscribers;
  final bool isLoading;
  final String? error;
  final String? search;
  final bool? filterActive;
  final int page;
  final bool hasMore;
  final Set<String> togglingIds; // IDs en proceso de toggle
  
  const SubscribersListState({
    this.subscribers = const [],
    this.isLoading = false,
    this.error,
    this.search,
    this.filterActive,
    this.page = 1,
    this.hasMore = true,
    this.togglingIds = const {},
  });
  
  SubscribersListState copyWith({
    List<NewsletterSubscriber>? subscribers,
    bool? isLoading,
    String? error,
    String? search,
    bool? filterActive,
    int? page,
    bool? hasMore,
    Set<String>? togglingIds,
  }) {
    return SubscribersListState(
      subscribers: subscribers ?? this.subscribers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      search: search ?? this.search,
      filterActive: filterActive ?? this.filterActive,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      togglingIds: togglingIds ?? this.togglingIds,
    );
  }
  
  bool isToggling(String id) => togglingIds.contains(id);
}

// ========== NOTIFIER ==========

class SubscribersListNotifier extends StateNotifier<SubscribersListState> {
  final NewsletterRepository _repository;
  static const _pageSize = 50;
  
  SubscribersListNotifier(this._repository) : super(const SubscribersListState());
  
  /// Cargar suscriptores
  Future<void> loadSubscribers({bool refresh = false}) async {
    if (state.isLoading) return;
    
    final page = refresh ? 1 : state.page;
    
    state = state.copyWith(
      isLoading: true,
      error: null,
      page: page,
    );
    
    try {
      final subscribers = await _repository.getSubscribers(
        isActive: state.filterActive,
        search: state.search,
        page: page,
        pageSize: _pageSize,
      );
      
      state = state.copyWith(
        isLoading: false,
        subscribers: refresh ? subscribers : [...state.subscribers, ...subscribers],
        hasMore: subscribers.length >= _pageSize,
        page: page + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  /// Aplicar búsqueda
  Future<void> setSearch(String? search) async {
    state = state.copyWith(search: search?.isEmpty == true ? null : search);
    await loadSubscribers(refresh: true);
  }
  
  /// Filtrar por estado
  Future<void> setFilterActive(bool? active) async {
    state = state.copyWith(filterActive: active);
    await loadSubscribers(refresh: true);
  }
  
  /// Toggle estado de suscriptor
  Future<void> toggleSubscriberStatus(String id) async {
    final subscriber = state.subscribers.firstWhere((s) => s.id == id);
    
    state = state.copyWith(
      togglingIds: {...state.togglingIds, id},
    );
    
    try {
      final updated = await _repository.toggleSubscriberStatus(
        id,
        !subscriber.isActive,
      );
      
      // Actualizar en la lista
      final newList = state.subscribers.map((s) {
        return s.id == id ? updated : s;
      }).toList();
      
      state = state.copyWith(
        subscribers: newList,
        togglingIds: state.togglingIds.where((i) => i != id).toSet(),
      );
    } catch (e) {
      state = state.copyWith(
        togglingIds: state.togglingIds.where((i) => i != id).toSet(),
        error: e.toString(),
      );
    }
  }
  
  /// Exportar a CSV
  Future<String> exportToCsv() async {
    return await _repository.exportToCsv(
      activeOnly: state.filterActive ?? false,
    );
  }
}

// ========== PROVIDERS ==========

final subscribersListProvider = StateNotifierProvider<
    SubscribersListNotifier, SubscribersListState>((ref) {
  final repository = ref.watch(newsletterRepositoryProvider);
  return SubscribersListNotifier(repository);
});

/// Contador de suscriptores activos
final activeSubscribersCountProvider = FutureProvider<int>((ref) async {
  final repository = ref.watch(newsletterRepositoryProvider);
  return await repository.getActiveSubscribersCount();
});
```

---

## 3. Provider: Gestión de Campañas (Admin)

```dart
// lib/features/newsletter/providers/campaigns_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/models/newsletter_campaign.dart';
import '../data/models/newsletter_stats.dart';
import '../data/repositories/campaign_repository.dart';
import '../domain/enums/campaign_status.dart';

// ========== STATE ==========

class CampaignsListState {
  final List<NewsletterCampaign> campaigns;
  final bool isLoading;
  final String? error;
  final CampaignStatus? statusFilter;
  
  const CampaignsListState({
    this.campaigns = const [],
    this.isLoading = false,
    this.error,
    this.statusFilter,
  });
  
  CampaignsListState copyWith({
    List<NewsletterCampaign>? campaigns,
    bool? isLoading,
    String? error,
    CampaignStatus? statusFilter,
  }) {
    return CampaignsListState(
      campaigns: campaigns ?? this.campaigns,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      statusFilter: statusFilter ?? this.statusFilter,
    );
  }
}

// ========== NOTIFIER ==========

class CampaignsListNotifier extends StateNotifier<CampaignsListState> {
  final CampaignRepository _repository;
  
  CampaignsListNotifier(this._repository) : super(const CampaignsListState());
  
  /// Cargar campañas
  Future<void> loadCampaigns() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final campaigns = await _repository.getCampaigns(
        status: state.statusFilter,
      );
      
      state = state.copyWith(
        isLoading: false,
        campaigns: campaigns,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  /// Filtrar por estado
  Future<void> setStatusFilter(CampaignStatus? status) async {
    state = state.copyWith(statusFilter: status);
    await loadCampaigns();
  }
  
  /// Eliminar campaña
  Future<bool> deleteCampaign(String id) async {
    try {
      await _repository.deleteCampaign(id);
      
      // Remover de la lista local
      state = state.copyWith(
        campaigns: state.campaigns.where((c) => c.id != id).toList(),
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

// ========== PROVIDERS ==========

final campaignRepositoryProvider = Provider<CampaignRepository>((ref) {
  final supabase = Supabase.instance.client;
  return CampaignRepository(supabase);
});

final campaignsListProvider = StateNotifierProvider<
    CampaignsListNotifier, CampaignsListState>((ref) {
  final repository = ref.watch(campaignRepositoryProvider);
  return CampaignsListNotifier(repository);
});

/// Obtener campaña por ID
final campaignByIdProvider = FutureProvider.family<NewsletterCampaign?, String>(
  (ref, id) async {
    final repository = ref.watch(campaignRepositoryProvider);
    return await repository.getCampaignById(id);
  },
);

/// Estadísticas del newsletter
final newsletterStatsProvider = FutureProvider<NewsletterStats>((ref) async {
  final repository = ref.watch(campaignRepositoryProvider);
  return await repository.getStats();
});
```

---

## 4. Provider: Formulario de Campaña

```dart
// lib/features/newsletter/providers/campaign_form_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/newsletter_campaign.dart';
import '../data/repositories/campaign_repository.dart';
import '../domain/enums/campaign_status.dart';
import 'campaigns_provider.dart';

// ========== STATE ==========

class CampaignFormState {
  final String subject;
  final String content;
  final bool isLoading;
  final bool isSaved;
  final String? error;
  final String? savedCampaignId;
  
  const CampaignFormState({
    this.subject = '',
    this.content = '',
    this.isLoading = false,
    this.isSaved = false,
    this.error,
    this.savedCampaignId,
  });
  
  CampaignFormState copyWith({
    String? subject,
    String? content,
    bool? isLoading,
    bool? isSaved,
    String? error,
    String? savedCampaignId,
  }) {
    return CampaignFormState(
      subject: subject ?? this.subject,
      content: content ?? this.content,
      isLoading: isLoading ?? this.isLoading,
      isSaved: isSaved ?? this.isSaved,
      error: error,
      savedCampaignId: savedCampaignId ?? this.savedCampaignId,
    );
  }
  
  bool get isValid => subject.trim().isNotEmpty && content.trim().isNotEmpty;
}

// ========== NOTIFIER ==========

class CampaignFormNotifier extends StateNotifier<CampaignFormState> {
  final CampaignRepository _repository;
  final String? _campaignId;
  
  CampaignFormNotifier(this._repository, this._campaignId)
      : super(const CampaignFormState());
  
  bool get isEditing => _campaignId != null;
  
  /// Cargar campaña existente
  Future<void> loadCampaign() async {
    if (_campaignId == null) return;
    
    state = state.copyWith(isLoading: true);
    
    try {
      final campaign = await _repository.getCampaignById(_campaignId);
      
      if (campaign != null) {
        state = state.copyWith(
          isLoading: false,
          subject: campaign.subject,
          content: campaign.content,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Campaña no encontrada',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  /// Actualizar asunto
  void setSubject(String value) {
    state = state.copyWith(subject: value, isSaved: false);
  }
  
  /// Actualizar contenido
  void setContent(String value) {
    state = state.copyWith(content: value, isSaved: false);
  }
  
  /// Guardar como borrador
  Future<String?> saveDraft() async {
    if (!state.isValid) {
      state = state.copyWith(error: 'Completa todos los campos');
      return null;
    }
    
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final input = CampaignInput(
        subject: state.subject.trim(),
        content: state.content.trim(),
        status: CampaignStatus.draft,
      );
      
      NewsletterCampaign saved;
      
      if (isEditing) {
        saved = await _repository.updateCampaign(_campaignId!, input);
      } else {
        saved = await _repository.createCampaign(input);
      }
      
      state = state.copyWith(
        isLoading: false,
        isSaved: true,
        savedCampaignId: saved.id,
      );
      
      return saved.id;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }
  
  /// Guardar y preparar para envío
  Future<String?> saveAndPrepareToSend() async {
    final id = await saveDraft();
    return id;
  }
}

// ========== PROVIDERS ==========

/// Provider para crear nueva campaña
final newCampaignFormProvider = StateNotifierProvider.autoDispose<
    CampaignFormNotifier, CampaignFormState>((ref) {
  final repository = ref.watch(campaignRepositoryProvider);
  return CampaignFormNotifier(repository, null);
});

/// Provider para editar campaña existente
final editCampaignFormProvider = StateNotifierProvider.autoDispose
    .family<CampaignFormNotifier, CampaignFormState, String>((ref, campaignId) {
  final repository = ref.watch(campaignRepositoryProvider);
  final notifier = CampaignFormNotifier(repository, campaignId);
  
  // Cargar datos al inicializar
  notifier.loadCampaign();
  
  return notifier;
});
```

---

## 5. Provider: Envío de Campaña

```dart
// lib/features/newsletter/providers/send_campaign_provider.dart

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/models/newsletter_campaign.dart';
import '../data/repositories/campaign_repository.dart';
import '../data/repositories/newsletter_repository.dart';
import '../domain/constants/newsletter_config.dart';
import '../domain/enums/campaign_status.dart';
import 'campaigns_provider.dart';
import 'newsletter_provider.dart';

// ========== STATE ==========

enum SendingPhase {
  idle,
  preparing,
  sending,
  completed,
  failed,
  cancelled,
}

class SendCampaignState {
  final SendingPhase phase;
  final int sentCount;
  final int failedCount;
  final int totalCount;
  final String? statusMessage;
  final String? error;
  final NewsletterCampaign? campaign;
  
  const SendCampaignState({
    this.phase = SendingPhase.idle,
    this.sentCount = 0,
    this.failedCount = 0,
    this.totalCount = 0,
    this.statusMessage,
    this.error,
    this.campaign,
  });
  
  SendCampaignState copyWith({
    SendingPhase? phase,
    int? sentCount,
    int? failedCount,
    int? totalCount,
    String? statusMessage,
    String? error,
    NewsletterCampaign? campaign,
  }) {
    return SendCampaignState(
      phase: phase ?? this.phase,
      sentCount: sentCount ?? this.sentCount,
      failedCount: failedCount ?? this.failedCount,
      totalCount: totalCount ?? this.totalCount,
      statusMessage: statusMessage,
      error: error,
      campaign: campaign ?? this.campaign,
    );
  }
  
  double get progress => totalCount > 0 
      ? (sentCount + failedCount) / totalCount 
      : 0;
  
  bool get isComplete => phase == SendingPhase.completed || 
                         phase == SendingPhase.failed ||
                         phase == SendingPhase.cancelled;
}

// ========== NOTIFIER ==========

class SendCampaignNotifier extends StateNotifier<SendCampaignState> {
  final CampaignRepository _campaignRepo;
  final NewsletterRepository _newsletterRepo;
  final SupabaseClient _supabase;
  final String _campaignId;
  
  bool _isCancelled = false;
  
  SendCampaignNotifier(
    this._campaignRepo,
    this._newsletterRepo,
    this._supabase,
    this._campaignId,
  ) : super(const SendCampaignState());
  
  /// Cargar datos de la campaña
  Future<void> loadCampaign() async {
    state = state.copyWith(
      phase: SendingPhase.preparing,
      statusMessage: 'Cargando campaña...',
    );
    
    try {
      final campaign = await _campaignRepo.getCampaignById(_campaignId);
      
      if (campaign == null) {
        state = state.copyWith(
          phase: SendingPhase.failed,
          error: 'Campaña no encontrada',
        );
        return;
      }
      
      if (!campaign.canSend) {
        state = state.copyWith(
          phase: SendingPhase.failed,
          error: 'La campaña no se puede enviar (estado: ${campaign.status.label})',
        );
        return;
      }
      
      // Contar suscriptores
      final count = await _newsletterRepo.getActiveSubscribersCount();
      
      state = state.copyWith(
        phase: SendingPhase.idle,
        campaign: campaign,
        totalCount: count,
        statusMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        phase: SendingPhase.failed,
        error: e.toString(),
      );
    }
  }
  
  /// Enviar email de prueba
  Future<bool> sendTestEmail(String email) async {
    try {
      // Llamar a Edge Function
      final response = await _supabase.functions.invoke(
        'send-test-newsletter',
        body: {
          'campaignId': _campaignId,
          'testEmail': email,
        },
      );
      
      if (response.status != 200) {
        throw Exception(response.data['error'] ?? 'Error al enviar');
      }
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
  
  /// Iniciar envío masivo
  Future<void> startSending() async {
    if (state.campaign == null || !state.campaign!.canSend) {
      return;
    }
    
    _isCancelled = false;
    
    state = state.copyWith(
      phase: SendingPhase.sending,
      sentCount: 0,
      failedCount: 0,
      statusMessage: 'Iniciando envío...',
      error: null,
    );
    
    // Marcar campaña como "enviando"
    await _campaignRepo.updateStatus(_campaignId, CampaignStatus.sending);
    
    try {
      int offset = 0;
      
      while (!_isCancelled) {
        // Enviar chunk
        final result = await _sendChunk(offset);
        
        if (result['done'] == true) {
          break;
        }
        
        final sent = result['sent'] as int? ?? 0;
        final failed = result['failed'] as int? ?? 0;
        
        state = state.copyWith(
          sentCount: state.sentCount + sent,
          failedCount: state.failedCount + failed,
          statusMessage: 'Enviando... ${state.sentCount + sent}/${state.totalCount}',
        );
        
        offset += NewsletterConfig.chunkSize;
        
        // Pequeña pausa entre chunks
        await Future.delayed(const Duration(milliseconds: 500));
      }
      
      if (_isCancelled) {
        await _campaignRepo.updateStatus(
          _campaignId,
          CampaignStatus.paused,
          sentCount: state.sentCount,
          failedCount: state.failedCount,
        );
        
        state = state.copyWith(
          phase: SendingPhase.cancelled,
          statusMessage: 'Envío cancelado',
        );
      } else {
        // Marcar como completada
        await _campaignRepo.updateStatus(
          _campaignId,
          CampaignStatus.sent,
          sentCount: state.sentCount,
          failedCount: state.failedCount,
        );
        
        state = state.copyWith(
          phase: SendingPhase.completed,
          statusMessage: '¡Campaña enviada!',
        );
      }
    } catch (e) {
      await _campaignRepo.updateStatus(
        _campaignId,
        CampaignStatus.failed,
        lastError: e.toString(),
        sentCount: state.sentCount,
        failedCount: state.failedCount,
      );
      
      state = state.copyWith(
        phase: SendingPhase.failed,
        error: e.toString(),
      );
    }
  }
  
  /// Enviar un chunk de emails via Edge Function
  Future<Map<String, dynamic>> _sendChunk(int offset) async {
    final response = await _supabase.functions.invoke(
      'send-newsletter-chunk',
      body: {
        'campaignId': _campaignId,
        'offset': offset,
        'limit': NewsletterConfig.chunkSize,
      },
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? 'Error al enviar chunk');
    }
    
    return response.data as Map<String, dynamic>;
  }
  
  /// Cancelar envío
  void cancelSending() {
    _isCancelled = true;
    state = state.copyWith(statusMessage: 'Cancelando...');
  }
}

// ========== PROVIDERS ==========

final sendCampaignProvider = StateNotifierProvider.autoDispose
    .family<SendCampaignNotifier, SendCampaignState, String>((ref, campaignId) {
  final campaignRepo = ref.watch(campaignRepositoryProvider);
  final newsletterRepo = ref.watch(newsletterRepositoryProvider);
  final supabase = Supabase.instance.client;
  
  final notifier = SendCampaignNotifier(
    campaignRepo,
    newsletterRepo,
    supabase,
    campaignId,
  );
  
  // Cargar campaña al inicializar
  notifier.loadCampaign();
  
  return notifier;
});
```

---

## 6. Provider: Unsubscribe (Público)

```dart
// lib/features/newsletter/providers/unsubscribe_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/newsletter_repository.dart';
import 'newsletter_provider.dart';

// ========== STATE ==========

enum UnsubscribeStatus {
  loading,
  success,
  alreadyUnsubscribed,
  invalidToken,
  error,
}

class UnsubscribeState {
  final UnsubscribeStatus status;
  final String? maskedEmail;
  final String? errorMessage;
  
  const UnsubscribeState({
    this.status = UnsubscribeStatus.loading,
    this.maskedEmail,
    this.errorMessage,
  });
  
  UnsubscribeState copyWith({
    UnsubscribeStatus? status,
    String? maskedEmail,
    String? errorMessage,
  }) {
    return UnsubscribeState(
      status: status ?? this.status,
      maskedEmail: maskedEmail ?? this.maskedEmail,
      errorMessage: errorMessage,
    );
  }
}

// ========== NOTIFIER ==========

class UnsubscribeNotifier extends StateNotifier<UnsubscribeState> {
  final NewsletterRepository _repository;
  final String? _token;
  
  UnsubscribeNotifier(this._repository, this._token)
      : super(const UnsubscribeState());
  
  /// Procesar unsubscribe
  Future<void> processUnsubscribe() async {
    if (_token == null || _token!.isEmpty) {
      state = state.copyWith(
        status: UnsubscribeStatus.invalidToken,
        errorMessage: 'Token no proporcionado',
      );
      return;
    }
    
    try {
      await _repository.unsubscribe(_token!);
      
      state = state.copyWith(
        status: UnsubscribeStatus.success,
      );
    } catch (e) {
      final message = e.toString().replaceAll('Exception: ', '');
      
      if (message.contains('ya') || message.contains('already')) {
        state = state.copyWith(
          status: UnsubscribeStatus.alreadyUnsubscribed,
        );
      } else if (message.contains('no encontrado') || message.contains('not found')) {
        state = state.copyWith(
          status: UnsubscribeStatus.invalidToken,
          errorMessage: 'El enlace no es válido o ha expirado',
        );
      } else {
        state = state.copyWith(
          status: UnsubscribeStatus.error,
          errorMessage: message,
        );
      }
    }
  }
}

// ========== PROVIDERS ==========

final unsubscribeProvider = StateNotifierProvider.autoDispose
    .family<UnsubscribeNotifier, UnsubscribeState, String?>((ref, token) {
  final repository = ref.watch(newsletterRepositoryProvider);
  final notifier = UnsubscribeNotifier(repository, token);
  
  // Procesar automáticamente
  notifier.processUnsubscribe();
  
  return notifier;
});
```

---

## 7. Resumen de Providers

| Provider | Tipo | Uso |
|----------|------|-----|
| `newsletterRepositoryProvider` | Provider | Repositorio de suscriptores |
| `campaignRepositoryProvider` | Provider | Repositorio de campañas |
| `localRateLimiterProvider` | Provider | Rate limiter local |
| `newsletterSubscriptionProvider` | StateNotifier | Suscripción pública |
| `subscribersListProvider` | StateNotifier | Lista de suscriptores (admin) |
| `activeSubscribersCountProvider` | FutureProvider | Contador de activos |
| `campaignsListProvider` | StateNotifier | Lista de campañas |
| `campaignByIdProvider` | FutureProvider.family | Campaña por ID |
| `newsletterStatsProvider` | FutureProvider | Estadísticas |
| `newCampaignFormProvider` | StateNotifier | Formulario nueva campaña |
| `editCampaignFormProvider` | StateNotifier.family | Formulario editar campaña |
| `sendCampaignProvider` | StateNotifier.family | Proceso de envío |
| `unsubscribeProvider` | StateNotifier.family | Proceso de baja |
