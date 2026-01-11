import { d as defineMiddleware, s as sequence } from './chunks/index_D1BrMJaV.mjs';
import { s as supabase } from './chunks/supabase_CyPcJWDY.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_D58zAbgm.mjs';
import 'piccolore';
import './chunks/astro/server_BV4kWd-B.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const cookies = context.cookies;
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/cuenta") && pathname !== "/cuenta/login" && pathname !== "/cuenta/registro";
  if (!isAdminRoute && !isAccountRoute) {
    return next();
  }
  if (!accessToken || !refreshToken) {
    const loginUrl = isAdminRoute ? "/admin/login" : "/cuenta/login";
    return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    const loginUrl = isAdminRoute ? "/admin/login" : "/cuenta/login";
    return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
  }
  if (isAdminRoute) {
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      return context.redirect("/admin/login?error=unauthorized");
    }
  }
  context.locals.user = user;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
