import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SUPER_ADMINS } from '@/lib/admins'
import MobileMenuAdmin from './MobileMenuAdmin'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  const isSuperAdmin = SUPER_ADMINS.includes(user.email ?? '')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: pendientes },
    { data: miembro },
  ] = await Promise.all([
    admin.from('propuestas').select('*', { count: 'exact', head: true }).eq('revisada', false),
    admin.from('miembros_comite').select('cargo').eq('email', user.email!).eq('activo', true).maybeSingle(),
  ])

  const cargo = miembro?.cargo ?? null
  const puedeComunicados = isSuperAdmin || cargo === 'Presidenta' || cargo === 'Secretaria'

  const navItems = [
    { href: '/admin',             label: 'Inicio' },
    { href: '/admin/trabajadores',label: 'Trabajadores' },
    { href: '/admin/avisos',      label: 'Avisos' },
    { href: '/admin/votaciones',  label: 'Votaciones' },
    { href: '/admin/calendario',  label: 'Calendario' },
    { href: '/admin/propuestas',  label: 'Propuestas', badge: pendientes ?? 0 },
    { href: '/admin/documentos',  label: 'Documentos' },
    ...(puedeComunicados ? [{ href: '/admin/comunicados', label: 'Comunicados', color: '#60a5fa' }] : []),
    ...(isSuperAdmin      ? [{ href: '/admin/miembros',   label: 'Miembros',    color: '#F2B705' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-zinc-900 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-1 font-bold shrink-0">
                <span style={{ color: '#F2B705' }}>CLM</span>
                <span className="text-zinc-400 text-xs font-normal">Admin</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1 text-sm">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors"
                    style={{ color: item.color ?? 'white' }}
                  >
                    {item.label}
                    {item.badge ? (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-xs hidden lg:block truncate max-w-[160px]">{user.email}</span>
              {/* Desktop sign out */}
              <form action={signOut} className="hidden md:block">
                <button type="submit" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Salir
                </button>
              </form>
              {/* Mobile hamburger */}
              <MobileMenuAdmin items={navItems} userEmail={user.email!} onSignOut={signOut} />
            </div>

          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">{children}</main>
    </div>
  )
}
