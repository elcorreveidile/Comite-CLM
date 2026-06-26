'use client'

import { useState } from 'react'

type Adjunto = { name: string; path: string }

type Comunicado = {
  id: string
  asunto: string
  cuerpo: string
  enviado_at: string | null
  adjuntos: Adjunto[]
  leido: boolean
}

function ComunicadoCard({ com }: { com: Comunicado }) {
  const [expanded, setExpanded] = useState(false)
  const adjuntos = com.adjuntos ?? []

  return (
    <div className={`bg-white rounded-xl border p-5 transition-shadow ${expanded ? 'shadow-md border-gray-200' : 'border-gray-100 hover:shadow-sm'}`}>
      <div
        className="cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {!com.leido && (
              <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#003087' }} />
            )}
            <p className={`font-semibold leading-snug ${com.leido ? 'text-gray-600' : 'text-gray-800'}`}>
              {com.asunto}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {com.leido && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Leído</span>
            )}
            <span className="text-gray-300 text-lg leading-none">{expanded ? '−' : '+'}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-1.5 ml-5">
          {com.enviado_at
            ? new Date(com.enviado_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'}
        </p>
      </div>

      {expanded && (
        <div className="mt-4 ml-5 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{com.cuerpo}</p>

          {adjuntos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {adjuntos.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1.5 rounded-lg">
                  📎 {a.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComunicadosPanel({ comunicados }: { comunicados: Comunicado[] }) {
  if (!comunicados.length) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No hay comunicados enviados todavía.
      </div>
    )
  }

  const noLeidos = comunicados.filter(c => !c.leido).length

  return (
    <div>
      {noLeidos > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          {noLeidos} {noLeidos === 1 ? 'comunicado sin leer' : 'comunicados sin leer'}
        </p>
      )}
      <div className="space-y-3">
        {comunicados.map(com => (
          <ComunicadoCard key={com.id} com={com} />
        ))}
      </div>
    </div>
  )
}
