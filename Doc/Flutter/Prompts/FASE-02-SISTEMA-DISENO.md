# Prompt para Fase 02: Sistema de Diseño

## 📋 Contexto

Continuando con el desarrollo de FashionStore Flutter. La Fase 01 (Setup) está completada. Ahora implementaré el sistema de diseño completo.

## 🎯 Objetivo de esta Fase

Implementar el sistema de diseño: colores, tipografías, espaciado y configuración del theme. Este diseño replica EXACTAMENTE el de la aplicación web.

## 📚 Documentación a Leer

**IMPORTANTE:** Lee completamente:
- `Doc/Flutter/02-SISTEMA-DISENO.md` (Especificaciones completas)
- `Doc/Flutter/REFERENCIA-RAPIDA.md` (Para valores exactos)

## ⚠️ CRÍTICO: Valores Exactos

**NO inventes colores ni tamaños.** Usa EXACTAMENTE estos valores:

### Colores (copiar exacto):
```dart
// Dark Mode (Principal)
static const darkBackground = Color(0xFF0A0A0A);
static const darkForeground = Color(0xFFFAFAFA);
static const darkPrimary = Color(0xFFCCFF00);        // ⭐ Verde neón
static const darkCard = Color(0xFF141414);
static const darkMuted = Color(0xFF1F1F1F);
static const darkBorder = Color(0xFF262626);

// Light Mode
static const lightBackground = Color(0xFFFFFFFF);
static const lightForeground = Color(0xFF0A0A0A);
static const lightPrimary = Color(0xFF4F7A1F);

// Semánticos
static const accent = Color(0xFFFF4757);             // 🔴 Rojo coral
static const success = Color(0xFF10B981);
static const error = Color(0xFFFF4757);
static const warning = Color(0xFFFBBF24);
static const info = Color(0xFF3B82F6);
```

## ✅ Tareas a Completar

### Tarea 2.1: Crear AppColors

**Archivo:** `lib/core/theme/app_colors.dart`

**Acción:** Crear clase con TODOS los colores especificados en `02-SISTEMA-DISENO.md`.

**Estructura:**
```dart
class AppColors {
  // ========== LIGHT MODE ==========
  static const lightBackground = ...;
  static const lightForeground = ...;
  // ... todos los colores light
  
  // ========== DARK MODE (Principal) ==========
  static const darkBackground = ...;
  static const darkForeground = ...;
  // ... todos los colores dark
  
  // ========== COLORES SEMÁNTICOS ==========
  static const accent = ...;
  static const success = ...;
  // ... todos los semánticos
  
  // ========== COLORES ESPECIALES ==========
  static const shadowLight = ...;
  static const shadowDark = ...;
  // ... especiales
}
```

**Checklist:**
- [ ] Todos los colores Light Mode definidos
- [ ] Todos los colores Dark Mode definidos
- [ ] Colores semánticos definidos
- [ ] Colores especiales (shadows, overlay) definidos
- [ ] NO se han inventado colores adicionales
- [ ] Valores hexadecimales exactos copiados

---

### Tarea 2.2: Crear AppTypography

**Archivo:** `lib/core/theme/app_typography.dart`

**Acción:** Crear clase con sistema completo de tipografía.

**IMPORTANTE:** Usar los tamaños EXACTOS especificados.

**Estructura:**
```dart
class AppTypography {
  // Familias
  static const fontFamilyDisplay = 'BebasNeue';
  static const fontFamilyHeading = 'Oswald';
  static const fontFamilyBody = 'SpaceGrotesk';
  
  // ========== DISPLAY (Bebas Neue) ==========
  static const displayLarge = TextStyle(
    fontFamily: fontFamilyDisplay,
    fontSize: 72,
    fontWeight: FontWeight.w700,
    height: 0.9,
    letterSpacing: -1.5,
  );
  // ... displayMedium, displaySmall
  
  // ========== HEADING (Oswald) ==========
  static const headingLarge = TextStyle(
    fontFamily: fontFamilyHeading,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    height: 1.2,
    letterSpacing: 0.5,
  );
  // ... más headings
  
  // ========== BODY (Space Grotesk) ==========
  static const bodyLarge = TextStyle(
    fontFamily: fontFamilyBody,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
    letterSpacing: 0.15,
  );
  // ... más body
  
  // ========== LABELS ==========
  // ... labels
}
```

