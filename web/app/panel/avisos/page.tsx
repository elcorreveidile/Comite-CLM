import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AvisosPanelPage() {
  const { data } = await getAdmin()
    .from('avisos')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tablón de avisos</h1>
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.map((a: { id: number; titulo: string; cuerpo: string; created_at: string }) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-gray-800 mb-2">{a.titulo}</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{a.cuerpo}</p>
              <p className="text-xs text-gray-300 mt-3">{new Date(a.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay avisos publicados en este momento.</p>
        </div>
      )}
    </div>
  )
}
