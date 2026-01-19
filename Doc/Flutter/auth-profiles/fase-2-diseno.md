# 🎨 Fase 2: Diseño UI

## Objetivo

Definir el sistema de diseño Flutter que replica fielmente el look & feel de FashionStore web, con adaptaciones para experiencia móvil nativa.

---

## 1. Sistema de Temas Flutter

### 1.1 Paleta de Colores

```dart
// lib/core/theme/colors.dart
import 'package:flutter/material.dart';

/// Colores de FashionStore basados en variables CSS HSL
abstract class AppColors {
  // ===== LIGHT MODE =====
  static const lightPrimary = Color(0xFF588C00);        // hsl(84, 85%, 35%)
  static const lightPrimaryForeground = Color(0xFFFFFFFF);
  static const lightBackground = Color(0xFFFFFFFF);
  static const lightForeground = Color(0xFF09090B);     // hsl(240, 10%, 3.9%)
  static const lightCard = Color(0xFFFFFFFF);
  static const lightCardForeground = Color(0xFF09090B);
  static const lightMuted = Color(0xFFF4F4F5);          // hsl(240, 4.8%, 95.9%)
  static const lightMutedForeground = Color(0xFF71717A); // hsl(240, 3.8%, 46.1%)
  static const lightBorder = Color(0xFFE4E4E7);         // hsl(240, 5.9%, 90%)
  static const lightInput = Color(0xFFE4E4E7);
  
  // ===== DARK MODE =====
  static const darkPrimary = Color(0xFFCCFF00);         // hsl(84, 100%, 50%) - Neón
  static const darkPrimaryForeground = Color(0xFF09090B);
  static const darkBackground = Color(0xFF09090B);      // hsl(240, 10%, 3.9%)
  static const darkForeground = Color(0xFFFAFAFA);      // hsl(0, 0%, 98%)
  static const darkCard = Color(0xFF18181B);            // Ligeramente más claro
  static const darkCardForeground = Color(0xFFFAFAFA);
  static const darkMuted = Color(0xFF27272A);           // hsl(240, 3.7%, 15.9%)
  static const darkMutedForeground = Color(0xFFA1A1AA); // hsl(240, 5%, 64.9%)
  static const darkBorder = Color(0xFF27272A);
  static const darkInput = Color(0xFF27272A);
  
  // ===== COLORES SEMÁNTICOS =====
  static const accent = Color(0xFFFF4757);              // Rojo - hsl(351, 100%, 63.5%)
  static const accentForeground = Color(0xFFFAFAFA);
  
  static const success = Color(0xFF10B981);             // Emerald-500
  static const successLight = Color(0xFF10B98119);      // 10% opacity
  
  static const warning = Color(0xFFF59E0B);             // Amber-500
  static const warningLight = Color(0xFFF59E0B19);
  
  static const error = Color(0xFFEF4444);               // Red-500
  static const errorLight = Color(0xFFEF444419);
  
  static const info = Color(0xFF3B82F6);                // Blue-500
  static const infoLight = Color(0xFF3B82F619);
  
  // ===== COLORES DE ESTADO PEDIDOS =====
  static const statusPending = Color(0xFFF59E0B);
  static const statusPaid = Color(0xFF10B981);
  static const statusShipped = Color(0xFF3B82F6);
  static const statusDelivered = Color(0xFFCCFF00);
  static const statusCancelled = Color(0xFFEF4444);
}
```

### 1.2 Tipografías

```dart
// lib/core/theme/typography.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract class AppTypography {
  // ===== DISPLAY - Bebas Neue =====
  // Usado para: Títulos principales de página (BIENVENIDO, MI CUENTA, etc.)
  static TextStyle display(BuildContext context) => GoogleFonts.bebasNeue(
    fontSize: 48,
    fontWeight: FontWeight.w400,
    letterSpacing: 2,
    color: Theme.of(context).colorScheme.primary,
  );
  
  static TextStyle displaySmall(BuildContext context) => GoogleFonts.bebasNeue(
    fontSize: 32,
    fontWeight: FontWeight.w400,
    letterSpacing: 1.5,
    color: Theme.of(context).colorScheme.primary,
  );

  // ===== HEADING - Oswald =====
  // Usado para: Subtítulos, nombres de secciones
  static TextStyle headingLarge(BuildContext context) => GoogleFonts.oswald(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: Theme.of(context).colorScheme.onSurface,
  );
  
  static TextStyle headingMedium(BuildContext context) => GoogleFonts.oswald(
    fontSize: 20,
    fontWeight: FontWeight.w500,
    color: Theme.of(context).colorScheme.onSurface,
  );
  
  static TextStyle headingSmall(BuildContext context) => GoogleFonts.oswald(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: Theme.of(context).colorScheme.onSurface,
  );

  // ===== BODY - Space Grotesk =====
  // Usado para: Texto general, formularios, descripciones
  static TextStyle bodyLarge(BuildContext context) => GoogleFonts.spaceGrotesk(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurface,
  );
  
  static TextStyle bodyMedium(BuildContext context) => GoogleFonts.spaceGrotesk(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurface,
  );
  
  static TextStyle bodySmall(BuildContext context) => GoogleFonts.spaceGrotesk(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurfaceVariant,
  );

  // ===== LABEL =====
  static TextStyle label(BuildContext context) => GoogleFonts.spaceGrotesk(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: Theme.of(context).colorScheme.onSurfaceVariant,
  );
  
  static TextStyle labelSmall(BuildContext context) => GoogleFonts.spaceGrotesk(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: Theme.of(context).colorScheme.onSurfaceVariant,
  );

  // ===== BUTTON =====
  static TextStyle button(BuildContext context) => GoogleFonts.oswald(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 1,
  );
}
```

