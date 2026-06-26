'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const MAIN_ITEMS = [
  { href: '/panel',               label: 'Inicio',        icon: '🏠' },
  { href: '/panel/comunicados',   label: 'Comunicados',   icon: '📨' },
  { href: '/panel/avisos',        label: 'Avisos',        icon: '📋' },
  { href: '/panel/votaciones',    label: 'Votar',         icon: '🗳️' },
]

const MORE_ITEMS = [
  { href: '/panel/propuestas', label: 'Propuestas',  icon: '💬' },
  { href: '/panel/calendario', label: 'Calendario',  icon: '📅' },
  { href: '/panel/documentos', label: 'Documentos',  icon: '📁' },
  { href: '/panel/perfil',     label: 'Mi perfil',   icon: '👤' },
]

export default function PanelBottomNav({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/panel') return pathname === '/panel'
    return pathname.startsWith(href)
  }

  const moreIsActive = MORE_ITEMS.some(i => pathname.startsWith(i.href))

  return (
    <>
      {/* More drawer */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg sm:hidden">
            {MORE_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 text-sm font-medium ${isActive(item.href) ? 'text-blue-700' : 'text-gray-700'}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { setMoreOpen(false); onSignOut() }}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm text-gray-400"
            >
              <span className="text-xl">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex h-16 safe-area-bottom">
        {MAIN_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen(o => !o)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${(moreIsActive || moreOpen) ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <span className="text-xl leading-none">···</span>
          <span>Más</span>
        </button>
      </nav>
    </>
  )
}
