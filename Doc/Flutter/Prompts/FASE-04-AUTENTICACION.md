# Prompt para Fase 04: Autenticación

## 📋 Contexto

Continuando con FashionStore Flutter. Fases 01-03 completadas. Ahora implementaré el sistema completo de autenticación con Supabase.

## 🎯 Objetivo de esta Fase

Implementar login, registro, recuperación de contraseña, gestión de sesión y perfiles de usuario usando Supabase Auth.

## 📚 Documentación a Leer

**IMPORTANTE:** Lee completamente:
- `Doc/Flutter/04-AUTENTICACION.md` (Especificaciones completas)

## ⚠️ IMPORTANTE: Arquitectura Requerida

Esta fase usa **Clean Architecture** con:
- **Data Layer**: Datasources + Repositories implementados
- **Domain Layer**: Models (Freezed) + Repository interfaces
- **Providers**: Riverpod con code generation
- **Presentation**: Screens + Widgets

## ✅ Tareas a Completar

### Tarea 4.1: Crear Modelos Freezed

**Archivos a crear:**

**1. lib/features/auth/domain/models/auth_user.dart**

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'auth_user.freezed.dart';
part 'auth_user.g.dart';

@freezed
class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String id,
    required String email,
    String? fullName,
    @Default(false) bool isAdmin,
  }) = _AuthUser;
  
  factory AuthUser.fromJson(Map<String, dynamic> json) => _$AuthUserFromJson(json);
  
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

**2. lib/features/auth/domain/models/customer_profile.dart**

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
  
  factory CustomerProfile.fromJson(Map<String, dynamic> json) => 
      _$CustomerProfileFromJson(json);
}
```

**3. lib/features/auth/domain/models/auth_state.dart**

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

**Después de crear los modelos, EJECUTAR:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Checklist:**
- [ ] auth_user.dart creado
- [ ] customer_profile.dart creado
- [ ] auth_state.dart creado
- [ ] build_runner ejecutado
- [ ] Archivos *.freezed.dart y *.g.dart generados
- [ ] No hay errores de compilación

---

### Tarea 4.2: Crear Repository Interface

**Archivo:** `lib/features/auth/domain/repositories/auth_repository.dart`

**Acción:** Crear interface abstracta.

```dart
import '../models/auth_user.dart';
import '../models/customer_profile.dart';

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

**Checklist:**
- [ ] Todos los métodos definidos
- [ ] Tipos de retorno correctos
- [ ] Stream de authStateChanges

---

### Tarea 4.3: Crear Datasource

**Archivo:** `lib/features/auth/data/datasources/supabase_auth_datasource.dart`

