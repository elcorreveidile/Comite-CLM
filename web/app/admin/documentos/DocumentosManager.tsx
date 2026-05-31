'use client'

import { useState, useTransition, useRef } from 'react'
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
  const [modoArchivo, setModoArchivo] = useState(true)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const categorias = Array.from(new Set(documentos.map(d => d.categoria).filter(Boolean)))

  function abrirNuevo() {
    setForm(EMPTY); setError(null); setArchivo(null); setModoArchivo(true)
    setModal({ open: true, editando: null })
  }

  function abrirEditar(d: Documento) {
    setForm({ titulo: d.titulo, descripcion: d.descripcion ?? '', url: d.url ?? '', categoria: d.categoria ?? '' })
    setError(null); setArchivo(null)
    setModoArchivo(false)
    setModal({ open: true, editando: d })
  }

  function cerrar() { setModal({ open: false, editando: null }); setError(null); setArchivo(null) }

  function guardar() {
    const fd = new FormData()
    fd.append('titulo', form.titulo)
    fd.append('descripcion', form.descripcion)
    fd.append('categoria', form.categoria)
    if (modoArchivo && archivo) {
      fd.append('file', archivo)
    } else {
      fd.append('url', form.url)
    }
    if (modal.editando?.url) {
      fd.append('urlAnterior', modal.editando.url)
    }

    startTransition(async () => {
      const res = modal.editando
        ? await actualizarDocumento(modal.editando.id, fd)
        : await crearDocumento(fd)
      if (res.error) { setError(res.error); return }
      cerrar()
      window.location.reload()
    })
  }

  function handleEliminar(d: Documento) {
    if (!confirm('¿Eliminar este documento?')) return
    startTransition(async () => {
      await eliminarDocumento(d.id, d.url)
      setDocumentos(prev => prev.filter(x => x.id !== d.id))
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={abrirNuevo} style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90">
          + Nuevo documento
        </button>
      </div>

      {categorias.map(cat => {
        const docs = documentos.filter(d => d.categoria === cat)
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">{cat}</h3>
            <div className="flex flex-col gap-2">
              {docs.map(d => <DocRow key={d.id} d={d} onEdit={() => abrirEditar(d)} onDelete={() => handleEliminar(d)} />)}
            </div>
          </div>
        )
      })}

      {documentos.filter(d => !d.categoria).map(d => (
        <DocRow key={d.id} d={d} onEdit={() => abrirEditar(d)} onDelete={() => handleEliminar(d)} />
      ))}

      {documentos.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">No hay documentos todavía.</p>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{modal.editando ? 'Editar documento' : 'Nuevo documento'}</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descripción (opcional)</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoría (opcional)</label>
                <input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  placeholder="Convenio, Actas, Legal…"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>

              {/* Toggle subir / enlace */}
              <div>
                <div className="flex gap-1 mb-2 bg-gray-100 rounded p-0.5 w-fit">
                  <button type="button" onClick={() => setModoArchivo(true)}
                    className={`text-xs px-3 py-1 rounded transition-colors ${modoArchivo ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                    Subir archivo
                  </button>
                  <button type="button" onClick={() => setModoArchivo(false)}
                    className={`text-xs px-3 py-1 rounded transition-colors ${!modoArchivo ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                    Enlace externo
                  </button>
                </div>

                {modoArchivo ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input ref={fileRef} type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                      onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                    {archivo ? (
                      <p className="text-sm text-gray-700">📄 {archivo.name} <span className="text-gray-400">({(archivo.size / 1024).toFixed(0)} KB)</span></p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">Haz clic para seleccionar un archivo</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, ZIP</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL del documento</label>
                    <input type="url" value={form.url}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrar} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={isPending || (modoArchivo && !archivo && !modal.editando?.url)}
                style={{ backgroundColor: '#003087' }}
                className="text-sm text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Subiendo...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocRow({ d, onEdit, onDelete }: { d: Documento; onEdit: () => void; onDelete: () => void }) {
  const esStorage = d.url?.includes('/storage/v1/object/public/')
  return (
    <div className="bg-white border rounded p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-xl">{esStorage ? '📎' : '🔗'}</span>
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
