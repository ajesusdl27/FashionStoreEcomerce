import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as Fragment } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C7xUQmWa.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: products, error } = await supabase.from("products").select(
    `
    *,
    category:categories(id, name),
    images:product_images(id, image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).order("created_at", { ascending: false });
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };
  const getTotalStock = (variants) => {
    return variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  };
  const getFirstImage = (images) => {
    if (!images || images.length === 0) return "/placeholder.jpg";
    const sorted = [...images].sort((a, b) => a.order - b.order);
    return sorted[0].image_url;
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Productos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div> <h1 class="font-display text-3xl text-primary">Productos</h1> <p class="text-muted-foreground mt-1"> ${products?.length || 0} productos
</p> </div> <a href="/admin/productos/nuevo" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Nuevo Producto
</a> </div> ${error && renderTemplate`<div class="p-4 bg-accent/20 border border-accent rounded-lg text-accent">
Error cargando productos: ${error.message} </div>`} <!-- Products Table --> <div class="glass border border-border rounded-xl overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full"> <thead class="bg-muted/50 border-b border-border"> <tr> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Producto</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Categoría</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Precio</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Stock</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Estado</th> <th class="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acciones</th> </tr> </thead> <tbody class="divide-y divide-border"> ${products && products.length > 0 ? products.map((product) => renderTemplate`<tr class="hover:bg-muted/30 transition-colors"> <td class="px-6 py-4"> <div class="flex items-center gap-4"> <img${addAttribute(getFirstImage(product.images), "src")}${addAttribute(product.name, "alt")} class="w-12 h-12 object-cover rounded-lg"> <div> <p class="font-medium">${product.name}</p> <p class="text-sm text-muted-foreground"> ${product.slug} </p> </div> </div> </td> <td class="px-6 py-4"> <span class="px-2 py-1 bg-muted rounded text-sm"> ${product.category?.name || "Sin categor\xEDa"} </span> </td> <td class="px-6 py-4"> <div> ${product.is_offer && product.offer_price ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="text-sm text-muted-foreground line-through"> ${formatPrice(product.price)} </p> <p class="font-medium text-accent"> ${formatPrice(product.offer_price)} </p> ` })}` : renderTemplate`<p class="font-medium"> ${formatPrice(product.price)} </p>`} </div> </td> <td class="px-6 py-4"> <span${addAttribute(`px-2 py-1 rounded text-sm ${getTotalStock(product.variants) === 0 ? "bg-accent/20 text-accent" : getTotalStock(product.variants) < 10 ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"}`, "class")}> ${getTotalStock(product.variants)} uds
</span> </td> <td class="px-6 py-4"> ${product.active ? renderTemplate`<span class="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
Activo
</span>` : renderTemplate`<span class="px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
Inactivo
</span>`} ${product.is_offer && renderTemplate`<span class="ml-2 px-2 py-1 bg-accent/20 text-accent rounded text-sm">
Oferta
</span>`} </td> <td class="px-6 py-4 text-right"> <div class="flex items-center justify-end gap-2"> <a${addAttribute(`/admin/productos/${product.id}`, "href")} class="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> </a> <a${addAttribute(`/productos/${product.slug}`, "href")} target="_blank" class="p-2 hover:bg-muted rounded-lg transition-colors" title="Ver en tienda"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a> </div> </td> </tr>`) : renderTemplate`<tr> <td colspan="6" class="px-6 py-12 text-center text-muted-foreground"> <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> <p>No hay productos todavía</p> <a href="/admin/productos/nuevo" class="inline-block mt-4 text-primary hover:underline">
Crear primer producto →
</a> </td> </tr>`} </tbody> </table> </div> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/index.astro";
const $$url = "/admin/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
