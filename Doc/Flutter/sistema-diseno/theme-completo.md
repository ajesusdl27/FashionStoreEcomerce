# Módulo Sistema de Diseño - Theme Flutter Completo

## 1. Colores (app_colors.dart)

```dart
// lib/core/theme/app_colors.dart

import 'package:flutter/material.dart';

abstract class AppColors {
  // ========== LIGHT MODE ==========
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightForeground = Color(0xFF09090B);
  static const Color lightPrimary = Color(0xFF5D8A00);  // Verde oscuro para contraste
  static const Color lightPrimaryForeground = Color(0xFFFFFFFF);
  static const Color lightAccent = Color(0xFFFF4757);
  static const Color lightAccentForeground = Color(0xFFFAFAFA);
  static const Color lightMuted = Color(0xFFF4F4F5);
  static const Color lightMutedForeground = Color(0xFF71717A);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightCardForeground = Color(0xFF09090B);
  static const Color lightBorder = Color(0xFFE4E4E7);
  static const Color lightInput = Color(0xFFE4E4E7);

  // ========== DARK MODE ==========
  static const Color darkBackground = Color(0xFF09090B);
  static const Color darkForeground = Color(0xFFFAFAFA);
  static const Color darkPrimary = Color(0xFFCCFF00);  // Verde neón
  static const Color darkPrimaryForeground = Color(0xFF09090B);
  static const Color darkAccent = Color(0xFFFF4757);
  static const Color darkAccentForeground = Color(0xFFFAFAFA);
  static const Color darkMuted = Color(0xFF27272A);
  static const Color darkMutedForeground = Color(0xFFA1A1AA);
  static const Color darkCard = Color(0xFF18181B);
  static const Color darkCardForeground = Color(0xFFFAFAFA);
  static const Color darkBorder = Color(0xFF27272A);
  static const Color darkInput = Color(0xFF27272A);

  // ========== SEMANTIC COLORS ==========
  static const Color success = Color(0xFF22C55E);
  static const Color successBackground = Color(0x3322C55E);
  static const Color warning = Color(0xFFEAB308);
  static const Color warningBackground = Color(0x33EAB308);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBackground = Color(0x33EF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBackground = Color(0x333B82F6);

  // ========== ELECTRIC (alternativo) ==========
  static const Color electric = Color(0xFF3B82F6);
  static const Color electricForeground = Color(0xFFFAFAFA);
}
```

---

## 2. Tipografía (app_typography.dart)

```dart
// lib/core/theme/app_typography.dart

import 'package:flutter/material.dart';

abstract class AppTypography {
  // Familias de fuentes
  static const String fontFamilyDisplay = 'BebasNeue';
  static const String fontFamilyHeading = 'Oswald';
  static const String fontFamilyBody = 'SpaceGrotesk';

  // ========== DISPLAY (Bebas Neue) ==========
  static TextStyle displayLarge(Color color) => TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 57,
    fontWeight: FontWeight.w400,
    letterSpacing: 2,
    color: color,
  );

  static TextStyle displayMedium(Color color) => TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 45,
    fontWeight: FontWeight.w400,
    letterSpacing: 2,
    color: color,
  );

  static TextStyle displaySmall(Color color) => TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 36,
    fontWeight: FontWeight.w400,
    letterSpacing: 2,
    color: color,
  );

  // ========== HEADLINE (Oswald) ==========
  static TextStyle headlineLarge(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    letterSpacing: 1,
    color: color,
  );

  static TextStyle headlineMedium(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: 1,
    color: color,
  );

  static TextStyle headlineSmall(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: 1,
    color: color,
  );

  // ========== TITLE (Oswald) ==========
  static TextStyle titleLarge(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: color,
  );

  static TextStyle titleMedium(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 16,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
    color: color,
  );

  static TextStyle titleSmall(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    color: color,
  );

  // ========== BODY (Space Grotesk) ==========
  static TextStyle bodyLarge(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    color: color,
  );

  static TextStyle bodyMedium(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    color: color,
  );

  static TextStyle bodySmall(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    color: color,
  );

  // ========== LABEL (Space Grotesk) ==========
  static TextStyle labelLarge(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    color: color,
  );

  static TextStyle labelMedium(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    color: color,
  );

  static TextStyle labelSmall(Color color) => TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    color: color,
  );

  // ========== BUTTON ==========
  static TextStyle button(Color color) => TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 1.5,
    color: color,
  );
}
```

