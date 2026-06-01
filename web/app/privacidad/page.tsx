import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <header style={{ backgroundColor: '#003087' }} className="text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">← Volver al inicio</Link>
          <h1 className="text-2xl font-bold mt-2">Política de Privacidad</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-gray prose-sm sm:prose-base">
        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li><strong>Responsable:</strong> Comité de Empresa del Centro de Lenguas Modernas – Universidad de Granada</li>
          <li><strong>Dirección:</strong> Placeta del Hospicio Viejo, s/n — 18010 Granada</li>
          <li><strong>Contacto CCOO:</strong> ccoo@fyg.ugr.es</li>
          <li><strong>Contacto UGT:</strong> ugt@fyg.ugr.es</li>
        </ul>

        <h2>2. Datos que recabamos y finalidades</h2>

        <h3>a) Formulario de contacto público</h3>
        <p>Datos: nombre, dirección de correo electrónico, asunto y mensaje.</p>
        <p>Finalidad: atender la consulta o solicitud formulada y remitir respuesta al interesado.</p>
        <p>Base jurídica: consentimiento del interesado (art. 6.1.a RGPD).</p>
        <p>Conservación: los datos se conservan durante el tiempo necesario para tramitar la solicitud y, en su caso, para atender posibles responsabilidades, con un máximo de 2 años.</p>

        <h3>b) Panel de trabajadores (acceso autenticado)</h3>
        <p>Datos: dirección de correo electrónico del trabajador.</p>
        <p>Finalidad: autenticación y acceso al área restringida del panel de trabajadores del CLM.</p>
        <p>Base jurídica: ejecución de una relación laboral y representación sindical (art. 6.1.b y 6.1.c RGPD; art. 64 Estatuto de los Trabajadores).</p>
        <p>Conservación: mientras dure la relación laboral con el CLM o hasta que el trabajador solicite la supresión.</p>

        <h3>c) Votaciones y propuestas</h3>
        <p>Datos: identificador del trabajador y opción de voto o texto de la propuesta.</p>
        <p>Finalidad: gestionar los procesos de participación democrática del comité.</p>
        <p>Base jurídica: ejecución de funciones sindicales y representación de trabajadores (art. 6.1.c RGPD).</p>
        <p>Conservación: hasta que finalice el mandato del comité o se archive el proceso.</p>

        <h2>3. Destinatarios</h2>
        <p>
          Los datos no se ceden a terceros salvo obligación legal. El sitio utiliza los siguientes proveedores de servicios (encargados del tratamiento):
        </p>
        <ul>
          <li><strong>Supabase Inc.</strong> — almacenamiento de datos y autenticación. Datos alojados en la UE (Frankfurt). <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Política de privacidad de Supabase</a></li>
          <li><strong>Vercel Inc.</strong> — alojamiento del sitio web. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Política de privacidad de Vercel</a></li>
          <li><strong>Resend Inc.</strong> — envío de correos electrónicos transaccionales. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">Política de privacidad de Resend</a></li>
        </ul>

        <h2>4. Derechos de los interesados</h2>
        <p>Puede ejercer los siguientes derechos escribiendo a <strong>ccoo@fyg.ugr.es</strong> o <strong>ugt@fyg.ugr.es</strong> con copia de su DNI o documento identificativo equivalente:</p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos tratamos sobre usted.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
          <li><strong>Limitación:</strong> solicitar que se restrinja el tratamiento en determinadas circunstancias.</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento en los casos en que la ley lo permita.</li>
          <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común.</li>
        </ul>
        <p>
          Tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (AEPD) — <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a> — si considera que el tratamiento vulnera el RGPD.
        </p>

        <h2>5. Seguridad</h2>
        <p>
          Adoptamos medidas técnicas y organizativas adecuadas para proteger sus datos: transmisión cifrada mediante HTTPS/TLS, autenticación mediante enlace seguro (magic link), acceso restringido a los datos por roles diferenciados.
        </p>

        <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3 not-prose">
          <span className="text-xl mt-0.5" aria-hidden="true">🔒</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">Sitio web auditado</p>
            <p className="text-green-700 text-xs mt-1 leading-relaxed">
              Este sitio ha superado una auditoría de seguridad que incluye: protección contra
              inyección HTML, cabeceras HTTP de seguridad (HSTS, CSP, X-Frame-Options,
              X-Content-Type-Options), validación y limitación de entradas en todos los formularios,
              control de acceso basado en roles, y bloqueo de acceso anónimo a la base de datos
              mediante políticas RLS. Los datos se alojan en servidores de la Unión Europea (Frankfurt).
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-6">Última actualización: junio de 2026</p>
      </main>

      <footer className="border-t py-6 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/aviso-legal" className="hover:text-gray-600">Aviso legal</Link>
          <Link href="/cookies" className="hover:text-gray-600">Política de cookies</Link>
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
        </div>
      </footer>
    </div>
  )
}
