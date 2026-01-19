# Módulo 5: Newsletter - Fase 1: Preparación (Modelos y Configuración)

## 1. Modelos Freezed

### 1.1 NewsletterSubscriber

```dart
// lib/features/newsletter/data/models/newsletter_subscriber.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'newsletter_subscriber.freezed.dart';
part 'newsletter_subscriber.g.dart';

@freezed
class NewsletterSubscriber with _$NewsletterSubscriber {
  const factory NewsletterSubscriber({
    required String id,
    required String email,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'unsubscribe_token') String? unsubscribeToken,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _NewsletterSubscriber;
  
  factory NewsletterSubscriber.fromJson(Map<String, dynamic> json) =>
      _$NewsletterSubscriberFromJson(json);
}

/// Datos para insertar nuevo suscriptor
@freezed
class SubscribeInput with _$SubscribeInput {
  const factory SubscribeInput({
    required String email,
  }) = _SubscribeInput;
  
  factory SubscribeInput.fromJson(Map<String, dynamic> json) =>
      _$SubscribeInputFromJson(json);
}
```

### 1.2 NewsletterCampaign

```dart
// lib/features/newsletter/data/models/newsletter_campaign.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/enums/campaign_status.dart';

part 'newsletter_campaign.freezed.dart';
part 'newsletter_campaign.g.dart';

@freezed
class NewsletterCampaign with _$NewsletterCampaign {
  const NewsletterCampaign._();
  
  const factory NewsletterCampaign({
    required String id,
    required String subject,
    required String content,        // HTML content
    @JsonKey(
      fromJson: _statusFromJson,
      toJson: _statusToJson,
    )
    @Default(CampaignStatus.draft) CampaignStatus status,
    @JsonKey(name: 'sent_count') @Default(0) int sentCount,
    @JsonKey(name: 'failed_count') @Default(0) int failedCount,
    @JsonKey(name: 'total_recipients') @Default(0) int totalRecipients,
    @JsonKey(name: 'last_error') String? lastError,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'sent_at') DateTime? sentAt,
  }) = _NewsletterCampaign;
  
  factory NewsletterCampaign.fromJson(Map<String, dynamic> json) =>
      _$NewsletterCampaignFromJson(json);
  
  /// ¿Se puede editar?
  bool get canEdit => status.canEdit;
  
  /// ¿Se puede enviar?
  bool get canSend => status.canSend;
  
  /// Porcentaje de éxito
  double get successRate {
    if (sentCount + failedCount == 0) return 0;
    return sentCount / (sentCount + failedCount) * 100;
  }
}

CampaignStatus _statusFromJson(String value) => CampaignStatus.fromString(value);
String _statusToJson(CampaignStatus status) => status.value;

/// Input para crear/actualizar campaña
@freezed
class CampaignInput with _$CampaignInput {
  const factory CampaignInput({
    required String subject,
    required String content,
    @Default(CampaignStatus.draft) CampaignStatus status,
  }) = _CampaignInput;
  
  factory CampaignInput.fromJson(Map<String, dynamic> json) =>
      _$CampaignInputFromJson(json);
}
```

### 1.3 SendLog (Auditoría)

```dart
// lib/features/newsletter/data/models/send_log.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'send_log.freezed.dart';
part 'send_log.g.dart';

enum SendLogStatus {
  sent('sent'),
  failed('failed'),
  bounced('bounced'),
  opened('opened'),
  clicked('clicked');
  
  final String value;
  const SendLogStatus(this.value);
  
  static SendLogStatus fromString(String value) {
    return SendLogStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => SendLogStatus.sent,
    );
  }
}

@freezed
class SendLog with _$SendLog {
  const factory SendLog({
    required String id,
    @JsonKey(name: 'campaign_id') required String campaignId,
    @JsonKey(name: 'subscriber_id') String? subscriberId,
    @JsonKey(name: 'subscriber_email') required String subscriberEmail,
    @JsonKey(
      fromJson: _logStatusFromJson,
      toJson: _logStatusToJson,
    )
    required SendLogStatus status,
    @JsonKey(name: 'error_message') String? errorMessage,
    @Default({}) Map<String, dynamic> metadata,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _SendLog;
  
  factory SendLog.fromJson(Map<String, dynamic> json) =>
      _$SendLogFromJson(json);
}

SendLogStatus _logStatusFromJson(String value) => SendLogStatus.fromString(value);
String _logStatusToJson(SendLogStatus status) => status.value;
```

