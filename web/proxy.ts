import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPER_ADMINS } from '@/lib/admins'

export async function proxy(request: NextRequest) {
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
      if (user && await isAdminUser(supabase, user.email ?? '')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return supabaseResponse
    }
    if (!user || !await isAdminUser(supabase, user.email ?? '')) {
      // Track unauthorized probe attempts and show progressively funnier responses
      const probes = parseInt(request.cookies.get('_pa')?.value ?? '0')
      const dest = probes >= 2 ? '/reincidente' : '/intento'
      const res = NextResponse.redirect(new URL(dest, request.url))
      res.cookies.set('_pa', String(probes + 1), {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 h
      })
      return res
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

async function isAdminUser(
  supabase: ReturnType<typeof createServerClient>,
  email: string
): Promise<boolean> {
  if (SUPER_ADMINS.includes(email)) return true
  try {
    const { data } = await supabase
      .from('miembros_comite')
      .select('id')
      .eq('email', email)
      .eq('activo', true)
      .maybeSingle()
    return !!data
  } catch {
    // Denegar acceso si no se puede verificar con la base de datos
    return false
  }
}

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*'],
}
