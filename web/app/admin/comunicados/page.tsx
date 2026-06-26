export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getRole } from './actions'
import { SUPER_ADMINS } from '@/lib/admins'
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

  const [{ data: todos }, { data: trabajadoresRaw }, { data: plantillasRaw }] = await Promise.all([
    admin.from('comunicados').select('*').order('created_at', { ascending: false }),
    admin.from('trabajadores').select('id, nombre, email, departamento').order('nombre'),
    admin.from('plantillas_comunicado').select('*').order('nombre'),
  ])

  const pendientes  = (todos ?? []).filter((c: any) => c.estado === 'pendiente_aprobacion')
  const programados = (todos ?? []).filter((c: any) => c.estado === 'programado')
  const historial   = (todos ?? []).filter((c: any) => c.estado === 'enviado' || c.estado === 'rechazado')
  const trabajadores = (trabajadoresRaw ?? []).filter((t: any) => !SUPER_ADMINS.includes(t.email))

  const historialIds = historial.map((c: any) => c.id)
  const { data: lecturasRaw } = historialIds.length
    ? await admin.from('comunicado_lecturas').select('comunicado_id, email, leido_at').in('comunicado_id', historialIds)
    : { data: [] }

  // Agrupar lecturas por comunicado_id
  const lecturasPorComunicado: Record<string, { email: string; leido_at: string }[]> = {}
  for (const l of (lecturasRaw ?? [])) {
    if (!lecturasPorComunicado[l.comunicado_id]) lecturasPorComunicado[l.comunicado_id] = []
    lecturasPorComunicado[l.comunicado_id].push({ email: l.email, leido_at: l.leido_at })
  }

  const historialConLecturas = historial.map((c: any) => ({
    ...c,
    lecturas: lecturasPorComunicado[c.id] ?? [],
  }))

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
        programados={programados}
        historial={historialConLecturas}
        trabajadores={trabajadores ?? []}
        plantillas={plantillasRaw ?? []}
      />
    </div>
  )
}
