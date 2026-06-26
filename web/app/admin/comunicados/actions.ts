'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPER_ADMINS } from '@/lib/admins'
import { revalidatePath } from 'next/cache'
import { buildHtmlBody, sendBrevoBulk, type EmailAttachment } from '@/lib/brevo'

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

export type DestinatarioTipo = 'todos' | 'comite' | 'especifico' | 'departamento'
export type Adjunto = { name: string; path: string; size: number }

// ── Storage helpers ───────────────────────────────────────────────────────────

async function ensureBucket() {
  try {
    await adminDb().storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    })
  } catch {}
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

async function descargarAdjuntos(adjuntos: Adjunto[]): Promise<EmailAttachment[]> {
  if (!adjuntos.length) return []
  const db = adminDb()
  const result: EmailAttachment[] = []
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
  attachments?: EmailAttachment[],
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { emails, error } = await resolverEmails(tipo, emailsEspecificos, departamento)
  if (error || !emails.length) return { ok: false, error: error ?? 'Sin destinatarios.' }
  return sendBrevoBulk(emails, asunto, buildHtmlBody(cuerpo), attachments)
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
  const programadoAtStr   = String(formData.get('programado_at') ?? '').trim()

  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  let programadoAt: Date | null = null
  if (programadoAtStr) {
    const d = new Date(programadoAtStr)
    if (!isNaN(d.getTime()) && d > new Date()) programadoAt = d
  }

  const filesRaw = formData.getAll('adjuntos') as unknown as File[]
  const files = filesRaw.filter(f => f instanceof File && f.size > 0)

  const { data: com, error: dbErr } = await adminDb()
    .from('comunicados')
    .insert({
      asunto,
      cuerpo,
      creado_por: email,
      estado: programadoAt ? 'programado' : 'pendiente_aprobacion',
      destinatario_tipo: tipo,
      destinatario_emails: emailsEspecificos.length ? emailsEspecificos : null,
      destinatario_departamento: departamento ?? null,
      programado_at: programadoAt?.toISOString() ?? null,
    })
    .select('id').single()
  if (dbErr || !com) {
    console.error('[comunicados] DB insert error:', dbErr)
    return { ok: false, error: 'Error al guardar el comunicado.' }
  }

  let adjuntos: Adjunto[] = []
  if (files.length > 0) {
    adjuntos = await subirAdjuntos(files, com.id)
    if (adjuntos.length > 0) {
      await adminDb().from('comunicados').update({ adjuntos }).eq('id', com.id)
    }
  }

  if (programadoAt) {
    revalidatePath('/admin/comunicados')
    return { ok: true, programado: true, programadoAt: programadoAt.toISOString() }
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

// ── Editar programado (Presidenta o Super Admin) ─────────────────────────────
export async function editarProgramado(id: string, formData: FormData) {
  const email = await getCurrentEmail()
  if (!email) return { ok: false, error: 'No autenticado.' }

  const role = await getRole(email)
  if (role !== 'superadmin' && role !== 'presidenta')
    return { ok: false, error: 'No autorizado.' }

  const asunto          = String(formData.get('asunto')      ?? '').trim().slice(0, 300)
  const cuerpo          = String(formData.get('cuerpo')      ?? '').trim().slice(0, 20000)
  const programadoAtStr = String(formData.get('programado_at') ?? '').trim()

  if (!asunto || !cuerpo) return { ok: false, error: 'El asunto y el mensaje son obligatorios.' }

  let programadoAt: Date | null = null
  if (programadoAtStr) {
    const d = new Date(programadoAtStr)
    if (!isNaN(d.getTime()) && d > new Date()) programadoAt = d
  }
  if (!programadoAt) return { ok: false, error: 'La fecha de envío debe ser en el futuro.' }

  const { error: dbErr } = await adminDb()
    .from('comunicados')
    .update({ asunto, cuerpo, programado_at: programadoAt.toISOString() })
    .eq('id', id)
    .eq('estado', 'programado')

  if (dbErr) {
    console.error('[comunicados] DB update error:', dbErr)
    return { ok: false, error: 'Error al actualizar el comunicado.' }
  }

  revalidatePath('/admin/comunicados')
  return { ok: true, programadoAt: programadoAt.toISOString() }
}

// ── Cancelar programado (Presidenta o Super Admin) ────────────────────────────
export async function cancelarProgramado(id: string) {
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

// ── Eliminar historial (Presidenta o Super Admin) ─────────────────────────────
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
