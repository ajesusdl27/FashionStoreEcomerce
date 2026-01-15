import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_R9f8eZyp.mjs';
import { c as createAuthenticatedClient } from '../../chunks/supabase_COljrJv9.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  const authClient = createAuthenticatedClient(accessToken, refreshToken);
  const { data: categories, error } = await authClient.from("categories").select(
    `
    *,
    products:products(count)
  `
  ).order("name");
  const categoriesWithCount = categories?.map((cat) => ({
    ...cat,
    productCount: cat.products?.[0]?.count || 0
  }));
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categor\xEDas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <p class="text-muted-foreground"> ${categories?.length || 0} categorías
</p> <button id="new-category-btn" class="admin-btn-primary"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Nueva Categoría
</button> </div> ${error && renderTemplate`<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400">
Error: ${error.message} </div>`} <!-- Categories Grid --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> ${categoriesWithCount && categoriesWithCount.length > 0 ? categoriesWithCount.map((cat) => renderTemplate`<div class="bg-card hover:bg-muted/50 border border-border rounded-xl p-5 transition-all group"${addAttribute(cat.id, "data-id")}> <div class="flex items-start justify-between mb-4">  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"> <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> </div>  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> <button class="edit-category p-2 rounded-lg hover:bg-muted transition-colors" title="Editar"${addAttribute(cat.id, "data-id")}${addAttribute(cat.name, "data-name")}${addAttribute(cat.slug, "data-slug")}${addAttribute(cat.size_type || "clothing", "data-size-type")}> <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> </button> <button class="delete-category p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar"${addAttribute(cat.id, "data-id")}${addAttribute(cat.name, "data-name")}> <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path> </svg> </button> <a${addAttribute(`/categoria/${cat.slug}`, "href")} target="_blank" class="p-2 rounded-lg hover:bg-muted transition-colors" title="Ver en tienda"> <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a> </div> </div>  <h3 class="font-semibold text-lg text-foreground mb-1"> ${cat.name} </h3> <p class="text-sm text-muted-foreground mb-3">/${cat.slug}</p>  <div class="flex items-center gap-2 flex-wrap"> <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"> ${cat.productCount} producto${cat.productCount !== 1 ? "s" : ""} </span> <span${addAttribute([
    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
    cat.size_type === "footwear" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : cat.size_type === "universal" ? "bg-purple-500/20 text-purple-600 dark:text-purple-400" : "bg-green-500/20 text-green-600 dark:text-green-400"
  ], "class:list")}> ${cat.size_type === "footwear" ? "Calzado" : cat.size_type === "universal" ? "\xDAnica" : "Ropa"} </span> </div> </div>`) : renderTemplate`<div class="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border"> <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> <p>No hay categorías todavía</p> </div>`} </div> </div>  <div id="category-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" id="modal-backdrop"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl"> <!-- Modal Header --> <div class="flex items-center justify-between p-6 border-b border-border"> <h3 id="modal-title" class="font-heading text-xl text-foreground">
Nueva Categoría
</h3> <button type="button" id="close-modal-x" class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <!-- Modal Body --> <form id="category-form" class="p-6 space-y-5"> <input type="hidden" id="category-id" value=""> <!-- Name Field --> <div> <label for="category-name" class="block text-sm font-medium text-foreground mb-2">
Nombre <span class="text-red-500">*</span> </label> <input type="text" id="category-name" required class="admin-input w-full" placeholder="Ej: Camisetas"> </div> <!-- Slug Field --> <div> <label for="category-slug" class="block text-sm font-medium text-foreground mb-2">
Slug (URL) <span class="text-red-500">*</span> </label> <div class="relative"> <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">/</span> <input type="text" id="category-slug" required class="admin-input w-full pl-8" placeholder="camisetas"> </div> <label class="flex items-center gap-2 mt-2 cursor-pointer group"> <input type="checkbox" id="auto-slug" checked class="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-0"> <span class="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Auto-generar desde nombre</span> </label> </div> <!-- Size Type Field --> <div> <label for="category-size-type" class="block text-sm font-medium text-foreground mb-2">
Tipo de Tallas
</label> <select id="category-size-type" class="admin-select w-full"> <option value="clothing">Ropa (XXS - XXL)</option> <option value="footwear">Calzado (36 - 46)</option> <option value="universal">Talla Única</option> </select> <p class="text-xs text-muted-foreground mt-1.5">
Define qué tallas estarán disponibles para productos de esta
              categoría
</p> </div> <!-- Error Message --> <div id="form-error" class="hidden p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm"></div> <!-- Actions --> <div class="flex justify-end gap-3 pt-2"> <button type="button" id="cancel-modal" class="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
Cancelar
</button> <button type="submit" id="save-category" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all">
Guardar
</button> </div> </form> </div> </div> </div>  <div id="delete-modal" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <div class="absolute inset-0 flex items-center justify-center p-4"> <div class="admin-card max-w-md w-full"> <h3 class="font-heading text-xl mb-4">¿Eliminar categoría?</h3> <p class="text-zinc-400 mb-2">
Vas a eliminar: <strong class="text-foreground" id="delete-name"></strong> </p> <p class="text-sm text-zinc-500 mb-6">
Los productos asociados se quedarán sin categoría.
</p> <input type="hidden" id="delete-id"> <div class="flex justify-end gap-3"> <button id="cancel-delete" class="admin-btn-secondary">
Cancelar
</button> <button id="confirm-delete" class="admin-btn-danger">
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
