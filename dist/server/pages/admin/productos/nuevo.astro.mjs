import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_CZ3D3ixx.mjs';
import { I as ImageUploader } from '../../../chunks/ImageUploader_CBXR3Zym.mjs';
import { s as supabase } from '../../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Nuevo = createComponent(async ($$result, $$props, $$slots) => {
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Nuevo Producto" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center gap-4"> <a href="/admin/productos" class="p-2 hover:bg-muted rounded-lg transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="font-display text-3xl text-primary">Nuevo Producto</h1> <p class="text-muted-foreground mt-1">
Añade un nuevo producto a tu catálogo
</p> </div> </div> <!-- Form --> <form id="product-form" class="space-y-6"> <!-- Basic Info --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Información Básica</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="name" class="block text-sm font-medium text-muted-foreground mb-2">
Nombre <span class="text-accent">*</span> </label> <input type="text" id="name" name="name" required class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Ej: Camiseta Urban Supreme"> </div> <div> <label for="slug" class="block text-sm font-medium text-muted-foreground mb-2">
Slug (URL) <span class="text-accent">*</span> </label> <input type="text" id="slug" name="slug" required class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="camiseta-urban-supreme"> </div> </div> <div> <label for="description" class="block text-sm font-medium text-muted-foreground mb-2">
Descripción
</label> <textarea id="description" name="description" rows="4" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none" placeholder="Descripción del producto..."></textarea> </div> <div> <label for="category_id" class="block text-sm font-medium text-muted-foreground mb-2">
Categoría
</label> <select id="category_id" name="category_id" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <option value="">Sin categoría</option> ${categories?.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}>${cat.name}</option>`)} </select> </div> </div> <!-- Pricing --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Precios</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label for="price" class="block text-sm font-medium text-muted-foreground mb-2">
Precio <span class="text-accent">*</span> </label> <div class="relative"> <input type="number" id="price" name="price" required min="0" step="0.01" class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="29.99"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> <div> <label for="offer_price" class="block text-sm font-medium text-muted-foreground mb-2">
Precio Oferta
</label> <div class="relative"> <input type="number" id="offer_price" name="offer_price" min="0" step="0.01" class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="19.99"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> <div class="flex items-end"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="is_offer" name="is_offer" class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <span class="text-sm">Es oferta</span> </label> </div> </div> </div> <!-- Stock by Size --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Stock por Talla</h2> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"> ${sizes.map((size) => renderTemplate`<div> <label${addAttribute(`stock-${size}`, "for")} class="block text-sm font-medium text-muted-foreground mb-2 text-center"> ${size} </label> <input type="number"${addAttribute(`stock-${size}`, "id")}${addAttribute(`stock-${size}`, "name")} min="0" value="0" class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div>`)} </div> </div> <!-- Images - React Component --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Imágenes</h2> <p class="text-sm text-muted-foreground">
Arrastra imágenes o haz click para seleccionar. Se convertirán
          automáticamente a WebP.
</p> <div id="image-uploader-container"> ${renderComponent($$result2, "ImageUploader", ImageUploader, { "client:load": true, "inputName": "uploaded_images", "inputId": "uploaded-images", "client:component-hydration": "load", "client:component-path": "@/components/islands/ImageUploader", "client:component-export": "default" })} </div> </div> <!-- Fallback: Manual URL input --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg flex items-center gap-2"> <span>O añade URLs manualmente</span> <span class="text-xs text-muted-foreground">(opcional)</span> </h2> <div id="images-container" class="space-y-2"> <div class="flex gap-2 image-input"> <input type="url" name="images[]" class="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="https://ejemplo.com/imagen.jpg"> <button type="button" class="remove-image p-3 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors hidden"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> </div> <button type="button" id="add-image" class="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Añadir URL
</button> </div> <!-- Status --> <div class="glass border border-border rounded-xl p-6"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="active" name="active" checked class="w-5 h-5 rounded border-border bg-card text-primary focus:ring-primary"> <div> <span class="font-medium">Producto Activo</span> <p class="text-sm text-muted-foreground">
El producto será visible en la tienda
</p> </div> </label> </div> <!-- Actions --> <div class="flex items-center justify-end gap-4"> <a href="/admin/productos" class="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
Cancelar
</a> <button type="submit" id="submit-btn" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50">
Crear Producto
</button> </div> <div id="form-message" class="hidden p-4 rounded-lg"></div> </form> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/nuevo.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/nuevo.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/productos/nuevo.astro";
const $$url = "/admin/productos/nuevo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Nuevo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
