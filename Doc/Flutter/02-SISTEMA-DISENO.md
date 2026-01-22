# Módulo 02: Sistema de Diseño

## 🎯 Objetivo

Implementar el sistema de diseño completo de FashionStore: colores, tipografías, espaciado, bordes y theme configuration. Este diseño es **idéntico** al de la aplicación web.

## 🎨 Paleta de Colores Completa

### lib/core/theme/app_colors.dart

**Colores Principales:**

```dart
/// Paleta de colores de FashionStore
/// Soporta Light Mode y Dark Mode
class AppColors {
  // ========== LIGHT MODE ==========
  
  // Backgrounds
  static const lightBackground = Color(0xFFFFFFFF);        // Blanco puro
  static const lightForeground = Color(0xFF0A0A0A);        // Negro profundo
  
  // Primary (verde)
  static const lightPrimary = Color(0xFF4F7A1F);           // Verde oscuro
  static const lightPrimaryForeground = Color(0xFFFFFFFF);
  
  // Cards & Surfaces
  static const lightCard = Color(0xFFF9F9F9);
  static const lightCardForeground = Color(0xFF0A0A0A);
  
  // Muted & Borders
  static const lightMuted = Color(0xFFF5F5F5);
  static const lightMutedForeground = Color(0xFF71717A);
  static const lightBorder = Color(0xFFE5E5E5);
  
  // Input
  static const lightInput = Color(0xFFE5E5E5);
  
  
  // ========== DARK MODE (Principal) ==========
  
  // Backgrounds
  static const darkBackground = Color(0xFF0A0A0A);         // Negro profundo
  static const darkForeground = Color(0xFFFAFAFA);         // Blanco casi puro
  
  // Primary (verde neón - color firma)
  static const darkPrimary = Color(0xFFCCFF00);            // Verde neón
  static const darkPrimaryForeground = Color(0xFF0A0A0A);  // Negro (contraste)
  
  // Cards & Surfaces
  static const darkCard = Color(0xFF141414);               // Gris muy oscuro
  static const darkCardForeground = Color(0xFFFAFAFA);
  
  // Muted & Borders
  static const darkMuted = Color(0xFF1F1F1F);
  static const darkMutedForeground = Color(0xFF9CA3AF);
  static const darkBorder = Color(0xFF262626);
  
  // Input
  static const darkInput = Color(0xFF1F1F1F);
  
  
  // ========== COLORES SEMÁNTICOS (Iguales en ambos modos) ==========
  
  // Accent (rojo coral)
  static const accent = Color(0xFFFF4757);
  static const accentForeground = Color(0xFFFFFFFF);
  
  // Success (verde esmeralda)
  static const success = Color(0xFF10B981);
  static const successForeground = Color(0xFFFFFFFF);
  
  // Error (rojo coral - mismo que accent)
  static const error = Color(0xFFFF4757);
  static const errorForeground = Color(0xFFFFFFFF);
  
  // Warning (amarillo)
  static const warning = Color(0xFFFBBF24);
  static const warningForeground = Color(0xFF0A0A0A);
  
  // Info (azul eléctrico)
  static const info = Color(0xFF3B82F6);
  static const infoForeground = Color(0xFFFFFFFF);
  
  
  // ========== COLORES ESPECIALES ==========
  
  // Destructive
  static const destructive = Color(0xFFEF4444);
  static const destructiveForeground = Color(0xFFFFFFFF);
  
  // Ring (para focus states)
  static const ring = Color(0xFFCCFF00);  // Verde neón
  
  // Shadows
  static const shadowLight = Color(0x1A000000);  // Negro 10%
  static const shadowDark = Color(0x33000000);   // Negro 20%
  
  // Overlay
  static const overlayLight = Color(0x80000000);  // Negro 50%
  static const overlayDark = Color(0xB3000000);   // Negro 70%
}
```

## 🔤 Sistema de Tipografía

### lib/core/theme/app_typography.dart

**Tres familias tipográficas:**

1. **Bebas Neue**: Display (títulos hero, números grandes)
2. **Oswald**: Heading (H1-H6, botones, labels destacados)
3. **Space Grotesk**: Body (texto general, UI, párrafos)

