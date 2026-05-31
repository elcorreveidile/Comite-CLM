import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Cabecera */}
      <header style={{ backgroundColor: '#003087' }} className="text-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Universidad de Granada</p>
            <h1 className="text-lg font-semibold leading-tight">
              Comité de Empresa
              <span className="block text-sm font-normal opacity-80">Centro de Lenguas Modernas</span>
            </h1>
          </div>
          <Link
            href="/panel/login"
            className="text-sm px-4 py-2 rounded border border-white/40 hover:bg-white hover:text-blue-900 transition-colors"
          >
            Acceso trabajadores
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section style={{ backgroundColor: '#003087' }} className="text-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tu comité de empresa
            </h2>
            <p className="text-lg opacity-80 mb-8 leading-relaxed">
              Representamos a los trabajadores del Centro de Lenguas Modernas de la Universidad de Granada.
              Aquí encontrarás información sobre tus derechos, el convenio colectivo y las actividades del comité.
            </p>
            <Link
              href="/panel/login"
              style={{ backgroundColor: '#F2B705', color: '#003087' }}
              className="inline-block px-8 py-3 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              Entrar al panel de trabajadores
            </Link>
          </div>
        </section>

        {/* Secciones informativas */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-l-4 pl-4" style={{ borderColor: '#003087' }}>
              <h3 className="font-bold text-lg mb-2">Avisos y noticias</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Mantente informado sobre las novedades, acuerdos y comunicaciones del comité de empresa.
              </p>
            </div>
            <div className="border-l-4 pl-4" style={{ borderColor: '#C8102E' }}>
              <h3 className="font-bold text-lg mb-2">Votaciones</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Participa en las votaciones y consultas que el comité abre a los trabajadores del centro.
              </p>
            </div>
            <div className="border-l-4 pl-4" style={{ borderColor: '#F2B705' }}>
              <h3 className="font-bold text-lg mb-2">Propuestas</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Envía tus propuestas y sugerencias directamente al comité de empresa.
              </p>
            </div>
          </div>
        </section>

        {/* Composición del comité */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-8 text-center text-gray-800">Composición del comité</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
            <div className="flex-1 rounded-xl border-2 p-6 text-center" style={{ borderColor: '#C8102E' }}>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C8102E' }}>CCOO</p>
              <p className="text-5xl font-bold mb-1" style={{ color: '#C8102E' }}>6</p>
              <p className="text-sm text-gray-500">representantes</p>
            </div>
            <div className="flex-1 rounded-xl border-2 p-6 text-center" style={{ borderColor: '#003087' }}>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#003087' }}>UGT</p>
              <p className="text-5xl font-bold mb-1" style={{ color: '#003087' }}>3</p>
              <p className="text-sm text-gray-500">representantes</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">9 miembros en total · mandato vigente</p>
        </section>

        {/* Contacto */}
        <section className="bg-gray-50 py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-3">¿Necesitas contactar con el comité?</h3>
            <p className="text-gray-600 mb-6">
              Si tienes alguna consulta o necesitas asesoramiento, escríbenos.
            </p>
            <a
              href="mailto:comite@clm.ugr.es"
              style={{ backgroundColor: '#003087' }}
              className="inline-block text-white px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
            >
              comite@clm.ugr.es
            </a>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="border-t py-6 px-6 text-center text-xs text-gray-400">
        <p>Comité de Empresa · Centro de Lenguas Modernas · Universidad de Granada</p>
      </footer>
    </div>
  )
}
