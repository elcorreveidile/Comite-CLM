import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildHtmlBody, sendBrevoBulk, type EmailAttachment } from '@/lib/brevo'

export const maxDuration = 60

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type DestinatarioTipo = 'todos' | 'comite' | 'especifico' | 'departamento'

async function resolverEmails(
  tipo: DestinatarioTipo,
  emailsEspecificos?: string[] | null,
  departamento?: string | null,
): Promise<string[]> {
  const db = adminDb()
  if (tipo === 'todos') {
    const { data } = await db.from('trabajadores').select('email').eq('baja_comunicados', false)
    return (data ?? []).map((t: any) => t.email).filter(Boolean)
  }
  if (tipo === 'comite') {
    const { data } = await db.from('miembros_comite').select('email').eq('activo', true)
    return (data ?? []).map((m: any) => m.email).filter(Boolean)
  }
  if (tipo === 'departamento' && departamento) {
    const { data } = await db.from('trabajadores').select('email').eq('departamento', departamento).eq('baja_comunicados', false)
    return (data ?? []).map((t: any) => t.email).filter(Boolean)
  }
  if (tipo === 'especifico' && emailsEspecificos?.length) {
    return emailsEspecificos
  }
  return []
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  const { data: pendientes, error } = await adminDb()
    .from('comunicados')
    .select('id, asunto, cuerpo, adjuntos, destinatario_tipo, destinatario_emails, destinatario_departamento')
    .eq('estado', 'programado')
    .lte('programado_at', now)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!pendientes?.length) return NextResponse.json({ ok: true, sent: 0 })

  const results = []
  const db = adminDb()

  for (const com of pendientes) {
    try {
      const tipo = (com.destinatario_tipo ?? 'todos') as DestinatarioTipo
      const emails = await resolverEmails(tipo, com.destinatario_emails, com.destinatario_departamento)

      if (!emails.length) {
        await db.from('comunicados').update({ estado: 'rechazado' }).eq('id', com.id)
        results.push({ id: com.id, ok: false, error: 'Sin destinatarios' })
        continue
      }

      const adjuntos = (com.adjuntos ?? []) as Array<{ name: string; path: string }>
      const attachments: EmailAttachment[] = []
      for (const adj of adjuntos) {
        const { data, error: dlErr } = await db.storage.from('comunicados-adjuntos').download(adj.path)
        if (!dlErr && data) {
          attachments.push({ filename: adj.name, content: Buffer.from(await data.arrayBuffer()) })
        }
      }

      const result = await sendBrevoBulk(emails, com.asunto, buildHtmlBody(com.cuerpo), attachments.length ? attachments : undefined, com.id)

      if (result.ok) {
        await db.from('comunicados').update({
          estado: 'enviado',
          enviado_at: new Date().toISOString(),
          destinatarios_count: result.count,
        }).eq('id', com.id)
        results.push({ id: com.id, ok: true, count: result.count })
      } else {
        results.push({ id: com.id, ok: false, error: result.error })
      }
    } catch (e: any) {
      results.push({ id: com.id, ok: false, error: e.message })
    }
  }

  return NextResponse.json({ ok: true, sent: results.filter(r => r.ok).length, results })
}
