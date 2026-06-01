'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 text-white px-4 py-4 sm:py-3 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm leading-relaxed">
          Este sitio usa cookies técnicas de sesión necesarias para su funcionamiento.{' '}
          <Link href="/cookies" className="underline hover:text-gray-300 transition-colors">
            Más información
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-white text-zinc-900 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
