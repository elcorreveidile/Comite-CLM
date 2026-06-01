'use client'

import { useState } from 'react'
import { actualizarTelefono } from './actions'

export default function PerfilForm({
  nombre,
  email,
  telefono: telefonoInicial,
}: {
  nombre: string
  email: string
  telefono: string
}) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEstado('loading')
    const res = await actualizarTelefono(new FormData(e.currentTarget))
    if (res.ok) {
      setMsg('Teléfono guardado correctamente.')
      setEstado('ok')
    } else {
      setMsg(res.error ?? 'Error inesperado.')
      setEstado('error')
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
        <p className="text-sm text-gray-800">{nombre}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
        <p className="text-sm text-gray-800">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="telefono" className="block text-xs font-medium text-gray-600 mb-1">
            Teléfono / WhatsApp
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            defaultValue={telefonoInicial}
            placeholder="600 000 000"
            maxLength={20}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
          />
          <p className="text-xs text-gray-400 mt-1">
            Opcional. Solo visible para los miembros del comité.
          </p>
        </div>

        {estado === 'ok'    && <p className="text-sm text-green-600">{msg}</p>}
        {estado === 'error' && <p className="text-sm text-red-600">{msg}</p>}

        <button
          type="submit"
          disabled={estado === 'loading'}
          className="w-full text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#003087' }}
        >
          {estado === 'loading' ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
