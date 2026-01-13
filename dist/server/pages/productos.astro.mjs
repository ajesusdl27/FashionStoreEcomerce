import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../chunks/PublicLayout_BHSFkYSe.mjs';
import { $ as $$ProductCard } from '../chunks/ProductCard_lB_zlinL.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase } from '../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../renderers.mjs';

function ProductFilters({
  categories,
  initialCategory = "",
  initialSearch = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialOffers = false,
  initialSort = "created_at"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const buildURL = (params) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    return url.toString();
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    window.location.href = buildURL({ q: search || null });
  };
  const handleCategoryChange = (slug) => {
    window.location.href = buildURL({ categoria: slug || null });
  };
  const handleSortChange = (value) => {
    const url = new URL(window.location.href);
    if (value === "price-asc") {
      url.searchParams.set("orden", "price");
      url.searchParams.set("dir", "asc");
    } else if (value === "price-desc") {
      url.searchParams.set("orden", "price");
      url.searchParams.delete("dir");
    } else if (value === "name") {
      url.searchParams.set("orden", "name");
      url.searchParams.set("dir", "asc");
    } else {
      url.searchParams.delete("orden");
      url.searchParams.delete("dir");
    }
    window.location.href = url.toString();
  };
  const handlePriceSubmit = (e) => {
    e.preventDefault();
    window.location.href = buildURL({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null
    });
  };
  const handleOffersToggle = () => {
    const currentOffers = new URL(window.location.href).searchParams.get("ofertas") === "true";
    window.location.href = buildURL({ ofertas: currentOffers ? null : "true" });
  };
  const clearFilters = () => {
    window.location.href = "/productos";
  };
  const hasActiveFilters = initialCategory || initialSearch || initialMinPrice || initialMaxPrice || initialOffers;
  const filterContent = /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "search-input", className: "block font-heading text-sm font-semibold uppercase tracking-wider mb-3", children: "Buscar" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSearchSubmit, className: "relative", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "search-input",
            defaultValue: initialSearch,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Buscar productos...",
            className: "w-full bg-card border border-border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors",
            "aria-label": "Buscar",
            children: /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14 5l7 7m0 0l-7 7m7-7H3" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1.5", children: "Pulsa Enter o el botón para buscar" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-heading text-sm font-semibold uppercase tracking-wider mb-3", children: "Categorías" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleCategoryChange(""),
            className: `block w-full text-left py-1.5 text-sm transition-colors ${!initialCategory ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`,
            children: "Todas"
          }
        ) }),
        categories.map((cat) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleCategoryChange(cat.slug),
            className: `block w-full text-left py-1.5 text-sm transition-colors ${initialCategory === cat.slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`,
            children: cat.name
          }
        ) }, cat.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-heading text-sm font-semibold uppercase tracking-wider mb-3", children: "Rango de Precio" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePriceSubmit, className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              defaultValue: initialMinPrice,
              onChange: (e) => setMinPrice(e.target.value),
              placeholder: "Min €",
              min: "0",
              step: "0.01",
              className: "w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "-" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              defaultValue: initialMaxPrice,
              onChange: (e) => setMaxPrice(e.target.value),
              placeholder: "Max €",
              min: "0",
              step: "0.01",
              className: "w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "w-full py-2 bg-primary text-background rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors",
            children: "Aplicar precio"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-heading text-sm font-semibold uppercase tracking-wider mb-3", children: "Ofertas" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleOffersToggle,
          className: `flex items-center gap-2 py-1.5 text-sm transition-colors ${initialOffers ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: initialOffers ? "text-accent" : "", children: "🔥" }),
            "Solo ofertas"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-heading text-sm font-semibold uppercase tracking-wider mb-3", children: "Ordenar por" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          defaultValue: initialSort,
          onChange: (e) => handleSortChange(e.target.value),
          className: "w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none",
          children: [
            /* @__PURE__ */ jsx("option", { value: "created_at", children: "Más recientes" }),
            /* @__PURE__ */ jsx("option", { value: "price-asc", children: "Precio: menor a mayor" }),
            /* @__PURE__ */ jsx("option", { value: "price-desc", children: "Precio: mayor a menor" }),
            /* @__PURE__ */ jsx("option", { value: "name", children: "Nombre A-Z" })
          ]
        }
      )
    ] }),
    hasActiveFilters && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: clearFilters,
        className: "w-full py-2 text-sm text-accent hover:text-accent/80 transition-colors",
        children: "Limpiar filtros"
      }
    )
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "lg:hidden mb-4", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(true),
        className: "flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) }),
          "Filtros",
          hasActiveFilters && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-primary rounded-full" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("aside", { className: "hidden lg:block w-64 flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "sticky top-24", children: filterContent }) }),
    isOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: () => setIsOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border p-6 overflow-y-auto animate-slide-in-right", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-heading text-xl", children: "Filtros" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsOpen(false),
              className: "p-2 hover:bg-muted rounded-lg transition-colors",
              children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }),
        filterContent
      ] })
    ] })
  ] });
}

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const url = new URL(Astro2.request.url);
  const categoryFilter = url.searchParams.get("categoria");
  const searchQuery = url.searchParams.get("q");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const ofertasFilter = url.searchParams.get("ofertas") === "true";
  const sortBy = url.searchParams.get("orden") || "created_at";
  const sortOrder = url.searchParams.get("dir") === "asc" ? true : false;
  let query = supabase.from("products").select(
    `
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("active", true);
  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }
  if (categoryFilter) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categoryFilter).single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }
  if (minPrice) {
    query = query.gte("price", parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte("price", parseFloat(maxPrice));
  }
  if (ofertasFilter) {
    query = query.eq("is_offer", true);
  }
  query = query.order(sortBy, { ascending: sortOrder });
  const { data: products, error } = await query;
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  let pageTitle = "Todos los Productos";
  if (searchQuery) {
    pageTitle = `Resultados para "${searchQuery}"`;
  } else if (ofertasFilter) {
    pageTitle = "Ofertas";
  } else if (categoryFilter) {
    const category = categories?.find((c) => c.slug === categoryFilter);
    pageTitle = category?.name || "Productos";
  }
  let initialSort = "created_at";
  if (sortBy === "price" && sortOrder) {
    initialSort = "price-asc";
  } else if (sortBy === "price" && !sortOrder) {
    initialSort = "price-desc";
  } else if (sortBy === "name") {
    initialSort = "name";
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": pageTitle }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <!-- Header --> <div class="mb-8"> <h1 class="font-display text-4xl md:text-5xl mb-2">${pageTitle}</h1> <p class="text-muted-foreground"> ${products?.length || 0} productos encontrados
</p> </div> <div class="lg:flex lg:gap-8"> <!-- Filters Component --> ${renderComponent($$result2, "ProductFilters", ProductFilters, { "client:load": true, "categories": categories || [], "initialCategory": categoryFilter || "", "initialSearch": searchQuery || "", "initialMinPrice": minPrice || "", "initialMaxPrice": maxPrice || "", "initialOffers": ofertasFilter, "initialSort": initialSort, "client:component-hydration": "load", "client:component-path": "@/components/islands/ProductFilters", "client:component-export": "default" })} <!-- Products Grid --> <div class="flex-1"> ${error ? renderTemplate`<div class="text-center py-12"> <p class="text-muted-foreground">
Error al cargar productos. Por favor, intenta de nuevo.
</p> </div>` : products && products.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"> ${products.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <div class="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"> <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <p class="text-muted-foreground mb-4">
No se encontraron productos.
</p> <a href="/productos" class="text-primary hover:underline">
Ver todos los productos
</a> </div>`} </div> </div> </div> ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro";
const $$url = "/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
