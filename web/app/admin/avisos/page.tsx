import { createClient as createAdminClient } from '@supabase/supabase-js'
import AvisosManager from './AvisosManager'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AvisosPage() {
  const { data } = await getAdmin()
    .from('avisos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tablón de avisos</h1>
      <p className="text-gray-500 text-sm mb-6">Mensajes visibles para los trabajadores en su panel.</p>
      <AvisosManager avisos={data ?? []} />
    </div>
  )
}