---

## 3. Espaciado (app_spacing.dart)

```dart
// lib/core/theme/app_spacing.dart

import 'package:flutter/material.dart';

abstract class AppSpacing {
  // ========== SPACING VALUES ==========
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;

  // ========== PADDING ==========
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);
  static const EdgeInsets paddingXxl = EdgeInsets.all(xxl);

  // ========== HORIZONTAL PADDING ==========
  static const EdgeInsets paddingHorizontalSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets paddingHorizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets paddingHorizontalLg = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets paddingHorizontalXl = EdgeInsets.symmetric(horizontal: xl);

  // ========== VERTICAL PADDING ==========
  static const EdgeInsets paddingVerticalSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets paddingVerticalMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets paddingVerticalLg = EdgeInsets.symmetric(vertical: lg);

  // ========== SCREEN PADDING ==========
  static const EdgeInsets screenPadding = EdgeInsets.all(lg);
  static const EdgeInsets screenPaddingHorizontal = EdgeInsets.symmetric(horizontal: lg);

  // ========== BUTTON PADDING ==========
  static const EdgeInsets buttonPaddingSm = EdgeInsets.symmetric(horizontal: 16, vertical: 8);
  static const EdgeInsets buttonPaddingMd = EdgeInsets.symmetric(horizontal: 24, vertical: 12);
  static const EdgeInsets buttonPaddingLg = EdgeInsets.symmetric(horizontal: 32, vertical: 16);

  // ========== BORDER RADIUS ==========
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double radiusFull = 9999;

  static BorderRadius borderRadiusSm = BorderRadius.circular(radiusSm);
  static BorderRadius borderRadiusMd = BorderRadius.circular(radiusMd);
  static BorderRadius borderRadiusLg = BorderRadius.circular(radiusLg);
  static BorderRadius borderRadiusXl = BorderRadius.circular(radiusXl);
  static BorderRadius borderRadiusFull = BorderRadius.circular(radiusFull);

  // ========== SIZED BOX HELPERS ==========
  static const SizedBox verticalXs = SizedBox(height: xs);
  static const SizedBox verticalSm = SizedBox(height: sm);
  static const SizedBox verticalMd = SizedBox(height: md);
  static const SizedBox verticalLg = SizedBox(height: lg);
  static const SizedBox verticalXl = SizedBox(height: xl);
  static const SizedBox verticalXxl = SizedBox(height: xxl);

  static const SizedBox horizontalXs = SizedBox(width: xs);
  static const SizedBox horizontalSm = SizedBox(width: sm);
  static const SizedBox horizontalMd = SizedBox(width: md);
  static const SizedBox horizontalLg = SizedBox(width: lg);
  static const SizedBox horizontalXl = SizedBox(width: xl);
}
```

---

## 4. Theme Principal (app_theme.dart)

