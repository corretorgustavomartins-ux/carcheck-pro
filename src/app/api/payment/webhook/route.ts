import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mercado Pago webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (body.type === 'payment') {
      const paymentId = body.data?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
      if (!mpAccessToken) return NextResponse.json({ ok: true })

      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { 'Authorization': `Bearer ${mpAccessToken}` } }
      )

      if (!mpResponse.ok) return NextResponse.json({ ok: true })

      const mpData = await mpResponse.json()

      if (mpData.status === 'approved') {
        const transactionId = mpData.metadata?.transaction_id
        const userId = mpData.metadata?.user_id
        const credits = mpData.metadata?.credits

        if (transactionId && userId && credits) {
          // Update transaction
          await supabase
            .from('transactions')
            .update({ payment_status: 'approved' })
            .eq('id', transactionId)

          // Add credits
          await supabase.rpc('add_credits', {
            p_user_id: userId,
            p_amount: Number(credits),
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
