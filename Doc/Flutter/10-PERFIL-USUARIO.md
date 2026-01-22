# Módulo 10: Perfil de Usuario

## 🎯 Objetivo

Implementar la gestión completa del perfil de usuario: visualización, edición de datos personales, gestión de direcciones de envío y preferencias de la cuenta.

## 🗄️ Backend (Supabase)

### Tablas Involucradas

**customer_profiles:**
- `id`: UUID (FK auth.users)
- `full_name`: TEXT
- `phone`: TEXT
- `default_address`: TEXT
- `default_city`: TEXT
- `default_postal_code`: TEXT
- `default_country`: TEXT (default 'España')
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

**auth.users** (managed by Supabase):
- `email`: TEXT (read-only en perfil)
- `raw_user_meta_data`: JSONB (`{ full_name, is_admin }`)

### Funciones RPC Disponibles

```sql
-- Obtener perfil del usuario actual
get_customer_profile()
→ customer_profile

-- Actualizar perfil
upsert_customer_profile(
  p_full_name TEXT,
  p_phone TEXT,
  p_default_address TEXT,
  p_default_city TEXT,
  p_default_postal_code TEXT
)
→ void
```

### RLS Policies

- Usuario solo puede ver/editar su propio perfil
- `auth.uid() = id` en todas las policies

## 🏗️ Arquitectura del Módulo

```
features/profile/
├── data/
│   ├── datasources/
│   │   └── profile_datasource.dart
│   └── repositories/
│       └── profile_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── user_profile.dart (Freezed)
│   │   └── profile_form_data.dart (Freezed)
│   └── repositories/
│       └── profile_repository.dart
│
├── providers/
│   └── profile_providers.dart
│
└── presentation/
    ├── screens/
    │   ├── account_screen.dart
    │   ├── edit_profile_screen.dart
    │   └── change_password_screen.dart
    └── widgets/
        ├── profile_header.dart
        ├── profile_menu.dart
        ├── profile_option.dart
        ├── address_form.dart
        └── delete_account_dialog.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. UserProfile

```dart
@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    required String email,
    String? fullName,
    String? phone,
    String? defaultAddress,
    String? defaultCity,
    String? defaultPostalCode,
    @Default('España') String defaultCountry,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _UserProfile;
  
  factory UserProfile.fromJson(Map<String, dynamic> json) => 
      _$UserProfileFromJson(json);
  
  const UserProfile._();
  
  bool get hasAddress =>
      defaultAddress != null &&
      defaultCity != null &&
      defaultPostalCode != null;
  
  String get initials {
    if (fullName == null || fullName!.isEmpty) {
      return email[0].toUpperCase();
    }
    final parts = fullName!.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return fullName![0].toUpperCase();
  }
}
```

### 2. ProfileFormData

```dart
@freezed
class ProfileFormData with _$ProfileFormData {
  const factory ProfileFormData({
    String? fullName,
    String? phone,
    String? defaultAddress,
    String? defaultCity,
    String? defaultPostalCode,
    @Default('España') String defaultCountry,
  }) = _ProfileFormData;
  
  factory ProfileFormData.fromJson(Map<String, dynamic> json) => 
      _$ProfileFormDataFromJson(json);
  
