import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ALLOWED_ADMINS } from '@/lib/admins'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (user && ALLOWED_ADMINS.includes(user.email ?? '')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return supabaseResponse
    }
    if (!user || !ALLOWED_ADMINS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  // Panel routes
  if (pathname.startsWith('/panel')) {
    if (pathname === '/panel/login') {
      if (user) {
        return NextResponse.redirect(new URL('/panel', request.url))
      }
      return supabaseResponse
    }
    if (!user) {
      return NextResponse.redirect(new URL('/panel/login', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*'],
}
