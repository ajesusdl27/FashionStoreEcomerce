import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_AVb1wNdD.mjs';
import { manifest } from './manifest_BHtvWw1C.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/logout.astro.mjs');
const _page4 = () => import('./pages/api/auth/set-session.astro.mjs');
const _page5 = () => import('./pages/carrito.astro.mjs');
const _page6 = () => import('./pages/categoria/_slug_.astro.mjs');
const _page7 = () => import('./pages/cuenta/login.astro.mjs');
const _page8 = () => import('./pages/cuenta/registro.astro.mjs');
const _page9 = () => import('./pages/cuenta.astro.mjs');
const _page10 = () => import('./pages/productos/_slug_.astro.mjs');
const _page11 = () => import('./pages/productos.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/login.astro", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/logout.ts", _page3],
    ["src/pages/api/auth/set-session.ts", _page4],
    ["src/pages/carrito.astro", _page5],
    ["src/pages/categoria/[slug].astro", _page6],
    ["src/pages/cuenta/login.astro", _page7],
    ["src/pages/cuenta/registro.astro", _page8],
    ["src/pages/cuenta/index.astro", _page9],
    ["src/pages/productos/[slug].astro", _page10],
    ["src/pages/productos/index.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/dist/client/",
    "server": "file:///C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
