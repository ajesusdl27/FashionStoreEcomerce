import { c as createAuthenticatedClient, s as supabase } from '../../../chunks/supabase_CjGuiMY7.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
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
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { product, variants, images } = await request.json();
    const { data: newProduct, error: productError } = await authClient.from("products").insert(product).select().single();
    if (productError) {
      return new Response(JSON.stringify({ error: productError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v) => ({
        product_id: newProduct.id,
        size: v.size,
        stock: v.stock
      }));
      const { error: variantsError } = await authClient.from("product_variants").insert(variantsData);
      if (variantsError) {
        console.error("Error creating variants:", variantsError);
      }
    }
    if (images && images.length > 0) {
      const imagesData = images.map((url, index) => ({
        product_id: newProduct.id,
        image_url: url,
        order: index
      }));
      const { error: imagesError } = await authClient.from("product_images").insert(imagesData);
      if (imagesError) {
        console.error("Error creating images:", imagesError);
      }
    }
    return new Response(JSON.stringify({ success: true, product: newProduct }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
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
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id, product, variants, images } = await request.json();
    const { error: productError } = await authClient.from("products").update(product).eq("id", id);
    if (productError) {
      return new Response(JSON.stringify({ error: productError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await authClient.from("product_variants").delete().eq("product_id", id);
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v) => ({
        product_id: id,
        size: v.size,
        stock: v.stock
      }));
      await authClient.from("product_variants").insert(variantsData);
    }
    await authClient.from("product_images").delete().eq("product_id", id);
    if (images && images.length > 0) {
      const imagesData = images.map((url, index) => ({
        product_id: id,
        image_url: url,
        order: index
      }));
      await authClient.from("product_images").insert(imagesData);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request, cookies }) => {
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
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id } = await request.json();
    const { error } = await authClient.from("products").delete().eq("id", id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
