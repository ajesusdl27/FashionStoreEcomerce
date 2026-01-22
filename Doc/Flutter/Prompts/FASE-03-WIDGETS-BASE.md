# Prompt para Fase 03: Widgets Base Reutilizables

## 📋 Contexto

Continuando con FashionStore Flutter. Fases 01-02 completadas. Ahora implementaré los widgets base que se usarán en toda la aplicación.

## 🎯 Objetivo de esta Fase

Crear 10 widgets base reutilizables + helpers (formatters, validators, extensions) siguiendo exactamente el diseño de la aplicación web.

## 📚 Documentación a Leer

**IMPORTANTE:** Lee completamente:
- `Doc/Flutter/03-WIDGETS-BASE.md` (Especificaciones detalladas)
- `Doc/Flutter/REFERENCIA-RAPIDA.md` (Valores de diseño)

## ✅ Tareas a Completar

### Tarea 3.1: AppButton

**Archivo:** `lib/core/widgets/buttons/app_button.dart`

**Acción:** Crear widget AppButton con 5 variantes.

**Especificaciones clave:**
- Variantes: primary, secondary, outline, ghost, destructive
- Propiedades: onPressed, child, isLoading, fullWidth, size
- Estados: normal, pressed (scale 0.95), disabled (opacity 0.5), loading
- Altura mínima: 44px (accesibilidad)
- Border radius: AppSpacing.radiusMd
- Primary en dark mode: Glow effect (neonGlow de AppEffects)

**Estructura esperada:**
```dart
class AppButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Widget child;
  final bool isLoading;
  final bool fullWidth;
  final AppButtonSize size;
  final AppButtonVariant variant;
  
  const AppButton({
    required this.onPressed,
    required this.child,
    this.isLoading = false,
    this.fullWidth = false,
    this.size = AppButtonSize.medium,
    this.variant = AppButtonVariant.primary,
    super.key,
  });
  
  // Constructors nombrados
  const AppButton.primary(...);
  const AppButton.secondary(...);
  const AppButton.outline(...);
  const AppButton.ghost(...);
  const AppButton.destructive(...);
  
  @override
  Widget build(BuildContext context) {
    // Implementación
  }
}

enum AppButtonVariant { primary, secondary, outline, ghost, destructive }
enum AppButtonSize { small, medium, large }
```

**Checklist:**
- [ ] 5 variantes implementadas
- [ ] Constructor nombrado por variante
- [ ] isLoading muestra spinner
- [ ] fullWidth funciona
- [ ] 3 tamaños (small, medium, large)
- [ ] Estados visuales (pressed, disabled)
- [ ] Glow effect en primary dark mode
- [ ] Touch target mínimo 44px
- [ ] Transiciones suaves (150ms)

---

### Tarea 3.2: AppTextField

**Archivo:** `lib/core/widgets/inputs/app_text_field.dart`

**Acción:** Crear widget AppTextField con validación.

**Especificaciones:**
- Propiedades: controller, label, hint, error, prefixIcon, suffixIcon
- isPassword: bool (obscureText + botón show/hide)
- validator: Function(String?)?
- Estados: normal, focus (borde ring), error (borde error)

