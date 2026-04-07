import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPackageById } from '@/lib/credit-packages'
import MercadoPagoConfig, { Payment } from 'mercadopago'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { packageId } = await req.json()
    const pkg = getPackageById(packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 })
    }

    // Cria registro de transação no banco
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        package: pkg.id,
        amount: pkg.price,
        credits: pkg.credits,
        payment_status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (txError || !transaction) {
      console.error('Erro ao criar transação:', txError)
      return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 })
    }

    // Cria pagamento PIX no Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Token MP não configurado' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    const mpResult = await payment.create({
      body: {
        transaction_amount: pkg.price,
        description: `Carcheck Pro — ${pkg.name} (${pkg.credits} créditos)`,
        payment_method_id: 'pix',
        payer: {
          email: user.email!,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Carcheck',
        },
        metadata: {
          transaction_id: transaction.id,
          user_id: user.id,
          credits: pkg.credits,
          package_id: pkg.id,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      },
      requestOptions: {
        idempotencyKey: transaction.id,
      },
    })

    const pixCode = mpResult.point_of_interaction?.transaction_data?.qr_code
    const pixQR   = mpResult.point_of_interaction?.transaction_data?.qr_code_base64
    const mpId    = String(mpResult.id)

    // Atualiza transação com dados do pagamento MP
    await supabase
      .from('transactions')
      .update({
        payment_id: mpId,
        pix_code: pixCode ?? null,
        pix_qr_base64: pixQR ?? null,
      })
      .eq('id', transaction.id)

    return NextResponse.json({
      success: true,
      payment_id: transaction.id,   // ID interno (usado para polling)
      mp_payment_id: mpId,           // ID do MP (para referência)
      pix_code: pixCode,
      pix_qr_base64: pixQR,
      expires_at: expiresAt.toISOString(),
      amount: pkg.price,
      package_name: pkg.name,
      credits: pkg.credits,
    })

  } catch (err: any) {
    console.error('Erro payment/create:', err)
    const msg = err?.message || 'Erro ao processar pagamento'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
