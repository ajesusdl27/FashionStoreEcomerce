import { d as defineMiddleware, s as sequence } from './chunks/index_DEBn-AW2.mjs';
import { v as validateToken, r as refreshSession } from './chunks/auth-utils_t8hhucI8.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_Boz_-pHq.mjs';
import 'piccolore';
import './chunks/astro/server_DutnL9ib.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const cookies = context.cookies;
  let accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/cuenta") && pathname !== "/cuenta/login" && pathname !== "/cuenta/registro" && pathname !== "/cuenta/recuperar-password" && pathname !== "/cuenta/reset-password";
  if (accessToken) {
    let user = await validateToken(accessToken);
    if (!user && refreshToken) {
      const newTokens = await refreshSession(refreshToken);
      if (newTokens) {
        cookies.set("sb-access-token", newTokens.access_token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7
          // 7 days
        });
        cookies.set("sb-refresh-token", newTokens.refresh_token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30
          // 30 days
        });
        user = await validateToken(newTokens.access_token);
        accessToken = newTokens.access_token;
      }
    }
    if (user) {
      context.locals.user = user;
    }
  }
  if (isAdminRoute || isAccountRoute) {
    if (!context.locals.user) {
      if (accessToken || refreshToken) {
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
      }
      const loginUrl = isAdminRoute ? "/admin/login" : "/cuenta/login";
      return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
    }
    if (isAdminRoute) {
      const isAdmin = context.locals.user.user_metadata?.is_admin === true;
      if (!isAdmin) {
        return context.redirect("/admin/login?error=unauthorized");
      }
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
