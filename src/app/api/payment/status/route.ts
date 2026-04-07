import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('id')
    if (!paymentId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Busca transação no banco
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    // Já aprovado localmente — retorna imediatamente
    if (transaction.payment_status === 'approved') {
      return NextResponse.json({ status: 'approved', credits: transaction.credits })
    }

    // Verifica status direto no Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken || !transaction.payment_id) {
      return NextResponse.json({ status: transaction.payment_status })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    const mpData = await paymentClient.get({ id: transaction.payment_id })

    if (mpData.status === 'approved') {
      // Aprova localmente e adiciona créditos (idempotente — só faz 1x)
      await supabase
        .from('transactions')
        .update({ payment_status: 'approved' })
        .eq('id', paymentId)
        .eq('payment_status', 'pending') // evita dupla execução

      await supabase.rpc('add_credits', {
        p_user_id: user.id,
        p_amount: transaction.credits,
      })

      return NextResponse.json({ status: 'approved', credits: transaction.credits })
    }

    // Retorna status atual do MP (pending, in_process, rejected, cancelled…)
    return NextResponse.json({ status: mpData.status ?? transaction.payment_status })

  } catch (err: any) {
    console.error('Erro payment/status:', err)
    return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}