### 1.4 NewsletterStats

```dart
// lib/features/newsletter/data/models/newsletter_stats.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'newsletter_stats.freezed.dart';
part 'newsletter_stats.g.dart';

@freezed
class NewsletterStats with _$NewsletterStats {
  const factory NewsletterStats({
    required int activeSubscribers,
    required int totalSubscribers,
    required int campaignsSent,
    required int campaignsDraft,
    required int campaignsFailed,
  }) = _NewsletterStats;
  
  factory NewsletterStats.fromJson(Map<String, dynamic> json) =>
      _$NewsletterStatsFromJson(json);
  
  factory NewsletterStats.empty() => const NewsletterStats(
    activeSubscribers: 0,
    totalSubscribers: 0,
    campaignsSent: 0,
    campaignsDraft: 0,
    campaignsFailed: 0,
  );
}
```

---

## 2. Enum de Estado de Campaña

```dart
// lib/features/newsletter/domain/enums/campaign_status.dart

import 'package:flutter/material.dart';

enum CampaignStatus {
  draft('draft'),
  sending('sending'),
  sent('sent'),
  failed('failed'),
  paused('paused');
  
  final String value;
  const CampaignStatus(this.value);
  
  static CampaignStatus fromString(String value) {
    return CampaignStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => CampaignStatus.draft,
    );
  }
  
  /// Label para UI
  String get label => switch (this) {
    CampaignStatus.draft => 'Borrador',
    CampaignStatus.sending => 'Enviando...',
    CampaignStatus.sent => 'Enviada',
    CampaignStatus.failed => 'Fallida',
    CampaignStatus.paused => 'Pausada',
  };
  
  /// Color del badge
  Color get color => switch (this) {
    CampaignStatus.draft => Colors.grey,
    CampaignStatus.sending => Colors.amber,
    CampaignStatus.sent => Colors.green,
    CampaignStatus.failed => Colors.red,
    CampaignStatus.paused => Colors.orange,
  };
  
  /// Color de fondo del badge
  Color get backgroundColor => color.withValues(alpha: 0.15);
  
  /// ¿Se puede editar en este estado?
  bool get canEdit => this == CampaignStatus.draft || this == CampaignStatus.failed;
  
  /// ¿Se puede enviar en este estado?
  bool get canSend => this == CampaignStatus.draft;
  
  /// ¿Está en proceso?
  bool get isInProgress => this == CampaignStatus.sending;
  
  /// ¿Terminó (éxito o fallo)?
  bool get isCompleted => this == CampaignStatus.sent || this == CampaignStatus.failed;
}
```

---

## 3. Constantes y Configuración

```dart
// lib/features/newsletter/domain/constants/newsletter_config.dart

/// Configuración del sistema de newsletter
class NewsletterConfig {
  NewsletterConfig._();
  
  // ========== ENVÍO ==========
  
  /// Emails por cada request de envío
  static const int chunkSize = 5;
  
  /// Delay entre emails (respetar rate limit)
  static const Duration delayBetweenEmails = Duration(seconds: 1);
  
  /// Máximo de reintentos por chunk
  static const int maxRetries = 3;
  
  /// Backoff exponencial entre reintentos (ms)
  static const List<int> retryBackoffMs = [3000, 6000, 12000];
  
  // ========== RATE LIMITING ==========
  
  /// Máximo de intentos de suscripción por ventana de tiempo
  static const int rateLimitMaxAttempts = 5;
  
  /// Ventana de tiempo para rate limiting (minutos)
  static const int rateLimitWindowMinutes = 60;
  
  // ========== VALIDACIÓN ==========
  
  /// Longitud máxima de email (RFC 5321)
  static const int maxEmailLength = 254;
  
  /// Longitud máxima del asunto
  static const int maxSubjectLength = 200;
  
  /// Longitud mínima del contenido
  static const int minContentLength = 10;
}

/// Regex para validación de email (RFC 5322 simplificado)
final emailRegex = RegExp(
  r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
);

/// Validar formato de email
bool isValidEmail(String email) {
  if (email.isEmpty) return false;
  final trimmed = email.trim().toLowerCase();
  if (trimmed.length > NewsletterConfig.maxEmailLength) return false;
  return emailRegex.hasMatch(trimmed);
}
```

