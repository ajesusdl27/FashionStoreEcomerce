import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_BtMQN1yW.mjs';
import { s as supabase } from '../../chunks/supabase_COljrJv9.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/cuenta/login");
  }
  const { data: orders } = await supabase.from("orders").select("*").eq("customer_email", user.email).order("created_at", { ascending: false });
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  function formatDate(date) {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium"
    }).format(new Date(date));
  }
  function getStatusBadge(status) {
    const badges = {
      pending: { class: "bg-yellow-500/20 text-yellow-400", text: "Pendiente" },
      paid: { class: "bg-emerald-500/20 text-emerald-400", text: "Pagado" },
      shipped: { class: "bg-blue-500/20 text-blue-400", text: "Enviado" },
      delivered: { class: "bg-primary/20 text-primary", text: "Entregado" },
      cancelled: { class: "bg-accent/20 text-accent", text: "Cancelado" }
    };
    return badges[status] || { class: "bg-muted", text: status };
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Mis Pedidos - FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-12"> <!-- Header --> <div class="flex items-center justify-between mb-8"> <div> <h1 class="font-display text-4xl text-primary mb-2">MIS PEDIDOS</h1> <p class="text-muted-foreground">Historial completo de tus compras</p> </div> <a href="/cuenta" class="text-muted-foreground hover:text-primary transition-colors">
← Volver a mi cuenta
</a> </div> ${orders && orders.length > 0 ? renderTemplate`<div class="space-y-4"> ${orders.map((order) => {
    const badge = getStatusBadge(order.status);
    return renderTemplate`<a${addAttribute(`/cuenta/pedidos/${order.id}`, "href")} class="block glass border border-border rounded-2xl p-6 hover:border-primary/50 hover:bg-zinc-900/50 transition-all cursor-pointer group"> <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4"> <div> <div class="flex items-center gap-2"> <p class="font-mono text-sm text-muted-foreground group-hover:text-primary transition-colors">
Pedido #${order.id?.slice(0, 8).toUpperCase()} </p> <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </div> <p class="text-sm text-muted-foreground mt-1"> ${formatDate(order.created_at)} </p> </div> <div class="flex items-center gap-4"> <span${addAttribute(`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`, "class")}> ${badge.text} </span> <span class="font-bold text-lg"> ${formatPrice(order.total_amount)} </span> </div> </div> <div class="border-t border-border pt-4"> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"> <div> <p class="text-muted-foreground mb-1">
Dirección de envío
</p> <p>${order.shipping_address}</p> <p> ${order.shipping_postal_code} ${order.shipping_city} </p> </div> <div class="text-right"> ${order.status === "paid" && renderTemplate`<p class="text-emerald-400 text-sm">
✓ Pago confirmado
</p>`} ${order.status === "shipped" && renderTemplate`<p class="text-blue-400 text-sm">📦 En camino</p>`} ${order.status === "delivered" && renderTemplate`<p class="text-primary text-sm">🎉 Entregado</p>`} <span class="inline-flex items-center gap-1 text-primary text-xs mt-2 group-hover:translate-x-1 transition-transform">
Ver detalles completos →
</span> </div> </div> </div> </a>`;
  })} </div>` : renderTemplate`<div class="text-center py-16 glass border border-border rounded-2xl"> <svg class="w-20 h-20 mx-auto text-muted-foreground/50 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> <h2 class="font-heading text-xl mb-2">No tienes pedidos todavía</h2> <p class="text-muted-foreground mb-6">
Cuando realices tu primera compra, aparecerá aquí.
</p> <a href="/productos" class="inline-flex items-center gap-2 bg-primary text-background font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
Explorar productos
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div>`} </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/pedidos/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/pedidos/index.astro";
const $$url = "/cuenta/pedidos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
