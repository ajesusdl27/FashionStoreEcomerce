import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, o as renderSlot, l as renderScript } from './astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_CtbhpC8N.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useStore } from '@nanostores/react';
import { atom, computed } from 'nanostores';
import { useState, useEffect } from 'react';

const CART_KEY = "fashionstore_cart";
function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
function saveCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}
const $cart = atom(loadCart());
$cart.subscribe((items) => {
  saveCart(items);
});
const $cartCount = computed(
  $cart,
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);
const $cartSubtotal = computed(
  $cart,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
function addToCart(item, quantity = 1) {
  const items = $cart.get();
  const existingIndex = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );
  if (existingIndex >= 0) {
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantity
    };
    $cart.set(updated);
  } else {
    const newItem = {
      ...item,
      id: `${item.productId}-${item.variantId}`,
      quantity
    };
    $cart.set([...items, newItem]);
  }
}
function removeFromCart(itemId) {
  const items = $cart.get();
  $cart.set(items.filter((i) => i.id !== itemId));
}
function updateQuantity(itemId, quantity) {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  const items = $cart.get();
  const updated = items.map(
    (item) => item.id === itemId ? { ...item, quantity } : item
  );
  $cart.set(updated);
}

function CartIcon() {
  const count = useStore($cartCount);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      id: "cart-toggle",
      className: "relative touch-target flex items-center justify-center hover:text-primary transition-colors",
      "aria-label": `Carrito (${count} items)`,
      children: [
        /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          }
        ) }),
        count > 0 && /* @__PURE__ */ jsx(
          "span",
          {
            className: "absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle",
            children: count > 99 ? "99+" : count
          },
          count
        )
      ]
    }
  );
}

function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99
}) {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };
  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center border border-border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: decrease,
        disabled: value <= min,
        className: "w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-label": "Disminuir cantidad",
        children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) })
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "w-10 text-center text-sm font-medium", children: value }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: increase,
        disabled: value >= max,
        className: "w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-label": "Aumentar cantidad",
        children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) })
      }
    )
  ] });
}

function CartSlideOver({
  freeShippingThreshold = 50,
  shippingCost = 4.99
}) {
  const [isOpen, setIsOpen] = useState(false);
  const items = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const freeShippingProgress = Math.min(subtotal / freeShippingThreshold * 100, 100);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const cartBtn = document.getElementById("cart-toggle");
    cartBtn?.addEventListener("click", handleToggle);
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      cartBtn?.removeEventListener("click", handleToggle);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const formatPrice = (price) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(price);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in",
        onClick: () => setIsOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-heading text-xl font-semibold", children: [
              "Tu Carrito (",
              items.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setIsOpen(false),
                className: "touch-target flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                "aria-label": "Cerrar carrito",
                children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
              }
            )
          ] }),
          !isFreeShipping && items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 bg-muted/50", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-2", children: [
              "¡Añade ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: formatPrice(amountToFreeShipping) }),
              " más para envío GRATIS!"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-primary transition-all duration-500 ease-out",
                style: { width: `${freeShippingProgress}%` }
              }
            ) })
          ] }),
          isFreeShipping && items.length > 0 && /* @__PURE__ */ jsx("div", { className: "px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-400 font-medium text-center", children: "🎉 ¡Envío GRATIS!" }) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 text-muted-foreground mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Tu carrito está vacío" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setIsOpen(false),
                className: "text-primary hover:underline",
                children: "Continuar comprando"
              }
            )
          ] }) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: items.map((item) => /* @__PURE__ */ jsxs(
            "li",
            {
              className: "flex gap-4 pb-4 border-b border-border last:border-0",
              children: [
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: `/productos/${item.productSlug}`,
                    className: "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted",
                    children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: item.imageUrl,
                        alt: item.productName,
                        className: "w-full h-full object-cover"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `/productos/${item.productSlug}`,
                      className: "font-medium text-sm hover:text-primary transition-colors line-clamp-1",
                      children: item.productName
                    }
                  ),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                    "Talla: ",
                    item.size
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "font-bold mt-1", children: formatPrice(item.price) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
                  /* @__PURE__ */ jsx(
                    QuantitySelector,
                    {
                      value: item.quantity,
                      onChange: (qty) => updateQuantity(item.id, qty),
                      min: 1,
                      max: 10
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => removeFromCart(item.id),
                      className: "text-xs text-muted-foreground hover:text-accent transition-colors",
                      children: "Eliminar"
                    }
                  )
                ] })
              ]
            },
            item.id
          )) }) }),
          items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-border px-6 py-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
                /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Envío" }),
                /* @__PURE__ */ jsx("span", { className: isFreeShipping ? "text-emerald-400" : "", children: isFreeShipping ? "GRATIS" : formatPrice(shippingCost) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-lg pt-2 border-t border-border", children: [
                /* @__PURE__ */ jsx("span", { children: "Total" }),
                /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal + (isFreeShipping ? 0 : shippingCost)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/checkout",
                  className: "block w-full py-4 bg-primary text-primary-foreground text-center font-heading text-lg tracking-wider hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all",
                  children: "FINALIZAR COMPRA"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setIsOpen(false),
                  className: "block w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors",
                  children: "Continuar comprando"
                }
              )
            ] })
          ] })
        ]
      }
    )
  ] });
}

