import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 🛡️ REFRESH SESSION: This is the security part. 
  // It forces the token to be re-validated with the backend.
  const { data: { user } } = await supabase.auth.getUser();

  // Handle protected routes (e.g. /admin, /dashboard)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !user) {
    // If not logged in, redirect to login page immediately
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (server-side APIs already have their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
