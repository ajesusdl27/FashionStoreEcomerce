# Guía de Desarrollo Flutter - FashionStore

## 🎯 Orden de Desarrollo Recomendado

### Fase 0: Setup Inicial (Día 1)
```
1. Crear proyecto Flutter
2. Configurar pubspec.yaml
3. Descargar fuentes
4. Crear estructura de carpetas
5. Configurar variables de entorno
6. Ejecutar build_runner
7. Probar conexión Supabase
```

### Fase 1: Core y Theme (Días 2-3)
```
📁 core/
├── config/         → env_config, supabase_config, stripe_config
├── constants/      → app_constants, storage_keys
├── theme/          → colors, typography, spacing, theme
├── utils/          → formatters, validators, extensions
└── widgets/        → button, text_field, card, badge, shimmer
```

**Por qué primero:** Todo lo demás depende del theme y widgets base.

### Fase 2: Autenticación (Días 4-6)
```
📁 features/auth/
├── domain/models/  → user.dart
├── data/repos/     → auth_repository.dart
├── providers/      → auth_provider.dart
└── presentation/
    ├── screens/    → login, register, forgot_password
    └── widgets/    → auth_form, social_buttons
```

**Por qué segundo:** Sin auth no puedes probar nada que requiera usuario.

### Fase 3: Navegación Shell (Día 7)
```
📁 core/router/
├── app_router.dart      → GoRouter config
├── routes.dart          → Constantes de rutas
└── auth_guard.dart      → Redirect si no autenticado

📁 features/shell/
└── main_shell.dart      → BottomNavigationBar + Scaffold
```

**Rutas públicas:** /, /product/:id, /category/:slug, /login, /register
**Rutas protegidas:** /account/*, /checkout, /cart

### Fase 4: Catálogo (Días 8-12)
```
📁 features/catalog/
├── domain/models/  → product, category, variant
├── data/repos/     → products_repository, categories_repository
├── providers/      → products_provider, filters_provider
└── presentation/
    ├── screens/    → home, category, product_detail, search
    └── widgets/    → product_card, filters, size_selector
```

**Por qué aquí:** Es la funcionalidad principal de una tienda.

### Fase 5: Carrito (Días 13-15)
```
📁 features/cart/
├── domain/models/  → cart_item.dart
├── data/repos/     → cart_repository.dart (local)
├── providers/      → cart_provider.dart
└── presentation/
    ├── screens/    → cart_screen.dart
    └── widgets/    → cart_item_tile, cart_summary
```

**Dependencia:** Necesita productos para añadir al carrito.

### Fase 6: Checkout (Días 16-18)
```
📁 features/checkout/
├── domain/models/  → checkout_data.dart
├── data/repos/     → checkout_repository.dart
├── providers/      → checkout_provider.dart
└── presentation/
    ├── screens/    → checkout_screen, stripe_webview
    └── widgets/    → address_form, coupon_input
```

**Dependencia:** Necesita carrito y auth.

### Fase 7: Perfil y Direcciones (Días 19-21)
```
📁 features/profile/
├── domain/models/  → profile, address
├── data/repos/     → profile_repository, addresses_repository
├── providers/      → profile_provider, addresses_provider
└── presentation/
    ├── screens/    → account, edit_profile, addresses
    └── widgets/    → address_card, profile_header
```

### Fase 8: Pedidos y Devoluciones (Días 22-25)
```
📁 features/orders/
├── domain/models/  → order, order_item, return_request
├── data/repos/     → orders_repository, returns_repository
├── providers/      → orders_provider, return_request_provider
└── presentation/
    ├── screens/    → orders_list, order_detail, return_request
    └── widgets/    → order_card, order_status_badge
```

### Fase 9: Extras (Días 26-28)
```
- Newsletter (suscripción, preferencias)
- Facturas (solicitud, descarga)
- Cupones (ya integrado en checkout)
- Wishlist (opcional)
```

### Fase 10: Polish (Días 29-30)
```
- Animaciones y transiciones
- Manejo de errores global
- Loading states consistentes
- Testing básico
- Optimización de imágenes
```

---

## 📋 Checklist por Cada Feature

Antes de pasar a la siguiente feature, verifica:

- [ ] Modelos Freezed generados (`build_runner`)
- [ ] Repository implementado y probado
- [ ] Provider funcionando
- [ ] Screens navegables
- [ ] Estados: loading, error, empty, success
- [ ] Pull-to-refresh donde aplique
- [ ] Sin errores en consola

---

## 🔄 Flujo de Trabajo Diario

```
1. Leer documentación del módulo actual
2. Crear modelos (Freezed)
3. Ejecutar: flutter pub run build_runner build
4. Implementar repository
5. Crear provider
6. Diseñar screens
7. Probar en emulador
8. Commit con mensaje descriptivo
```

---

## ⚠️ Errores Comunes a Evitar

1. **No ejecutar build_runner** después de crear modelos Freezed
2. **Olvidar el provider scope** en widgets que lo necesitan
3. **No manejar estados de carga** - siempre mostrar loading/error
4. **Hardcodear strings** - usar constantes
5. **No invalidar providers** después de mutations
6. **Olvidar dispose** de controllers en StatefulWidgets
