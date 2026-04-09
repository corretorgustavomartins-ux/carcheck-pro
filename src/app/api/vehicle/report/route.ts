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

    const { plate, vehicleData, score, fairPrice, riskLevel, tipo, creditsConsumed } = await req.json()

    if (!plate || !vehicleData) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Créditos a descontar: 26 para SMART, 49 para COMPLETO/PREMIUM
    const credits = typeof creditsConsumed === 'number' && creditsConsumed > 0
      ? creditsConsumed
      : (tipo === 'completo' || tipo === 'premium' ? 49 : 26)

    // Check credits
    const { data: wallet } = await supabase
      .from('credit_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet || wallet.balance < credits) {
      return NextResponse.json(
        { error: `Créditos insuficientes. Necessário: ${credits}. Disponível: ${wallet?.balance ?? 0}` },
        { status: 402 }
      )
    }

    // Deduct credits using the DB function
    const { data: deducted, error: deductError } = await supabase
      .rpc('deduct_credits', { p_user_id: user.id, p_amount: credits })

    if (deductError || !deducted) {
      return NextResponse.json({ error: 'Erro ao deduzir créditos' }, { status: 500 })
    }

    // Save report (inclui tipo da consulta)
    const { data: report, error: reportError } = await supabase
      .from('vehicle_reports')
      .insert({
        user_id: user.id,
        plate: plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        score,
        fair_price: fairPrice,
        risk_level: riskLevel,
        api_payload_json: vehicleData,
        credits_consumed: credits,
        report_type: tipo ?? 'smart',  // novo campo: 'smart' | 'premium'
      })
      .select()
      .single()

    if (reportError) {
      // Refund credits on error
      await supabase.rpc('add_credits', { p_user_id: user.id, p_amount: credits })
      return NextResponse.json({ error: 'Erro ao salvar relatório' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      credits_remaining: wallet.balance - credits,
      report_type: tipo ?? 'smart',
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
