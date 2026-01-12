import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript, n as Fragment } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { c as addToCart, $ as $$PublicLayout } from '../../chunks/PublicLayout_CDKIQy5M.mjs';
import { $ as $$CloudinaryImage, a as $$Badge } from '../../chunks/CloudinaryImage_BK-2V69L.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
import { i as isCloudinaryUrl, g as getOptimizedUrl } from '../../chunks/cloudinary_Ckc2MT3h.mjs';
export { renderers } from '../../renderers.mjs';

function ProductAddToCart({
  productId,
  productName,
  productSlug,
  price,
  imageUrl,
  variants
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [status, setStatus] = useState("idle");
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
  const sortedVariants = [...variants].sort(
    (a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
  );
  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      addToCart({
        productId,
        productName,
        productSlug,
        variantId: selectedVariant.id,
        size: selectedVariant.size,
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
  const formatPrice = (p) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(p);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("span", { className: "font-heading text-sm uppercase tracking-wider", children: "Talla" }),
        /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", children: "Guía de tallas" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: sortedVariants.map((variant) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSelectedVariant(variant),
          disabled: variant.stock <= 0,
          className: `
                px-4 py-3 min-w-[60px] border rounded-lg font-medium transition-all
                ${variant.stock <= 0 ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-border" : selectedVariant?.id === variant.id ? "border-primary bg-primary/10" : "bg-card border-border hover:border-primary"}
              `,
          children: [
            variant.size,
            variant.stock > 0 && variant.stock <= 5 && /* @__PURE__ */ jsx("span", { className: "ml-1 text-yellow-400", children: "⚡" })
          ]
        },
        variant.id
      )) }),
      selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-yellow-400", children: [
        "⚡ ",
        selectedVariant.stock,
        " unidades disponibles"
      ] })
    ] }),
    selectedVariant ? /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleAddToCart,
        disabled: selectedVariant.stock <= 0 || status === "loading",
        className: `
            w-full py-4 font-heading text-lg tracking-wider
            transition-all duration-300 flex items-center justify-center gap-2
            ${status === "success" ? "bg-emerald-500 text-white" : status === "error" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"}
            disabled:opacity-50 disabled:cursor-not-allowed
          `,
        children: [
          status === "loading" && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
            /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ] }),
          status === "success" && /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
          status === "error" && /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }),
          /* @__PURE__ */ jsx("span", { children: selectedVariant.stock <= 0 ? "AGOTADO" : status === "loading" ? "AÑADIENDO..." : status === "success" ? "¡AÑADIDO!" : status === "error" ? "ERROR" : `AÑADIR AL CARRITO - ${formatPrice(price)}` })
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "py-4 text-center text-muted-foreground border border-dashed border-border rounded-lg", children: "Selecciona una talla para añadir al carrito" })
  ] });
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
  const variantsForReact = (product.variants || []).map((v) => ({
    id: v.id,
    size: v.size,
    stock: v.stock
  }));
  const getThumbnailUrl = (url) => {
    if (isCloudinaryUrl(url)) {
      return getOptimizedUrl(url, { width: 80, height: 80 });
    }
    return url;
  };
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": product.name, "description": product.description || void 0 }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Breadcrumbs --> <nav class="mb-6 text-sm text-muted-foreground"> <ol class="flex items-center gap-2 flex-wrap"> <li> <a href="/" class="hover:text-primary transition-colors">Inicio</a> </li> <li>/</li> <li> <a href="/productos" class="hover:text-primary transition-colors">Productos</a> </li> ${product.category && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <li>/</li> <li> <a${addAttribute(`/categoria/${product.category.slug}`, "href")} class="hover:text-primary transition-colors"> ${product.category.name} </a> </li> ` })}`} <li>/</li> <li class="text-foreground truncate max-w-[150px]">${product.name}</li> </ol> </nav> <div class="lg:grid lg:grid-cols-2 lg:gap-12"> <!-- Gallery --> <div class="mb-8 lg:mb-0"> <!-- Main Image --> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4"> ${renderComponent($$result2, "CloudinaryImage", $$CloudinaryImage, { "id": "main-image", "src": mainImage, "alt": product.name, "width": 800, "sizes": "(max-width: 1024px) 100vw, 50vw", "class": "w-full h-full object-cover" })} ${hasOffer && renderTemplate`${renderComponent($$result2, "Badge", $$Badge, { "variant": "error", "class": "absolute top-4 left-4 text-lg font-bold" }, { "default": async ($$result3) => renderTemplate`
-${calculateDiscount(product.price, product.offer_price)}%
` })}`} </div> <!-- Thumbnails --> ${sortedImages.length > 1 && renderTemplate`<div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar"> ${sortedImages.map((img, index) => renderTemplate`<button class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors thumbnail-btn"${addAttribute(img.image_url, "data-image")}> <img${addAttribute(getThumbnailUrl(img.image_url), "src")}${addAttribute(`${product.name} - imagen ${index + 1}`, "alt")} class="w-full h-full object-cover"> </button>`)} </div>`} </div> <!-- Product Info --> <div> <h1 class="font-display text-3xl md:text-4xl lg:text-5xl mb-4"> ${product.name} </h1> <!-- Price --> <div class="flex items-center gap-3 mb-6"> <span${addAttribute([
    "text-3xl font-bold",
    hasOffer ? "text-accent" : "text-foreground"
  ], "class:list")}> ${formatPrice(displayPrice)} </span> ${hasOffer && renderTemplate`<span class="text-xl text-muted-foreground line-through"> ${formatPrice(product.price)} </span>`} </div> <!-- Description --> ${product.description && renderTemplate`<p class="text-muted-foreground mb-8 leading-relaxed"> ${product.description} </p>`} <!-- Size Selector + Add to Cart (React Island) --> ${renderComponent($$result2, "ProductAddToCart", ProductAddToCart, { "client:load": true, "productId": product.id, "productName": product.name, "productSlug": product.slug, "price": displayPrice, "imageUrl": mainImage, "variants": variantsForReact, "client:component-hydration": "load", "client:component-path": "@/components/islands/ProductAddToCart", "client:component-export": "default" })} </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
