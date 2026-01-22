# Estructura de Documentación Flutter - FashionStore

## 📖 Índice de Módulos

Esta documentación está organizada en 14 módulos secuenciales. Cada módulo es independiente pero debe implementarse en orden.

### ✅ Módulos Completados (12/14)

**Core Completo** ✅
- [x] **00-GUIA-PARA-AGENTE-IA.md** - Guía principal y flujo de trabajo
- [x] **01-SETUP-INICIAL.md** - Configuración del proyecto base
- [x] **02-SISTEMA-DISENO.md** - Theme, colores, tipografías
- [x] **03-WIDGETS-BASE.md** - Componentes reutilizables
- [x] **04-AUTENTICACION.md** - Login, registro, perfil
- [x] **05-NAVEGACION-ROUTER.md** - GoRouter y guards

**E-commerce Completo** ✅
- [x] **06-CATALOGO-PRODUCTOS.md** - Listado, filtros, detalle de producto
- [x] **07-CARRITO.md** - Cart con persistencia local
- [x] **08-CHECKOUT-PAGOS.md** - Stripe + cupones + WebView
- [x] **09-PEDIDOS-DEVOLUCIONES.md** - Orders + returns + tracking + facturas
- [x] **10-PERFIL-USUARIO.md** - Profile + edición + direcciones

**Referencia** 📚
- [x] **REFERENCIA-RAPIDA.md** - Quick start y troubleshooting

### 🔄 Módulos Pendientes (2/14)

- [ ] **11-NEWSLETTER-PROMOCIONES.md** - Newsletter + banners promocionales
- [ ] **12-PANEL-ADMIN.md** - Admin completo (CRUD todas las entidades, dashboard, estadísticas)
- [ ] **13-TESTING-OPTIMIZACION.md** - Tests unitarios + widget tests + performance
- [ ] **14-DESPLIEGUE.md** - Build release + publicación en Play Store/App Store

**Nota:** Los módulos 11-14 son complementarios. Con los módulos 01-10 ya tienes una **aplicación e-commerce completamente funcional** lista para producción.

## 🎯 Cómo Usar Esta Documentación

### Para Desarrolladores

1. Lee primero **00-GUIA-PARA-AGENTE-IA.md**
2. Implementa módulos secuencialmente (01 → 02 → 03 → ...)
3. No saltes módulos (hay dependencias)
4. Verifica cada módulo antes de continuar

### Para Agentes IA

Al recibir una solicitud de implementación:

```
1. Leer el módulo completo correspondiente
2. Entender el contexto (backend, modelos, lógica)
3. Implementar siguiendo especificaciones exactas
4. No inventar código no especificado
5. Seguir sistema de diseño (colores, tipografías, spacing)
6. Ejecutar build_runner si es necesario (Freezed)
7. Validar que compila sin errores
```

## 📊 Progreso Recomendado

### Semana 1 (Fundamentos)
- Día 1-2: Módulos 01-02 (Setup + Diseño)
- Día 3-4: Módulo 03 (Widgets Base)
- Día 5-7: Módulo 04 (Autenticación)

### Semana 2 (Core Features)
- Día 1: Módulo 05 (Navegación)
- Día 2-4: Módulo 06 (Catálogo)
- Día 5-6: Módulo 07 (Carrito)
- Día 7: Módulo 08 (Checkout - parte 1)

### Semana 3 (Advanced Features)
- Día 1-2: Módulo 08 (Checkout - parte 2)
- Día 3-4: Módulo 09 (Pedidos/Devoluciones)
- Día 5: Módulo 10 (Perfil)
- Día 6-7: Módulo 11 (Newsletter/Promociones)

### Semana 4 (Admin & Polish)
- Día 1-5: Módulo 12 (Panel Admin)
- Día 6-7: Módulo 13 (Testing)

### Semana 5 (Deploy)
- Día 1-2: Módulo 14 (Despliegue)
- Día 3-5: Fixes y optimizaciones finales

## 🎨 Diseño Visual

### Identidad de Marca

**Colores:**
- Primary: `#CCFF00` (verde neón) - Dark mode
- Primary: `#4F7A1F` (verde oscuro) - Light mode  
- Accent: `#FF4757` (rojo coral)
- Background: `#0A0A0A` (negro profundo) - Dark mode

**Tipografías:**
- Display: Bebas Neue (títulos hero)
- Heading: Oswald (H1-H6)
- Body: Space Grotesk (texto general)

**Modo Principal:** Dark Mode (como la web)

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework:** Flutter 3.x
- **State:** Riverpod 2.x (code generation)
- **Models:** Freezed + json_serializable
- **Navigation:** GoRouter
- **Backend:** Supabase (compartido con web)
- **Payments:** Stripe + WebView
- **Storage:** flutter_secure_storage + shared_preferences

### Estructura de Carpetas

```
lib/
├── core/           # Infraestructura (theme, router, widgets, services)
└── features/       # Módulos por dominio (auth, catalog, cart, etc.)
    └── [feature]/
        ├── data/           # Repositories, datasources
        ├── domain/         # Models, interfaces
        ├── providers/      # Riverpod providers
        └── presentation/   # Screens, widgets
```

## 📚 Recursos Adicionales

### Backend (Supabase)

- **Tablas principales:** products, categories, orders, customer_profiles, coupons, promotions, returns, newsletter_subscribers
- **RLS:** Habilitado en todas las tablas
- **RPC Functions:** validate_coupon, reserve_stock_atomic, create_order_with_items, etc.
- **Storage:** Bucket `product-images` para imágenes

### APIs Externas

- **Stripe:** Checkout session (WebView)
- **Cloudinary:** Optimización de imágenes (transformations)
- **Supabase Edge Functions:** Operaciones server-side si es necesario

## ⚠️ Consideraciones Importantes

### Performance

- Usar `const` constructors
- Lazy loading en listas largas
- Caché de imágenes (cached_network_image)
- Evitar rebuilds innecesarios

### Seguridad

- Tokens en secure storage
- No exponer secrets en código
- Validación client + server
- RLS policies siempre habilitadas

### Accesibilidad

- Touch targets mínimo 44x44px
- Contraste 4.5:1 mínimo
- Semantics en widgets interactivos
- Estados de focus visibles

## 🔧 Comandos Útiles

```bash
# Setup inicial
flutter create fashionstore
flutter pub get

# Desarrollo
flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
flutter pub run build_runner watch --delete-conflicting-outputs

# Tests
flutter test
flutter analyze

# Build
flutter build apk --release
flutter build appbundle --release
flutter build ipa --release
```

## 📞 Soporte

Si tienes dudas:

1. Revisa el módulo correspondiente
2. Verifica que completaste módulos previos
3. Consulta 00-GUIA-PARA-AGENTE-IA.md
4. Revisa checklist de verificación

---

**Última actualización:** 21 Enero 2026
**Versión:** 1.0.0
