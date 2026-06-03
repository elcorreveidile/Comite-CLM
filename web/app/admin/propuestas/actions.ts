'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/require-admin'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function marcarRevisada(id: number, revisada: boolean) {
  if (!await requireAdmin()) return
  await getAdmin().from('propuestas').update({ revisada }).eq('id', id)
  revalidatePath('/admin/propuestas')
}

export async function responderPropuesta(id: number, respuesta: string) {
  if (!await requireAdmin()) return
  await getAdmin().from('propuestas').update({ respuesta, revisada: true }).eq('id', id)
  revalidatePath('/admin/propuestas')
}

export async function eliminarPropuesta(id: number) {
  if (!await requireAdmin()) return
  await getAdmin().from('propuestas').delete().eq('id', id)
  revalidatePath('/admin/propuestas')
}
