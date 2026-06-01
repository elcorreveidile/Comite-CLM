'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { SUPER_ADMINS } from '@/lib/admins'
import { escapeHtml } from '@/lib/html'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getCurrentEmail(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? null
}

export async function getRole(email: string): Promise<'superadmin' | 'presidenta' | 'secretaria' | null> {
  if (SUPER_ADMINS.includes(email)) return 'superadmin'
  const { data } = await adminDb()
    .from('miembros_comite')
    .select('cargo')
    .eq('email', email)
    .eq('activo', true)
    .maybeSingle()
  if (data?.cargo === 'Presidenta') return 'presidenta'
  if (data?.cargo === 'Secretaria') return 'secretaria'
  return null
}

type DestinatarioTipo = 'todos' | 'comite' | 'especifico'

async function resolverEmails(tipo: DestinatarioTipo, emailsEspecificos?: string[]): Promise<{ emails: string[]; error?: string }> {
  if (tipo === 'todos') {
    const { data } = await adminDb().from('trabajadores').select('email')
    const emails = (data ?? []).map((t: any) => t.email).filter(Boolean) as string[]
    if (!emails.length) return { emails: [], error: 'No hay trabajadores activos registrados.' }
    return { emails }
  }

  if (tipo === 'comite') {
    const { data } = await adminDb().from('miembros_comite').select('email').eq('activo', true)
    const emails = (data ?? []).map((m: any) => m.email).filter(Boolean) as string[]
    if (!emails.length) return { emails: [], error: 'No hay miembros del comité activos registrados.' }
    return { emails }
  }

  if (tipo === 'especifico') {
    if (!emailsEspecificos?.length) return { emails: [], error: 'Debes seleccionar al menos un destinatario.' }
    return { emails: emailsEspecificos }
  }

  return { emails: [], error: 'Tipo de destinatario no válido.' }
}

async function enviarEmails(
  asunto: string,
  cuerpo: string,
  tipo: DestinatarioTipo,
  emailsEspecificos?: string[],
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { emails, error } = await resolverEmails(tipo, emailsEspecificos)
  if (error || !emails.length) return { ok: false, error: error ?? 'Sin destinatarios.' }

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#003087;color:white;padding:16px 24px;border-radius:8px 8px 0 0">
        <strong>Comité de Empresa · CLM · Universidad de Granada</strong>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;line-height:1.7">
        <div style="white-space:pre-wrap">${escapeHtml(cuerpo)}</div>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center">
        Centro de Lenguas Modernas · Universidad de Granada
      </p>
    </div>`

  // Un único destinatario: usar to: para que reciba el email a su nombre
  if (emails.length === 1) {
    const { error: resendErr } = await resend.emails.send({
      from: 'Comité CLM <no-reply@comiteclm.com>',
      to:   emails[0],
      subject: asunto,
      html: htmlBody,
    })
    if (resendErr) return { ok: false, error: 'Error al enviar el comunicado. Contacta con soporte.' }
    return { ok: true, count: 1 }
  }

  // Múltiples destinatarios: BCC en bloques de 50
  const CHUNK = 50
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    const { error: resendErr } = await resend.emails.send({
      from: 'Comité CLM <no-reply@comiteclm.com>',
      to:   'no-reply@comiteclm.com',
      bcc:  chunk,
      subject: asunto,
      html: htmlBody,
    })
    if (resendErr) return { ok: false, error: 'Error al enviar el comunicado. Contacta con soporte.' }
  }

  return { ok: true, count: emails.length }
}

// ── Envío directo (Presidenta o Super Admin) ──────────────────────────────
export async function crearYEnviar(formData: FormData) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No tienes permiso para enviar directamente.' }

  const asunto             = String(formData.get('asunto')            ?? '').trim().slice(0, 300)
  const cuerpo             = String(formData.get('cuerpo')            ?? '').trim().slice(0, 20000)
  const tipo               = String(formData.get('destinatario_tipo') ?? 'todos') as DestinatarioTipo
  const emailsEspecificos  = formData.getAll('destinatario_email').map(v => String(v).trim()).filter(Boolean)

  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  const { data: com, error: dbErr } = await adminDb()
    .from('comunicados')
    .insert({ asunto, cuerpo, creado_por: email, estado: 'pendiente_aprobacion' })
    .select('id').single()
  if (dbErr || !com) return { ok: false, error: 'Error al guardar el comunicado.' }

  const result = await enviarEmails(asunto, cuerpo, tipo, emailsEspecificos.length ? emailsEspecificos : undefined)
  if (!result.ok) return result

  await adminDb().from('comunicados').update({
    estado: 'enviado',
    aprobado_por: email,
    enviado_at: new Date().toISOString(),
    destinatarios_count: result.count,
  }).eq('id', com.id)

  revalidatePath('/admin/comunicados')
  return { ok: true, count: result.count }
}

// ── Solicitar aprobación (Secretaria) ────────────────────────────────────
export async function solicitarAprobacion(formData: FormData) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'secretaria') return { ok: false, error: 'No autorizado.' }

  const asunto = String(formData.get('asunto') ?? '').trim().slice(0, 300)
  const cuerpo = String(formData.get('cuerpo') ?? '').trim().slice(0, 20000)
  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  const { error } = await adminDb().from('comunicados').insert({
    asunto, cuerpo, creado_por: email, estado: 'pendiente_aprobacion',
  })
  if (error) return { ok: false, error: 'Error al guardar.' }

  revalidatePath('/admin/comunicados')
  return { ok: true }
}

// ── Aprobar y enviar (Presidenta o Super Admin) ───────────────────────────
export async function aprobarYEnviar(id: string) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  const { data: com } = await adminDb()
    .from('comunicados').select('asunto, cuerpo').eq('id', id).single()
  if (!com) return { ok: false, error: 'Comunicado no encontrado.' }

  const result = await enviarEmails(com.asunto, com.cuerpo, 'todos')
  if (!result.ok) return result

  await adminDb().from('comunicados').update({
    estado: 'enviado',
    aprobado_por: email,
    enviado_at: new Date().toISOString(),
    destinatarios_count: result.count,
  }).eq('id', id)

  revalidatePath('/admin/comunicados')
  return { ok: true, count: result.count }
}

// ── Eliminar (Presidenta o Super Admin) ──────────────────────────────────
export async function eliminarComunicado(id: string) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  await adminDb().from('comunicados').delete().eq('id', id)
  revalidatePath('/admin/comunicados')
  return { ok: true }
}

// ── Rechazar (Presidenta o Super Admin) ──────────────────────────────────
export async function rechazar(id: string) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  await adminDb().from('comunicados').update({ estado: 'rechazado' }).eq('id', id)
  revalidatePath('/admin/comunicados')
  return { ok: true }
}
