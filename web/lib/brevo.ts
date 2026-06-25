import { escapeHtml } from './html'

const BREVO_API  = 'https://api.brevo.com/v3/smtp/email'
const FROM_NAME  = 'Comité CLM · UGT'
const FROM_EMAIL = 'no-reply@comiteclm.com'

const sender = { name: FROM_NAME, email: FROM_EMAIL }

export function buildHtmlBody(cuerpo: string): string {
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
        ¿No deseas recibir estos comunicados?
        <a href="https://comiteclm.com/panel/perfil" style="color:#d1d5db">Accede a tu perfil</a>
        para darte de baja.
      </p>
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
): Promise<{ ok: boolean; count?: number; error?: string }> {
  if (!emails.length) return { ok: false, error: 'Sin destinatarios.' }

  const brevoAttachments = attachments?.length
    ? attachments.map(a => ({ name: a.filename, content: a.content.toString('base64') }))
    : undefined

  if (emails.length === 1) {
    const body: Record<string, unknown> = {
      sender,
      to: [{ email: emails[0] }],
      subject: asunto,
      htmlContent,
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
      htmlContent,
    }
    if (brevoAttachments) body.attachment = brevoAttachments
    const { error } = await callBrevo(body)
    if (error) return { ok: false, error: `Error Brevo (lote ${Math.floor(i / CHUNK) + 1}): ${error}` }
  }

  return { ok: true, count: emails.length }
}