**Acción:** Crear datasource que interactúa con Supabase.

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseAuthDatasource {
  final SupabaseClient _supabase;
  
  SupabaseAuthDatasource(this._supabase);
  
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
  
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
  
  Future<void> resetPasswordForEmail(String email) async {
    await _supabase.auth.resetPasswordForEmail(email);
  }
  
  Stream<AuthState> get onAuthStateChange {
    return _supabase.auth.onAuthStateChange;
  }
  
  User? get currentUser {
    return _supabase.auth.currentUser;
  }
  
  Future<Map<String, dynamic>> getProfile() async {
    final result = await _supabase.rpc('get_customer_profile');
    return result as Map<String, dynamic>;
  }
  
  Future<void> updateProfile(Map<String, dynamic> data) async {
    await _supabase.rpc('upsert_customer_profile', params: data);
  }
}
```

**Checklist:**
- [ ] Todas las operaciones implementadas
- [ ] Manejo de responses de Supabase
- [ ] RPC calls para perfil

---

### Tarea 4.4: Crear Repository Implementation

**Archivo:** `lib/features/auth/data/repositories/auth_repository_impl.dart`

**Acción:** Implementar AuthRepository.

**Debe incluir:**
- Conversión de User a AuthUser
- Mapeo de errores de Supabase a español
- Stream de auth state transformado

**Manejo de errores:**
```dart
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
```

**Checklist:**
- [ ] Implementa AuthRepository interface
- [ ] Usa SupabaseAuthDatasource
- [ ] Conversiones User ↔ AuthUser
- [ ] Mapeo de errores a español
- [ ] Stream transformado correctamente

---

### Tarea 4.5: Crear Providers

**Archivo:** `lib/features/auth/providers/auth_providers.dart`

**Acción:** Crear providers Riverpod con code generation.

**Providers requeridos:**

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_providers.g.dart';

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  final datasource = SupabaseAuthDatasource(Supabase.instance.client);
  return AuthRepositoryImpl(datasource);
}

@riverpod
Stream<AuthUser?> authState(AuthStateRef ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.authStateChanges;
}

@riverpod
AuthUser? currentUser(CurrentUserRef ref) {
  return ref.watch(authStateProvider).value;
}

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
      await repo.signUp(email: email, password: password, fullName: fullName);
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

**EJECUTAR después de crear:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Checklist:**
- [ ] authRepository provider
- [ ] authState stream provider
- [ ] currentUser provider
- [ ] AuthController con todas las acciones
- [ ] build_runner ejecutado
- [ ] auth_providers.g.dart generado

---

### Tarea 4.6: LoginScreen

**Archivo:** `lib/features/auth/presentation/screens/login_screen.dart`

**Acción:** Crear pantalla de login.

**Elementos UI:**
- Logo o título "FashionStore" (displayLarge)
- Subtítulo "Iniciar Sesión" (headingLarge)
- AppTextField email (icon: mail)
- AppTextField password (icon: lock, isPassword: true)
- Link "¿Olvidaste tu contraseña?"
- AppButton.primary "Iniciar Sesión" (fullWidth)
- Divider "o"
- Link "¿No tienes cuenta? Regístrate"
- Banner de error (si aplica)

**Estados:**
- idle: Formulario editable
- loading: Botón con spinner, campos disabled
- error: Banner rojo con mensaje

**Flujo:**
1. Validar campos
2. Llamar authController.signIn()
3. Si éxito: navegar a home (o redirectTo)
4. Si error: mostrar mensaje

**Checklist:**
- [ ] UI completa
- [ ] Validaciones con validators
- [ ] Estados manejados
- [ ] Navegación a register
- [ ] Navegación a forgot-password
- [ ] redirectTo parameter soportado

---

### Tarea 4.7: RegisterScreen

**Archivo:** `lib/features/auth/presentation/screens/register_screen.dart`

**Elementos UI:**
- Título "Crear Cuenta"
- AppTextField nombre completo
- AppTextField email
- AppTextField password
- AppTextField confirmar password
- Checkbox "Acepto términos y condiciones"
- AppButton.primary "Crear Cuenta" (disabled si no acepta)
- Link "¿Ya tienes cuenta? Inicia sesión"

**Validaciones:**
- Nombre: min 3 caracteres
- Email: formato válido
- Password: min 6 caracteres
- Confirmar: debe coincidir
- Términos: debe estar checked

**Checklist:**
- [ ] UI completa
- [ ] Validaciones implementadas
- [ ] Checkbox términos funciona
- [ ] Password match validation
- [ ] Navegación a login

---

### Tarea 4.8: ForgotPasswordScreen

**Archivo:** `lib/features/auth/presentation/screens/forgot_password_screen.dart`

**Elementos:**
- Botón back
- Título "Recuperar Contraseña"
- Descripción
- AppTextField email
- AppButton "Enviar Instrucciones"

**Flujo:**
1. Ingresar email
2. Llamar resetPassword()
3. Mostrar "Email enviado"
4. Navegar a login después de 3 seg

**Checklist:**
- [ ] UI completa
- [ ] Email validation
- [ ] Success message
- [ ] Auto navegación

---

### Tarea 4.9: ResetPasswordScreen

**Archivo:** `lib/features/auth/presentation/screens/reset_password_screen.dart`

**Elementos:**
- Título "Nueva Contraseña"
- AppTextField nueva password
- AppTextField confirmar password
- AppButton "Cambiar Contraseña"

**Checklist:**
- [ ] UI completa
- [ ] Password validation
- [ ] Match validation
- [ ] Update password en Supabase

---

### Tarea 4.10: Actualizar main.dart

**Acción:** Cambiar home a LoginScreen para pruebas.

```dart
home: const LoginScreen(),
```

**Checklist:**
- [ ] Import LoginScreen
- [ ] home actualizado

---

## 🧪 Verificación Final

### Tests Funcionales

**1. Registro:**
```bash
flutter run
```

- [ ] Ir a RegisterScreen
- [ ] Llenar formulario
- [ ] Tap "Crear Cuenta"
- [ ] Verificar usuario creado en Supabase Dashboard
- [ ] Verificar customer_profile creado

**2. Login:**
- [ ] Login con credenciales correctas → éxito
- [ ] Login con password incorrecta → error "Email o contraseña incorrectos"
- [ ] Login con email no existente → error

**3. Recuperar Password:**
- [ ] Ingresar email
- [ ] Enviar → mensaje "Email enviado"
- [ ] Verificar email recibido (revisar inbox)

**4. Logout:**
- [ ] Hacer login
- [ ] Cerrar sesión
- [ ] Verificar que no está autenticado

**5. Sesión Persistente:**
- [ ] Login
- [ ] Hot restart app (r en consola)
- [ ] Usuario debe seguir logueado

---

## ✅ Checklist Final de Fase 04

**Modelos:**
- [ ] **4.1** AuthUser (Freezed)
- [ ] **4.1** CustomerProfile (Freezed)
- [ ] **4.1** AuthState (Freezed)
- [ ] **Build runner** ejecutado

**Data Layer:**
- [ ] **4.3** SupabaseAuthDatasource
- [ ] **4.2** AuthRepository interface
- [ ] **4.4** AuthRepositoryImpl

**Providers:**
- [ ] **4.5** authRepository provider
- [ ] **4.5** authState stream provider
- [ ] **4.5** currentUser provider
- [ ] **4.5** AuthController

**Screens:**
- [ ] **4.6** LoginScreen
- [ ] **4.7** RegisterScreen
- [ ] **4.8** ForgotPasswordScreen
- [ ] **4.9** ResetPasswordScreen

**Verificaciones:**
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Reset password funciona
- [ ] Sesión persiste
- [ ] Errores se muestran en español
- [ ] No hay errores de compilación

## 📝 Reportar Completado

```
✅ FASE 04 COMPLETADA

