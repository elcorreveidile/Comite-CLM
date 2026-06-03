import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/panel/login')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: trabajador } = await admin
    .from('trabajadores')
    .select('nombre, telefono, baja_comunicados')
    .eq('email', user.email!)
    .single()

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mi perfil</h1>
        <p className="text-gray-400 text-sm mt-1">Tus datos de contacto en el comité.</p>
      </div>
      <PerfilForm
        nombre={trabajador?.nombre ?? ''}
        email={user.email!}
        telefono={trabajador?.telefono ?? ''}
        bajaComunicados={trabajador?.baja_comunicados ?? false}
      />
    </div>
  )
}
