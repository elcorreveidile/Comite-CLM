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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function crearTrabajador(formData: FormData) {
  if (!await requireAdmin()) return { error: 'No autorizado.' }
  const nombre      = (formData.get('nombre')      as string).trim().slice(0, 200)
  const email       = (formData.get('email')       as string).trim().toLowerCase().slice(0, 200)
  const departamento= (formData.get('departamento')as string).trim().slice(0, 200) || null
  const telefono    = (formData.get('telefono')    as string).trim().slice(0, 30)  || null
  const notas       = (formData.get('notas')       as string).trim().slice(0, 1000)|| null

  if (!nombre || !email) return { error: 'Nombre y correo son obligatorios.' }
  if (!EMAIL_RE.test(email)) return { error: 'El correo electrónico no es válido.' }

  const { error } = await getAdmin()
    .from('trabajadores')
    .insert({ nombre, email, departamento, telefono, notas })

  if (error) return { error: error.code === '23505' ? 'Ese correo ya existe.' : 'Error al crear el trabajador.' }
  revalidatePath('/admin/trabajadores')
  return { error: null }
}

export async function actualizarTrabajador(id: number, formData: FormData) {
  if (!await requireAdmin()) return { error: 'No autorizado.' }
  const nombre      = (formData.get('nombre')      as string).trim().slice(0, 200)
  const email       = (formData.get('email')       as string).trim().toLowerCase().slice(0, 200)
  const departamento= (formData.get('departamento')as string).trim().slice(0, 200) || null
  const telefono    = (formData.get('telefono')    as string).trim().slice(0, 30)  || null
  const notas       = (formData.get('notas')       as string).trim().slice(0, 1000)|| null

  if (!nombre || !email) return { error: 'Nombre y correo son obligatorios.' }
  if (!EMAIL_RE.test(email)) return { error: 'El correo electrónico no es válido.' }

  const { error } = await getAdmin()
    .from('trabajadores')
    .update({ nombre, email, departamento, telefono, notas })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar el trabajador.' }
  revalidatePath('/admin/trabajadores')
  return { error: null }
}

export async function eliminarTrabajador(id: number) {
  if (!await requireAdmin()) return
  await getAdmin().from('trabajadores').delete().eq('id', id)
  revalidatePath('/admin/trabajadores')
}
