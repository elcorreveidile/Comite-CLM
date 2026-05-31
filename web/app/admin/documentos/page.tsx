import { createClient as createAdminClient } from '@supabase/supabase-js'
import DocumentosManager from './DocumentosManager'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function DocumentosPage() {
  const { data } = await getAdmin()
    .from('documentos')
    .select('*')
    .order('categoria')
    .order('titulo')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Documentos</h1>
      <p className="text-gray-500 text-sm mb-6">Convenio colectivo, actas, circulares y demás documentación del comité.</p>
      <DocumentosManager documentos={data ?? []} />
    </div>
  )
}
