import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, l as renderScript, h as addAttribute, n as defineScriptVars, m as maybeRenderHead } from '../../../chunks/astro/server_DutnL9ib.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_dMhfTFqq.mjs';
import { s as supabase } from '../../../chunks/supabase_COljrJv9.mjs';
import { I as ImageUploader } from '../../../chunks/ImageUploader_CBXR3Zym.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("http://localhost:4321");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: product, error } = await supabase.from("products").select(
    `
    *,
    category:categories(id, name, size_type),
    images:product_images(id, image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("id", id).single();
  if (error || !product) {
    return Astro2.redirect("/admin/productos?error=not-found");
  }
  const { data: categories } = await supabase.from("categories").select("id, name, size_type").order("name");
  const sizeMappings = {
    clothing: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
    footwear: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
    universal: ["\xDAnica"]
  };
  const categoryTypes = {};
  categories?.forEach((cat) => {
    categoryTypes[cat.id] = cat.size_type || "clothing";
  });
  const existingVariants = {};
  product.variants?.forEach((v) => {
    existingVariants[v.size] = v.stock || 0;
  });
  const sortedImages = product.images?.sort((a, b) => a.order - b.order) || [];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Editar: ${product.name}` }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <a href="/admin/productos" class="p-2 hover:bg-muted rounded-lg transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="font-display text-3xl text-primary">Editar Producto</h1> <p class="text-muted-foreground mt-1">', '</p> </div> </div> <button id="delete-btn" class="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors">\nEliminar\n</button> </div> <!-- Form --> <form id="product-form" class="space-y-6"> <input type="hidden" id="product-id"', '> <!-- Basic Info --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Informaci\xF3n B\xE1sica</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="name" class="block text-sm font-medium text-muted-foreground mb-2">\nNombre <span class="text-accent">*</span> </label> <input type="text" id="name" name="name" required', ' class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="slug" class="block text-sm font-medium text-muted-foreground mb-2">\nSlug (URL) <span class="text-accent">*</span> </label> <input type="text" id="slug" name="slug" required', ' class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> </div> <div> <label for="description" class="block text-sm font-medium text-muted-foreground mb-2">\nDescripci\xF3n\n</label> <textarea id="description" name="description" rows="4" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none">', '</textarea> </div> <div> <label for="category_id" class="block text-sm font-medium text-muted-foreground mb-2">\nCategor\xEDa\n</label> <select id="category_id" name="category_id" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <option value="">Sin categor\xEDa</option> ', ' </select> </div> </div> <!-- Pricing --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Precios</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label for="price" class="block text-sm font-medium text-muted-foreground mb-2">\nPrecio <span class="text-accent">*</span> </label> <div class="relative"> <input type="number" id="price" name="price" required min="0" step="0.01"', ' class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">\u20AC</span> </div> </div> <div> <label for="offer_price" class="block text-sm font-medium text-muted-foreground mb-2">\nPrecio Oferta\n</label> <div class="relative"> <input type="number" id="offer_price" name="offer_price" min="0" step="0.01"', ' class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">\u20AC</span> </div> </div> <div class="flex items-end"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="is_offer" name="is_offer"', ' class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <span class="text-sm">Es oferta</span> </label> </div> </div> </div> <!-- Stock by Size --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Stock por Talla</h2> <div id="sizes-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"> <!-- Sizes will be rendered dynamically via JS --> </div> </div> <!-- Inject data for JS --> <script>(function(){', '\n        window.sizeMappings = sizeMappings;\n        window.categoryTypes = categoryTypes;\n        window.existingVariants = existingVariants;\n        window.currentCategoryId = currentCategoryId;\n      })();<\/script> <!-- Images - React Component --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Im\xE1genes</h2> <p class="text-sm text-muted-foreground">\nArrastra im\xE1genes o haz click para seleccionar. Se convertir\xE1n\n          autom\xE1ticamente a WebP.\n</p> <div id="image-uploader-container"> ', ' </div> </div> <!-- Status --> <div class="glass border border-border rounded-xl p-6"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="active" name="active"', ' class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <div> <span class="font-medium">Producto Activo</span> <p class="text-sm text-muted-foreground">\nEl producto ser\xE1 visible en la tienda\n</p> </div> </label> </div> <!-- Actions --> <div class="flex items-center justify-end gap-4"> <a href="/admin/productos" class="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">\nCancelar\n</a> <button type="submit" id="submit-btn" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50">\nGuardar Cambios\n</button> </div> <div id="form-message" class="hidden p-4 rounded-lg"></div> </form> </div>  <div id="delete-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full"> <h3 class="font-heading text-xl mb-4">\xBFEliminar producto?</h3> <p class="text-muted-foreground mb-6">\nEsta acci\xF3n no se puede deshacer. Se eliminar\xE1n tambi\xE9n todas las\n          variantes e im\xE1genes.\n</p> <div class="flex justify-end gap-3"> <button id="cancel-delete" class="px-4 py-2 border border-border rounded-lg hover:bg-muted">\nCancelar\n</button> <button id="confirm-delete" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80">\nEliminar\n</button> </div> </div> </div> </div> ', " "])), maybeRenderHead(), product.name, addAttribute(id, "value"), addAttribute(product.name, "value"), addAttribute(product.slug, "value"), product.description, categories?.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}${addAttribute(cat.id === product.category_id, "selected")}> ${cat.name} </option>`), addAttribute(product.price, "value"), addAttribute(product.offer_price || "", "value"), addAttribute(product.is_offer, "checked"), defineScriptVars({
    sizeMappings,
    categoryTypes,
    existingVariants,
    currentCategoryId: product.category_id
  }), renderComponent($$result2, "ImageUploader", ImageUploader, { "client:load": true, "initialImages": sortedImages.map((img) => img.image_url), "inputName": "uploaded_images", "inputId": "uploaded-images", "client:component-hydration": "load", "client:component-path": "@/components/islands/ImageUploader", "client:component-export": "default" }), addAttribute(product.active, "checked"), renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/[id].astro?astro&type=script&index=0&lang.ts")) })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/[id].astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/[id].astro";
const $$url = "/admin/productos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
