---
description: Development rules and guidelines for FashionStore e-commerce project
---

# FashionStore - Agent Development Rules

## 🎯 Project Context

Building a premium streetwear e-commerce with Astro 5.0, React Islands, Tailwind CSS, Supabase, and Stripe.

---

## 📁 Structure Rules

### Components Organization

- **`src/components/ui/`** → Astro components for static UI (Button, Input, Modal, Badge, Skeleton)
- **`src/components/product/`** → Product-specific Astro components
- **`src/components/islands/`** → React/TSX components that need client interactivity

### When to use Astro vs React Islands

- Use **Astro (.astro)** for: Static content, layouts, pages, server-rendered UI
- Use **React Islands (.tsx)** ONLY for: Cart interactions, forms with state, search overlay, theme toggle, anything needing `client:*` directive

### File Naming

- Astro components: `PascalCase.astro`
- React islands: `PascalCase.tsx`
- Pages: `kebab-case.astro` or `[param].astro`
- Lib files: `lowercase.ts`

---

## 🎨 Styling Rules

### Tailwind First

- Always use Tailwind classes, avoid inline styles
- Use design tokens from `tailwind.config.mjs`
- Dark mode: Use `dark:` prefix, theme is dark-first

### Brand Colors

```
--background: #0a0a0a (Negro)
--primary: #CCFF00 (Verde neón)
--accent: #FF4757 (Coral)
--electric: #3b82f6 (Azul eléctrico)
```

### Typography

- Display/Hero: `font-display` (Bebas Neue)
- Headings: `font-heading` (Oswald)
- Body: `font-body` (Space Grotesk)

### Animations

- Always add transitions to interactive elements
- Use CSS transitions (not JS) when possible
- Standard timings: 150ms (fast), 300ms (base), 500ms (slow)
- Touch targets: minimum 44x44px for mobile

---

## 🔌 Supabase Rules

### Client Usage

- Import from `@/lib/supabase.ts`
- Never expose service role key in frontend
- Use RLS policies for data access
- Use RPC functions for atomic operations (stock reservation)

### Data Fetching

- SSG pages: Fetch in frontmatter (`---` block)
- SSR pages: Fetch in frontmatter with cookies for auth
- Client-side: Use React Query or direct fetch in islands

### Auth

- Admin check: `user.user_metadata.is_admin === true`
- Customer auth: Use `supabase.auth.signUp()` from FRONTEND (React island), NOT server-side
- Middleware protects `/admin/*` and `/cuenta/*`

---

## 🛒 Cart Rules

### State Management

- Cart state in `src/stores/cart.ts` using Nano Stores
- Always persist to localStorage
- Validate stock before checkout

### Cart Operations

```typescript
// Always use these functions
addToCart(product, variant, quantity);
removeFromCart(itemId);
updateQuantity(itemId, quantity);
clearCart();
```

---

## 💳 Stripe Rules

### Checkout Flow

1. Reserve stock atomically (RPC function)
2. Create order with status "pending"
3. Create Stripe session
4. Redirect to Stripe
5. Webhook updates order to "paid"

### Webhook Security

- Always verify webhook signature
- Handle `checkout.session.completed` and `checkout.session.expired`
- Restore stock on expiration

---

## 📱 Mobile-First Rules

### Development Order

1. Design for 320px first
2. Then tablet (768px)
3. Then desktop (1024px+)

### Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Touch Targets

- All clickable elements: min 44x44px
- Buttons: Use `py-3 px-6` minimum on mobile

---

## ♿ Accessibility Rules

### Required

- Contrast ratio: 4.5:1 minimum
- Focus visible: Always visible outline on focus
- ARIA labels: On icon-only buttons
- Keyboard navigation: All interactive elements tabbable
- Alt text: All images must have alt

### Forbidden

- Never use `outline-none` without custom focus style
- Never disable zoom
- Never rely on color alone for information

---

## 🚫 Anti-Patterns (DO NOT DO)

1. **No fake countdown timers** - Use "Pocas unidades" instead
2. **No hidden shipping costs** - Show before checkout
3. **No server-side customer auth** - Cloudflare blocks it
4. **No video autoplay in hero** - Bad for LCP
5. **No inline styles** - Use Tailwind
6. **No `any` types** - Always type properly
7. **No console.log in production** - Use proper logging

---

## ✅ Code Quality

### TypeScript

- Strict mode enabled
- Define types in component or import from `@/types/*`
- No implicit any

### Imports

- Use path aliases: `@/components/*`, `@/lib/*`, `@/stores/*`
- Group imports: external → internal → relative

### Components

- Props interface at top of file
- Destructure props in frontmatter
- Keep components small and focused

---

## 🧪 Testing (Future)

### Run Before Commit

```bash
npm run build    # Verify build
npm run preview  # Manual testing
```

### Lighthouse Targets

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
