import { escapeHtml } from './html'

const BREVO_API  = 'https://api.brevo.com/v3/smtp/email'
const FROM_NAME  = 'Comité CLM · UGT'
const FROM_EMAIL = 'no-reply@comiteclm.com'
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || 'https://ugt.comiteclm.com'

const sender = { name: FROM_NAME, email: FROM_EMAIL }

const PROFILE_URL = 'https://ugt.comiteclm.com/panel/perfil'

export function buildHtmlBody(cuerpo: string, trackingUrl?: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#003087;color:white;padding:16px 24px;border-radius:8px 8px 0 0">
        <strong>Comité CLM · Sección Sindical UGT · Universidad de Granada</strong>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;line-height:1.7">
        <div style="white-space:pre-wrap">${escapeHtml(cuerpo)}</div>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center">
        Sección Sindical UGT · Centro de Lenguas Modernas · Universidad de Granada
      </p>
      <p style="color:#d1d5db;font-size:11px;margin-top:4px;text-align:center">
        <a href="%%UNSUB%%" style="color:#d1d5db">Cancelar suscripción</a>
        &nbsp;·&nbsp;
        <a href="${PROFILE_URL}" style="color:#d1d5db">Gestionar preferencias</a>
      </p>
      ${trackingUrl ? `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" />` : ''}
    </div>`
}

async function callBrevo(body: object): Promise<{ error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { error: 'BREVO_API_KEY no configurada.' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: (err as any).message ?? res.statusText }
    }
    return {}
  } catch (e: any) {
    clearTimeout(timer)
    return { error: e.name === 'AbortError' ? 'Timeout al contactar con Brevo.' : e.message }
  }
}

export type EmailAttachment = { filename: string; content: Buffer }

export async function sendBrevoBulk(
  emails: string[],
  asunto: string,
  htmlContent: string,
  attachments?: EmailAttachment[],
  comunicadoId?: string,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  if (!emails.length) return { ok: false, error: 'Sin destinatarios.' }

  const brevoAttachments = attachments?.length
    ? attachments.map(a => ({ name: a.filename, content: a.content.toString('base64') }))
    : undefined

  // Si hay comunicadoId, enviamos individualmente para poder rastrear lecturas
  if (comunicadoId) {
    const CONCURRENCY = 10
    let sent = 0
    let lastError: string | undefined

    for (let i = 0; i < emails.length; i += CONCURRENCY) {
      const batch = emails.slice(i, i + CONCURRENCY)
      const results = await Promise.allSettled(
        batch.map(async (email) => {
          const encoded = Buffer.from(email).toString('base64url')
          const trackingUrl = `${SITE_URL}/api/track/read?c=${comunicadoId}&e=${encoded}`
          const unsubUrl   = `${SITE_URL}/api/unsub?e=${encoded}`
          const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" />`
          const lastDiv = htmlContent.lastIndexOf('</div>')
          const htmlWithPixel = lastDiv >= 0
            ? htmlContent.slice(0, lastDiv) + pixel + htmlContent.slice(lastDiv)
            : htmlContent + pixel
          const htmlFinal = htmlWithPixel.replace('%%UNSUB%%', unsubUrl)
          const body: Record<string, unknown> = {
            sender,
            to: [{ email }],
            subject: asunto,
            htmlContent: htmlFinal,
          }
          if (brevoAttachments) body.attachment = brevoAttachments
          return callBrevo(body)
        })
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && !r.value.error) {
          sent++
        } else {
          lastError = r.status === 'rejected' ? r.reason?.message : (r.value as any).error
        }
      }
    }

    if (sent === 0) return { ok: false, error: lastError || 'No se pudo enviar ningún email.' }
    return { ok: true, count: sent }
  }

  // Sin comunicadoId: BCC por lotes — reemplaza placeholder con URL de perfil genérica
  const htmlBcc = htmlContent.replace('%%UNSUB%%', PROFILE_URL)

  if (emails.length === 1) {
    const body: Record<string, unknown> = {
      sender,
      to: [{ email: emails[0] }],
      subject: asunto,
      htmlContent: htmlBcc,
    }
    if (brevoAttachments) body.attachment = brevoAttachments
    const { error } = await callBrevo(body)
    if (error) return { ok: false, error: `Error Brevo: ${error}` }
    return { ok: true, count: 1 }
  }

  const CHUNK = 98
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    const body: Record<string, unknown> = {
      sender,
      to: [{ email: FROM_EMAIL }],
      bcc: chunk.map(email => ({ email })),
      subject: asunto,
      htmlContent: htmlBcc,
    }
    if (brevoAttachments) body.attachment = brevoAttachments
    const { error } = await callBrevo(body)
    if (error) return { ok: false, error: `Error Brevo (lote ${Math.floor(i / CHUNK) + 1}): ${error}` }
  }

  return { ok: true, count: emails.length }
}
