'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPER_ADMINS } from './admins'

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Returns the authenticated user's email if they are an admin (any role),
 * or null if unauthenticated / unauthorized.
 */
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const email = user.email.toLowerCase()
  if (SUPER_ADMINS.includes(email)) return email

  const { data } = await adminDb()
    .from('miembros_comite')
    .select('id')
    .eq('email', email)
    .eq('activo', true)
    .maybeSingle()

  return data ? email : null
}
