import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // Protected prefixes that require auth checks
  const protectedPrefixes = ['/profile', '/worker', '/feed', '/notifications'];
  const isAdmin = pathname.startsWith('/admin');
  const needsAuth = protectedPrefixes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // Public routes — skip getUser() to avoid interfering with client-side auth cookies
  if (!isAdmin && !needsAuth) {
    return supabaseResponse;
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Admin routes require admin role
  if (isAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    return supabaseResponse;
  }

  // Protected routes require authentication
  if (!user) {
    const redirectUrl = new URL('/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js)).*)',
  ],
};
