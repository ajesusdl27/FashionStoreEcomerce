import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, o as renderSlot, r as renderTemplate } from './astro/server_OR-0JxUe.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("http://localhost:4321");
const $$Badge = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Badge;
  const {
    variant = "default",
    size = "md",
    pulse = false,
    class: className = ""
  } = Astro2.props;
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    error: "bg-accent/20 text-accent border border-accent/30",
    info: "bg-electric/20 text-electric border border-electric/30"
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm"
  };
  return renderTemplate`${maybeRenderHead()}<span${addAttribute([
    "inline-flex items-center font-medium rounded-full",
    variants[variant],
    sizes[size],
    pulse && "animate-pulse",
    className
  ], "class:list")}> ${renderSlot($$result, $$slots["default"])} </span>`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/ui/Badge.astro", void 0);

export { $$Badge as $ };
