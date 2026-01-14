import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_dMhfTFqq.mjs';
import { s as supabase } from '../../../chunks/supabase_COljrJv9.mjs';
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
  let shipmentData = null;
  if (order.status === "shipped" || order.status === "delivered") {
    const { data: shipment } = await supabase.from("order_shipments").select("*").eq("order_id", id).single();
    shipmentData = shipment;
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
  const statusConfig = {
    pending: {
      label: "Pendiente",
      bgClass: "bg-yellow-500/20",
      textClass: "text-yellow-400"
    },
    paid: {
      label: "Pagado",
      bgClass: "bg-green-500/20",
      textClass: "text-green-400"
    },
    shipped: {
      label: "Enviado",
      bgClass: "bg-blue-500/20",
      textClass: "text-blue-400"
    },
    delivered: {
      label: "Entregado",
      bgClass: "bg-green-500/20",
      textClass: "text-green-400"
    },
    cancelled: {
      label: "Cancelado",
      bgClass: "bg-red-500/20",
      textClass: "text-red-400"
    }
  };
  const statuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const isAlreadyShipped = order.status === "shipped" || order.status === "delivered";
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Pedido #${order.id.slice(0, 8)}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <a href="/admin/pedidos" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="text-2xl font-bold text-foreground">
Pedido #${order.id.slice(0, 8)} </h1> <p class="text-zinc-500">${formatDate(order.created_at)}</p> </div> </div> <span${addAttribute(`px-4 py-2 rounded-lg text-sm font-semibold ${currentStatus.bgClass} ${currentStatus.textClass}`, "class")}> ${currentStatus.label} </span> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"> <!-- Order Details --> <div class="lg:col-span-2 space-y-6"> <!-- Items --> <div class="admin-card p-0"> <div class="p-5 border-b border-zinc-800"> <h2 class="font-semibold text-lg">
Productos (${order.items?.length || 0})
</h2> </div> <div class="divide-y divide-zinc-800"> ${order.items?.map((item) => renderTemplate`<div class="flex items-center gap-4 p-5"> <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0"> <svg class="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> <div class="flex-1 min-w-0"> <p class="font-medium text-foreground"> ${item.product?.name || "Producto eliminado"} </p> <p class="text-sm text-zinc-500">
Talla: ${item.variant?.size || "N/A"} · Cantidad:${" "} ${item.quantity} </p> </div> <p class="font-bold tabular-nums text-foreground"> ${formatPrice(item.price_at_purchase * item.quantity)} </p> </div>`)} </div> <div class="p-5 border-t border-zinc-800 flex justify-between items-center bg-zinc-800/30"> <span class="font-semibold">Total</span> <span class="text-2xl font-bold text-primary"> ${formatPrice(order.total_amount)} </span> </div> </div> <!-- Customer Info --> <div class="admin-card"> <h2 class="font-semibold text-lg mb-4">Datos del Cliente</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm text-zinc-500 mb-1">Nombre</label> <p class="font-medium text-foreground">${order.customer_name}</p> </div> <div> <label class="block text-sm text-zinc-500 mb-1">Email</label> <p class="font-medium text-foreground">${order.customer_email}</p> </div> ${order.customer_phone && renderTemplate`<div> <label class="block text-sm text-zinc-500 mb-1">
Teléfono
</label> <p class="font-medium text-foreground"> ${order.customer_phone} </p> </div>`} </div> </div> <!-- Shipping Address --> <div class="admin-card"> <h2 class="font-semibold text-lg mb-4">Dirección de Envío</h2> <div class="space-y-1"> <p class="font-medium text-foreground">${order.customer_name}</p> <p class="text-zinc-400">${order.shipping_address}</p> <p class="text-zinc-400"> ${order.shipping_postal_code} ${order.shipping_city} </p> <p class="text-zinc-400">${order.shipping_country}</p> </div> </div> </div> <!-- Sidebar --> <div class="space-y-6"> <!-- Status Update --> <div class="admin-card"> <h2 class="font-semibold text-lg mb-4">Cambiar Estado</h2> <select id="status-select" class="admin-select w-full mb-3"${addAttribute(order.id, "data-order-id")}${addAttribute(isAlreadyShipped ? "true" : "false", "data-already-shipped")}> ${statuses.map((status) => renderTemplate`<option${addAttribute(status, "value")}${addAttribute(status === order.status, "selected")}> ${statusConfig[status]?.label || status} </option>`)} </select>  ${isAlreadyShipped && shipmentData && renderTemplate`<div class="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"> <h3 class="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-3"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Datos de Envío
</h3> <div class="space-y-2 text-sm"> <div class="flex justify-between"> <span class="text-zinc-400">Transportista</span> <span class="text-foreground font-medium"> ${shipmentData.carrier} </span> </div> ${shipmentData.tracking_number && renderTemplate`<div class="flex justify-between"> <span class="text-zinc-400">Nº Seguimiento</span> <span class="text-foreground font-mono text-xs"> ${shipmentData.tracking_number} </span> </div>`} ${shipmentData.tracking_url && renderTemplate`<a${addAttribute(shipmentData.tracking_url, "href")} target="_blank" rel="noopener noreferrer" class="block mt-3 text-center py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
📦 Ver seguimiento
</a>`} <p class="text-xs text-zinc-500 mt-2">
Enviado: ${formatDate(shipmentData.shipped_at)} </p> </div> </div>`}  <div id="tracking-fields" class="hidden space-y-3 mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"> <h3 class="text-sm font-semibold text-blue-400 flex items-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path> </svg>
Datos de Envío
</h3> <div> <label class="block text-sm text-zinc-400 mb-1">Transportista *</label> <select id="carrier-select" class="admin-select w-full"> <option value="">Seleccionar...</option> <option value="SEUR">SEUR</option> <option value="MRW">MRW</option> <option value="Correos">Correos</option> <option value="Correos Express">Correos Express</option> <option value="GLS">GLS</option> <option value="DHL">DHL</option> <option value="UPS">UPS</option> <option value="FedEx">FedEx</option> <option value="Otro">Otro</option> </select> </div> <div> <label class="block text-sm text-zinc-400 mb-1">Número de seguimiento</label> <input type="text" id="tracking-number" class="admin-input w-full" placeholder="Ej: 1Z999AA10123456784"> </div> <div> <label class="block text-sm text-zinc-400 mb-1">URL de seguimiento</label> <input type="url" id="tracking-url" class="admin-input w-full" placeholder="https://..."> <p class="text-xs text-zinc-500 mt-1">
Enlace directo al seguimiento del paquete
</p> </div> </div> <button id="update-status" class="admin-btn-primary w-full"> <span id="btn-text">Actualizar Estado</span> </button> <div id="status-message" class="hidden mt-3 p-3 rounded-lg text-sm"></div> </div> <!-- Quick Info --> <div class="admin-card"> <h2 class="font-semibold text-lg mb-4">Información</h2> <div class="space-y-3"> <div class="flex justify-between text-sm"> <span class="text-zinc-500">ID Pedido</span> <span class="font-mono text-foreground">${order.id.slice(0, 8)}</span> </div> ${order.stripe_session_id && renderTemplate`<div class="flex justify-between text-sm"> <span class="text-zinc-500">Stripe Session</span> <span class="font-mono truncate max-w-[120px] text-foreground"${addAttribute(order.stripe_session_id, "title")}> ${order.stripe_session_id.slice(0, 16)}...
</span> </div>`} <div class="flex justify-between text-sm"> <span class="text-zinc-500">Fecha</span> <span class="text-foreground">${formatDate(order.created_at)}</span> </div> </div> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
