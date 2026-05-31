'use client'

import { useState, useTransition } from 'react'
import { marcarRevisada, responderPropuesta, eliminarPropuesta } from './actions'

type Propuesta = {
  id: number
  titulo: string
  cuerpo: string
  anonima: boolean
  revisada: boolean
  respuesta: string | null
  created_at: string
  trabajadores?: { nombre: string } | null
}

export default function PropuestasAdmin({ propuestas: init }: { propuestas: Propuesta[] }) {
  const [propuestas, setPropuestas] = useState(init)
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'revisadas'>('pendientes')
  const [modal, setModal] = useState<Propuesta | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtradas = propuestas.filter(p => {
    if (filtro === 'pendientes') return !p.revisada
    if (filtro === 'revisadas') return p.revisada
    return true
  })

  function toggleRevisada(p: Propuesta) {
    startTransition(async () => {
      await marcarRevisada(p.id, !p.revisada)
      setPropuestas(prev => prev.map(x => x.id === p.id ? { ...x, revisada: !p.revisada } : x))
    })
  }

  function abrirResponder(p: Propuesta) {
    setRespuesta(p.respuesta ?? '')
    setModal(p)
  }

  function guardarRespuesta() {
    if (!modal) return
    startTransition(async () => {
      await responderPropuesta(modal.id, respuesta)
      setPropuestas(prev => prev.map(x => x.id === modal.id ? { ...x, respuesta, revisada: true } : x))
      setModal(null)
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar esta propuesta?')) return
    startTransition(async () => {
      await eliminarPropuesta(id)
      setPropuestas(prev => prev.filter(x => x.id !== id))
    })
  }

  const pendientes = propuestas.filter(p => !p.revisada).length

  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        {(['pendientes', 'revisadas', 'todas'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded capitalize transition-colors ${filtro === f ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={filtro === f ? { backgroundColor: '#003087' } : {}}
          >
            {f} {f === 'pendientes' && pendientes > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1 ml-1">{pendientes}</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtradas.map(p => (
          <div key={p.id} className={`bg-white border rounded-lg p-4 ${!p.revisada ? 'border-amber-300' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{p.titulo}</p>
                  {!p.revisada && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendiente</span>}
                  {p.anonima && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anónima</span>}
                </div>
                {!p.anonima && p.trabajadores && (
                  <p className="text-xs text-gray-400 mb-1">De: {p.trabajadores.nombre}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2">{p.cuerpo}</p>
                {p.respuesta && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <span className="font-medium">Respuesta: </span>{p.respuesta}
                  </div>
                )}
                <p className="text-xs text-gray-300 mt-2">{new Date(p.created_at).toLocaleDateString('es')}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => abrirResponder(p)} className="text-xs text-blue-600 hover:underline text-right">Responder</button>
                <button onClick={() => toggleRevisada(p)} className="text-xs text-gray-500 hover:text-blue-600 text-right">
                  {p.revisada ? 'Marcar pendiente' : 'Marcar revisada'}
                </button>
                <button onClick={() => eliminar(p.id)} className="text-xs text-red-500 hover:underline text-right">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No hay propuestas en esta categoría.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="font-bold text-lg mb-1">{modal.titulo}</h2>
            <p className="text-sm text-gray-600 mb-4">{modal.cuerpo}</p>
            <label className="block text-xs text-gray-500 mb-1">Respuesta del comité</label>
            <textarea
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none mb-4"
              placeholder="Escribe aquí la respuesta que verá el trabajador..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button
                onClick={guardarRespuesta}
                disabled={isPending}
                style={{ backgroundColor: '#003087' }}
                className="text-sm text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
