import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Lkqk63FZ.mjs';
import { manifest } from './manifest_DXsYUsu1.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/categorias.astro.mjs');
const _page2 = () => import('./pages/admin/configuracion.astro.mjs');
const _page3 = () => import('./pages/admin/cupones.astro.mjs');
const _page4 = () => import('./pages/admin/login.astro.mjs');
const _page5 = () => import('./pages/admin/newsletter/new.astro.mjs');
const _page6 = () => import('./pages/admin/newsletter/send/_id_.astro.mjs');
const _page7 = () => import('./pages/admin/newsletter/subscribers.astro.mjs');
const _page8 = () => import('./pages/admin/newsletter.astro.mjs');
const _page9 = () => import('./pages/admin/pedidos/_id_.astro.mjs');
const _page10 = () => import('./pages/admin/pedidos.astro.mjs');
const _page11 = () => import('./pages/admin/productos/nuevo.astro.mjs');
const _page12 = () => import('./pages/admin/productos/_id_.astro.mjs');
const _page13 = () => import('./pages/admin/productos.astro.mjs');
const _page14 = () => import('./pages/admin/promociones/editar/_id_.astro.mjs');
const _page15 = () => import('./pages/admin/promociones/nueva.astro.mjs');
const _page16 = () => import('./pages/admin/promociones.astro.mjs');
const _page17 = () => import('./pages/admin.astro.mjs');
const _page18 = () => import('./pages/api/admin/categorias.astro.mjs');
const _page19 = () => import('./pages/api/admin/configuracion.astro.mjs');
const _page20 = () => import('./pages/api/admin/cupones.astro.mjs');
const _page21 = () => import('./pages/api/admin/newsletter/campaigns.astro.mjs');
const _page22 = () => import('./pages/api/admin/newsletter/mark-sent.astro.mjs');
const _page23 = () => import('./pages/api/admin/newsletter/send-chunk.astro.mjs');
const _page24 = () => import('./pages/api/admin/newsletter/toggle-subscriber.astro.mjs');
const _page25 = () => import('./pages/api/admin/pedidos.astro.mjs');
const _page26 = () => import('./pages/api/admin/productos.astro.mjs');
const _page27 = () => import('./pages/api/admin/promociones.astro.mjs');
const _page28 = () => import('./pages/api/auth/get-session.astro.mjs');
const _page29 = () => import('./pages/api/auth/login.astro.mjs');
const _page30 = () => import('./pages/api/auth/logout.astro.mjs');
const _page31 = () => import('./pages/api/auth/set-session.astro.mjs');
const _page32 = () => import('./pages/api/checkout/create-session.astro.mjs');
const _page33 = () => import('./pages/api/coupons/validate.astro.mjs');
const _page34 = () => import('./pages/api/customer/profile.astro.mjs');
const _page35 = () => import('./pages/api/newsletter/subscribe.astro.mjs');
const _page36 = () => import('./pages/api/upload.astro.mjs');
const _page37 = () => import('./pages/api/webhooks/stripe.astro.mjs');
const _page38 = () => import('./pages/carrito.astro.mjs');
const _page39 = () => import('./pages/categoria/_slug_.astro.mjs');
const _page40 = () => import('./pages/checkout/cancelado.astro.mjs');
const _page41 = () => import('./pages/checkout/exito.astro.mjs');
const _page42 = () => import('./pages/checkout.astro.mjs');
const _page43 = () => import('./pages/contacto.astro.mjs');
const _page44 = () => import('./pages/cuenta/login.astro.mjs');
const _page45 = () => import('./pages/cuenta/pedidos/_id_.astro.mjs');
const _page46 = () => import('./pages/cuenta/pedidos.astro.mjs');
const _page47 = () => import('./pages/cuenta/perfil.astro.mjs');
const _page48 = () => import('./pages/cuenta/recuperar-password.astro.mjs');
const _page49 = () => import('./pages/cuenta/registro.astro.mjs');
const _page50 = () => import('./pages/cuenta/reset-password.astro.mjs');
const _page51 = () => import('./pages/cuenta.astro.mjs');
const _page52 = () => import('./pages/envios.astro.mjs');
const _page53 = () => import('./pages/privacidad.astro.mjs');
const _page54 = () => import('./pages/productos/_slug_.astro.mjs');
const _page55 = () => import('./pages/productos.astro.mjs');
const _page56 = () => import('./pages/terminos.astro.mjs');
const _page57 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/categorias/index.astro", _page1],
    ["src/pages/admin/configuracion/index.astro", _page2],
    ["src/pages/admin/cupones/index.astro", _page3],
    ["src/pages/admin/login.astro", _page4],
    ["src/pages/admin/newsletter/new.astro", _page5],
    ["src/pages/admin/newsletter/send/[id].astro", _page6],
    ["src/pages/admin/newsletter/subscribers.astro", _page7],
    ["src/pages/admin/newsletter/index.astro", _page8],
    ["src/pages/admin/pedidos/[id].astro", _page9],
    ["src/pages/admin/pedidos/index.astro", _page10],
    ["src/pages/admin/productos/nuevo.astro", _page11],
    ["src/pages/admin/productos/[id].astro", _page12],
    ["src/pages/admin/productos/index.astro", _page13],
    ["src/pages/admin/promociones/editar/[id].astro", _page14],
    ["src/pages/admin/promociones/nueva.astro", _page15],
    ["src/pages/admin/promociones/index.astro", _page16],
    ["src/pages/admin/index.astro", _page17],
    ["src/pages/api/admin/categorias.ts", _page18],
    ["src/pages/api/admin/configuracion.ts", _page19],
    ["src/pages/api/admin/cupones.ts", _page20],
    ["src/pages/api/admin/newsletter/campaigns.ts", _page21],
    ["src/pages/api/admin/newsletter/mark-sent.ts", _page22],
    ["src/pages/api/admin/newsletter/send-chunk.ts", _page23],
    ["src/pages/api/admin/newsletter/toggle-subscriber.ts", _page24],
    ["src/pages/api/admin/pedidos.ts", _page25],
    ["src/pages/api/admin/productos.ts", _page26],
    ["src/pages/api/admin/promociones.ts", _page27],
    ["src/pages/api/auth/get-session.ts", _page28],
    ["src/pages/api/auth/login.ts", _page29],
    ["src/pages/api/auth/logout.ts", _page30],
    ["src/pages/api/auth/set-session.ts", _page31],
    ["src/pages/api/checkout/create-session.ts", _page32],
    ["src/pages/api/coupons/validate.ts", _page33],
    ["src/pages/api/customer/profile.ts", _page34],
    ["src/pages/api/newsletter/subscribe.ts", _page35],
    ["src/pages/api/upload.ts", _page36],
    ["src/pages/api/webhooks/stripe.ts", _page37],
    ["src/pages/carrito.astro", _page38],
    ["src/pages/categoria/[slug].astro", _page39],
    ["src/pages/checkout/cancelado.astro", _page40],
    ["src/pages/checkout/exito.astro", _page41],
    ["src/pages/checkout.astro", _page42],
    ["src/pages/contacto.astro", _page43],
    ["src/pages/cuenta/login.astro", _page44],
    ["src/pages/cuenta/pedidos/[id].astro", _page45],
    ["src/pages/cuenta/pedidos/index.astro", _page46],
    ["src/pages/cuenta/perfil.astro", _page47],
    ["src/pages/cuenta/recuperar-password.astro", _page48],
    ["src/pages/cuenta/registro.astro", _page49],
    ["src/pages/cuenta/reset-password.astro", _page50],
    ["src/pages/cuenta/index.astro", _page51],
    ["src/pages/envios.astro", _page52],
    ["src/pages/privacidad.astro", _page53],
    ["src/pages/productos/[slug].astro", _page54],
    ["src/pages/productos/index.astro", _page55],
    ["src/pages/terminos.astro", _page56],
    ["src/pages/index.astro", _page57]
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
    "host": true,
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
