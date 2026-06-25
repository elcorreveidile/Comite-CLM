'use client'

import { useState, useEffect, useCallback } from 'react'

const FRASES = [
  'Hecho con café, horas sindicales y esperanza de convenio.',
  'Esta web carga más rápido que la fotocopiadora del tercer piso.',
  'Ningún trabajador fue explotado en su desarrollo. Que conste.',
  'Desarrollada en horas de liberación sindical. Literalmente.',
  'Esta web cumple el RGPD. La empresa, ya veremos.',
  'Sin complemento de productividad, pero con mucho ánimo.',
  '100 % libre de comisiones. La sindical, que conste.',
  'El comité no tiene departamento de IT, pero tiene WiFi.',
  'Datos más protegidos que el plus de antigüedad.',
  'Horas de reunión para aprobar el nombre: 0. Para hacerla: muchas.',
  'Esta web no discrimina por categoría profesional.',
  'El servidor nunca llega tarde. Al contrario que ciertas convocatorias.',
  'Hecha por un representante sindical, no por una consultora.',
  'Esta web no tiene bonus de fin de año, pero tiene cookies.',
  'Si encuentras un bug, considéralo una mejora en negociación.',
  'Esta web funciona. El ascensor del edificio A, no siempre.',
  'Desarrollada con más ilusión que presupuesto.',
  'Sin primas, sin plus de peligrosidad, sin departamento jurídico propio.',
  'Tiempo de carga inferior al de una reunión extraordinaria.',
  'El único servidor que nunca pide ampliación de plantilla.',
  'Auditada en seguridad. Pendiente de auditar el parking.',
  'Hecha en Granada. Donde el sol sale gratis y el convenio no.',
  'Esta web no tiene comisión de seguimiento. Por eso funciona.',
  'Esta web ha leído el RGPD. No como todo el mundo.',
  'Sin sindicato patronal que la pare.',
  'Fruto del derecho a la información. Artículo 64 del ET, por si acaso.',
  'El código fuente es más transparente que ciertas actas de reunión.',
  'No tiene presupuesto pero tiene alma y mucho café.',
  'Si algo falla, mandamos una queja formal.',
  'El servidor responde en milisegundos. RRHH, en semanas.',
  'Esta web no tiene jefe. Tiene representantes.',
  'Uptime: 99,9 %. Acuerdos laborales: en negociación permanente.',
  'Más horas de desarrollo que de reuniones de comité. Casi.',
  'Nadie nos pidió permiso para hacer esto.',
  'Frases generadas con ingenio propio y mucha resignación.',
  'Esta web es pública. Los datos, privados. Como tiene que ser.',
  'Desarrollada en el CLM. Que quede para la historia.',
  'Si estás leyendo esto, el comité te da las gracias.',
  'Esta frase cambia sola. Los salarios, no tanto.',
  'Bienvenido al footer más sindical de la UGR.',
  'Hecha con amor sindical y sin ayuda de la empresa.',
  'Aquí no hay letra pequeña. Solo texto pequeño.',
  'Esta web sobrevivió presiones externas. Y sigue en pie.',
  'El servidor más resiliente del CLM.',
  'Lo que empezó como una idea se convirtió en esto. Y funciona.',
  'Hecha con Next.js, Supabase y ganas de cambiar las cosas.',
  'El único sitio del CLM donde la transparencia es política de empresa.',
  'Esta web no tiene horario de verano ni de invierno.',
  'Sin comité de dirección. Con comité de empresa.',
  'Si necesitas ayuda, escríbenos. Si la empresa necesita ayuda, que llame a su abogado.',
  'Esta web tiene más uptime que la WiFi de la sala de profesores.',
  'Desarrollada en jornada laboral reducida. Qué eficiencia.',
  'Sin subvención. Sin sponsor. Con mucho convenio colectivo.',
  'Esta web no convoca asambleas. Eso lo hace el comité... cuando puede.',
  'La única reunión que no duró tres horas fue la de ponerle nombre a esto.',
  'El footer más leído del CLM. Bueno, el único.',
  'Esta página no tiene cookies de seguimiento. Sí tiene galletas en el descanso.',
  'Funcionando desde 2025. El convenio, desde antes.',
  'Esta web no cobra horas extra.',
  'Diseñada para durar más que un mandato sindical.',
  'Con más amor que presupuesto. Y con menos bugs que el sistema de matrícula.',
  'El único CMS de la historia financiado con horas de liberación.',
  'Esta web respeta tu privacidad. Y la nuestra también.',
  'Si esto fuera una empresa, tendríamos plan de igualdad. Pero es un comité, así que lo tenemos igualmente.',
]

const EASTER_EGG = '🎉 ¡Lo has encontrado! Eres la/el trabajadora/trabajador más curiosa/o del CLM. Como premio te ofrecemos lo mismo que nos ofrece la empresa en muchas ocasiones: nada, pero con todo nuestro cariño sindical. ¡Gracias por leer hasta aquí!'

const CLICKS_NEEDED = 5

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FooterEasterEgg() {
  const [mounted, setMounted] = useState(false)
  const [queue, setQueue] = useState<string[]>([])
  const [frase, setFrase] = useState('')
  const [hovered, setHovered] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [easterEgg, setEasterEgg] = useState(false)
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const q = shuffle(FRASES)
    setQueue(q)
    setFrase(q[0])
  }, [])

  const nextFrase = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setQueue(prev => {
        const next = prev.length > 1 ? prev.slice(1) : shuffle(FRASES)
        setFrase(next[0])
        return next
      })
      setFading(false)
    }, 300)
  }, [])

  useEffect(() => {
    if (!mounted || easterEgg) return
    const id = setInterval(nextFrase, 5000)
    return () => clearInterval(id)
  }, [mounted, easterEgg, nextFrase])

  const handleClick = () => {
    if (easterEgg) return
    const n = clicks + 1
    setClicks(n)
    if (n >= CLICKS_NEEDED) setEasterEgg(true)
    else nextFrase()
  }

  if (!mounted || !visible) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-[260px] select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={handleClick}
        className={`
          relative cursor-pointer rounded-xl px-4 py-3 text-xs shadow-lg border transition-all duration-300
          ${easterEgg
            ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
            : hovered
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-500'
          }
        `}
      >
        <button
          onClick={e => { e.stopPropagation(); setVisible(false) }}
          className="absolute top-1 right-1.5 text-gray-300 hover:text-gray-500 text-[10px] leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <p
          className={`leading-snug pr-3 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
          {easterEgg ? EASTER_EGG : frase}
        </p>

        {!easterEgg && hovered && clicks < CLICKS_NEEDED && (
          <p className="mt-1 text-[10px] text-blue-400 italic">
            {clicks === 0
              ? 'Psst… hay algo oculto aquí.'
              : `${CLICKS_NEEDED - clicks} clic${CLICKS_NEEDED - clicks !== 1 ? 's' : ''} más…`}
          </p>
        )}
      </div>
    </div>
  )
}
