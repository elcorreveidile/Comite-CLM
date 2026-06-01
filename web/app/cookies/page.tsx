import Link from 'next/link'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header style={{ backgroundColor: '#003087' }} className="text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">← Volver al inicio</Link>
          <h1 className="text-2xl font-bold mt-2">Política de Cookies</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-gray prose-sm sm:prose-base">
        <p>
          Este sitio web utiliza únicamente cookies técnicas y de sesión, estrictamente necesarias para su funcionamiento. No se utilizan cookies de seguimiento, publicidad ni analítica.
        </p>

        <h2>Cookies que utilizamos</h2>

        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Finalidad</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token</td>
                <td className="px-4 py-3">Técnica / Sesión</td>
                <td className="px-4 py-3">Mantiene la sesión autenticada del trabajador o miembro del comité.</td>
                <td className="px-4 py-3">Sesión / 1 semana</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">cookie-consent</td>
                <td className="px-4 py-3">Técnica / Local</td>
                <td className="px-4 py-3">Almacena si el usuario ha aceptado este aviso de cookies (localStorage).</td>
                <td className="px-4 py-3">1 año</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>¿Son necesarias estas cookies?</h2>
        <p>
          Sí. Las cookies de sesión son imprescindibles para que el panel de trabajadores y el área de administración funcionen correctamente. Sin ellas no sería posible mantener la sesión iniciada durante la navegación.
        </p>
        <p>
          Al tratarse exclusivamente de cookies técnicas necesarias, su uso no requiere consentimiento previo según el art. 22.2 de la Ley 34/2002 (LSSICE) y el considerando 47 del RGPD.
        </p>

        <h2>¿Cómo desactivar o eliminar las cookies?</h2>
        <p>Puede gestionar las cookies desde la configuración de su navegador:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p>Tenga en cuenta que deshabilitar las cookies de sesión impedirá el acceso al panel de trabajadores.</p>

        <p className="text-gray-400 text-xs mt-10">Última actualización: junio de 2025</p>
      </main>

      <footer className="border-t py-6 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/aviso-legal" className="hover:text-gray-600">Aviso legal</Link>
          <Link href="/privacidad" className="hover:text-gray-600">Política de privacidad</Link>
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
        </div>
      </footer>
    </div>
  )
}