```dart
/// Sistema de tipografía de FashionStore
class AppTypography {
  // Familias
  static const fontFamilyDisplay = 'BebasNeue';
  static const fontFamilyHeading = 'Oswald';
  static const fontFamilyBody = 'SpaceGrotesk';
  
  
  // ========== DISPLAY (Bebas Neue) ==========
  // Para títulos hero, números grandes
  
  static const displayLarge = TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 72,
    fontWeight: FontWeight.w700,
    height: 0.9,
    letterSpacing: -1.5,
  );
  
  static const displayMedium = TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 56,
    fontWeight: FontWeight.w700,
    height: 0.95,
    letterSpacing: -1.0,
  );
  
  static const displaySmall = TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 40,
    fontWeight: FontWeight.w700,
    height: 1.0,
    letterSpacing: -0.5,
  );
  
  
  // ========== HEADING (Oswald) ==========
  // Para H1-H6, títulos de sección
  
  static const headingLarge = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    height: 1.2,
    letterSpacing: 0.5,
  );
  
  static const headingMedium = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: 0.25,
  );
  
  static const headingSmall = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4,
    letterSpacing: 0.15,
  );
  
  static const headingXSmall = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.4,
    letterSpacing: 0.1,
  );
  
  
  // ========== BODY (Space Grotesk) ==========
  // Para texto general, UI, párrafos
  
  static const bodyLarge = TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
    letterSpacing: 0.15,
  );
  
  static const bodyMedium = TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
    letterSpacing: 0.1,
  );
  
  static const bodySmall = TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
    letterSpacing: 0.0,
  );
  
  
  // ========== LABELS ==========
  // Para botones, chips, badges
  
  static const labelLarge = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.25,
    letterSpacing: 0.5,
  );
  
  static const labelMedium = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: 0.25,
  );
  
  static const labelSmall = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: 0.5,
  );
  
  
  // ========== MONO (Para códigos) ==========
  
  static const mono = TextStyle(
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.0,
  );
}
```

## 📐 Sistema de Espaciado

### lib/core/theme/app_spacing.dart

```dart
/// Sistema de espaciado consistente
/// Basado en múltiplos de 4px
class AppSpacing {
  // Spacing base (múltiplos de 4)
  static const double xs = 4.0;      // Extra small
  static const double sm = 8.0;      // Small
  static const double md = 16.0;     // Medium (base)
  static const double lg = 24.0;     // Large
  static const double xl = 32.0;     // Extra large
  static const double xxl = 48.0;    // 2x Extra large
  static const double xxxl = 64.0;   // 3x Extra large
  
  // Padding específico para componentes
  static const double buttonPaddingVertical = 12.0;
  static const double buttonPaddingHorizontal = 24.0;
  
  static const double cardPadding = 16.0;
  static const double screenPadding = 16.0;
  static const double sectionSpacing = 32.0;
  
  static const double inputPaddingVertical = 12.0;
  static const double inputPaddingHorizontal = 16.0;
  
  // Gaps (para Row, Column, etc.)
  static const double gapXs = 4.0;
  static const double gapSm = 8.0;
  static const double gapMd = 16.0;
  static const double gapLg = 24.0;
  static const double gapXl = 32.0;
  
  // Touch targets (mínimo 44x44 para accesibilidad)
  static const double minTouchTarget = 44.0;
  
  // Border width
  static const double borderWidthThin = 1.0;
  static const double borderWidthMedium = 2.0;
  static const double borderWidthThick = 4.0;
  
  // Border radius
  static const double radiusSm = 4.0;
  static const double radiusMd = 8.0;
  static const double radiusLg = 12.0;
  static const double radiusXl = 16.0;
  static const double radiusFull = 9999.0;
  
  // Elevations (para Material)
  static const double elevation0 = 0.0;
  static const double elevation1 = 2.0;
  static const double elevation2 = 4.0;
  static const double elevation3 = 8.0;
  static const double elevation4 = 16.0;
}
```

## 🎨 Theme Configuration

### lib/core/theme/app_theme.dart

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';
import 'app_spacing.dart';

/// Configuración del tema de FashionStore
class AppTheme {
  // ========== LIGHT THEME ==========
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Colores
      scaffoldBackgroundColor: AppColors.lightBackground,
      primaryColor: AppColors.lightPrimary,
      
