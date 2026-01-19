# 🔧 Fase 3: Implementación Backend

## Objetivo

Implementar toda la lógica de negocio, integración con Supabase y gestión de datos para el módulo de autenticación y perfiles.

---

## 1. Configuración de Supabase

### 1.1 Inicialización

```dart
// lib/core/config/supabase_config.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import 'env.dart';

class SupabaseConfig {
  static bool _initialized = false;
  
  /// Inicializa Supabase. Debe llamarse antes de runApp()
  static Future<void> initialize() async {
    if (_initialized) return;
    
    await Supabase.initialize(
      url: Env.supabaseUrl,
      anonKey: Env.supabaseAnonKey,
      debug: !Env.isProduction,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
      ),
    );
    
    _initialized = true;
  }
  
  /// Cliente de Supabase
  static SupabaseClient get client => Supabase.instance.client;
  
  /// Cliente de autenticación
  static GoTrueClient get auth => client.auth;
  
  /// Usuario actual (puede ser null)
  static User? get currentUser => auth.currentUser;
  
  /// Sesión actual (puede ser null)
  static Session? get currentSession => auth.currentSession;
  
  /// Stream de cambios de autenticación
  static Stream<AuthState> get authStateChanges => auth.onAuthStateChange;
}
```

### 1.2 Variables de Entorno

```dart
// lib/core/config/env.dart
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
  
  // Deep link scheme para password reset
  static const String deepLinkScheme = 'fashionstore';
  static const String passwordResetPath = 'reset-password';
  
  static String get passwordResetRedirectUrl => 
    '$deepLinkScheme://$passwordResetPath';
}
```

---

## 2. Modelos de Datos

### 2.1 User Model

```dart
// lib/features/auth/data/models/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/user.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const UserModel._();
  
  const factory UserModel({
    required String id,
    required String email,
    String? fullName,
    String? avatarUrl,
    @Default(false) bool isAdmin,
    required DateTime createdAt,
  }) = _UserModel;
  
  /// Crea UserModel desde respuesta de Supabase Auth
  factory UserModel.fromSupabaseUser(User supabaseUser) {
    final metadata = supabaseUser.userMetadata ?? {};
    
    return UserModel(
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      fullName: metadata['full_name'] as String?,
      avatarUrl: metadata['avatar_url'] as String?,
      isAdmin: metadata['is_admin'] == true || 
               metadata['role'] == 'admin',
      createdAt: DateTime.parse(supabaseUser.createdAt),
    );
  }
  
  factory UserModel.fromJson(Map<String, dynamic> json) => 
    _$UserModelFromJson(json);
  
  /// Convierte a entidad de dominio
  UserEntity toEntity() => UserEntity(
    id: id,
    email: email,
    fullName: fullName,
    avatarUrl: avatarUrl,
    isAdmin: isAdmin,
    createdAt: createdAt,
  );
}
```

### 2.2 Profile Model