**Checklist:**
- [ ] Todas las propiedades implementadas
- [ ] Password mode con toggle visibility
- [ ] Validación inline
- [ ] Estados visuales correctos
- [ ] Label arriba del input
- [ ] Error message debajo
- [ ] Border radius AppSpacing.radiusMd
- [ ] Focus: borde verde neón (#CCFF00)

---

### Tarea 3.3: AppSearchField

**Archivo:** `lib/core/widgets/inputs/app_search_field.dart`

**Acción:** Crear widget especializado para búsqueda.

**Diferencias vs AppTextField:**
- Prefix icon fijo: search icon
- Suffix: X button (solo si hay texto)
- onChanged callback
- Border radius más redondeado (radiusXl)
- Background más sutil (muted)

**Checklist:**
- [ ] Search icon prefix
- [ ] Clear button suffix
- [ ] onChanged implementado
- [ ] Border radius xl

---

### Tarea 3.4: AppCard

**Archivo:** `lib/core/widgets/cards/app_card.dart`

**Acción:** Crear widget AppCard base.

**Propiedades:**
- child: Widget
- padding: EdgeInsets (default AppSpacing.md)
- onTap: VoidCallback?
- elevation: double (default 1)
- border: bool (default true)

**Checklist:**
- [ ] Todas propiedades implementadas
- [ ] Background color del theme
- [ ] Border opcional
- [ ] Ripple effect si onTap existe
- [ ] Border radius lg

---

### Tarea 3.5: GlassCard

**Archivo:** `lib/core/widgets/cards/glass_card.dart`

**Acción:** Crear card con efecto glass/frosted.

**Características:**
- Usar glassDecoration de AppEffects
- Opacity 0.95 en background
- Border sutil (opacity 0.5)

**Checklist:**
- [ ] Glass effect implementado
- [ ] Backdrop blur (simulado o real)
- [ ] Border sutil

---

### Tarea 3.6: AppBadge

**Archivo:** `lib/core/widgets/badges/app_badge.dart`

**Acción:** Crear badges con 6 variantes.

**Variantes:**
- default (muted)
- primary (verde neón)
- accent (rojo coral)
- success (verde)
- warning (amarillo)
- error (rojo)

**Propiedades:**
- text: String
- variant: BadgeVariant
- size: small | medium

**Checklist:**
- [ ] 6 variantes de color
- [ ] 2 tamaños
- [ ] Uppercase text
- [ ] Letter spacing 0.5
- [ ] Border radius sm
- [ ] Padding correcto

---

### Tarea 3.7: ShimmerLoading

**Archivo:** `lib/core/widgets/feedback/shimmer_loading.dart`

**Acción:** Crear skeletons con animación shimmer.

**Usar package:** `shimmer: ^3.0.0`

**Tipos predefinidos:**
- ShimmerLoading.card() - Card skeleton
- ShimmerLoading.list() - Lista de 3 items
- ShimmerLoading.text() - Línea de texto
- ShimmerLoading.product() - Grid 2 columnas

**Checklist:**
- [ ] Package shimmer usado
- [ ] 4 tipos predefinidos
- [ ] Gradiente según theme (light/dark)
- [ ] Animación suave 1.5s

---

### Tarea 3.8: LoadingOverlay

**Archivo:** `lib/core/widgets/feedback/loading_overlay.dart`

**Acción:** Crear overlay modal con spinner.

**Características:**
- Fondo negro opacity 0.7
- CircularProgressIndicator color primary
- Mensaje opcional debajo del spinner
- No dismissable

**Checklist:**
- [ ] Modal implementado
- [ ] Spinner centrado
- [ ] Mensaje opcional
- [ ] No se puede cerrar tocando afuera

---

### Tarea 3.9: ErrorView

**Archivo:** `lib/core/widgets/feedback/error_view.dart`

**Acción:** Crear vista de error con retry.

**Elementos:**
- Icon alert-circle (64px, color error)
- Título "Algo salió mal" (headingMedium)
- Mensaje del error (bodyMedium, muted)
- Botón "Reintentar" (AppButton.secondary)

**Checklist:**
- [ ] Icon, título, mensaje
- [ ] Botón retry opcional
- [ ] Centrado vertical y horizontal
- [ ] Max width 400px

---

### Tarea 3.10: EmptyState

**Archivo:** `lib/core/widgets/feedback/empty_state.dart`

**Acción:** Crear vista de estado vacío.

**Elementos:**
- Icon customizable (80px, muted con opacity 0.3)
- Título customizable
- Mensaje opcional
- Action button opcional

**Checklist:**
- [ ] Icon, título personalizables
- [ ] Mensaje opcional
- [ ] Botón de acción opcional
- [ ] Centrado
- [ ] Max width 400px

---

### Tarea 3.11: Extensions

**Archivo:** `lib/core/utils/extensions.dart`

**Acción:** Crear extensions útiles.

**Extensions requeridas:**

```dart
// BuildContext
extension ThemeExtension on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;
}

// String
extension StringExtension on String {
  String capitalize();
  String toTitleCase();
}

// num (para spacing)
extension SpacingExtension on num {
  SizedBox get verticalSpace => SizedBox(height: toDouble());
  SizedBox get horizontalSpace => SizedBox(width: toDouble());
}
```

**Checklist:**
- [ ] ThemeExtension implementada
- [ ] StringExtension implementada
- [ ] SpacingExtension implementada

---

### Tarea 3.12: Formatters

**Archivo:** `lib/core/utils/formatters.dart`

**Acción:** Crear funciones de formateo.

**Funciones requeridas:**

```dart
import 'package:intl/intl.dart';

// Formatear precio
String formatPrice(double price) {
  final formatter = NumberFormat.currency(
    locale: 'es_ES',
    symbol: '€',
    decimalDigits: 2,
  );
  return formatter.format(price);
}

// Formatear fecha
String formatDate(DateTime date) {
  final formatter = DateFormat('d MMM y', 'es_ES');
  return formatter.format(date);
}

// Formatear fecha y hora
String formatDateTime(DateTime date) {
  final formatter = DateFormat('d MMM y, HH:mm', 'es_ES');
  return formatter.format(date);
}

// Formatear número de pedido
String formatOrderNumber(int number) {
  return '#$number';
}
```

**Checklist:**
- [ ] formatPrice implementado
- [ ] formatDate implementado
- [ ] formatDateTime implementado
- [ ] formatOrderNumber implementado
- [ ] Locale español ('es_ES')

---

### Tarea 3.13: Validators

**Archivo:** `lib/core/utils/validators.dart`

**Acción:** Crear funciones de validación.

**Funciones requeridas:**

```dart
// Validar email
String? validateEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'El email es requerido';
  }
  
  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!emailRegex.hasMatch(value)) {
    return 'Email inválido';
  }
  
  return null;
}

// Validar contraseña
String? validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'La contraseña es requerida';
  }
  
  if (value.length < 6) {
    return 'Mínimo 6 caracteres';
  }
  
  return null;
}

// Validar teléfono (España, opcional)
String? validatePhone(String? value) {
  if (value == null || value.isEmpty) {
    return null; // Opcional
  }
  
  final phoneRegex = RegExp(r'^\+?34?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}$');
  if (!phoneRegex.hasMatch(value)) {
    return 'Teléfono inválido';
  }
  
  return null;
}

// Validar código postal (España)
String? validatePostalCode(String? value) {
  if (value == null || value.isEmpty) {
    return null; // Opcional
  }
  
  final cpRegex = RegExp(r'^\d{5}$');
  if (!cpRegex.hasMatch(value)) {
    return 'Código postal debe tener 5 dígitos';
  }
  
  return null;
}

// Validar campo requerido genérico
String? validateRequired(String? value, String fieldName) {
  if (value == null || value.isEmpty) {
    return '$fieldName es requerido';
  }
  return null;
}
```

**Checklist:**
- [ ] validateEmail con regex
- [ ] validatePassword (min 6)
- [ ] validatePhone (formato español)
- [ ] validatePostalCode (5 dígitos)
- [ ] validateRequired genérico
- [ ] Mensajes en español

---

### Tarea 3.14: Crear Test Screen

**Archivo:** `lib/test_widgets_screen.dart`

**Acción:** Crear pantalla de prueba que muestre todos los widgets.

**Debe incluir:**
- Sección de botones (todas las variantes)
- Sección de inputs (normal, password, error, search)
- Sección de cards (AppCard, GlassCard)
- Sección de badges (todas las variantes)
- Sección de feedback (shimmer, error, empty)

**Checklist:**
- [ ] Todos los widgets mostrados
- [ ] Separadores entre secciones
- [ ] Scrollable
- [ ] Labels descriptivos

---

### Tarea 3.15: Modificar main.dart para Pruebas

**Archivo:** `lib/main.dart`

**Acción:** Temporalmente cambiar home para mostrar TestWidgetsScreen.

```dart
// En FashionStoreApp
return MaterialApp(
  title: 'FashionStore',
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.dark,
  home: const TestWidgetsScreen(), // Temporal para pruebas
);
```

**Checklist:**
- [ ] Import de TestWidgetsScreen agregado
- [ ] home apunta a TestWidgetsScreen

---

## 🧪 Verificación Final

### Comandos de Verificación

```bash
# 1. Verificar compilación
flutter analyze

# 2. Ejecutar app
flutter run --dart-define=SUPABASE_URL=test --dart-define=SUPABASE_ANON_KEY=test --dart-define=STRIPE_PUBLISHABLE_KEY=test
```

### Verificación Visual

Al ejecutar la app, debes ver:

**Sección Botones:**
- [ ] Primary: Verde neón (#CCFF00), con glow sutil
- [ ] Secondary: Borde verde, fondo transparente
- [ ] Outline: Borde gris, fondo transparente
- [ ] Ghost: Sin borde, hover sutil
- [ ] Destructive: Fondo rojo
- [ ] Loading button: Spinner circular

**Sección Inputs:**
- [ ] TextField normal: Borde gris
- [ ] TextField focus: Borde verde neón brillante
- [ ] TextField error: Borde rojo, mensaje abajo
- [ ] Password: Eye icon que alterna visibility
- [ ] Search: Search icon, clear button

**Sección Cards:**
- [ ] AppCard: Fondo #141414, borde #262626
- [ ] GlassCard: Efecto translúcido

**Sección Badges:**
- [ ] 6 variantes con colores correctos
- [ ] Texto uppercase
- [ ] Padding adecuado

**Sección Feedback:**
- [ ] Shimmer animado
- [ ] ErrorView con icon y mensaje
- [ ] EmptyState con icon grande

**General:**
- [ ] Todos los widgets usan fuentes correctas (o error esperado si faltan .ttf)
- [ ] Colores exactos del diseño
- [ ] Spacing consistente
- [ ] Touch targets mínimo 44px
- [ ] Animaciones suaves

---

## ✅ Checklist Final de Fase 03

- [ ] **3.1** AppButton con 5 variantes
- [ ] **3.2** AppTextField con validación
- [ ] **3.3** AppSearchField
- [ ] **3.4** AppCard
- [ ] **3.5** GlassCard
- [ ] **3.6** AppBadge con 6 variantes
- [ ] **3.7** ShimmerLoading con 4 tipos
- [ ] **3.8** LoadingOverlay
- [ ] **3.9** ErrorView
- [ ] **3.10** EmptyState
- [ ] **3.11** Extensions (Theme, String, num)
- [ ] **3.12** Formatters (precio, fecha, orden)
- [ ] **3.13** Validators (email, password, phone, CP)
- [ ] **3.14** TestWidgetsScreen creada
- [ ] **3.15** main.dart modificado
- [ ] **Verificación** App ejecuta y muestra todos los widgets
- [ ] **Verificación** Diseño visual correcto (colores, fonts, spacing)
- [ ] **Verificación** No hay errores de compilación

## 📝 Reportar Completado

```
✅ FASE 03 COMPLETADA

Resumen:
- Widgets creados: 10
- Helpers creados: 3 (Extensions, Formatters, Validators)
- Test screen: ✅

Archivos creados:
- lib/core/widgets/buttons/app_button.dart
- lib/core/widgets/inputs/app_text_field.dart
- lib/core/widgets/inputs/app_search_field.dart
- lib/core/widgets/cards/app_card.dart
- lib/core/widgets/cards/glass_card.dart
- lib/core/widgets/badges/app_badge.dart
- lib/core/widgets/feedback/shimmer_loading.dart
- lib/core/widgets/feedback/loading_overlay.dart
- lib/core/widgets/feedback/error_view.dart
- lib/core/widgets/feedback/empty_state.dart
- lib/core/utils/extensions.dart
- lib/core/utils/formatters.dart
- lib/core/utils/validators.dart
- lib/test_widgets_screen.dart

Verificación visual:
- Primary button verde neón: ✅
- TextField focus verde neón: ✅
- Todos los widgets funcionan: ✅
- Diseño exacto a especificaciones: ✅

Estado: LISTO PARA FASE 04 (Autenticación)

Notas:
[Cualquier warning de fuentes o ajustes realizados]
```

## 🎯 Próximo Paso

**FASE-04-AUTENTICACION.md** - Implementar sistema completo de auth