      colorScheme: const ColorScheme.light(
        primary: AppColors.lightPrimary,
        onPrimary: AppColors.lightPrimaryForeground,
        secondary: AppColors.accent,
        onSecondary: AppColors.accentForeground,
        error: AppColors.error,
        onError: AppColors.errorForeground,
        surface: AppColors.lightCard,
        onSurface: AppColors.lightCardForeground,
        background: AppColors.lightBackground,
        onBackground: AppColors.lightForeground,
      ),
      
      // Tipografía
      textTheme: _buildTextTheme(AppColors.lightForeground),
      
      // Componentes (ver sección siguiente)
      appBarTheme: _buildAppBarTheme(isLight: true),
      cardTheme: _buildCardTheme(isLight: true),
      inputDecorationTheme: _buildInputTheme(isLight: true),
      elevatedButtonTheme: _buildButtonTheme(isLight: true),
      
      // Divisores y bordes
      dividerColor: AppColors.lightBorder,
      
      // Focus
      focusColor: AppColors.ring.withOpacity(0.2),
    );
  }
  
  
  // ========== DARK THEME (Principal) ==========
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Colores
      scaffoldBackgroundColor: AppColors.darkBackground,
      primaryColor: AppColors.darkPrimary,
      
      colorScheme: const ColorScheme.dark(
        primary: AppColors.darkPrimary,
        onPrimary: AppColors.darkPrimaryForeground,
        secondary: AppColors.accent,
        onSecondary: AppColors.accentForeground,
        error: AppColors.error,
        onError: AppColors.errorForeground,
        surface: AppColors.darkCard,
        onSurface: AppColors.darkCardForeground,
        background: AppColors.darkBackground,
        onBackground: AppColors.darkForeground,
      ),
      
      // Tipografía
      textTheme: _buildTextTheme(AppColors.darkForeground),
      
      // Componentes
      appBarTheme: _buildAppBarTheme(isLight: false),
      cardTheme: _buildCardTheme(isLight: false),
      inputDecorationTheme: _buildInputTheme(isLight: false),
      elevatedButtonTheme: _buildButtonTheme(isLight: false),
      
      // Divisores y bordes
      dividerColor: AppColors.darkBorder,
      
      // Focus
      focusColor: AppColors.ring.withOpacity(0.3),
    );
  }
  
  
  // ========== HELPERS ==========
  
  static TextTheme _buildTextTheme(Color defaultColor) {
    return TextTheme(
      // Display
      displayLarge: AppTypography.displayLarge.copyWith(color: defaultColor),
      displayMedium: AppTypography.displayMedium.copyWith(color: defaultColor),
      displaySmall: AppTypography.displaySmall.copyWith(color: defaultColor),
      
      // Heading
      headlineLarge: AppTypography.headingLarge.copyWith(color: defaultColor),
      headlineMedium: AppTypography.headingMedium.copyWith(color: defaultColor),
      headlineSmall: AppTypography.headingSmall.copyWith(color: defaultColor),
      
      // Body
      bodyLarge: AppTypography.bodyLarge.copyWith(color: defaultColor),
      bodyMedium: AppTypography.bodyMedium.copyWith(color: defaultColor),
      bodySmall: AppTypography.bodySmall.copyWith(color: defaultColor),
      
      // Label
      labelLarge: AppTypography.labelLarge.copyWith(color: defaultColor),
      labelMedium: AppTypography.labelMedium.copyWith(color: defaultColor),
      labelSmall: AppTypography.labelSmall.copyWith(color: defaultColor),
    );
  }
  
  static AppBarTheme _buildAppBarTheme({required bool isLight}) {
    return AppBarTheme(
      elevation: 0,
      centerTitle: false,
      backgroundColor: isLight 
          ? AppColors.lightBackground 
          : AppColors.darkBackground,
      foregroundColor: isLight 
          ? AppColors.lightForeground 
          : AppColors.darkForeground,
      titleTextStyle: AppTypography.headingMedium.copyWith(
        color: isLight 
            ? AppColors.lightForeground 
            : AppColors.darkForeground,
      ),
    );
  }
  
  static CardTheme _buildCardTheme({required bool isLight}) {
    return CardTheme(
      elevation: AppSpacing.elevation1,
      color: isLight ? AppColors.lightCard : AppColors.darkCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        side: BorderSide(
          color: isLight ? AppColors.lightBorder : AppColors.darkBorder,
          width: AppSpacing.borderWidthThin,
        ),
      ),
    );
  }
  
  static InputDecorationTheme _buildInputTheme({required bool isLight}) {
    return InputDecorationTheme(
      filled: true,
      fillColor: isLight ? AppColors.lightInput : AppColors.darkInput,
      
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: BorderSide(
          color: isLight ? AppColors.lightBorder : AppColors.darkBorder,
          width: AppSpacing.borderWidthThin,
        ),
      ),
      
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: BorderSide(
          color: isLight ? AppColors.lightBorder : AppColors.darkBorder,
          width: AppSpacing.borderWidthThin,
        ),
      ),
      
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(
          color: AppColors.ring,
          width: AppSpacing.borderWidthMedium,
        ),
      ),
      
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(
          color: AppColors.error,
          width: AppSpacing.borderWidthThin,
        ),
      ),
      
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.inputPaddingHorizontal,
        vertical: AppSpacing.inputPaddingVertical,
      ),
      
      hintStyle: AppTypography.bodyMedium.copyWith(
        color: isLight 
            ? AppColors.lightMutedForeground 
            : AppColors.darkMutedForeground,
      ),
    );
  }
  
  static ElevatedButtonThemeData _buildButtonTheme({required bool isLight}) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.buttonPaddingHorizontal,
          vertical: AppSpacing.buttonPaddingVertical,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        textStyle: AppTypography.labelLarge,
        minimumSize: const Size(AppSpacing.minTouchTarget, AppSpacing.minTouchTarget),
      ),
    );
  }
}
```

## 🎭 Efectos Visuales Especiales

### Glow Effect (para botones primarios en dark mode)

```dart
/// BoxShadow para efecto glow/neón
class AppEffects {
  static List<BoxShadow> neonGlow({Color color = AppColors.darkPrimary}) {
    return [
      BoxShadow(
        color: color.withOpacity(0.3),
        blurRadius: 20,
        spreadRadius: 0,
        offset: const Offset(0, 0),
      ),
    ];
  }
  
