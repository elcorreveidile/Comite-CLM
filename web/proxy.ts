import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPER_ADMINS, SAFE_IPS } from '@/lib/admins'

// Paths commonly scanned by automated attack tools and bots
const SCAN_PATHS = [
  '/wp-admin', '/wp-login', '/wp-login.php', '/wordpress',
  '/phpmyadmin', '/pma', '/adminer', '/myadmin',
  '/xmlrpc.php', '/config.php', '/admin.php', '/login.php',
  '/shell.php', '/cmd.php', '/c99.php', '/r57.php', '/alfa.php',
  '/backup', '/db_backup', '/sql', '/dump',
  '/administrator', '/joomla', '/drupal', '/typo3',
  '/cgi-bin', '/setup.php', '/install.php', '/update.php',
]

function isScanPath(pathname: string): boolean {
  return SCAN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function decodeCity(value: string | null): string | null {
  if (!value) return null
  try { return decodeURIComponent(value) } catch { return value }
}

async function logIntento(request: NextRequest, intentoNum: number): Promise<void> {
  try {
    const ip = getClientIp(request)
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/intentos_acceso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        ip,
        path:        request.nextUrl.pathname,
        user_agent:  request.headers.get('user-agent')                  ?? null,
        intento_num: intentoNum,
        pais:        request.headers.get('x-vercel-ip-country')         ?? null,
        ciudad:      decodeCity(request.headers.get('x-vercel-ip-city')),
        region:      request.headers.get('x-vercel-ip-country-region')  ?? null,
        latitud:     request.headers.get('x-vercel-ip-latitude')        ?? null,
        longitud:    request.headers.get('x-vercel-ip-longitude')       ?? null,
      }),
    })
  } catch {
    // El registro es no crítico: fallar en silencio
  }
}

function probeRedirect(request: NextRequest, intentoNum: number): NextResponse {
  const dest = intentoNum > 3 ? '/reincidente' : '/intento'
  const res = NextResponse.redirect(new URL(dest, request.url))
  res.cookies.set('_pa', String(intentoNum), {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return res
}

function getClientIp(request: NextRequest): string | null {
  return (request as any).ip
      ?? request.headers.get('x-real-ip')
      ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? null
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const probes = parseInt(request.cookies.get('_pa')?.value ?? '0')
  const clientIp = getClientIp(request)
  const isSafeIp = clientIp !== null && SAFE_IPS.includes(clientIp)

  // Intercept known attack/scanning paths before Vercel's own error handling
  if (isScanPath(pathname)) {
    if (!isSafeIp) {
      await logIntento(request, probes + 1)
      return probeRedirect(request, probes + 1)
    }
    return NextResponse.next({ request })
  }

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

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (user && await isAdminUser(supabase, user.email ?? '')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return supabaseResponse
    }
    if (!user || !await isAdminUser(supabase, user.email ?? '')) {
      if (!isSafeIp) {
        await logIntento(request, probes + 1)
        return probeRedirect(request, probes + 1)
      }
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
  matcher: [
    '/admin/:path*',
    '/panel/:path*',
    // Attack scan paths — intercepted before Vercel's own 403
    '/wp-admin/:path*', '/wp-admin',
    '/wp-login.php', '/wp-login',
    '/wordpress/:path*', '/wordpress',
    '/phpmyadmin/:path*', '/phpmyadmin',
    '/pma/:path*', '/pma',
    '/adminer/:path*', '/adminer',
    '/myadmin/:path*', '/myadmin',
    '/xmlrpc.php',
    '/config.php',
    '/admin.php',
    '/login.php',
    '/shell.php', '/cmd.php', '/c99.php', '/r57.php', '/alfa.php',
    '/backup/:path*', '/backup',
    '/db_backup/:path*', '/db_backup',
    '/sql/:path*', '/sql',
    '/administrator/:path*', '/administrator',
    '/joomla/:path*', '/joomla',
    '/drupal/:path*', '/drupal',
    '/typo3/:path*', '/typo3',
    '/cgi-bin/:path*', '/cgi-bin',
    '/setup.php', '/install.php', '/update.php',
  ],
}