### 1.3 Espaciados

```dart
// lib/core/theme/spacing.dart
abstract class AppSpacing {
  // Espaciados base (múltiplos de 4)
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static const double xxxl = 64;
  
  // Padding de contenedores
  static const double pagePadding = 16;
  static const double cardPadding = 24;
  static const double formPadding = 24;
  
  // Gaps entre elementos
  static const double formFieldGap = 24;
  static const double sectionGap = 32;
  static const double listItemGap = 16;
  
  // Border radius
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double radiusFull = 9999;
  
  // EdgeInsets helpers
  static const EdgeInsets pageInsets = EdgeInsets.all(pagePadding);
  static const EdgeInsets cardInsets = EdgeInsets.all(cardPadding);
  static const EdgeInsets formInsets = EdgeInsets.all(formPadding);
}
```

### 1.4 ThemeData Completo

```dart
// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';
import 'spacing.dart';

abstract class AppTheme {
  // ===== LIGHT THEME =====
  static ThemeData get light {
    final colorScheme = ColorScheme.light(
      primary: AppColors.lightPrimary,
      onPrimary: AppColors.lightPrimaryForeground,
      secondary: AppColors.accent,
      onSecondary: AppColors.accentForeground,
      surface: AppColors.lightCard,
      onSurface: AppColors.lightForeground,
      background: AppColors.lightBackground,
      onBackground: AppColors.lightForeground,
      error: AppColors.error,
      onError: Colors.white,
      outline: AppColors.lightBorder,
      surfaceVariant: AppColors.lightMuted,
      onSurfaceVariant: AppColors.lightMutedForeground,
    );
    
    return _buildTheme(colorScheme, Brightness.light);
  }
  
  // ===== DARK THEME =====
  static ThemeData get dark {
    final colorScheme = ColorScheme.dark(
      primary: AppColors.darkPrimary,
      onPrimary: AppColors.darkPrimaryForeground,
      secondary: AppColors.accent,
      onSecondary: AppColors.accentForeground,
      surface: AppColors.darkCard,
      onSurface: AppColors.darkForeground,
      background: AppColors.darkBackground,
      onBackground: AppColors.darkForeground,
      error: AppColors.error,
      onError: Colors.white,
      outline: AppColors.darkBorder,
      surfaceVariant: AppColors.darkMuted,
      onSurfaceVariant: AppColors.darkMutedForeground,
    );
    
    return _buildTheme(colorScheme, Brightness.dark);
  }
  
  static ThemeData _buildTheme(ColorScheme colorScheme, Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      
      // Scaffold
      scaffoldBackgroundColor: colorScheme.background,
      
      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: isDark 
          ? SystemUiOverlayStyle.light 
          : SystemUiOverlayStyle.dark,
        titleTextStyle: GoogleFonts.oswald(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: colorScheme.onSurface,
        ),
      ),
      
      // Card
      cardTheme: CardTheme(
        color: colorScheme.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          side: BorderSide(color: colorScheme.outline),
        ),
      ),
      
      // Elevated Button (Primary)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          textStyle: GoogleFonts.oswald(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 1,
          ),
        ),
      ),
      
      // Outlined Button (Secondary)
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colorScheme.onSurface,
          side: BorderSide(color: colorScheme.outline),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          textStyle: GoogleFonts.oswald(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      
      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colorScheme.primary,
          textStyle: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: BorderSide(color: colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: BorderSide(color: colorScheme.error, width: 2),
        ),
        labelStyle: GoogleFonts.spaceGrotesk(
          fontSize: 14,
          color: colorScheme.onSurfaceVariant,
        ),
        hintStyle: GoogleFonts.spaceGrotesk(
          fontSize: 14,
          color: colorScheme.onSurfaceVariant.withOpacity(0.7),
        ),
        errorStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12,
          color: colorScheme.error,
        ),
      ),
      
      // Divider
      dividerTheme: DividerThemeData(
        color: colorScheme.outline,
        thickness: 1,
        space: AppSpacing.lg,
      ),
      
      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: colorScheme.surface,
        contentTextStyle: GoogleFonts.spaceGrotesk(
          color: colorScheme.onSurface,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: BorderSide(color: colorScheme.outline),
        ),
        behavior: SnackBarBehavior.floating,
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: colorScheme.surface,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurfaceVariant,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      
      // Text theme
      textTheme: GoogleFonts.spaceGroteskTextTheme().copyWith(
        displayLarge: GoogleFonts.bebasNeue(
          fontSize: 48,
          letterSpacing: 2,
          color: colorScheme.primary,
        ),
        displayMedium: GoogleFonts.bebasNeue(
          fontSize: 36,
          letterSpacing: 1.5,
          color: colorScheme.primary,
        ),
        displaySmall: GoogleFonts.bebasNeue(
          fontSize: 32,
          letterSpacing: 1,
          color: colorScheme.primary,
        ),
        headlineLarge: GoogleFonts.oswald(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: colorScheme.onSurface,
        ),
        headlineMedium: GoogleFonts.oswald(
          fontSize: 20,
          fontWeight: FontWeight.w500,
          color: colorScheme.onSurface,
        ),
        headlineSmall: GoogleFonts.oswald(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: colorScheme.onSurface,
        ),
      ),
    );
  }
}
```

