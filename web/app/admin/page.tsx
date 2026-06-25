import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { SUPER_ADMINS } from '@/lib/admins'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AdminPage() {
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  const isSuperAdmin = SUPER_ADMINS.includes(user?.email ?? '')

  const admin = getAdmin()

  const [
    { count: totalTrabajadores },
    { count: totalAvisos },
    { count: totalVotaciones },
    { count: propuestasPendientes },
    { count: totalDocumentos },
    { count: eventosProximos },
    { count: totalIntentos },
  ] = await Promise.all([
    admin.from('trabajadores').select('*', { count: 'exact', head: true }),
    admin.from('avisos').select('*', { count: 'exact', head: true }),
    admin.from('votaciones').select('*', { count: 'exact', head: true }).eq('activa', true),
    admin.from('propuestas').select('*', { count: 'exact', head: true }).eq('revisada', false),
    admin.from('documentos').select('*', { count: 'exact', head: true }),
    admin.from('eventos_calendario').select('*', { count: 'exact', head: true }).gte('fecha', new Date().toISOString().split('T')[0]),
    admin.from('intentos_acceso').select('*', { count: 'exact', head: true }),
  ])

  const cards = [
    { label: 'Trabajadores', value: totalTrabajadores ?? 0, href: '/admin/trabajadores', color: '#003087' },
    { label: 'Avisos publicados', value: totalAvisos ?? 0, href: '/admin/avisos', color: '#003087' },
    { label: 'Votaciones activas', value: totalVotaciones ?? 0, href: '/admin/votaciones', color: '#C8102E' },
    { label: 'Propuestas pendientes', value: propuestasPendientes ?? 0, href: '/admin/propuestas', color: propuestasPendientes ? '#C8102E' : '#003087' },
    { label: 'Documentos', value: totalDocumentos ?? 0, href: '/admin/documentos', color: '#003087' },
    { label: 'Próximos eventos', value: eventosProximos ?? 0, href: '/admin/calendario', color: '#003087' },
    ...(isSuperAdmin ? [{ label: 'Intentos de acceso', value: totalIntentos ?? 0, href: '/admin/intentos', color: (totalIntentos ?? 0) > 0 ? '#ef4444' : '#003087' }] : []),
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Panel de administración</h1>
      <p className="text-gray-500 text-sm mb-8">Comité CLM · Sección Sindical UGT · Universidad de Granada</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{card.label}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">Ver &rarr;</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
