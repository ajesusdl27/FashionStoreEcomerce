import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CB4JPvDC.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: settings } = await supabase.from("settings").select("*");
  const getSettingValue = (key) => {
    const setting = settings?.find((s) => s.key === key);
    return setting?.value_bool ?? setting?.value ?? false;
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Configuraci\xF3n" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto space-y-6"> <!-- Header --> <div> <h1 class="font-display text-3xl text-primary">Configuración</h1> <p class="text-muted-foreground mt-1">Ajustes generales de la tienda</p> </div> <!-- Settings --> <form id="settings-form" class="space-y-6"> <!-- Offers Section --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Sección de Ofertas</h2> <label class="flex items-center justify-between cursor-pointer"> <div> <span class="font-medium">Mostrar Flash Offers</span> <p class="text-sm text-muted-foreground">
Activa/desactiva la sección de ofertas en la página principal
</p> </div> <div class="relative"> <input type="checkbox" id="offers_enabled" name="offers_enabled"${addAttribute(getSettingValue("offers_enabled"), "checked")} class="sr-only peer"> <div class="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors"></div> <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div> </div> </label> </div> <!-- Store Info (placeholder for future) --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Información de la Tienda</h2> <div class="grid gap-4"> <div> <label for="store_name" class="block text-sm font-medium text-muted-foreground mb-2">
Nombre de la tienda
</label> <input type="text" id="store_name" name="store_name" value="FashionStore" disabled class="w-full px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"> <p class="text-xs text-muted-foreground mt-1">
Configuración fija por ahora
</p> </div> </div> </div> <!-- Shipping (placeholder) --> <div class="glass border border-border rounded-xl p-6 space-y-4"> <h2 class="font-heading text-lg">Envío</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-muted-foreground mb-2">
Envío gratis desde
</label> <div class="relative"> <input type="number" value="50" disabled class="w-full px-4 py-3 pr-12 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> <div> <label class="block text-sm font-medium text-muted-foreground mb-2">
Coste de envío
</label> <div class="relative"> <input type="number" value="4.99" disabled class="w-full px-4 py-3 pr-12 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> </div> <p class="text-xs text-muted-foreground">
Estos valores se configuran en el código por ahora
</p> </div> <!-- Actions --> <div class="flex justify-end"> <button type="submit" id="save-btn" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50">
Guardar Cambios
</button> </div> <div id="form-message" class="hidden p-4 rounded-lg"></div> </form> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/configuracion/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/configuracion/index.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/configuracion/index.astro";
const $$url = "/admin/configuracion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