---

## 4. Repositorio de Suscriptores

```dart
// lib/features/newsletter/data/repositories/newsletter_repository.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/newsletter_subscriber.dart';
import '../../domain/constants/newsletter_config.dart';

class NewsletterRepository {
  final SupabaseClient _supabase;
  
  NewsletterRepository(this._supabase);
  
  // ========== SUSCRIPTORES ==========
  
  /// Obtener todos los suscriptores (admin)
  Future<List<NewsletterSubscriber>> getSubscribers({
    bool? isActive,
    String? search,
    int page = 1,
    int pageSize = 50,
  }) async {
    var query = _supabase
        .from('newsletter_subscribers')
        .select();
    
    if (isActive != null) {
      query = query.eq('is_active', isActive);
    }
    
    if (search != null && search.isNotEmpty) {
      query = query.ilike('email', '%$search%');
    }
    
    final offset = (page - 1) * pageSize;
    
    final response = await query
        .order('created_at', ascending: false)
        .range(offset, offset + pageSize - 1);
    
    return (response as List)
        .map((json) => NewsletterSubscriber.fromJson(json))
        .toList();
  }
  
  /// Contar suscriptores activos
  Future<int> getActiveSubscribersCount() async {
    final response = await _supabase
        .from('newsletter_subscribers')
        .select()
        .eq('is_active', true)
        .count(CountOption.exact);
    
    return response.count;
  }
  
  /// Suscribirse (público)
  Future<NewsletterSubscriber> subscribe(String email) async {
    final normalizedEmail = email.trim().toLowerCase();
    
    // Verificar si ya existe
    final existing = await _supabase
        .from('newsletter_subscribers')
        .select()
        .eq('email', normalizedEmail)
        .maybeSingle();
    
    if (existing != null) {
      final subscriber = NewsletterSubscriber.fromJson(existing);
      
      if (subscriber.isActive) {
        throw Exception('Este email ya está suscrito');
      }
      
      // Reactivar suscripción
      final updated = await _supabase
          .from('newsletter_subscribers')
          .update({'is_active': true})
          .eq('id', subscriber.id)
          .select()
          .single();
      
      return NewsletterSubscriber.fromJson(updated);
    }
    
    // Crear nuevo suscriptor
    final response = await _supabase
        .from('newsletter_subscribers')
        .insert({'email': normalizedEmail})
        .select()
        .single();
    
    return NewsletterSubscriber.fromJson(response);
  }
  
  /// Darse de baja (público)
  Future<void> unsubscribe(String token) async {
    // Validar formato UUID
    final uuidRegex = RegExp(
      r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      caseSensitive: false,
    );
    
    if (!uuidRegex.hasMatch(token)) {
      throw Exception('Token inválido');
    }
    
    // Buscar y desactivar
    final response = await _supabase
        .from('newsletter_subscribers')
        .update({'is_active': false})
        .eq('unsubscribe_token', token)
        .select()
        .maybeSingle();
    
    if (response == null) {
      throw Exception('Suscriptor no encontrado');
    }
  }
  
  /// Toggle estado de suscriptor (admin)
  Future<NewsletterSubscriber> toggleSubscriberStatus(
    String id,
    bool isActive,
  ) async {
    final response = await _supabase
        .from('newsletter_subscribers')
        .update({'is_active': isActive})
        .eq('id', id)
        .select()
        .single();
    
    return NewsletterSubscriber.fromJson(response);
  }
  
  /// Exportar suscriptores a CSV
  Future<String> exportToCsv({bool activeOnly = true}) async {
    var query = _supabase
        .from('newsletter_subscribers')
        .select('email, is_active, created_at');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    final response = await query.order('created_at', ascending: false);
    
    // Generar CSV
    final buffer = StringBuffer();
    buffer.writeln('email,is_active,created_at');
    
    for (final row in response) {
      buffer.writeln('${row['email']},${row['is_active']},${row['created_at']}');
    }
    
    return buffer.toString();
  }
}
```

---

## 5. Repositorio de Campañas

