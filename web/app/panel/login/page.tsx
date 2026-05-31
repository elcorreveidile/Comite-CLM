'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PanelLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/panel` },
    })
    setLoading(false)
    if (authError) {
      setError('Error al enviar el enlace. Inténtalo de nuevo.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-baseline gap-1 text-2xl font-bold mb-2">
            <span style={{ color: '#003087' }}>Comité</span>
            <span className="text-gray-300 font-light">·</span>
            <span style={{ color: '#C8102E' }}>CLM</span>
          </div>
          <p className="text-gray-500 text-sm">Panel de trabajadores</p>
          <p className="text-gray-400 text-xs mt-1">Centro de Lenguas Modernas · UGR</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
            <div className="text-4xl mb-3">📬</div>
            <p className="font-semibold text-gray-800 mb-1">Revisa tu correo</p>
            <p className="text-gray-500 text-sm">Haz clic en el enlace para entrar al panel de trabajadores.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-4 text-center">Introduce tu correo para recibir un enlace de acceso.</p>
            <form onSubmit={handleSubmit}>
              <label className="block text-xs text-gray-400 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu.nombre@ugr.es"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400"
              />
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#003087' }}
                className="w-full text-white py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>
            <p className="text-xs text-gray-300 text-center mt-4">Solo para trabajadores del CLM</p>
          </div>
        )}
      </div>
    </div>
  )
}
