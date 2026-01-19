# Módulo Sistema de Diseño - Widgets Base

## 1. AppButton

```dart
// lib/core/widgets/app_button.dart

import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';

enum AppButtonVariant { primary, secondary, ghost, danger }
enum AppButtonSize { sm, md, lg }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final bool isExpanded;
  final IconData? icon;
  final IconData? trailingIcon;

  const AppButton({
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.md,
    this.isLoading = false,
    this.isExpanded = false,
    this.icon,
    this.trailingIcon,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Colores según variante
    final (backgroundColor, foregroundColor, borderColor) = switch (variant) {
      AppButtonVariant.primary => (
        colorScheme.primary,
        colorScheme.onPrimary,
        colorScheme.primary,
      ),
      AppButtonVariant.secondary => (
        colorScheme.surface,
        colorScheme.onSurface,
        colorScheme.outline,
      ),
      AppButtonVariant.ghost => (
        Colors.transparent,
        colorScheme.onSurface,
        Colors.transparent,
      ),
      AppButtonVariant.danger => (
        colorScheme.error,
        colorScheme.onError,
        colorScheme.error,
      ),
    };

    // Padding según tamaño
    final padding = switch (size) {
      AppButtonSize.sm => AppSpacing.buttonPaddingSm,
      AppButtonSize.md => AppSpacing.buttonPaddingMd,
      AppButtonSize.lg => AppSpacing.buttonPaddingLg,
    };

    // Tamaño de texto e iconos
    final fontSize = switch (size) {
      AppButtonSize.sm => 12.0,
      AppButtonSize.md => 14.0,
      AppButtonSize.lg => 16.0,
    };

    final iconSize = switch (size) {
      AppButtonSize.sm => 16.0,
      AppButtonSize.md => 20.0,
      AppButtonSize.lg => 24.0,
    };

    Widget buttonChild = Row(
      mainAxisSize: isExpanded ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: iconSize,
            height: iconSize,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation(foregroundColor),
            ),
          ),
          const SizedBox(width: 8),
        ] else if (icon != null) ...[
          Icon(icon, size: iconSize),
          const SizedBox(width: 8),
        ],
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontFamily: 'Oswald',
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.5,
          ),
        ),
        if (trailingIcon != null && !isLoading) ...[
          const SizedBox(width: 8),
          Icon(trailingIcon, size: iconSize),
        ],
      ],
    );

    final button = Material(
      color: backgroundColor,
      borderRadius: AppSpacing.borderRadiusSm,
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: AppSpacing.borderRadiusSm,
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: AppSpacing.borderRadiusSm,
            border: Border.all(color: borderColor),
          ),
          child: DefaultTextStyle(
            style: TextStyle(color: foregroundColor),
            child: IconTheme(
              data: IconThemeData(color: foregroundColor),
              child: buttonChild,
            ),
          ),
        ),
      ),
    );

    if (isExpanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
```

---

## 2. AppTextField

```dart
// lib/core/widgets/app_text_field.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final bool readOnly;
  final int maxLines;
  final int? maxLength;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final String? Function(String?)? validator;
  final FocusNode? focusNode;

  const AppTextField({
    this.label,
    this.hint,
    this.errorText,
    this.controller,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.inputFormatters,
    this.onChanged,
    this.onTap,
    this.validator,
    this.focusNode,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              label!,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
              ),
            ),
          ),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          obscureText: obscureText,
          readOnly: readOnly,
          maxLines: maxLines,
          maxLength: maxLength,
          inputFormatters: inputFormatters,
          onChanged: onChanged,
          onTap: onTap,
          validator: validator,
          focusNode: focusNode,
          decoration: InputDecoration(
            hintText: hint,
            errorText: errorText,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
```

---

## 3. AppCard

```dart
// lib/core/widgets/app_card.dart

import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final bool isInteractive;
  final Color? backgroundColor;
  final BorderRadiusGeometry? borderRadius;

  const AppCard({
    required this.child,
    this.padding,
    this.onTap,
    this.isInteractive = false,
    this.backgroundColor,
    this.borderRadius,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectivePadding = padding ?? AppSpacing.paddingLg;
    final effectiveRadius = borderRadius ?? AppSpacing.borderRadiusLg;

    Widget cardContent = Container(
      padding: effectivePadding,
      decoration: BoxDecoration(
        color: backgroundColor ?? theme.colorScheme.surface,
        borderRadius: effectiveRadius,
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.5),
        ),
      ),
      child: child,
    );

    if (onTap != null || isInteractive) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: effectiveRadius as BorderRadius?,
          child: cardContent,
        ),
      );
    }

    return cardContent;
  }
}

/// Card con efecto "glass" (translúcido)
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const GlassCard({
    required this.child,
    this.padding,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: padding ?? AppSpacing.paddingLg,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface.withValues(alpha: 0.95),
        borderRadius: AppSpacing.borderRadiusLg,
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.5),
        ),
      ),
      child: child,
    );
  }
}
```

