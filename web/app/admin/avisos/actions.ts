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

export async function crearAviso(formData: FormData) {
  if (!await requireAdmin()) return { error: 'No autorizado.' }
  const titulo = (formData.get('titulo') as string).trim().slice(0, 300)
  const cuerpo = (formData.get('cuerpo') as string).trim().slice(0, 10000)
  if (!titulo || !cuerpo) return { error: 'Título y cuerpo son obligatorios.' }
  const { error } = await getAdmin().from('avisos').insert({ titulo, cuerpo, publicado: false })
  if (error) return { error: 'Error al crear el aviso.' }
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
  return { error: null }
}

export async function actualizarAviso(id: number, formData: FormData) {
  if (!await requireAdmin()) return { error: 'No autorizado.' }
  const titulo = (formData.get('titulo') as string).trim().slice(0, 300)
  const cuerpo = (formData.get('cuerpo') as string).trim().slice(0, 10000)
  if (!titulo || !cuerpo) return { error: 'Título y cuerpo son obligatorios.' }
  const { error } = await getAdmin().from('avisos').update({ titulo, cuerpo }).eq('id', id)
  if (error) return { error: 'Error al actualizar el aviso.' }
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
  return { error: null }
}

export async function toggleAviso(id: number, publicado: boolean) {
  if (!await requireAdmin()) return
  await getAdmin().from('avisos').update({ publicado }).eq('id', id)
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
}

export async function eliminarAviso(id: number) {
  if (!await requireAdmin()) return
  await getAdmin().from('avisos').delete().eq('id', id)
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
}

