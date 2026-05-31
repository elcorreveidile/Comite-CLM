'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  color?: string
  badge?: number
}

export default function MobileMenuAdmin({
  items,
  userEmail,
  onSignOut,
}: {
  items: NavItem[]
  userEmail: string
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-14 left-0 right-0 bottom-0 z-50 bg-zinc-900 overflow-y-auto">
            <nav className="py-2">
              {items.map(item => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 text-base border-b border-zinc-800 transition-colors ${active ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                    style={{ color: item.color ?? 'white' }}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </nav>
            <div className="px-5 py-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-sm mb-3 truncate">{userEmail}</p>
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
