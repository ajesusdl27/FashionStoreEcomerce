# Módulo 03: Widgets Base Reutilizables

## 🎯 Objetivo

Crear widgets base reutilizables que se usarán en toda la aplicación. Estos widgets deben seguir exactamente el diseño visual de la web y ser consistentes con el sistema de diseño (Módulo 02).

## 📦 Widgets a Implementar

### 1. AppButton (Botones)

**Ubicación**: `lib/core/widgets/buttons/app_button.dart`

**Variantes requeridas:**

1. **Primary**: Fondo primary (verde neón), con glow effect en dark mode
2. **Secondary**: Borde primary, fondo transparente
3. **Outline**: Borde muted, fondo transparente
4. **Ghost**: Sin borde, sin fondo, hover sutil
5. **Destructive**: Fondo error (rojo), para acciones peligrosas

**Propiedades:**
- `onPressed`: Callback (nullable para disabled state)
- `child`: Widget (usualmente Text)
- `isLoading`: bool (muestra spinner circular)
- `fullWidth`: bool (ocupar todo el ancho)
- `size`: enum (small, medium, large)

**Estados visuales:**
- Normal
- Pressed (scale down 0.95)
- Disabled (opacity 0.5)
- Loading (spinner + texto "Cargando...")

**Especificaciones visuales:**
- Altura mínima: 44px (touch target)
- Padding horizontal: 24px (large), 16px (medium), 12px (small)
- Padding vertical: 12px (large), 10px (medium), 8px (small)
- Border radius: `AppSpacing.radiusMd`
- Transición: 150ms ease-out
- Primary hover: Añadir glow effect (dark mode) o darken (light mode)
- Typography: `AppTypography.labelLarge` (large/medium), `labelMedium` (small)

### 2. AppTextField (Input de texto)

**Ubicación**: `lib/core/widgets/inputs/app_text_field.dart`

**Características:**
- Controller: TextEditingController
- Label: String (arriba del input)
- Hint: String (placeholder)
- Error: String? (mensaje de error, muestra borde rojo)
- Prefix icon: IconData?
- Suffix icon: IconData? (con onTap callback)
- Password mode: bool (obscureText + botón show/hide)
- Keyboard type: TextInputType
- Validator: Function(String?)? → String?
- Max lines: int (default 1)
- Read only: bool

**Estados visuales:**
- Normal: Borde border
- Focus: Borde ring (verde neón), shadow sutil
- Error: Borde error, mensaje en rojo debajo
- Disabled: Opacity 0.6, no editable

**Especificaciones:**
- Altura: 48px (single line)
- Padding interno: 12px vertical, 16px horizontal
- Border radius: `AppSpacing.radiusMd`
- Font: `AppTypography.bodyMedium`
- Label font: `AppTypography.labelSmall`
- Error font: `AppTypography.bodySmall` color error

### 3. AppSearchField (Búsqueda)

**Ubicación**: `lib/core/widgets/inputs/app_search_field.dart`

Similar a AppTextField pero:
- Prefix icon fijo: ícono de búsqueda
- Suffix: Botón X para limpiar (solo visible si hay texto)
- onChanged: Callback para búsqueda en tiempo real
- Background más sutil: muted color
- Border radius más redondeado: `AppSpacing.radiusXl`

### 4. AppCard (Tarjeta base)

**Ubicación**: `lib/core/widgets/cards/app_card.dart`

**Características:**
- child: Widget
- padding: EdgeInsets (default: `AppSpacing.md`)
- onTap: VoidCallback? (si existe, muestra ripple effect)
- elevation: double (default: 1)
- border: bool (mostrar borde o no)

**Especificaciones:**
- Background: card color del theme
- Border: 1px solid border color (si border = true)
- Border radius: `AppSpacing.radiusLg`
- Hover (desktop): Ligero lift (elevation +2)
- Shadow: Sutil, solo en light mode

### 5. GlassCard (Tarjeta con efecto glass)

**Ubicación**: `lib/core/widgets/cards/glass_card.dart`

Similar a AppCard pero:
- Background: card color con opacity 0.95
- Backdrop blur (simulado con stack + blur filter)
- Border más sutil: opacity 0.5
- Usado para overlays, modales, elementos flotantes

### 6. AppBadge (Insignias)

**Ubicación**: `lib/core/widgets/badges/app_badge.dart`

**Variantes:**
1. **Default**: Gris muted
2. **Primary**: Verde neón
3. **Accent**: Rojo coral
4. **Success**: Verde esmeralda
5. **Warning**: Amarillo
6. **Error**: Rojo

**Propiedades:**
- text: String
- variant: BadgeVariant enum
- size: small | medium (default medium)

