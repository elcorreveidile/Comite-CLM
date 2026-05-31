import { createClient as createAdminClient } from '@supabase/supabase-js'
import PropuestasAdmin from './PropuestasAdmin'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function PropuestasPage() {
  const { data } = await getAdmin()
    .from('propuestas')
    .select('*, trabajadores(nombre)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Propuestas</h1>
      <p className="text-gray-500 text-sm mb-6">Propuestas enviadas por los trabajadores al comité.</p>
      <PropuestasAdmin propuestas={data ?? []} />
    </div>
  )
}
