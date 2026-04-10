import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/voucher/redeem  { code }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { code } = await req.json()
    if (!code || typeof code !== 'string' || code.trim().length < 3) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    // Chama a função atômica do banco (evita race conditions)
    const { data, error } = await supabase
      .rpc('redeem_voucher', {
        p_code: code.trim().toUpperCase(),
        p_user_id: user.id,
      })

    if (error) {
      return NextResponse.json({ error: 'Erro ao processar voucher' }, { status: 500 })
    }

    const result = data as { success: boolean; error?: string; credits?: number; message?: string }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      credits: result.credits,
      message: result.message,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
