import { createClient as createAdminClient } from '@supabase/supabase-js'
import VotacionesManager from './VotacionesManager'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function VotacionesPage() {
  const { data } = await getAdmin()
    .from('votaciones')
    .select('*, votos(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Votaciones</h1>
      <p className="text-gray-500 text-sm mb-6">Gestiona consultas y votaciones para los trabajadores.</p>
      <VotacionesManager votaciones={data ?? []} />
    </div>
  )
}
