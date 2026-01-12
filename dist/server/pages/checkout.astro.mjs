import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { a as $cart, b as $cartSubtotal, $ as $$PublicLayout } from '../chunks/PublicLayout_CVZpYtDs.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { c as createAuthenticatedClient } from '../chunks/supabase_CjGuiMY7.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;
const initialFormData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingPostalCode: ""
};
function formatPrice(price) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(price);
}
function CheckoutForm({ userData }) {
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        customerName: userData.name || initialFormData.customerName,
        customerEmail: userData.email || initialFormData.customerEmail,
        customerPhone: userData.phone || initialFormData.customerPhone,
        shippingAddress: userData.address || initialFormData.shippingAddress,
        shippingCity: userData.city || initialFormData.shippingCity,
        shippingPostalCode: userData.postalCode || initialFormData.shippingPostalCode
      }));
    }
  }, [userData]);
  useEffect(() => {
    if (cart.length === 0 && typeof window !== "undefined") {
      window.location.href = "/carrito";
    }
  }, [cart]);
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.customerName || !formData.customerEmail) {
        setError("Por favor completa todos los campos obligatorios");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
        setError("Por favor completa la dirección de envío");
        return;
      }
      setStep(3);
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const mappedItems = cart.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        variantId: item.variantId,
        size: item.size,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity
      }));
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: mappedItems,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          shippingAddress: formData.shippingAddress,
          shippingCity: formData.shippingCity,
          shippingPostalCode: formData.shippingPostalCode
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar el pago");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Error al iniciar el pago");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Hubo un error al procesar tu pedido. Por favor inténtalo de nuevo.");
      setLoading(false);
    }
  };
  if (cart.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8 max-w-md mx-auto", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? "bg-primary text-background" : "bg-secondary text-muted-foreground"}`,
            children: s
          }
        ),
        s < 3 && /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-16 h-1 mx-2 transition-colors ${step > s ? "bg-primary" : "bg-secondary"}`
          }
        )
      ] }, s)) }),
      /* @__PURE__ */ jsxs("div", { className: "glass border border-border rounded-2xl p-6 md:p-8", children: [
        step === 1 && /* @__PURE__ */ jsxs("div", { className: "animate-fadeIn space-y-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-heading text-xl mb-6", children: "Paso 1 de 3: Datos personales" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium mb-2", children: "Nombre completo *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                value: formData.customerName,
                onChange: (e) => updateField("customerName", e.target.value),
                className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                placeholder: "Tu nombre completo",
                autoComplete: "name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium mb-2", children: "Email *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                value: formData.customerEmail,
                onChange: (e) => updateField("customerEmail", e.target.value),
                className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                placeholder: "tu@email.com",
                autoComplete: "email"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium mb-2", children: "Teléfono (opcional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "phone",
                value: formData.customerPhone,
                onChange: (e) => updateField("customerPhone", e.target.value),
                className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                placeholder: "612 345 678",
                autoComplete: "tel"
              }
            )
          ] })
        ] }),
        step === 2 && /* @__PURE__ */ jsxs("div", { className: "animate-fadeIn space-y-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-heading text-xl mb-6", children: "Paso 2 de 3: Dirección de envío" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "address", className: "block text-sm font-medium mb-2", children: "Dirección *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "address",
                value: formData.shippingAddress,
                onChange: (e) => updateField("shippingAddress", e.target.value),
                className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                placeholder: "Calle, número, piso...",
                autoComplete: "street-address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "city", className: "block text-sm font-medium mb-2", children: "Ciudad *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "city",
                  value: formData.shippingCity,
                  onChange: (e) => updateField("shippingCity", e.target.value),
                  className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                  placeholder: "Madrid",
                  autoComplete: "address-level2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "postal", className: "block text-sm font-medium mb-2", children: "Código postal *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "postal",
                  value: formData.shippingPostalCode,
                  onChange: (e) => updateField("shippingPostalCode", e.target.value),
                  className: "w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                  placeholder: "28001",
                  maxLength: 5,
                  autoComplete: "postal-code"
                }
              )
            ] })
          ] })
        ] }),
        step === 3 && /* @__PURE__ */ jsxs("div", { className: "animate-fadeIn space-y-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-heading text-xl mb-6", children: "Paso 3 de 3: Confirmación" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 p-4 rounded-lg space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1", children: "Contacto" }),
              /* @__PURE__ */ jsx("p", { children: formData.customerName }),
              /* @__PURE__ */ jsx("p", { children: formData.customerEmail }),
              /* @__PURE__ */ jsx("p", { children: formData.customerPhone })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1", children: "Envío a" }),
              /* @__PURE__ */ jsx("p", { children: formData.shippingAddress }),
              /* @__PURE__ */ jsxs("p", { children: [
                formData.shippingPostalCode,
                " ",
                formData.shippingCity
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-primary mt-0.5 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-primary mb-1", children: "Redirección segura" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Serás redirigido a la pasarela de pago segura de Stripe para completar tu compra." })
            ] })
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: `mt-6 p-4 rounded-lg bg-accent/10 border border-accent text-accent animate-shake`, children: error }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-4", children: [
          step > 1 && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStep((s) => s - 1),
              className: "flex-1 px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-bold transition-colors",
              children: "Atrás"
            }
          ),
          step < 3 ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleNextStep,
              className: "flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors",
              children: "Continuar"
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSubmit,
              disabled: loading,
              className: "flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
                ] }),
                "Procesando..."
              ] }) : "Pagar ahora"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full lg:w-96", children: /* @__PURE__ */ jsxs("div", { className: "glass border border-border rounded-xl p-6 sticky top-24", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-heading text-xl mb-4", children: "Resumen del pedido" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar", children: cart.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0", children: /* @__PURE__ */ jsx("img", { src: item.imageUrl, alt: item.productName, className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm truncate", children: item.productName }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Talla: ",
            item.size
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: formatPrice(item.price) })
        ] })
      ] }, `${item.id}-${item.size}`)) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 py-4 border-t border-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Envío" }),
          /* @__PURE__ */ jsx("span", { children: shipping === 0 ? "Gratis" : formatPrice(shipping) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsx("span", { className: "font-heading text-lg", children: "Total" }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("span", { className: "block font-heading text-2xl text-primary", children: formatPrice(total) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "IVA incluido" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
          "Pago seguro con Stripe"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          "Reserva de stock por 30 minutos"
        ] })
      ] })
    ] }) })
  ] });
}

const $$Astro = createAstro("http://localhost:4321");
const $$Checkout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Checkout;
  const user = Astro2.locals.user;
  let userData = null;
  if (user) {
    const accessToken = Astro2.cookies.get("sb-access-token")?.value;
    const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { data: profileData } = await authClient.rpc("get_customer_profile");
    const profile = profileData && profileData.length > 0 ? profileData[0] : null;
    userData = {
      name: profile?.full_name || user.user_metadata?.full_name || "",
      email: profile?.email || user.email || "",
      phone: profile?.phone || user.user_metadata?.phone || "",
      address: profile?.default_address || "",
      city: profile?.default_city || "",
      postalCode: profile?.default_postal_code || ""
    };
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Checkout - FashionStore", "data-astro-cid-ojox7d5b": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8" data-astro-cid-ojox7d5b> <h1 class="font-display text-4xl md:text-5xl text-center mb-8" data-astro-cid-ojox7d5b>
Finalizar Compra
</h1> ${renderComponent($$result2, "CheckoutForm", CheckoutForm, { "client:load": true, "userData": userData, "client:component-hydration": "load", "client:component-path": "@/components/islands/CheckoutForm", "client:component-export": "default", "data-astro-cid-ojox7d5b": true })} </div> ` })} `;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout.astro";
const $$url = "/checkout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Checkout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
