'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { SUPER_ADMINS } from '@/lib/admins'
import { escapeHtml } from '@/lib/html'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)
const BUCKET = 'comunicados-adjuntos'

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

type DestinatarioTipo = 'todos' | 'comite' | 'especifico' | 'departamento'
export type Adjunto = { name: string; path: string; size: number }

// ── Storage helpers ───────────────────────────────────────────────────────────

async function ensureBucket() {
  try {
    await adminDb().storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB por archivo
    })
  } catch {
    // Ya existe, ignorar
  }
}

async function subirAdjuntos(files: File[], comunicadoId: string): Promise<Adjunto[]> {
  if (!files.length) return []
  await ensureBucket()
  const db = adminDb()
  const adjuntos: Adjunto[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-áéíóúüñÁÉÍÓÚÜÑ ]/g, '_')
    const path = `${comunicadoId}/${i}_${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await db.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: true })
    if (!error) adjuntos.push({ name: file.name, path, size: file.size })
  }
  return adjuntos
}

async function descargarAdjuntos(adjuntos: Adjunto[]): Promise<Array<{ filename: string; content: Buffer }>> {
  if (!adjuntos.length) return []
  const db = adminDb()
  const result = []
  for (const adj of adjuntos) {
    const { data, error } = await db.storage.from(BUCKET).download(adj.path)
    if (!error && data) {
      result.push({ filename: adj.name, content: Buffer.from(await data.arrayBuffer()) })
    }
  }
  return result
}

async function limpiarAdjuntos(adjuntos: Adjunto[]) {
  if (!adjuntos.length) return
  await adminDb().storage.from(BUCKET).remove(adjuntos.map(a => a.path))
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function resolverEmails(
  tipo: DestinatarioTipo,
  emailsEspecificos?: string[],
  departamento?: string,
): Promise<{ emails: string[]; error?: string }> {
  if (tipo === 'todos') {
    const { data } = await adminDb().from('trabajadores').select('email').eq('baja_comunicados', false)
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

  if (tipo === 'departamento') {
    if (!departamento) return { emails: [], error: 'Debes seleccionar un departamento.' }
    const { data } = await adminDb().from('trabajadores').select('email').eq('departamento', departamento).eq('baja_comunicados', false)
    const emails = (data ?? []).map((t: any) => t.email).filter(Boolean) as string[]
    if (!emails.length) return { emails: [], error: `No hay trabajadores en el departamento "${departamento}".` }
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
  departamento?: string,
  attachments?: Array<{ filename: string; content: Buffer }>,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { emails, error } = await resolverEmails(tipo, emailsEspecificos, departamento)
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
      <p style="color:#d1d5db;font-size:11px;margin-top:4px;text-align:center">
        ¿No deseas recibir estos comunicados? <a href="https://comiteclm.com/panel/perfil" style="color:#d1d5db">Accede a tu perfil</a> para darte de baja.
      </p>
    </div>`

  const extraOpts = attachments?.length ? { attachments } : {}

  if (emails.length === 1) {
    const { error: resendErr } = await resend.emails.send({
      from: 'Comité CLM <no-reply@comiteclm.com>',
      to:   emails[0],
      subject: asunto,
      html: htmlBody,
      ...extraOpts,
    })
    if (resendErr) return { ok: false, error: 'Error al enviar el comunicado. Contacta con soporte.' }
    return { ok: true, count: 1 }
  }

  const CHUNK = 50
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    const { error: resendErr } = await resend.emails.send({
      from: 'Comité CLM <no-reply@comiteclm.com>',
      to:   'no-reply@comiteclm.com',
      bcc:  chunk,
      subject: asunto,
      html: htmlBody,
      ...extraOpts,
    })
    if (resendErr) return { ok: false, error: 'Error al enviar el comunicado. Contacta con soporte.' }
  }

  return { ok: true, count: emails.length }
}

