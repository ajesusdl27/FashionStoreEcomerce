import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript, o as Fragment$1 } from '../../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { c as addToCart, $ as $$PublicLayout, P as PromotionBanner } from '../../chunks/PublicLayout_DhyhF04e.mjs';
import { $ as $$CloudinaryImage, a as $$Badge } from '../../chunks/CloudinaryImage_BYFGxFet.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from '../../chunks/supabase_COljrJv9.mjs';
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
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
  const sortedVariants = [...variants].sort(
    (a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
  );
  const isShoeSize = sortedVariants.some((v) => !isNaN(Number(v.size)));
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
  const scrollToSizeSelector = () => {
    const sizeSection = document.querySelector("[data-size-selector]");
    if (sizeSection) {
      sizeSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", "data-size-selector": true, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-heading text-sm uppercase tracking-wider", children: "Talla" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowSizeGuide(true),
              className: "text-sm text-primary hover:underline",
              children: "Guía de tallas"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: sortedVariants.map((variant) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedVariant(variant),
            disabled: variant.stock <= 0,
            "aria-pressed": selectedVariant?.id === variant.id,
            className: `
                  px-4 py-3 min-w-[60px] border rounded-lg font-medium transition-all
                  ${variant.stock <= 0 ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-border" : selectedVariant?.id === variant.id ? "border-primary bg-primary/10" : "bg-card border-border hover:border-primary"}
                `,
            children: [
              variant.size,
              variant.stock > 0 && variant.stock <= 5 && /* @__PURE__ */ jsx("span", { className: "ml-1 text-yellow-400", "aria-label": "Pocas unidades", children: "⚡" })
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
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-card/95 backdrop-blur-md border-t border-border
          px-4 py-3 transform transition-transform duration-300 ease-out
          ${showStickyBar ? "translate-y-0" : "translate-y-full"}
        `,
        style: { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" },
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: imageUrl,
              alt: productName,
              className: "w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-border"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-sm truncate", children: productName }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: formatPrice(price) }),
              selectedVariant && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "Talla: ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: selectedVariant.size })
              ] })
            ] })
          ] }),
          selectedVariant ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleAddToCart,
              disabled: selectedVariant.stock <= 0 || status === "loading",
              className: `
                px-4 py-2.5 rounded-lg font-heading text-sm tracking-wider flex-shrink-0
                transition-all duration-300 flex items-center gap-2
                ${status === "success" ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"}
                disabled:opacity-50
              `,
              children: [
                status === "loading" && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                status === "success" ? /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) : status === "idle" && /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }),
                /* @__PURE__ */ jsx("span", { children: status === "success" ? "¡LISTO!" : "AÑADIR" })
              ]
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: scrollToSizeSelector,
              className: "px-4 py-2.5 rounded-lg font-heading text-sm tracking-wider flex-shrink-0 bg-primary/20 text-primary border border-primary/30",
              children: "ELIGE TALLA"
            }
          )
        ] })
      }
    ),
    showSizeGuide && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "fixed inset-0 z-[60] flex items-center justify-center p-4",
        onClick: () => setShowSizeGuide(false),
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/70 backdrop-blur-sm" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative bg-card border border-border rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-heading text-xl font-bold", children: "Guía de Tallas" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setShowSizeGuide(false),
                      className: "p-2 hover:bg-muted rounded-lg transition-colors",
                      "aria-label": "Cerrar",
                      children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
                  isShoeSize ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Mide tu pie desde el talón hasta la punta del dedo más largo. Usa la tabla para encontrar tu talla." }),
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "EU" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "US" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "UK" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "CM" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { children: [
                        ["36", "4", "3.5", "22.5"],
                        ["37", "5", "4", "23"],
                        ["38", "5.5", "5", "24"],
                        ["39", "6.5", "6", "24.5"],
                        ["40", "7", "6.5", "25"],
                        ["41", "8", "7", "26"],
                        ["42", "8.5", "8", "26.5"],
                        ["43", "9.5", "9", "27.5"],
                        ["44", "10", "9.5", "28"],
                        ["45", "11", "10.5", "29"],
                        ["46", "12", "11", "30"]
                      ].map((row, i) => /* @__PURE__ */ jsx("tr", { className: "border-b border-border/50 hover:bg-muted/50", children: row.map((cell, j) => /* @__PURE__ */ jsx("td", { className: `py-2 px-3 ${j === 0 ? "font-medium" : ""}`, children: cell }, j)) }, i)) })
                    ] }) })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Mide tu cuerpo y compara con las medidas de la tabla. Si estás entre dos tallas, elige la más grande." }),
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "Talla" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "Pecho (cm)" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "Cintura (cm)" }),
                        /* @__PURE__ */ jsx("th", { className: "py-2 px-3 text-left font-medium text-muted-foreground", children: "Cadera (cm)" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { children: [
                        ["XS", "82-87", "66-71", "86-91"],
                        ["S", "88-93", "72-77", "92-97"],
                        ["M", "94-99", "78-83", "98-103"],
                        ["L", "100-105", "84-89", "104-109"],
                        ["XL", "106-111", "90-95", "110-115"],
                        ["XXL", "112-117", "96-101", "116-121"]
                      ].map((row, i) => /* @__PURE__ */ jsx("tr", { className: "border-b border-border/50 hover:bg-muted/50", children: row.map((cell, j) => /* @__PURE__ */ jsx("td", { className: `py-2 px-3 ${j === 0 ? "font-medium" : ""}`, children: cell }, j)) }, i)) })
                    ] }) })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border border-primary/20 rounded-lg p-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "💡 Consejo:" }),
                    " ",
                    "Si tienes dudas, contacta con nosotros y te ayudaremos a encontrar tu talla perfecta."
                  ] }) })
                ] })
              ]
            }
          )
        ]
      }
    )
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
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": product.name, "description": product.description || void 0 }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Breadcrumbs --> <nav class="mb-6 text-sm text-muted-foreground"> <ol class="flex items-center gap-2 flex-wrap"> <li> <a href="/" class="hover:text-primary transition-colors">Inicio</a> </li> <li>/</li> <li> <a href="/productos" class="hover:text-primary transition-colors">Productos</a> </li> ${product.category && renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <li>/</li> <li> <a${addAttribute(`/categoria/${product.category.slug}`, "href")} class="hover:text-primary transition-colors"> ${product.category.name} </a> </li> ` })}`} <li>/</li> <li class="text-foreground truncate max-w-[150px]">${product.name}</li> </ol> </nav> <div class="lg:grid lg:grid-cols-2 lg:gap-12"> <!-- Gallery --> <div class="mb-8 lg:mb-0"> <!-- Main Image --> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4"> ${renderComponent($$result2, "CloudinaryImage", $$CloudinaryImage, { "id": "main-image", "src": mainImage, "alt": product.name, "width": 800, "sizes": "(max-width: 1024px) 100vw, 50vw", "class": "w-full h-full object-cover" })} ${hasOffer && renderTemplate`${renderComponent($$result2, "Badge", $$Badge, { "variant": "error", "class": "absolute top-4 left-4 text-lg font-bold" }, { "default": async ($$result3) => renderTemplate`
-${calculateDiscount(product.price, product.offer_price)}%
` })}`} </div> <!-- Thumbnails --> ${sortedImages.length > 1 && renderTemplate`<div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar"> ${sortedImages.map((img, index) => renderTemplate`<button class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors thumbnail-btn"${addAttribute(img.image_url, "data-image")}> <img${addAttribute(getThumbnailUrl(img.image_url), "src")}${addAttribute(`${product.name} - imagen ${index + 1}`, "alt")} class="w-full h-full object-cover"> </button>`)} </div>`} </div> <!-- Product Info --> <div> <h1 class="font-display text-3xl md:text-4xl lg:text-5xl mb-4"> ${product.name} </h1> <!-- Price --> <div class="flex items-center gap-3 mb-6"> <span${addAttribute([
    "text-3xl font-bold",
    hasOffer ? "text-accent" : "text-foreground"
  ], "class:list")}> ${formatPrice(displayPrice)} </span> ${hasOffer && renderTemplate`<span class="text-xl text-muted-foreground line-through"> ${formatPrice(product.price)} </span>`} </div> <!-- Description --> ${product.description && renderTemplate`<p class="text-muted-foreground mb-8 leading-relaxed"> ${product.description} </p>`} <!-- Size Selector + Add to Cart (React Island) --> ${renderComponent($$result2, "ProductAddToCart", ProductAddToCart, { "client:load": true, "productId": product.id, "productName": product.name, "productSlug": product.slug, "price": displayPrice, "imageUrl": mainImage, "variants": variantsForReact, "client:component-hydration": "load", "client:component-path": "@/components/islands/ProductAddToCart", "client:component-export": "default" })} <!-- Product Page Promotion Banner --> <div class="mt-8"> ${renderComponent($$result2, "PromotionBanner", PromotionBanner, { "client:load": true, "zone": "product_page", "className": "rounded-lg aspect-[3/1] max-h-[200px]", "client:component-hydration": "load", "client:component-path": "@/components/ui/PromotionBanner", "client:component-export": "default" })} </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
