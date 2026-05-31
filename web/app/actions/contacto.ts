'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarContacto(formData: FormData) {
  const nombre  = String(formData.get('nombre')  ?? '').trim()
  const correo  = String(formData.get('correo')   ?? '').trim()
  const asunto  = String(formData.get('asunto')   ?? '').trim()
  const mensaje = String(formData.get('mensaje')  ?? '').trim()

  if (!nombre || !correo || !mensaje) {
    return { ok: false, error: 'Por favor completa todos los campos obligatorios.' }
  }

  const { error } = await resend.emails.send({
    from: 'Comité CLM <no-reply@comiteclm.com>',
    to:   'ugt@fyg.ugr.es',
    replyTo: correo,
    subject: asunto || `Mensaje de ${nombre} vía comiteclm.com`,
    html: `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      ${asunto ? `<p><strong>Asunto:</strong> ${asunto}</p>` : ''}
      <hr/>
      <p style="white-space:pre-wrap">${mensaje}</p>
    `,
  })

  if (error) return { ok: false, error: 'Error al enviar el mensaje. Inténtalo de nuevo.' }
  return { ok: true }
}
