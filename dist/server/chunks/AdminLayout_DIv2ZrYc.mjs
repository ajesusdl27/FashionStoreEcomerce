import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, o as renderSlot } from './astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_CtbhpC8N.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title } = Astro2.props;
  const user = Astro2.locals.user;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Admin - ${title}` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex min-h-screen"> <!-- Sidebar --> <aside class="hidden lg:flex flex-col w-64 bg-card border-r border-border"> <div class="p-6 border-b border-border"> <a href="/admin" class="font-display text-xl text-primary">
FASHIONSTORE
</a> <p class="text-xs text-muted-foreground mt-1">
Panel de Administración
</p> </div> <nav class="flex-1 p-4 space-y-1"> <a href="/admin" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg>
Dashboard
</a> <a href="/admin/productos" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg>
Productos
</a> <a href="/admin/categorias" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg>
Categorías
</a> <a href="/admin/pedidos" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path> </svg>
Pedidos
</a> <a href="/admin/configuracion" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg>
Configuración
</a> </nav> <div class="p-4 border-t border-border"> <div class="flex items-center gap-3 px-4 py-2"> <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"> <span class="text-primary text-sm font-bold"> ${user?.email?.charAt(0).toUpperCase() || "A"} </span> </div> <div class="flex-1 min-w-0"> <p class="text-sm font-medium truncate">${user?.email || "Admin"}</p> </div> </div> <form action="/api/auth/logout" method="POST" class="mt-2"> <button type="submit" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg>
Cerrar sesión
</button> </form> </div> </aside> <!-- Main Content --> <div class="flex-1 flex flex-col"> <!-- Top Bar (Mobile) --> <header class="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3"> <div class="flex items-center justify-between"> <button id="admin-menu-btn" class="touch-target" aria-label="Abrir menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <span class="font-display text-lg text-primary">ADMIN</span> <div class="w-10"></div> </div> </header> <!-- Page Content --> <main class="flex-1 p-6"> ${renderSlot($$result2, $$slots["default"])} </main> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