```dart
// lib/features/auth/data/models/profile_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/profile.dart';

part 'profile_model.freezed.dart';
part 'profile_model.g.dart';

@freezed
class ProfileModel with _$ProfileModel {
  const ProfileModel._();
  
  const factory ProfileModel({
    required String id,
    String? fullName,
    String? phone,
    String? defaultAddress,
    String? defaultCity,
    String? defaultPostalCode,
    @Default('España') String defaultCountry,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _ProfileModel;
  
  /// Crea ProfileModel desde row de customer_profiles
  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      phone: json['phone'] as String?,
      defaultAddress: json['default_address'] as String?,
      defaultCity: json['default_city'] as String?,
      defaultPostalCode: json['default_postal_code'] as String?,
      defaultCountry: json['default_country'] as String? ?? 'España',
      createdAt: json['created_at'] != null 
        ? DateTime.parse(json['created_at'] as String)
        : null,
      updatedAt: json['updated_at'] != null 
        ? DateTime.parse(json['updated_at'] as String)
        : null,
    );
  }
  
  /// Convierte a JSON para update
  Map<String, dynamic> toJson() => {
    'full_name': fullName,
    'phone': phone,
    'default_address': defaultAddress,
    'default_city': defaultCity,
    'default_postal_code': defaultPostalCode,
    'default_country': defaultCountry,
  };
  
  /// Convierte a entidad de dominio
  ProfileEntity toEntity() => ProfileEntity(
    id: id,
    fullName: fullName,
    phone: phone,
    defaultAddress: defaultAddress,
    defaultCity: defaultCity,
    defaultPostalCode: defaultPostalCode,
    defaultCountry: defaultCountry,
  );
  
  /// Crea ProfileModel desde entidad para update
  factory ProfileModel.fromEntity(ProfileEntity entity) => ProfileModel(
    id: entity.id,
    fullName: entity.fullName,
    phone: entity.phone,
    defaultAddress: entity.defaultAddress,
    defaultCity: entity.defaultCity,
    defaultPostalCode: entity.defaultPostalCode,
    defaultCountry: entity.defaultCountry,
  );
}
```

---

## 3. Entidades de Dominio

### 3.1 User Entity

```dart
// lib/features/auth/domain/entities/user.dart
import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String? fullName;
  final String? avatarUrl;
  final bool isAdmin;
  final DateTime createdAt;
  
  const UserEntity({
    required this.id,
    required this.email,
    this.fullName,
    this.avatarUrl,
    this.isAdmin = false,
    required this.createdAt,
  });
  
  /// Obtiene las iniciales del usuario para avatar
  String get initials {
    if (fullName != null && fullName!.isNotEmpty) {
      return fullName!
        .split(' ')
        .map((n) => n.isNotEmpty ? n[0] : '')
        .take(2)
        .join()
        .toUpperCase();
    }
    return email.isNotEmpty ? email[0].toUpperCase() : 'U';
  }
  
  /// Nombre para mostrar
  String get displayName => fullName ?? email.split('@').first;
  
  @override
  List<Object?> get props => [id, email, fullName, avatarUrl, isAdmin, createdAt];
}
```

### 3.2 Profile Entity

```dart
// lib/features/auth/domain/entities/profile.dart
import 'package:equatable/equatable.dart';

class ProfileEntity extends Equatable {
  final String id;
  final String? fullName;
  final String? phone;
  final String? defaultAddress;
  final String? defaultCity;
  final String? defaultPostalCode;
  final String defaultCountry;
  
  const ProfileEntity({
    required this.id,
    this.fullName,
    this.phone,
    this.defaultAddress,
    this.defaultCity,
    this.defaultPostalCode,
    this.defaultCountry = 'España',
  });
  
  /// Verifica si el perfil tiene dirección completa
  bool get hasCompleteAddress =>
    defaultAddress != null && defaultAddress!.isNotEmpty &&
    defaultCity != null && defaultCity!.isNotEmpty &&
    defaultPostalCode != null && defaultPostalCode!.isNotEmpty;
  
  /// Dirección formateada para mostrar
  String get formattedAddress {
    final parts = [
      defaultAddress,
      defaultCity,
      defaultPostalCode,
      defaultCountry,
    ].where((p) => p != null && p.isNotEmpty);
    
    return parts.join(', ');
  }
  
  /// Crea una copia con nuevos valores
  ProfileEntity copyWith({
    String? fullName,
    String? phone,
    String? defaultAddress,
    String? defaultCity,
    String? defaultPostalCode,
    String? defaultCountry,
  }) {
    return ProfileEntity(
      id: id,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      defaultAddress: defaultAddress ?? this.defaultAddress,
      defaultCity: defaultCity ?? this.defaultCity,
      defaultPostalCode: defaultPostalCode ?? this.defaultPostalCode,
      defaultCountry: defaultCountry ?? this.defaultCountry,
    );
  }
  
  @override
  List<Object?> get props => [
    id, fullName, phone, defaultAddress, 
    defaultCity, defaultPostalCode, defaultCountry
  ];
}
```

