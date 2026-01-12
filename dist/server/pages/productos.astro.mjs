import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_CDKIQy5M.mjs';
import { $ as $$ProductCard } from '../chunks/ProductCard_CD9dEzZO.mjs';
import { s as supabase } from '../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const url = new URL(Astro2.request.url);
  const categoryFilter = url.searchParams.get("categoria");
  const ofertasFilter = url.searchParams.get("ofertas") === "true";
  const sortBy = url.searchParams.get("orden") || "created_at";
  const sortOrder = url.searchParams.get("dir") === "asc" ? true : false;
  let query = supabase.from("products").select(
    `
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("active", true);
  if (categoryFilter) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categoryFilter).single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }
  if (ofertasFilter) {
    query = query.eq("is_offer", true);
  }
  query = query.order(sortBy, { ascending: sortOrder });
  const { data: products, error } = await query;
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const pageTitle = ofertasFilter ? "Ofertas" : categoryFilter ? categories?.find((c) => c.slug === categoryFilter)?.name || "Productos" : "Todos los Productos";
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": pageTitle }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Header --> <div class="mb-8"> <h1 class="font-display text-4xl md:text-5xl mb-2">${pageTitle}</h1> <p class="text-muted-foreground"> ${products?.length || 0} productos encontrados
</p> </div> <div class="lg:flex lg:gap-8"> <!-- Filters Sidebar (Desktop) --> <aside class="hidden lg:block w-64 flex-shrink-0"> <div class="sticky top-24 space-y-6"> <!-- Categories --> <div> <h3 class="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
Categorías
</h3> <ul class="space-y-2"> <li> <a href="/productos"${addAttribute([
    "block py-1.5 text-sm transition-colors",
    !categoryFilter ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
  ], "class:list")}>
Todas
</a> </li> ${categories?.map((cat) => renderTemplate`<li> <a${addAttribute(`/productos?categoria=${cat.slug}`, "href")}${addAttribute([
    "block py-1.5 text-sm transition-colors",
    categoryFilter === cat.slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
  ], "class:list")}> ${cat.name} </a> </li>`)} </ul> </div> <!-- Offers Filter --> <div> <h3 class="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
Ofertas
</h3> <a${addAttribute(ofertasFilter ? "/productos" : "/productos?ofertas=true", "href")}${addAttribute([
    "flex items-center gap-2 py-1.5 text-sm transition-colors",
    ofertasFilter ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"
  ], "class:list")}> <span${addAttribute(ofertasFilter ? "text-accent" : "", "class")}>🔥</span>
Solo ofertas
</a> </div> <!-- Sort --> <div> <h3 class="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
Ordenar por
</h3> <select id="sort-select" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"> <option value="created_at"${addAttribute(sortBy === "created_at", "selected")}>Más recientes</option> <option value="price-asc"${addAttribute(sortBy === "price" && sortOrder, "selected")}>Precio: menor a mayor</option> <option value="price-desc"${addAttribute(sortBy === "price" && !sortOrder, "selected")}>Precio: mayor a menor</option> <option value="name"${addAttribute(sortBy === "name", "selected")}>Nombre A-Z</option> </select> </div> </div> </aside> <!-- Products Grid --> <div class="flex-1"> ${error ? renderTemplate`<div class="text-center py-12"> <p class="text-muted-foreground">
Error al cargar productos. Por favor, intenta de nuevo.
</p> </div>` : products && products.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"> ${products.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-muted-foreground mb-4">
No se encontraron productos.
</p> <a href="/productos" class="text-primary hover:underline">
Ver todos los productos
</a> </div>`} </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro";
const $$url = "/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