**Checklist:**
- [ ] 3 displayStyles (Large, Medium, Small)
- [ ] 4 headingStyles (Large, Medium, Small, XSmall)
- [ ] 3 bodyStyles (Large, Medium, Small)
- [ ] 3 labelStyles (Large, Medium, Small)
- [ ] Tamaños exactos copiados de documentación
- [ ] letterSpacing exacto

---

### Tarea 2.3: Crear AppSpacing

**Archivo:** `lib/core/theme/app_spacing.dart`

**Acción:** Crear clase con sistema de espaciado.

**Valores base (múltiplos de 4):**
```dart
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  static const double xxxl = 64.0;
  
  // Padding específico
  static const double buttonPaddingVertical = 12.0;
  static const double buttonPaddingHorizontal = 24.0;
  // ... más paddings
  
  // Touch targets
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
  
  // Elevations
  static const double elevation0 = 0.0;
  static const double elevation1 = 2.0;
  static const double elevation2 = 4.0;
  static const double elevation3 = 8.0;
  static const double elevation4 = 16.0;
}
```

**Checklist:**
- [ ] Spacing base (xs-xxxl) definido
- [ ] Paddings específicos definidos
- [ ] Touch target mínimo definido
- [ ] Border widths definidos
- [ ] Border radius definidos
- [ ] Elevations definidos

---

### Tarea 2.4: Crear AppTheme

**Archivo:** `lib/core/theme/app_theme.dart`

**Acción:** Crear clase con configuración completa de ThemeData.

**Estructura:**
```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';
import 'app_spacing.dart';

class AppTheme {
  // ========== LIGHT THEME ==========
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBackground,
      primaryColor: AppColors.lightPrimary,
      colorScheme: const ColorScheme.light(
        primary: AppColors.lightPrimary,
        onPrimary: AppColors.lightPrimaryForeground,
        // ... más colores
      ),
      textTheme: _buildTextTheme(AppColors.lightForeground),
      appBarTheme: _buildAppBarTheme(isLight: true),
      cardTheme: _buildCardTheme(isLight: true),
      inputDecorationTheme: _buildInputTheme(isLight: true),
      elevatedButtonTheme: _buildButtonTheme(isLight: true),
      dividerColor: AppColors.lightBorder,
      focusColor: AppColors.ring.withOpacity(0.2),
    );
  }
  
  // ========== DARK THEME (Principal) ==========
  static ThemeData get darkTheme {
    // ... similar a lightTheme pero con colores dark
  }
  
  // ========== HELPERS ==========
  static TextTheme _buildTextTheme(Color defaultColor) {
    return TextTheme(
      displayLarge: AppTypography.displayLarge.copyWith(color: defaultColor),
      displayMedium: AppTypography.displayMedium.copyWith(color: defaultColor),
      // ... todos los styles
    );
  }
  
  static AppBarTheme _buildAppBarTheme({required bool isLight}) {
    // ... configuración AppBar
  }
  
  static CardTheme _buildCardTheme({required bool isLight}) {
    // ... configuración Card
  }
  
  static InputDecorationTheme _buildInputTheme({required bool isLight}) {
    // ... configuración TextField
  }
  
  static ElevatedButtonThemeData _buildButtonTheme({required bool isLight}) {
    // ... configuración Button
  }
}
```

**Checklist:**
- [ ] lightTheme completo
- [ ] darkTheme completo
- [ ] TextTheme builder con todos los estilos
- [ ] AppBarTheme configurado
- [ ] CardTheme configurado
- [ ] InputDecorationTheme configurado
- [ ] ElevatedButtonTheme configurado
- [ ] Helpers implementados

---

### Tarea 2.5: Actualizar main.dart

**Archivo:** `lib/main.dart`

**Acción:** Aplicar el theme en MaterialApp.

**Modificar en FashionStoreApp:**
```dart
return MaterialApp.router(
  title: 'FashionStore',
  debugShowCheckedModeBanner: false,
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.dark, // Por defecto dark mode
  routerConfig: router,
);
```

**Checklist:**
- [ ] Import de AppTheme agregado
- [ ] theme aplicado
- [ ] darkTheme aplicado
- [ ] themeMode configurado en dark