---

## 4. Repository Interface

```dart
// lib/features/auth/domain/repositories/auth_repository.dart
import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../entities/profile.dart';
import '../../../../core/error/failures.dart';

abstract class AuthRepository {
  /// Stream de cambios de estado de autenticación
  Stream<UserEntity?> get authStateChanges;
  
  /// Obtiene el usuario actual (si está logueado)
  Future<Either<Failure, UserEntity?>> getCurrentUser();
  
  /// Login con email y contraseña
  Future<Either<Failure, UserEntity>> signInWithEmail({
    required String email,
    required String password,
  });
  
  /// Registro con email y contraseña
  Future<Either<Failure, UserEntity>> signUpWithEmail({
    required String email,
    required String password,
    String? fullName,
  });
  
  /// Cerrar sesión
  Future<Either<Failure, void>> signOut();
  
  /// Solicitar recuperación de contraseña
  Future<Either<Failure, void>> resetPasswordForEmail(String email);
  
  /// Actualizar contraseña (después de recovery)
  Future<Either<Failure, void>> updatePassword(String newPassword);
  
  /// Obtener perfil del usuario actual
  Future<Either<Failure, ProfileEntity>> getProfile();
  
  /// Actualizar perfil del usuario
  Future<Either<Failure, ProfileEntity>> updateProfile(ProfileEntity profile);
}
```

---

## 5. Repository Implementation

```dart
// lib/features/auth/data/repositories/auth_repository_impl.dart
import 'package:dartz/dartz.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/user.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';
import '../models/profile_model.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../../core/config/env.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';

class AuthRepositoryImpl implements AuthRepository {
  final SupabaseClient _client;
  
  AuthRepositoryImpl({SupabaseClient? client}) 
    : _client = client ?? SupabaseConfig.client;
  
  @override
  Stream<UserEntity?> get authStateChanges {
    return _client.auth.onAuthStateChange.map((state) {
      final user = state.session?.user;
      if (user == null) return null;
      return UserModel.fromSupabaseUser(user).toEntity();
    });
  }
  
  @override
  Future<Either<Failure, UserEntity?>> getCurrentUser() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) return const Right(null);
      
      return Right(UserModel.fromSupabaseUser(user).toEntity());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, UserEntity>> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user == null) {
        return const Left(AuthFailure('Error al iniciar sesión'));
      }
      
      return Right(UserModel.fromSupabaseUser(response.user!).toEntity());
    } on AuthException catch (e) {
      return Left(AuthFailure(_translateAuthError(e.message)));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, UserEntity>> signUpWithEmail({
    required String email,
    required String password,
    String? fullName,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: {
          if (fullName != null) 'full_name': fullName,
        },
      );
      
      if (response.user == null) {
        return const Left(AuthFailure('Error al crear cuenta'));
      }
      
      // Si requiere confirmación de email, el usuario existe pero no hay sesión
      if (response.session == null) {
        // Retornamos el usuario de todas formas para mostrar mensaje
        return Right(UserModel.fromSupabaseUser(response.user!).toEntity());
      }
      
      return Right(UserModel.fromSupabaseUser(response.user!).toEntity());
    } on AuthException catch (e) {
      return Left(AuthFailure(_translateAuthError(e.message)));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      await _client.auth.signOut();
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, void>> resetPasswordForEmail(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(
        email,
        redirectTo: Env.passwordResetRedirectUrl,
      );
      return const Right(null);
    } on AuthException catch (e) {
      return Left(AuthFailure(_translateAuthError(e.message)));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, void>> updatePassword(String newPassword) async {
    try {
      await _client.auth.updateUser(
        UserAttributes(password: newPassword),
      );
      return const Right(null);
    } on AuthException catch (e) {
      return Left(AuthFailure(_translateAuthError(e.message)));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, ProfileEntity>> getProfile() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) {
        return const Left(AuthFailure('No hay sesión activa'));
      }
      
      // Intentar obtener perfil existente
      final response = await _client
        .from('customer_profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();
      
      if (response == null) {
        // Perfil no existe, retornar uno vacío con el ID
        return Right(ProfileEntity(id: userId));
      }
      
      return Right(ProfileModel.fromJson(response).toEntity());
    } on PostgrestException catch (e) {
      return Left(DatabaseFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, ProfileEntity>> updateProfile(
    ProfileEntity profile
  ) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) {
        return const Left(AuthFailure('No hay sesión activa'));
      }
      
      final profileModel = ProfileModel.fromEntity(profile);
      
      // Upsert: inserta o actualiza si existe
      await _client
        .from('customer_profiles')
        .upsert({
          'id': userId,
          ...profileModel.toJson(),
          'updated_at': DateTime.now().toIso8601String(),
        });
      
      // También actualizar metadata del usuario si cambió el nombre
      if (profile.fullName != null) {
        await _client.auth.updateUser(
          UserAttributes(
            data: {'full_name': profile.fullName},
          ),
        );
      }
      
      return Right(profile);
    } on PostgrestException catch (e) {
      return Left(DatabaseFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  /// Traduce errores de Supabase Auth a español
  String _translateAuthError(String message) {
    final translations = {
      'Invalid login credentials': 
        'Email o contraseña incorrectos',
      'Email not confirmed': 
        'Confirma tu email para continuar',
      'User already registered': 
        'Este email ya está registrado',
      'Password should be at least 6 characters': 
        'La contraseña debe tener al menos 6 caracteres',
      'New password should be different from the old password': 
        'La nueva contraseña debe ser diferente a la anterior',
      'Email rate limit exceeded': 
        'Demasiados intentos. Espera unos minutos.',
      'Invalid email': 
        'Email inválido',
    };
    
    for (final entry in translations.entries) {
      if (message.contains(entry.key)) {
        return entry.value;
      }
    }
    
    return message;
  }
}
```

