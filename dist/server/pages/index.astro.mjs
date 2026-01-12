import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as Fragment } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_Ch9DYZ86.mjs';
import { s as supabase } from '../chunks/supabase_CyPcJWDY.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: featuredProducts } = await supabase.from("products").select(
    `
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("active", true).order("created_at", { ascending: false }).limit(8);
  const { data: offerProducts } = await supabase.from("products").select(
    `
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("active", true).eq("is_offer", true).limit(4);
  const { data: settings } = await supabase.from("settings").select("value").eq("key", "offers_enabled").single();
  const offersEnabled = settings?.value === "true";
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Inicio" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background z-10"></div> <div class="absolute inset-0 bg-[url('/hero-bg.svg')] bg-cover bg-center"></div> <div class="relative z-20 text-center px-4 animate-fade-up"> <h1 class="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider mb-4">
NUEVA <span class="text-primary">COLECCIÓN</span> </h1> <p class="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
Descubre las últimas tendencias en streetwear urbano
</p> <a href="/productos" class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-heading text-lg tracking-wider hover:animate-pulse-glow neon-glow transition-all">
VER PRODUCTOS
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path> </svg> </a> </div> </section>  <section class="bg-card border-y border-border py-4"> <div class="container mx-auto px-4"> <div class="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-muted-foreground"> <div class="flex items-center gap-2"> <span class="text-primary">📦</span> <span>Envío gratis +50€</span> </div> <div class="flex items-center gap-2"> <span class="text-primary">🔄</span> <span>30 días devolución</span> </div> <div class="flex items-center gap-2"> <span class="text-primary">🔒</span> <span>Pago 100% seguro</span> </div> </div> </div> </section>  <section class="py-12 md:py-16"> <div class="container mx-auto px-4"> <div class="flex items-center justify-between mb-8"> <h2 class="font-heading text-2xl md:text-3xl font-bold">Categorías</h2> <a href="/productos" class="text-sm text-primary hover:underline">Ver todo →</a> </div> <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"> ${categories?.map((category, index) => renderTemplate`<a${addAttribute(`/categoria/${category.slug}`, "href")} class="flex-shrink-0 w-40 md:w-48 snap-start group"${addAttribute(`animation-delay: ${index * 100}ms`, "style")}> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted"> <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div> <div class="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10"></div> <span class="absolute bottom-3 left-3 z-20 font-heading text-lg font-semibold"> ${category.name} </span> </div> </a>`)} </div> </div> </section>  ${offersEnabled && offerProducts && offerProducts.length > 0 && renderTemplate`<section class="py-12 md:py-16 bg-card/50"> <div class="container mx-auto px-4"> <div class="flex items-center justify-between mb-8"> <div class="flex items-center gap-3"> <span class="text-2xl animate-pulse">🔥</span> <h2 class="font-heading text-2xl md:text-3xl font-bold text-accent">
Ofertas Flash
</h2> </div> <a href="/productos?ofertas=true" class="text-sm text-accent hover:underline">
Ver todas →
</a> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"> ${offerProducts.map((product) => renderTemplate`<a${addAttribute(`/productos/${product.slug}`, "href")} class="group"> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3"> ${product.images?.[0]?.image_url && renderTemplate`<img${addAttribute(product.images[0].image_url, "src")}${addAttribute(product.name, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">`} <div class="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-bold rounded">
-
${Math.round(
    (product.price - (product.offer_price || product.price)) / product.price * 100
  )}
%
</div> </div> <h3 class="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1"> ${product.name} </h3> <div class="flex items-center gap-2"> <span class="font-bold text-accent"> ${formatPrice(product.offer_price || product.price)} </span> <span class="text-sm text-muted-foreground line-through"> ${formatPrice(product.price)} </span> </div> </a>`)} </div> </div> </section>`} <section class="py-12 md:py-16"> <div class="container mx-auto px-4"> <div class="flex items-center justify-between mb-8"> <h2 class="font-heading text-2xl md:text-3xl font-bold">Novedades</h2> <a href="/productos" class="text-sm text-primary hover:underline">Ver todo →</a> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"> ${featuredProducts?.map((product) => renderTemplate`<a${addAttribute(`/productos/${product.slug}`, "href")} class="group"> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3"> ${product.images?.[0]?.image_url && renderTemplate`<img${addAttribute(product.images[0].image_url, "src")}${addAttribute(product.name, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">`} ${product.category && renderTemplate`<div class="absolute top-2 left-2 bg-card/80 backdrop-blur px-2 py-1 text-xs rounded"> ${product.category.name} </div>`} </div> <h3 class="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1"> ${product.name} </h3> <p class="font-bold"> ${product.is_offer && product.offer_price ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <span class="text-accent"> ${formatPrice(product.offer_price)} </span> <span class="text-sm text-muted-foreground line-through ml-2"> ${formatPrice(product.price)} </span> ` })}` : formatPrice(product.price)} </p> </a>`)} </div> </div> </section> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
