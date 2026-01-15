import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_R9f8eZyp.mjs';
import { c as createAuthenticatedClient } from '../chunks/supabase_COljrJv9.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  const authClient = createAuthenticatedClient(accessToken, refreshToken);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const { count: ordersToday } = await authClient.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString());
  const { count: ordersYesterday } = await authClient.from("orders").select("*", { count: "exact", head: true }).gte("created_at", yesterday.toISOString()).lt("created_at", today.toISOString());
  const { data: revenueData } = await authClient.from("orders").select("total_amount").in("status", ["paid", "shipped", "delivered"]);
  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const { data: lowStockVariants } = await authClient.from("product_variants").select(
    `
    id,
    size,
    stock,
    product:products(id, name)
  `
  ).lt("stock", 5).order("stock", { ascending: true }).limit(8);
  const { data: recentOrders } = await authClient.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
  const { count: productsCount } = await authClient.from("products").select("*", { count: "exact", head: true });
  const { count: categoriesCount } = await authClient.from("categories").select("*", { count: "exact", head: true });
  const { count: subscribersCount } = await authClient.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("active", true);
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
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const statusConfig = {
    pending: { label: "Pendiente", class: "badge-warning" },
    paid: { label: "Pagado", class: "badge-success" },
    shipped: { label: "Enviado", class: "badge-info" },
    delivered: { label: "Entregado", class: "badge-success" },
    cancelled: { label: "Cancelado", class: "badge-danger" }
  };
  const ordersTrend = (ordersToday || 0) - (ordersYesterday || 0);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <!-- Stats Grid --> <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"> <!-- Orders Today --> <div class="stat-card group"> <div> <p class="stat-label">Pedidos Hoy</p> <p class="stat-value text-foreground">${ordersToday || 0}</p> ${ordersTrend !== 0 && renderTemplate`<p${addAttribute(`text-xs mt-1 flex items-center gap-1 ${ordersTrend > 0 ? "text-green-400" : "text-red-400"}`, "class")}> ${ordersTrend > 0 ? renderTemplate`<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path> </svg>` : renderTemplate`<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path> </svg>`} ${Math.abs(ordersTrend)} vs ayer
</p>`} </div> <div class="stat-icon bg-primary/10 group-hover:bg-primary/20 transition-colors"> <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> </div> </div> <!-- Total Revenue --> <div class="stat-card group"> <div> <p class="stat-label">Ingresos Totales</p> <p class="stat-value text-green-600 dark:text-green-400"> ${formatPrice(totalRevenue)} </p> <p class="text-xs text-muted-foreground mt-1"> ${revenueData?.length || 0} pedidos pagados
</p> </div> <div class="stat-icon bg-green-500/10 group-hover:bg-green-500/20 transition-colors"> <svg class="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> </div> <!-- Total Products --> <div class="stat-card group"> <div> <p class="stat-label">Productos</p> <p class="stat-value text-blue-600 dark:text-blue-400"> ${productsCount || 0} </p> <p class="text-xs text-muted-foreground mt-1">en catálogo</p> </div> <div class="stat-icon bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"> <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> </div> <!-- Categories --> <div class="stat-card group"> <div> <p class="stat-label">Categorías</p> <p class="stat-value text-purple-600 dark:text-purple-400"> ${categoriesCount || 0} </p> <p class="text-xs text-muted-foreground mt-1">activas</p> </div> <div class="stat-icon bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"> <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> </div> </div> <!-- Newsletter Subscribers --> <div class="stat-card group"> <div> <p class="stat-label">Suscriptores</p> <p class="stat-value text-amber-600 dark:text-amber-400"> ${subscribersCount || 0} </p> <p class="text-xs text-muted-foreground mt-1">newsletter</p> </div> <div class="stat-icon bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors"> <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> </div> </div> <!-- Two Column Layout --> <div class="grid grid-cols-1 xl:grid-cols-2 gap-6"> <!-- Recent Orders --> <div class="admin-card"> <div class="flex items-center justify-between mb-6"> <h2 class="font-heading text-lg text-foreground">
Pedidos Recientes
</h2> <a href="/admin/pedidos" class="text-sm text-primary hover:underline flex items-center gap-1">
Ver todos
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> ${recentOrders && recentOrders.length > 0 ? renderTemplate`<div class="overflow-x-auto -mx-6"> <table class="admin-table"> <thead> <tr> <th>Cliente</th> <th>Total</th> <th>Estado</th> <th class="text-right">Fecha</th> </tr> </thead> <tbody> ${recentOrders.map((order) => renderTemplate`<tr> <td> <a${addAttribute(`/admin/pedidos/${order.id}`, "href")} class="font-medium hover:text-primary transition-colors"> ${order.customer_name} </a> </td> <td class="tabular-nums font-medium"> ${formatPrice(order.total_amount)} </td> <td> <span${addAttribute(`badge ${statusConfig[order.status]?.class || "badge-muted"}`, "class")}> ${statusConfig[order.status]?.label || order.status} </span> </td> <td class="text-right text-muted-foreground text-sm"> ${formatDate(order.created_at)} </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<div class="text-center py-8 text-muted-foreground"> <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> <p>No hay pedidos todavía</p> </div>`} </div> <!-- Low Stock Alert --> <div class="admin-card"> <div class="flex items-center justify-between mb-6"> <div class="flex items-center gap-3"> <h2 class="font-heading text-lg text-foreground">Stock Bajo</h2> ${lowStockVariants && lowStockVariants.length > 0 && renderTemplate`<span class="badge badge-danger"> ${lowStockVariants.length} </span>`} </div> <a href="/admin/productos?status=low-stock" class="text-sm text-primary hover:underline flex items-center gap-1">
Gestionar
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> ${lowStockVariants && lowStockVariants.length > 0 ? renderTemplate`<div class="space-y-3"> ${lowStockVariants.map((variant) => renderTemplate`<div class="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"> <div> <p class="font-medium text-foreground"> ${variant.product?.name} </p> <p class="text-sm text-muted-foreground">
Talla: ${variant.size} </p> </div> <div class="flex items-center gap-3"> <span${addAttribute(`badge ${variant.stock === 0 ? "badge-danger" : "badge-warning"}`, "class")}> ${variant.stock === 0 ? "Sin stock" : `${variant.stock} uds`} </span> <a${addAttribute(`/admin/productos/${variant.product?.id}`, "href")} class="admin-btn-icon" title="Editar"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> </a> </div> </div>`)} </div>` : renderTemplate`<div class="text-center py-8 text-muted-foreground"> <svg class="w-12 h-12 mx-auto mb-3 text-green-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <p>Todo el stock está bien</p> </div>`} </div> </div> <!-- Quick Actions --> <div class="admin-card"> <h2 class="font-heading text-lg text-foreground mb-6">
Acciones Rápidas
</h2> <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"> <a href="/admin/productos/nuevo" class="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"> <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform"> <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg> </div> <span class="text-sm font-medium">Nuevo Producto</span> </a> <a href="/admin/categorias" class="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"> <div class="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"> <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> </div> <span class="text-sm font-medium">Categorías</span> </a> <a href="/admin/pedidos" class="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"> <div class="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"> <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> </div> <span class="text-sm font-medium">Ver Pedidos</span> </a> <a href="/admin/configuracion" class="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all group"> <div class="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"> <svg class="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> </div> <span class="text-sm font-medium">Configuración</span> </a> <a href="/admin/newsletter" class="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"> <div class="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"> <svg class="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> <span class="text-sm font-medium">Newsletter</span> </a> </div> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