---

## 6. Error Handling

### 6.1 Failures

```dart
// lib/core/error/failures.dart
import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  
  const Failure(this.message);
  
  @override
  List<Object> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class DatabaseFailure extends Failure {
  const DatabaseFailure(super.message);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure([String message = 'Sin conexión a internet']) 
    : super(message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}
```

### 6.2 Exceptions

```dart
// lib/core/error/exceptions.dart

class ServerException implements Exception {
  final String message;
  ServerException([this.message = 'Error del servidor']);
}

class AuthException implements Exception {
  final String message;
  AuthException([this.message = 'Error de autenticación']);
}

class CacheException implements Exception {
  final String message;
  CacheException([this.message = 'Error de cache']);
}
```

---

## 7. Providers (Riverpod)

### 7.1 Auth Provider

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../data/repositories/auth_repository_impl.dart';

part 'auth_provider.g.dart';

/// Provider del repositorio de auth
@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  return AuthRepositoryImpl();
}

/// Estado de autenticación
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final UserEntity user;
  const AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

/// Notifier principal de autenticación
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
    // Escuchar cambios de auth
    ref.listen(authStateChangesProvider, (previous, next) {
      if (next.hasValue) {
        state = next.value != null
          ? AuthAuthenticated(next.value!)
          : const AuthUnauthenticated();
      }
    });
    
    return const AuthInitial();
  }
  
  /// Login con email y contraseña
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = const AuthLoading();
    
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.signInWithEmail(
      email: email,
      password: password,
    );
    
    result.fold(
      (failure) => state = AuthError(failure.message),
      (user) => state = AuthAuthenticated(user),
    );
  }
  
  /// Registro con email y contraseña
  Future<bool> signUp({
    required String email,
    required String password,
    String? fullName,
  }) async {
    state = const AuthLoading();
    
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.signUpWithEmail(
      email: email,
      password: password,
      fullName: fullName,
    );
    
    return result.fold(
      (failure) {
        state = AuthError(failure.message);
        return false;
      },
      (user) {
        state = AuthAuthenticated(user);
        return true;
      },
    );
  }
  
  /// Cerrar sesión
  Future<void> signOut() async {
    state = const AuthLoading();
    
    final repository = ref.read(authRepositoryProvider);
    await repository.signOut();
    
    state = const AuthUnauthenticated();
  }
  
  /// Solicitar recuperación de contraseña
  Future<bool> resetPassword(String email) async {
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.resetPasswordForEmail(email);
    
    return result.isRight();
  }
  
  /// Actualizar contraseña
  Future<bool> updatePassword(String newPassword) async {
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.updatePassword(newPassword);
    
    return result.isRight();
  }
}

