'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function votar(votacionId: number, opcion: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const admin = getAdmin()

  // Comprobar si ya votó
  const { data: votoExistente } = await admin
    .from('votos')
    .select('id')
    .eq('votacion_id', votacionId)
    .eq('trabajador_email', user.email!)
    .single()

  if (votoExistente) return { error: 'Ya has votado en esta consulta.' }

  const { error } = await admin.from('votos').insert({
    votacion_id: votacionId,
    opcion,
    trabajador_email: user.email!,
  })

  if (error) return { error: 'Error al registrar el voto.' }
  revalidatePath('/panel/votaciones')
  return { error: null }
}