```dart
// lib/features/newsletter/data/repositories/campaign_repository.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/newsletter_campaign.dart';
import '../models/newsletter_stats.dart';
import '../../domain/enums/campaign_status.dart';

class CampaignRepository {
  final SupabaseClient _supabase;
  
  CampaignRepository(this._supabase);
  
  // ========== CAMPAÑAS ==========
  
  /// Obtener todas las campañas
  Future<List<NewsletterCampaign>> getCampaigns({
    CampaignStatus? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    var query = _supabase
        .from('newsletter_campaigns')
        .select();
    
    if (status != null) {
      query = query.eq('status', status.value);
    }
    
    final offset = (page - 1) * pageSize;
    
    final response = await query
        .order('created_at', ascending: false)
        .range(offset, offset + pageSize - 1);
    
    return (response as List)
        .map((json) => NewsletterCampaign.fromJson(json))
        .toList();
  }
  
  /// Obtener campaña por ID
  Future<NewsletterCampaign?> getCampaignById(String id) async {
    final response = await _supabase
        .from('newsletter_campaigns')
        .select()
        .eq('id', id)
        .maybeSingle();
    
    if (response == null) return null;
    return NewsletterCampaign.fromJson(response);
  }
  
  /// Crear campaña
  Future<NewsletterCampaign> createCampaign(CampaignInput input) async {
    final response = await _supabase
        .from('newsletter_campaigns')
        .insert({
          'subject': input.subject,
          'content': input.content,
          'status': input.status.value,
        })
        .select()
        .single();
    
    return NewsletterCampaign.fromJson(response);
  }
  
  /// Actualizar campaña
  Future<NewsletterCampaign> updateCampaign(
    String id,
    CampaignInput input,
  ) async {
    final response = await _supabase
        .from('newsletter_campaigns')
        .update({
          'subject': input.subject,
          'content': input.content,
        })
        .eq('id', id)
        .select()
        .single();
    
    return NewsletterCampaign.fromJson(response);
  }
  
  /// Eliminar campaña
  Future<void> deleteCampaign(String id) async {
    // Solo permitir eliminar borradores
    final campaign = await getCampaignById(id);
    if (campaign != null && !campaign.canEdit) {
      throw Exception('Solo se pueden eliminar borradores o campañas fallidas');
    }
    
    await _supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', id);
  }
  
  /// Actualizar estado de campaña
  Future<void> updateStatus(
    String id,
    CampaignStatus status, {
    String? lastError,
    int? sentCount,
    int? failedCount,
  }) async {
    final updates = <String, dynamic>{
      'status': status.value,
    };
    
    if (lastError != null) {
      updates['last_error'] = lastError;
    }
    
    if (sentCount != null) {
      updates['sent_count'] = sentCount;
    }
    
    if (failedCount != null) {
      updates['failed_count'] = failedCount;
    }
    
    if (status == CampaignStatus.sent) {
      updates['sent_at'] = DateTime.now().toIso8601String();
    }
    
    await _supabase
        .from('newsletter_campaigns')
        .update(updates)
        .eq('id', id);
  }
  
  /// Incrementar contadores de envío
  Future<void> incrementSendCount(String id, {
    int sent = 0,
    int failed = 0,
  }) async {
    // Obtener valores actuales
    final current = await getCampaignById(id);
    if (current == null) return;
    
    await _supabase
        .from('newsletter_campaigns')
        .update({
          'sent_count': current.sentCount + sent,
          'failed_count': current.failedCount + failed,
        })
        .eq('id', id);
  }
  
  // ========== ESTADÍSTICAS ==========
  
  /// Obtener estadísticas del newsletter
  Future<NewsletterStats> getStats() async {
    // Contar suscriptores activos
    final activeResponse = await _supabase
        .from('newsletter_subscribers')
        .select()
        .eq('is_active', true)
        .count(CountOption.exact);
    
    // Contar total suscriptores
    final totalResponse = await _supabase
        .from('newsletter_subscribers')
        .select()
        .count(CountOption.exact);
    
    // Contar campañas por estado
    final sentResponse = await _supabase
        .from('newsletter_campaigns')
        .select()
        .eq('status', 'sent')
        .count(CountOption.exact);
    
    final draftResponse = await _supabase
        .from('newsletter_campaigns')
        .select()
        .eq('status', 'draft')
        .count(CountOption.exact);
    
    final failedResponse = await _supabase
        .from('newsletter_campaigns')
        .select()
        .eq('status', 'failed')
        .count(CountOption.exact);
    
    return NewsletterStats(
      activeSubscribers: activeResponse.count,
      totalSubscribers: totalResponse.count,
      campaignsSent: sentResponse.count,
      campaignsDraft: draftResponse.count,
      campaignsFailed: failedResponse.count,
    );
  }
}
```

