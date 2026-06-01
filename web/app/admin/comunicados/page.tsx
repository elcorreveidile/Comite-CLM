import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getRole } from './actions'
import ComunicadosManager from './ComunicadosManager'

export default async function ComunicadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const role = await getRole(user.email!)
  if (!role) redirect('/admin')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: todos }, { data: trabajadores }] = await Promise.all([
    admin.from('comunicados').select('*').order('created_at', { ascending: false }),
    admin.from('trabajadores').select('id, nombre, email, departamento').order('nombre'),
  ])

  const pendientes = (todos ?? []).filter((c: any) => c.estado === 'pendiente_aprobacion')
  const historial  = (todos ?? []).filter((c: any) => c.estado !== 'pendiente_aprobacion')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Comunicados</h1>
        <p className="text-gray-400 text-sm mt-1">
          {role === 'secretaria'
            ? 'Tus comunicados requieren aprobación de la Presidenta antes de enviarse.'
            : 'Puedes enviar comunicados directamente a todos los trabajadores, al comité o a un trabajador específico.'}
        </p>
      </div>
      <ComunicadosManager
        role={role}
        pendientes={pendientes}
        historial={historial}
        trabajadores={trabajadores ?? []}
      />
    </div>
  )
}
