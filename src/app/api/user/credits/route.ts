import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: wallet } = await supabase
      .from('credit_wallets')
      .select('balance, updated_at')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      balance: wallet?.balance ?? 0,
      updated_at: wallet?.updated_at,
    })
  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
