'use client'

import { useState, useTransition } from 'react'
import { crearAviso, actualizarAviso, toggleAviso, eliminarAviso } from './actions'

type Aviso = { id: number; titulo: string; cuerpo: string; publicado: boolean; created_at: string }

export default function AvisosManager({ avisos: init }: { avisos: Aviso[] }) {
  const [avisos, setAvisos] = useState(init)
  const [modal, setModal] = useState<{ open: boolean; editando: Aviso | null }>({ open: false, editando: null })
  const [titulo, setTitulo] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function abrirNuevo() {
    setTitulo(''); setCuerpo(''); setError(null)
    setModal({ open: true, editando: null })
  }

  function abrirEditar(a: Aviso) {
    setTitulo(a.titulo); setCuerpo(a.cuerpo); setError(null)
    setModal({ open: true, editando: a })
  }

  function cerrar() { setModal({ open: false, editando: null }); setError(null) }

  function guardar() {
    const fd = new FormData()
    fd.append('titulo', titulo)
    fd.append('cuerpo', cuerpo)
    startTransition(async () => {
      const res = modal.editando
        ? await actualizarAviso(modal.editando.id, fd)
        : await crearAviso(fd)
      if (res.error) { setError(res.error); return }
      cerrar()
      window.location.reload()
    })
  }

  function toggle(id: number, actual: boolean) {
    startTransition(async () => {
      await toggleAviso(id, !actual)
      setAvisos(prev => prev.map(a => a.id === id ? { ...a, publicado: !actual } : a))
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar este aviso?')) return
    startTransition(async () => {
      await eliminarAviso(id)
      setAvisos(prev => prev.filter(a => a.id !== id))
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={abrirNuevo}
          style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          + Nuevo aviso
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {avisos.map(a => (
          <div key={a.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">{a.titulo}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {a.publicado ? 'Publicado' : 'Oculto'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{a.cuerpo}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(a.id, a.publicado)} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                {a.publicado ? 'Ocultar' : 'Publicar'}
              </button>
              <button onClick={() => abrirEditar(a)} className="text-xs text-blue-600 hover:underline">Editar</button>
              <button onClick={() => eliminar(a.id)} className="text-xs text-red-500 hover:underline">×</button>
            </div>
          </div>
        ))}
        {avisos.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No hay avisos todavía.</p>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="font-bold text-lg mb-4">{modal.editando ? 'Editar aviso' : 'Nuevo aviso'}</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cuerpo</label>
                <textarea
                  value={cuerpo}
                  onChange={e => setCuerpo(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                />
              </div>
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
