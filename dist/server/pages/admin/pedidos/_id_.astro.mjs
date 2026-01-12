import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_CzmOs1nM.mjs';
import { s as supabase } from '../../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: order, error } = await supabase.from("orders").select(
    `
    *,
    items:order_items(
      id,
      quantity,
      price_at_purchase,
      product:products(id, name, slug),
      variant:product_variants(id, size)
    )
  `
  ).eq("id", id).single();
  if (error || !order) {
    return Astro2.redirect("/admin/pedidos?error=not-found");
  }
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
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
  const statuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Pedido #${order.id.slice(0, 8)}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <a href="/admin/pedidos" class="p-2 hover:bg-muted rounded-lg transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="font-display text-2xl text-primary">
Pedido #${order.id.slice(0, 8)} </h1> <p class="text-muted-foreground">${formatDate(order.created_at)}</p> </div> </div> <span${addAttribute(`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[order.status]}`, "class")}> ${statusLabels[order.status]} </span> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"> <!-- Order Details --> <div class="lg:col-span-2 space-y-6"> <!-- Items --> <div class="glass border border-border rounded-xl"> <div class="p-6 border-b border-border"> <h2 class="font-heading text-lg">
Productos (${order.items?.length || 0})
</h2> </div> <div class="divide-y divide-border"> ${order.items?.map((item) => renderTemplate`<div class="flex items-center gap-4 p-4"> <div class="flex-1"> <p class="font-medium"> ${item.product?.name || "Producto eliminado"} </p> <p class="text-sm text-muted-foreground">
Talla: ${item.variant?.size || "N/A"} · Cantidad:${" "} ${item.quantity} </p> </div> <p class="font-medium"> ${formatPrice(item.price_at_purchase * item.quantity)} </p> </div>`)} </div> <div class="p-6 border-t border-border flex justify-between items-center"> <span class="font-heading">Total</span> <span class="text-2xl font-bold text-primary">${formatPrice(order.total_amount)}</span> </div> </div> <!-- Customer Info --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Datos del Cliente</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm text-muted-foreground">Nombre</label> <p class="font-medium">${order.customer_name}</p> </div> <div> <label class="block text-sm text-muted-foreground">Email</label> <p class="font-medium">${order.customer_email}</p> </div> ${order.customer_phone && renderTemplate`<div> <label class="block text-sm text-muted-foreground">
Teléfono
</label> <p class="font-medium">${order.customer_phone}</p> </div>`} </div> </div> <!-- Shipping Address --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Dirección de Envío</h2> <div class="space-y-1"> <p class="font-medium">${order.customer_name}</p> <p class="text-muted-foreground">${order.shipping_address}</p> <p class="text-muted-foreground"> ${order.shipping_postal_code} ${order.shipping_city} </p> <p class="text-muted-foreground">${order.shipping_country}</p> </div> </div> </div> <!-- Sidebar --> <div class="space-y-6"> <!-- Status Update --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Cambiar Estado</h2> <select id="status-select" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"${addAttribute(order.id, "data-order-id")}> ${statuses.map((status) => renderTemplate`<option${addAttribute(status, "value")}${addAttribute(status === order.status, "selected")}> ${statusLabels[status]} </option>`)} </select> <button id="update-status" class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors">
Actualizar Estado
</button> <div id="status-message" class="hidden p-3 rounded-lg text-sm"></div> </div> <!-- Quick Info --> <div class="glass border border-border rounded-xl p-6 space-y-3"> <h2 class="font-heading text-lg">Información</h2> <div class="flex justify-between text-sm"> <span class="text-muted-foreground">ID Pedido</span> <span class="font-mono">${order.id.slice(0, 8)}</span> </div> ${order.stripe_session_id && renderTemplate`<div class="flex justify-between text-sm"> <span class="text-muted-foreground">Stripe Session</span> <span class="font-mono truncate max-w-[120px]"${addAttribute(order.stripe_session_id, "title")}> ${order.stripe_session_id.slice(0, 16)}...
</span> </div>`} <div class="flex justify-between text-sm"> <span class="text-muted-foreground">Fecha</span> <span>${formatDate(order.created_at)}</span> </div> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/[id].astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/[id].astro";
const $$url = "/admin/pedidos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
