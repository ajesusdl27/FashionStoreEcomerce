# 📱 Fase 4: Implementación Frontend

## Objetivo

Implementar todas las pantallas y widgets del módulo de autenticación y perfiles, conectándolos con los providers y repositorios de la Fase 3.

---

## 1. Navegación (GoRouter)

### 1.1 Definición de Rutas

```dart
// lib/core/router/routes.dart
abstract class AppRoutes {
  // Auth routes
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const resetPassword = '/reset-password';
  
  // Account routes
  static const account = '/account';
  static const editProfile = '/account/edit-profile';
  static const orders = '/account/orders';
  static const orderDetail = '/account/orders/:id';
  
  // Main app routes
  static const home = '/';
  static const products = '/products';
  static const cart = '/cart';
  static const checkout = '/checkout';
}
```

### 1.2 Router Configuration

```dart
// lib/core/router/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/pages/account_page.dart';
import '../../features/auth/presentation/pages/edit_profile_page.dart';
import 'routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  
  return GoRouter(
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: true,
    
    // Refresh cuando cambia auth state
    refreshListenable: GoRouterRefreshStream(
      ref.watch(authStateChangesProvider.stream),
    ),
    
    // Redirect logic
    redirect: (context, state) {
      final isLoggedIn = authState is AuthAuthenticated;
      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
                          state.matchedLocation == AppRoutes.register ||
                          state.matchedLocation == AppRoutes.forgotPassword;
      final isProtectedRoute = state.matchedLocation.startsWith('/account');
      
      // Si está en ruta protegida sin login, redirigir a login
      if (isProtectedRoute && !isLoggedIn) {
        return '${AppRoutes.login}?redirect=${state.matchedLocation}';
      }
      
      // Si está logueado e intenta ir a auth routes, redirigir a account
      if (isAuthRoute && isLoggedIn) {
        return AppRoutes.account;
      }
      
      return null;
    },
    
    routes: [
      // ===== AUTH ROUTES =====
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) {
          final redirect = state.uri.queryParameters['redirect'];
          return LoginPage(redirectTo: redirect);
        },
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        name: 'resetPassword',
        builder: (context, state) => const ResetPasswordPage(),
      ),
      
      // ===== ACCOUNT ROUTES =====
      GoRoute(
        path: AppRoutes.account,
        name: 'account',
        builder: (context, state) => const AccountPage(),
        routes: [
          GoRoute(
            path: 'edit-profile',
            name: 'editProfile',
            builder: (context, state) => const EditProfilePage(),
          ),
          GoRoute(
            path: 'orders',
            name: 'orders',
            builder: (context, state) => const OrdersPage(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'orderDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return OrderDetailPage(orderId: id);
                },
              ),
            ],
          ),
        ],
      ),
      
      // ===== MAIN APP ROUTES =====
      GoRoute(
        path: AppRoutes.home,
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      // ... más rutas
    ],
    
    errorBuilder: (context, state) => ErrorPage(error: state.error),
  );
});

/// Helper para escuchar streams en GoRouter
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    stream.listen((_) => notifyListeners());
  }
}
```

---

## 2. Páginas de Autenticación

### 2.1 Login Page

