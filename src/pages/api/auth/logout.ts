import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Delete auth cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  // Redirect to home page
  return redirect('/');
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Support GET for simple logout links
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return redirect('/');
};
