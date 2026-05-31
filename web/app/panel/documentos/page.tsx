import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Documento = { id: number; titulo: string; descripcion: string | null; url: string | null; categoria: string | null }

export default async function DocumentosPanelPage() {
  const { data } = await getAdmin()
    .from('documentos')
    .select('*')
    .order('categoria')
    .order('titulo')

  const documentos: Documento[] = data ?? []
  const categorias = Array.from(new Set(documentos.map(d => d.categoria).filter(Boolean)))
  const sinCategoria = documentos.filter(d => !d.categoria)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Documentos</h1>

      {documentos.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay documentos disponibles todavía.</p>
        </div>
      )}

      {categorias.map(cat => (
        <div key={cat} className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{cat}</h2>
          <div className="flex flex-col gap-2">
            {documentos.filter(d => d.categoria === cat).map(d => <DocItem key={d.id} d={d} />)}
          </div>
        </div>
      ))}

      {sinCategoria.length > 0 && (
        <div className="flex flex-col gap-2">
          {sinCategoria.map(d => <DocItem key={d.id} d={d} />)}
        </div>
      )}
    </div>
  )
}

function DocItem({ d }: { d: Documento }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl shrink-0">📄</span>
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-800 truncate">{d.titulo}</p>
          {d.descripcion && <p className="text-xs text-gray-400 truncate">{d.descripcion}</p>}
        </div>
      </div>
      {d.url && (
        <a
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#003087' }}
          className="text-sm font-medium hover:underline shrink-0"
        >
          Abrir →
        </a>
      )}
    </div>
  )
}
