import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_D2ja8uRB.mjs';
import { s as supabase } from '../../chunks/supabase_DtlKUSBa.mjs';
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
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");
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
    return sorted[0]?.image_url || "/placeholder.jpg";
  };
  const uniqueCategories = categories || [];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Productos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> <p class="text-zinc-400" id="products-count"> ${products?.length || 0} productos en total
</p> <a href="/admin/productos/nuevo" class="admin-btn-primary"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Nuevo Producto
</a> </div> <!-- Filters --> <div class="admin-filter-bar"> <div class="flex flex-col md:flex-row gap-4"> <!-- Search --> <div class="relative flex-1"> <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <input type="text" id="search-input" placeholder="Buscar por nombre o slug..." class="admin-input pl-10"> </div> <!-- Category Filter --> <select id="category-filter" class="admin-select md:w-48"> <option value="">Todas las categorías</option> ${uniqueCategories.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}>${cat.name}</option>`)} </select> <!-- Status Filter --> <select id="status-filter" class="admin-select md:w-40"> <option value="">Todos</option> <option value="active">Activos</option> <option value="inactive">Inactivos</option> <option value="offer">En oferta</option> <option value="low-stock">Stock bajo</option> </select> </div> </div> ${error && renderTemplate`<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
Error cargando productos: ${error.message} </div>`} <!-- Products List as Cards (Better for this design) --> <div class="space-y-2" id="products-list"> ${products && products.length > 0 ? products.map((product) => {
    const totalStock = getTotalStock(product.variants);
    return renderTemplate`<div class="product-row bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 rounded-lg p-4 transition-all"${addAttribute(product.name.toLowerCase(), "data-name")}${addAttribute(product.slug.toLowerCase(), "data-slug")}${addAttribute(product.category?.id || "", "data-category-id")}${addAttribute(product.active ? "true" : "false", "data-active")}${addAttribute(product.is_offer ? "true" : "false", "data-offer")}${addAttribute(totalStock, "data-stock")}> <div class="flex items-center gap-4">  <div class="flex-shrink-0"> <img${addAttribute(getFirstImage(product.images), "src")}${addAttribute(product.name, "alt")} class="w-16 h-16 object-cover rounded-lg bg-zinc-800 ring-1 ring-zinc-700"> </div>  <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">  <div class="md:col-span-2"> <p class="font-semibold text-foreground truncate"> ${product.name} </p> <p class="text-xs text-zinc-500 truncate"> ${product.slug} </p> </div>  <div> <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-700 text-zinc-200"> ${product.category?.name || "Sin categor\xEDa"} </span> </div>  <div class="text-right"> ${product.is_offer && product.offer_price ? renderTemplate`<div> <p class="text-xs text-zinc-500 line-through"> ${formatPrice(product.price)} </p> <p class="font-bold text-red-400"> ${formatPrice(product.offer_price)} </p> </div>` : renderTemplate`<p class="font-bold tabular-nums text-foreground"> ${formatPrice(product.price)} </p>`} </div>  <div class="flex items-center justify-end gap-2 flex-wrap"> <span${addAttribute(`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${totalStock === 0 ? "bg-red-500/20 text-red-400" : totalStock < 10 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`, "class")}> ${totalStock} uds
</span> ${product.active ? renderTemplate`<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/20 text-green-400">
Activo
</span>` : renderTemplate`<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-600/50 text-zinc-400">
Inactivo
</span>`} ${product.is_offer && renderTemplate`<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-400">
Oferta
</span>`} </div> </div>  <div class="flex items-center gap-1 flex-shrink-0"> <a${addAttribute(`/admin/productos/${product.id}`, "href")} class="p-2 rounded-lg hover:bg-zinc-700 transition-colors" title="Editar"> <svg class="w-5 h-5 text-zinc-400 hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> </a> <a${addAttribute(`/productos/${product.slug}`, "href")} target="_blank" class="p-2 rounded-lg hover:bg-zinc-700 transition-colors" title="Ver en tienda"> <svg class="w-5 h-5 text-zinc-400 hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a> </div> </div> </div>`;
  }) : renderTemplate`<div class="text-center py-12 text-zinc-500"> <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> <p>No hay productos todavía</p> <a href="/admin/productos/nuevo" class="inline-block mt-4 text-primary hover:underline">
Crear primer producto →
</a> </div>`} </div> <!-- No results message (hidden by default) --> <div id="no-results" class="hidden p-12 text-center text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800"> <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <p>No se encontraron productos</p> <button id="clear-filters" class="mt-4 text-primary hover:underline">
Limpiar filtros
</button> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
