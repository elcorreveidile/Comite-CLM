'use client'

import { useState, useRef } from 'react'
import { enviarContacto } from '@/app/actions/contacto'

export default function ContactForm() {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEstado('enviando')
    const data = new FormData(e.currentTarget)
    const res = await enviarContacto(data)
    if (res.ok) {
      setEstado('ok')
      formRef.current?.reset()
    } else {
      setErrorMsg(res.error ?? 'Error desconocido')
      setEstado('error')
    }
  }

  if (estado === 'ok') {
    return (
      <div className="max-w-md mx-auto text-center py-6">
        <p className="text-3xl mb-3">✉️</p>
        <p className="font-semibold text-gray-800 mb-1">Mensaje enviado</p>
        <p className="text-sm text-gray-500">El comité lo recibirá en breve.</p>
        <button
          onClick={() => setEstado('idle')}
          className="mt-4 text-sm underline text-gray-400 hover:text-gray-600"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-lg mx-auto text-left space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
          <input
            name="nombre"
            required
            placeholder="Tu nombre"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-900/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tu correo *</label>
          <input
            name="correo"
            type="email"
            required
            placeholder="para que podamos responderte"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-900/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Asunto</label>
        <input
          name="asunto"
          placeholder="Opcional"
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-900/30"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje *</label>
        <textarea
          name="mensaje"
          required
          rows={4}
          placeholder="Escribe tu consulta o propuesta..."
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none"
        />
      </div>

      {estado === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        style={{ backgroundColor: '#003087' }}
        className="w-full text-white py-3.5 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      <p className="text-xs text-gray-400 leading-relaxed">
        Sus datos serán tratados por el Comité de Empresa del CLM para gestionar su consulta. Consulte nuestra{' '}
        <a href="/privacidad" className="underline hover:text-gray-600">política de privacidad</a>.
      </p>
    </form>
  )
}
