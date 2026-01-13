import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_D2ja8uRB.mjs';
import { s as supabase } from '../../chunks/supabase_DtlKUSBa.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const statusFilter = Astro2.url.searchParams.get("status") || "";
  const limit = 20;
  const offset = (page - 1) * limit;
  let query = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  const { data: orders, count } = await query.range(offset, offset + limit - 1);
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
  const statusConfig = {
    pending: {
      label: "Pendiente",
      bgClass: "bg-yellow-500/20",
      textClass: "text-yellow-400",
      borderColor: "border-l-yellow-500"
    },
    paid: {
      label: "Pagado",
      bgClass: "bg-green-500/20",
      textClass: "text-green-400",
      borderColor: "border-l-green-500"
    },
    shipped: {
      label: "Enviado",
      bgClass: "bg-blue-500/20",
      textClass: "text-blue-400",
      borderColor: "border-l-blue-500"
    },
    delivered: {
      label: "Entregado",
      bgClass: "bg-green-500/20",
      textClass: "text-green-400",
      borderColor: "border-l-green-500"
    },
    cancelled: {
      label: "Cancelado",
      bgClass: "bg-red-500/20",
      textClass: "text-red-400",
      borderColor: "border-l-red-500"
    }
  };
  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "paid", label: "Pagado" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" }
  ];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Pedidos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> <p class="text-zinc-400">${count || 0} pedidos en total</p> <!-- Status Filter --> <select id="status-filter" class="admin-select w-48" onchange="window.location.href = this.value ? \`/admin/pedidos?status=\${this.value}\` : '/admin/pedidos'"> ${statusOptions.map((opt) => renderTemplate`<option${addAttribute(opt.value, "value")}${addAttribute(statusFilter === opt.value, "selected")}> ${opt.label} </option>`)} </select> </div> <!-- Orders List --> <div class="space-y-2"> ${orders && orders.length > 0 ? orders.map((order) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    return renderTemplate`<div${addAttribute(`bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 rounded-lg p-4 transition-all border-l-4 ${status.borderColor}`, "class")}> <div class="flex items-center gap-4">  <div class="flex-shrink-0 w-24"> <span class="font-mono text-sm text-zinc-400">
#${order.id.slice(0, 8)} </span> </div>  <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">  <div class="md:col-span-1"> <p class="font-semibold text-foreground truncate"> ${order.customer_name} </p> <p class="text-xs text-zinc-500 truncate"> ${order.customer_email} </p> </div>  <div class="text-sm text-zinc-400"> ${formatDate(order.created_at)} </div>  <div class="text-right"> <p class="font-bold tabular-nums text-foreground"> ${formatPrice(order.total_amount)} </p> </div>  <div class="flex justify-end"> <span${addAttribute(`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold ${status.bgClass} ${status.textClass}`, "class")}> ${status.label} </span> </div> </div>  <div class="flex-shrink-0"> <a${addAttribute(`/admin/pedidos/${order.id}`, "href")} class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
Ver detalles
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> </div> </div>`;
  }) : renderTemplate`<div class="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800"> <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> <p>No hay pedidos ${statusFilter ? "con este estado" : "todav\xEDa"}</p> </div>`} </div>  ${totalPages > 1 && renderTemplate`<div class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"> <p class="text-sm text-zinc-500">
Página ${page} de ${totalPages} </p> <div class="flex gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/admin/pedidos?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`, "href")} class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors">
Anterior
</a>`} ${page < totalPages && renderTemplate`<a${addAttribute(`/admin/pedidos?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`, "href")} class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors">
Siguiente
</a>`} </div> </div>`} </div> ` })}`;
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