/// Stream de cambios de autenticación
@riverpod
Stream<UserEntity?> authStateChanges(AuthStateChangesRef ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.authStateChanges;
}

/// Usuario actual (conveniente)
@riverpod
UserEntity? currentUser(CurrentUserRef ref) {
  final authState = ref.watch(authNotifierProvider);
  
  if (authState is AuthAuthenticated) {
    return authState.user;
  }
  return null;
}

/// Si el usuario es admin
@riverpod
bool isAdmin(IsAdminRef ref) {
  final user = ref.watch(currentUserProvider);
  return user?.isAdmin ?? false;
}
```

### 7.2 Profile Provider

```dart
// lib/features/auth/presentation/providers/profile_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/profile.dart';
import 'auth_provider.dart';

part 'profile_provider.g.dart';

/// Estado del perfil
sealed class ProfileState {
  const ProfileState();
}

class ProfileInitial extends ProfileState {
  const ProfileInitial();
}

class ProfileLoading extends ProfileState {
  const ProfileLoading();
}

class ProfileLoaded extends ProfileState {
  final ProfileEntity profile;
  const ProfileLoaded(this.profile);
}

class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);
}

class ProfileUpdating extends ProfileState {
  final ProfileEntity profile;
  const ProfileUpdating(this.profile);
}

/// Notifier del perfil
@riverpod
class ProfileNotifier extends _$ProfileNotifier {
  @override
  ProfileState build() {
    // Cargar perfil automáticamente si hay usuario
    final user = ref.watch(currentUserProvider);
    if (user != null) {
      _loadProfile();
    }
    return const ProfileInitial();
  }
  
  /// Carga el perfil del usuario actual
  Future<void> _loadProfile() async {
    state = const ProfileLoading();
    
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.getProfile();
    
    result.fold(
      (failure) => state = ProfileError(failure.message),
      (profile) => state = ProfileLoaded(profile),
    );
  }
  
  /// Recarga el perfil
  Future<void> refresh() async {
    await _loadProfile();
  }
  
  /// Actualiza el perfil
  Future<bool> updateProfile(ProfileEntity profile) async {
    final currentProfile = state is ProfileLoaded 
      ? (state as ProfileLoaded).profile 
      : profile;
    
    state = ProfileUpdating(currentProfile);
    
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.updateProfile(profile);
    
    return result.fold(
      (failure) {
        state = ProfileError(failure.message);
        return false;
      },
      (updatedProfile) {
        state = ProfileLoaded(updatedProfile);
        return true;
      },
    );
  }
}

