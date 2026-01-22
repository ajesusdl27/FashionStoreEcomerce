# Módulo 04: Autenticación con Supabase

## 🎯 Objetivo

Implementar sistema completo de autenticación usando Supabase Auth: login, registro, recuperación de contraseña, gestión de sesión y perfiles de usuario.

## 🗄️ Backend (Supabase)

### Tablas Involucradas

**auth.users** (gestionada por Supabase):
- `id`: UUID (primary key)
- `email`: TEXT
- `encrypted_password`: TEXT
- `raw_user_meta_data`: JSONB → `{ full_name, is_admin }`
- `created_at`, `updated_at`: TIMESTAMPTZ

**customer_profiles** (tabla custom):
- `id`: UUID (FK a auth.users)
- `full_name`: TEXT
- `phone`: TEXT
- `default_address`: TEXT
- `default_city`: TEXT
- `default_postal_code`: TEXT
- `default_country`: TEXT (default 'España')
- `created_at`, `updated_at`: TIMESTAMPTZ

### Funciones RPC Disponibles

```sql
-- Obtener perfil del usuario actual
get_customer_profile() 
→ { id, full_name, phone, default_address, ... }

-- Actualizar perfil
upsert_customer_profile(
  p_full_name TEXT,
  p_phone TEXT,
  p_default_address TEXT,
  p_default_city TEXT,
  p_default_postal_code TEXT
) → void
```

### RLS Policies

- Usuario solo puede ver/editar su propio perfil
- Admin puede ver todos los perfiles
- Profile se crea automáticamente via trigger al registrarse

## 🏗️ Arquitectura del Módulo

```
features/auth/
├── data/
│   ├── datasources/
│   │   └── supabase_auth_datasource.dart
│   └── repositories/
│       └── auth_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── auth_user.dart (Freezed)
│   │   ├── customer_profile.dart (Freezed)
│   │   └── auth_state.dart (Freezed)
│   └── repositories/
│       └── auth_repository.dart (interface)
│
├── providers/
│   ├── auth_providers.dart
│   └── profile_providers.dart
│
└── presentation/
    ├── screens/
    │   ├── login_screen.dart
    │   ├── register_screen.dart
    │   ├── forgot_password_screen.dart
    │   └── reset_password_screen.dart
    └── widgets/
        ├── auth_form_field.dart
        └── password_strength_indicator.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. AuthUser

```dart
@freezed
class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String id,
    required String email,
    String? fullName,
    @Default(false) bool isAdmin,
  }) = _AuthUser;
  
  factory AuthUser.fromJson(Map<String, dynamic> json) => _$AuthUserFromJson(json);
  
  // Factory desde User de Supabase
  factory AuthUser.fromSupabaseUser(User user) {
    return AuthUser(
      id: user.id,
      email: user.email!,
      fullName: user.userMetadata?['full_name'],
      isAdmin: user.userMetadata?['is_admin'] == true,
    );
  }
}
```

### 2. CustomerProfile

```dart
@freezed
class CustomerProfile with _$CustomerProfile {
  const factory CustomerProfile({
    required String id,
    String? fullName,
    String? phone,
    String? defaultAddress,
    String? defaultCity,
    String? defaultPostalCode,
    @Default('España') String defaultCountry,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _CustomerProfile;
  
  factory CustomerProfile.fromJson(Map<String, dynamic> json) => _$CustomerProfileFromJson(json);
}
```

### 3. AuthState

```dart
@freezed
class AuthState with _$AuthState {
  const factory AuthState({
    AuthUser? user,
    CustomerProfile? profile,
    @Default(false) bool isLoading,
    String? error,
  }) = _AuthState;
}
```

## 🔌 Repository (Data Layer)

### Interface (Domain)

```dart
abstract class AuthRepository {
  // Autenticación
  Future<AuthUser> signIn(String email, String password);
  Future<AuthUser> signUp({
    required String email,
    required String password,
    required String fullName,
  });
  Future<void> signOut();
  Future<void> resetPassword(String email);
  
  // Perfil
  Future<CustomerProfile> getProfile();
  Future<void> updateProfile(CustomerProfile profile);
  
  // Sesión
  Stream<AuthUser?> get authStateChanges;
  AuthUser? get currentUser;
}
```

### Implementación (Data)

**Datasource (abstrae Supabase):**

```dart
class SupabaseAuthDatasource {
  final SupabaseClient _supabase;
  
  SupabaseAuthDatasource(this._supabase);
  
  // Métodos que interactúan directamente con Supabase
  Future<User> signInWithPassword(String email, String password) async {
    final response = await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
    return response.user!;
  }
  
  Future<User> signUpWithPassword({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName},
    );
    return response.user!;
  }
  
  // ... más métodos
}
```

**Repository (implementa lógica de negocio):**

```dart
class AuthRepositoryImpl implements AuthRepository {
  final SupabaseAuthDatasource _datasource;
  
