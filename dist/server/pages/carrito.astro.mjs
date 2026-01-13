import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_BHSFkYSe.mjs';
import { $ as $$Button } from '../chunks/Button_CqeZ6wvD.mjs';
export { renderers } from '../renderers.mjs';

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
