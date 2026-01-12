import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_DIv2ZrYc.mjs';
import { s as supabase } from '../../../chunks/supabase_CyPcJWDY.mjs';
import { I as ImageUploader } from '../../../chunks/ImageUploader_BpTBlisb.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: product, error } = await supabase.from("products").select(
    `
    *,
    category:categories(id, name),
    images:product_images(id, image_url, order),
    variants:product_variants(id, size, stock)
  `
  ).eq("id", id).single();
  if (error || !product) {
    return Astro2.redirect("/admin/productos?error=not-found");
  }
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const getStockForSize = (size) => {
    const variant = product.variants?.find((v) => v.size === size);
    return variant?.stock || 0;
  };
  const sortedImages = product.images?.sort((a, b) => a.order - b.order) || [];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Editar: ${product.name}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <a href="/admin/productos" class="p-2 hover:bg-muted rounded-lg transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="font-display text-3xl text-primary">Editar Producto</h1> <p class="text-muted-foreground mt-1">${product.name}</p> </div> </div> <button id="delete-btn" class="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors">
Eliminar
</button> </div> <!-- Form --> <form id="product-form" class="space-y-6"> <input type="hidden" id="product-id"${addAttribute(id, "value")}> <!-- Basic Info --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Información Básica</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="name" class="block text-sm font-medium text-muted-foreground mb-2">
Nombre <span class="text-accent">*</span> </label> <input type="text" id="name" name="name" required${addAttribute(product.name, "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="slug" class="block text-sm font-medium text-muted-foreground mb-2">
Slug (URL) <span class="text-accent">*</span> </label> <input type="text" id="slug" name="slug" required${addAttribute(product.slug, "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> </div> <div> <label for="description" class="block text-sm font-medium text-muted-foreground mb-2">
Descripción
</label> <textarea id="description" name="description" rows="4" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none">${product.description}</textarea> </div> <div> <label for="category_id" class="block text-sm font-medium text-muted-foreground mb-2">
Categoría
</label> <select id="category_id" name="category_id" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <option value="">Sin categoría</option> ${categories?.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}${addAttribute(cat.id === product.category_id, "selected")}> ${cat.name} </option>`)} </select> </div> </div> <!-- Pricing --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Precios</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label for="price" class="block text-sm font-medium text-muted-foreground mb-2">
Precio <span class="text-accent">*</span> </label> <div class="relative"> <input type="number" id="price" name="price" required min="0" step="0.01"${addAttribute(product.price, "value")} class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> <div> <label for="offer_price" class="block text-sm font-medium text-muted-foreground mb-2">
Precio Oferta
</label> <div class="relative"> <input type="number" id="offer_price" name="offer_price" min="0" step="0.01"${addAttribute(product.offer_price || "", "value")} class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> <div class="flex items-end"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="is_offer" name="is_offer"${addAttribute(product.is_offer, "checked")} class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <span class="text-sm">Es oferta</span> </label> </div> </div> </div> <!-- Stock by Size --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Stock por Talla</h2> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"> ${sizes.map((size) => renderTemplate`<div> <label${addAttribute(`stock-${size}`, "for")} class="block text-sm font-medium text-muted-foreground mb-2 text-center"> ${size} </label> <input type="number"${addAttribute(`stock-${size}`, "id")}${addAttribute(`stock-${size}`, "name")} min="0"${addAttribute(getStockForSize(size), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div>`)} </div> </div> <!-- Images - React Component --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Imágenes</h2> <p class="text-sm text-muted-foreground">
Arrastra imágenes o haz click para seleccionar. Se convertirán
          automáticamente a WebP.
</p> <div id="image-uploader-container"> ${renderComponent($$result2, "ImageUploader", ImageUploader, { "client:load": true, "initialImages": sortedImages.map((img) => img.image_url), "inputName": "uploaded_images", "inputId": "uploaded-images", "client:component-hydration": "load", "client:component-path": "@/components/islands/ImageUploader", "client:component-export": "default" })} </div> </div> <!-- Status --> <div class="glass border border-border rounded-xl p-6"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="active" name="active"${addAttribute(product.active, "checked")} class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <div> <span class="font-medium">Producto Activo</span> <p class="text-sm text-muted-foreground">
El producto será visible en la tienda
</p> </div> </label> </div> <!-- Actions --> <div class="flex items-center justify-end gap-4"> <a href="/admin/productos" class="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
Cancelar
</a> <button type="submit" id="submit-btn" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50">
Guardar Cambios
</button> </div> <div id="form-message" class="hidden p-4 rounded-lg"></div> </form> </div>  <div id="delete-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full"> <h3 class="font-heading text-xl mb-4">¿Eliminar producto?</h3> <p class="text-muted-foreground mb-6">
Esta acción no se puede deshacer. Se eliminarán también todas las
          variantes e imágenes.
</p> <div class="flex justify-end gap-3"> <button id="cancel-delete" class="px-4 py-2 border border-border rounded-lg hover:bg-muted">
Cancelar
</button> <button id="confirm-delete" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80">
Eliminar
</button> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
