'use client'

import { useState, useTransition } from 'react'
import { enviarPropuesta } from './actions'

export default function PropuestaForm() {
  const [titulo, setTitulo] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [anonima, setAnonima] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function enviar() {
    const fd = new FormData()
    fd.append('titulo', titulo)
    fd.append('cuerpo', cuerpo)
    if (anonima) fd.append('anonima', 'on')
    startTransition(async () => {
      const res = await enviarPropuesta(fd)
      if (res.error) { setError(res.error); return }
      setEnviado(true)
    })
  }

  if (enviado) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-gray-800 mb-2">Propuesta enviada</p>
        <p className="text-sm text-gray-400">El comité revisará tu propuesta y podrá responderla.</p>
        <button onClick={() => { setEnviado(false); setTitulo(''); setCuerpo('') }} className="mt-4 text-sm text-blue-600 hover:underline">
          Enviar otra propuesta
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Resume tu propuesta en una frase"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Descripción</label>
          <textarea
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            rows={5}
            placeholder="Explica tu propuesta con detalle..."
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" checked={anonima} onChange={e => setAnonima(e.target.checked)} className="rounded" />
          Enviar de forma anónima
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            onClick={enviar}
            disabled={isPending || !titulo || !cuerpo}
            style={{ backgroundColor: '#003087' }}
            className="text-white text-sm px-5 py-2 rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isPending ? 'Enviando...' : 'Enviar propuesta'}
          </button>
        </div>
      </div>
    </div>
  )
}
