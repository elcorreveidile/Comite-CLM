'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearTrabajador(formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const departamento = (formData.get('departamento') as string).trim() || null
  const telefono = (formData.get('telefono') as string).trim() || null
  const notas = (formData.get('notas') as string).trim() || null

  if (!nombre || !email) return { error: 'Nombre y correo son obligatorios.' }

  const { error } = await getAdmin()
    .from('trabajadores')
    .insert({ nombre, email, departamento, telefono, notas })

  if (error) return { error: error.code === '23505' ? 'Ese correo ya existe.' : error.message }
  revalidatePath('/admin/trabajadores')
  return { error: null }
}

export async function actualizarTrabajador(id: number, formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const departamento = (formData.get('departamento') as string).trim() || null
  const telefono = (formData.get('telefono') as string).trim() || null
  const notas = (formData.get('notas') as string).trim() || null

  if (!nombre || !email) return { error: 'Nombre y correo son obligatorios.' }

  const { error } = await getAdmin()
    .from('trabajadores')
    .update({ nombre, email, departamento, telefono, notas })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/trabajadores')
  return { error: null }
}

export async function eliminarTrabajador(id: number) {
  await getAdmin().from('trabajadores').delete().eq('id', id)
  revalidatePath('/admin/trabajadores')
}