---

## 4. AppBadge

```dart
// lib/core/widgets/app_badge.dart

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

enum BadgeVariant { success, warning, danger, info, muted, primary }

class AppBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;

  const AppBadge({
    required this.label,
    this.variant = BadgeVariant.muted,
    this.icon,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final (backgroundColor, textColor, borderColor) = _getColors(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: AppSpacing.borderRadiusFull,
        border: Border.all(color: borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  (Color, Color, Color) _getColors(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return switch (variant) {
      BadgeVariant.success => (
        AppColors.successBackground,
        isDark ? const Color(0xFF4ADE80) : AppColors.success,
        AppColors.success.withValues(alpha: 0.3),
      ),
      BadgeVariant.warning => (
        AppColors.warningBackground,
        isDark ? const Color(0xFFFACC15) : AppColors.warning,
        AppColors.warning.withValues(alpha: 0.3),
      ),
      BadgeVariant.danger => (
        AppColors.errorBackground,
        isDark ? const Color(0xFFF87171) : AppColors.error,
        AppColors.error.withValues(alpha: 0.3),
      ),
      BadgeVariant.info => (
        AppColors.infoBackground,
        isDark ? const Color(0xFF60A5FA) : AppColors.info,
        AppColors.info.withValues(alpha: 0.3),
      ),
      BadgeVariant.primary => (
        Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
      ),
      BadgeVariant.muted => (
        Theme.of(context).colorScheme.surfaceContainerHighest,
        Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
        Theme.of(context).colorScheme.outline,
      ),
    };
  }
}
```

---

## 5. Shimmer / Skeleton

```dart
// lib/core/widgets/shimmer_loading.dart

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_spacing.dart';

class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const ShimmerLoading({
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
      highlightColor: isDark ? const Color(0xFF3F3F46) : const Color(0xFFF4F4F5),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius ?? AppSpacing.borderRadiusSm,
        ),
      ),
    );
  }
}

/// Skeleton para una card de producto
class ProductCardSkeleton extends StatelessWidget {
  const ProductCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Imagen
        const ShimmerLoading(
          height: 200,
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        const SizedBox(height: 12),
        // Título
        const ShimmerLoading(width: 120, height: 16),
        const SizedBox(height: 8),
        // Precio
        const ShimmerLoading(width: 80, height: 20),
      ],
    );
  }
}

/// Skeleton para un item de lista
class ListItemSkeleton extends StatelessWidget {
  const ListItemSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacing.paddingLg,
      child: Row(
        children: [
          const ShimmerLoading(
            width: 60,
            height: 60,
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                ShimmerLoading(height: 16),
                SizedBox(height: 8),
                ShimmerLoading(width: 100, height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 6. Loading Overlay

```dart
// lib/core/widgets/loading_overlay.dart

import 'package:flutter/material.dart';

class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final String? message;

  const LoadingOverlay({
    required this.isLoading,
    required this.child,
    this.message,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black.withValues(alpha: 0.5),
            child: Center(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(),
                      if (message != null) ...[
                        const SizedBox(height: 16),
                        Text(message!),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
```

---

## 7. Error View

```dart
// lib/core/widgets/error_view.dart

import 'package:flutter/material.dart';
import 'app_button.dart';

class ErrorView extends StatelessWidget {
  final String? title;
  final String message;
  final VoidCallback? onRetry;
  final IconData icon;

  const ErrorView({
    this.title,
    required this.message,
    this.onRetry,
    this.icon = Icons.error_outline,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            if (title != null)
              Text(
                title!,
                style: theme.textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
            const SizedBox(height: 8),
            Text(
              message,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              AppButton(
                label: 'Reintentar',
                onPressed: onRetry,
                icon: Icons.refresh,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## 8. Empty State

```dart
// lib/core/widgets/empty_state.dart

import 'package:flutter/material.dart';
import 'app_button.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              AppButton(
                label: actionLabel!,
                onPressed: onAction,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## 9. Checklist de Widgets Base

- [ ] `AppButton` - Botón con variantes y estados
- [ ] `AppTextField` - Input con label y validación
- [ ] `AppCard` - Card con bordes y opciones
- [ ] `GlassCard` - Card con efecto translúcido
- [ ] `AppBadge` - Badge con variantes de color
- [ ] `ShimmerLoading` - Skeleton animado
- [ ] `ProductCardSkeleton` - Skeleton específico
- [ ] `LoadingOverlay` - Overlay de carga
- [ ] `ErrorView` - Vista de error con retry
- [ ] `EmptyState` - Estado vacío con acción
