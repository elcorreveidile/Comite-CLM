'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearEvento(formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const fecha = (formData.get('fecha') as string).trim()
  const hora = (formData.get('hora') as string).trim() || null
  const lugar = (formData.get('lugar') as string).trim() || null
  const descripcion = (formData.get('descripcion') as string).trim() || null
  if (!titulo || !fecha) return { error: 'Título y fecha son obligatorios.' }
  const { error } = await getAdmin().from('eventos_calendario').insert({ titulo, fecha, hora, lugar, descripcion })
  if (error) return { error: error.message }
  revalidatePath('/admin/calendario')
  revalidatePath('/panel/calendario')
  return { error: null }
}

export async function actualizarEvento(id: number, formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const fecha = (formData.get('fecha') as string).trim()
  const hora = (formData.get('hora') as string).trim() || null
  const lugar = (formData.get('lugar') as string).trim() || null
  const descripcion = (formData.get('descripcion') as string).trim() || null
  if (!titulo || !fecha) return { error: 'Título y fecha son obligatorios.' }
  const { error } = await getAdmin().from('eventos_calendario').update({ titulo, fecha, hora, lugar, descripcion }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/calendario')
  revalidatePath('/panel/calendario')
  return { error: null }
}

export async function eliminarEvento(id: number) {
  await getAdmin().from('eventos_calendario').delete().eq('id', id)
  revalidatePath('/admin/calendario')
  revalidatePath('/panel/calendario')
}
