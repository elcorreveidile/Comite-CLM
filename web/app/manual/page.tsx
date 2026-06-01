import PrintButton from './PrintButton'

export const metadata = { title: 'Manual de Uso · Comité de Empresa CLM', robots: 'noindex' }

const BLUE = '#003087'
const RED  = '#E2001A'

function Portada() {
  return (
    <div className="print:break-after-page flex flex-col items-center justify-center min-h-[90vh] text-center px-8 py-16">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-4"
             style={{ backgroundColor: BLUE }}>
          <div className="w-full h-2.5 rounded-t-2xl" style={{ backgroundColor: RED }} />
          <span className="text-white font-black text-3xl mt-1 tracking-tight">CE</span>
          <span className="text-white/60 text-xs font-bold tracking-[0.2em] mb-1">CLM</span>
        </div>
        <p className="text-sm uppercase tracking-widest text-gray-400">Universidad de Granada</p>
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">Manual de Uso</h1>
      <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: BLUE }}>Portal del Comité de Empresa</h2>
      <p className="text-gray-500 text-lg mb-12">Centro de Lenguas Modernas · Universidad de Granada</p>
      <div className="flex flex-col sm:flex-row gap-6 text-sm text-gray-500 border-t border-gray-200 pt-8 w-full max-w-lg justify-center">
        <span>Versión junio 2026</span>
        <span className="hidden sm:block text-gray-300">·</span>
        <span>comiteclm.com</span>
        <span className="hidden sm:block text-gray-300">·</span>
        <span>Uso interno</span>
      </div>
    </div>
  )
}

function SectionHeader({ id, color, label, title, subtitle }: { id: string; color: string; label: string; title: string; subtitle: string }) {
  return (
    <div id={id} className="print:break-before-page rounded-2xl text-white p-8 mb-8" style={{ backgroundColor: color }}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-2">{label}</p>
      <h2 className="text-3xl font-black leading-tight mb-2">{title}</h2>
      <p className="opacity-80 text-base">{subtitle}</p>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5"
           style={{ backgroundColor: BLUE }}>{n}</div>
      <div>
        <p className="font-semibold text-gray-800 mb-1">{title}</p>
        <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 bg-blue-50 text-blue-800 text-sm rounded-r-xl px-4 py-3 my-4 leading-relaxed"
         style={{ borderColor: BLUE }}>{children}</div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 bg-amber-50 text-amber-800 text-sm rounded-r-xl px-4 py-3 my-4 leading-relaxed"
         style={{ borderColor: '#F59E0B' }}>{children}</div>
  )
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-bold mt-8 mb-3 scroll-mt-6" style={{ color: BLUE }}>
      {children}
    </h3>
  )
}

function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="font-semibold text-gray-800 mt-5 mb-2">{children}</h4>
}

// ── Índice ────────────────────────────────────────────────────────────────────

const TOC_I = [
  { label: '1. Introducción',       href: '#p1-intro'       },
  { label: '2. Acceso al panel',    href: '#p1-acceso'      },
  { label: '3. Panel de inicio',    href: '#p1-panel'       },
  { label: '4. Tablón de avisos',   href: '#p1-avisos'      },
  { label: '5. Votaciones',         href: '#p1-votaciones'  },
  { label: '6. Propuestas',         href: '#p1-propuestas'  },
  { label: '7. Calendario',         href: '#p1-calendario'  },
  { label: '8. Documentos',         href: '#p1-documentos'  },
  { label: '9. Uso desde el móvil', href: '#p1-movil'       },
]

const TOC_II = [
  { label: '1. Acceso al área de administración', href: '#p2-acceso'        },
  { label: '2. Panel de control',                 href: '#p2-panel'         },
  { label: '3. Gestión de trabajadores',          href: '#p2-trabajadores'  },
  { label: '4. Tablón de avisos',                 href: '#p2-avisos'        },
  { label: '5. Votaciones',                       href: '#p2-votaciones'    },
  { label: '6. Propuestas',                       href: '#p2-propuestas'    },
  { label: '7. Calendario',                       href: '#p2-calendario'    },
  { label: '8. Documentos',                       href: '#p2-documentos'    },
  { label: '9. Comunicados a trabajadores',       href: '#p2-comunicados'   },
  { label: '10. Gestión de miembros',             href: '#p2-miembros'      },
  { label: 'Apéndice — Roles y permisos',         href: '#apendice'         },
]

