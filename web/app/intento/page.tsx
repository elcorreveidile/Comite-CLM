import Link from 'next/link'

export default function IntentoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <p className="text-red-600 text-xs font-mono uppercase tracking-[0.3em] mb-6">
        Acceso denegado
      </p>
      <h1 className="text-white font-black leading-none mb-6"
          style={{ fontSize: 'clamp(3rem, 12vw, 7rem)' }}>
        El error<br />eres tú.
      </h1>
      <p className="text-gray-600 text-sm max-w-xs leading-relaxed mb-12">
        Esta área está protegida.<br />Tu intento ha quedado registrado.
      </p>
      <Link href="/admin/login"
        className="text-xs text-gray-700 hover:text-gray-400 transition-colors tracking-wider uppercase">
        ¿Miembro del comité? → Acceso autorizado
      </Link>
    </div>
  )
}
