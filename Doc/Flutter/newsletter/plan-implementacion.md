# Módulo 5: Newsletter - Plan de Implementación Flutter

## 1. Estructura del Feature

```
lib/features/newsletter/
├── data/
│   ├── models/
│   │   ├── newsletter_subscriber.dart
│   │   ├── newsletter_campaign.dart
│   │   ├── send_log.dart
│   │   └── newsletter_stats.dart
│   └── repositories/
│       ├── newsletter_repository.dart
│       └── campaign_repository.dart
├── domain/
│   └── enums/
│       └── campaign_status.dart
├── presentation/
│   ├── screens/
│   │   ├── newsletter_dashboard_screen.dart
│   │   ├── subscribers_screen.dart
│   │   ├── campaign_form_screen.dart
│   │   ├── campaign_send_screen.dart
│   │   └── unsubscribe_screen.dart       # Público
│   ├── widgets/
│   │   ├── newsletter_form.dart          # Footer público
│   │   ├── subscriber_list_tile.dart
│   │   ├── campaign_card.dart
│   │   ├── campaign_status_badge.dart
│   │   ├── send_progress_indicator.dart
│   │   └── html_content_editor.dart
│   └── dialogs/
│       └── send_confirmation_dialog.dart
└── providers/
    ├── newsletter_provider.dart          # Público (suscripción)
    ├── subscribers_provider.dart         # Admin
    ├── campaigns_provider.dart           # Admin
    └── send_campaign_provider.dart       # Admin
```

---

## 2. Dependencias

```yaml
# pubspec.yaml
dependencies:
  # Editor de contenido HTML
  flutter_quill: ^10.0.0
  flutter_quill_extensions: ^10.0.0
  
  # Webview para preview
  webview_flutter: ^4.4.0
  
  # Export CSV
  csv: ^5.1.0
  share_plus: ^7.0.0
  path_provider: ^2.1.0
  
  # Validación email
  email_validator: ^2.1.0
  
  # Rate limiting local
  shared_preferences: ^2.2.0
```

---

## 3. Routing

```dart
// Newsletter público (suscripción y baja)
GoRoute(
  path: '/newsletter/unsubscribe',
  name: 'newsletter-unsubscribe',
  builder: (context, state) {
    final token = state.uri.queryParameters['token'];
    return UnsubscribeScreen(token: token);
  },
),

// Admin newsletter
GoRoute(
  path: '/admin/newsletter',
  name: 'admin-newsletter',
  builder: (context, state) => const NewsletterDashboardScreen(),
  routes: [
    GoRoute(
      path: 'subscribers',
      name: 'admin-newsletter-subscribers',
      builder: (context, state) => const SubscribersScreen(),
    ),
    GoRoute(
      path: 'new',
      name: 'admin-campaign-new',
      builder: (context, state) => const CampaignFormScreen(),
    ),
    GoRoute(
      path: 'edit/:id',
      name: 'admin-campaign-edit',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return CampaignFormScreen(campaignId: id);
      },
    ),
    GoRoute(
      path: 'send/:id',
      name: 'admin-campaign-send',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return CampaignSendScreen(campaignId: id);
      },
    ),
  ],
),
```

---

## 4. Enums y Constantes

```dart
// lib/features/newsletter/domain/enums/campaign_status.dart

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
  
  String get label => switch (this) {
    CampaignStatus.draft => 'Borrador',
    CampaignStatus.sending => 'Enviando...',
    CampaignStatus.sent => 'Enviada',
    CampaignStatus.failed => 'Fallida',
    CampaignStatus.paused => 'Pausada',
  };
  
  Color get color => switch (this) {
    CampaignStatus.draft => Colors.grey,
    CampaignStatus.sending => Colors.amber,
    CampaignStatus.sent => Colors.green,
    CampaignStatus.failed => Colors.red,
    CampaignStatus.paused => Colors.orange,
  };
  
  bool get canEdit => this == CampaignStatus.draft || this == CampaignStatus.failed;
  bool get canSend => this == CampaignStatus.draft;
}
```

```dart
// lib/features/newsletter/domain/constants/newsletter_config.dart

class NewsletterConfig {
  static const int chunkSize = 5;
  static const Duration delayBetweenEmails = Duration(seconds: 1);
  static const int maxRetries = 3;
  static const List<int> retryBackoffMs = [3000, 6000, 12000];
  static const int rateLimitMaxAttempts = 5;
  static const int rateLimitWindowMinutes = 60;
}
```

---

## 5. Flujo de Datos

