import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C7xUQmWa.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const { data: orders, count } = await supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  const totalPages = count ? Math.ceil(count / limit) : 0;
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    paid: "bg-primary/20 text-primary border-primary/50",
    shipped: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    delivered: "bg-green-500/20 text-green-400 border-green-500/50",
    cancelled: "bg-accent/20 text-accent border-accent/50"
  };
  const statusLabels = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado"
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Pedidos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div> <h1 class="font-display text-3xl text-primary">Pedidos</h1> <p class="text-muted-foreground mt-1">${count || 0} pedidos en total</p> </div> </div> <!-- Orders Table --> <div class="glass border border-border rounded-xl overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full"> <thead class="bg-muted/50 border-b border-border"> <tr> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Pedido</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Cliente</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Fecha</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Estado</th> <th class="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acciones</th> </tr> </thead> <tbody class="divide-y divide-border"> ${orders && orders.length > 0 ? orders.map((order) => renderTemplate`<tr class="hover:bg-muted/30 transition-colors"> <td class="px-6 py-4"> <span class="font-mono text-sm">
#${order.id.slice(0, 8)} </span> </td> <td class="px-6 py-4"> <div> <p class="font-medium">${order.customer_name}</p> <p class="text-sm text-muted-foreground"> ${order.customer_email} </p> </div> </td> <td class="px-6 py-4 text-sm text-muted-foreground"> ${formatDate(order.created_at)} </td> <td class="px-6 py-4 font-medium"> ${formatPrice(order.total_amount)} </td> <td class="px-6 py-4"> <span${addAttribute(`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`, "class")}> ${statusLabels[order.status]} </span> </td> <td class="px-6 py-4 text-right"> <a${addAttribute(`/admin/pedidos/${order.id}`, "href")} class="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
Ver detalles
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </td> </tr>`) : renderTemplate`<tr> <td colspan="6" class="px-6 py-12 text-center text-muted-foreground"> <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> <p>No hay pedidos todavía</p> </td> </tr>`} </tbody> </table> </div>  ${totalPages > 1 && renderTemplate`<div class="flex items-center justify-between px-6 py-4 border-t border-border"> <p class="text-sm text-muted-foreground">
Página ${page} de ${totalPages} </p> <div class="flex gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/admin/pedidos?page=${page - 1}`, "href")} class="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
Anterior
</a>`} ${page < totalPages && renderTemplate`<a${addAttribute(`/admin/pedidos?page=${page + 1}`, "href")} class="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
Siguiente
</a>`} </div> </div>`} </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/index.astro";
const $$url = "/admin/pedidos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
