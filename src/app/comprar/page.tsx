'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CREDIT_PACKAGES } from '@/lib/credit-packages'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function ComprarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselected = searchParams.get('pacote') || 'recommended'

  const [selected, setSelected] = useState(preselected)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'pix' | 'success'>('select')
  const [pixData, setPixData] = useState<any>(null)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const selectedPackage = CREDIT_PACKAGES.find(p => p.id === selected)!

  const handleBuy = async () => {
    if (!user) {
      router.push('/login?next=/comprar')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selected }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao criar pagamento')

      setPixData(data)
      setPaymentStep('pix')
      startPolling(data.payment_id)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (paymentId: string) => {
    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?id=${paymentId}`)
        const data = await res.json()

        if (data.status === 'approved') {
          clearInterval(interval)
          setPolling(false)
          setPaymentStep('success')
          toast.success('🎉 Pagamento aprovado! Créditos adicionados.')
        }
      } catch {}
    }, 3000)

    // Stop after 10 minutes
    setTimeout(() => {
      clearInterval(interval)
      setPolling(false)
    }, 600000)
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixData?.pix_code || '')
    toast.success('Código PIX copiado!')
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center py-10" shadow="lg">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Pagamento aprovado!</h2>
          <p className="text-slate-500 mb-6">
            {selectedPackage.credits} créditos foram adicionados à sua conta.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
            <p className="text-emerald-700 font-semibold">✅ {selectedPackage.credits} créditos</p>
            <p className="text-emerald-600 text-sm">{selectedPackage.queries} consulta{selectedPackage.queries > 1 ? 's' : ''} SMART disponível{selectedPackage.queries > 1 ? 'is' : ''}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/dashboard')} fullWidth>
              Ir ao Dashboard
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" fullWidth>
              Consultar placa
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (paymentStep === 'pix' && pixData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full" shadow="lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
              <span className="text-3xl">💚</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Pague via PIX</h2>
            <p className="text-slate-500 text-sm mt-1">
              {selectedPackage.price_formatted} • {selectedPackage.credits} créditos
            </p>
          </div>

          {/* QR Code */}
          {pixData.pix_qr_base64 && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner">
                <img
                  src={`data:image/png;base64,${pixData.pix_qr_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          {/* PIX Code */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
              Código PIX (Copia e Cola)
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <p className="text-xs text-slate-600 font-mono flex-1 truncate">
                {pixData.pix_code}
              </p>
              <button onClick={copyPix} className="text-blue-600 text-xs font-semibold flex-shrink-0 hover:text-blue-700">
                Copiar
              </button>
            </div>
          </div>

          {/* Status */}
          <div className={cn(
            'rounded-xl p-3 text-center text-sm mb-4',
            polling ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-slate-50 text-slate-600'
          )}>
            {polling ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Aguardando pagamento...
              </span>
            ) : (
              'Código PIX gerado'
            )}
          </div>

          <Button onClick={copyPix} fullWidth size="lg">
            📋 Copiar código PIX
          </Button>

          <p className="text-xs text-center text-slate-400 mt-3">
            ⏱ Expira em 30 minutos • 🔄 Créditos liberados automaticamente
          </p>

          <button
            onClick={() => setPaymentStep('select')}
            className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Voltar e escolher outro pacote
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Comprar créditos</h1>
          <p className="text-slate-500 mt-2">Escolha o pacote ideal para você</p>
          {!user && (
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm mt-4">
              🎁 Crie sua conta e ganhe 5 créditos grátis!
            </div>
          )}
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selected === pkg.id
            const colorBorder = {
              starter: 'border-emerald-200 hover:border-emerald-400',
              recommended: 'border-blue-300 hover:border-blue-500',
              smart: 'border-purple-200 hover:border-purple-400',
            }[pkg.id]

            const selectedBorder = {
              starter: 'border-emerald-500 ring-2 ring-emerald-200',
              recommended: 'border-blue-600 ring-2 ring-blue-200',
              smart: 'border-purple-500 ring-2 ring-purple-200',
            }[pkg.id]

            return (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className={cn(
                  'relative text-left bg-white rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg',
                  isSelected ? selectedBorder : colorBorder
                )}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {pkg.badge}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="font-bold text-slate-700 mb-1">{pkg.name}</div>
                <div className="text-3xl font-black text-slate-900 mb-1">{pkg.price_formatted}</div>
                <div className="text-blue-600 font-semibold text-sm mb-4">
                  {pkg.credits} créditos • {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''}
                </div>

                <ul className="space-y-1.5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Summary + CTA */}
        <Card shadow="lg" className="max-w-md mx-auto">
          <h3 className="font-bold text-slate-800 mb-4">Resumo do pedido</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{selectedPackage.name}</span>
              <span className="font-semibold">{selectedPackage.credits} créditos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Consultas incluídas</span>
              <span className="font-semibold">{selectedPackage.queries}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span className="text-blue-600 text-lg">{selectedPackage.price_formatted}</span>
            </div>
          </div>
          <Button
            onClick={handleBuy}
            loading={loading}
            fullWidth
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            💚 Pagar via PIX
          </Button>
          <p className="text-xs text-center text-slate-400 mt-3">
            🔒 Pagamento seguro • ⚡ Créditos em segundos
          </p>
        </Card>
      </div>
    </div>
  )
}

export default function ComprarPage() {
  return (
    <Suspense>
      <ComprarContent />
    </Suspense>
  )
}
