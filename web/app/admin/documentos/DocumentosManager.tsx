'use client'

import { useState, useTransition } from 'react'
import { crearDocumento, actualizarDocumento, eliminarDocumento } from './actions'

type Documento = {
  id: number
  titulo: string
  descripcion: string | null
  url: string | null
  categoria: string | null
}

const EMPTY = { titulo: '', descripcion: '', url: '', categoria: '' }

export default function DocumentosManager({ documentos: init }: { documentos: Documento[] }) {
  const [documentos, setDocumentos] = useState(init)
  const [modal, setModal] = useState<{ open: boolean; editando: Documento | null }>({ open: false, editando: null })
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const categorias = Array.from(new Set(documentos.map(d => d.categoria).filter(Boolean)))

  function abrirNuevo() {
    setForm(EMPTY); setError(null)
    setModal({ open: true, editando: null })
  }

  function abrirEditar(d: Documento) {
    setForm({ titulo: d.titulo, descripcion: d.descripcion ?? '', url: d.url ?? '', categoria: d.categoria ?? '' })
    setError(null)
    setModal({ open: true, editando: d })
  }

  function cerrar() { setModal({ open: false, editando: null }); setError(null) }

  function guardar() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    startTransition(async () => {
      const res = modal.editando
        ? await actualizarDocumento(modal.editando.id, fd)
        : await crearDocumento(fd)
      if (res.error) { setError(res.error); return }
      cerrar()
      window.location.reload()
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar este documento?')) return
    startTransition(async () => {
      await eliminarDocumento(id)
      setDocumentos(prev => prev.filter(d => d.id !== id))
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={abrirNuevo}
          style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90"
        >
          + Nuevo documento
        </button>
      </div>

      {categorias.length > 0 ? (
        categorias.map(cat => {
          const docs = documentos.filter(d => d.categoria === cat)
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">{cat}</h3>
              <div className="flex flex-col gap-2">
                {docs.map(d => <DocRow key={d.id} d={d} onEdit={() => abrirEditar(d)} onDelete={() => eliminar(d.id)} />)}
              </div>
            </div>
          )
        })
      ) : null}

      {documentos.filter(d => !d.categoria).map(d => (
        <DocRow key={d.id} d={d} onEdit={() => abrirEditar(d)} onDelete={() => eliminar(d.id)} />
      ))}

      {documentos.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">No hay documentos todavía.</p>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{modal.editando ? 'Editar documento' : 'Nuevo documento'}</h2>
            <div className="flex flex-col gap-3">
              {(['titulo', 'descripcion', 'url', 'categoria'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{field === 'url' ? 'URL (enlace)' : field}</label>
                  <input
                    type={field === 'url' ? 'url' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder={field === 'url' ? 'https://...' : ''}
                  />
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrar} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button
                onClick={guardar}
                disabled={isPending}
                style={{ backgroundColor: '#003087' }}
                className="text-sm text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocRow({ d, onEdit, onDelete }: { d: Documento; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white border rounded p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-xl">📄</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{d.titulo}</p>
          {d.descripcion && <p className="text-xs text-gray-400 truncate">{d.descripcion}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver</a>}
        <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Editar</button>
        <button onClick={onDelete} className="text-xs text-red-500 hover:underline">×</button>
      </div>
    </div>
  )
}
