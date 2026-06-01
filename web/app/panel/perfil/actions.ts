'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function actualizarTelefono(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  const telefono = String(formData.get('telefono') ?? '').trim().slice(0, 20)

  const { error } = await adminDb()
    .from('trabajadores')
    .update({ telefono: telefono || null })
    .eq('email', user.email!)

  if (error) return { ok: false, error: 'Error al guardar. Inténtalo de nuevo.' }
  return { ok: true }
}
