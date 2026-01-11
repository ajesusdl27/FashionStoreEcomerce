import { e as createComponent, f as createAstro, r as renderTemplate, k as renderSlot, l as renderHead, h as addAttribute, n as renderComponent, m as maybeRenderHead, o as renderScript, p as Fragment } from '../chunks/astro/server_BV4kWd-B.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { s as supabase } from '../chunks/supabase_CyPcJWDY.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "FashionStore - Tu tienda de streetwear premium con las mejores marcas urbanas.",
    image = "/og-image.jpg"
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  return renderTemplate(_a || (_a = __template(['<html lang="es" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="canonical"', "><!-- SEO --><title>", ' | FashionStore</title><meta name="description"', '><meta name="generator"', '><!-- Open Graph --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', `><!-- Theme --><script>
      // Check for saved theme preference or use dark as default
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    <\/script><!-- Preload fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- View Transitions --><meta name="view-transition" content="same-origin">`, '</head> <body class="min-h-screen bg-background text-foreground font-body antialiased"> ', " </body></html>"])), addAttribute(canonicalURL, "href"), title, addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), addAttribute(canonicalURL, "content"), addAttribute(`${title} | FashionStore`, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), addAttribute(canonicalURL, "content"), addAttribute(`${title} | FashionStore`, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/BaseLayout.astro", void 0);

const $$Astro = createAstro();
const $$PublicLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PublicLayout;
  const { title, description } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<header class="sticky top-0 z-50 glass border-b border-border"> <div class="container mx-auto px-4"> <div class="flex items-center justify-between h-16"> <!-- Mobile Menu Button --> <button id="mobile-menu-btn" class="lg:hidden touch-target flex items-center justify-center" aria-label="Abrir menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <!-- Logo --> <a href="/" class="font-display text-2xl tracking-wider text-primary hover:animate-pulse-glow transition-all">
FASHIONSTORE
</a> <!-- Desktop Navigation --> <nav class="hidden lg:flex items-center gap-8"> <a href="/" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a> <a href="/productos" class="text-sm font-medium hover:text-primary transition-colors">Productos</a> <a href="/productos?ofertas=true" class="text-sm font-medium text-accent hover:text-accent/80 transition-colors">Ofertas</a> </nav> <!-- Actions --> <div class="flex items-center gap-4"> <!-- Search --> <button id="search-btn" class="touch-target flex items-center justify-center hover:text-primary transition-colors" aria-label="Buscar"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </button> <!-- Cart (React Island) --> <div id="cart-icon-container"> <!-- CartIcon island will be mounted here --> </div> </div> </div> </div> </header>  <div id="mobile-menu" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="mobile-menu-backdrop"></div> <nav class="absolute left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-card border-r border-border p-6 transform -translate-x-full transition-transform duration-300" id="mobile-menu-panel"> <div class="flex items-center justify-between mb-8"> <span class="font-display text-xl text-primary">FASHIONSTORE</span> <button id="mobile-menu-close" class="touch-target" aria-label="Cerrar menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <div class="space-y-4"> <a href="/" class="block py-3 text-lg font-medium hover:text-primary transition-colors">🏠 Inicio</a> <a href="/productos" class="block py-3 text-lg font-medium hover:text-primary transition-colors">👕 Productos</a> <a href="/productos?ofertas=true" class="block py-3 text-lg font-medium text-accent hover:text-accent/80 transition-colors">🔥 Ofertas</a> <hr class="border-border my-4"> <a href="/cuenta" class="block py-3 text-lg font-medium hover:text-primary transition-colors">👤 Mi Cuenta</a> <a href="/cuenta/pedidos" class="block py-3 text-lg font-medium hover:text-primary transition-colors">📦 Mis Pedidos</a> </div> </nav> </div>  <main class="flex-1"> ${renderSlot($$result2, $$slots["default"])} </main>  <footer class="bg-card border-t border-border mt-16"> <div class="container mx-auto px-4 py-12"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> <!-- Brand --> <div> <span class="font-display text-2xl text-primary">FASHIONSTORE</span> <p class="mt-4 text-sm text-muted-foreground">
Tu tienda de streetwear premium con las mejores marcas urbanas.
</p> </div> <!-- Links --> <div> <h4 class="font-heading text-sm font-semibold uppercase tracking-wider mb-4">
Tienda
</h4> <ul class="space-y-2 text-sm text-muted-foreground"> <li> <a href="/productos" class="hover:text-primary transition-colors">Todos los productos</a> </li> <li> <a href="/productos?ofertas=true" class="hover:text-primary transition-colors">Ofertas</a> </li> <li> <a href="/categoria/zapatillas" class="hover:text-primary transition-colors">Zapatillas</a> </li> <li> <a href="/categoria/camisetas" class="hover:text-primary transition-colors">Camisetas</a> </li> </ul> </div> <!-- Info --> <div> <h4 class="font-heading text-sm font-semibold uppercase tracking-wider mb-4">
Información
</h4> <ul class="space-y-2 text-sm text-muted-foreground"> <li> <a href="/contacto" class="hover:text-primary transition-colors">Contacto</a> </li> <li> <a href="/envios" class="hover:text-primary transition-colors">Envíos y devoluciones</a> </li> <li> <a href="/privacidad" class="hover:text-primary transition-colors">Política de privacidad</a> </li> <li> <a href="/terminos" class="hover:text-primary transition-colors">Términos y condiciones</a> </li> </ul> </div> <!-- Social --> <div> <h4 class="font-heading text-sm font-semibold uppercase tracking-wider mb-4">
Síguenos
</h4> <div class="flex gap-4"> <a href="#" class="hover:text-primary transition-colors" aria-label="Instagram"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path> </svg> </a> <a href="#" class="hover:text-primary transition-colors" aria-label="Twitter"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a href="#" class="hover:text-primary transition-colors" aria-label="TikTok"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"> <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path> </svg> </a> </div> </div> </div> <div class="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground"> <p>
&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} FashionStore. Todos los derechos reservados.
</p> </div> </div> </footer> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/PublicLayout.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/PublicLayout.astro", void 0);

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
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Inicio" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background z-10"></div> <div class="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center"></div> <div class="relative z-20 text-center px-4 animate-fade-up"> <h1 class="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider mb-4">
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
