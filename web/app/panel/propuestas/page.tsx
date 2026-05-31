import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import PropuestaForm from './PropuestaForm'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function PropuestasPanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getAdmin()
  const { data: trabajador } = await admin.from('trabajadores').select('id').eq('email', user!.email!).single()

  const { data: misPropuestas } = trabajador
    ? await admin
        .from('propuestas')
        .select('*')
        .eq('trabajador_id', trabajador.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Propuestas</h1>
      <p className="text-gray-400 text-sm mb-6">Envía sugerencias o propuestas al comité de empresa.</p>

      <PropuestaForm />

      {misPropuestas && misPropuestas.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Mis propuestas</h2>
          <div className="flex flex-col gap-3">
            {misPropuestas.map((p: { id: number; titulo: string; cuerpo: string; revisada: boolean; respuesta: string | null; created_at: string; anonima: boolean }) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm text-gray-800">{p.titulo}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.revisada ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.revisada ? 'Revisada' : 'Pendiente'}
                  </span>
                </div>
                {p.respuesta && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <span className="font-medium">Respuesta del comité: </span>{p.respuesta}
                  </div>
                )}
                <p className="text-xs text-gray-300 mt-2">{new Date(p.created_at).toLocaleDateString('es')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