---

## 2. Wireframes de Pantallas

### 2.1 Login Page

```
┌────────────────────────────────────────┐
│           [Status Bar]                 │
├────────────────────────────────────────┤
│                                        │
│                                        │
│         ╔══════════════════╗           │
│         ║   BIENVENIDO     ║           │  ← font-display, primary
│         ╚══════════════════╝           │
│         Inicia sesión en tu cuenta     │  ← body, muted
│                                        │
│  ┌──────────────────────────────────┐  │
│  │         [Glass Card]              │  │
│  │                                   │  │
│  │  Email *                          │  │  ← label
│  │  ┌─────────────────────────────┐  │  │
│  │  │ tu@email.com                │  │  │  ← input
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Contraseña *                     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ ••••••••            [👁️]   │  │  │  ← password input
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │      INICIAR SESIÓN         │  │  │  ← primary button
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ¿Olvidaste tu contraseña?        │  │  ← text link
│  │                                   │  │
│  │  ────────────  o  ────────────    │  │  ← divider
│  │                                   │  │
│  │  ¿No tienes cuenta? Regístrate    │  │  ← text + link
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ✓ Historial │  │ ✓ Ofertas   │      │  ← benefits row
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ✓ Checkout  │  │ ✓ Rápido    │      │
│  └─────────────┘  └─────────────┘      │
│                                        │
└────────────────────────────────────────┘
```

### 2.2 Register Page

```
┌────────────────────────────────────────┐
│           [Status Bar]                 │
├────────────────────────────────────────┤
│                                        │
│         ╔══════════════════╗           │
│         ║      ÚNETE       ║           │
│         ╚══════════════════╝           │
│         Crea tu cuenta en segundos     │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │         [Glass Card]              │  │
│  │                                   │  │
│  │  Nombre completo                  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Tu nombre                   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Email *                          │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ tu@email.com                │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Contraseña *                     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ ••••••••            [👁️]   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Confirmar contraseña *           │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ ••••••••            [👁️]   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │      CREAR CUENTA           │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ────────────  o  ────────────    │  │
│  │                                   │  │
│  │  ¿Ya tienes cuenta? Inicia sesión │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│   🔒 Datos seguros   ✓ 100% Gratis     │  ← trust badges
│   ⚡ Sin spam                          │
│                                        │
└────────────────────────────────────────┘
```

### 2.3 Account Page (Dashboard)

