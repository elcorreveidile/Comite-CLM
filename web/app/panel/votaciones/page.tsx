import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import VotacionCard from './VotacionCard'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function VotacionesPanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getAdmin()
  const [{ data: votaciones }, { data: misVotos }] = await Promise.all([
    admin.from('votaciones').select('*, votos(opcion)').eq('activa', true).order('created_at', { ascending: false }),
    admin.from('votos').select('votacion_id, opcion').eq('trabajador_email', user!.email!),
  ])

  const votacionesConVoto = (votaciones ?? []).map(v => ({
    ...v,
    miVoto: misVotos?.find(mv => mv.votacion_id === v.id)?.opcion ?? null,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Votaciones</h1>
      {votacionesConVoto.length > 0 ? (
        <div className="flex flex-col gap-4">
          {votacionesConVoto.map(v => (
            <VotacionCard key={v.id} v={v} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay votaciones activas en este momento.</p>
        </div>
      )}
    </div>
  )
}