  static List<BoxShadow> cardShadow({bool isLight = false}) {
    return [
      BoxShadow(
        color: isLight ? AppColors.shadowLight : AppColors.shadowDark,
        blurRadius: 10,
        spreadRadius: 0,
        offset: const Offset(0, 4),
      ),
    ];
  }
}
```

### Glass Effect (para cards especiales)

```dart
/// Efecto glass/frosted para cards
BoxDecoration glassDecoration({bool isLight = false}) {
  return BoxDecoration(
    color: isLight 
        ? AppColors.lightCard.withOpacity(0.95)
        : AppColors.darkCard.withOpacity(0.95),
    borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
    border: Border.all(
      color: isLight 
          ? AppColors.lightBorder.withOpacity(0.5)
          : AppColors.darkBorder.withOpacity(0.5),
      width: AppSpacing.borderWidthThin,
    ),
  );
}
```

## ✅ Verificación del Módulo

### Checklist

- [ ] `app_colors.dart` creado con todos los colores
- [ ] `app_typography.dart` creado con todas las variantes
- [ ] `app_spacing.dart` creado con sistema de espaciado
- [ ] `app_theme.dart` creado con light y dark theme
- [ ] Fuentes cargadas correctamente en `pubspec.yaml`
- [ ] `main.dart` actualizado con `AppTheme.darkTheme`
- [ ] App muestra el theme correcto al ejecutar

### Comando de Prueba

```bash
flutter run
```

Verificar:
- Fondo negro (#0A0A0A)
- Colores primarios verde neón (#CCFF00)
- Fuentes se cargan correctamente
- No hay errores de tipografía

## 📝 Uso en Componentes

### Ejemplo de uso de colores

```dart
// En un widget
Container(
  color: Theme.of(context).colorScheme.primary,  // Verde neón en dark
  child: Text(
    'Hola',
    style: Theme.of(context).textTheme.headlineLarge,  // Oswald 32px
  ),
)
```

### Ejemplo de uso de spacing

```dart
// Padding consistente
Padding(
  padding: const EdgeInsets.all(AppSpacing.md),
  child: Column(
    spacing: AppSpacing.gapMd,  // Gap entre hijos
    children: [...],
  ),
)
```

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 03: Widgets Base** - Crear componentes reutilizables (botones, inputs, cards, etc.)

---

**Tiempo Estimado**: 2-3 horas
**Complejidad**: Media
**Dependencias**: Módulo 01 completado
