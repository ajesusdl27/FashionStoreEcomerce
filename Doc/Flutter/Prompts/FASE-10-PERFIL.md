# Prompt para Fase 10: Perfil de Usuario

## 📋 Contexto

Fases 01-09 completadas. Implementaré gestión completa del perfil de usuario.

## 📚 Documentación

Lee: `Doc/Flutter/10-PERFIL-USUARIO.md`

## ✅ Tareas

### 10.1: Modelos Freezed

Crear en `lib/features/profile/domain/models/`:

1. **user_profile.dart**: Combina auth.users + customer_profiles, helpers (hasAddress, initials)
2. **profile_form_data.dart**: DTO para actualización

**EJECUTAR:** build_runner

**Checklist:**
- [ ] 2 modelos
- [ ] build_runner OK

---

### 10.2: Repository

**ProfileRepository**:
- getProfile() → combinar auth + customer_profiles
- updateProfile(data)
- changePassword(newPassword)

**Usar RPC:** `get_customer_profile`, `upsert_customer_profile`

**Checklist:**
- [ ] Repository completo
- [ ] Métodos implementados

---

### 10.3: Providers

```dart
@riverpod
Future<UserProfile> userProfile(UserProfileRef ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getProfile();
}

@riverpod
class ProfileController extends _$ProfileController {
  Future<void> updateProfile(ProfileFormData data) async { /* ... */ }
  Future<void> changePassword(String newPassword) async { /* ... */ }
}
```

**EJECUTAR:** build_runner

**Checklist:**
- [ ] Providers creados
- [ ] build_runner OK

---

### 10.4: AccountScreen (Reemplazar placeholder)

**Archivo:** `lib/features/profile/presentation/screens/account_screen.dart`

**UI:**
1. ProfileHeader:
   - Avatar con iniciales
   - Nombre
   - Email
   - Badge "Miembro desde"

2. ProfileMenu (opciones):
   - **Mis Datos:**
     * Editar Perfil
     * Cambiar Contraseña
   - **Mis Compras:**
     * Mis Pedidos
     * Mis Devoluciones
   - **Legal:**
     * Términos
     * Privacidad
   - **Sesión:**
     * Cerrar Sesión
     * Eliminar Cuenta (rojo)

**Checklist:**
- [ ] ProfileHeader
- [ ] ProfileMenu
- [ ] Navegación funciona
- [ ] Logout funciona

---

### 10.5: EditProfileScreen

**Formulario:**
- Nombre completo
- Email (disabled, read-only)
- Teléfono (opcional)
- Dirección completa
- Ciudad
- Código Postal
- País (disabled)
- Botones: Guardar, Cancelar

**Checklist:**
- [ ] Form completo
- [ ] Pre-rellenado con datos actuales
- [ ] Validaciones
- [ ] Guardar actualiza profile

---

### 10.6: ChangePasswordScreen

**Formulario:**
- Contraseña actual
- Nueva contraseña
- Confirmar nueva
- PasswordStrengthIndicator (reusar de auth)
- Botón "Cambiar"

**Checklist:**
- [ ] Form completo
- [ ] Validación match
- [ ] Update funciona

---

### 10.7: Widgets

**ProfileHeader**: Avatar + info

**ProfileMenu**: Lista de ProfileOption

**ProfileOption**: Icon + título + subtitle + chevron

**DeleteAccountDialog**: Confirmación con checkbox

**Checklist:**
- [ ] 4 widgets
- [ ] Diseño correcto

---

## 🧪 Verificación

**Tests:**
- [ ] Ver cuenta con datos
- [ ] Editar perfil → guardar → actualiza
- [ ] Cambiar password → funciona
- [ ] Logout → cierra sesión
- [ ] Navegación menu OK

## ✅ Checklist Final

- [ ] Modelos + build_runner
- [ ] Repository
- [ ] Providers
- [ ] AccountScreen reemplazado
- [ ] EditProfileScreen
- [ ] ChangePasswordScreen
- [ ] Widgets
- [ ] Tests OK

## 📝 Reporte

```
✅ FASE 10 COMPLETADA

Archivos: [listar]
Tests: Profile ✅, Edit ✅, Password ✅, Logout ✅

Estado: MVP COMPLETO ✅
Opcional: FASE 11 (Newsletter), FASE 12 (Admin)
```

## 🎯 Próximo

**MVP COMPLETO** o continuar con **FASE-11-NEWSLETTER.md** (opcional)
