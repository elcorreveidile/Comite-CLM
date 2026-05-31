'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearAviso(formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const cuerpo = (formData.get('cuerpo') as string).trim()
  if (!titulo || !cuerpo) return { error: 'Título y cuerpo son obligatorios.' }
  const { error } = await getAdmin().from('avisos').insert({ titulo, cuerpo, publicado: false })
  if (error) return { error: error.message }
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
  return { error: null }
}

export async function actualizarAviso(id: number, formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const cuerpo = (formData.get('cuerpo') as string).trim()
  if (!titulo || !cuerpo) return { error: 'Título y cuerpo son obligatorios.' }
  const { error } = await getAdmin().from('avisos').update({ titulo, cuerpo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
  return { error: null }
}

export async function toggleAviso(id: number, publicado: boolean) {
  await getAdmin().from('avisos').update({ publicado }).eq('id', id)
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
}

export async function eliminarAviso(id: number) {
  await getAdmin().from('avisos').delete().eq('id', id)
  revalidatePath('/admin/avisos')
  revalidatePath('/panel/avisos')
}
