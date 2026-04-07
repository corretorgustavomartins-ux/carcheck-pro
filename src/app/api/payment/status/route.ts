import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    // If already approved
    if (transaction.payment_status === 'approved') {
      return NextResponse.json({ status: 'approved', credits: transaction.credits })
    }

    // Check with Mercado Pago if we have a real payment ID
    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (mpAccessToken && transaction.payment_id && !transaction.payment_id.startsWith('mock_')) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${transaction.payment_id}`,
          {
            headers: { 'Authorization': `Bearer ${mpAccessToken}` },
          }
        )

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()

          if (mpData.status === 'approved') {
            // Approve and add credits
            await supabase
              .from('transactions')
              .update({ payment_status: 'approved' })
              .eq('id', paymentId)

            await supabase.rpc('add_credits', {
              p_user_id: user.id,
              p_amount: transaction.credits,
            })

            return NextResponse.json({ status: 'approved', credits: transaction.credits })
          }

          return NextResponse.json({ status: mpData.status })
        }
      } catch (err) {
        console.error('MP status check error:', err)
      }
    }

    // For development: auto-approve after 10 seconds (mock)
    const createdAt = new Date(transaction.created_at).getTime()
    const now = Date.now()
    if (now - createdAt > 10000 && transaction.payment_id?.startsWith('mock_')) {
      // Auto approve mock payment
      await supabase
        .from('transactions')
        .update({ payment_status: 'approved' })
        .eq('id', paymentId)

      await supabase.rpc('add_credits', {
        p_user_id: user.id,
        p_amount: transaction.credits,
      })

      return NextResponse.json({ status: 'approved', credits: transaction.credits })
    }

    return NextResponse.json({ status: transaction.payment_status })
  } catch (err) {
    console.error('Payment status error:', err)
    return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}
