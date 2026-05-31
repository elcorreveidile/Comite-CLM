'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearDocumento(formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const url = (formData.get('url') as string).trim() || null
  const categoria = (formData.get('categoria') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }
  const { error } = await getAdmin().from('documentos').insert({ titulo, descripcion, url, categoria })
  if (error) return { error: error.message }
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
  return { error: null }
}

export async function actualizarDocumento(id: number, formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const url = (formData.get('url') as string).trim() || null
  const categoria = (formData.get('categoria') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }
  const { error } = await getAdmin().from('documentos').update({ titulo, descripcion, url, categoria }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
  return { error: null }
}

export async function eliminarDocumento(id: number) {
  await getAdmin().from('documentos').delete().eq('id', id)
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
}