  factory ProfileFormData.fromProfile(UserProfile profile) {
    return ProfileFormData(
      fullName: profile.fullName,
      phone: profile.phone,
      defaultAddress: profile.defaultAddress,
      defaultCity: profile.defaultCity,
      defaultPostalCode: profile.defaultPostalCode,
      defaultCountry: profile.defaultCountry,
    );
  }
}
```

## 🔌 Repository (Data Layer)

### Interface (Domain)

```dart
abstract class ProfileRepository {
  Future<UserProfile> getProfile();
  Future<void> updateProfile(ProfileFormData data);
  Future<void> changePassword(String newPassword);
  Future<void> deleteAccount();
}
```

### Implementation (Data)

```dart
class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileDatasource _datasource;
  final SupabaseClient _supabase;
  
  @override
  Future<UserProfile> getProfile() async {
    // Obtener auth.users data
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Usuario no autenticado');
    
    // Obtener customer_profiles data via RPC
    final profileData = await _datasource.getProfile();
    
    return UserProfile(
      id: user.id,
      email: user.email!,
      fullName: profileData['full_name'],
      phone: profileData['phone'],
      defaultAddress: profileData['default_address'],
      defaultCity: profileData['default_city'],
      defaultPostalCode: profileData['default_postal_code'],
      defaultCountry: profileData['default_country'] ?? 'España',
      createdAt: profileData['created_at'] != null 
          ? DateTime.parse(profileData['created_at']) 
          : null,
      updatedAt: profileData['updated_at'] != null 
          ? DateTime.parse(profileData['updated_at']) 
          : null,
    );
  }
  
  @override
  Future<void> updateProfile(ProfileFormData data) async {
    await _datasource.updateProfile(data.toJson());
  }
  
  @override
  Future<void> changePassword(String newPassword) async {
    await _supabase.auth.updateUser(
      UserAttributes(password: newPassword),
    );
  }
  
  @override
  Future<void> deleteAccount() async {
    // Soft delete o hard delete según política
    // Implementar según requerimientos
    throw UnimplementedError('Función no implementada aún');
  }
}
```

## 🎣 Providers (Riverpod)

```dart
@riverpod
ProfileRepository profileRepository(ProfileRepositoryRef ref) {
  final datasource = ProfileDatasource(SupabaseService.client);
  return ProfileRepositoryImpl(datasource, SupabaseService.client);
}

// Profile del usuario (cacheable)
@riverpod
Future<UserProfile> userProfile(UserProfileRef ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getProfile();
}

// Controller para actualizar perfil
@riverpod
class ProfileController extends _$ProfileController {
  @override
  FutureOr<void> build() {}
  
