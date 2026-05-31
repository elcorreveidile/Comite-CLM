import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function CalendarioPanelPage() {
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await getAdmin()
    .from('eventos_calendario')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Calendario</h1>
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.map((e: { id: number; titulo: string; fecha: string; hora: string | null; lugar: string | null; descripcion: string | null }) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
              <div className="text-center min-w-[52px]">
                <p className="text-xs text-gray-400 uppercase">{new Date(e.fecha + 'T12:00').toLocaleDateString('es', { month: 'short' })}</p>
                <p className="text-2xl font-bold" style={{ color: '#003087' }}>{new Date(e.fecha + 'T12:00').getDate()}</p>
                <p className="text-xs text-gray-300">{new Date(e.fecha + 'T12:00').getFullYear()}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{e.titulo}</p>
                {e.hora && <p className="text-sm text-gray-500">{e.hora}</p>}
                {e.lugar && <p className="text-sm text-gray-400">{e.lugar}</p>}
                {e.descripcion && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{e.descripcion}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay eventos próximos.</p>
        </div>
      )}
    </div>
  )
}