```
┌────────────────────────────────────────┐
│           [Status Bar]                 │
├────────────────────────────────────────┤
│  [←]        MI CUENTA                  │  ← AppBar
├────────────────────────────────────────┤
│                                        │
│  ╔══════════════════╗                  │
│  ║    MI CUENTA     ║                  │
│  ╚══════════════════╝                  │
│  Hola, Juan 👋                         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Glass Card] Info de Cuenta      │  │
│  │                                   │  │
│  │  👤 Información de la Cuenta      │  │
│  │  ─────────────────────────────    │  │
│  │                                   │  │
│  │  Email                            │  │
│  │  juan@email.com                   │  │
│  │                                   │  │
│  │  Nombre                           │  │
│  │  Juan García                      │  │
│  │                                   │  │
│  │  Miembro desde                    │  │
│  │  15 de enero de 2024              │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Glass Card] Últimos Pedidos     │  │
│  │                                   │  │
│  │  📦 Últimos Pedidos               │  │
│  │  ─────────────────────────────    │  │
│  │                                   │  │
│  │  ┌────────────────────────────┐   │  │
│  │  │ #FS-00001234     [Pagado]  │   │  │
│  │  │ €89.99                     │   │  │
│  │  │ 14 ene 2024         [→]   │   │  │
│  │  └────────────────────────────┘   │  │
│  │                                   │  │
│  │  ┌────────────────────────────┐   │  │
│  │  │ #FS-00001233    [Enviado]  │   │  │
│  │  │ €45.00                     │   │  │
│  │  │ 10 ene 2024         [→]   │   │  │
│  │  └────────────────────────────┘   │  │
│  │                                   │  │
│  │  [Ver todos los pedidos →]        │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Sidebar Actions]                │  │
│  │                                   │  │
│  │  [✏️] Editar Perfil               │  │
│  │  [📦] Mis Pedidos                 │  │
│  │  [🚪] Cerrar Sesión               │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### 2.4 Edit Profile Page

```
┌────────────────────────────────────────┐
│           [Status Bar]                 │
├────────────────────────────────────────┤
│  [←]      EDITAR PERFIL                │
├────────────────────────────────────────┤
│                                        │
│  ╔══════════════════════╗              │
│  ║   EDITAR PERFIL      ║              │
│  ╚══════════════════════╝              │
│  Actualiza tu información              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Glass Card] Info Personal       │  │
│  │                                   │  │
│  │  👤 Información Personal          │  │
│  │  ─────────────────────────────    │  │
│  │                                   │  │
│  │  Nombre completo                  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Juan García                 │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Teléfono                         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 612 345 678                 │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Glass Card] Dirección           │  │
│  │                                   │  │
│  │  📍 Dirección de Envío            │  │
│  │  ─────────────────────────────    │  │
│  │  Esta dirección se usará para     │  │
│  │  autocompletar en el checkout.    │  │
│  │                                   │  │
│  │  Dirección                        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Calle, número, piso...      │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ Ciudad   │  │ C. Postal    │   │  │
│  │  │ Madrid   │  │ 28001        │   │  │
│  │  └──────────┘  └──────────────┘   │  │
│  │                                   │  │
│  │  País                             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ España                  🔒  │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│              ┌─────────────────────┐   │
│              │ ✓ GUARDAR CAMBIOS   │   │
│              └─────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

---

## 3. Componentes Reutilizables

### 3.1 GlassCard

```dart
// lib/core/widgets/cards/glass_card.dart
import 'package:flutter/material.dart';
import 'dart:ui';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final double borderRadius;
  
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius = 16,
  });
  
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: padding ?? const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: colorScheme.surface.withOpacity(0.95),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: colorScheme.outline,
              width: 1,
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
```

### 3.2 AppTextField

```dart
// lib/core/widgets/inputs/app_text_field.dart
import 'package:flutter/material.dart';

class AppTextField extends StatelessWidget {
  final String label;
  final String? hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final bool obscureText;
  final Widget? suffixIcon;
  final bool required;
  final int maxLines;
  final bool enabled;
  
  const AppTextField({
    super.key,
    required this.label,
    this.hint,
    this.controller,
    this.validator,
    this.keyboardType,
    this.obscureText = false,
    this.suffixIcon,
    this.required = false,
    this.maxLines = 1,
    this.enabled = true,
  });
  
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
              TextSpan(text: label),
              if (required)
                TextSpan(
                  text: ' *',
                  style: TextStyle(color: colorScheme.secondary),
                ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          validator: validator,
          keyboardType: keyboardType,
          obscureText: obscureText,
          maxLines: maxLines,
          enabled: enabled,
          decoration: InputDecoration(
            hintText: hint,
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
```

### 3.3 AppButton

```dart
// lib/core/widgets/buttons/app_button.dart
import 'package:flutter/material.dart';

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  
  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
  });
  
  @override
  Widget build(BuildContext context) {
    final button = ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      child: isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 20),
                  const SizedBox(width: 8),
                ],
                Text(text),
              ],
            ),
    );
    
    return isFullWidth
        ? SizedBox(width: double.infinity, child: button)
        : button;
  }
}
```