const $$Astro = createAstro("http://localhost:4321");
const $$PublicLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PublicLayout;
  const { title, description } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "CartSlideOver", CartSlideOver, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/islands/CartSlideOver", "client:component-export": "default" })}  ${maybeRenderHead()}<header class="sticky top-0 z-50 glass border-b border-border"> <div class="container mx-auto px-4"> <div class="flex items-center justify-between h-16"> <!-- Mobile Menu Button --> <button id="mobile-menu-btn" class="lg:hidden touch-target flex items-center justify-center" aria-label="Abrir menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <!-- Logo --> <a href="/" class="font-display text-2xl tracking-wider text-primary hover:animate-pulse-glow transition-all">
FASHIONSTORE
</a> <!-- Desktop Navigation --> <nav class="hidden lg:flex items-center gap-8"> <a href="/" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a> <a href="/productos" class="text-sm font-medium hover:text-primary transition-colors">Productos</a> <a href="/productos?ofertas=true" class="text-sm font-medium text-accent hover:text-accent/80 transition-colors">Ofertas</a> </nav> <!-- Actions --> <div class="flex items-center gap-4"> <!-- Search --> <button id="search-btn" class="touch-target flex items-center justify-center hover:text-primary transition-colors" aria-label="Buscar"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </button> <!-- User Account --> <a href="/cuenta" class="touch-target flex items-center justify-center hover:text-primary transition-colors" aria-label="Mi cuenta"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </a> <!-- Cart (React Island) --> ${renderComponent($$result2, "CartIcon", CartIcon, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/islands/CartIcon", "client:component-export": "default" })} </div> </div> </div> </header>  <div id="mobile-menu" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="mobile-menu-backdrop"></div> <nav class="absolute left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-card border-r border-border p-6 transform -translate-x-full transition-transform duration-300" id="mobile-menu-panel"> <div class="flex items-center justify-between mb-8"> <span class="font-display text-xl text-primary">FASHIONSTORE</span> <button id="mobile-menu-close" class="touch-target" aria-label="Cerrar menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <div class="space-y-4"> <a href="/" class="block py-3 text-lg font-medium hover:text-primary transition-colors">🏠 Inicio</a> <a href="/productos" class="block py-3 text-lg font-medium hover:text-primary transition-colors">👕 Productos</a> <a href="/productos?ofertas=true" class="block py-3 text-lg font-medium text-accent hover:text-accent/80 transition-colors">🔥 Ofertas</a> <hr class="border-border my-4"> <a href="/cuenta" class="block py-3 text-lg font-medium hover:text-primary transition-colors">👤 Mi Cuenta</a> <a href="/cuenta/pedidos" class="block py-3 text-lg font-medium hover:text-primary transition-colors">📦 Mis Pedidos</a> </div> </nav> </div>  <main class="flex-1"> ${renderSlot($$result2, $$slots["default"])} </main>  <footer class="bg-card border-t border-border mt-16"> <div class="container mx-auto px-4 py-12"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> <!-- Brand --> <div> <span class="font-display text-2xl text-primary">FASHIONSTORE</span> <p class="mt-4 text-sm text-muted-foreground">
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

export { $$PublicLayout as $, $cart as a, $cartSubtotal as b, addToCart as c };