### 5.1 Suscripción Pública

```
NewsletterForm (widget)
        ↓
    Validate email
        ↓
    Check honeypot
        ↓
    Check rate limit (local)
        ↓
NewsletterProvider.subscribe(email)
        ↓
    Supabase insert
        ↓
    Return success/error
```

### 5.2 Envío de Campaña (Admin)

```
CampaignSendScreen
        ↓
    Preview + Test
        ↓
    Confirm dialog
        ↓
SendCampaignProvider.startSending(campaignId)
        ↓
┌────── Loop ──────┐
│  Fetch chunk     │
│       ↓          │
│  Send emails     │
│       ↓          │
│  Log results     │
│       ↓          │
│  Update progress │
│       ↓          │
│  Check cancelled │
└──────────────────┘
        ↓
    Mark as sent/failed
```

---

## 6. Consideraciones Especiales

### 6.1 Envío de Emails en Flutter

**Opción A: Edge Function (Recomendado)**
```dart
// Llamar a Edge Function que maneja envío
final response = await supabase.functions.invoke(
  'send-newsletter-chunk',
  body: {
    'campaignId': campaignId,
    'offset': offset,
    'limit': NewsletterConfig.chunkSize,
  },
);
```

**Opción B: Envío directo (requiere backend)**
- Flutter no puede enviar emails directamente
- Necesita API/Edge Function como intermediario

### 6.2 Editor HTML

```dart
// Usar flutter_quill para edición
QuillController _controller = QuillController.basic();

// Convertir a HTML
String html = quillDeltaToHtml(_controller.document.toDelta());

// Preview en WebView
WebViewWidget(
  controller: _webViewController..loadHtmlString(html),
)
```

### 6.3 Rate Limiting Local

```dart
class LocalRateLimiter {
  static const _key = 'newsletter_rate_limit';
  
  Future<bool> canAttempt() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_key);
    
    if (data == null) {
      await _recordAttempt();
      return true;
    }
    
    final record = jsonDecode(data);
    final firstAttempt = DateTime.parse(record['first']);
    final attempts = record['attempts'] as int;
    
    // Reset if window passed
    if (DateTime.now().difference(firstAttempt).inMinutes >= 60) {
      await _recordAttempt();
      return true;
    }
    
    // Check limit
    if (attempts >= NewsletterConfig.rateLimitMaxAttempts) {
      return false;
    }
    
    await _recordAttempt(attempts + 1, firstAttempt);
    return true;
  }
}
```

---

## 7. API Endpoints Mapeados

| Web Endpoint | Flutter Method |
|--------------|----------------|
| `POST /api/newsletter/subscribe` | `supabase.from('newsletter_subscribers').insert()` |
| `GET /api/newsletter/unsubscribe` | `supabase.from('newsletter_subscribers').update()` |
| `POST /api/admin/newsletter/campaigns` | `supabase.from('newsletter_campaigns').insert()` |
| `POST /api/admin/newsletter/update-campaign` | `supabase.from('newsletter_campaigns').update()` |
| `POST /api/admin/newsletter/delete-campaign` | `supabase.from('newsletter_campaigns').delete()` |
| `POST /api/admin/newsletter/toggle-subscriber` | `supabase.from('newsletter_subscribers').update()` |
| `POST /api/admin/newsletter/send-chunk` | Edge Function `send-newsletter-chunk` |
| `POST /api/admin/newsletter/send-test` | Edge Function `send-test-email` |

---

## 8. Cronograma de Implementación

### Fase 1: Modelos y Repositorios (2-3 horas)
- [ ] Modelos Freezed
- [ ] Enums de estado
- [ ] Repository de suscriptores
- [ ] Repository de campañas

### Fase 2: Providers (2-3 horas)
- [ ] NewsletterProvider (público)
- [ ] SubscribersProvider (admin)
- [ ] CampaignsProvider (admin)
- [ ] SendCampaignProvider (admin)

### Fase 3: UI Pública (1-2 horas)
- [ ] NewsletterForm widget
- [ ] UnsubscribeScreen

### Fase 4: UI Admin (4-5 horas)
- [ ] NewsletterDashboardScreen
- [ ] SubscribersScreen + export CSV
- [ ] CampaignFormScreen + editor
- [ ] CampaignSendScreen + progreso

### Fase 5: Edge Functions (2-3 horas)
- [ ] `send-newsletter-chunk`
- [ ] `send-test-email`
- [ ] Templates de email

**Total estimado: 12-16 horas**
