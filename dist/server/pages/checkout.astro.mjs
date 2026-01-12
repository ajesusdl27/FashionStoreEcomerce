import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { a as $cart, b as $cartSubtotal, $ as $$PublicLayout } from '../chunks/PublicLayout_CDKIQy5M.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
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
        customerName: userData.name || prev.customerName,
        customerEmail: userData.email || prev.customerEmail,
        customerPhone: userData.phone || prev.customerPhone
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
  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.customerName.trim()) {
          setError("El nombre es obligatorio");
          return false;
        }
        if (!formData.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
          setError("Introduce un email válido");
          return false;
        }
        return true;
      case 2:
        if (!formData.shippingAddress.trim()) {
          setError("La dirección es obligatoria");
          return false;
        }
        if (!formData.shippingCity.trim()) {
          setError("La ciudad es obligatoria");
          return false;
        }
        if (!formData.shippingPostalCode.trim() || !/^\d{5}$/.test(formData.shippingPostalCode)) {
          setError("Introduce un código postal válido (5 dígitos)");
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          ...formData
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };
  const stepIndicator = /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-8", children: [1, 2, 3].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s === step ? "bg-primary text-background scale-110" : s < step ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`,
        children: s < step ? "✓" : s
      }
    ),
    i < 2 && /* @__PURE__ */ jsx(
      "div",
      {
        className: `w-16 md:w-24 h-1 mx-2 transition-all ${s < step ? "bg-emerald-500" : "bg-muted"}`
      }
    )
  ] }, s)) });
  const stepLabels = ["Datos personales", "Dirección de envío", "Resumen y pago"];
  return /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-5 lg:gap-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
      stepIndicator,
      /* @__PURE__ */ jsxs("p", { className: "text-center text-muted-foreground mb-8", children: [
        "Paso ",
        step,
        " de 3: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: stepLabels[step - 1] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg mb-6 animate-shake", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-6 md:p-8", children: [
        step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fadeIn", children: [
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
            /* @__PURE__ */ jsxs("label", { htmlFor: "phone", className: "block text-sm font-medium mb-2", children: [
              "Teléfono ",
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "(opcional)" })
            ] }),
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
        step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fadeIn", children: [
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
        step === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fadeIn", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-heading text-lg font-semibold mb-4", children: "Datos de contacto" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-4 space-y-1 text-sm", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Nombre:" }),
                " ",
                formData.customerName
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Email:" }),
                " ",
                formData.customerEmail
              ] }),
              formData.customerPhone && /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Teléfono:" }),
                " ",
                formData.customerPhone
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-heading text-lg font-semibold mb-4", children: "Dirección de envío" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-4 text-sm", children: [
              /* @__PURE__ */ jsx("p", { children: formData.shippingAddress }),
              /* @__PURE__ */ jsxs("p", { children: [
                formData.shippingPostalCode,
                " ",
                formData.shippingCity
              ] }),
              /* @__PURE__ */ jsx("p", { children: "España" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-heading text-lg font-semibold mb-4", children: [
              "Productos (",
              cart.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[200px] overflow-y-auto", children: cart.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.imageUrl,
                  alt: item.productName,
                  className: "w-12 h-12 object-cover rounded-lg"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: item.productName }),
                /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                  "Talla ",
                  item.size,
                  " × ",
                  item.quantity
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatPrice(item.price * item.quantity) })
            ] }, item.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-8", children: [
          step > 1 && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: prevStep,
              disabled: loading,
              className: "flex-1 py-3 px-6 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50",
              children: "Atrás"
            }
          ),
          step < 3 ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: nextStep,
              className: "flex-1 py-3 px-6 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors",
              children: "Continuar"
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSubmit,
              disabled: loading,
              className: "flex-1 py-3 px-6 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
                ] }),
                "Procesando..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                "🔒 Pagar ",
                formatPrice(total)
              ] })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 mt-8 lg:mt-0", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-6 sticky top-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-heading text-xl font-semibold mb-6", children: "Resumen del pedido" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6 max-h-[300px] overflow-y-auto", children: cart.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item.imageUrl,
              alt: item.productName,
              className: "w-full h-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-muted-foreground text-background text-xs rounded-full flex items-center justify-center", children: item.quantity })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-sm truncate", children: item.productName }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Talla: ",
            item.size
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-sm mt-1", children: formatPrice(item.price * item.quantity) })
        ] })
      ] }, item.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-4 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Envío" }),
          /* @__PURE__ */ jsx("span", { className: shipping === 0 ? "text-emerald-400 font-medium" : "", children: shipping === 0 ? "GRATIS" : formatPrice(shipping) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2 border-t border-border text-lg font-bold", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: formatPrice(total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t border-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
          "Pago seguro con Stripe"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground mt-2", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          "Reserva de stock por 30 minutos"
        ] })
      ] })
    ] }) })
  ] });
}

const $$Astro = createAstro("http://localhost:4321");
const $$Checkout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Checkout;
  const user = Astro2.locals.user;
  const userData = user ? {
    name: user.user_metadata?.full_name || "",
    email: user.email || "",
    phone: user.user_metadata?.phone || ""
  } : null;
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Checkout - FashionStore", "data-astro-cid-ojox7d5b": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8" data-astro-cid-ojox7d5b> <h1 class="font-display text-4xl md:text-5xl text-center mb-8" data-astro-cid-ojox7d5b>
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
