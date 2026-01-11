import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, k as renderComponent, r as renderTemplate } from './astro/server_OR-0JxUe.mjs';
import 'piccolore';
import { $ as $$Badge } from './Badge_CTgy1eQ4.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$ProductCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ProductCard;
  const { product, class: className = "" } = Astro2.props;
  const imageUrl = product.images?.[0]?.image_url || "https://placehold.co/400x400/1a1a1a/ccff00?text=No+Image";
  const hasOffer = product.is_offer && product.offer_price;
  const displayPrice = hasOffer ? product.offer_price : product.price;
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  function calculateDiscount(original, offer) {
    return Math.round((original - offer) / original * 100);
  }
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/productos/${product.slug}`, "href")}${addAttribute(["group block", className], "class:list")}> <div class="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3"> <!-- Image --> <img${addAttribute(imageUrl, "src")}${addAttribute(product.name, "alt")} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async"> <!-- Overlay on hover --> <div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> <!-- Badges --> <div class="absolute top-2 left-2 flex flex-col gap-1"> ${hasOffer && renderTemplate`${renderComponent($$result, "Badge", $$Badge, { "variant": "error", "class": "font-bold" }, { "default": ($$result2) => renderTemplate`
-${calculateDiscount(product.price, product.offer_price)}%
` })}`} ${product.category && renderTemplate`${renderComponent($$result, "Badge", $$Badge, { "variant": "default", "size": "sm" }, { "default": ($$result2) => renderTemplate`${product.category.name}` })}`} </div> <!-- Low stock indicator --> ${isLowStock && renderTemplate`<div class="absolute bottom-2 left-2 right-2"> ${renderComponent($$result, "Badge", $$Badge, { "variant": "warning", "class": "w-full justify-center" }, { "default": ($$result2) => renderTemplate`
⚡ Últimas ${totalStock} unidades
` })} </div>`} <!-- Out of stock --> ${totalStock === 0 && renderTemplate`<div class="absolute inset-0 bg-background/80 flex items-center justify-center"> ${renderComponent($$result, "Badge", $$Badge, { "variant": "error", "size": "md" }, { "default": ($$result2) => renderTemplate`
AGOTADO
` })} </div>`} </div> <!-- Product Info --> <h3 class="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2"> ${product.name} </h3> <div class="flex items-center gap-2"> <span${addAttribute(["font-bold", hasOffer ? "text-accent" : "text-foreground"], "class:list")}> ${formatPrice(displayPrice)} </span> ${hasOffer && renderTemplate`<span class="text-sm text-muted-foreground line-through"> ${formatPrice(product.price)} </span>`} </div> </a>`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/product/ProductCard.astro", void 0);

export { $$ProductCard as $ };
