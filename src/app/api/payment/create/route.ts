import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPackageById } from '@/lib/credit-packages'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { packageId } = await req.json()
    const pkg = getPackageById(packageId)

    if (!pkg) {
      return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 })
    }

    // Create transaction record
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

    if (txError) {
      return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 })
    }

    // Try Mercado Pago integration
    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (mpAccessToken) {
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mpAccessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': transaction.id,
          },
          body: JSON.stringify({
            transaction_amount: pkg.price,
            description: `Carcheck Pro - ${pkg.name} (${pkg.credits} créditos)`,
            payment_method_id: 'pix',
            payer: {
              email: user.email,
            },
            metadata: {
              transaction_id: transaction.id,
              user_id: user.id,
              credits: pkg.credits,
            },
          }),
        })

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()

          const pixCode = mpData.point_of_interaction?.transaction_data?.qr_code
          const pixQR = mpData.point_of_interaction?.transaction_data?.qr_code_base64

          // Update transaction with payment details
          await supabase
            .from('transactions')
            .update({
              payment_id: String(mpData.id),
              pix_code: pixCode,
              pix_qr_base64: pixQR,
            })
            .eq('id', transaction.id)

          return NextResponse.json({
            success: true,
            payment_id: transaction.id,
            pix_code: pixCode,
            pix_qr_base64: pixQR,
            expires_at: expiresAt.toISOString(),
            amount: pkg.price,
          })
        }
      } catch (mpErr) {
        console.error('Mercado Pago error:', mpErr)
      }
    }

    // Fallback: mock PIX for development
    const mockPixCode = `00020101021226930014br.gov.bcb.pix2571pix.example.com/qr/${transaction.id}5204000053039865802BR5910CarcheckPro6009SaoPaulo62${String(transaction.id.length).padStart(2, '0')}${transaction.id}6304`
    const mockPixQR = ''

    await supabase
      .from('transactions')
      .update({
        payment_id: `mock_${transaction.id}`,
        pix_code: mockPixCode,
        pix_qr_base64: mockPixQR,
      })
      .eq('id', transaction.id)

    return NextResponse.json({
      success: true,
      payment_id: transaction.id,
      pix_code: mockPixCode,
      pix_qr_base64: mockPixQR,
      expires_at: expiresAt.toISOString(),
      amount: pkg.price,
      is_mock: true,
    })
  } catch (err) {
    console.error('Payment create error:', err)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }
}