```dart
// lib/core/theme/app_theme.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_colors.dart';
import 'app_typography.dart';
import 'app_spacing.dart';

abstract class AppTheme {
  // ========== LIGHT THEME ==========
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Colores
      colorScheme: const ColorScheme.light(
        primary: AppColors.lightPrimary,
        onPrimary: AppColors.lightPrimaryForeground,
        secondary: AppColors.lightAccent,
        onSecondary: AppColors.lightAccentForeground,
        surface: AppColors.lightCard,
        onSurface: AppColors.lightCardForeground,
        surfaceContainerHighest: AppColors.lightMuted,
        outline: AppColors.lightBorder,
        outlineVariant: AppColors.lightBorder,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.lightBackground,
      
      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightBackground,
        foregroundColor: AppColors.lightForeground,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: AppTypography.headlineSmall(AppColors.lightForeground),
      ),
      
      // Cards
      cardTheme: CardTheme(
        color: AppColors.lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusLg,
          side: const BorderSide(color: AppColors.lightBorder),
        ),
      ),
      
      // Botones
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.lightPrimary,
          foregroundColor: AppColors.lightPrimaryForeground,
          padding: AppSpacing.buttonPaddingMd,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.lightPrimaryForeground),
          elevation: 0,
        ),
      ),
      
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.lightPrimary,
          foregroundColor: AppColors.lightPrimaryForeground,
          padding: AppSpacing.buttonPaddingMd,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.lightPrimaryForeground),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.lightForeground,
          padding: AppSpacing.buttonPaddingMd,
          side: const BorderSide(color: AppColors.lightBorder),
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.lightForeground),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.lightPrimary,
          textStyle: AppTypography.button(AppColors.lightPrimary),
        ),
      ),
      
      // Inputs
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightCard,
        contentPadding: AppSpacing.buttonPaddingMd,
        border: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.lightPrimary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: AppTypography.bodyMedium(AppColors.lightMutedForeground),
        labelStyle: AppTypography.labelMedium(AppColors.lightMutedForeground),
      ),
      
      // Dividers
      dividerTheme: const DividerThemeData(
        color: AppColors.lightBorder,
        thickness: 1,
        space: 1,
      ),
      
      // Chips
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.lightMuted,
        labelStyle: AppTypography.labelMedium(AppColors.lightForeground),
        side: const BorderSide(color: AppColors.lightBorder),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusFull,
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.lightCard,
        selectedItemColor: AppColors.lightPrimary,
        unselectedItemColor: AppColors.lightMutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      
      // Dialog
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.lightCard,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusLg,
        ),
      ),
      
      // Snackbar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.lightForeground,
        contentTextStyle: AppTypography.bodyMedium(AppColors.lightBackground),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusSm,
        ),
        behavior: SnackBarBehavior.floating,
      ),
      
      // Text Theme
      textTheme: TextTheme(
        displayLarge: AppTypography.displayLarge(AppColors.lightForeground),
        displayMedium: AppTypography.displayMedium(AppColors.lightForeground),
        displaySmall: AppTypography.displaySmall(AppColors.lightForeground),
        headlineLarge: AppTypography.headlineLarge(AppColors.lightForeground),
        headlineMedium: AppTypography.headlineMedium(AppColors.lightForeground),
        headlineSmall: AppTypography.headlineSmall(AppColors.lightForeground),
        titleLarge: AppTypography.titleLarge(AppColors.lightForeground),
        titleMedium: AppTypography.titleMedium(AppColors.lightForeground),
        titleSmall: AppTypography.titleSmall(AppColors.lightForeground),
        bodyLarge: AppTypography.bodyLarge(AppColors.lightForeground),
        bodyMedium: AppTypography.bodyMedium(AppColors.lightForeground),
        bodySmall: AppTypography.bodySmall(AppColors.lightForeground),
        labelLarge: AppTypography.labelLarge(AppColors.lightForeground),
        labelMedium: AppTypography.labelMedium(AppColors.lightForeground),
        labelSmall: AppTypography.labelSmall(AppColors.lightForeground),
      ),
    );
  }

  // ========== DARK THEME ==========
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Colores
      colorScheme: const ColorScheme.dark(
        primary: AppColors.darkPrimary,
        onPrimary: AppColors.darkPrimaryForeground,
        secondary: AppColors.darkAccent,
        onSecondary: AppColors.darkAccentForeground,
        surface: AppColors.darkCard,
        onSurface: AppColors.darkCardForeground,
        surfaceContainerHighest: AppColors.darkMuted,
        outline: AppColors.darkBorder,
        outlineVariant: AppColors.darkBorder,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
      
      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        foregroundColor: AppColors.darkForeground,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: AppTypography.headlineSmall(AppColors.darkForeground),
      ),
      
      // Cards
      cardTheme: CardTheme(
        color: AppColors.darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusLg,
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      
      // Botones
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.darkPrimary,
          foregroundColor: AppColors.darkPrimaryForeground,
          padding: AppSpacing.buttonPaddingMd,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.darkPrimaryForeground),
          elevation: 0,
        ),
      ),
      
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.darkPrimary,
          foregroundColor: AppColors.darkPrimaryForeground,
          padding: AppSpacing.buttonPaddingMd,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.darkPrimaryForeground),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.darkForeground,
          padding: AppSpacing.buttonPaddingMd,
          side: const BorderSide(color: AppColors.darkBorder),
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          textStyle: AppTypography.button(AppColors.darkForeground),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.darkPrimary,
          textStyle: AppTypography.button(AppColors.darkPrimary),
        ),
      ),
      
      // Inputs
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkCard,
        contentPadding: AppSpacing.buttonPaddingMd,
        border: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.darkPrimary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusSm,
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: AppTypography.bodyMedium(AppColors.darkMutedForeground),
        labelStyle: AppTypography.labelMedium(AppColors.darkMutedForeground),
      ),
      
      // Dividers
      dividerTheme: const DividerThemeData(
        color: AppColors.darkBorder,
        thickness: 1,
        space: 1,
      ),
      
      // Chips
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.darkMuted,
        labelStyle: AppTypography.labelMedium(AppColors.darkForeground),
        side: const BorderSide(color: AppColors.darkBorder),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusFull,
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.darkCard,
        selectedItemColor: AppColors.darkPrimary,
        unselectedItemColor: AppColors.darkMutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      
      // Dialog
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.darkCard,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusLg,
        ),
      ),
      
      // Snackbar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.darkForeground,
        contentTextStyle: AppTypography.bodyMedium(AppColors.darkBackground),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusSm,
        ),
        behavior: SnackBarBehavior.floating,
      ),
      
      // Text Theme
      textTheme: TextTheme(
        displayLarge: AppTypography.displayLarge(AppColors.darkForeground),
        displayMedium: AppTypography.displayMedium(AppColors.darkForeground),
        displaySmall: AppTypography.displaySmall(AppColors.darkForeground),
        headlineLarge: AppTypography.headlineLarge(AppColors.darkForeground),
        headlineMedium: AppTypography.headlineMedium(AppColors.darkForeground),
        headlineSmall: AppTypography.headlineSmall(AppColors.darkForeground),
        titleLarge: AppTypography.titleLarge(AppColors.darkForeground),
        titleMedium: AppTypography.titleMedium(AppColors.darkForeground),
        titleSmall: AppTypography.titleSmall(AppColors.darkForeground),
        bodyLarge: AppTypography.bodyLarge(AppColors.darkForeground),
        bodyMedium: AppTypography.bodyMedium(AppColors.darkForeground),
        bodySmall: AppTypography.bodySmall(AppColors.darkForeground),
        labelLarge: AppTypography.labelLarge(AppColors.darkForeground),
        labelMedium: AppTypography.labelMedium(AppColors.darkForeground),
        labelSmall: AppTypography.labelSmall(AppColors.darkForeground),
      ),
    );
  }
}
```

---

## 5. Extensiones de Tema

```dart
// lib/core/theme/theme_extensions.dart

import 'package:flutter/material.dart';
import 'app_colors.dart';

extension ThemeExtensions on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => theme.textTheme;
  ColorScheme get colorScheme => theme.colorScheme;
  
  bool get isDarkMode => theme.brightness == Brightness.dark;
  
  Color get primaryColor => colorScheme.primary;
  Color get backgroundColor => colorScheme.surface;
  Color get surfaceColor => colorScheme.surface;
  Color get errorColor => colorScheme.error;
}

extension AppColorsExtension on BuildContext {
  Color get successColor => AppColors.success;
  Color get successBackgroundColor => AppColors.successBackground;
  Color get warningColor => AppColors.warning;
  Color get warningBackgroundColor => AppColors.warningBackground;
  Color get infoColor => AppColors.info;
  Color get infoBackgroundColor => AppColors.infoBackground;
}
```
