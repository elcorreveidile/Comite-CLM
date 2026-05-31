import { createClient as createAdminClient } from '@supabase/supabase-js'
import CalendarioManager from './CalendarioManager'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function CalendarioPage() {
  const { data } = await getAdmin()
    .from('eventos_calendario')
    .select('*')
    .order('fecha', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Calendario</h1>
      <p className="text-gray-500 text-sm mb-6">Próximas fechas visibles para los trabajadores en su panel.</p>
      <CalendarioManager eventos={data ?? []} />
    </div>
  )
}
