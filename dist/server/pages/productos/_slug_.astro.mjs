import { e as createAstro, f as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as renderScript, o as Fragment } from '../../chunks/astro/server_DbJgTwsN.mjs';
import 'piccolore';
import { a as addToCart, $ as $$PublicLayout } from '../../chunks/PublicLayout_CW4JwTmC.mjs';
import { $ as $$Badge } from '../../chunks/Badge_DGBhi0A7.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase } from '../../chunks/supabase_CyPcJWDY.mjs';
export { renderers } from '../../renderers.mjs';

function AddToCartButton({
  productId,
  productName,
  productSlug,
  variantId,
  size,
  price,
  imageUrl,
  stock
}) {
  const [status, setStatus] = useState("idle");
  const handleClick = async () => {
    if (stock <= 0) return;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      addToCart({
        productId,
        productName,
        productSlug,
        variantId,
        size,
        price,
        imageUrl
      });
      setStatus("success");
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2e3);
    }
  };
  const isDisabled = stock <= 0 || status === "loading";
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleClick,
      disabled: isDisabled,
      className: `
        w-full py-4 font-heading text-lg tracking-wider
        transition-all duration-300 touch-target
        flex items-center justify-center gap-2
        ${status === "success" ? "bg-emerald-500 text-white" : status === "error" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      children: [
        status === "loading" && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
              fill: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            }
          )
        ] }),
        status === "success" && /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
        status === "error" && /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }),
        /* @__PURE__ */ jsx("span", { children: stock <= 0 ? "AGOTADO" : status === "loading" ? "AÑADIENDO..." : status === "success" ? "¡AÑADIDO!" : status === "error" ? "ERROR" : "AÑADIR AL CARRITO" })
      ]
    }
  );
}

const $$Astro = createAstro("http://localhost:4321");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const { data: product, error } = await supabase.from("products").select(
    `
    *,
    category:categories(id, name, slug),
    images:product_images(id, image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("slug", slug).eq("active", true).single();
  if (error || !product) {
    return Astro2.redirect("/productos");
  }
  const sortedImages = product.images?.sort((a, b) => a.order - b.order) || [];
  const mainImage = sortedImages[0]?.image_url || "https://placehold.co/600x600/1a1a1a/ccff00?text=No+Image";
  const sizeOrder = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46"
  ];
  const sortedVariants = product.variants?.sort((a, b) => {
    return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
  }) || [];
  const hasOffer = product.is_offer && product.offer_price;
  const displayPrice = hasOffer ? product.offer_price : product.price;
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  function calculateDiscount(original, offer) {
    return Math.round((original - offer) / original * 100);
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": product.name, "description": product.description || void 0 }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Breadcrumbs --> <nav class="mb-6 text-sm text-muted-foreground"> <ol class="flex items-center gap-2"> <li> <a href="/" class="hover:text-primary transition-colors">Inicio</a> </li> <li>/</li> <li> <a href="/productos" class="hover:text-primary transition-colors">Productos</a> </li> ${product.category && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <li>/</li> <li> <a${addAttribute(`/categoria/${product.category.slug}`, "href")} class="hover:text-primary transition-colors"> ${product.category.name} </a> </li> ` })}`} <li>/</li> <li class="text-foreground">${product.name}</li> </ol> </nav> <div class="lg:grid lg:grid-cols-2 lg:gap-12"> <!-- Gallery --> <div class="mb-8 lg:mb-0"> <!-- Main Image --> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4"> <img id="main-image"${addAttribute(mainImage, "src")}${addAttribute(product.name, "alt")} class="w-full h-full object-cover"> ${hasOffer && renderTemplate`${renderComponent($$result2, "Badge", $$Badge, { "variant": "error", "class": "absolute top-4 left-4 text-lg font-bold" }, { "default": async ($$result3) => renderTemplate`
-${calculateDiscount(product.price, product.offer_price)}%
` })}`} </div> <!-- Thumbnails --> ${sortedImages.length > 1 && renderTemplate`<div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar"> ${sortedImages.map((img, index) => renderTemplate`<button class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors thumbnail-btn"${addAttribute(img.image_url, "data-image")}> <img${addAttribute(img.image_url, "src")}${addAttribute(`${product.name} - imagen ${index + 1}`, "alt")} class="w-full h-full object-cover"> </button>`)} </div>`} </div> <!-- Product Info --> <div> <h1 class="font-display text-3xl md:text-4xl lg:text-5xl mb-4"> ${product.name} </h1> <!-- Price --> <div class="flex items-center gap-3 mb-6"> <span${addAttribute([
    "text-3xl font-bold",
    hasOffer ? "text-accent" : "text-foreground"
  ], "class:list")}> ${formatPrice(displayPrice)} </span> ${hasOffer && renderTemplate`<span class="text-xl text-muted-foreground line-through"> ${formatPrice(product.price)} </span>`} </div> <!-- Description --> ${product.description && renderTemplate`<p class="text-muted-foreground mb-8 leading-relaxed"> ${product.description} </p>`} <!-- Size Selector --> <div class="mb-8"> <div class="flex items-center justify-between mb-3"> <span class="font-heading text-sm uppercase tracking-wider">Talla</span> <button class="text-sm text-primary hover:underline">Guía de tallas</button> </div> <div class="flex flex-wrap gap-2" id="size-selector"> ${sortedVariants.map((variant) => renderTemplate`<button${addAttribute([
    "size-btn px-4 py-3 min-w-[60px] border rounded-lg font-medium transition-all touch-target",
    variant.stock <= 0 ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-border" : "bg-card border-border hover:border-primary"
  ], "class:list")}${addAttribute(variant.id, "data-variant-id")}${addAttribute(variant.size, "data-size")}${addAttribute(variant.stock, "data-stock")}${addAttribute(displayPrice, "data-price")}${addAttribute(variant.stock <= 0, "disabled")}> ${variant.size} ${variant.stock > 0 && variant.stock <= 5 && renderTemplate`<span class="ml-1 text-yellow-400">⚡</span>`} </button>`)} </div> <!-- Stock warning --> <p id="stock-warning" class="mt-3 text-sm text-yellow-400 hidden">
⚡ <span id="stock-count"></span> unidades disponibles
</p> </div> <!-- Add to Cart --> <div id="add-to-cart-container" class="hidden"> ${renderComponent($$result2, "AddToCartButton", AddToCartButton, { "client:load": true, "productId": product.id, "productName": product.name, "productSlug": product.slug, "variantId": "", "size": "", "price": displayPrice, "imageUrl": mainImage, "stock": 0, "client:component-hydration": "load", "client:component-path": "@/components/islands/AddToCartButton", "client:component-export": "default" })} </div> <div id="select-size-message" class="py-4 text-center text-muted-foreground border border-dashed border-border rounded-lg">
Selecciona una talla para añadir al carrito
</div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro";
const $$url = "/productos/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
