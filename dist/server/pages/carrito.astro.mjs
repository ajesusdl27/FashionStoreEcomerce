import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, l as renderSlot, r as renderTemplate, k as renderComponent, n as renderScript } from '../chunks/astro/server_D_npfa5M.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_ZFYqZT-M.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    variant = "primary",
    size = "md",
    class: className = "",
    href,
    disabled = false,
    loading = false,
    type = "button"
  } = Astro2.props;
  const baseStyles = `
  inline-flex items-center justify-center font-heading tracking-wider
  transition-all duration-base touch-target
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
  disabled:opacity-50 disabled:cursor-not-allowed
`;
  const variants = {
    primary: `
    bg-primary text-primary-foreground 
    hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-[1.02]
    active:scale-[0.98]
  `,
    secondary: `
    bg-card text-foreground border border-border
    hover:bg-muted hover:border-primary/50
    active:scale-[0.98]
  `,
    ghost: `
    bg-transparent text-foreground
    hover:bg-muted hover:text-primary
    active:scale-[0.98]
  `,
    danger: `
    bg-accent text-accent-foreground
    hover:shadow-[0_0_20px_rgba(255,71,87,0.4)] hover:scale-[1.02]
    active:scale-[0.98]
  `
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  const classes = [baseStyles, variants[variant], sizes[size], className].join(
    " "
  );
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(classes, "class")}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(type, "type")}${addAttribute(classes, "class")}${addAttribute(disabled || loading, "disabled")}>${loading ? renderTemplate`<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${renderSlot($$result, $$slots["default"])}</span>` : renderTemplate`${renderSlot($$result, $$slots["default"])}`}</button>`}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/ui/Button.astro", void 0);

const $$Carrito = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Carrito de Compra" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Header --> <h1 class="font-display text-4xl md:text-5xl mb-8">Tu Carrito</h1> <div class="lg:grid lg:grid-cols-3 lg:gap-12"> <!-- Cart Items --> <div class="lg:col-span-2 mb-8 lg:mb-0"> <div id="cart-items" class="space-y-4"> <!-- Items will be rendered by JavaScript --> </div> <div id="cart-empty" class="hidden text-center py-12 border border-dashed border-border rounded-lg"> <svg class="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> <p class="text-muted-foreground mb-4">Tu carrito está vacío</p> <a href="/productos" class="text-primary hover:underline">Ver productos</a> </div> </div> <!-- Order Summary --> <div class="lg:col-span-1"> <div class="bg-card border border-border rounded-lg p-6 sticky top-24"> <h2 class="font-heading text-xl font-semibold mb-6">
Resumen del Pedido
</h2> <!-- Free Shipping Progress --> <div id="shipping-progress" class="mb-6"> <p id="shipping-message" class="text-sm text-muted-foreground mb-2"></p> <div class="h-2 bg-muted rounded-full overflow-hidden"> <div id="shipping-bar" class="h-full bg-primary transition-all duration-500" style="width: 0%"></div> </div> </div> <div class="space-y-3 text-sm mb-6"> <div class="flex justify-between"> <span class="text-muted-foreground">Subtotal</span> <span id="subtotal">0,00 €</span> </div> <div class="flex justify-between"> <span class="text-muted-foreground">Envío</span> <span id="shipping">4,99 €</span> </div> <div class="border-t border-border pt-3 flex justify-between font-bold text-lg"> <span>Total</span> <span id="total">0,00 €</span> </div> </div> ${renderComponent($$result2, "Button", $$Button, { "href": "/checkout", "variant": "primary", "size": "lg", "class": "w-full mb-3" }, { "default": ($$result3) => renderTemplate`
FINALIZAR COMPRA
` })} <a href="/productos" class="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
Continuar comprando
</a> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/carrito.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/carrito.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/carrito.astro";
const $$url = "/carrito";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Carrito,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
