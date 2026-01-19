# 📦 Fase 1: Análisis y Preparación

## Objetivo

Establecer las bases del proyecto Flutter con toda la configuración necesaria para implementar el módulo de autenticación y perfiles.

---

## 1. Inventario de Funcionalidades a Migrar

### 1.1 Autenticación

| # | Funcionalidad | Prioridad | Complejidad |
|---|---------------|-----------|-------------|
| 1 | Login con email/password | 🔴 Alta | Baja |
| 2 | Registro de usuario | 🔴 Alta | Baja |
| 3 | Logout | 🔴 Alta | Baja |
| 4 | Recuperación de contraseña | 🟡 Media | Media |
| 5 | Establecer nueva contraseña | 🟡 Media | Media |
| 6 | Persistencia de sesión | 🔴 Alta | Media |
| 7 | Auto-refresh de tokens | 🔴 Alta | Media |
| 8 | Verificación de email | 🟢 Baja | Alta |

### 1.2 Perfiles de Usuario

| # | Funcionalidad | Prioridad | Complejidad |
|---|---------------|-----------|-------------|
| 1 | Ver información de cuenta | 🔴 Alta | Baja |
| 2 | Editar nombre y teléfono | 🔴 Alta | Baja |
| 3 | Editar dirección de envío | 🔴 Alta | Baja |
| 4 | Ver pedidos recientes | 🟡 Media | Media |
| 5 | Navegación a detalle de pedido | 🟡 Media | Media |

### 1.3 Control de Acceso

| # | Funcionalidad | Prioridad | Complejidad |
|---|---------------|-----------|-------------|
| 1 | Protección de rutas | 🔴 Alta | Media |
| 2 | Redirección post-login | 🔴 Alta | Baja |
| 3 | Verificación de rol admin | 🟡 Media | Baja |

---

## 2. Widgets Flutter Necesarios

### 2.1 Widgets Core (Reutilizables)

| Widget | Descripción | Uso |
|--------|-------------|-----|
| `AppTextField` | Input de texto con estilos FashionStore | Todos los formularios |
| `AppPasswordField` | Input de password con toggle visibility | Login, Registro, Reset |
| `AppButton` | Botón primario con loading state | Todas las páginas |
| `AppOutlinedButton` | Botón secundario/outline | Acciones secundarias |
| `AppCard` | Card con efecto glass | Containers principales |
| `LoadingOverlay` | Overlay de carga con spinner | Operaciones async |
| `MessageBanner` | Banner de éxito/error | Feedback al usuario |
| `AppDivider` | Divider con texto "o" | Entre secciones |
| `UserAvatar` | Avatar con iniciales o imagen | Header, Perfil |
| `FeatureBadge` | Badge con icono y texto | Beneficios login |

### 2.2 Widgets de Autenticación

| Widget | Descripción | Página |
|--------|-------------|--------|
| `AuthForm` | Formulario login/registro adaptable | Login, Registro |
| `ForgotPasswordForm` | Formulario solicitar recuperación | Recuperar Password |
| `ResetPasswordForm` | Formulario nueva contraseña | Reset Password |
| `SocialLoginButtons` | Botones Google/Apple (futuro) | Login, Registro |

### 2.3 Widgets de Perfil

| Widget | Descripción | Página |
|--------|-------------|--------|
| `ProfileForm` | Formulario edición de perfil | Editar Perfil |
| `PersonalInfoSection` | Sección info personal | Editar Perfil |
| `AddressSection` | Sección dirección de envío | Editar Perfil |
| `AccountInfoCard` | Card con info de cuenta | Mi Cuenta |
| `RecentOrdersCard` | Card con pedidos recientes | Mi Cuenta |
| `OrderListItem` | Item de pedido en lista | Mi Cuenta |
| `UserMenu` | Dropdown menú de usuario | Header global |

---

## 3. Dependencias de Packages

### 3.1 Packages Principales