### 3.4 MessageBanner

```dart
// lib/core/widgets/feedback/message_banner.dart
import 'package:flutter/material.dart';

enum MessageType { success, error, warning, info }

class MessageBanner extends StatelessWidget {
  final String message;
  final MessageType type;
  final VoidCallback? onDismiss;
  
  const MessageBanner({
    super.key,
    required this.message,
    required this.type,
    this.onDismiss,
  });
  
  @override
  Widget build(BuildContext context) {
    final colors = _getColors(context);
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.border),
      ),
      child: Row(
        children: [
          Icon(colors.icon, color: colors.text, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: colors.text,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          if (onDismiss != null)
            IconButton(
              icon: Icon(Icons.close, color: colors.text, size: 18),
              onPressed: onDismiss,
            ),
        ],
      ),
    );
  }
  
  _MessageColors _getColors(BuildContext context) {
    switch (type) {
      case MessageType.success:
        return _MessageColors(
          background: const Color(0xFF10B981).withOpacity(0.1),
          border: const Color(0xFF10B981),
          text: const Color(0xFF10B981),
          icon: Icons.check_circle_outline,
        );
      case MessageType.error:
        return _MessageColors(
          background: const Color(0xFFFF4757).withOpacity(0.1),
          border: const Color(0xFFFF4757),
          text: const Color(0xFFFF4757),
          icon: Icons.error_outline,
        );
      case MessageType.warning:
        return _MessageColors(
          background: const Color(0xFFF59E0B).withOpacity(0.1),
          border: const Color(0xFFF59E0B),
          text: const Color(0xFFF59E0B),
          icon: Icons.warning_amber_outlined,
        );
      case MessageType.info:
        return _MessageColors(
          background: const Color(0xFF3B82F6).withOpacity(0.1),
          border: const Color(0xFF3B82F6),
          text: const Color(0xFF3B82F6),
          icon: Icons.info_outline,
        );
    }
  }
}

class _MessageColors {
  final Color background;
  final Color border;
  final Color text;
  final IconData icon;
  
  _MessageColors({
    required this.background,
    required this.border,
    required this.text,
    required this.icon,
  });
}
```

---

## 4. Responsive Design

### 4.1 Breakpoints

```dart
// lib/core/utils/responsive.dart
abstract class Breakpoints {
  static const double mobile = 0;
  static const double tablet = 600;
  static const double desktop = 1024;
}

extension ResponsiveExtension on BuildContext {
  bool get isMobile => MediaQuery.of(this).size.width < Breakpoints.tablet;
  bool get isTablet => MediaQuery.of(this).size.width >= Breakpoints.tablet &&
                       MediaQuery.of(this).size.width < Breakpoints.desktop;
  bool get isDesktop => MediaQuery.of(this).size.width >= Breakpoints.desktop;
  
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;
}
```

### 4.2 Layout Adaptativo

- **Móvil**: Single column, bottom sheet for actions
- **Tablet**: Optional sidebar, wider content
- **Web/Desktop**: Multi-column layout like original

---

## 5. Checklist de Diseño UI

### Sistema de Temas

- [ ] Implementar `AppColors` con light/dark mode
- [ ] Implementar `AppTypography` con fuentes correctas
- [ ] Implementar `AppSpacing` con valores consistentes
- [ ] Implementar `AppTheme` completo con todos los componentes
- [ ] Verificar contraste de colores para accesibilidad

### Componentes Base

- [ ] `GlassCard` - Card con efecto blur
- [ ] `AppTextField` - Input de texto estilizado
- [ ] `AppPasswordField` - Input de password con toggle
- [ ] `AppButton` - Botón primario con loading
- [ ] `AppOutlinedButton` - Botón secundario
- [ ] `MessageBanner` - Feedback success/error
- [ ] `LoadingOverlay` - Spinner de carga
- [ ] `UserAvatar` - Avatar con iniciales

### Pantallas

- [ ] Login Page wireframe aprobado
- [ ] Register Page wireframe aprobado
- [ ] Forgot Password Page wireframe aprobado
- [ ] Reset Password Page wireframe aprobado
- [ ] Account Page wireframe aprobado
- [ ] Edit Profile Page wireframe aprobado

### Validación Visual

- [ ] Colores coinciden con versión web
- [ ] Tipografías coinciden con versión web
- [ ] Espaciados son consistentes
- [ ] Dark mode funciona correctamente
- [ ] Light mode funciona correctamente
- [ ] Animaciones implementadas (fade-in, slide)
