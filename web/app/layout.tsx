import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Comité de Empresa | Centro de Lenguas Modernas · UGR',
  description: 'Sitio web del Comité de Empresa del Centro de Lenguas Modernas de la Universidad de Granada.',
  themeColor: '#003087',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
