'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { SUPER_ADMINS } from '@/lib/admins'
import { revalidatePath } from 'next/cache'

async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !SUPER_ADMINS.includes(user.email ?? '')) {
    throw new Error('No autorizado')
  }
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function addMiembro(data: {
  nombre: string
  email: string
  sindicato: 'CCOO' | 'UGT'
  cargo?: string
}) {
  await checkSuperAdmin()
  const { error } = await getAdmin().from('miembros_comite').insert({
    ...data,
    cargo: data.cargo || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/miembros')
}

export async function updateMiembro(
  id: number,
  data: { nombre: string; email: string; sindicato: 'CCOO' | 'UGT'; cargo?: string }
) {
  await checkSuperAdmin()
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ ...data, cargo: data.cargo || null })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/miembros')
}

export async function deactivateMiembro(id: number) {
  await checkSuperAdmin()
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ activo: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/miembros')
}

export async function reactivateMiembro(id: number) {
  await checkSuperAdmin()
  const { error } = await getAdmin()
    .from('miembros_comite')
    .update({ activo: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/miembros')
}
