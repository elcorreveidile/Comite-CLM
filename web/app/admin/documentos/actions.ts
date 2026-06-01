'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'ods', 'ppt', 'pptx', 'txt']
const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

async function subirArchivo(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Tipo de archivo no permitido. Formatos aceptados: ${ALLOWED_EXTENSIONS.join(', ')}`)
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    throw new Error('El tipo MIME del archivo no está permitido.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo supera el tamaño máximo permitido (20 MB).')
  }

  const admin = getAdmin()
  const safeExt = ext.replace(/[^a-z0-9]/g, '')
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await admin.storage
    .from('documentos')
    .upload(path, buffer, { contentType: file.type })
  if (error) throw new Error('Error al subir el archivo al almacenamiento.')
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
  const titulo = ((formData.get('titulo') ?? '') as string).trim()
  const descripcion = ((formData.get('descripcion') ?? '') as string).trim() || null
  const categoria = ((formData.get('categoria') ?? '') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }

  let url: string | null = ((formData.get('url') ?? '') as string).trim() || null
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
  const titulo = ((formData.get('titulo') ?? '') as string).trim()
  const descripcion = ((formData.get('descripcion') ?? '') as string).trim() || null
  const categoria = ((formData.get('categoria') ?? '') as string).trim() || null
  if (!titulo) return { error: 'El título es obligatorio.' }

  let url: string | null = ((formData.get('url') ?? '') as string).trim() || null
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
