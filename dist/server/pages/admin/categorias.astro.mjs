import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C7xUQmWa.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: categories, error } = await supabase.from("categories").select(
    `
    *,
    products:products(count)
  `
  ).order("name");
  const categoriesWithCount = categories?.map((cat) => ({
    ...cat,
    productCount: cat.products?.[0]?.count || 0
  }));
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categor\xEDas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div> <h1 class="font-display text-3xl text-primary">Categorías</h1> <p class="text-muted-foreground mt-1"> ${categories?.length || 0} categorías
</p> </div> <button id="new-category-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Nueva Categoría
</button> </div> ${error && renderTemplate`<div class="p-4 bg-accent/20 border border-accent rounded-lg text-accent">
Error: ${error.message} </div>`} <!-- Categories List --> <div class="glass border border-border rounded-xl overflow-hidden"> <table class="w-full"> <thead class="bg-muted/50 border-b border-border"> <tr> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Nombre</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Slug</th> <th class="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Productos</th> <th class="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acciones</th> </tr> </thead> <tbody class="divide-y divide-border"> ${categoriesWithCount && categoriesWithCount.length > 0 ? categoriesWithCount.map((cat) => renderTemplate`<tr class="hover:bg-muted/30 transition-colors"${addAttribute(cat.id, "data-id")}> <td class="px-6 py-4 font-medium">${cat.name}</td> <td class="px-6 py-4 text-muted-foreground">${cat.slug}</td> <td class="px-6 py-4"> <span class="px-2 py-1 bg-muted rounded text-sm"> ${cat.productCount} </span> </td> <td class="px-6 py-4 text-right"> <div class="flex items-center justify-end gap-2"> <button class="edit-category p-2 hover:bg-muted rounded-lg transition-colors" title="Editar"${addAttribute(cat.id, "data-id")}${addAttribute(cat.name, "data-name")}${addAttribute(cat.slug, "data-slug")}> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> </button> <button class="delete-category p-2 hover:bg-accent/20 text-accent rounded-lg transition-colors" title="Eliminar"${addAttribute(cat.id, "data-id")}${addAttribute(cat.name, "data-name")}> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path> </svg> </button> <a${addAttribute(`/categoria/${cat.slug}`, "href")} target="_blank" class="p-2 hover:bg-muted rounded-lg transition-colors" title="Ver en tienda"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a> </div> </td> </tr>`) : renderTemplate`<tr> <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
No hay categorías todavía
</td> </tr>`} </tbody> </table> </div> </div>  <div id="category-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="modal-backdrop"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full"> <h3 id="modal-title" class="font-heading text-xl mb-4">
Nueva Categoría
</h3> <form id="category-form" class="space-y-4"> <input type="hidden" id="category-id" value=""> <div> <label for="category-name" class="block text-sm font-medium text-muted-foreground mb-2">
Nombre <span class="text-accent">*</span> </label> <input type="text" id="category-name" required class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Ej: Camisetas"> </div> <div> <label for="category-slug" class="block text-sm font-medium text-muted-foreground mb-2">
Slug <span class="text-accent">*</span> </label> <input type="text" id="category-slug" required class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="camisetas"> </div> <div id="form-error" class="hidden p-3 bg-accent/20 text-accent rounded-lg text-sm"></div> <div class="flex justify-end gap-3"> <button type="button" id="cancel-modal" class="px-4 py-2 border border-border rounded-lg hover:bg-muted">
Cancelar
</button> <button type="submit" id="save-category" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80">
Guardar
</button> </div> </form> </div> </div> </div>  <div id="delete-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="bg-card border border-border rounded-xl p-6 max-w-md w-full"> <h3 class="font-heading text-xl mb-4">¿Eliminar categoría?</h3> <p class="text-muted-foreground mb-2">
Vas a eliminar: <strong id="delete-name"></strong> </p> <p class="text-sm text-muted-foreground mb-6">
Los productos asociados se quedarán sin categoría.
</p> <input type="hidden" id="delete-id"> <div class="flex justify-end gap-3"> <button id="cancel-delete" class="px-4 py-2 border border-border rounded-lg hover:bg-muted">
Cancelar
</button> <button id="confirm-delete" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80">
Eliminar
</button> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/categorias/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/categorias/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/categorias/index.astro";
const $$url = "/admin/categorias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
