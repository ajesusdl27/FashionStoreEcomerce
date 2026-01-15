import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../chunks/astro/server_IieVUzOo.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_R9f8eZyp.mjs';
import { s as supabase } from '../../chunks/supabase_COljrJv9.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: settings } = await supabase.from("settings").select("*");
  const getSettingValue = (key, defaultValue = "") => {
    const setting = settings?.find((s) => s.key === key);
    if (setting?.value_number !== null && setting?.value_number !== void 0) {
      return setting.value_number;
    }
    if (setting?.value !== null && setting?.value !== void 0) {
      return setting.value;
    }
    if (setting?.value_bool !== null && setting?.value_bool !== void 0) {
      return setting.value_bool;
    }
    return defaultValue;
  };
  const getSettingBool = (key) => {
    const setting = settings?.find((s) => s.key === key);
    if (setting?.value_bool !== null && setting?.value_bool !== void 0) {
      return setting.value_bool;
    }
    return setting?.value === "true";
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Configuraci\xF3n" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto space-y-6"> <!-- Header --> <div> <h1 class="font-display text-3xl text-primary">Configuración</h1> <p class="text-muted-foreground mt-1">Ajustes generales de la tienda</p> </div> <!-- Settings --> <form id="settings-form" class="space-y-6"> <!-- Offers Section --> <div class="admin-card space-y-4"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"> <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h2 class="font-heading text-lg">Sección de Ofertas</h2> </div> <label class="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"> <div> <span class="font-medium">Mostrar Flash Offers</span> <p class="text-sm text-muted-foreground">
Activa/desactiva la sección de ofertas en la página principal
</p> </div> <div class="relative"> <input type="checkbox" id="offers_enabled" name="offers_enabled"${addAttribute(getSettingBool("offers_enabled"), "checked")} class="sr-only peer"> <div class="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors"></div> <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div> </div> </label> <div class="p-4 rounded-lg bg-muted/30"> <label for="flash_offers_end" class="block text-sm font-medium text-muted-foreground mb-2">
Fecha y hora de fin de ofertas
</label> <input type="datetime-local" id="flash_offers_end" name="flash_offers_end"${addAttribute(getSettingValue("flash_offers_end", ""), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <p class="text-xs text-muted-foreground mt-2">
La sección de ofertas se ocultará automáticamente cuando llegue esta
            fecha
</p> </div> </div> <!-- Store Info --> <div class="admin-card space-y-4"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"> <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path> </svg> </div> <h2 class="font-heading text-lg">Información de la Tienda</h2> </div> <div class="grid gap-4"> <div> <label for="store_name" class="block text-sm font-medium text-muted-foreground mb-2">
Nombre de la tienda
</label> <input type="text" id="store_name" name="store_name"${addAttribute(getSettingValue("store_name", "FashionStore"), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="store_email" class="block text-sm font-medium text-muted-foreground mb-2">
Email de contacto
</label> <input type="email" id="store_email" name="store_email"${addAttribute(getSettingValue(
    "store_email",
    "contacto@fashionstore.com"
  ), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="store_phone" class="block text-sm font-medium text-muted-foreground mb-2">
Teléfono
</label> <input type="tel" id="store_phone" name="store_phone"${addAttribute(getSettingValue("store_phone", "+34 600 000 000"), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> </div> <div> <label for="store_address" class="block text-sm font-medium text-muted-foreground mb-2">
Dirección
</label> <input type="text" id="store_address" name="store_address"${addAttribute(getSettingValue(
    "store_address",
    "Calle Moda, 123, 28001 Madrid"
  ), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> </div> </div> <!-- Shipping --> <div class="admin-card space-y-4"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"> <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path> </svg> </div> <h2 class="font-heading text-lg">Envío</h2> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="free_shipping_threshold" class="block text-sm font-medium text-muted-foreground mb-2">
Envío gratis desde
</label> <div class="relative"> <input type="number" id="free_shipping_threshold" name="free_shipping_threshold" step="0.01" min="0"${addAttribute(getSettingValue("free_shipping_threshold", "50"), "value")} class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> <p class="text-xs text-muted-foreground mt-1">
Pedidos superiores a este valor tienen envío gratis
</p> </div> <div> <label for="shipping_cost" class="block text-sm font-medium text-muted-foreground mb-2">
Coste de envío estándar
</label> <div class="relative"> <input type="number" id="shipping_cost" name="shipping_cost" step="0.01" min="0"${addAttribute(getSettingValue("shipping_cost", "4.99"), "value")} class="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span> </div> </div> </div> </div> <!-- Social Media --> <div class="admin-card space-y-4"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"> <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path> </svg> </div> <h2 class="font-heading text-lg">Redes Sociales</h2> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="social_instagram" class="block text-sm font-medium text-muted-foreground mb-2">
Instagram
</label> <input type="url" id="social_instagram" name="social_instagram" placeholder="https://instagram.com/tutienda"${addAttribute(getSettingValue("social_instagram", ""), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="social_twitter" class="block text-sm font-medium text-muted-foreground mb-2">
Twitter / X
</label> <input type="url" id="social_twitter" name="social_twitter" placeholder="https://twitter.com/tutienda"${addAttribute(getSettingValue("social_twitter", ""), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="social_tiktok" class="block text-sm font-medium text-muted-foreground mb-2">
TikTok
</label> <input type="url" id="social_tiktok" name="social_tiktok" placeholder="https://tiktok.com/@tutienda"${addAttribute(getSettingValue("social_tiktok", ""), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> <div> <label for="social_youtube" class="block text-sm font-medium text-muted-foreground mb-2">
YouTube
</label> <input type="url" id="social_youtube" name="social_youtube" placeholder="https://youtube.com/tutienda"${addAttribute(getSettingValue("social_youtube", ""), "value")} class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"> </div> </div> </div> <!-- Actions --> <div class="flex justify-end gap-4"> <button type="submit" id="save-btn" class="admin-btn-primary"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
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
