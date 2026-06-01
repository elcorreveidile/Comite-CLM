'use client'

import { useState, useRef, useEffect } from 'react'
import { crearYEnviar, solicitarAprobacion, aprobarYEnviar, rechazar, eliminarComunicado } from './actions'

type Role = 'superadmin' | 'presidenta' | 'secretaria'
type DestinatarioTipo = 'todos' | 'comite' | 'especifico'

type Trabajador = { id: string; nombre: string; email: string }

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

function ComunicadoCard({ com, role, enHistorial }: { com: Comunicado; role: Role; enHistorial?: boolean }) {
  const [loading, setLoading]     = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [msg, setMsg]             = useState('')
  const [eliminado, setEliminado] = useState(false)

  const canApprove = (role === 'presidenta' || role === 'superadmin') && com.estado === 'pendiente_aprobacion'
  const canDelete  = (role === 'presidenta' || role === 'superadmin') && enHistorial

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

  async function handleEliminar() {
    setDeleting(true)
    const res = await eliminarComunicado(com.id)
    if (res.ok) {
      setEliminado(true)
    } else {
      setMsg(`❌ ${res.error}`)
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  if (eliminado) return null

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold text-gray-800">{com.asunto}</p>
        <div className="flex items-center gap-2 shrink-0">
          <Badge estado={com.estado} />
          {canDelete && !confirmDel && (
            <button
              onClick={() => setConfirmDel(true)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
              title="Eliminar"
            >×</button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 whitespace-pre-wrap line-clamp-3 mb-3">{com.cuerpo}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(com.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}{com.creado_por}
        </span>
        {com.estado === 'enviado' && com.destinatarios_count && (
          <span>{com.destinatarios_count} {com.destinatarios_count === 1 ? 'destinatario' : 'destinatarios'}</span>
        )}
      </div>

      {msg && <p className="mt-3 text-sm font-medium">{msg}</p>}

      {confirmDel && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2">
          <p className="text-xs text-red-700 flex-1">¿Eliminar este comunicado del historial?</p>
          <button
            onClick={handleEliminar}
            disabled={deleting}
            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setConfirmDel(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      )}

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

const DESTINATARIO_OPTS: { value: DestinatarioTipo; label: string; desc: string }[] = [
  { value: 'todos',      label: 'Todos los trabajadores',    desc: 'Se envía a todos los trabajadores activos en el sistema.' },
  { value: 'comite',     label: 'Miembros del comité',       desc: 'Solo llega a los miembros activos del comité de empresa.' },
  { value: 'especifico', label: 'Trabajadores específicos',  desc: 'Elige uno o varios destinatarios de la lista.' },
]

function BuscadorTrabajador({ trabajadores }: { trabajadores: Trabajador[] }) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Trabajador[]>([])
  const containerRef            = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const selectedIds = new Set(selected.map(t => t.id))
  const filtered = (query.trim().length === 0 ? trabajadores : trabajadores.filter(t =>
    t.nombre.toLowerCase().includes(query.toLowerCase()) ||
    t.email.toLowerCase().includes(query.toLowerCase())
  )).filter(t => !selectedIds.has(t.id)).slice(0, 12)

  function add(t: Trabajador) {
    setSelected(prev => [...prev, t])
    setQuery('')
    setOpen(true)
    inputRef.current?.focus()
  }

  function remove(id: string) {
    setSelected(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.map(t => (
        <input key={t.id} type="hidden" name="destinatario_email" value={t.email} />
      ))}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(t => (
            <span key={t.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 text-xs px-2 py-1 rounded-full font-medium">
              {t.nombre}
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
              >×</button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={selected.length > 0 ? 'Añadir otro destinatario…' : 'Escribe nombre o email para buscar…'}
        autoComplete="off"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
      />

      {open && (
        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-gray-400 text-center">
              {query.trim() ? 'Sin resultados' : 'Escribe para buscar'}
            </li>
          ) : filtered.map(t => (
            <li
              key={t.id}
              onMouseDown={() => add(t)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 flex flex-col border-b border-gray-50 last:border-0"
            >
              <span className="font-medium text-gray-800 text-sm">{t.nombre}</span>
              <span className="text-xs text-gray-400">{t.email}</span>
            </li>
          ))}
          {trabajadores.length > 12 && query.trim().length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-400 text-center bg-gray-50">
              Escribe para filtrar — {trabajadores.length} trabajadores en total
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function NuevoComunicadoForm({ role, trabajadores }: { role: Role; trabajadores: Trabajador[] }) {
  const [estado, setEstado]         = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]               = useState('')
  const [tipo, setTipo]             = useState<DestinatarioTipo>('todos')

  const canSendDirect = role === 'superadmin' || role === 'presidenta'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (tipo === 'especifico' && data.getAll('destinatario_email').length === 0) {
      setMsg('❌ Debes seleccionar al menos un trabajador de la lista.')
      setEstado('error')
      return
    }
    setEstado('loading')

    const res = canSendDirect ? await crearYEnviar(data) : await solicitarAprobacion(data)

    if (res.ok) {
      const count = (res as any).count
      setMsg(canSendDirect
        ? count === 1
          ? '✅ Enviado correctamente a 1 destinatario'
          : `✅ Enviado correctamente a ${count} destinatarios`
        : '✅ Solicitud enviada. La Presidenta recibirá el comunicado para aprobación.')
      setEstado('ok')
      ;(e.target as HTMLFormElement).reset()
      setTipo('todos')
    } else {
      setMsg(`❌ ${res.error}`)
      setEstado('error')
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-8">
      <h2 className="font-bold text-gray-800 mb-5">
        {canSendDirect ? 'Nuevo comunicado' : 'Redactar comunicado (requiere aprobación de la Presidenta)'}
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

          {/* Selector de destinatario — solo para roles con envío directo */}
          {canSendDirect && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Destinatarios *</label>
              <input type="hidden" name="destinatario_tipo" value={tipo} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DESTINATARIO_OPTS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTipo(opt.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      tipo === opt.value
                        ? 'border-blue-900 bg-blue-50 text-blue-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium block">{opt.label}</span>
                    <span className="text-xs text-gray-400 leading-tight block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {tipo === 'especifico' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Buscar trabajador *</label>
                  <BuscadorTrabajador trabajadores={trabajadores} />
                </div>
              )}
            </div>
          )}

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
                ? tipo === 'todos'    ? '📨 Enviar a todos los trabajadores'
                : tipo === 'comite'   ? '📨 Enviar a los miembros del comité'
                :                      '📨 Enviar a los trabajadores seleccionados'
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
  trabajadores,
}: {
  role: Role
  pendientes: Comunicado[]
  historial: Comunicado[]
  trabajadores: Trabajador[]
}) {
  const canApprove = role === 'presidenta' || role === 'superadmin'

  return (
    <div>
      <NuevoComunicadoForm role={role} trabajadores={trabajadores} />

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
              <ComunicadoCard key={com.id} com={com} role={role} enHistorial />
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
