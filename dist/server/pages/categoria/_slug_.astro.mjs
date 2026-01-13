import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_BHSFkYSe.mjs';
import { $ as $$ProductCard } from '../../chunks/ProductCard_lB_zlinL.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const { data: category, error: catError } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (catError || !category) {
    return Astro2.redirect("/productos");
  }
  const { data: products } = await supabase.from("products").select(
    `
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("category_id", category.id).eq("active", true).order("created_at", { ascending: false });
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": category.name }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Header --> <div class="mb-8"> <nav class="text-sm text-muted-foreground mb-4"> <a href="/" class="hover:text-primary transition-colors">Inicio</a> <span class="mx-2">/</span> <a href="/productos" class="hover:text-primary transition-colors">Productos</a> <span class="mx-2">/</span> <span class="text-foreground">${category.name}</span> </nav> <h1 class="font-display text-4xl md:text-5xl mb-2">${category.name}</h1> <p class="text-muted-foreground"> ${products?.length || 0} productos en esta categoría
</p> </div> <div class="lg:flex lg:gap-8"> <!-- Categories Sidebar --> <aside class="hidden lg:block w-64 flex-shrink-0"> <div class="sticky top-24"> <h3 class="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
Categorías
</h3> <ul class="space-y-2"> <li> <a href="/productos" class="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
Todas
</a> </li> ${categories?.map((cat) => renderTemplate`<li> <a${addAttribute(`/categoria/${cat.slug}`, "href")}${addAttribute([
    "block py-1.5 text-sm transition-colors",
    cat.slug === slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
  ], "class:list")}> ${cat.name} </a> </li>`)} </ul> </div> </aside> <!-- Products Grid --> <div class="flex-1"> ${products && products.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"> ${products.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-muted-foreground mb-4">
No hay productos en esta categoría.
</p> <a href="/productos" class="text-primary hover:underline">
Ver todos los productos
</a> </div>`} </div> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/categoria/[slug].astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/categoria/[slug].astro";
const $$url = "/categoria/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
