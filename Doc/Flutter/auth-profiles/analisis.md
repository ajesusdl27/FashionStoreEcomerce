# 📋 Análisis del Módulo: Autenticación y Perfiles

## 1. Resumen Ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Módulo** | Sistema de Autenticación y Gestión de Perfiles |
| **Prioridad** | 🔴 Alta (Módulo #1) |
| **Complejidad** | Media-Alta |
| **Dependencias** | Supabase Auth, customer_profiles table |
| **Páginas Web** | 7 páginas principales |
| **Componentes React** | 9 componentes |

---

## 2. Inventario de Funcionalidades

### 2.1 Autenticación de Usuarios

| Funcionalidad | Estado | Archivo Principal |
|---------------|--------|-------------------|
| ✅ Registro de usuario | Activo | `AuthForm.tsx` |
| ✅ Login con email/password | Activo | `AuthForm.tsx` |
| ✅ Logout | Activo | `logout.ts` |
| ✅ Recuperación de contraseña | Activo | `ForgotPasswordForm.tsx` |
| ✅ Reseteo de contraseña | Activo | `ResetPasswordForm.tsx` |
| ✅ Sesiones con httpOnly cookies | Activo | `middleware.ts` |
| ✅ Auto-refresh de tokens | Activo | `auth-utils.ts` |
| ✅ Protección de rutas | Activo | `middleware.ts` |
| ✅ Verificación de email | Activo | Supabase nativo |

### 2.2 Gestión de Perfiles

| Funcionalidad | Estado | Archivo Principal |
|---------------|--------|-------------------|
| ✅ Ver información de cuenta | Activo | `cuenta/index.astro` |
| ✅ Editar perfil | Activo | `ProfileForm.tsx` |
| ✅ Dirección de envío por defecto | Activo | `ProfileForm.tsx` |
| ✅ Ver pedidos recientes | Activo | `cuenta/index.astro` |
| ✅ Navegación a pedidos | Activo | `cuenta/pedidos/` |

### 2.3 Control de Acceso

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| ✅ Rutas protegidas cliente | Activo | `/cuenta/*` |
| ✅ Rutas protegidas admin | Activo | `/admin/*` |
| ✅ Verificación de rol admin | Activo | `user_metadata.is_admin` |
| ✅ Redirección post-login | Activo | Parámetro `redirectTo` |

---

## 3. Arquitectura Actual

### 3.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        PÁGINAS ASTRO                            │
├─────────────────────────────────────────────────────────────────┤
│ /cuenta/login.astro      → AuthForm (mode="login")              │
│ /cuenta/registro.astro   → AuthForm (mode="register")           │
│ /cuenta/index.astro      → Dashboard de cuenta                  │
│ /cuenta/perfil.astro     → ProfileForm                          │
│ /cuenta/recuperar.astro  → ForgotPasswordForm                   │
│ /cuenta/reset.astro      → ResetPasswordForm                    │
│ /cuenta/pedidos/         → Lista y detalle de pedidos           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENTES REACT                          │
├─────────────────────────────────────────────────────────────────┤
│ AuthProvider.tsx         → Context para estado de auth          │
│ AuthForm.tsx             → Formulario login/registro            │
│ ProfileForm.tsx          → Formulario de perfil                 │
│ ForgotPasswordForm.tsx   → Solicitar recuperación               │
│ ResetPasswordForm.tsx    → Establecer nueva contraseña          │
│ UserMenu.tsx             → Menú desplegable de usuario          │
│ UserMenuWithAuth.tsx     → Wrapper con AuthProvider             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API ENDPOINTS                             │
├─────────────────────────────────────────────────────────────────┤
│ /api/auth/login          → POST: Autenticar y setear cookies    │
│ /api/auth/logout         → GET/POST: Limpiar cookies            │
│ /api/auth/get-session    → GET: Obtener usuario actual          │
│ /api/auth/set-session    → POST: Setear cookies de sesión       │
│ /api/customer/profile    → GET/PUT: Gestión de perfil           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│ auth.users               → Usuarios de Supabase Auth            │
│ customer_profiles        → Perfiles extendidos                  │
│ orders                   → Pedidos vinculados por customer_id   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Autenticación

```
[Usuario] → [Login Form] → [/api/auth/login]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            [Supabase Auth]              [Set Cookies]
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                           [Redirect]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
               [/cuenta]                   [/admin]
```

---

## 4. Estructura de Datos

### 4.1 Tabla `auth.users` (Supabase Auth)

```sql
-- Gestionada por Supabase Auth
id              UUID PRIMARY KEY
email           TEXT UNIQUE
encrypted_password TEXT
raw_user_meta_data JSONB  -- { full_name, is_admin, role }
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### 4.2 Tabla `customer_profiles`

```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  default_postal_code TEXT,
  default_country TEXT DEFAULT 'España',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 RLS Policies

| Política | Acción | Descripción |
|----------|--------|-------------|
| `profiles_select_own` | SELECT | Usuario ve solo su perfil |
| `profiles_insert_own` | INSERT | Usuario crea solo su perfil |
| `profiles_update_own` | UPDATE | Usuario actualiza solo su perfil |
| `profiles_select_all_authenticated` | SELECT | Cualquier autenticado puede leer (admin) |

### 4.4 Triggers

```sql
-- Auto-crear perfil al registrarse
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
```

### 4.5 Funciones RPC

| Función | Parámetros | Retorno |
|---------|------------|---------|
| `get_customer_profile()` | - | Profile row |
| `upsert_customer_profile()` | full_name, phone, address... | Void |
| `get_customer_orders(uuid)` | customer_id | Orders list |
| `get_customer_order_detail(uuid, uuid)` | order_id, customer_id | Order detail |

---

## 5. Validaciones Actuales

### 5.1 Registro

| Campo | Validación |
|-------|------------|
| Email | Formato email válido, único |
| Password | Mínimo 6 caracteres |
| Confirm Password | Debe coincidir con password |
| Nombre | Requerido |

### 5.2 Login

| Campo | Validación |
|-------|------------|
| Email | Requerido, formato válido |
| Password | Requerido |

### 5.3 Perfil

| Campo | Validación |
|-------|------------|
| full_name | Opcional |
| phone | Opcional, formato libre |
| default_address | Opcional |
| default_city | Opcional |
| default_postal_code | Opcional, máximo 5 caracteres |
| default_country | Fijo: "España" |

---

## 6. Sistema de Estilos

### 6.1 Colores Principales (HSL Variables)

```css
/* Light Mode */
--primary: 84 85% 35%;        /* Verde oscuro */
--primary-foreground: 0 0% 100%;
--background: 0 0% 100%;       /* Blanco */
--foreground: 240 10% 3.9%;   /* Negro */
--accent: 351 100% 63.5%;     /* Rojo #FF4757 */

/* Dark Mode */
--primary: 84 100% 50%;       /* Verde neón #CCFF00 */
--primary-foreground: 240 10% 3.9%;
--background: 240 10% 3.9%;   /* Negro */
--foreground: 0 0% 98%;       /* Blanco */
```

### 6.2 Tipografías

| Uso | Fuente | Clase Tailwind |
|-----|--------|----------------|
| Display/Títulos | Bebas Neue | `font-display` |
| Headings | Oswald | `font-heading` |
| Body | Space Grotesk | `font-body` |

### 6.3 Clases de Componentes Clave

```css
/* Cards con efecto glass */
.glass {
  @apply bg-card/95 backdrop-blur-sm border border-border;
}

/* Inputs de formulario */
.admin-input {
  @apply w-full px-4 py-3 bg-card border border-input rounded-lg 
         text-foreground placeholder:text-muted-foreground transition-all
         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary;
}

/* Botones primarios */
.admin-btn-primary {
  @apply inline-flex items-center justify-center gap-2 px-4 py-2.5 
         rounded-lg font-medium bg-primary text-primary-foreground 
         hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)];
}
```

---

## 7. Estados y Mensajes

### 7.1 Estados de Loading

- Spinner circular con `animate-spin`
- Texto dinámico: "Guardando...", "Cargando..."
- Disabled state en botones

### 7.2 Mensajes de Error/Éxito

```tsx
// Componente de mensaje
<div className={`px-4 py-3 rounded-lg ${
  message.type === 'success' 
    ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' 
    : 'bg-accent/10 border border-accent text-accent'
}`}>
  {message.text}
</div>
```

### 7.3 Mensajes de Error Traducidos

| Error Supabase | Mensaje Usuario |
|----------------|-----------------|
| Invalid login credentials | Email o contraseña incorrectos |
| User already registered | Este email ya está registrado |
| Password should be at least... | La contraseña debe tener al menos 6 caracteres |
| New password should be different | La nueva contraseña debe ser diferente a la anterior |

---

## 8. Casos Edge y Manejo de Errores

### 8.1 Escenarios Identificados

| Escenario | Manejo Actual |
|-----------|---------------|
| Token expirado | Auto-refresh via middleware |
| Sesión inválida | Clear cookies + redirect login |
| Usuario intenta acceder a admin | Redirect a /admin/login con error |
| Link de recuperación expirado | Mensaje de error + link para solicitar nuevo |
| Confirmación de email pendiente | Mensaje informativo |
| Pérdida de conexión | Error genérico de conexión |
| Perfil no existe | Se crea automáticamente via trigger |

### 8.2 Timeouts y Redirecciones

| Acción | Delay | Destino |
|--------|-------|---------|
| Login exitoso | 1000ms | `redirectTo` param o `/cuenta` |
| Registro exitoso | 1500ms | `/cuenta` |
| Reset password exitoso | 2000ms | `/cuenta` |
| Logout | 0ms | `/` (home) |

---

## 9. Dependencias Externas

### 9.1 Packages Actuales

```json
{
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "lucide-react": "^0.x"  // Iconos
}
```

### 9.2 Servicios Externos

| Servicio | Uso |
|----------|-----|
| Supabase Auth | Autenticación completa |
| Supabase Database | Perfiles de usuario |
| Supabase Email | Confirmación y recuperación |

---

## 10. Métricas de Complejidad

| Métrica | Valor |
|---------|-------|
| Páginas a migrar | 7 |
| Componentes React | 9 |
| API Endpoints | 5 |
| Tablas DB | 2 (+ auth.users) |
| Funciones RPC | 4 |
| Políticas RLS | 4 |
| Formularios | 4 |
| Campos de formulario | 12 total |
| Estados de gestión | Loading, Error, Success, User |

---

## 11. Notas Técnicas Importantes

### 11.1 Seguridad

- Tokens almacenados en httpOnly cookies (no localStorage)
- Validación server-side de tokens
- SECURITY DEFINER en funciones RPC
- RLS habilitado en todas las tablas

### 11.2 Consideraciones para Flutter

1. **No hay cookies**: Flutter usa secure storage nativo
2. **SDK diferente**: `supabase_flutter` vs `@supabase/supabase-js`
3. **Auth listener**: Usar `onAuthStateChange` nativo
4. **Deep links**: Necesario para recuperación de password
5. **Biometrics**: Oportunidad de mejora (no existe en web)

### 11.3 Mejoras Potenciales en Flutter

- [ ] Login con biometría (Face ID / Touch ID)
- [ ] Login social (Google, Apple)
- [ ] Persistencia offline del perfil
- [ ] Push notifications para sesión
- [ ] Remember me / Keep logged in