```yaml
dependencies:
  flutter:
    sdk: flutter

  # ===== SUPABASE =====
  supabase_flutter: ^2.3.0
  # Cliente oficial de Supabase para Flutter
  # Incluye: Auth, Database, Storage, Realtime

  # ===== GESTIÓN DE ESTADO =====
  flutter_riverpod: ^2.4.9
  # State management reactivo y escalable
  
  riverpod_annotation: ^2.3.3
  # Anotaciones para generación de código Riverpod

  # ===== NAVEGACIÓN =====
  go_router: ^13.0.0
  # Navegación declarativa con deep linking
  # Soporta: guards, redirects, nested routes

  # ===== UI COMPONENTES =====
  flutter_svg: ^2.0.9
  # Renderizar iconos SVG
  
  cached_network_image: ^3.3.1
  # Imágenes con cache (avatares)
  
  shimmer: ^3.0.0
  # Efecto shimmer para loading states
  
  flutter_animate: ^4.3.0
  # Animaciones declarativas (fade-in, slide)

  # ===== FORMULARIOS =====
  flutter_form_builder: ^9.1.1
  # Builder de formularios con validación
  
  form_builder_validators: ^9.1.0
  # Validadores predefinidos (email, required, etc)

  # ===== ALMACENAMIENTO =====
  flutter_secure_storage: ^9.0.0
  # Almacenamiento seguro para tokens
  # iOS: Keychain, Android: EncryptedSharedPreferences
  
  shared_preferences: ^2.2.2
  # Almacenamiento simple (preferencias de tema)

  # ===== UTILIDADES =====
  intl: ^0.18.1
  # Internacionalización y formateo de fechas/moneda
  
  equatable: ^2.0.5
  # Comparación de objetos (para entidades)
  
  dartz: ^0.10.1
  # Programación funcional (Either para errores)
  
  logger: ^2.0.2+1
  # Logging para debug

  # ===== ICONOS =====
  lucide_icons: ^0.257.0
  # Pack de iconos (equivalente a lucide-react)
```

### 3.2 Dev Dependencies

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter

  # ===== GENERACIÓN DE CÓDIGO =====
  riverpod_generator: ^2.3.9
  build_runner: ^2.4.8
  freezed: ^2.4.6
  freezed_annotation: ^2.4.1
  json_serializable: ^6.7.1

  # ===== LINTING =====
  flutter_lints: ^3.0.1
  very_good_analysis: ^5.1.0

  # ===== TESTING =====
  mockito: ^5.4.4
  mocktail: ^1.0.1
  bloc_test: ^9.1.5

  # ===== GOLDEN TESTS =====
  golden_toolkit: ^0.15.0
```

---

## 4. Estructura de Carpetas Detallada

```
lib/
├── main.dart                          # Entry point
├── app.dart                           # MaterialApp configuration
│
├── core/                              # Código compartido global
│   ├── config/
│   │   ├── app_config.dart           # Constantes de app
│   │   ├── supabase_config.dart      # Configuración Supabase
│   │   └── env.dart                  # Variables de entorno
│   │
│   ├── router/
│   │   ├── app_router.dart           # GoRouter config
│   │   ├── routes.dart               # Definición de rutas
│   │   └── guards/
│   │       └── auth_guard.dart       # Protección de rutas
│   │
│   ├── theme/
│   │   ├── app_theme.dart            # ThemeData completo
│   │   ├── colors.dart               # Paleta de colores
│   │   ├── typography.dart           # TextStyles
│   │   ├── spacing.dart              # Espaciados
│   │   └── shadows.dart              # Box shadows
│   │
│   ├── utils/
│   │   ├── validators.dart           # Validaciones de formularios
│   │   ├── formatters.dart           # Formateo fecha/moneda
│   │   ├── extensions/
│   │   │   ├── context_extensions.dart
│   │   │   ├── string_extensions.dart
│   │   │   └── date_extensions.dart
│   │   └── helpers/
│   │       └── error_handler.dart
│   │
│   └── widgets/                       # Widgets reutilizables
│       ├── buttons/
│       │   ├── app_button.dart
│       │   ├── app_outlined_button.dart
│       │   └── app_icon_button.dart
│       ├── inputs/
│       │   ├── app_text_field.dart
│       │   ├── app_password_field.dart
│       │   └── app_dropdown.dart
│       ├── cards/
│       │   ├── app_card.dart
│       │   └── glass_card.dart
│       ├── feedback/
│       │   ├── loading_overlay.dart
│       │   ├── message_banner.dart
│       │   └── shimmer_box.dart
│       └── layout/
│           ├── app_scaffold.dart
│           └── section_header.dart
│
├── features/                          # Feature modules
│   └── auth/                          # Módulo de autenticación
│       │
│       ├── data/                      # Capa de datos
│       │   ├── models/
│       │   │   ├── user_model.dart
│       │   │   ├── user_model.g.dart
│       │   │   ├── profile_model.dart
│       │   │   └── profile_model.g.dart
│       │   │
│       │   ├── datasources/
│       │   │   ├── auth_remote_datasource.dart
│       │   │   └── auth_local_datasource.dart
│       │   │
│       │   └── repositories/
│       │       └── auth_repository_impl.dart
│       │
│       ├── domain/                    # Capa de dominio
│       │   ├── entities/
│       │   │   ├── user.dart
│       │   │   └── profile.dart
│       │   │
│       │   ├── repositories/
│       │   │   └── auth_repository.dart  # Interface
│       │   │
│       │   └── usecases/
│       │       ├── login_usecase.dart
│       │       ├── register_usecase.dart
│       │       ├── logout_usecase.dart
│       │       ├── forgot_password_usecase.dart
│       │       ├── reset_password_usecase.dart
│       │       ├── get_profile_usecase.dart
│       │       └── update_profile_usecase.dart
│       │
│       └── presentation/              # Capa de presentación
│           ├── providers/
│           │   ├── auth_provider.dart
│           │   ├── auth_provider.g.dart
│           │   ├── profile_provider.dart
│           │   └── profile_provider.g.dart
│           │
│           ├── pages/
│           │   ├── login_page.dart
│           │   ├── register_page.dart
│           │   ├── forgot_password_page.dart
│           │   ├── reset_password_page.dart
│           │   ├── account_page.dart
│           │   └── edit_profile_page.dart
│           │
│           └── widgets/
│               ├── auth_form.dart
│               ├── profile_form.dart
│               ├── user_avatar.dart
│               ├── user_menu.dart
│               ├── account_info_card.dart
│               ├── recent_orders_card.dart
│               └── trust_badges.dart
│
└── shared/                            # Código compartido entre features
    ├── services/
    │   ├── storage_service.dart      # Abstracción de storage
    │   └── navigation_service.dart   # Helpers de navegación
    │
    └── providers/
        └── app_providers.dart        # Providers globales
