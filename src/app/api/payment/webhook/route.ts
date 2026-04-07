import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'

// O Mercado Pago envia notificações POST aqui quando o status muda
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Webhook MP]', JSON.stringify(body))

    // Só processa eventos de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const mpPaymentId = body.data?.id
    if (!mpPaymentId) {
      return NextResponse.json({ ok: true })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ ok: true })
    }

    // Consulta o pagamento no MP para confirmar status
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)
    const mpData = await paymentClient.get({ id: String(mpPaymentId) })

    if (mpData.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    // Extrai metadados que foram enviados na criação do pagamento
    const transactionId = mpData.metadata?.transaction_id
    const userId        = mpData.metadata?.user_id
    const credits       = mpData.metadata?.credits

    if (!transactionId || !userId || !credits) {
      console.error('[Webhook MP] Metadados ausentes:', mpData.metadata)
      return NextResponse.json({ ok: true })
    }

    const supabase = await createClient()

    // Atualiza transação (só se ainda pendente — evita duplicidade)
    const { data: updated } = await supabase
      .from('transactions')
      .update({ payment_status: 'approved' })
      .eq('id', transactionId)
      .eq('payment_status', 'pending')
      .select()
      .single()

    // Adiciona créditos apenas se a transação foi de fato atualizada agora
    if (updated) {
      await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: Number(credits),
      })
      console.log(`[Webhook MP] ✅ ${credits} créditos adicionados ao user ${userId}`)
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    // Sempre retorna 200 pro MP — caso contrário ele fica reenviando
    console.error('[Webhook MP] Erro:', err?.message)
    return NextResponse.json({ ok: true })
  }
}

// O MP também faz GET para verificar o endpoint
export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' })
}
