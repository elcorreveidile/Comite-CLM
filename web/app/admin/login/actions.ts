'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPER_ADMINS } from '@/lib/admins'
import { headers } from 'next/headers'

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function enviarOtpAdmin(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const hdrs = await headers()
  const origin = hdrs.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comiteclm.com'
  const normalized = email.trim().toLowerCase()

  // Validate server-side — never expose the list to the client
  if (!SUPER_ADMINS.includes(normalized)) {
    const { data } = await adminDb()
      .from('miembros_comite')
      .select('cargo')
      .eq('email', normalized)
      .eq('activo', true)
      .maybeSingle()

    if (!data) return { ok: false, error: 'Este correo no tiene acceso de administrador.' }
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
  })

  if (error) return { ok: false, error: 'Error al enviar el enlace. Inténtalo de nuevo.' }
  return { ok: true }
}