// ── Envío directo (Presidenta o Super Admin) ──────────────────────────────────
export async function crearYEnviar(formData: FormData) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No tienes permiso para enviar directamente.' }

  const asunto            = String(formData.get('asunto')            ?? '').trim().slice(0, 300)
  const cuerpo            = String(formData.get('cuerpo')            ?? '').trim().slice(0, 20000)
  const tipo              = String(formData.get('destinatario_tipo') ?? 'todos') as DestinatarioTipo
  const emailsEspecificos = formData.getAll('destinatario_email').map(v => String(v).trim()).filter(Boolean)
  const departamento      = String(formData.get('destinatario_departamento') ?? '').trim() || undefined

  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  const filesRaw = formData.getAll('adjuntos') as unknown as File[]
  const files = filesRaw.filter(f => f instanceof File && f.size > 0)

  const { data: com, error: dbErr } = await adminDb()
    .from('comunicados')
    .insert({ asunto, cuerpo, creado_por: email, estado: 'pendiente_aprobacion' })
    .select('id').single()
  if (dbErr || !com) return { ok: false, error: 'Error al guardar el comunicado.' }

  let adjuntos: Adjunto[] = []
  if (files.length > 0) {
    adjuntos = await subirAdjuntos(files, com.id)
    if (adjuntos.length > 0) {
      await adminDb().from('comunicados').update({ adjuntos }).eq('id', com.id)
    }
  }

  const emailAttachments = adjuntos.length > 0 ? await descargarAdjuntos(adjuntos) : undefined
  const result = await enviarEmails(asunto, cuerpo, tipo, emailsEspecificos.length ? emailsEspecificos : undefined, departamento, emailAttachments)
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

// ── Solicitar aprobación (Secretaria) ────────────────────────────────────────
export async function solicitarAprobacion(formData: FormData) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'secretaria') return { ok: false, error: 'No autorizado.' }

  const asunto = String(formData.get('asunto') ?? '').trim().slice(0, 300)
  const cuerpo = String(formData.get('cuerpo') ?? '').trim().slice(0, 20000)
  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  const filesRaw = formData.getAll('adjuntos') as unknown as File[]
  const files = filesRaw.filter(f => f instanceof File && f.size > 0)

  const { data: com, error } = await adminDb().from('comunicados').insert({
    asunto, cuerpo, creado_por: email, estado: 'pendiente_aprobacion',
  }).select('id').single()
  if (error || !com) return { ok: false, error: 'Error al guardar.' }

  if (files.length > 0) {
    const adjuntos = await subirAdjuntos(files, com.id)
    if (adjuntos.length > 0) {
      await adminDb().from('comunicados').update({ adjuntos }).eq('id', com.id)
    }
  }

  revalidatePath('/admin/comunicados')
  return { ok: true }
}

// ── Aprobar y enviar (Presidenta o Super Admin) ───────────────────────────────
export async function aprobarYEnviar(id: string) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  const { data: com } = await adminDb()
    .from('comunicados').select('asunto, cuerpo, adjuntos').eq('id', id).single()
  if (!com) return { ok: false, error: 'Comunicado no encontrado.' }

  const adjuntos = (com.adjuntos ?? []) as Adjunto[]
  const emailAttachments = adjuntos.length > 0 ? await descargarAdjuntos(adjuntos) : undefined

  const result = await enviarEmails(com.asunto, com.cuerpo, 'todos', undefined, undefined, emailAttachments)
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

// ── Eliminar (Presidenta o Super Admin) ───────────────────────────────────────
export async function eliminarComunicado(id: string) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  const { data: com } = await adminDb().from('comunicados').select('adjuntos').eq('id', id).maybeSingle()
  if (com?.adjuntos?.length) await limpiarAdjuntos(com.adjuntos as Adjunto[])

  await adminDb().from('comunicados').delete().eq('id', id)
  revalidatePath('/admin/comunicados')
  return { ok: true }
}

// ── Rechazar (Presidenta o Super Admin) ───────────────────────────────────────
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
