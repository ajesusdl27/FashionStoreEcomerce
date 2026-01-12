import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, o as renderSlot, r as renderTemplate } from './astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("http://localhost:4321");
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    variant = "primary",
    size = "md",
    class: className = "",
    href,
    disabled = false,
    loading = false,
    type = "button"
  } = Astro2.props;
  const baseStyles = `
  inline-flex items-center justify-center font-heading tracking-wider
  transition-all duration-base touch-target
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
  disabled:opacity-50 disabled:cursor-not-allowed
`;
  const variants = {
    primary: `
    bg-primary text-primary-foreground 
    hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-[1.02]
    active:scale-[0.98]
  `,
    secondary: `
    bg-card text-foreground border border-border
    hover:bg-muted hover:border-primary/50
    active:scale-[0.98]
  `,
    ghost: `
    bg-transparent text-foreground
    hover:bg-muted hover:text-primary
    active:scale-[0.98]
  `,
    danger: `
    bg-accent text-accent-foreground
    hover:shadow-[0_0_20px_rgba(255,71,87,0.4)] hover:scale-[1.02]
    active:scale-[0.98]
  `
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  const classes = [baseStyles, variants[variant], sizes[size], className].join(
    " "
  );
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(classes, "class")}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(type, "type")}${addAttribute(classes, "class")}${addAttribute(disabled || loading, "disabled")}>${loading ? renderTemplate`<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${renderSlot($$result, $$slots["default"])}</span>` : renderTemplate`${renderSlot($$result, $$slots["default"])}`}</button>`}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/ui/Button.astro", void 0);

export { $$Button as $ };
