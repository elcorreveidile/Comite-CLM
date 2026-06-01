'use server'

import { Resend } from 'resend'
import { escapeHtml } from '@/lib/html'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function enviarContacto(formData: FormData) {
  const nombre  = String(formData.get('nombre')  ?? '').trim().slice(0, 200)
  const correo  = String(formData.get('correo')   ?? '').trim().slice(0, 200)
  const asunto  = String(formData.get('asunto')   ?? '').trim().slice(0, 300)
  const mensaje = String(formData.get('mensaje')  ?? '').trim().slice(0, 5000)

  if (!nombre || !correo || !mensaje) {
    return { ok: false, error: 'Por favor completa todos los campos obligatorios.' }
  }
  if (!EMAIL_RE.test(correo)) {
    return { ok: false, error: 'El correo electrónico no es válido.' }
  }

  const eNombre  = escapeHtml(nombre)
  const eCorreo  = escapeHtml(correo)
  const eAsunto  = escapeHtml(asunto)
  const eMensaje = escapeHtml(mensaje)

  const { error } = await resend.emails.send({
    from: 'Comité CLM <no-reply@comiteclm.com>',
    to:   'ugt@fyg.ugr.es',
    replyTo: correo,
    subject: asunto || `Mensaje de ${nombre} vía comiteclm.com`,
    html: `
      <p><strong>Nombre:</strong> ${eNombre}</p>
      <p><strong>Correo:</strong> ${eCorreo}</p>
      ${eAsunto ? `<p><strong>Asunto:</strong> ${eAsunto}</p>` : ''}
      <hr/>
      <p style="white-space:pre-wrap">${eMensaje}</p>
    `,
  })

  if (error) return { ok: false, error: 'Error al enviar el mensaje. Inténtalo de nuevo.' }
  return { ok: true }
}
