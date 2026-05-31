'use client'

import { useState } from 'react'
import { crearYEnviar, solicitarAprobacion, aprobarYEnviar, rechazar } from './actions'

type Role = 'superadmin' | 'presidenta' | 'secretaria'

type Comunicado = {
  id: string
  asunto: string
  cuerpo: string
  estado: 'pendiente_aprobacion' | 'enviado' | 'rechazado'
  creado_por: string
  aprobado_por: string | null
  destinatarios_count: number | null
  enviado_at: string | null
  created_at: string
}

function Badge({ estado }: { estado: Comunicado['estado'] }) {
  const styles = {
    pendiente_aprobacion: 'bg-amber-100 text-amber-800',
    enviado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
  }
  const labels = {
    pendiente_aprobacion: 'Pendiente aprobación',
    enviado: 'Enviado',
    rechazado: 'Rechazado',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[estado]}`}>
      {labels[estado]}
    </span>
  )
}

function ComunicadoCard({ com, role }: { com: Comunicado; role: Role }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const canApprove = (role === 'presidenta' || role === 'superadmin') && com.estado === 'pendiente_aprobacion'

  async function handleAprobar() {
    setLoading(true)
    const res = await aprobarYEnviar(com.id)
    setMsg(res.ok ? `✅ Enviado a ${res.count} trabajadores` : `❌ ${res.error}`)
    setLoading(false)
  }

  async function handleRechazar() {
    setLoading(true)
    const res = await rechazar(com.id)
    setMsg(res.ok ? '✅ Rechazado' : `❌ ${res.error}`)
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold text-gray-800">{com.asunto}</p>
        <Badge estado={com.estado} />
      </div>
      <p className="text-sm text-gray-500 whitespace-pre-wrap line-clamp-3 mb-3">{com.cuerpo}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(com.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}{com.creado_por}
        </span>
        {com.estado === 'enviado' && com.destinatarios_count && (
          <span>{com.destinatarios_count} destinatarios</span>
        )}
      </div>

      {msg && <p className="mt-3 text-sm font-medium">{msg}</p>}

      {canApprove && !msg && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAprobar}
            disabled={loading}
            className="flex-1 text-sm py-2 rounded-lg font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#003087' }}
          >
            {loading ? 'Enviando…' : 'Aprobar y enviar a todos'}
          </button>
          <button
            onClick={handleRechazar}
            disabled={loading}
            className="px-4 text-sm py-2 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}

function NuevoComunicadoForm({ role }: { role: Role }) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  const canSendDirect = role === 'superadmin' || role === 'presidenta'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEstado('loading')
    const data = new FormData(e.currentTarget)

    const res = canSendDirect ? await crearYEnviar(data) : await solicitarAprobacion(data)

    if (res.ok) {
      setMsg(canSendDirect
        ? `✅ Enviado correctamente a ${(res as any).count} trabajadores`
        : '✅ Solicitud enviada. La Presidenta recibirá el comunicado para aprobación.')
      setEstado('ok')
      ;(e.target as HTMLFormElement).reset()
    } else {
      setMsg(`❌ ${res.error}`)
      setEstado('error')
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-8">
      <h2 className="font-bold text-gray-800 mb-5">
        {canSendDirect ? 'Nuevo comunicado a todos los trabajadores' : 'Redactar comunicado (requiere aprobación de la Presidenta)'}
      </h2>

      {estado === 'ok' ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 mb-4">{msg}</p>
          <button onClick={() => { setEstado('idle'); setMsg('') }} className="text-sm underline text-gray-400 hover:text-gray-600">
            Redactar otro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Asunto *</label>
            <input
              name="asunto"
              required
              placeholder="Asunto del comunicado"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje *</label>
            <textarea
              name="cuerpo"
              required
              rows={8}
              placeholder="Escribe el comunicado aquí…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-y"
            />
          </div>

          {estado === 'error' && <p className="text-sm text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={estado === 'loading'}
            className="w-full text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: canSendDirect ? '#003087' : '#92400e' }}
          >
            {estado === 'loading'
              ? 'Procesando…'
              : canSendDirect
                ? '📨 Enviar a todos los trabajadores'
                : '📤 Solicitar aprobación a la Presidenta'}
          </button>

          {!canSendDirect && (
            <p className="text-xs text-gray-400 text-center">
              La Presidenta deberá aprobar este comunicado antes de que se envíe.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default function ComunicadosManager({
  role,
  pendientes,
  historial,
}: {
  role: Role
  pendientes: Comunicado[]
  historial: Comunicado[]
}) {
  const canApprove = role === 'presidenta' || role === 'superadmin'

  return (
    <div>
      <NuevoComunicadoForm role={role} />

      {canApprove && pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Pendientes de aprobación ({pendientes.length})
          </h2>
          <div className="space-y-4">
            {pendientes.map(com => (
              <ComunicadoCard key={com.id} com={com} role={role} />
            ))}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-3">Historial</h2>
          <div className="space-y-3">
            {historial.map(com => (
              <ComunicadoCard key={com.id} com={com} role={role} />
            ))}
          </div>
        </div>
      )}

      {pendientes.length === 0 && historial.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">No hay comunicados todavía.</p>
      )}
    </div>
  )
}