/// Perfil actual (conveniente)
@riverpod
ProfileEntity? currentProfile(CurrentProfileRef ref) {
  final profileState = ref.watch(profileNotifierProvider);
  
  if (profileState is ProfileLoaded) {
    return profileState.profile;
  }
  return null;
}
```

---

## 8. Almacenamiento Seguro

```dart
// lib/shared/services/storage_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );
  
  // Keys
  static const _themeKey = 'theme_mode';
  static const _onboardingKey = 'onboarding_completed';
  
  // ===== SECURE STORAGE (para datos sensibles) =====
  
  /// Guarda un valor de forma segura
  static Future<void> secureWrite(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }
  
  /// Lee un valor seguro
  static Future<String?> secureRead(String key) async {
    return await _secureStorage.read(key: key);
  }
  
  /// Elimina un valor seguro
  static Future<void> secureDelete(String key) async {
    await _secureStorage.delete(key: key);
  }
  
  /// Elimina todos los valores seguros
  static Future<void> secureClear() async {
    await _secureStorage.deleteAll();
  }
  
  // ===== SHARED PREFERENCES (para config no sensible) =====
  
  /// Obtiene el tema guardado
  static Future<String?> getThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_themeKey);
  }
  
  /// Guarda el tema
  static Future<void> setThemeMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, mode);
  }
  
  /// Verifica si completó onboarding
  static Future<bool> isOnboardingCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_onboardingKey) ?? false;
  }
  
  /// Marca onboarding como completado
  static Future<void> setOnboardingCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardingKey, true);
  }
}
```

---

## 9. Validadores

```dart
// lib/core/utils/validators.dart

class Validators {
  Validators._();
  
  /// Valida email
  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'El email es requerido';
    }
    
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    );
    
    if (!emailRegex.hasMatch(value)) {
      return 'Ingresa un email válido';
    }
    
    return null;
  }
  
  /// Valida contraseña
  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'La contraseña es requerida';
    }
    
    if (value.length < 6) {
      return 'Mínimo 6 caracteres';
    }
    
    return null;
  }
  
  /// Valida confirmación de contraseña
  static String? Function(String?) confirmPassword(String password) {
    return (String? value) {
      if (value == null || value.isEmpty) {
        return 'Confirma tu contraseña';
      }
      
      if (value != password) {
        return 'Las contraseñas no coinciden';
      }
      
      return null;
    };
  }
  
  /// Campo requerido genérico
  static String? required(String? value, [String fieldName = 'Este campo']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName es requerido';
    }
    return null;
  }
  
  /// Valida código postal español
  static String? postalCode(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Opcional
    }
    
    if (value.length != 5 || int.tryParse(value) == null) {
      return 'Código postal inválido';
    }
    
    return null;
  }
  
  /// Valida teléfono español
  static String? phone(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Opcional
    }
    
    final cleaned = value.replaceAll(RegExp(r'[\s\-]'), '');
    
    if (cleaned.length < 9 || cleaned.length > 12) {
      return 'Teléfono inválido';
    }
    
    return null;
  }
}
```

---

## 10. Checklist de Backend

### Configuración

- [ ] Inicialización de Supabase implementada
- [ ] Variables de entorno configuradas
- [ ] Deep links configurados para password reset

### Modelos

- [ ] `UserModel` con fromSupabaseUser y toEntity
- [ ] `ProfileModel` con fromJson, toJson y toEntity
- [ ] Generación de código Freezed ejecutada

### Entidades

- [ ] `UserEntity` con getters útiles (initials, displayName)
- [ ] `ProfileEntity` con copyWith y formattedAddress

### Repository

- [ ] `AuthRepository` interface definida
- [ ] `AuthRepositoryImpl` implementado con:
  - [ ] signInWithEmail
  - [ ] signUpWithEmail
  - [ ] signOut
  - [ ] resetPasswordForEmail
  - [ ] updatePassword
  - [ ] getProfile
  - [ ] updateProfile
  - [ ] authStateChanges stream
- [ ] Traducción de errores a español

### Providers

- [ ] `AuthNotifier` con todos los métodos
- [ ] `ProfileNotifier` con carga automática
- [ ] Providers de conveniencia (currentUser, isAdmin, etc.)
- [ ] Generación de código Riverpod ejecutada

### Error Handling

- [ ] Failures definidos (Auth, Server, Database, etc.)
- [ ] Exceptions definidas
- [ ] Errores traducidos al español

### Storage

- [ ] StorageService con secure storage
- [ ] Preferencias de tema persistidas

### Tests

- [ ] Tests unitarios de repository
- [ ] Tests de providers
- [ ] Mocks de Supabase client
