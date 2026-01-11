import 'piccolore';
import { q as decodeKey } from './chunks/astro/server_DbJgTwsN.mjs';
import 'clsx';
import './chunks/astro-designed-error-pages_fURh6ExP.mjs';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_g_9Jfgzy.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/","cacheDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/node_modules/.astro/","outDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/dist/","srcDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/","publicDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/public/","buildClientDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/dist/client/","buildServerDir":"file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/carrito.ecZPdbEC.css"}],"routeData":{"route":"/carrito","isIndex":false,"type":"page","pattern":"^\\/carrito\\/?$","segments":[[{"content":"carrito","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/carrito.astro","pathname":"/carrito","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/carrito.ecZPdbEC.css"}],"routeData":{"route":"/categoria/[slug]","isIndex":false,"type":"page","pattern":"^\\/categoria\\/([^/]+?)\\/?$","segments":[[{"content":"categoria","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/categoria/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/carrito.ecZPdbEC.css"}],"routeData":{"route":"/productos/[slug]","isIndex":false,"type":"page","pattern":"^\\/productos\\/([^/]+?)\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/productos/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/carrito.ecZPdbEC.css"}],"routeData":{"route":"/productos","isIndex":true,"type":"page","pattern":"^\\/productos\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/productos/index.astro","pathname":"/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/carrito.ecZPdbEC.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"http://localhost:4321","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/carrito.astro",{"propagation":"none","containsHead":true}],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/categoria/[slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/carrito@_@astro":"pages/carrito.astro.mjs","\u0000@astro-page:src/pages/categoria/[slug]@_@astro":"pages/categoria/_slug_.astro.mjs","\u0000@astro-page:src/pages/productos/[slug]@_@astro":"pages/productos/_slug_.astro.mjs","\u0000@astro-page:src/pages/productos/index@_@astro":"pages/productos.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DIBys5m5.mjs","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DrNy4iA2.mjs","@/components/islands/ProductAddToCart":"_astro/ProductAddToCart.DUincMOX.js","@/components/islands/CartSlideOver":"_astro/CartSlideOver.7DYAgQfT.js","@/components/islands/CartIcon":"_astro/CartIcon.B-fAvLHE.js","@astrojs/react/client.js":"_astro/client.9unXo8s5.js","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/carrito.astro?astro&type=script&index=0&lang.ts":"_astro/carrito.astro_astro_type_script_index_0_lang.GzTf8qF_.js","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts":"_astro/_slug_.astro_astro_type_script_index_0_lang.D4lDdwqH.js","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.CY9MHMgh.js","C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/PublicLayout.astro?astro&type=script&index=0&lang.ts":"_astro/PublicLayout.astro_astro_type_script_index_0_lang.D1LV4WhZ.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts","document.querySelectorAll(\".thumbnail-btn\").forEach(e=>{e.addEventListener(\"click\",()=>{const r=document.getElementById(\"main-image\"),t=e.dataset.image;r&&t&&(r.src=t),document.querySelectorAll(\".thumbnail-btn\").forEach(a=>a.classList.remove(\"border-primary\")),e.classList.add(\"border-primary\")})});"],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/index.astro?astro&type=script&index=0&lang.ts","const r=document.getElementById(\"sort-select\");r?.addEventListener(\"change\",()=>{const a=r.value,e=new URL(window.location.href);a===\"created_at\"?(e.searchParams.delete(\"orden\"),e.searchParams.delete(\"dir\")):a===\"price-asc\"?(e.searchParams.set(\"orden\",\"price\"),e.searchParams.set(\"dir\",\"asc\")):a===\"price-desc\"?(e.searchParams.set(\"orden\",\"price\"),e.searchParams.delete(\"dir\")):a===\"name\"&&(e.searchParams.set(\"orden\",\"name\"),e.searchParams.set(\"dir\",\"asc\")),window.location.href=e.toString()});"],["C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/layouts/PublicLayout.astro?astro&type=script&index=0&lang.ts","const m=document.getElementById(\"mobile-menu-btn\"),l=document.getElementById(\"mobile-menu-close\"),e=document.getElementById(\"mobile-menu\"),o=document.getElementById(\"mobile-menu-backdrop\"),n=document.getElementById(\"mobile-menu-panel\");function s(){e?.classList.remove(\"hidden\"),setTimeout(()=>{n?.classList.remove(\"-translate-x-full\")},10)}function t(){n?.classList.add(\"-translate-x-full\"),setTimeout(()=>{e?.classList.add(\"hidden\")},300)}m?.addEventListener(\"click\",s);l?.addEventListener(\"click\",t);o?.addEventListener(\"click\",t);"]],"assets":["/_astro/carrito.ecZPdbEC.css","/hero-bg.svg","/_astro/carrito.astro_astro_type_script_index_0_lang.GzTf8qF_.js","/_astro/cart.Bikz8RX5.js","/_astro/CartIcon.B-fAvLHE.js","/_astro/CartSlideOver.7DYAgQfT.js","/_astro/client.9unXo8s5.js","/_astro/index.Ctr3S7GU.js","/_astro/index.WFquGv8Z.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/ProductAddToCart.DUincMOX.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"RW/Q59vTcYBgpmDRJ/X4zYyN4KzbiFbLcUmYCYqreak=","sessionConfig":{"driver":"fs-lite","options":{"base":"C:\\Users\\anton\\Desktop\\Development\\VictoriaFPII\\Sistema de Gestión Empresarial\\SegundoTrimestre\\Proyectos\\FashionStore\\node_modules\\.astro\\sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
