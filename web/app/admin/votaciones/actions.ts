'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearVotacion(formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const opcionesRaw = formData.getAll('opcion') as string[]
  const opciones = opcionesRaw.map(o => o.trim()).filter(Boolean)
  if (!titulo) return { error: 'El título es obligatorio.' }
  if (opciones.length < 2) return { error: 'Añade al menos dos opciones.' }
  const { error } = await getAdmin().from('votaciones').insert({ titulo, descripcion, opciones, activa: false })
  if (error) return { error: error.message }
  revalidatePath('/admin/votaciones')
  revalidatePath('/panel/votaciones')
  return { error: null }
}

export async function toggleVotacion(id: number, activa: boolean) {
  await getAdmin().from('votaciones').update({ activa }).eq('id', id)
  revalidatePath('/admin/votaciones')
  revalidatePath('/panel/votaciones')
}

export async function eliminarVotacion(id: number) {
  await getAdmin().from('votaciones').delete().eq('id', id)
  revalidatePath('/admin/votaciones')
  revalidatePath('/panel/votaciones')
}