  AuthRepositoryImpl(this._datasource);
  
  @override
  Future<AuthUser> signIn(String email, String password) async {
    try {
      final user = await _datasource.signInWithPassword(email, password);
      return AuthUser.fromSupabaseUser(user);
    } on AuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }
  
  @override
  Stream<AuthUser?> get authStateChanges {
    return _datasource.authStateChanges.map((event) {
      final user = event.session?.user;
      return user != null ? AuthUser.fromSupabaseUser(user) : null;
    });
  }
  
  // Mapeo de errores de Supabase a mensajes amigables
  Exception _handleAuthException(AuthException e) {
    switch (e.message) {
      case 'Invalid login credentials':
        return Exception('Email o contraseña incorrectos');
      case 'User already registered':
        return Exception('Este email ya está registrado');
      case 'Password should be at least 6 characters':
        return Exception('La contraseña debe tener al menos 6 caracteres');
      default:
        return Exception(e.message);
    }
  }
}
```

## 🎣 Providers (Riverpod)

### Auth Providers

```dart
@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  final datasource = SupabaseAuthDatasource(SupabaseService.client);
  return AuthRepositoryImpl(datasource);
}

// Stream del estado de auth (reactivo)
@riverpod
Stream<AuthUser?> authState(AuthStateRef ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.authStateChanges;
}

// Usuario actual (derivado del stream)
@riverpod
AuthUser? currentUser(CurrentUserRef ref) {
  return ref.watch(authStateProvider).value;
}

// Controller para acciones de auth
@riverpod
class AuthController extends _$AuthController {
  @override
  FutureOr<void> build() {}
  
  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.signIn(email, password);
    });
  }
  
  Future<void> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.signUp(
        email: email,
        password: password,
        fullName: fullName,
      );
    });
  }
  
  Future<void> signOut() async {
    final repo = ref.read(authRepositoryProvider);
    await repo.signOut();
  }
  
  Future<void> resetPassword(String email) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.resetPassword(email);
    });
  }
}
```

### Profile Providers

```dart
@riverpod
Future<CustomerProfile> customerProfile(CustomerProfileRef ref) async {
  final repository = ref.watch(authRepositoryProvider);
  return repository.getProfile();
}

@riverpod
class ProfileController extends _$ProfileController {
  @override
  FutureOr<void> build() {}
  