```

---

## 5. Configuración Inicial

### 5.1 Variables de Entorno

Crear archivo `lib/core/config/env.dart`:

```dart
abstract class Env {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );
  
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );
  
  static const bool isProduction = bool.fromEnvironment(
    'dart.vm.product',
    defaultValue: false,
  );
}
```

### 5.2 Inicialización de Supabase

```dart
// lib/core/config/supabase_config.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import 'env.dart';

class SupabaseConfig {
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: Env.supabaseUrl,
      anonKey: Env.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
      ),
    );
  }
  
  static SupabaseClient get client => Supabase.instance.client;
  static GoTrueClient get auth => client.auth;
}
```

### 5.3 Configuración de Deep Links

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="fashionstore" />
    <data android:host="reset-password" />
</intent-filter>
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>fashionstore</string>
        </array>
    </dict>
</array>
```

---

## 6. Checklist de Preparación

### Configuración del Proyecto

- [ ] Crear proyecto Flutter: `flutter create fashionstore_app`
- [ ] Configurar versión mínima de Dart/Flutter
- [ ] Añadir todos los packages al `pubspec.yaml`
- [ ] Ejecutar `flutter pub get`
- [ ] Configurar `.gitignore`
- [ ] Crear estructura de carpetas

### Configuración de Supabase

- [ ] Verificar credenciales de Supabase
- [ ] Configurar variables de entorno
- [ ] Crear archivo de configuración
- [ ] Probar conexión básica

### Configuración de Plataforma

- [ ] Configurar deep links Android
- [ ] Configurar deep links iOS
- [ ] Configurar scheme URL en Supabase Dashboard

### Configuración de Desarrollo

- [ ] Configurar VS Code/Android Studio con plugins Flutter
- [ ] Configurar emulador/simulador
- [ ] Configurar debugging
- [ ] Ejecutar app inicial

---

## 7. Notas de Implementación

### Diferencias Clave con React/Web

| Aspecto | Web (React) | Flutter |
|---------|-------------|---------|
| Estado | Context + useState | Riverpod Providers |
| Almacenamiento | httpOnly cookies | FlutterSecureStorage |
| Navegación | window.location | GoRouter |
| Deep Links | Supabase redirect URL | URL schemes nativos |
| Formularios | HTML forms | FormBuilder |
| Estilos | Tailwind CSS | ThemeData + Widgets |

### Prioridades de Implementación

1. **Alta**: Login, Registro, Logout, Persistencia de sesión
2. **Media**: Perfil, Recuperación password, Dashboard cuenta
3. **Baja**: Verificación email, Login social, Biometría

### Consideraciones de Seguridad

- Usar siempre `FlutterSecureStorage` para tokens
- Implementar certificate pinning en producción
- No loguear datos sensibles
- Validar inputs tanto en cliente como servidor