Resumen:
- Modelos Freezed: 3 (AuthUser, CustomerProfile, AuthState)
- Repositories: 1 (AuthRepository + implementación)
- Providers: 4 (repository, authState, currentUser, controller)
- Screens: 4 (Login, Register, Forgot, Reset)

Archivos creados:
- lib/features/auth/domain/models/auth_user.dart
- lib/features/auth/domain/models/customer_profile.dart
- lib/features/auth/domain/models/auth_state.dart
- lib/features/auth/domain/repositories/auth_repository.dart
- lib/features/auth/data/datasources/supabase_auth_datasource.dart
- lib/features/auth/data/repositories/auth_repository_impl.dart
- lib/features/auth/providers/auth_providers.dart
- lib/features/auth/presentation/screens/login_screen.dart
- lib/features/auth/presentation/screens/register_screen.dart
- lib/features/auth/presentation/screens/forgot_password_screen.dart
- lib/features/auth/presentation/screens/reset_password_screen.dart

Archivos generados:
- auth_user.freezed.dart, auth_user.g.dart
- customer_profile.freezed.dart, customer_profile.g.dart
- auth_state.freezed.dart
- auth_providers.g.dart

Tests realizados:
- Registro: ✅ Usuario creado en Supabase
- Login: ✅ Sesión iniciada correctamente
- Errores: ✅ Mensajes en español
- Persistencia: ✅ Sesión se mantiene

Estado: LISTO PARA FASE 05 (Navegación)

Notas:
[Deep links pendientes de configurar en Fase 05]
```

## 🚨 Problemas Comunes

**Error: auth_user.freezed.dart no se genera**

Solución:
```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

**Error: authStateChanges no funciona**

Verificar:
- Supabase inicializado en main.dart
- Variables de entorno correctas
- onAuthStateChange mapeado correctamente

**Error: Profile no se crea automáticamente**

Verificar en Supabase:
- Trigger `on_auth_user_created` existe
- Function `handle_new_user()` existe

## 🎯 Próximo Paso

**FASE-05-NAVEGACION.md** - Configurar GoRouter con guards
