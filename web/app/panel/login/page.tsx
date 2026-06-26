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
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold mb-1" style={{ color: '#003087' }}>Panel de trabajadores</p>
          <p className="text-gray-400 text-xs">Comité CLM · Sección Sindical UGT</p>
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
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-base mb-3 outline-none focus:border-blue-400"
              />
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#003087' }}
                className="w-full text-white py-3.5 rounded-lg text-base font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>
            <p className="text-xs text-gray-300 text-center mt-4">Solo para trabajadores del CLM</p>
            <p className="text-xs text-gray-300 text-center mt-2 leading-relaxed">
              Al acceder acepta el tratamiento de su correo según nuestra{' '}
              <a href="/privacidad" className="underline hover:text-gray-500">política de privacidad</a>.
            </p>
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <a
                href="/manual"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span>📖</span>
                <span>Consultar el manual del panel</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
