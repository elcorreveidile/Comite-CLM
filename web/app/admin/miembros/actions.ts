'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { SUPER_ADMINS } from '@/lib/admins'
import { revalidatePath } from 'next/cache'

async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!(user && SUPER_ADMINS.includes(user.email ?? ''))
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type ActionResult = { error: string } | undefined

export async function addMiembro(data: {
  nombre: string
  email: string
  sindicato: 'CCOO' | 'UGT'
  cargo?: string
}): Promise<ActionResult> {
  if (!await checkSuperAdmin()) return { error: 'No autorizado' }
  const { error } = await getAdmin().from('miembros_comite').insert({
    ...data,
    cargo: data.cargo || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/miembros')
}

export async function updateMiembro(
  id: number,
  data: { nombre: string; email: string; sindicato: 'CCOO' | 'UGT'; cargo?: string }
): Promise<ActionResult> {
  if (!await checkSuperAdmin()) return { error: 'No autorizado' }
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ ...data, cargo: data.cargo || null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/miembros')
}

export async function deactivateMiembro(id: number): Promise<ActionResult> {
  if (!await checkSuperAdmin()) return { error: 'No autorizado' }
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ activo: false })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/miembros')
}

export async function reactivateMiembro(id: number): Promise<ActionResult> {
  if (!await checkSuperAdmin()) return { error: 'No autorizado' }
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ activo: true })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/miembros')
}
