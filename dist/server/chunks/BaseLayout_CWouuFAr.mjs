import { e as createAstro, f as createComponent, r as renderTemplate, o as renderSlot, p as renderHead, h as addAttribute } from './astro/server_OR-0JxUe.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("http://localhost:4321");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "FashionStore - Tu tienda de streetwear premium con las mejores marcas urbanas.",
    image = "/og-image.jpg"
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  return renderTemplate(_a || (_a = __template(['<html lang="es" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="canonical"', "><!-- SEO --><title>", ' | FashionStore</title><meta name="description"', '><meta name="generator"', '><!-- Open Graph --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', `><!-- Theme --><script>
      // Check for saved theme preference or use dark as default
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    <\/script><!-- Preload fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- View Transitions --><meta name="view-transition" content="same-origin">`, '</head> <body class="min-h-screen bg-background text-foreground font-body antialiased"> ', " </body></html>"])), addAttribute(canonicalURL, "href"), title, addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), addAttribute(canonicalURL, "content"), addAttribute(`${title} | FashionStore`, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), addAttribute(canonicalURL, "content"), addAttribute(`${title} | FashionStore`, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
