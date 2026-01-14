import { c as createAuthenticatedClient } from '../../../chunks/supabase_COljrJv9.mjs';
import { v as validateToken } from '../../../chunks/auth-utils_t8hhucI8.mjs';
export { renderers } from '../../../renderers.mjs';

const PUT = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { settings } = await request.json();
    for (const setting of settings) {
      const updateData = {
        key: setting.key
      };
      if (setting.value_bool !== void 0) {
        updateData.value_bool = setting.value_bool;
        updateData.value = setting.value_bool ? "true" : "false";
      }
      if (setting.value !== void 0) {
        updateData.value = setting.value;
      }
      if (setting.value_number !== void 0) {
        updateData.value_number = setting.value_number;
        updateData.value = setting.value_number.toString();
      }
      const { error } = await authClient.from("settings").upsert(updateData, {
        onConflict: "key"
      });
      if (error) {
        console.error("Error updating setting:", setting.key, error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Configuration API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