```dart
// lib/features/auth/presentation/pages/login_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../../../core/widgets/feedback/message_banner.dart';
import '../providers/auth_provider.dart';
import '../widgets/auth_form.dart';
import '../widgets/trust_badges.dart';

class LoginPage extends ConsumerStatefulWidget {
  final String? redirectTo;
  
  const LoginPage({super.key, this.redirectTo});
  
  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorMessage;
  
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
  
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _errorMessage = null);
    
    await ref.read(authNotifierProvider.notifier).signIn(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
    
    final authState = ref.read(authNotifierProvider);
    
    if (authState is AuthError) {
      setState(() => _errorMessage = authState.message);
    } else if (authState is AuthAuthenticated) {
      if (mounted) {
        final redirect = widget.redirectTo ?? AppRoutes.account;
        context.go(redirect);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoading = authState is AuthLoading;
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.pageInsets,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Header
                  Text(
                    'BIENVENIDO',
                    style: Theme.of(context).textTheme.displayMedium,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Inicia sesión en tu cuenta',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Login Card
                  GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          // Error message
                          if (_errorMessage != null) ...[
                            MessageBanner(
                              message: _errorMessage!,
                              type: MessageType.error,
                              onDismiss: () => setState(() => _errorMessage = null),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          
                          // Auth form fields
                          AuthForm(
                            mode: AuthFormMode.login,
                            emailController: _emailController,
                            passwordController: _passwordController,
                            isLoading: isLoading,
                            onSubmit: _handleLogin,
                          ),
                          
                          const SizedBox(height: AppSpacing.md),
                          
                          // Forgot password link
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => context.push(AppRoutes.forgotPassword),
                              child: const Text('¿Olvidaste tu contraseña?'),
                            ),
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Divider
                          Row(
                            children: [
                              const Expanded(child: Divider()),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                ),
                                child: Text(
                                  'o',
                                  style: TextStyle(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                              const Expanded(child: Divider()),
                            ],
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Register link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '¿No tienes cuenta? ',
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.push(AppRoutes.register),
                                child: const Text('Regístrate gratis'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Trust badges
                  const TrustBadges(
                    badges: [
                      TrustBadge(
                        icon: Icons.history,
                        text: 'Historial de pedidos',
                      ),
                      TrustBadge(
                        icon: Icons.local_offer,
                        text: 'Ofertas exclusivas',
                      ),
                      TrustBadge(
                        icon: Icons.bolt,
                        text: 'Checkout rápido',
                      ),
                      TrustBadge(
                        icon: Icons.favorite,
                        text: 'Lista de favoritos',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 2.2 Register Page

```dart
// lib/features/auth/presentation/pages/register_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../../../core/widgets/feedback/message_banner.dart';
import '../providers/auth_provider.dart';
import '../widgets/auth_form.dart';
import '../widgets/trust_badges.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});
  
  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? _errorMessage;
  String? _successMessage;
  
  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
  
  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Verificar que las contraseñas coincidan
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Las contraseñas no coinciden');
      return;
    }
    
    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });
    
    final success = await ref.read(authNotifierProvider.notifier).signUp(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      fullName: _nameController.text.trim(),
    );
    
    final authState = ref.read(authNotifierProvider);
    
    if (authState is AuthError) {
      setState(() => _errorMessage = authState.message);
    } else if (success) {
      setState(() {
        _successMessage = '¡Cuenta creada! Redirigiendo...';
      });
      
      await Future.delayed(const Duration(milliseconds: 1500));
      
      if (mounted) {
        context.go(AppRoutes.account);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoading = authState is AuthLoading;
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.pageInsets,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Header
                  Text(
                    'ÚNETE',
                    style: Theme.of(context).textTheme.displayMedium,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Crea tu cuenta en segundos',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Register Card
                  GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          // Messages
                          if (_errorMessage != null) ...[
                            MessageBanner(
                              message: _errorMessage!,
                              type: MessageType.error,
                              onDismiss: () => setState(() => _errorMessage = null),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          if (_successMessage != null) ...[
                            MessageBanner(
                              message: _successMessage!,
                              type: MessageType.success,
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          
                          // Auth form fields
                          AuthForm(
                            mode: AuthFormMode.register,
                            nameController: _nameController,
                            emailController: _emailController,
                            passwordController: _passwordController,
                            confirmPasswordController: _confirmPasswordController,
                            isLoading: isLoading,
                            onSubmit: _handleRegister,
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Divider
                          Row(
                            children: [
                              const Expanded(child: Divider()),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                ),
                                child: Text(
                                  'o',
                                  style: TextStyle(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                              const Expanded(child: Divider()),
                            ],
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Login link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '¿Ya tienes cuenta? ',
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.push(AppRoutes.login),
                                child: const Text('Inicia sesión'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Trust badges
                  const TrustBadges(
                    badges: [
                      TrustBadge(
                        icon: Icons.lock_outline,
                        text: 'Datos seguros',
                      ),
                      TrustBadge(
                        icon: Icons.verified_user,
                        text: '100% Gratis',
                      ),
                      TrustBadge(
                        icon: Icons.bolt,
                        text: 'Sin spam',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 2.3 Forgot Password Page

```dart
// lib/features/auth/presentation/pages/forgot_password_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../../../core/widgets/buttons/app_button.dart';
import '../../../../core/widgets/inputs/app_text_field.dart';
import '../../../../core/widgets/feedback/message_banner.dart';
import '../../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});
  
  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String? _message;
  MessageType? _messageType;
  
  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }
  
  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _message = null;
    });
    
    final success = await ref.read(authNotifierProvider.notifier)
      .resetPassword(_emailController.text.trim());
    
    setState(() {
      _isLoading = false;
      if (success) {
        _message = 'Si el email está registrado, recibirás un enlace para recuperar tu contraseña.';
        _messageType = MessageType.success;
        _emailController.clear();
      } else {
        _message = 'Error al enviar el correo. Inténtalo de nuevo.';
        _messageType = MessageType.error;
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.pageInsets,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Header
                  Text(
                    'RECUPERAR',
                    style: Theme.of(context).textTheme.displayMedium,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Restablece tu contraseña',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Form Card
                  GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          Text(
                            'Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Email field
                          AppTextField(
                            label: 'Email',
                            hint: 'tu@email.com',
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            validator: Validators.email,
                            required: true,
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Message
                          if (_message != null) ...[
                            MessageBanner(
                              message: _message!,
                              type: _messageType!,
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          
                          // Submit button
                          AppButton(
                            text: 'ENVIAR INSTRUCCIONES',
                            onPressed: _handleSubmit,
                            isLoading: _isLoading,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 2.4 Reset Password Page

```dart
// lib/features/auth/presentation/pages/reset_password_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../../../core/widgets/buttons/app_button.dart';
import '../../../../core/widgets/inputs/app_password_field.dart';
import '../../../../core/widgets/feedback/message_banner.dart';
import '../../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';

class ResetPasswordPage extends ConsumerStatefulWidget {
  const ResetPasswordPage({super.key});
  
  @override
  ConsumerState<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends ConsumerState<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;
  
  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
  
  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Las contraseñas no coinciden');
      return;
    }
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    final success = await ref.read(authNotifierProvider.notifier)
      .updatePassword(_passwordController.text);
    
    setState(() => _isLoading = false);
    
    if (success) {
      setState(() {
        _successMessage = '¡Contraseña actualizada! Redirigiendo...';
      });
      
      await Future.delayed(const Duration(seconds: 2));
      
      if (mounted) {
        context.go(AppRoutes.account);
      }
    } else {
      setState(() {
        _errorMessage = 'Error al actualizar la contraseña';
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.pageInsets,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Header
                  Text(
                    'NUEVA CONTRASEÑA',
                    style: Theme.of(context).textTheme.displaySmall,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Establece tu nueva contraseña',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Form Card
                  GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          // Messages
                          if (_errorMessage != null) ...[
                            MessageBanner(
                              message: _errorMessage!,
                              type: MessageType.error,
                              onDismiss: () => setState(() => _errorMessage = null),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          if (_successMessage != null) ...[
                            MessageBanner(
                              message: _successMessage!,
                              type: MessageType.success,
                            ),
                            const SizedBox(height: AppSpacing.lg),
                          ],
                          
                          // Password field
                          AppPasswordField(
                            label: 'Nueva contraseña',
                            controller: _passwordController,
                            validator: Validators.password,
                            required: true,
                          ),
                          
                          const SizedBox(height: AppSpacing.lg),
                          
                          // Confirm password field
                          AppPasswordField(
                            label: 'Confirmar contraseña',
                            controller: _confirmPasswordController,
                            validator: Validators.confirmPassword(
                              _passwordController.text,
                            ),
                            required: true,
                          ),
                          
                          const SizedBox(height: AppSpacing.xl),
                          
                          // Submit button
                          AppButton(
                            text: 'ACTUALIZAR CONTRASEÑA',
                            onPressed: _handleSubmit,
                            isLoading: _isLoading,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 3. Páginas de Cuenta

### 3.1 Account Page (Dashboard)

```dart
// lib/features/auth/presentation/pages/account_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';
import '../widgets/account_info_card.dart';
import '../widgets/recent_orders_card.dart';
import '../widgets/account_menu_item.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final colorScheme = Theme.of(context).colorScheme;
    
    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              title: const Text('MI CUENTA'),
              centerTitle: false,
            ),
            
            // Content
            SliverPadding(
              padding: AppSpacing.pageInsets,
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Header
                  Text(
                    'MI CUENTA',
                    style: Theme.of(context).textTheme.displaySmall,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Hola, ${user.displayName} 👋',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  
                  // Account Info Card
                  AccountInfoCard(user: user),
                  const SizedBox(height: AppSpacing.lg),
                  
                  // Recent Orders Card
                  const RecentOrdersCard(),
                  const SizedBox(height: AppSpacing.lg),
                  
                  // Quick Actions Card
                  GlassCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        AccountMenuItem(
                          icon: Icons.edit_outlined,
                          title: 'Editar Perfil',
                          onTap: () => context.push(AppRoutes.editProfile),
                        ),
                        const Divider(height: 1),
                        AccountMenuItem(
                          icon: Icons.inventory_2_outlined,
                          title: 'Mis Pedidos',
                          onTap: () => context.push(AppRoutes.orders),
                        ),
                        const Divider(height: 1),
                        AccountMenuItem(
                          icon: Icons.logout,
                          title: 'Cerrar Sesión',
                          isDestructive: true,
                          onTap: () async {
                            await ref.read(authNotifierProvider.notifier).signOut();
                            if (context.mounted) {
                              context.go(AppRoutes.home);
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 3.2 Edit Profile Page

```dart
// lib/features/auth/presentation/pages/edit_profile_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../../../core/widgets/buttons/app_button.dart';
import '../../../../core/widgets/inputs/app_text_field.dart';
import '../../../../core/widgets/feedback/message_banner.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/entities/profile.dart';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});
  
  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _postalCodeController;
  
  String? _message;
  MessageType? _messageType;
  
  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _addressController = TextEditingController();
    _cityController = TextEditingController();
    _postalCodeController = TextEditingController();
    
    // Initialize with current profile data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profile = ref.read(currentProfileProvider);
      if (profile != null) {
        _nameController.text = profile.fullName ?? '';
        _phoneController.text = profile.phone ?? '';
        _addressController.text = profile.defaultAddress ?? '';
        _cityController.text = profile.defaultCity ?? '';
        _postalCodeController.text = profile.defaultPostalCode ?? '';
      }
    });
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }
  
  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _message = null;
      _messageType = null;
    });
    
    final currentProfile = ref.read(currentProfileProvider);
    final user = ref.read(currentUserProvider);
    
    if (currentProfile == null || user == null) return;
    
    final updatedProfile = ProfileEntity(
      id: user.id,
      fullName: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      defaultAddress: _addressController.text.trim(),
      defaultCity: _cityController.text.trim(),
      defaultPostalCode: _postalCodeController.text.trim(),
      defaultCountry: 'España',
    );
    
    final success = await ref.read(profileNotifierProvider.notifier)
      .updateProfile(updatedProfile);
    
    setState(() {
      if (success) {
        _message = '¡Perfil actualizado correctamente!';
        _messageType = MessageType.success;
      } else {
        _message = 'Error al guardar. Inténtalo de nuevo.';
        _messageType = MessageType.error;
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileNotifierProvider);
    final isLoading = profileState is ProfileUpdating || profileState is ProfileLoading;
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('EDITAR PERFIL'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.pageInsets,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'EDITAR PERFIL',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Actualiza tu información personal y dirección de envío',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              
              // Message
              if (_message != null) ...[
                MessageBanner(
                  message: _message!,
                  type: _messageType!,
                  onDismiss: () => setState(() => _message = null),
                ),
                const SizedBox(height: AppSpacing.lg),
              ],
              
              // Personal Info Section
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.person_outline,
                          color: colorScheme.primary,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          'Información Personal',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    AppTextField(
                      label: 'Nombre completo',
                      hint: 'Tu nombre completo',
                      controller: _nameController,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    AppTextField(
                      label: 'Teléfono',
                      hint: '612 345 678',
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      validator: Validators.phone,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              
              // Address Section
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          color: colorScheme.primary,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          'Dirección de Envío por Defecto',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Esta dirección se usará para autocompletar tus datos en el checkout.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    AppTextField(
                      label: 'Dirección',
                      hint: 'Calle, número, piso...',
                      controller: _addressController,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            label: 'Ciudad',
                            hint: 'Madrid',
                            controller: _cityController,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        SizedBox(
                          width: 120,
                          child: AppTextField(
                            label: 'C. Postal',
                            hint: '28001',
                            controller: _postalCodeController,
                            keyboardType: TextInputType.number,
                            validator: Validators.postalCode,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    AppTextField(
                      label: 'País',
                      hint: 'España',
                      enabled: false,
                      controller: TextEditingController(text: 'España'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              
              // Save Button
              AppButton(
                text: 'GUARDAR CAMBIOS',
                icon: Icons.check,
                onPressed: _handleSave,
                isLoading: isLoading,
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 4. Widgets Reutilizables

### 4.1 AuthForm Widget

```dart
// lib/features/auth/presentation/widgets/auth_form.dart
import 'package:flutter/material.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/widgets/buttons/app_button.dart';
import '../../../../core/widgets/inputs/app_text_field.dart';
import '../../../../core/widgets/inputs/app_password_field.dart';
import '../../../../core/utils/validators.dart';

enum AuthFormMode { login, register }

class AuthForm extends StatelessWidget {
  final AuthFormMode mode;
  final TextEditingController? nameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController? confirmPasswordController;
  final bool isLoading;
  final VoidCallback onSubmit;
  
  const AuthForm({
    super.key,
    required this.mode,
    this.nameController,
    required this.emailController,
    required this.passwordController,
    this.confirmPasswordController,
    required this.isLoading,
    required this.onSubmit,
  });
  
  bool get isRegister => mode == AuthFormMode.register;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Name field (register only)
        if (isRegister) ...[
          AppTextField(
            label: 'Nombre completo',
            hint: 'Tu nombre',
            controller: nameController,
            textCapitalization: TextCapitalization.words,
            required: true,
            validator: (value) => Validators.required(value, 'El nombre'),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
        
        // Email field
        AppTextField(
          label: 'Email',
          hint: 'tu@email.com',
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          validator: Validators.email,
          required: true,
        ),
        const SizedBox(height: AppSpacing.lg),
        
        // Password field
        AppPasswordField(
          label: 'Contraseña',
          controller: passwordController,
          validator: Validators.password,
          required: true,
        ),
        
        // Confirm password field (register only)
        if (isRegister) ...[
          const SizedBox(height: AppSpacing.lg),
          AppPasswordField(
            label: 'Confirmar contraseña',
            controller: confirmPasswordController,
            validator: Validators.confirmPassword(passwordController.text),
            required: true,
          ),
        ],
        
        const SizedBox(height: AppSpacing.xl),
        
        // Submit button
        AppButton(
          text: isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN',
          onPressed: onSubmit,
          isLoading: isLoading,
        ),
      ],
    );
  }
}
```

### 4.2 AppPasswordField Widget

```dart
// lib/core/widgets/inputs/app_password_field.dart
import 'package:flutter/material.dart';
import '../../../core/theme/spacing.dart';

class AppPasswordField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final bool required;
  
  const AppPasswordField({
    super.key,
    required this.label,
    this.controller,
    this.validator,
    this.required = false,
  });
  
  @override
  State<AppPasswordField> createState() => _AppPasswordFieldState();
}

class _AppPasswordFieldState extends State<AppPasswordField> {
  bool _obscureText = true;
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
            children: [
              TextSpan(text: widget.label),
              if (widget.required)
                TextSpan(
                  text: ' *',
                  style: TextStyle(color: colorScheme.secondary),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        TextFormField(
          controller: widget.controller,
          validator: widget.validator,
          obscureText: _obscureText,
          decoration: InputDecoration(
            hintText: '••••••••',
            suffixIcon: IconButton(
              icon: Icon(
                _obscureText ? Icons.visibility_off : Icons.visibility,
                color: colorScheme.onSurfaceVariant,
              ),
              onPressed: () {
                setState(() => _obscureText = !_obscureText);
              },
            ),
          ),
        ),
      ],
    );
  }
}
```

### 4.3 UserAvatar Widget

```dart
// lib/features/auth/presentation/widgets/user_avatar.dart
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../domain/entities/user.dart';

class UserAvatar extends StatelessWidget {
  final UserEntity user;
  final double size;
  final VoidCallback? onTap;
  
  const UserAvatar({
    super.key,
    required this.user,
    this.size = 40,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    Widget avatar;
    
    if (user.avatarUrl != null && user.avatarUrl!.isNotEmpty) {
      avatar = CachedNetworkImage(
        imageUrl: user.avatarUrl!,
        imageBuilder: (context, imageProvider) => Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            image: DecorationImage(
              image: imageProvider,
              fit: BoxFit.cover,
            ),
            border: Border.all(
              color: colorScheme.outline,
              width: 2,
            ),
          ),
        ),
        placeholder: (context, url) => _buildInitialsAvatar(context),
        errorWidget: (context, url, error) => _buildInitialsAvatar(context),
      );
    } else {
      avatar = _buildInitialsAvatar(context);
    }
    
    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: avatar,
      );
    }
    
    return avatar;
  }
  
  Widget _buildInitialsAvatar(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: colorScheme.primary.withOpacity(0.2),
        border: Border.all(
          color: colorScheme.primary.withOpacity(0.5),
          width: 2,
        ),
      ),
      child: Center(
        child: Text(
          user.initials,
          style: TextStyle(
            color: colorScheme.primary,
            fontWeight: FontWeight.bold,
            fontSize: size * 0.4,
          ),
        ),
      ),
    );
  }
}
```

### 4.4 AccountInfoCard Widget

```dart
// lib/features/auth/presentation/widgets/account_info_card.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/spacing.dart';
import '../../../../core/widgets/cards/glass_card.dart';
import '../../domain/entities/user.dart';

class AccountInfoCard extends StatelessWidget {
  final UserEntity user;
  
  const AccountInfoCard({super.key, required this.user});
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final dateFormat = DateFormat('d MMMM yyyy', 'es_ES');
    
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(
                Icons.person_outline,
                color: colorScheme.primary,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Información de la Cuenta',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          
          // Email
          _buildInfoRow(
            context,
            label: 'Email',
            value: user.email,
          ),
          const SizedBox(height: AppSpacing.md),
          
          // Name (if available)
          if (user.fullName != null && user.fullName!.isNotEmpty) ...[
            _buildInfoRow(
              context,
              label: 'Nombre',
              value: user.fullName!,
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          
          // Member since
          _buildInfoRow(
            context,
            label: 'Miembro desde',
            value: dateFormat.format(user.createdAt),
          ),
        ],
      ),
    );
  }
  
  Widget _buildInfoRow(
    BuildContext context, {
    required String label,
    required String value,
  }) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ],
    );
  }
}
```

---

## 5. Checklist de Frontend

### Navegación

- [ ] Rutas definidas en `routes.dart`
- [ ] GoRouter configurado con redirects
- [ ] Auth guards funcionando
- [ ] Deep links para reset password

### Páginas de Auth

- [ ] Login Page completa
- [ ] Register Page completa
- [ ] Forgot Password Page completa
- [ ] Reset Password Page completa
- [ ] Manejo de errores y loading states
- [ ] Mensajes de feedback al usuario
- [ ] Validación de formularios en tiempo real

### Páginas de Cuenta

- [ ] Account Page (Dashboard) completa
- [ ] Edit Profile Page completa
- [ ] Carga automática del perfil
- [ ] Actualización de perfil funcional

### Widgets

- [ ] `AuthForm` adaptable login/register
- [ ] `AppTextField` con estilos correctos
- [ ] `AppPasswordField` con toggle visibility
- [ ] `AppButton` con loading state
- [ ] `GlassCard` con efecto blur
- [ ] `MessageBanner` para feedback
- [ ] `UserAvatar` con iniciales/imagen
- [ ] `AccountInfoCard`
- [ ] `RecentOrdersCard`
- [ ] `TrustBadges`

### UX

- [ ] Animaciones de transición
- [ ] Estados de loading en todas las acciones
- [ ] Mensajes de error claros en español
- [ ] Validación inline en formularios
- [ ] Keyboard handling correcto
- [ ] Safe area respetada

### Testing

- [ ] Widget tests de páginas
- [ ] Widget tests de formularios
- [ ] Integration tests del flujo de auth
- [ ] Golden tests de pantallas

### Accesibilidad

- [ ] Labels en inputs
- [ ] Contraste de colores adecuado
- [ ] Tamaño de touch targets (48x48 mínimo)
- [ ] Soporte de VoiceOver/TalkBack
