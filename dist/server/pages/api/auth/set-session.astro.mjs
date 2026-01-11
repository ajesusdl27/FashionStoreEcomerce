export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const { access_token, refresh_token } = await request.json();
    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({ error: "Tokens requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
      // 30 days
    });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al procesar la solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