  Future<void> updateProfile(CustomerProfile profile) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.updateProfile(profile);
      // Invalidar caché para refrescar
      ref.invalidate(customerProfileProvider);
    });
  }
}
```

## 🖼️ Pantallas de Presentación

### 1. LoginScreen

**Ruta**: `/login`

**Elementos UI:**
- Logo (centrado arriba)
- Título "Iniciar Sesión" (`headingLarge`)
- AppTextField para email (icon: mail)
- AppTextField para password (icon: lock, isPassword: true)
- Link "¿Olvidaste tu contraseña?" (alineado a la derecha)
- AppButton.primary "Iniciar Sesión" (fullWidth)
- Divider con texto "o"
- Link "¿No tienes cuenta? Regístrate"

**Validaciones:**
- Email: formato válido, requerido
- Password: requerido

**Flujo:**
1. Usuario ingresa email/password
2. Tap en botón → loading state
3. Si éxito → navegar a home (o redirectTo si existe)
4. Si error → mostrar mensaje de error arriba del formulario

**Estados:**
- Idle: Formulario normal
- Loading: Botón con spinner, campos disabled
- Error: Mensaje de error en banner rojo

### 2. RegisterScreen

**Ruta**: `/register`

**Elementos UI:**
- Logo (centrado arriba)
- Título "Crear Cuenta" (`headingLarge`)
- AppTextField para nombre completo (icon: user)
- AppTextField para email (icon: mail)
- AppTextField para password (icon: lock, isPassword: true)
- AppTextField para confirmar password (icon: lock, isPassword: true)
- PasswordStrengthIndicator (widget custom)
- Checkbox + texto "Acepto los términos y condiciones"
- AppButton.primary "Crear Cuenta" (fullWidth, disabled si no acepta términos)
- Link "¿Ya tienes cuenta? Inicia sesión"

**Validaciones:**
- Nombre: requerido, mínimo 3 caracteres
- Email: formato válido, requerido
- Password: mínimo 6 caracteres, requerido
- Confirmar password: debe coincidir con password
- Términos: debe estar checked

**Flujo:**
1. Usuario completa formulario
2. Tap en botón → validar + loading
3. Si éxito → mensaje "Cuenta creada" → navegar a login o home
4. Si error → mostrar mensaje

### 3. ForgotPasswordScreen

**Ruta**: `/forgot-password`

**Elementos UI:**
- Botón back (arrow-left)
- Título "Recuperar Contraseña" (`headingLarge`)
- Descripción "Te enviaremos un email con instrucciones" (`bodyMedium`, color muted)
- AppTextField para email (icon: mail)
- AppButton.primary "Enviar Instrucciones" (fullWidth)

**Flujo:**
1. Usuario ingresa email
2. Tap en botón → llamar a resetPassword()
3. Mostrar mensaje "Email enviado. Revisa tu bandeja de entrada"
4. Navegar de vuelta a login después de 3 segundos

### 4. ResetPasswordScreen

**Ruta**: `/reset-password` (acceso via deep link desde email)

**Elementos UI:**
- Título "Nueva Contraseña" (`headingLarge`)
- AppTextField para nueva password (icon: lock, isPassword: true)
- AppTextField para confirmar password
- PasswordStrengthIndicator
- AppButton.primary "Cambiar Contraseña" (fullWidth)

**Flujo:**
1. Usuario llega desde link en email (deep link)
2. Ingresa nueva contraseña
3. Tap en botón → actualizar password via Supabase
4. Mostrar mensaje "Contraseña actualizada"
5. Navegar a login

## 🎨 Widgets Personalizados

### PasswordStrengthIndicator

**Ubicación**: `lib/features/auth/presentation/widgets/password_strength_indicator.dart`

**Props:**
- password: String

**Lógica:**
- Weak (rojo): < 6 caracteres
- Medium (amarillo): 6-8 caracteres, solo letras o números
- Strong (verde): 8+ caracteres, letras + números + símbolos

**UI:**
- Barra de progreso (LinearProgressIndicator)
- Label: "Débil", "Media", "Fuerte"
- Color según strength

## 🔐 Seguridad y Best Practices

### Manejo de Tokens

- **Access Token** y **Refresh Token**: Gestionados automáticamente por `supabase_flutter`
- **Persistencia**: Secure storage nativo (no expuesto)
- **Auto-refresh**: Automático cuando el access token expira

### Validación Client-Side vs Server-Side

- **Client**: Validación de formato (UX)
- **Server**: Validación definitiva (Supabase Auth)
- Nunca confiar solo en validación client-side

### Deep Links para Password Reset

Configurar en:
- **Android**: `AndroidManifest.xml` con intent-filter
- **iOS**: `Info.plist` con URL schemes

Esquema: `fashionstore://reset-password?token=xxx`

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados (AuthUser, CustomerProfile, AuthState)
- [ ] Build runner ejecutado (`*.freezed.dart` y `*.g.dart` generados)
- [ ] Repository implementado con manejo de errores
- [ ] Providers creados (auth, profile)
- [ ] LoginScreen funcional con validaciones
- [ ] RegisterScreen funcional con términos
- [ ] ForgotPasswordScreen envía email
- [ ] ResetPasswordScreen cambia contraseña
- [ ] PasswordStrengthIndicator muestra strength
- [ ] Deep links configurados (Android/iOS)

### Tests Manuales

1. **Registro:**
   - Registrar usuario nuevo
   - Verificar que se crea en Supabase Dashboard
   - Verificar que se crea customer_profile

2. **Login:**
   - Login con credenciales correctas → éxito
   - Login con credenciales incorrectas → error
   - Login con email no existente → error

3. **Recuperar Password:**
   - Solicitar reset → verificar email recibido
   - Click en link → abrir app con deep link
   - Cambiar contraseña → verificar que funciona nueva password

4. **Sesión Persistente:**
   - Login → cerrar app → abrir app
   - Usuario debe seguir logueado

5. **Logout:**
   - Logout → verificar que se limpia sesión
   - Intentar acceder a ruta protegida → redirigir a login

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 05: Navegación y Router** - Configurar GoRouter con guards de autenticación.

---

**Tiempo Estimado**: 6-8 horas
**Complejidad**: Alta
**Dependencias**: Módulos 01, 02, 03 completados
