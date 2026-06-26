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

  const email = user!.email!

  const [
    { data: trabajador },
    { count: avisosNuevos },
    { count: votacionesActivas },
    { data: comunicadosRaw },
    { data: lecturasRaw },
    { data: esComite },
  ] = await Promise.all([
    admin.from('trabajadores').select('nombre, departamento').eq('email', email).single(),
    admin.from('avisos').select('*', { count: 'exact', head: true }).eq('publicado', true),
    admin.from('votaciones').select('*', { count: 'exact', head: true }).eq('activa', true),
    admin.from('comunicados')
      .select('id, destinatario_tipo, destinatario_emails, destinatario_departamento')
      .eq('estado', 'enviado'),
    admin.from('comunicado_lecturas').select('comunicado_id').eq('email', email),
    admin.from('miembros_comite').select('id').eq('email', email).eq('activo', true).maybeSingle(),
  ])

  const departamento = trabajador?.departamento
  const esComiteMember = !!esComite
  const leidosIds = new Set((lecturasRaw ?? []).map((l: any) => l.comunicado_id))

  const misComunicados = (comunicadosRaw ?? []).filter((c: any) => {
    if (c.destinatario_tipo === 'todos') return true
    if (c.destinatario_tipo === 'comite') return esComiteMember
    if (c.destinatario_tipo === 'departamento') return c.destinatario_departamento === departamento
    if (c.destinatario_tipo === 'especifico') return (c.destinatario_emails ?? []).includes(email)
    return false
  })
  const comunicadosNoLeidos = misComunicados.filter((c: any) => !leidosIds.has(c.id)).length

  const accesos = [
    { href: '/panel/comunicados', label: 'Comunicados', desc: comunicadosNoLeidos > 0 ? `${comunicadosNoLeidos} sin leer` : `${misComunicados.length} comunicado${misComunicados.length !== 1 ? 's' : ''}`, emoji: '📨', highlight: comunicadosNoLeidos > 0 },
    { href: '/panel/avisos', label: 'Tablón de avisos', desc: `${avisosNuevos ?? 0} aviso${avisosNuevos !== 1 ? 's' : ''} publicado${avisosNuevos !== 1 ? 's' : ''}`, emoji: '📋', highlight: false },
    { href: '/panel/votaciones', label: 'Votaciones', desc: `${votacionesActivas ?? 0} activa${votacionesActivas !== 1 ? 's' : ''}`, emoji: '🗳️', highlight: false },
    { href: '/panel/calendario', label: 'Calendario', desc: 'Próximas fechas', emoji: '📅', highlight: false },
    { href: '/panel/propuestas', label: 'Propuestas', desc: 'Envía una propuesta al comité', emoji: '💬', highlight: false },
    { href: '/panel/documentos', label: 'Documentos', desc: 'Convenio, actas y circulares', emoji: '📁', highlight: false },
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
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow group flex items-center gap-4 ${a.highlight ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100'}`}
          >
            <span className="text-3xl">{a.emoji}</span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{a.label}</p>
              <p className={`text-xs mt-0.5 ${a.highlight ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
