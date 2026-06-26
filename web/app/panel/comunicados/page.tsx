import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import ComunicadosPanel from './ComunicadosPanel'

export default async function PanelComunicadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user!.email!

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: trabajador },
    { data: todosRaw },
    { data: lecturasRaw },
    { data: esComite },
  ] = await Promise.all([
    admin.from('trabajadores').select('departamento').eq('email', email).single(),
    admin.from('comunicados')
      .select('id, asunto, cuerpo, enviado_at, adjuntos, destinatario_tipo, destinatario_emails, destinatario_departamento')
      .eq('estado', 'enviado')
      .order('enviado_at', { ascending: false }),
    admin.from('comunicado_lecturas').select('comunicado_id').eq('email', email),
    admin.from('miembros_comite').select('id').eq('email', email).eq('activo', true).maybeSingle(),
  ])

  const departamento = trabajador?.departamento
  const esComiteMember = !!esComite
  const leidosIds = new Set((lecturasRaw ?? []).map((l: any) => l.comunicado_id))

  const comunicados = (todosRaw ?? [])
    .filter((c: any) => {
      if (c.destinatario_tipo === 'todos') return true
      if (c.destinatario_tipo === 'comite') return esComiteMember
      if (c.destinatario_tipo === 'departamento') return c.destinatario_departamento === departamento
      if (c.destinatario_tipo === 'especifico') return (c.destinatario_emails ?? []).includes(email)
      return false
    })
    .map((c: any) => ({ ...c, leido: leidosIds.has(c.id) }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Comunicados</h1>
        <p className="text-gray-400 text-sm mt-1">Mensajes enviados por el Comité de Empresa.</p>
      </div>
      <ComunicadosPanel comunicados={comunicados} />
    </div>
  )
}
