import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PanelBottomNav from './PanelBottomNav'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/panel/login')
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: trabajador } = await admin
    .from('trabajadores')
    .select('id, nombre')
    .eq('email', user.email!)
    .single()

  if (!trabajador) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f7f4' }}>
        <div className="text-center max-w-sm">
          <p className="text-xl font-bold mb-2 text-gray-800">Acceso no autorizado</p>
          <p className="text-gray-500 text-sm mb-6">
            Tu correo ({user.email}) no está registrado como trabajador del CLM.
            Si crees que es un error, contacta con el comité.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">Inicio</Link>
            <form action={signOut}><button type="submit" className="text-sm" style={{ color: '#003087' }}>Cerrar sesión</button></form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      {/* Top nav — visible en escritorio, solo logo+salir en móvil */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/panel" className="flex items-baseline gap-1 font-bold text-base">
              <span style={{ color: '#003087' }}>Comité</span>
              <span className="text-gray-300 font-light text-sm">·</span>
              <span style={{ color: '#C8102E' }} className="text-sm">CLM</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Link href="/panel"                className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Inicio</Link>
              <Link href="/panel/comunicados"   className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Comunicados</Link>
              <Link href="/panel/avisos"        className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Avisos</Link>
              <Link href="/panel/votaciones"    className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Votaciones</Link>
              <Link href="/panel/propuestas"    className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Propuestas</Link>
              <Link href="/panel/documentos"    className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Documentos</Link>
              <Link href="/panel/calendario"    className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">Calendario</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/panel/perfil" className="text-xs text-gray-400 hidden sm:block truncate max-w-[180px] hover:text-gray-600 transition-colors">{user.email}</Link>
              <form action={signOut} className="hidden sm:block">
                <button type="submit" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Salir</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido con padding inferior extra en móvil para el bottom nav */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>

      <footer className="border-t py-3 px-4">
        <p className="text-center text-xs text-gray-300 pb-16 sm:pb-0">
          Desarrollo web:{' '}
          <a href="https://www.por2duros.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors underline underline-offset-2">
            Por 2 duros
          </a>
          {' · '}v1.1
        </p>
      </footer>

      {/* Bottom nav — solo en móvil */}
      <PanelBottomNav onSignOut={signOut} />
    </div>
  )
}