const linkClass = 'py-1 border-b border-gray-100 flex items-center gap-1.5 group'
const aClass    = 'hover:text-blue-700 transition-colors print:text-gray-600 print:no-underline'

// ─────────────────────────────────────────────────────────────────────────────

export default function ManualPage() {
  return (
    <>
      <style>{`
        @media print {
          @page { margin: 18mm 15mm; size: A4; }
          body { font-size: 10.5pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:break-before-page { break-before: page; }
          .print\\:break-after-page  { break-after: page; }
          h2 { break-after: avoid; }
          h3, h4 { break-after: avoid; }
          table { break-inside: avoid; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      <div className="bg-white text-gray-900 max-w-3xl mx-auto px-6 py-10 print:px-0 print:py-0">

        {/* ── VOLVER AL INICIO ── */}
        <div className="print:hidden mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver a la página principal
          </a>
        </div>

        {/* ── PORTADA ── */}
        <Portada />

        {/* ── ÍNDICE ── */}
        <div className="print:break-before-page mb-16">
          <h2 className="text-2xl font-black mb-6 pb-3 border-b-2" style={{ borderColor: BLUE, color: BLUE }}>
            Índice
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 text-sm text-gray-600">

            <div>
              <a href="#parte-i" className={`font-bold text-gray-900 mb-2 mt-3 block hover:text-blue-700 transition-colors ${aClass}`}>
                Parte I — Trabajadores
              </a>
              {TOC_I.map(({ label, href }) => (
                <div key={href} className={linkClass}>
                  <span className="text-gray-300 text-xs">›</span>
                  <a href={href} className={`flex-1 ${aClass}`}>{label}</a>
                </div>
              ))}
            </div>

            <div>
              <a href="#parte-ii" className={`font-bold text-gray-900 mb-2 mt-3 block hover:text-blue-700 transition-colors ${aClass}`}>
                Parte II — Miembros del comité
              </a>
              {TOC_II.map(({ label, href }) => (
                <div key={href} className={linkClass}>
                  <span className="text-gray-300 text-xs">›</span>
                  <a href={href} className={`flex-1 ${aClass}`}>{label}</a>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ════════════════════════════════
            PARTE I — TRABAJADORES
        ════════════════════════════════ */}
        <SectionHeader id="parte-i" color={BLUE} label="Parte I"
          title="Guía para trabajadores"
          subtitle="Todo lo que necesitas saber para usar el panel de trabajadores del CLM." />

        <H3 id="p1-intro">1. Introducción</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          El portal del Comité de Empresa del Centro de Lenguas Modernas de la Universidad de Granada
          es una plataforma privada donde los trabajadores del CLM pueden mantenerse informados,
          participar en votaciones, consultar documentos y comunicarse con el comité de forma directa
          y segura.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          El acceso es exclusivo para trabajadores registrados. No se usa ninguna contraseña: el sistema
          envía automáticamente un enlace seguro a tu correo cada vez que quieras entrar.
        </p>

        <H3 id="p1-acceso">2. Acceso al panel</H3>
        <Step n={1} title="Abre el portal">
          Entra en <strong>comiteclm.com</strong> y haz clic en el botón <strong>«Acceso trabajadores»</strong>
          (esquina superior derecha) o en <strong>«Entrar al panel de trabajadores»</strong> en el centro de la pantalla.
        </Step>
        <Step n={2} title="Introduce tu correo de trabajo">
          Escribe tu dirección de correo electrónico del CLM o de la UGR
          (por ejemplo, <em>tu.nombre@ugr.es</em> o <em>tu.nombre@clm.ugr.es</em>).
          Solo funcionan los correos que el comité haya dado de alta en el sistema.
        </Step>
        <Step n={3} title="Revisa tu bandeja de entrada">
          En pocos segundos recibirás un correo con asunto <strong>«Enlace de acceso»</strong>.
          Abre ese correo y haz clic en el botón de acceso.
        </Step>
        <Step n={4} title="Estás dentro">
          El enlace te abrirá directamente el panel. La sesión permanece activa en ese dispositivo;
          no necesitarás volver a identificarte hasta que expire.
        </Step>
        <Note>
          <strong>Sin contraseñas:</strong> el portal usa <em>magic links</em> (enlaces seguros de un solo uso).
          Cada vez que accedas desde un nuevo dispositivo o navegador, repite el proceso introduciendo
          tu correo. El enlace caduca a los 60 minutos.
        </Note>
        <Warning>
          Si no recibes el correo en 2 minutos, revisa la carpeta de spam.
          Si tu correo no está registrado, contacta con el comité a través del formulario de la página principal.
        </Warning>

        <H3 id="p1-panel">3. Panel de inicio</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Al entrar verás tu panel personal con un saludo y acceso rápido a todas las secciones.
          Cada tarjeta muestra cuántos elementos activos hay.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 my-4">
          {[
            { icon: '📋', name: 'Tablón de avisos', desc: 'Comunicaciones del comité.' },
            { icon: '🗳️', name: 'Votaciones',        desc: 'Consultas y votaciones abiertas.' },
            { icon: '💬', name: 'Propuestas',         desc: 'Envía sugerencias al comité.' },
            { icon: '📅', name: 'Calendario',         desc: 'Próximas fechas y reuniones.' },
            { icon: '📁', name: 'Documentos',         desc: 'Convenio, actas y circulares.' },
          ].map(({ icon, name, desc }) => (
            <div key={name} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3 text-sm">
              <span className="text-xl">{icon}</span>
              <div><p className="font-semibold text-gray-800">{name}</p><p className="text-gray-500">{desc}</p></div>
            </div>
          ))}
        </div>

        <H3 id="p1-avisos">4. Tablón de avisos</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          En el tablón encontrarás todos los comunicados, acuerdos y noticias que el comité
          haya publicado. Los avisos aparecen ordenados del más reciente al más antiguo.
          Cada aviso muestra el título, el contenido y la fecha de publicación.
        </p>
        <Note>Si no hay avisos publicados aparecerá el mensaje <em>«No hay avisos publicados en este momento»</em>.</Note>

        <H3 id="p1-votaciones">5. Votaciones</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Cuando el comité abra una consulta o votación, aparecerá en esta sección. Para participar:
        </p>
        <Step n={1} title="Accede a la votación activa">Lee el título y la descripción de la consulta.</Step>
        <Step n={2} title="Selecciona tu opción">Haz clic en la opción que quieras votar.</Step>
        <Step n={3} title="Confirma">Tu voto queda registrado. Cada trabajador solo puede votar una vez por consulta.</Step>
        <Note>
          Una vez emitido, el voto no puede modificarse. El sistema registra que has votado,
          pero la confidencialidad del sentido del voto se garantiza mediante el diseño de la base de datos.
        </Note>

        <H3 id="p1-propuestas">6. Propuestas</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          ¿Tienes una sugerencia? Usa esta sección para enviar una propuesta directamente al comité.
        </p>
        <Step n={1} title="Escribe el título">Resume tu propuesta en una línea (máx. 300 caracteres).</Step>
        <Step n={2} title="Desarrolla el contenido">Explica tu propuesta con el detalle necesario (máx. 5 000 caracteres).</Step>
        <Step n={3} title="Elige si quieres ser anónimo/a">
          Activa la casilla <strong>«Enviar como anónima»</strong> si prefieres que el comité no sepa de quién proviene.
        </Step>
        <Step n={4} title="Envía">Haz clic en «Enviar propuesta».</Step>
        <H4>Seguimiento de tus propuestas</H4>
        <p className="text-gray-600 text-sm leading-relaxed">
          Debajo del formulario encontrarás todas las propuestas que has enviado con su estado:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 mb-4 space-y-1">
          <li><strong className="text-amber-700">Pendiente</strong> — el comité aún no la ha revisado.</li>
          <li><strong className="text-green-700">Revisada</strong> — el comité la ha leído. Si han dejado respuesta, aparecerá debajo.</li>
        </ul>

        <H3 id="p1-calendario">7. Calendario</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          El calendario muestra los próximos eventos del comité: reuniones, plazos importantes,
          actos sindicales, etc. Solo aparecen los eventos a partir de la fecha actual.
          Cada evento puede incluir título, fecha, hora, lugar y descripción.
        </p>

        <H3 id="p1-documentos">8. Documentos</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          En esta sección encontrarás toda la documentación relevante: el convenio colectivo,
          las actas del comité, circulares y cualquier otro documento de interés.
          Los documentos están organizados por categorías.
          Para abrir uno haz clic en el enlace <strong>«Abrir →»</strong>.
        </p>

        <H3 id="p1-movil">9. Uso desde el móvil</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          El portal está optimizado para teléfonos móviles. En la parte inferior de la pantalla
          encontrarás una barra de navegación rápida:
        </p>
        <div className="flex justify-around bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 my-4 text-center">
          {['🏠 Inicio','📋 Avisos','🗳️ Votar','💬 Proponer','··· Más'].map(s => (
            <div key={s} className="text-xs text-gray-600">{s}</div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          El botón <strong>«···&nbsp;Más»</strong> despliega un menú con acceso al Calendario,
          Documentos y la opción de Cerrar sesión.
        </p>

        {/* ════════════════════════════════
            PARTE II — ADMINISTRACIÓN
        ════════════════════════════════ */}
        <SectionHeader id="parte-ii" color="#1a1a2e" label="Parte II"
          title="Guía para miembros del comité"
          subtitle="Manual del área de administración — acceso restringido a los representantes elegidos." />

        <H3 id="p2-acceso">1. Acceso al área de administración</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          El área de administración es accesible exclusivamente para los miembros del comité
          registrados en el sistema. El proceso es el mismo que el de los trabajadores
          (enlace por correo), pero en una URL diferente.
        </p>
        <Step n={1} title="Ve a la URL de administración">
          En el pie de página de <strong>comiteclm.com</strong> encontrarás el enlace
          <strong> «Área del comité»</strong>. También puedes acceder directamente en
          <strong> comiteclm.com/admin/login</strong>.
        </Step>
        <Step n={2} title="Introduce tu correo de miembro del comité">
          Solo los correos registrados por el superadministrador tienen acceso.
        </Step>
        <Step n={3} title="Revisa tu correo y haz clic en el enlace">
          El proceso es idéntico al del panel de trabajadores.
        </Step>
        <Warning>
          <strong>Seguridad:</strong> si alguien intenta acceder sin autorización, el sistema
          lo detecta y le muestra una página de aviso. Los intentos repetidos quedan registrados.
        </Warning>

        <H3 id="p2-panel">2. Panel de control</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          El panel de control muestra una visión global: trabajadores registrados, avisos publicados,
          votaciones activas, propuestas pendientes, documentos y próximos eventos.
          Cada cifra es un enlace directo a la sección correspondiente.
        </p>
        <p className="text-sm text-gray-600">
          Las cifras en <span style={{ color: RED }} className="font-semibold">rojo</span> indican
          elementos que requieren atención (votaciones activas, propuestas sin revisar).
        </p>

        <H3 id="p2-trabajadores">3. Gestión de trabajadores</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          El censo de trabajadores determina quién puede acceder al panel. Desde aquí puedes
          añadir, editar y dar de baja a trabajadores.
        </p>
        <H4>Campos del formulario</H4>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ backgroundColor: BLUE }} className="text-white text-left">
              <th className="px-3 py-2 rounded-tl-lg">Campo</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2 rounded-tr-lg">Obligatorio</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Nombre completo','Nombre y apellidos del trabajador','Sí'],
                ['Correo electrónico','El correo con el que accederá al panel','Sí'],
                ['Departamento','Departamento o área del CLM','No'],
                ['Teléfono','Número de contacto','No'],
                ['Notas','Observaciones internas (no visibles al trabajador)','No'],
              ].map(([c,d,o]) => (
                <tr key={c} className="odd:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{c}</td>
                  <td className="px-3 py-2 text-gray-500">{d}</td>
                  <td className="px-3 py-2 text-center">{o === 'Sí' ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>Para dar de baja a un trabajador basta con eliminarlo del censo. Perderá el acceso de inmediato.</Note>

        <H3 id="p2-avisos">4. Tablón de avisos</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Los avisos son los mensajes que el comité publica en el panel de los trabajadores.
        </p>
        <Step n={1} title="Haz clic en «Nuevo aviso»">Aparecerá el formulario de creación.</Step>
        <Step n={2} title="Escribe el título y el contenido">El cuerpo admite texto con saltos de línea (máx. 10 000 caracteres).</Step>
        <Step n={3} title="Publica o guarda como borrador">
          Un aviso sin publicar no es visible para los trabajadores hasta que actives el toggle
          <strong> «Publicado / Oculto»</strong>.
        </Step>
        <p className="text-sm text-gray-600 mt-2">
          Puedes <strong>editar</strong> o <strong>eliminar</strong> cualquier aviso en cualquier momento.
        </p>

        <H3 id="p2-votaciones">5. Votaciones</H3>
        <Step n={1} title="Haz clic en «Nueva votación»">Rellena el título (obligatorio) y una descripción opcional.</Step>
        <Step n={2} title="Añade las opciones">Mínimo 2, máximo 10.</Step>
        <Step n={3} title="Activa la votación cuando estés listo/a">
          Se crea en estado <em>inactiva</em>. Actívala con el toggle cuando quieras que los trabajadores voten.
        </Step>
        <H4>Consultar resultados</H4>
        <p className="text-sm text-gray-600">
          En el listado verás en tiempo real el número de votos por opción.
          Para cerrar la votación, desactívala con el mismo toggle.
        </p>
        <Warning>Al eliminar una votación se borran también todos los votos. Esta acción no se puede deshacer.</Warning>

        <H3 id="p2-propuestas">6. Propuestas de los trabajadores</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Las propuestas enviadas por los trabajadores aparecen ordenadas de más reciente a más antigua.
          Las propuestas anónimas no muestran el nombre del trabajador.
        </p>
        <Step n={1} title="Abre la propuesta">Haz clic en el título para ver el detalle completo.</Step>
        <Step n={2} title="Escribe la respuesta">Usa el campo de texto de respuesta del comité.</Step>
        <Step n={3} title="Guarda">La propuesta pasa a «Revisada» y el trabajador verá la respuesta en su panel.</Step>
        <p className="text-sm text-gray-600 mt-2">
          También puedes marcar una propuesta como revisada sin añadir respuesta escrita.
        </p>

        <H3 id="p2-calendario">7. Calendario</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Gestiona los eventos que los trabajadores verán en su calendario.
          Haz clic en <strong>«Nuevo evento»</strong> y rellena: título (obligatorio),
          fecha (obligatorio, formato AAAA-MM-DD), hora (HH:MM, opcional),
          lugar y descripción (opcionales, máx. 2 000 caracteres).
        </p>
        <p className="text-sm text-gray-600">
          Los eventos del pasado no se muestran en el panel de los trabajadores,
          pero permanecen en el historial del administrador.
        </p>

        <H3 id="p2-documentos">8. Documentos</H3>
        <Step n={1} title="Haz clic en «Nuevo documento»">Rellena el título y, opcionalmente, descripción y categoría.</Step>
        <Step n={2} title="Adjunta el archivo o pega una URL">
          Puedes subir un archivo (PDF, Word, Excel, OpenDocument…) o pegar un enlace externo.
        </Step>
        <Step n={3} title="Guarda">El documento aparecerá de inmediato en el panel de los trabajadores.</Step>
        <div className="my-3 text-sm">
          <p className="font-semibold text-gray-700 mb-1">Formatos aceptados:</p>
          <p className="text-gray-500">PDF, DOC, DOCX, XLS, XLSX, ODT, ODS, PPT, PPTX, TXT · Tamaño máximo: 20 MB</p>
        </div>

        <H3 id="p2-comunicados">9. Comunicados a trabajadores</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Los comunicados permiten enviar un correo electrónico a <strong>todos los trabajadores
          activos</strong> registrados en el sistema.
        </p>
        <H4>Roles y permisos</H4>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ backgroundColor: '#1a1a2e' }} className="text-white text-left">
              <th className="px-3 py-2 rounded-tl-lg">Rol</th>
              <th className="px-3 py-2">¿Puede redactar?</th>
              <th className="px-3 py-2">¿Envío directo?</th>
              <th className="px-3 py-2 rounded-tr-lg">¿Puede aprobar?</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Administrador web (superadmin)', 'Sí', 'Sí', 'Sí'],
                ['Presidenta', 'Sí', 'Sí', 'Sí'],
                ['Secretaria', 'Sí', 'No — requiere aprobación', 'No'],
                ['Resto de miembros', 'No', 'No', 'No'],
              ].map(([r, c, e, a]) => (
                <tr key={r} className="odd:bg-gray-50 text-gray-600">
                  <td className="px-3 py-2 font-medium text-gray-800">{r}</td>
                  <td className="px-3 py-2">{c}</td>
                  <td className="px-3 py-2">{e}</td>
                  <td className="px-3 py-2">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <H4>Flujo para el Administrador web o la Presidenta</H4>
        <Step n={1} title="Redacta el comunicado">Escribe el asunto y el cuerpo (máx. 20 000 caracteres).</Step>
        <Step n={2} title="Haz clic en «Enviar a todos los trabajadores»">El sistema envía el correo y registra el comunicado como enviado.</Step>
        <H4>Flujo para la Secretaria</H4>
        <Step n={1} title="Redacta el comunicado">Escribe el asunto y el cuerpo.</Step>
        <Step n={2} title="Haz clic en «Solicitar aprobación a la Presidenta»">
          El comunicado queda en estado <strong>«Pendiente de aprobación»</strong> y aparece destacado en el panel de la Presidenta.
        </Step>
        <Step n={3} title="La Presidenta aprueba o rechaza">
          Si aprueba, el correo se envía automáticamente a todos los trabajadores.
        </Step>
        <Note>
          Los comunicados se envían con remitente <em>no-reply@comiteclm.com</em> y con
          copia oculta (BCC) para proteger la privacidad de los destinatarios.
        </Note>

        <H3 id="p2-miembros">10. Gestión de miembros del comité</H3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Accesible <strong>únicamente para el Administrador web (superadministrador)</strong>.
          Permite gestionar quién tiene acceso al área de administración y qué cargo desempeña.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
          <li>Añadir nuevos miembros con nombre, correo y cargo.</li>
          <li>Modificar el cargo de un miembro existente.</li>
          <li>Desactivar a un miembro para que pierda el acceso al área de administración.</li>
          <li>Consultar el sindicato al que pertenece cada representante.</li>
        </ul>
        <Warning>
          Los cambios en los miembros del comité tienen efecto inmediato. Si desactivas a un
          miembro, perderá el acceso en la próxima carga de página.
        </Warning>

        {/* ── APÉNDICE ── */}
        <div id="apendice" className="print:break-before-page mt-12 scroll-mt-6">
          <h2 className="text-2xl font-black mb-6 pb-3 border-b-2" style={{ borderColor: RED, color: RED }}>
            Apéndice — Roles y permisos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ backgroundColor: RED }} className="text-white text-left">
                <th className="px-3 py-2 rounded-tl-lg">Rol</th>
                <th className="px-3 py-2">Panel trabajadores</th>
                <th className="px-3 py-2">Área admin</th>
                <th className="px-3 py-2">Comunicados directos</th>
                <th className="px-3 py-2">Aprobar comunicados</th>
                <th className="px-3 py-2 rounded-tr-lg">Gestionar miembros</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {[
                  ['Trabajador',           '✓','—','—','—','—'],
                  ['Miembro del comité',   '✓','✓','—','—','—'],
                  ['Secretaria',           '✓','✓','—','—','—'],
                  ['Presidenta',           '✓','✓','✓','✓','—'],
                  ['Administrador web', '✓','✓','✓','✓','✓'],
                ].map(([rol, ...rest]) => (
                  <tr key={rol} className="odd:bg-gray-50 text-gray-600">
                    <td className="px-3 py-2 text-left font-medium text-gray-800">{rol}</td>
                    {rest.map((v, i) => (
                      <td key={i} className={`px-3 py-2 ${v === '✓' ? 'text-green-600 font-bold' : 'text-gray-300'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 p-6 rounded-2xl border border-gray-200 bg-gray-50 text-sm">
            <p className="font-bold text-gray-800 mb-3">Contacto del comité</p>
            <div className="grid sm:grid-cols-2 gap-2 text-gray-600">
              <div><p className="font-semibold">CCOO</p><p>ccoo@fyg.ugr.es</p></div>
              <div><p className="font-semibold">UGT</p><p>ugt@fyg.ugr.es</p></div>
              <div className="sm:col-span-2"><p className="font-semibold">Dirección</p><p>Placeta del Hospicio Viejo, s/n — 18010 Granada</p></div>
              <div className="sm:col-span-2"><p className="font-semibold">Portal</p><p>comiteclm.com</p></div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-300 border-t pt-6">
            <p>Comité de Empresa · Centro de Lenguas Modernas · Universidad de Granada</p>
            <p>Manual de uso v1.0 — junio 2026 · Documento de uso interno</p>
            <p className="mt-1">Desarrollo web: <a href="https://www.por2duros.com" className="underline hover:text-gray-500">Por 2 duros</a></p>
          </div>
        </div>

      </div>

      <PrintButton />
    </>
  )
}
