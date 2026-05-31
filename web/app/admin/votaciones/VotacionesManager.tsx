'use client'

import { useState, useTransition } from 'react'
import { crearVotacion, toggleVotacion, eliminarVotacion } from './actions'

type Voto = { opcion: string }
type Votacion = {
  id: number
  titulo: string
  descripcion: string | null
  opciones: string[]
  activa: boolean
  votos?: Voto[]
}

function resultados(v: Votacion) {
  const total = v.votos?.length ?? 0
  return v.opciones.map(op => {
    const count = v.votos?.filter(voto => voto.opcion === op).length ?? 0
    return { opcion: op, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  })
}

export default function VotacionesManager({ votaciones: init }: { votaciones: Votacion[] }) {
  const [votaciones, setVotaciones] = useState(init)
  const [modalNueva, setModalNueva] = useState(false)
  const [modalResultados, setModalResultados] = useState<Votacion | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [opciones, setOpciones] = useState(['', ''])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function abrirNueva() {
    setTitulo(''); setDescripcion(''); setOpciones(['', '']); setError(null)
    setModalNueva(true)
  }

  function cerrarNueva() { setModalNueva(false); setError(null) }

  function guardar() {
    const fd = new FormData()
    fd.append('titulo', titulo)
    fd.append('descripcion', descripcion)
    opciones.forEach(op => fd.append('opcion', op))
    startTransition(async () => {
      const res = await crearVotacion(fd)
      if (res.error) { setError(res.error); return }
      cerrarNueva()
      window.location.reload()
    })
  }

  function toggle(id: number, activa: boolean) {
    startTransition(async () => {
      await toggleVotacion(id, !activa)
      setVotaciones(prev => prev.map(v => v.id === id ? { ...v, activa: !activa } : v))
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar esta votación y todos sus votos?')) return
    startTransition(async () => {
      await eliminarVotacion(id)
      setVotaciones(prev => prev.filter(v => v.id !== id))
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={abrirNueva}
          style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90"
        >
          + Nueva votación
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {votaciones.map(v => {
          const total = v.votos?.length ?? 0
          return (
            <div key={v.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{v.titulo}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {v.activa ? 'Activa' : 'Cerrada'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{v.opciones.length} opciones · {total} votos</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setModalResultados(v)} className="text-xs text-blue-600 hover:underline">Resultados</button>
                <button onClick={() => toggle(v.id, v.activa)} className="text-xs text-gray-500 hover:text-blue-600">
                  {v.activa ? 'Cerrar' : 'Activar'}
                </button>
                <button onClick={() => eliminar(v.id)} className="text-xs text-red-500 hover:underline">×</button>
              </div>
            </div>
          )
        })}
        {votaciones.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No hay votaciones todavía.</p>
        )}
      </div>

      {/* Modal nueva votación */}
      {modalNueva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="font-bold text-lg mb-4">Nueva votación</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Título</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descripción (opcional)</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full border rounded px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opciones</label>
                {opciones.map((op, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={op}
                      onChange={e => setOpciones(prev => prev.map((o, j) => j === i ? e.target.value : o))}
                      placeholder={`Opción ${i + 1}`}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    {opciones.length > 2 && (
                      <button onClick={() => setOpciones(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setOpciones(prev => [...prev, ''])} className="text-xs text-blue-600 hover:underline">+ Añadir opción</button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrarNueva} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button
                onClick={guardar}
                disabled={isPending}
                style={{ backgroundColor: '#003087' }}
                className="text-sm text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Crear votación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal resultados */}
      {modalResultados && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-1">{modalResultados.titulo}</h2>
            <p className="text-sm text-gray-400 mb-4">Total votos: {modalResultados.votos?.length ?? 0}</p>
            <div className="flex flex-col gap-3">
              {resultados(modalResultados).map(r => (
                <div key={r.opcion}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.opcion}</span>
                    <span className="text-gray-500">{r.count} ({r.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: '#003087' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setModalResultados(null)} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
