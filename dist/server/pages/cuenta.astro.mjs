import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_Dv6-er14.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/cuenta/login");
  }
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Mi Cuenta - FashionStore" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-12"> <!-- Header --> <div class="mb-8"> <h1 class="font-display text-4xl text-primary mb-2">MI CUENTA</h1> <p class="text-muted-foreground">Hola, ${displayName} 👋</p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <!-- Main Content --> <div class="lg:col-span-2 space-y-6"> <!-- Account Info Card --> <div class="glass border border-border rounded-2xl p-6"> <h2 class="font-heading text-xl mb-4 flex items-center gap-2"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg>
Información de la Cuenta
</h2> <div class="space-y-4"> <div> <label class="block text-sm text-muted-foreground mb-1">Email</label> <p class="text-foreground">${user.email}</p> </div> ${user.user_metadata?.full_name && renderTemplate`<div> <label class="block text-sm text-muted-foreground mb-1">
Nombre
</label> <p class="text-foreground">${user.user_metadata.full_name}</p> </div>`} <div> <label class="block text-sm text-muted-foreground mb-1">
Miembro desde
</label> <p class="text-foreground"> ${new Date(user.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </p> </div> </div> </div> <!-- Recent Orders Card (placeholder) --> <div class="glass border border-border rounded-2xl p-6"> <h2 class="font-heading text-xl mb-4 flex items-center gap-2"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg>
Últimos Pedidos
</h2> <div class="text-center py-8 text-muted-foreground"> <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> <p>No tienes pedidos todavía</p> <a href="/productos" class="inline-block mt-4 text-primary hover:underline">
Explorar productos →
</a> </div> </div> </div> <!-- Sidebar --> <div class="space-y-6"> <!-- Quick Actions --> <div class="glass border border-border rounded-2xl p-6"> <h3 class="font-heading text-lg mb-4">Acciones Rápidas</h3> <nav class="space-y-2"> <a href="/cuenta/perfil" class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg>
Editar perfil
</a> <a href="/cuenta/pedidos" class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg>
Ver todos los pedidos
</a> <a href="/productos" class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg>
Explorar tienda
</a> </nav> </div> <!-- Logout --> <form action="/api/auth/logout" method="POST"> <button type="submit" class="w-full flex items-center justify-center gap-2 px-6 py-3
              bg-card border border-border rounded-lg
              text-muted-foreground hover:text-accent hover:border-accent/50
              transition-all duration-300"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg>
Cerrar sesión
</button> </form> </div> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/index.astro";
const $$url = "/cuenta";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
