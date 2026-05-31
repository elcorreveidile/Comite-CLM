'use client'

import { useState } from 'react'
import { addMiembro, updateMiembro, deactivateMiembro, reactivateMiembro } from './actions'

type Miembro = {
  id: number
  nombre: string
  email: string
  sindicato: 'CCOO' | 'UGT'
  cargo: string | null
  activo: boolean
}

const emptyForm = { nombre: '', email: '', sindicato: 'CCOO' as 'CCOO' | 'UGT', cargo: '' }

export default function MiembrosManager({ miembros }: { miembros: Miembro[] }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit(m: Miembro) {
    setEditing(m.id)
    setAdding(false)
    setForm({ nombre: m.nombre, email: m.email, sindicato: m.sindicato, cargo: m.cargo ?? '' })
    setError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addMiembro({ ...form, cargo: form.cargo || undefined })
      setAdding(false)
      setForm(emptyForm)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al añadir')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateMiembro(id, { ...form, cargo: form.cargo || undefined })
      setEditing(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeactivate(id: number) {
    if (!confirm('¿Desactivar este miembro? Perderá acceso al panel de administración.')) return
    await deactivateMiembro(id)
  }

  async function handleReactivate(id: number) {
    await reactivateMiembro(id)
  }

  const FormFields = () => (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
        <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          required className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Correo electrónico</label>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Sindicato</label>
        <select value={form.sindicato} onChange={e => setForm(f => ({ ...f, sindicato: e.target.value as 'CCOO' | 'UGT' }))}
          className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
          <option value="CCOO">CCOO</option>
          <option value="UGT">UGT</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Cargo (opcional)</label>
        <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
          placeholder="Presidente, Secretario…"
          className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Miembros del comité</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestión de acceso al panel de administración · Solo super admin</p>
        </div>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditing(null); setForm(emptyForm); setError(null) }}
            style={{ backgroundColor: '#003087' }}
            className="text-white text-sm px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity">
            + Añadir miembro
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded mb-4">{error}</div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 text-sm">Nuevo miembro</h3>
          <FormFields />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} style={{ backgroundColor: '#003087' }}
              className="text-white text-sm px-4 py-1.5 rounded font-medium disabled:opacity-50">
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-sm text-gray-600 px-4 py-1.5 rounded border hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 font-medium text-gray-600">Correo</th>
              <th className="px-4 py-3 font-medium text-gray-600">Sindicato</th>
              <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {miembros.map(m => (
              <tr key={m.id} className={`border-b last:border-0 ${!m.activo ? 'opacity-40' : ''}`}>
                {editing === m.id ? (
                  <td colSpan={5} className="px-4 py-3">
                    <form onSubmit={e => handleUpdate(e, m.id)}>
                      <FormFields />
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} style={{ backgroundColor: '#003087' }}
                          className="text-white text-xs px-3 py-1.5 rounded disabled:opacity-50">
                          {loading ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button type="button" onClick={() => setEditing(null)}
                          className="text-xs text-gray-600 px-3 py-1.5 rounded border hover:bg-gray-50">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">
                      {m.nombre}
                      {m.cargo && <span className="text-gray-400 font-normal ml-1 text-xs">· {m.cargo}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={m.sindicato === 'CCOO'
                          ? { backgroundColor: '#fee2e2', color: '#991b1b' }
                          : { backgroundColor: '#dbeafe', color: '#1e3a8a' }}>
                        {m.sindicato}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${m.activo ? 'text-green-600' : 'text-gray-400'}`}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(m)}
                        className="text-xs text-blue-600 hover:underline mr-3">Editar</button>
                      {m.activo ? (
                        <button onClick={() => handleDeactivate(m.id)}
                          className="text-xs text-red-600 hover:underline">Desactivar</button>
                      ) : (
                        <button onClick={() => handleReactivate(m.id)}
                          className="text-xs text-green-600 hover:underline">Reactivar</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {miembros.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No hay miembros. Añade el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