---

### Tarea 2.6: Crear AppEffects (Opcional)

**Archivo:** `lib/core/theme/app_effects.dart`

**Acción:** Crear helpers para efectos visuales.

```dart
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

// Glass effect helper
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

**Checklist:**
- [ ] neonGlow implementado
- [ ] cardShadow implementado
- [ ] glassDecoration implementado

---

## 🧪 Verificación Final

### Test Visual

Crear archivo temporal `lib/test_theme_screen.dart`:

```dart
import 'package:flutter/material.dart';

class TestThemeScreen extends StatelessWidget {
  const TestThemeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Theme'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Test Display
            Text('Display Large', style: Theme.of(context).textTheme.displayLarge),
            Text('Display Medium', style: Theme.of(context).textTheme.displayMedium),
            Text('Display Small', style: Theme.of(context).textTheme.displaySmall),
            
            const SizedBox(height: 24),
            
            // Test Headings
            Text('Heading Large', style: Theme.of(context).textTheme.headlineLarge),
            Text('Heading Medium', style: Theme.of(context).textTheme.headlineMedium),
            Text('Heading Small', style: Theme.of(context).textTheme.headlineSmall),
            
            const SizedBox(height: 24),
            
            // Test Body
            Text('Body Large', style: Theme.of(context).textTheme.bodyLarge),
            Text('Body Medium', style: Theme.of(context).textTheme.bodyMedium),
            Text('Body Small', style: Theme.of(context).textTheme.bodySmall),
            
            const SizedBox(height: 24),
            
            // Test Colors
            Container(
              height: 50,
              color: Theme.of(context).colorScheme.primary,
              child: Center(
                child: Text(
                  'Primary Color',
                  style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
                ),
              ),
            ),
            
            const SizedBox(height: 8),
            
            Container(
              height: 50,
              color: Theme.of(context).colorScheme.secondary,
              child: Center(
                child: Text(
                  'Secondary/Accent Color',
                  style: TextStyle(color: Theme.of(context).colorScheme.onSecondary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

Modificar `main.dart` temporalmente para mostrar esta pantalla:

```dart
// En FashionStoreApp, cambiar:
home: const TestThemeScreen(),
```

**Ejecutar:**
```bash
flutter run
```

**Verificar visualmente:**
- [ ] Background es negro (#0A0A0A) en dark mode
- [ ] Primary color es verde neón (#CCFF00)
- [ ] Accent es rojo coral (#FF4757)
- [ ] Fuentes se renderizan (o muestra error si faltan archivos)
- [ ] Todos los text styles se muestran

---

## ✅ Checklist Final de Fase 02

- [ ] **2.1** AppColors creado con todos los colores exactos
- [ ] **2.2** AppTypography creado con todos los estilos
- [ ] **2.3** AppSpacing creado con sistema completo
- [ ] **2.4** AppTheme creado con light y dark theme
- [ ] **2.5** main.dart actualizado con themes
- [ ] **2.6** AppEffects creado (opcional)
- [ ] **Verificación** `flutter analyze` sin errores
- [ ] **Verificación** App muestra colores correctos
- [ ] **Verificación** Tipografías visibles (o error esperado si faltan fuentes)

## 📝 Reportar Completado

```
✅ FASE 02 COMPLETADA

Resumen:
- AppColors: ✅ [número] colores definidos
- AppTypography: ✅ Display(3) + Heading(4) + Body(3) + Label(3)
- AppSpacing: ✅ Sistema de espaciado completo
- AppTheme: ✅ Light + Dark themes
- AppEffects: ✅ Helpers visuales

Archivos creados:
- lib/core/theme/app_colors.dart
- lib/core/theme/app_typography.dart
- lib/core/theme/app_spacing.dart
- lib/core/theme/app_theme.dart
- lib/core/theme/app_effects.dart

Verificación visual:
- Background dark: #0A0A0A ✅
- Primary neón: #CCFF00 ✅
- Accent coral: #FF4757 ✅

Estado: LISTO PARA FASE 03 (Widgets Base)

Notas:
[Observaciones sobre fuentes faltantes o warnings esperados]
```

## 🎯 Próximo Paso

**FASE-03-WIDGETS-BASE.md** - Crear 10 widgets reutilizables