**Especificaciones:**
- Padding: 4px vertical, 8px horizontal (small), 6px y 12px (medium)
- Border radius: `AppSpacing.radiusSm`
- Font: `AppTypography.labelSmall` (small), `labelMedium` (medium)
- Uppercase: true
- Letter spacing: 0.5

### 7. ShimmerLoading (Skeleton loader)

**Ubicación**: `lib/core/widgets/feedback/shimmer_loading.dart`

**Uso**: Skeletons mientras cargan datos

**Tipos predefinidos:**
- `ShimmerLoading.card()`: Card skeleton (height 200)
- `ShimmerLoading.list()`: Lista de 3 items
- `ShimmerLoading.text()`: Línea de texto
- `ShimmerLoading.product()`: Grid de productos (2 columnas)

**Especificaciones:**
- Gradiente animado: lightMuted → muted → lightMuted (light mode)
- Gradiente animado: darkMuted → darkCard → darkMuted (dark mode)
- Animación: 1.5s linear infinite
- Border radius según el tipo de skeleton

### 8. LoadingOverlay (Overlay con spinner)

**Ubicación**: `lib/core/widgets/feedback/loading_overlay.dart`

**Uso**: Modal loading que bloquea interacción

**Características:**
- Fondo: Negro con opacity 0.7
- Spinner circular: Color primary
- Mensaje opcional: String? (debajo del spinner)
- No dismissable (no se puede cerrar tocando afuera)

**Especificaciones:**
- Spinner size: 48px
- Mensaje font: `AppTypography.bodyMedium`
- Mensaje color: foreground
- Spacing entre spinner y mensaje: `AppSpacing.md`

### 9. ErrorView (Vista de error)

**Ubicación**: `lib/core/widgets/feedback/error_view.dart`

**Uso**: Mostrar errores con opción de retry

**Características:**
- icon: IconData (default: alert-circle)
- title: String (default: "Algo salió mal")
- message: String (mensaje del error)
- onRetry: VoidCallback? (botón "Reintentar")

**Especificaciones:**
- Icon size: 64px, color error
- Title: `AppTypography.headingMedium`
- Message: `AppTypography.bodyMedium`, color mutedForeground
- Botón retry: AppButton.secondary
- Centrado vertical y horizontalmente
- Max width: 400px
- Spacing: `AppSpacing.lg` entre elementos

### 10. EmptyState (Estado vacío)

**Ubicación**: `lib/core/widgets/feedback/empty_state.dart`

**Uso**: Mostrar cuando no hay datos

**Características:**
- icon: IconData (default: inbox)
- title: String (ej: "No hay productos")
- message: String? (descripción opcional)
- action: Widget? (botón de acción opcional, ej: "Agregar producto")

**Especificaciones:**
- Icon size: 80px, color mutedForeground con opacity 0.3
- Title: `AppTypography.headingMedium`
- Message: `AppTypography.bodyMedium`, color mutedForeground
- Centrado vertical y horizontalmente
- Max width: 400px
- Spacing: `AppSpacing.lg` entre elementos

## 🎨 Uso de Extensiones Útiles

### lib/core/utils/extensions.dart

**Extensiones recomendadas para facilitar el uso de widgets:**

```dart
// Extension en BuildContext para acceder al theme fácilmente
extension ThemeExtension on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;
}

// Extension en String para capitalización
extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
  
  String toTitleCase() {
    return split(' ').map((word) => word.capitalize()).join(' ');
  }
}

// Extension en num para spacing
extension SpacingExtension on num {
  SizedBox get verticalSpace => SizedBox(height: toDouble());
  SizedBox get horizontalSpace => SizedBox(width: toDouble());
}
```

## 🔧 Helpers Adicionales

### lib/core/utils/formatters.dart

**Funciones de formateo:**

```dart
// Formatear precio
String formatPrice(double price) {
  // Retorna: "€XX.XX" o "€X,XXX.XX"
  // Usar intl package: NumberFormat
}

// Formatear fecha
String formatDate(DateTime date) {
  // Retorna: "21 Ene 2026"
}

String formatDateTime(DateTime date) {
  // Retorna: "21 Ene 2026, 14:30"
}

// Formatear número de pedido
String formatOrderNumber(int number) {
  // Retorna: "#1001"
}
```

### lib/core/utils/validators.dart

**Funciones de validación para forms:**

```dart
// Validar email
String? validateEmail(String? value) {
  // Retorna error si no es válido, null si es válido
}

// Validar contraseña
String? validatePassword(String? value) {
  // Mínimo 6 caracteres
}

// Validar teléfono (España)
String? validatePhone(String? value) {
  // Formato: +34 XXX XXX XXX (opcional)
}

// Validar código postal (España)
String? validatePostalCode(String? value) {
  // 5 dígitos
}

// Validar campo requerido
String? validateRequired(String? value, String fieldName) {
  // Retorna "$fieldName es requerido"
}
```

