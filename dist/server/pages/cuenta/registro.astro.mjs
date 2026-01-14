import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_BtMQN1yW.mjs';
import { A as AuthForm } from '../../chunks/AuthForm_g5xO-x88.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const $$Registro = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Crear Cuenta - FashionStore", "data-astro-cid-7pq2mbug": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 py-12" data-astro-cid-7pq2mbug> <div class="w-full max-w-md" data-astro-cid-7pq2mbug> <!-- Header --> <div class="text-center mb-8" data-astro-cid-7pq2mbug> <h1 class="font-display text-4xl text-primary mb-2" data-astro-cid-7pq2mbug>ÚNETE</h1> <p class="text-muted-foreground" data-astro-cid-7pq2mbug>Crea tu cuenta en segundos</p> </div> <!-- Register Card --> <div class="glass border border-border rounded-2xl p-8 animate-fade-in" data-astro-cid-7pq2mbug> ${renderComponent($$result2, "AuthForm", AuthForm, { "client:load": true, "mode": "register", "redirectTo": "/cuenta", "client:component-hydration": "load", "client:component-path": "@/components/islands/AuthForm", "client:component-export": "default", "data-astro-cid-7pq2mbug": true })} <!-- Divider --> <div class="flex items-center gap-4 my-6" data-astro-cid-7pq2mbug> <div class="flex-1 h-px bg-border" data-astro-cid-7pq2mbug></div> <span class="text-sm text-muted-foreground" data-astro-cid-7pq2mbug>o</span> <div class="flex-1 h-px bg-border" data-astro-cid-7pq2mbug></div> </div> <!-- Login link --> <p class="text-center text-muted-foreground" data-astro-cid-7pq2mbug>
¿Ya tienes cuenta?${" "} <a href="/cuenta/login" class="text-primary hover:underline font-medium" data-astro-cid-7pq2mbug>
Inicia sesión
</a> </p> </div> <!-- Trust badges --> <div class="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground" data-astro-cid-7pq2mbug> <div class="flex items-center gap-2" data-astro-cid-7pq2mbug> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-7pq2mbug> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-astro-cid-7pq2mbug></path> </svg>
Datos seguros
</div> <div class="flex items-center gap-2" data-astro-cid-7pq2mbug> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-7pq2mbug> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" data-astro-cid-7pq2mbug></path> </svg>
100% Gratis
</div> <div class="flex items-center gap-2" data-astro-cid-7pq2mbug> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-7pq2mbug> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-astro-cid-7pq2mbug></path> </svg>
Sin spam
</div> </div> </div> </div> ` })} `;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/registro.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/registro.astro";
const $$url = "/cuenta/registro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Registro,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