---

## 6. Rate Limiter Local

```dart
// lib/features/newsletter/data/services/local_rate_limiter.dart

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/constants/newsletter_config.dart';

/// Rate limiter basado en SharedPreferences
class LocalRateLimiter {
  static const _key = 'newsletter_rate_limit';
  
  /// Verificar si se puede intentar una suscripción
  Future<bool> canAttempt() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_key);
    
    if (data == null) {
      await _recordAttempt(prefs, 1, DateTime.now());
      return true;
    }
    
    try {
      final record = jsonDecode(data) as Map<String, dynamic>;
      final firstAttempt = DateTime.parse(record['first_attempt'] as String);
      final attempts = record['attempts'] as int;
      
      final now = DateTime.now();
      final windowDuration = Duration(
        minutes: NewsletterConfig.rateLimitWindowMinutes,
      );
      
      // Si pasó la ventana de tiempo, resetear
      if (now.difference(firstAttempt) >= windowDuration) {
        await _recordAttempt(prefs, 1, now);
        return true;
      }
      
      // Verificar límite
      if (attempts >= NewsletterConfig.rateLimitMaxAttempts) {
        return false;
      }
      
      // Incrementar contador
      await _recordAttempt(prefs, attempts + 1, firstAttempt);
      return true;
    } catch (e) {
      // Si hay error parseando, resetear
      await _recordAttempt(prefs, 1, DateTime.now());
      return true;
    }
  }
  
  /// Obtener tiempo restante de bloqueo
  Future<Duration?> getRemainingBlockTime() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_key);
    
    if (data == null) return null;
    
    try {
      final record = jsonDecode(data) as Map<String, dynamic>;
      final firstAttempt = DateTime.parse(record['first_attempt'] as String);
      final attempts = record['attempts'] as int;
      
      if (attempts < NewsletterConfig.rateLimitMaxAttempts) {
        return null;
      }
      
      final windowEnd = firstAttempt.add(Duration(
        minutes: NewsletterConfig.rateLimitWindowMinutes,
      ));
      
      final remaining = windowEnd.difference(DateTime.now());
      return remaining.isNegative ? null : remaining;
    } catch (e) {
      return null;
    }
  }
  
  /// Limpiar rate limit (para testing)
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
  
  Future<void> _recordAttempt(
    SharedPreferences prefs,
    int attempts,
    DateTime firstAttempt,
  ) async {
    await prefs.setString(_key, jsonEncode({
      'attempts': attempts,
      'first_attempt': firstAttempt.toIso8601String(),
      'last_attempt': DateTime.now().toIso8601String(),
    }));
  }
}
```

---

## 7. Barrel Export

```dart
// lib/features/newsletter/newsletter.dart

// Models
export 'data/models/newsletter_subscriber.dart';
export 'data/models/newsletter_campaign.dart';
export 'data/models/send_log.dart';
export 'data/models/newsletter_stats.dart';

// Enums
export 'domain/enums/campaign_status.dart';

// Constants
export 'domain/constants/newsletter_config.dart';

// Repositories
export 'data/repositories/newsletter_repository.dart';
export 'data/repositories/campaign_repository.dart';

// Services
export 'data/services/local_rate_limiter.dart';

// Providers
export 'providers/newsletter_provider.dart';
export 'providers/subscribers_provider.dart';
export 'providers/campaigns_provider.dart';
export 'providers/send_campaign_provider.dart';

// Screens
export 'presentation/screens/newsletter_dashboard_screen.dart';
export 'presentation/screens/subscribers_screen.dart';
export 'presentation/screens/campaign_form_screen.dart';
export 'presentation/screens/campaign_send_screen.dart';
export 'presentation/screens/unsubscribe_screen.dart';

// Widgets
export 'presentation/widgets/newsletter_form.dart';
export 'presentation/widgets/subscriber_list_tile.dart';
export 'presentation/widgets/campaign_card.dart';
export 'presentation/widgets/campaign_status_badge.dart';
export 'presentation/widgets/send_progress_indicator.dart';
```
