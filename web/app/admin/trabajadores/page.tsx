import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPER_ADMINS } from '@/lib/admins'
import TrabajadoresTable from './TrabajadoresTable'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function TrabajadoresPage() {
  const { data } = await getAdmin()
    .from('trabajadores')
    .select('*')
    .order('nombre')

  const trabajadores = (data ?? []).filter((t: any) => !SUPER_ADMINS.includes(t.email))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Trabajadores</h1>
      <p className="text-gray-500 text-sm mb-6">Gestión del censo de trabajadores del CLM.</p>
      <TrabajadoresTable trabajadores={trabajadores} />
    </div>
  )
}
