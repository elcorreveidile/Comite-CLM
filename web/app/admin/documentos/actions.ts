'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function subirArchivo(file: File): Promise<string> {
  const admin = getAdmin()
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await admin.storage
    .from('documentos')
    .upload(path, buffer, { contentType: file.type })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = admin.storage.from('documentos').getPublicUrl(path)
  return publicUrl
}

async function borrarArchivo(url: string) {
  try {
    const admin = getAdmin()
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documentos/`
    if (!url.startsWith(base)) return
    const path = url.replace(base, '')
    await admin.storage.from('documentos').remove([path])
  } catch {
    // no crítico
  }
}

export async function crearDocumento(formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const categoria = (formData.get('categoria') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }

  let url: string | null = (formData.get('url') as string).trim() || null
  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    try { url = await subirArchivo(file) } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Error al subir el archivo.' }
    }
  }

  const { error } = await getAdmin().from('documentos').insert({ titulo, descripcion, url, categoria })
  if (error) return { error: error.message }
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
  return { error: null }
}

export async function actualizarDocumento(id: number, formData: FormData) {
  const titulo = (formData.get('titulo') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const categoria = (formData.get('categoria') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }

  let url: string | null = (formData.get('url') as string).trim() || null
  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    const urlAnterior = formData.get('urlAnterior') as string | null
    if (urlAnterior) await borrarArchivo(urlAnterior)
    try { url = await subirArchivo(file) } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Error al subir el archivo.' }
    }
  }

  const { error } = await getAdmin().from('documentos').update({ titulo, descripcion, url, categoria }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
  return { error: null }
}

export async function eliminarDocumento(id: number, url?: string | null) {
  if (url) await borrarArchivo(url)
  await getAdmin().from('documentos').delete().eq('id', id)
  revalidatePath('/admin/documentos')
  revalidatePath('/panel/documentos')
}
