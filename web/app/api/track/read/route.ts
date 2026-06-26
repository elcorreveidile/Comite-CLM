import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 1x1 transparent GIF
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const comunicadoId = searchParams.get('c')
  const encodedEmail = searchParams.get('e')

  if (comunicadoId && encodedEmail) {
    try {
      const email = Buffer.from(encodedEmail, 'base64url').toString()
      await adminDb()
        .from('comunicado_lecturas')
        .upsert({ comunicado_id: comunicadoId, email }, { onConflict: 'comunicado_id,email', ignoreDuplicates: true })
    } catch {}
  }

  return new NextResponse(GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
