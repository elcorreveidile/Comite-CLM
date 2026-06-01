import Link from 'next/link'

export default function ReincidentePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <p className="text-red-600 text-xs font-mono uppercase tracking-[0.3em] mb-6">
        Reincidencia detectada
      </p>
      <h1 className="text-white font-black leading-none mb-6"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)' }}>
        ¿Otra vez?<br />JESÚS.
      </h1>
      <p className="text-gray-600 text-sm max-w-xs leading-relaxed mb-12">
        Seguimos aquí.<br />Tú también, por lo visto.
      </p>
      <Link href="/"
        className="text-xs text-gray-700 hover:text-gray-400 transition-colors tracking-wider uppercase">
        ← Volver al inicio
      </Link>
    </div>
  )
}
