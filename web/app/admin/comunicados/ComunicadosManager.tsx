'use client'

import { useState, useRef, useEffect } from 'react'
import { crearYEnviar, solicitarAprobacion, aprobarYEnviar, rechazar, eliminarComunicado, cancelarProgramado } from './actions'
import type { Adjunto } from './actions'

type Role = 'superadmin' | 'presidenta' | 'secretaria'
type DestinatarioTipo = 'todos' | 'comite' | 'especifico' | 'departamento'

type Trabajador = { id: string; nombre: string; email: string; departamento: string | null }

type Comunicado = {
  id: string
  asunto: string
  cuerpo: string
  estado: 'pendiente_aprobacion' | 'enviado' | 'rechazado' | 'programado'
  creado_por: string
  aprobado_por: string | null
  destinatarios_count: number | null
  enviado_at: string | null
  programado_at: string | null
  created_at: string
  adjuntos: Adjunto[]
}

function Badge({ estado }: { estado: Comunicado['estado'] }) {
  const styles = {
    pendiente_aprobacion: 'bg-amber-100 text-amber-800',
    enviado:              'bg-green-100 text-green-800',
    rechazado:            'bg-red-100 text-red-800',
    programado:           'bg-blue-100 text-blue-800',
  }
  const labels = {
    pendiente_aprobacion: 'Pendiente aprobación',
    enviado:              'Enviado',
    rechazado:            'Rechazado',
    programado:           'Programado',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[estado]}`}>
      {labels[estado]}
    </span>
  )
}

function ComunicadoCard({ com, role, enHistorial, esProgramado }: { com: Comunicado; role: Role; enHistorial?: boolean; esProgramado?: boolean }) {
  const [loading, setLoading]       = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [msg, setMsg]               = useState('')
  const [eliminado, setEliminado]   = useState(false)
  const [expanded, setExpanded]     = useState(false)

  const canApprove = (role === 'presidenta' || role === 'superadmin') && com.estado === 'pendiente_aprobacion'
  const canDelete  = (role === 'presidenta' || role === 'superadmin') && (enHistorial || esProgramado)
  const adjuntos   = com.adjuntos ?? []

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
    const action = esProgramado ? cancelarProgramado : eliminarComunicado
    const res = await action(com.id)
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
              title={esProgramado ? 'Cancelar envío' : 'Eliminar'}
            >×</button>
          )}
        </div>
      </div>

      {com.programado_at && (
        <p className="text-xs text-blue-600 mb-2">
          🕒 Programado para el{' '}
          {new Date(com.programado_at).toLocaleString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}

      <div className="mb-3">
        <p className={`text-sm text-gray-500 whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
          {com.cuerpo}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-blue-700 hover:underline mt-1"
        >
          {expanded ? 'Ocultar' : 'Ver completo'}
        </button>
      </div>

      {adjuntos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {adjuntos.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              📎 {a.name}
            </span>
          ))}
        </div>
      )}

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
          <p className="text-xs text-red-700 flex-1">
            {esProgramado ? '¿Cancelar este envío programado?' : '¿Eliminar este comunicado del historial?'}
          </p>
          <button
            onClick={handleEliminar}
            disabled={deleting}
            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg disabled:opacity-50"
          >
            {deleting ? 'Cancelando…' : esProgramado ? 'Sí, cancelar' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setConfirmDel(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Volver
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
  { value: 'todos',        label: 'Todos los trabajadores',   desc: 'Se envía a todos los trabajadores activos en el sistema.' },
  { value: 'comite',       label: 'Miembros del comité',      desc: 'Solo llega a los miembros activos del comité de empresa.' },
  { value: 'departamento', label: 'Por departamento',         desc: 'Envía a todos los trabajadores de un departamento.' },
  { value: 'especifico',   label: 'Trabajadores específicos', desc: 'Elige uno o varios destinatarios de la lista.' },
]

function SelectorDepartamento({ trabajadores }: { trabajadores: Trabajador[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const departamentos = Array.from(
    new Set(trabajadores.map(t => t.departamento).filter(Boolean))
  ).sort() as string[]

  return (
    <div className="mt-3">
      <label className="block text-xs font-medium text-gray-600 mb-2">Departamento *</label>
      {selected && <input type="hidden" name="destinatario_departamento" value={selected} />}
      <div className="flex flex-wrap gap-2">
        {departamentos.map(dep => (
          <button
            key={dep}
            type="button"
            onClick={() => setSelected(dep === selected ? null : dep)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              selected === dep
                ? 'border-blue-900 bg-blue-50 text-blue-900 font-medium'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {dep}
          </button>
        ))}
      </div>
      {!selected && (
        <p className="text-xs text-gray-400 mt-2">Selecciona un departamento para ver a quién se enviará.</p>
      )}
    </div>
  )
}

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

function AdjuntosInput({
  files,
  onChange,
}: {
  files: File[]
  onChange: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const existingNames = new Set(files.map(f => f.name))
    onChange([...files, ...selected.filter(f => !existingNames.has(f.name))])
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(name: string) {
    onChange(files.filter(f => f.name !== name))
  }

  const totalMB = (files.reduce((s, f) => s + f.size, 0) / (1024 * 1024)).toFixed(1)

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Adjuntos (opcional)</label>

      {files.length > 0 && (
        <div className="mb-2 space-y-1">
          {files.map(f => (
            <div key={f.name} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
              <span className="text-xs text-gray-700 truncate mr-2">📎 {f.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  type="button"
                  onClick={() => remove(f.name)}
                  className="text-gray-300 hover:text-red-400 text-base leading-none"
                >×</button>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">Total: {totalMB} MB · máx. 20 MB</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-gray-500 border border-dashed border-gray-300 rounded px-3 py-2 hover:border-gray-400 hover:text-gray-600 w-full transition-colors"
      >
        + Adjuntar archivo
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.zip"
      />
    </div>
  )
}

function getMinDatetime() {
  const d = new Date(Date.now() + 5 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

function NuevoComunicadoForm({ role, trabajadores }: { role: Role; trabajadores: Trabajador[] }) {
  const [estado, setEstado]       = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]             = useState('')
  const [tipo, setTipo]           = useState<DestinatarioTipo>('todos')
  const [adjuntos, setAdjuntos]   = useState<File[]>([])
  const [programadoAt, setProgramadoAt] = useState('')

  const canSendDirect = role === 'superadmin' || role === 'presidenta'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (tipo === 'especifico' && data.getAll('destinatario_email').length === 0) {
      setMsg('❌ Debes seleccionar al menos un trabajador de la lista.')
      setEstado('error')
      return
    }
    if (tipo === 'departamento' && !data.get('destinatario_departamento')) {
      setMsg('❌ Debes seleccionar un departamento.')
      setEstado('error')
      return
    }
    adjuntos.forEach(f => data.append('adjuntos', f))

    setEstado('loading')

    const res = canSendDirect ? await crearYEnviar(data) : await solicitarAprobacion(data)

    if (res.ok) {
      if ((res as any).programado) {
        const dt = new Date((res as any).programadoAt)
        setMsg(`✅ Programado para el ${dt.toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`)
      } else {
        const count = (res as any).count
        setMsg(canSendDirect
          ? count === 1
            ? '✅ Enviado correctamente a 1 destinatario'
            : `✅ Enviado correctamente a ${count} destinatarios`
          : '✅ Solicitud enviada. La Presidenta recibirá el comunicado para aprobación.')
      }
      setEstado('ok')
      ;(e.target as HTMLFormElement).reset()
      setTipo('todos')
      setAdjuntos([])
      setProgramadoAt('')
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

          {canSendDirect && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Destinatarios *</label>
              <input type="hidden" name="destinatario_tipo" value={tipo} />
              <div className="grid grid-cols-2 gap-2">
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

              {tipo === 'departamento' && (
                <SelectorDepartamento trabajadores={trabajadores} />
              )}

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

          <AdjuntosInput files={adjuntos} onChange={setAdjuntos} />

          {canSendDirect && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Envío programado <span className="text-gray-400 font-normal">(opcional — déjalo vacío para enviar ahora)</span>
              </label>
              <input
                type="datetime-local"
                name="programado_at"
                value={programadoAt}
                onChange={e => setProgramadoAt(e.target.value)}
                min={getMinDatetime()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
              {programadoAt && (
                <button
                  type="button"
                  onClick={() => setProgramadoAt('')}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                >
                  Enviar inmediatamente
                </button>
              )}
            </div>
          )}

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
                ? programadoAt
                  ? '🕒 Programar envío'
                  : tipo === 'todos'        ? '📨 Enviar a todos los trabajadores'
                  : tipo === 'comite'       ? '📨 Enviar a los miembros del comité'
                  : tipo === 'departamento' ? '📨 Enviar al departamento seleccionado'
                  :                          '📨 Enviar a los trabajadores seleccionados'
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
  programados,
  historial,
  trabajadores,
}: {
  role: Role
  pendientes: Comunicado[]
  programados: Comunicado[]
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

      {canApprove && programados.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Envíos programados ({programados.length})
          </h2>
          <div className="space-y-4">
            {programados.map(com => (
              <ComunicadoCard key={com.id} com={com} role={role} esProgramado />
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

      {pendientes.length === 0 && programados.length === 0 && historial.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">No hay comunicados todavía.</p>
      )}
    </div>
  )
}
