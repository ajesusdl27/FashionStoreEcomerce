import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_DhyhF04e.mjs';
import { A as AuthForm } from '../../chunks/AuthForm_g5xO-x88.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const redirectParam = Astro2.url.searchParams.get("redirect");
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Iniciar Sesi\xF3n - FashionStore", "data-astro-cid-xg6r5bxi": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 py-12" data-astro-cid-xg6r5bxi> <div class="w-full max-w-md" data-astro-cid-xg6r5bxi> <!-- Header --> <div class="text-center mb-8" data-astro-cid-xg6r5bxi> <h1 class="font-display text-4xl text-primary mb-2" data-astro-cid-xg6r5bxi>BIENVENIDO</h1> <p class="text-muted-foreground" data-astro-cid-xg6r5bxi>Inicia sesión en tu cuenta</p> </div> <!-- Login Card --> <div class="glass border border-border rounded-2xl p-8 animate-fade-in" data-astro-cid-xg6r5bxi> ${renderComponent($$result2, "AuthForm", AuthForm, { "client:load": true, "mode": "login", "redirectTo": redirectParam || "/cuenta", "client:component-hydration": "load", "client:component-path": "@/components/islands/AuthForm", "client:component-export": "default", "data-astro-cid-xg6r5bxi": true })} <!-- Forgot Password Link --> <div class="text-center mt-4" data-astro-cid-xg6r5bxi> <a href="/cuenta/recuperar-password" class="text-sm text-muted-foreground hover:text-primary transition-colors" data-astro-cid-xg6r5bxi>
¿Olvidaste tu contraseña?
</a> </div> <!-- Divider --> <div class="flex items-center gap-4 my-6" data-astro-cid-xg6r5bxi> <div class="flex-1 h-px bg-border" data-astro-cid-xg6r5bxi></div> <span class="text-sm text-muted-foreground" data-astro-cid-xg6r5bxi>o</span> <div class="flex-1 h-px bg-border" data-astro-cid-xg6r5bxi></div> </div> <!-- Register link --> <p class="text-center text-muted-foreground" data-astro-cid-xg6r5bxi>
¿No tienes cuenta?${" "} <a href="/cuenta/registro" class="text-primary hover:underline font-medium" data-astro-cid-xg6r5bxi>
Regístrate gratis
</a> </p> </div> <!-- Benefits --> <div class="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground" data-astro-cid-xg6r5bxi> <div class="flex items-center gap-2" data-astro-cid-xg6r5bxi> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-xg6r5bxi> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-xg6r5bxi></path> </svg>
Historial de pedidos
</div> <div class="flex items-center gap-2" data-astro-cid-xg6r5bxi> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-xg6r5bxi> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-xg6r5bxi></path> </svg>
Ofertas exclusivas
</div> <div class="flex items-center gap-2" data-astro-cid-xg6r5bxi> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-xg6r5bxi> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-xg6r5bxi></path> </svg>
Checkout rápido
</div> <div class="flex items-center gap-2" data-astro-cid-xg6r5bxi> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-xg6r5bxi> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-xg6r5bxi></path> </svg>
Seguimiento envío
</div> </div> </div> </div> ` })} `;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/login.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/login.astro";
const $$url = "/cuenta/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
