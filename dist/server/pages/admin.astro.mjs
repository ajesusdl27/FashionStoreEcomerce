import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_C7xUQmWa.mjs';
import { s as supabase } from '../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const { count: ordersToday } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString());
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { data: revenueData } = await supabase.from("orders").select("total_amount").eq("status", "paid");
  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const { data: lowStockVariants } = await supabase.from("product_variants").select(
    `
    id,
    size,
    stock,
    product:products(id, name)
  `
  ).lt("stock", 5).order("stock", { ascending: true }).limit(10);
  const { data: recentOrders } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true });
  const { count: categoriesCount } = await supabase.from("categories").select("*", { count: "exact", head: true });
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
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    paid: "bg-primary/20 text-primary",
    shipped: "bg-blue-500/20 text-blue-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-accent/20 text-accent"
  };
  const statusLabels = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado"
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <!-- Header --> <div> <h1 class="font-display text-3xl text-primary">Dashboard</h1> <p class="text-muted-foreground mt-1">Resumen de tu tienda</p> </div> <!-- Stats Grid --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> <!-- Orders Today --> <div class="glass border border-border rounded-xl p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-muted-foreground">Pedidos Hoy</p> <p class="text-3xl font-bold mt-1">${ordersToday || 0}</p> </div> <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"> <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> </div> </div> </div> <!-- Total Revenue --> <div class="glass border border-border rounded-xl p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-muted-foreground">Ingresos Totales</p> <p class="text-3xl font-bold mt-1">${formatPrice(totalRevenue)}</p> </div> <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"> <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> </div> </div> <!-- Total Products --> <div class="glass border border-border rounded-xl p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-muted-foreground">Productos</p> <p class="text-3xl font-bold mt-1">${productsCount || 0}</p> </div> <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center"> <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> </div> </div> <!-- Categories --> <div class="glass border border-border rounded-xl p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-muted-foreground">Categorías</p> <p class="text-3xl font-bold mt-1">${categoriesCount || 0}</p> </div> <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center"> <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> </div> </div> </div> </div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <!-- Recent Orders --> <div class="glass border border-border rounded-xl"> <div class="p-6 border-b border-border flex items-center justify-between"> <h2 class="font-heading text-lg">Pedidos Recientes</h2> <a href="/admin/pedidos" class="text-sm text-primary hover:underline">Ver todos →</a> </div> <div class="divide-y divide-border"> ${recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => renderTemplate`<a${addAttribute(`/admin/pedidos/${order.id}`, "href")} class="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"> <div> <p class="font-medium">${order.customer_name}</p> <p class="text-sm text-muted-foreground"> ${formatDate(order.created_at)} </p> </div> <div class="text-right"> <p class="font-medium">${formatPrice(order.total_amount)}</p> <span${addAttribute(`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[order.status]}`, "class")}> ${statusLabels[order.status]} </span> </div> </a>`) : renderTemplate`<div class="p-8 text-center text-muted-foreground"> <p>No hay pedidos todavía</p> </div>`} </div> </div> <!-- Low Stock Alert --> <div class="glass border border-border rounded-xl"> <div class="p-6 border-b border-border flex items-center justify-between"> <h2 class="font-heading text-lg">⚠️ Stock Bajo</h2> <a href="/admin/productos" class="text-sm text-primary hover:underline">Gestionar →</a> </div> <div class="divide-y divide-border"> ${lowStockVariants && lowStockVariants.length > 0 ? lowStockVariants.map((variant) => renderTemplate`<div class="flex items-center justify-between p-4"> <div> <p class="font-medium">${variant.product?.name}</p> <p class="text-sm text-muted-foreground">
Talla: ${variant.size} </p> </div> <span${addAttribute(`px-3 py-1 rounded-full text-sm font-medium ${variant.stock === 0 ? "bg-accent/20 text-accent" : "bg-yellow-500/20 text-yellow-400"}`, "class")}> ${variant.stock === 0 ? "Sin stock" : `${variant.stock} uds`} </span> </div>`) : renderTemplate`<div class="p-8 text-center text-muted-foreground"> <p>✅ Todo el stock está bien</p> </div>`} </div> </div> </div> <!-- Quick Actions --> <div class="glass border border-border rounded-xl p-6"> <h2 class="font-heading text-lg mb-4">Acciones Rápidas</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> <a href="/admin/productos/nuevo" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"> <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg> <span class="text-sm">Nuevo Producto</span> </a> <a href="/admin/categorias" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"> <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> <span class="text-sm">Categorías</span> </a> <a href="/admin/pedidos" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"> <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> <span class="text-sm">Ver Pedidos</span> </a> <a href="/admin/configuracion" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"> <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> <span class="text-sm">Configuración</span> </a> </div> </div> </div> ` })}`;
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
