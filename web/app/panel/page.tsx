import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default async function PanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: trabajador }, { count: avisosNuevos }, { count: votacionesActivas }] = await Promise.all([
    admin.from('trabajadores').select('nombre, departamento').eq('email', user!.email!).single(),
    admin.from('avisos').select('*', { count: 'exact', head: true }).eq('publicado', true),
    admin.from('votaciones').select('*', { count: 'exact', head: true }).eq('activa', true),
  ])

  const accesos = [
    { href: '/panel/avisos', label: 'Tablón de avisos', desc: `${avisosNuevos ?? 0} aviso${avisosNuevos !== 1 ? 's' : ''} publicado${avisosNuevos !== 1 ? 's' : ''}`, emoji: '📋' },
    { href: '/panel/votaciones', label: 'Votaciones', desc: `${votacionesActivas ?? 0} activa${votacionesActivas !== 1 ? 's' : ''}`, emoji: '🗳️' },
    { href: '/panel/calendario', label: 'Calendario', desc: 'Próximas fechas', emoji: '📅' },
    { href: '/panel/propuestas', label: 'Propuestas', desc: 'Envía una propuesta al comité', emoji: '💬' },
    { href: '/panel/documentos', label: 'Documentos', desc: 'Convenio, actas y circulares', emoji: '📁' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {trabajador?.nombre?.split(' ')[0] ?? 'trabajador/a'} 👋
        </h1>
        {trabajador?.departamento && (
          <p className="text-gray-400 text-sm mt-1">{trabajador.departamento}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {accesos.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group flex items-center gap-4"
          >
            <span className="text-3xl">{a.emoji}</span>
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