  Future<void> updateProfile(ProfileFormData data) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(profileRepositoryProvider);
      await repository.updateProfile(data);
      // Invalidar caché para refrescar
      ref.invalidate(userProfileProvider);
    });
  }
  
  Future<void> changePassword(String newPassword) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(profileRepositoryProvider);
      await repository.changePassword(newPassword);
    });
  }
}
```

## 🖼️ Pantallas de Presentación

### 1. AccountScreen

**Ruta**: `/cuenta` (ya existe en bottom nav)

**Elementos UI:**

1. **ProfileHeader**
   - Avatar circular con iniciales o foto
   - Nombre completo
   - Email
   - Badge "Miembro desde [fecha]"

2. **ProfileMenu** (lista de opciones)
   - **Mis Datos**
     - "Editar Perfil" → EditProfileScreen
     - "Cambiar Contraseña" → ChangePasswordScreen
   - **Mis Compras**
     - "Mis Pedidos" → OrdersListScreen
     - "Mis Devoluciones" → ReturnsListScreen
   - **Configuración**
     - "Notificaciones" (toggle, futuro)
     - "Idioma" (selector, futuro)
   - **Legal**
     - "Términos y Condiciones" (webview/modal)
     - "Política de Privacidad" (webview/modal)
   - **Soporte**
     - "Centro de Ayuda" (webview/modal)
     - "Contactar" (mailto o form)
   - **Sesión**
     - "Cerrar Sesión" (confirmación)
     - "Eliminar Cuenta" (confirmación doble, rojo)

**Especificaciones:**
- ProfileHeader con gradiente sutil
- Opciones agrupadas en secciones (Divider entre grupos)
- Icons descriptivos para cada opción
- Chevron right en opciones navegables
- Color error para "Eliminar Cuenta"

### 2. EditProfileScreen

**Ruta**: `/cuenta/perfil/editar`

**Formulario:**

1. **Información Personal**
   - AppTextField "Nombre Completo" (pre-rellenado)
   - AppTextField "Email" (disabled, read-only)
   - AppTextField "Teléfono" (opcional, formato +34 XXX XXX XXX)

2. **Dirección de Envío Predeterminada**
   - AppTextField "Dirección" (multiline)
   - AppTextField "Ciudad"
   - AppTextField "Código Postal" (5 dígitos)
   - AppTextField "País" (pre-rellenado "España", disabled)

3. **Botones**
   - AppButton.primary "Guardar Cambios" (fullWidth)
   - AppButton.ghost "Cancelar"

**Validaciones:**
- Nombre: min 3 caracteres
- Teléfono: formato español (opcional)
- Código Postal: 5 dígitos (si se completa)

**Flujo:**
1. Cargar datos actuales del perfil
2. Usuario edita campos
3. Tap "Guardar"
4. Validar
5. Actualizar perfil via provider
6. Mostrar toast "Perfil actualizado"
7. Navegar back

**Estados:**
- Loading: Skeleton del form
- Form: Editable
- Saving: Botón con spinner
- Success: Toast + back
- Error: Mensaje de error

### 3. ChangePasswordScreen

**Ruta**: `/cuenta/perfil/password`

**Formulario:**

1. AppTextField "Contraseña Actual" (password)
2. AppTextField "Nueva Contraseña" (password)
3. AppTextField "Confirmar Nueva Contraseña" (password)
4. PasswordStrengthIndicator (reusar del módulo auth)
5. AppButton.primary "Cambiar Contraseña"

**Validaciones:**
- Contraseña actual: requerida
- Nueva contraseña: mínimo 6 caracteres, diferente a actual
- Confirmar: debe coincidir con nueva

**Flujo:**
1. Usuario completa form
2. Validar
3. Llamar a changePassword()
4. Si éxito: Mensaje "Contraseña actualizada" + back
5. Si error: Mostrar mensaje (ej: "Contraseña actual incorrecta")

**Nota:** Supabase Auth maneja la verificación de contraseña actual.

## 🎨 Widgets Personalizados

### 1. ProfileHeader

**Ubicación**: `lib/features/profile/presentation/widgets/profile_header.dart`

**Props:**
- profile: UserProfile

**Layout:**
```
╔═══════════════════════════════════════╗
║                                       ║
║           [ Avatar ]                  ║
║                                       ║
║         Juan Pérez                    ║
║       juan@email.com                  ║
║                                       ║
║    Miembro desde Ene 2025            ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Elementos:**
- Gradiente de fondo (sutil, primary/background)
- Avatar circular (80x80px)
  - Si no hay foto: Mostrar iniciales en CircleAvatar
  - Background: primary, foreground: primary-foreground
- Nombre: headingMedium
- Email: bodySmall, muted
- Badge "Miembro desde": chip pequeño

**Especificaciones:**
- Padding: AppSpacing.xl
- Spacing: AppSpacing.gapMd
- Centrado

### 2. ProfileMenu

**Ubicación**: `lib/features/profile/presentation/widgets/profile_menu.dart`

**Props:**
- onOptionTap: Function(String optionId)

**Estructura:**
- Lista de ProfileOption agrupados
- Dividers entre grupos
- Titles de grupo (ej: "MIS DATOS", "MIS COMPRAS")

### 3. ProfileOption

**Ubicación**: `lib/features/profile/presentation/widgets/profile_option.dart`

**Props:**
- icon: IconData
- title: String
- subtitle: String? (opcional)
- trailing: Widget? (por defecto chevron-right)
- onTap: VoidCallback
- isDanger: bool (default false, para "Eliminar Cuenta")

**Layout:**
```
[ Icon ]  Título                    >
          Subtítulo (opcional)
```

**Especificaciones:**
- ListTile o Container custom
- Padding: AppSpacing.md horizontal, AppSpacing.sm vertical
- Icon size: 24px
- Title: bodyLarge
- Subtitle: bodySmall, muted
- isDanger: Color error para icon y title
- Ripple effect al tap

### 4. AddressForm

**Ubicación**: `lib/features/profile/presentation/widgets/address_form.dart`

**Props:**
- initialData: ProfileFormData?
- onChanged: Function(ProfileFormData)

