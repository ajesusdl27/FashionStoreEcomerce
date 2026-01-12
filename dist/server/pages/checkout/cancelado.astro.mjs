import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_CVZpYtDs.mjs';
import { $ as $$Button } from '../../chunks/Button_CFNw3Rqw.mjs';
export { renderers } from '../../renderers.mjs';

const $$Cancelado = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Pago Cancelado - FashionStore" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-12"> <div class="max-w-xl mx-auto text-center"> <!-- Cancel Icon --> <div class="w-24 h-24 mx-auto mb-8 bg-accent/20 rounded-full flex items-center justify-center"> <svg class="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </div> <h1 class="font-display text-4xl md:text-5xl mb-4">Pago cancelado</h1> <p class="text-xl text-muted-foreground mb-8">
No te preocupes, tu carrito sigue intacto. Puedes volver a intentarlo
        cuando quieras.
</p> <div class="bg-card border border-border rounded-xl p-6 mb-8"> <h2 class="font-heading font-semibold mb-4">¿Necesitas ayuda?</h2> <p class="text-muted-foreground text-sm mb-4">
Si has tenido algún problema con el pago o tienes dudas, no dudes en
          contactarnos.
</p> <ul class="text-sm text-muted-foreground space-y-2"> <li class="flex items-center gap-2"> <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
soporte@fashionstore.com
</li> <li class="flex items-center gap-2"> <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg>
(+34) 912 345 678
</li> </ul> </div> <div class="flex flex-col sm:flex-row gap-4 justify-center"> ${renderComponent($$result2, "Button", $$Button, { "href": "/carrito", "variant": "primary", "size": "lg" }, { "default": ($$result3) => renderTemplate`
Volver al carrito
` })} ${renderComponent($$result2, "Button", $$Button, { "href": "/productos", "variant": "secondary", "size": "lg" }, { "default": ($$result3) => renderTemplate`
Seguir comprando
` })} </div> <!-- Stock reservation notice --> <p class="text-xs text-muted-foreground mt-8">
💡 Los productos permanecen reservados durante 15 minutos. Después de
        ese tiempo, volverán a estar disponibles.
</p> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout/cancelado.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout/cancelado.astro";
const $$url = "/checkout/cancelado";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cancelado,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
