'use client'

import { useState, useTransition } from 'react'
import { crearEvento, actualizarEvento, eliminarEvento } from './actions'

type Evento = {
  id: number
  titulo: string
  fecha: string
  hora: string | null
  lugar: string | null
  descripcion: string | null
}

const EMPTY = { titulo: '', fecha: '', hora: '', lugar: '', descripcion: '' }

export default function CalendarioManager({ eventos: init }: { eventos: Evento[] }) {
  const [eventos, setEventos] = useState(init)
  const [modal, setModal] = useState<{ open: boolean; editando: Evento | null }>({ open: false, editando: null })
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function abrirNuevo() {
    setForm(EMPTY); setError(null)
    setModal({ open: true, editando: null })
  }

  function abrirEditar(e: Evento) {
    setForm({ titulo: e.titulo, fecha: e.fecha, hora: e.hora ?? '', lugar: e.lugar ?? '', descripcion: e.descripcion ?? '' })
    setError(null)
    setModal({ open: true, editando: e })
  }

  function cerrar() { setModal({ open: false, editando: null }); setError(null) }

  function guardar() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    startTransition(async () => {
      const res = modal.editando
        ? await actualizarEvento(modal.editando.id, fd)
        : await crearEvento(fd)
      if (res.error) { setError(res.error); return }
      cerrar()
      window.location.reload()
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar este evento?')) return
    startTransition(async () => {
      await eliminarEvento(id)
      setEventos(prev => prev.filter(e => e.id !== id))
    })
  }

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={abrirNuevo}
          style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90"
        >
          + Nuevo evento
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {eventos.map(e => (
          <div key={e.id} className={`bg-white border rounded-lg p-4 flex items-start justify-between gap-4 ${e.fecha < hoy ? 'opacity-60' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[48px]">
                  <p className="text-xs text-gray-400">{new Date(e.fecha + 'T12:00').toLocaleDateString('es', { month: 'short' }).toUpperCase()}</p>
                  <p className="text-2xl font-bold leading-none" style={{ color: '#003087' }}>{new Date(e.fecha + 'T12:00').getDate()}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">{e.titulo}</p>
                  {e.hora && <p className="text-xs text-gray-500">{e.hora}</p>}
                  {e.lugar && <p className="text-xs text-gray-400">{e.lugar}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => abrirEditar(e)} className="text-xs text-blue-600 hover:underline">Editar</button>
              <button onClick={() => eliminar(e.id)} className="text-xs text-red-500 hover:underline">×</button>
            </div>
          </div>
        ))}
        {eventos.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No hay eventos.</p>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{modal.editando ? 'Editar evento' : 'Nuevo evento'}</h2>
            <div className="flex flex-col gap-3">
              {(['titulo', 'fecha', 'hora', 'lugar'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'fecha' ? 'date' : field === 'hora' ? 'time' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required={field === 'titulo' || field === 'fecha'}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
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
