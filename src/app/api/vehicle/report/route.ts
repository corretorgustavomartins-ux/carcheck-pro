import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { plate, vehicleData, score, fairPrice, riskLevel } = await req.json()

    if (!plate || !vehicleData) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Check credits
    const { data: wallet } = await supabase
      .from('credit_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet || wallet.balance < 16) {
      return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 })
    }

    // Deduct credits using the DB function
    const { data: deducted, error: deductError } = await supabase
      .rpc('deduct_credits', { p_user_id: user.id, p_amount: 16 })

    if (deductError || !deducted) {
      return NextResponse.json({ error: 'Erro ao deduzir créditos' }, { status: 500 })
    }

    // Save report
    const { data: report, error: reportError } = await supabase
      .from('vehicle_reports')
      .insert({
        user_id: user.id,
        plate: plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        score,
        fair_price: fairPrice,
        risk_level: riskLevel,
        api_payload_json: vehicleData,
        credits_consumed: 16,
      })
      .select()
      .single()

    if (reportError) {
      // Refund credits on error
      await supabase.rpc('add_credits', { p_user_id: user.id, p_amount: 16 })
      return NextResponse.json({ error: 'Erro ao salvar relatório' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      credits_remaining: wallet.balance - 16,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
