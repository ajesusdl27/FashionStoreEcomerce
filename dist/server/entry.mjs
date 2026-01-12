import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BWPfREFm.mjs';
import { manifest } from './manifest_DhJRYegR.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/categorias.astro.mjs');
const _page2 = () => import('./pages/admin/configuracion.astro.mjs');
const _page3 = () => import('./pages/admin/login.astro.mjs');
const _page4 = () => import('./pages/admin/pedidos/_id_.astro.mjs');
const _page5 = () => import('./pages/admin/pedidos.astro.mjs');
const _page6 = () => import('./pages/admin/productos/nuevo.astro.mjs');
const _page7 = () => import('./pages/admin/productos/_id_.astro.mjs');
const _page8 = () => import('./pages/admin/productos.astro.mjs');
const _page9 = () => import('./pages/admin.astro.mjs');
const _page10 = () => import('./pages/api/admin/categorias.astro.mjs');
const _page11 = () => import('./pages/api/admin/configuracion.astro.mjs');
const _page12 = () => import('./pages/api/admin/pedidos.astro.mjs');
const _page13 = () => import('./pages/api/admin/productos.astro.mjs');
const _page14 = () => import('./pages/api/auth/login.astro.mjs');
const _page15 = () => import('./pages/api/auth/logout.astro.mjs');
const _page16 = () => import('./pages/api/auth/set-session.astro.mjs');
const _page17 = () => import('./pages/api/checkout/create-session.astro.mjs');
const _page18 = () => import('./pages/api/upload.astro.mjs');
const _page19 = () => import('./pages/api/webhooks/stripe.astro.mjs');
const _page20 = () => import('./pages/carrito.astro.mjs');
const _page21 = () => import('./pages/categoria/_slug_.astro.mjs');
const _page22 = () => import('./pages/checkout/cancelado.astro.mjs');
const _page23 = () => import('./pages/checkout/exito.astro.mjs');
const _page24 = () => import('./pages/checkout.astro.mjs');
const _page25 = () => import('./pages/cuenta/login.astro.mjs');
const _page26 = () => import('./pages/cuenta/pedidos.astro.mjs');
const _page27 = () => import('./pages/cuenta/registro.astro.mjs');
const _page28 = () => import('./pages/cuenta.astro.mjs');
const _page29 = () => import('./pages/productos/_slug_.astro.mjs');
const _page30 = () => import('./pages/productos.astro.mjs');
const _page31 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/categorias/index.astro", _page1],
    ["src/pages/admin/configuracion/index.astro", _page2],
    ["src/pages/admin/login.astro", _page3],
    ["src/pages/admin/pedidos/[id].astro", _page4],
    ["src/pages/admin/pedidos/index.astro", _page5],
    ["src/pages/admin/productos/nuevo.astro", _page6],
    ["src/pages/admin/productos/[id].astro", _page7],
    ["src/pages/admin/productos/index.astro", _page8],
    ["src/pages/admin/index.astro", _page9],
    ["src/pages/api/admin/categorias.ts", _page10],
    ["src/pages/api/admin/configuracion.ts", _page11],
    ["src/pages/api/admin/pedidos.ts", _page12],
    ["src/pages/api/admin/productos.ts", _page13],
    ["src/pages/api/auth/login.ts", _page14],
    ["src/pages/api/auth/logout.ts", _page15],
    ["src/pages/api/auth/set-session.ts", _page16],
    ["src/pages/api/checkout/create-session.ts", _page17],
    ["src/pages/api/upload.ts", _page18],
    ["src/pages/api/webhooks/stripe.ts", _page19],
    ["src/pages/carrito.astro", _page20],
    ["src/pages/categoria/[slug].astro", _page21],
    ["src/pages/checkout/cancelado.astro", _page22],
    ["src/pages/checkout/exito.astro", _page23],
    ["src/pages/checkout.astro", _page24],
    ["src/pages/cuenta/login.astro", _page25],
    ["src/pages/cuenta/pedidos.astro", _page26],
    ["src/pages/cuenta/registro.astro", _page27],
    ["src/pages/cuenta/index.astro", _page28],
    ["src/pages/productos/[slug].astro", _page29],
    ["src/pages/productos/index.astro", _page30],
    ["src/pages/index.astro", _page31]
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
