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

export async function enviarPropuesta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const titulo = (formData.get('titulo') as string).trim()
  const cuerpo = (formData.get('cuerpo') as string).trim()
  const anonima = formData.get('anonima') === 'on'

  if (!titulo || !cuerpo) return { error: 'Título y descripción son obligatorios.' }

  const admin = getAdmin()
  const { data: trabajador } = await admin
    .from('trabajadores')
    .select('id')
    .eq('email', user.email!)
    .single()

  const { error } = await admin.from('propuestas').insert({
    titulo,
    cuerpo,
    anonima,
    trabajador_id: trabajador?.id ?? null,
    revisada: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/panel/propuestas')
  return { error: null }
}