## 📋 Consideraciones de Implementación

### Performance

1. **Usar const constructors** siempre que sea posible
2. **Evitar rebuilds innecesarios** con `const` en children
3. **Extractar widgets complejos** en clases separadas
4. **Keys** solo cuando sea necesario (listas dinámicas)

### Accesibilidad

1. **Semantics**: Añadir labels semánticos a botones e iconos
2. **Touch targets**: Mínimo 44x44px
3. **Contraste**: Verificar ratios de contraste (4.5:1 mínimo)
4. **Focus**: Estados de focus visibles

### Animaciones

Todas las transiciones deben ser:
- **Duración**: 150ms (rápido), 300ms (normal), 500ms (lento)
- **Curve**: `Curves.easeOut` (default), `Curves.easeInOut` (hover)
- **No janky**: 60fps mínimo

### Ripple Effects

Usar `InkWell` o `Material` para ripple effects en:
- Botones
- Cards clickeables
- List items
- Cualquier elemento interactivo

## ✅ Verificación del Módulo

### Checklist

- [ ] AppButton implementado con todas las variantes
- [ ] AppTextField con validación y estados
- [ ] AppSearchField funcional
- [ ] AppCard y GlassCard creados
- [ ] AppBadge con todas las variantes
- [ ] ShimmerLoading con tipos predefinidos
- [ ] LoadingOverlay funcional
- [ ] ErrorView con retry button
- [ ] EmptyState con customización
- [ ] Extensions y helpers creados
- [ ] Formatters y validators implementados

### Test de Widgets

Crear una pantalla de prueba (`lib/test_widgets_screen.dart`) que muestre todos los widgets:

```dart
class TestWidgetsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Test Widgets')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: AppSpacing.gapLg,
          children: [
            // Sección botones
            Text('Botones', style: context.textTheme.headlineMedium),
            AppButton.primary(onPressed: () {}, child: Text('Primary')),
            AppButton.secondary(onPressed: () {}, child: Text('Secondary')),
            AppButton.outline(onPressed: () {}, child: Text('Outline')),
            AppButton.ghost(onPressed: () {}, child: Text('Ghost')),
            AppButton.destructive(onPressed: () {}, child: Text('Destructive')),
            AppButton.primary(
              onPressed: () {}, 
              child: Text('Loading'),
              isLoading: true,
            ),
            
            // Sección inputs
            Text('Inputs', style: context.textTheme.headlineMedium),
            AppTextField(label: 'Email', hint: 'tu@email.com'),
            AppTextField(
              label: 'Contraseña', 
              isPassword: true,
            ),
            AppTextField(
              label: 'Error', 
              error: 'Este campo tiene un error',
            ),
            AppSearchField(hint: 'Buscar productos...'),
            
            // Sección cards
            Text('Cards', style: context.textTheme.headlineMedium),
            AppCard(child: Text('Card básico')),
            GlassCard(child: Text('Glass card')),
            
            // Sección badges
            Text('Badges', style: context.textTheme.headlineMedium),
            Wrap(
              spacing: AppSpacing.gapSm,
              children: [
                AppBadge(text: 'Default', variant: BadgeVariant.default_),
                AppBadge(text: 'Primary', variant: BadgeVariant.primary),
                AppBadge(text: 'Accent', variant: BadgeVariant.accent),
                AppBadge(text: 'Success', variant: BadgeVariant.success),
                AppBadge(text: 'Warning', variant: BadgeVariant.warning),
                AppBadge(text: 'Error', variant: BadgeVariant.error),
              ],
            ),
            
            // Sección feedback
            Text('Feedback', style: context.textTheme.headlineMedium),
            ShimmerLoading.card(),
            ErrorView(
              message: 'Error de prueba',
              onRetry: () {},
            ),
            EmptyState(
              title: 'No hay items',
              message: 'Agrega algunos items para comenzar',
            ),
          ],
        ),
      ),
    );
  }
}
```

### Comando de Prueba

```bash
flutter run
```

Navegar a la pantalla de test y verificar:
- Todos los widgets se renderizan correctamente
- Colores y tipografías correctos
- Animaciones suaves
- Touch targets adecuados (mínimo 44x44)
- No hay overflow ni errores visuales

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 04: Autenticación** - Implementar sistema completo de auth con Supabase.

---

**Tiempo Estimado**: 4-6 horas
**Complejidad**: Media-Alta
**Dependencias**: Módulos 01 y 02 completados
