import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function htmlPage(ok: boolean, email?: string) {
  const title   = ok ? 'Baja tramitada' : 'Enlace inválido'
  const message = ok
    ? `El correo <strong>${email}</strong> ha sido eliminado de nuestra lista de distribución. No recibirás más comunicados de la plataforma.<br><br>Si cambias de opinión puedes volver a suscribirte desde tu perfil.`
    : 'El enlace de baja no es válido o ha caducado. Accede a tu perfil para gestionar tus preferencias.'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · Comité CLM</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:sans-serif;background:#f9fafb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:white;border-radius:12px;padding:40px 32px;max-width:440px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .bar{height:4px;background:#003087;border-radius:2px 2px 0 0;margin:-40px -32px 32px}
    h1{font-size:1.1rem;font-weight:700;color:#111827;margin-bottom:12px}
    p{font-size:.875rem;line-height:1.6;color:#6b7280}
    a{color:#003087;text-decoration:underline}
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p style="margin-top:20px"><a href="https://ugt.comiteclm.com/panel/perfil">Gestionar preferencias</a></p>
  </div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  const encodedEmail = new URL(request.url).searchParams.get('e')

  if (!encodedEmail) {
    return new NextResponse(htmlPage(false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const email = Buffer.from(encodedEmail, 'base64url').toString()
    await adminDb()
      .from('trabajadores')
      .update({ baja_comunicados: true })
      .eq('email', email)

    return new NextResponse(htmlPage(true, email), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch {
    return new NextResponse(htmlPage(false), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}
