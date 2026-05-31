'use client'

import { useState, useTransition } from 'react'
import { votar } from './actions'

type Votacion = {
  id: number
  titulo: string
  descripcion: string | null
  opciones: string[]
  miVoto?: string | null
  votos?: { opcion: string }[]
}

export default function VotacionCard({ v }: { v: Votacion }) {
  const yaVote = !!v.miVoto
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [votado, setVotado] = useState(yaVote)
  const [miOpcion, setMiOpcion] = useState(v.miVoto ?? null)

  const totalVotos = v.votos?.length ?? 0

  function enviarVoto() {
    if (!seleccion) return
    startTransition(async () => {
      const res = await votar(v.id, seleccion)
      if (res.error) { setError(res.error); return }
      setVotado(true)
      setMiOpcion(seleccion)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="font-semibold text-gray-800 mb-1">{v.titulo}</p>
      {v.descripcion && <p className="text-sm text-gray-500 mb-3">{v.descripcion}</p>}

      {votado ? (
        <div>
          <p className="text-xs text-green-600 font-medium mb-3">Tu voto: <span className="font-bold">{miOpcion}</span></p>
          <div className="flex flex-col gap-2">
            {v.opciones.map(op => {
              const count = v.votos?.filter(vt => vt.opcion === op).length ?? 0
              const pct = totalVotos > 0 ? Math.round((count / totalVotos) * 100) : 0
              return (
                <div key={op}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={op === miOpcion ? 'font-semibold text-gray-800' : 'text-gray-500'}>{op}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: op === miOpcion ? '#003087' : '#93c5fd' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-300 mt-3">{totalVotos} voto{totalVotos !== 1 ? 's' : ''} totales</p>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 mb-3">
            {v.opciones.map(op => (
              <button
                key={op}
                onClick={() => setSeleccion(op)}
                className={`text-left px-4 py-2 rounded border text-sm transition-colors ${seleccion === op ? 'border-blue-800 text-blue-900 bg-blue-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {op}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <button
            onClick={enviarVoto}
            disabled={!seleccion || isPending}
            style={{ backgroundColor: '#003087' }}
            className="text-white text-sm px-4 py-2 rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isPending ? 'Enviando...' : 'Votar'}
          </button>
        </div>
      )}
    </div>
  )
}
