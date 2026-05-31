'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ALLOWED_ADMINS } from '@/lib/admins'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!ALLOWED_ADMINS.includes(normalized)) {
      setError('Este correo no tiene acceso de administrador.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/admin` },
    })
    setLoading(false)
    if (authError) {
      setError('Error al enviar el enlace. Inténtalo de nuevo.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-1 text-3xl font-bold mb-1 hover:opacity-80 transition-opacity">
            <span style={{ color: '#F2B705' }}>CLM</span>
            <span className="text-white text-lg font-normal">·</span>
            <span style={{ color: '#C8102E' }}>Admin</span>
          </a>
          <p className="text-zinc-400 text-sm">Panel de administración</p>
          <p className="text-zinc-500 text-xs mt-1">Comité de Empresa · Centro de Lenguas Modernas</p>
        </div>

        {sent ? (
          <div className="bg-zinc-800 rounded-lg p-6 text-center">
            <p className="text-white text-lg font-medium mb-2">Revisa tu correo</p>
            <p className="text-zinc-400 text-sm">Haz clic en el enlace para entrar al panel de administración.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-6">
            <label className="block text-zinc-300 text-sm mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@correo.es"
              className="w-full bg-zinc-700 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#003087' }}
              className="w-full text-white py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
