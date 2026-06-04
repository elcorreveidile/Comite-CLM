import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { SUPER_ADMINS } from '@/lib/admins'
import MiembrosManager from './MiembrosManager'

export default async function MiembrosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !SUPER_ADMINS.includes(user.email ?? '')) {
    redirect('/admin')
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: miembros } = await admin
    .from('miembros_comite')
    .select('*')
    .order('sindicato')
    .order('nombre')

  const filtered = (miembros ?? []).filter((m: any) => !SUPER_ADMINS.includes(m.email))

  return <MiembrosManager miembros={filtered} />
}