**Widgets:**
- AppTextField para cada campo (address, city, postal_code)
- Validaciones inline
- Debounced onChange

**Uso:**
Componente reutilizable tanto en EditProfileScreen como en CheckoutScreen.

### 5. DeleteAccountDialog

**Ubicación**: `lib/features/profile/presentation/widgets/delete_account_dialog.dart`

**Características:**
- Dialog modal
- Título: "¿Eliminar cuenta?"
- Mensaje de advertencia: "Esta acción es irreversible. Todos tus datos serán eliminados permanentemente."
- Checkbox: "Entiendo que esta acción no se puede deshacer"
- Botones:
  - "Cancelar" (ghost)
  - "Eliminar Cuenta" (destructive, disabled hasta check)

**Flujo:**
1. Usuario tap en "Eliminar Cuenta" en AccountScreen
2. Abrir dialog
3. Usuario debe marcar checkbox
4. Tap "Eliminar Cuenta"
5. Confirmación adicional (opcional)
6. Llamar a deleteAccount()
7. Logout + navegar a home

## 🔧 Funcionalidades Adicionales

### Foto de Perfil (Opcional/Futuro)

Si se implementa foto de perfil:
- Upload a Supabase Storage (bucket `avatars`)
- Redimensionar a 200x200px
- Guardar URL en customer_profiles
- Mostrar en ProfileHeader

Implementación básica:
```dart
Future<void> uploadAvatar(File image) async {
  final userId = _supabase.auth.currentUser!.id;
  final path = 'avatars/$userId.jpg';
  
  await _supabase.storage
      .from('avatars')
      .upload(path, image, fileOptions: FileOptions(upsert: true));
  
  final url = _supabase.storage.from('avatars').getPublicUrl(path);
  
  // Actualizar profile con avatar_url
}
```

### Notificaciones Push (Futuro)

Placeholder para futuras notificaciones:
- Toggle en AccountScreen
- Guardar preferencia en customer_profiles
- Integrar con Firebase Cloud Messaging

### Idioma (Futuro)

Selector de idioma:
- Español (default)
- Inglés
- Guardar en SharedPreferences
- Aplicar con l10n de Flutter

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados y generados
- [ ] Repository implementado
- [ ] Providers de profile
- [ ] AccountScreen con ProfileHeader y menu completo
- [ ] EditProfileScreen con formulario funcional
- [ ] ChangePasswordScreen con validaciones
- [ ] ProfileHeader muestra datos correctamente
- [ ] ProfileMenu navegación funciona
- [ ] ProfileOption con estados visuales
- [ ] AddressForm reutilizable
- [ ] DeleteAccountDialog con confirmación
- [ ] Actualización de perfil funciona
- [ ] Cambio de contraseña funciona
- [ ] Logout funciona
- [ ] Validaciones funcionan

### Tests Manuales

1. **Ver cuenta:**
   - Tap en tab "Cuenta"
   - Ver perfil con datos correctos
   - Avatar muestra iniciales

2. **Editar perfil:**
   - Tap "Editar Perfil"
   - Modificar campos
   - Guardar
   - Verificar que datos se actualizan

3. **Cambiar contraseña:**
   - Tap "Cambiar Contraseña"
   - Ingresar contraseñas
   - Validar strength indicator
   - Guardar
   - Verificar que se puede login con nueva password

4. **Navegación:**
   - Todas las opciones del menu navegan correctamente
   - Links externos abren (si existen)

5. **Logout:**
   - Tap "Cerrar Sesión"
   - Confirmar
   - Sesión se cierra
   - Redirige a home
   - No puede acceder a rutas protegidas

6. **Validaciones:**
   - Campos requeridos no vacíos
   - Formatos correctos (teléfono, CP)
   - Mensajes de error claros

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 11: Newsletter y Promociones** (opcional) o
**Módulo 12: Panel de Administración** (para gestión completa del negocio)

---

**Tiempo Estimado**: 4-6 horas
**Complejidad**: Media
**Dependencias**: Módulos 01-05 completados
