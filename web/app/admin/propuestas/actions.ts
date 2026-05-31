'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function marcarRevisada(id: number, revisada: boolean) {
  await getAdmin().from('propuestas').update({ revisada }).eq('id', id)
  revalidatePath('/admin/propuestas')
}

export async function responderPropuesta(id: number, respuesta: string) {
  await getAdmin().from('propuestas').update({ respuesta, revisada: true }).eq('id', id)
  revalidatePath('/admin/propuestas')
}

export async function eliminarPropuesta(id: number) {
  await getAdmin().from('propuestas').delete().eq('id', id)
  revalidatePath('/admin/propuestas')
}
