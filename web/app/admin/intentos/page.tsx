import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { SUPER_ADMINS } from '@/lib/admins'
import { revalidatePath } from 'next/cache'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Intento = {
  id: number
  ip: string | null
  path: string | null
  user_agent: string | null
  intento_num: number
  pais: string | null
  ciudad: string | null
  region: string | null
  latitud: string | null
  longitud: string | null
  created_at: string
}

async function limpiarRegistros() {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !SUPER_ADMINS.includes(user.email ?? '')) return

  const admin = getAdmin()
  await admin.from('intentos_acceso').delete().neq('id', 0)
  revalidatePath('/admin/intentos')
}

const FLAG: Record<string, string> = {
  ES: '🇪🇸', US: '🇺🇸', CN: '🇨🇳', RU: '🇷🇺', BR: '🇧🇷', DE: '🇩🇪',
  FR: '🇫🇷', GB: '🇬🇧', IN: '🇮🇳', NL: '🇳🇱', UA: '🇺🇦', TR: '🇹🇷',
  PL: '🇵🇱', VN: '🇻🇳', ID: '🇮🇩', KR: '🇰🇷', JP: '🇯🇵', MX: '🇲🇽',
  AR: '🇦🇷', IT: '🇮🇹', CA: '🇨🇦', AU: '🇦🇺', SG: '🇸🇬', HK: '🇭🇰',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

export default async function IntentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !SUPER_ADMINS.includes(user.email ?? '')) {
    redirect('/admin')
  }

  const admin = getAdmin()
  const { data: intentos } = await admin
    .from('intentos_acceso')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  const lista: Intento[] = intentos ?? []

  const totalIntentos = lista.length
  const ipsUnicas = new Set(lista.map(i => i.ip).filter(Boolean)).size
  const paisesUnicos = new Set(lista.map(i => i.pais).filter(Boolean)).size
  const reincidentes = lista.filter(i => i.intento_num > 1).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Intentos de acceso</h1>
          <p className="text-gray-500 text-sm mt-0.5">Accesos no autorizados registrados por el sistema</p>
        </div>
        {lista.length > 0 && (
          <form action={limpiarRegistros}>
            <button
              type="submit"
              className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              Limpiar registros
            </button>
          </form>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total intentos',  value: totalIntentos },
          { label: 'IPs únicas',      value: ipsUnicas     },
          { label: 'Países distintos',value: paisesUnicos  },
          { label: 'Reincidentes',    value: reincidentes  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400">
          No hay intentos registrados.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha y hora</th>
                  <th className="px-4 py-3 text-left">IP</th>
                  <th className="px-4 py-3 text-left">Ruta</th>
                  <th className="px-4 py-3 text-left">País / Ciudad</th>
                  <th className="px-4 py-3 text-left">Coordenadas</th>
                  <th className="px-4 py-3 text-left">Nº intento</th>
                  <th className="px-4 py-3 text-left">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.map(i => (
                  <tr key={i.id} className={`hover:bg-gray-50 ${i.intento_num > 2 ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">
                      {formatDate(i.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 whitespace-nowrap">
                      {i.ip ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs whitespace-nowrap">
                      {i.path ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {i.pais
                        ? <>{FLAG[i.pais] ?? '🌐'} {i.pais}{i.ciudad ? ` · ${i.ciudad}` : ''}{i.region ? ` (${i.region})` : ''}</>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap font-mono">
                      {i.latitud && i.longitud ? `${i.latitud}, ${i.longitud}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        i.intento_num === 1 ? 'bg-yellow-100 text-yellow-700' :
                        i.intento_num === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {i.intento_num}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate" title={i.user_agent ?? ''}>
                      {i.user_agent ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            Mostrando los últimos {lista.length} registros · Las filas en rojo son reincidentes (≥ 3 intentos)
          </div>
        </div>
      )}
    </div>
  )
}
