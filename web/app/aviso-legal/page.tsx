import Link from 'next/link'

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <header style={{ backgroundColor: '#003087' }} className="text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">← Volver al inicio</Link>
          <h1 className="text-2xl font-bold mt-2">Aviso Legal</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-gray prose-sm sm:prose-base">
        <h2>1. Identificación del titular</h2>
        <p>
          El presente sitio web (<strong>comiteclm.com</strong>) es titularidad del <strong>Comité de Empresa del Centro de Lenguas Modernas de la Universidad de Granada</strong>, órgano de representación de los trabajadores constituido al amparo del Estatuto de los Trabajadores.
        </p>
        <ul>
          <li><strong>Denominación:</strong> Comité de Empresa del CLM – Universidad de Granada</li>
          <li><strong>Dirección:</strong> Placeta del Hospicio Viejo, s/n — 18010 Granada</li>
          <li><strong>Correo de contacto (CCOO):</strong> ccoo@fyg.ugr.es</li>
          <li><strong>Correo de contacto (UGT):</strong> ugt@fyg.ugr.es</li>
        </ul>

        <h2>2. Objeto</h2>
        <p>
          Este sitio web tiene como finalidad facilitar la comunicación entre el Comité de Empresa y los trabajadores del Centro de Lenguas Modernas de la Universidad de Granada, ofreciendo información sobre avisos, votaciones, documentos y propuestas sindicales.
        </p>

        <h2>3. Condiciones de uso</h2>
        <p>
          El acceso y uso del sitio web implica la aceptación plena de las presentes condiciones. El usuario se compromete a hacer un uso lícito del sitio, respetando la legislación vigente y los derechos de terceros.
        </p>

        <h2>4. Propiedad intelectual</h2>
        <p>
          Los contenidos del sitio web (textos, imágenes, logotipos) son propiedad del Comité de Empresa o de sus titulares correspondientes (CCOO, UGT, Universidad de Granada). Queda prohibida su reproducción sin autorización expresa, salvo para uso personal y no comercial.
        </p>

        <h2>5. Limitación de responsabilidad</h2>
        <p>
          El Comité de Empresa no se responsabiliza de los daños derivados del uso del sitio ni de la información contenida en él, ni de los fallos técnicos que pudieran producirse en su acceso.
        </p>

        <h2>6. Legislación aplicable</h2>
        <p>
          Las presentes condiciones se rigen por la legislación española. Para cualquier controversia serán competentes los Juzgados y Tribunales de Granada.
        </p>

        <p className="text-gray-400 text-xs mt-10">Última actualización: junio de 2026</p>
      </main>

      <footer className="border-t py-6 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/privacidad" className="hover:text-gray-600">Política de privacidad</Link>
          <Link href="/cookies" className="hover:text-gray-600">Política de cookies</Link>
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
        </div>
      </footer>
    </div>
  )
}
