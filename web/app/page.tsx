import Link from 'next/link'
import Image from 'next/image'
import ContactForm from '@/app/components/ContactForm'
import CookieBanner from '@/app/components/CookieBanner'
import FooterEasterEgg from '@/app/components/FooterEasterEgg'

const UGT_MEMBERS: { nombre: string; cargo?: string }[] = [
  { nombre: 'Benjamín Prieto' },
  { nombre: 'Agustina García García' },
  { nombre: 'Javier Benítez' },
]

export default function Home() {
  return (
    <>
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Cabecera ── */}
      <header style={{ backgroundColor: '#003087' }} className="text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest opacity-60 hidden sm:block">Universidad de Granada</p>
            <h1 className="text-base sm:text-lg font-semibold leading-tight">
              Comité CLM · Sección Sindical UGT
              <span className="block text-xs sm:text-sm font-normal opacity-75">Centro de Lenguas Modernas</span>
            </h1>
          </div>
          <Link
            href="/panel/login"
            className="shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded border border-white/40 hover:bg-white hover:text-blue-900 transition-colors whitespace-nowrap"
          >
            Acceso trabajadores
          </Link>
        </div>
        {/* Franja de colores sindicales */}
        <div className="flex h-1">
          <div className="flex-1" style={{ backgroundColor: '#E2001A' }} />
          <div className="flex-1" style={{ backgroundColor: '#E2001A', opacity: 0.7 }} />
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative text-white py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/patio-clm.jpg" alt="Patio del Centro de Lenguas Modernas" fill className="object-cover object-[center_40%]" priority />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,48,135,0.88) 0%, rgba(0,48,135,0.78) 60%, rgba(0,48,135,0.88) 100%)' }} />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <Image src="/logo-ugt.webp" alt="UGT" width={100} height={60} style={{ height: '3.25rem', width: 'auto' }} className="object-contain drop-shadow-md" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Tu canal directo con el comité</h2>
            <p className="text-base sm:text-lg opacity-80 mb-8 leading-relaxed">
              La Sección Sindical de UGT del Centro de Lenguas Modernas pone a tu disposición
              esta herramienta de comunicación directa. Todo lo que nos hagas llegar será trasladado
              al conjunto del Comité de Empresa.
            </p>
            <Link
              href="/panel/login"
              className="inline-block px-8 py-3 rounded font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E2001A', color: 'white' }}
            >
              Entrar al panel de trabajadores
            </Link>
          </div>
        </section>

        {/* ── Qué encontrarás ── */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Avisos y noticias',  desc: 'Novedades, acuerdos y comunicaciones del comité.' },
              { icon: '🗳️', title: 'Votaciones',         desc: 'Participa en las consultas abiertas a los trabajadores.' },
              { icon: '💬', title: 'Propuestas',          desc: 'Envía tus propuestas directamente al comité.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sobre esta plataforma ── */}
        <section className="py-14 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Una herramienta para toda la plantilla</h2>
            <p className="text-gray-500 leading-relaxed">
              Esta plataforma ha sido desarrollada por la Sección Sindical de UGT del CLM como
              instrumento legalmente establecido de comunicación con los trabajadores y trabajadoras.
              Está diseñada para servir al conjunto de la plantilla, tanto en el actual mandato
              como en los futuros comités de empresa.
            </p>
          </div>
        </section>

        {/* ── Nuestros representantes ── */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Nuestros representantes</h2>
            <p className="text-center text-gray-400 text-sm mb-10">Sección Sindical UGT · 3 representantes en el Comité de Empresa</p>

            <div className="max-w-sm mx-auto">
              <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: '#fef2f2' }}>
                  <Image src="/logo-ugt.webp" alt="UGT" width={80} height={48} style={{ height: '2.5rem', width: 'auto' }} className="object-contain" />
                  <div className="text-right">
                    <span className="text-4xl font-bold" style={{ color: '#E2001A' }}>3</span>
                    <p className="text-xs text-gray-400 leading-none">representantes</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white divide-y divide-gray-50">
                  {UGT_MEMBERS.map(m => (
                    <div key={m.nombre} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E2001A' }} />
                        <span className="text-sm text-gray-700">{m.nombre}</span>
                      </div>
                      {m.cargo && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-2 shrink-0" style={{ backgroundColor: '#003087', color: 'white' }}>
                          {m.cargo}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contacto ── */}
        <section className="py-14 px-6 bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 text-gray-800">¿Necesitas contactar con el comité?</h3>
              <p className="text-gray-500 text-sm">
                Si tienes alguna consulta o necesitas asesoramiento, escríbenos.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

      </main>

      {/* ── Pie de página ── */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-400">
              Sección Sindical UGT · Centro de Lenguas Modernas · Universidad de Granada
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
              <Link href="/aviso-legal"  className="text-xs text-gray-300 hover:text-gray-500 transition-colors">Aviso legal</Link>
              <Link href="/privacidad"   className="text-xs text-gray-300 hover:text-gray-500 transition-colors">Privacidad</Link>
              <Link href="/cookies"      className="text-xs text-gray-300 hover:text-gray-500 transition-colors">Cookies</Link>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Desarrollo web:{' '}
              <a href="https://www.por2duros.com" target="_blank" rel="noopener noreferrer"
                className="hover:text-gray-500 transition-colors underline underline-offset-2">
                Por 2 duros
              </a>
              {' · '}v1.0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Image src="/logo-ugt.webp" alt="UGT" width={50} height={30} style={{ height: '1.5rem', width: 'auto' }} className="object-contain opacity-50 hover:opacity-100 transition-opacity" />
            <Link href="/admin/login" className="text-xs text-gray-300 hover:text-gray-500 transition-colors ml-2">
              Área del comité
            </Link>
          </div>
        </div>
      </footer>

    </div>
    <CookieBanner />
    <FooterEasterEgg />
    </>
  )
}
