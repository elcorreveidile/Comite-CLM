'use client'

import { useState, useTransition } from 'react'
import { crearTrabajador, actualizarTrabajador, eliminarTrabajador } from './actions'

type Trabajador = {
  id: number
  nombre: string
  email: string
  departamento: string | null
  telefono: string | null
  notas: string | null
}

type Props = { trabajadores: Trabajador[] }

const EMPTY: Omit<Trabajador, 'id'> = { nombre: '', email: '', departamento: '', telefono: '', notas: '' }

export default function TrabajadoresTable({ trabajadores: init }: Props) {
  const [trabajadores, setTrabajadores] = useState(init)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState<{ open: boolean; editando: Trabajador | null }>({ open: false, editando: null })
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtrados = trabajadores.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    (t.departamento ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirNuevo() {
    setForm(EMPTY)
    setError(null)
    setModal({ open: true, editando: null })
  }

  function abrirEditar(t: Trabajador) {
    setForm({ nombre: t.nombre, email: t.email, departamento: t.departamento ?? '', telefono: t.telefono ?? '', notas: t.notas ?? '' })
    setError(null)
    setModal({ open: true, editando: t })
  }

  function cerrar() {
    setModal({ open: false, editando: null })
    setError(null)
  }

  function guardar() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
    startTransition(async () => {
      const res = modal.editando
        ? await actualizarTrabajador(modal.editando.id, fd)
        : await crearTrabajador(fd)
      if (res.error) { setError(res.error); return }
      cerrar()
      // Optimistic update
      if (modal.editando) {
        setTrabajadores(prev => prev.map(t => t.id === modal.editando!.id ? { ...t, ...form } : t))
      } else {
        // Reload is handled by revalidatePath; force refresh
        window.location.reload()
      }
    })
  }

  function eliminar(id: number) {
    if (!confirm('¿Eliminar este trabajador?')) return
    startTransition(async () => {
      await eliminarTrabajador(id)
      setTrabajadores(prev => prev.filter(t => t.id !== id))
    })
  }

  function exportarMd() {
    const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const grupos: Record<string, Trabajador[]> = {}
    for (const t of trabajadores) {
      const dep = t.departamento?.trim() || 'Sin departamento'
      ;(grupos[dep] ??= []).push(t)
    }
    const deps = Object.keys(grupos).sort((a, b) =>
      a === 'Sin departamento' ? 1 : b === 'Sin departamento' ? -1 : a.localeCompare(b, 'es')
    )
    let md = `# Censo de Trabajadores — CLM\n*Exportado el ${fecha}*\n\n---\n\n`
    for (const dep of deps) {
      md += `## ${dep}\n\n`
      for (const t of grupos[dep].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))) {
        md += `- **${t.nombre}** — ${t.email}`
        if (t.telefono) md += ` · ${t.telefono}`
        md += '\n'
      }
      md += '\n'
    }
    md += `---\n*Total: ${trabajadores.length} trabajadores*\n`
    const blob = new Blob([md], { type: 'text/markdown; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `censo-clm-${fecha.replace(/\//g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Buscar por nombre, correo o departamento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={exportarMd}
          className="text-sm px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap text-gray-600"
        >
          Exportar .md
        </button>
        <button
          onClick={abrirNuevo}
          style={{ backgroundColor: '#003087' }}
          className="text-white text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Nuevo trabajador
        </button>
      </div>

      <p className="text-gray-400 text-xs mb-3">{filtrados.length} trabajador{filtrados.length !== 1 ? 'es' : ''}</p>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-gray-500 text-xs uppercase">
              <th className="text-left py-2 pr-4 font-medium">Nombre</th>
              <th className="text-left py-2 pr-4 font-medium">Correo</th>
              <th className="text-left py-2 pr-4 font-medium">Departamento</th>
              <th className="text-left py-2 pr-4 font-medium">Teléfono</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4 font-medium">{t.nombre}</td>
                <td className="py-2 pr-4 text-gray-600">{t.email}</td>
                <td className="py-2 pr-4 text-gray-500">{t.departamento ?? '—'}</td>
                <td className="py-2 pr-4 text-gray-500">{t.telefono ?? '—'}</td>
                <td className="py-2 flex gap-2 justify-end">
                  <button onClick={() => abrirEditar(t)} className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => eliminar(t.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="md:hidden flex flex-col gap-3">
        {filtrados.map(t => (
          <div key={t.id} className="border rounded p-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{t.nombre}</p>
                <p className="text-xs text-gray-500">{t.email}</p>
                {t.departamento && <p className="text-xs text-gray-400">{t.departamento}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(t)} className="text-xs text-blue-600 hover:underline">Editar</button>
                <button onClick={() => eliminar(t.id)} className="text-xs text-red-500 hover:underline">×</button>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Sin resultados</p>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{modal.editando ? 'Editar trabajador' : 'Nuevo trabajador'}</h2>
            <div className="flex flex-col gap-3">
              {(['nombre', 'email', 'departamento', 'telefono'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required={field === 'nombre' || field === 'email'}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notas</label>
                <textarea
                  value={form.notas ?? ''}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrar} className="text-sm px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button
                onClick={guardar}
                disabled={isPending}
                style={{ backgroundColor: '#003087' }}
                className="text-sm text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
