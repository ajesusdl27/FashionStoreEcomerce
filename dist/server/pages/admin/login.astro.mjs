import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CllknO1K.mjs';
import { A as AuthForm } from '../../chunks/AuthForm_g5xO-x88.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const errorParam = Astro2.url.searchParams.get("error");
  const redirectParam = Astro2.url.searchParams.get("redirect");
  let errorMessage = "";
  if (errorParam === "unauthorized") {
    errorMessage = "No tienes permisos para acceder a esta secci\xF3n.";
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Admin Login - FashionStore", "data-astro-cid-rf56lckb": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 py-12" data-astro-cid-rf56lckb> <div class="w-full max-w-md" data-astro-cid-rf56lckb> <!-- Logo --> <div class="text-center mb-8" data-astro-cid-rf56lckb> <a href="/" class="inline-block" data-astro-cid-rf56lckb> <span class="font-display text-4xl text-primary" data-astro-cid-rf56lckb>FASHIONSTORE</span> </a> <p class="mt-2 text-muted-foreground" data-astro-cid-rf56lckb>Panel de Administración</p> </div> <!-- Login Card --> <div class="glass border border-border rounded-2xl p-8 animate-fade-in" data-astro-cid-rf56lckb> <h1 class="font-heading text-2xl text-center mb-6" data-astro-cid-rf56lckb>Iniciar Sesión</h1> ${errorMessage && renderTemplate`<div class="mb-6 p-4 bg-accent/10 border border-accent/50 rounded-lg text-accent text-sm animate-shake" data-astro-cid-rf56lckb> ${errorMessage} </div>`} ${renderComponent($$result2, "AuthForm", AuthForm, { "client:load": true, "mode": "admin-login", "redirectTo": redirectParam || "/admin", "client:component-hydration": "load", "client:component-path": "@/components/islands/AuthForm", "client:component-export": "default", "data-astro-cid-rf56lckb": true })} </div> <!-- Back to store link --> <p class="text-center mt-8 text-muted-foreground text-sm" data-astro-cid-rf56lckb> <a href="/" class="hover:text-primary transition-colors" data-astro-cid-rf56lckb>
← Volver a la tienda
</a> </p> </div> </div> ` })} `;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/login.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
