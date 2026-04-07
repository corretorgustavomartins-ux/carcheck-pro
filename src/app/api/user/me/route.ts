import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const [profileRes, walletRes, reportsRes, transactionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('credit_wallets').select('balance').eq('user_id', user.id).single(),
      supabase.from('vehicle_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profileRes.data,
      credits: walletRes.data?.balance ?? 0,
      reports: reportsRes.data || [],
      transactions: transactionsRes.data || [],
    })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
