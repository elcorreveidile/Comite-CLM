import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SUPER_ADMINS } from '@/lib/admins'

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

  if (!user) {
    return <>{children}</>
  }

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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-1 font-bold">
                <span style={{ color: '#F2B705' }}>CLM</span>
                <span className="text-zinc-400 text-xs font-normal">Admin</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm">
                <Link href="/admin" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Inicio</Link>
                <Link href="/admin/trabajadores" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Trabajadores</Link>
                <Link href="/admin/avisos" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Avisos</Link>
                <Link href="/admin/votaciones" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Votaciones</Link>
                <Link href="/admin/calendario" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Calendario</Link>
                <Link href="/admin/propuestas" className="relative px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">
                  Propuestas
                  {!!pendientes && pendientes > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {pendientes}
                    </span>
                  )}
                </Link>
                <Link href="/admin/documentos" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors">Documentos</Link>
                {puedeComunicados && (
                  <Link href="/admin/comunicados" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors" style={{ color: '#60a5fa' }}>Comunicados</Link>
                )}
                {isSuperAdmin && (
                  <Link href="/admin/miembros" className="px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors" style={{ color: '#F2B705' }}>Miembros</Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-xs hidden sm:block">{user.email}</span>
              <form action={signOut}>
                <button type="submit" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
