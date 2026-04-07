'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VehicleService } from '@/lib/vehicle-service'
import { calculateScore } from '@/lib/score-engine'
import { calculateFairPrice, formatCurrency } from '@/lib/pricing-engine'
import { VehicleData, ScoreResult, PricingResult } from '@/types'
import { ScoreMeter } from '@/components/ui/ScoreMeter'
import { Card, AlertCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatPlate, cn } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Configuração por tipo de consulta
const CONSULTA_CONFIG = {
  smart: {
    label: 'SMART',
    credits: 16,
    color: 'blue',
    icon: '🔍',
    items: [
      '✅ Dados completos do veículo',
      '🏆 Score Anti-Bomba (0–100)',
      '🚨 Verificação de sinistro',
      '🔒 Verificação de gravame',
      '💰 Preço Justo IA',
      '📄 PDF do relatório',
    ],
  },
  premium: {
    label: 'PREMIUM',
    credits: 35,
    color: 'purple',
    icon: '💎',
    items: [
      '✅ Tudo do plano SMART',
      '🏷️ Histórico completo de leilão',
      '🔔 Recall do fabricante',
      '📷 Fotos oficiais do veículo',
      '📋 Ficha técnica completa',
      '🚓 Roubo/furto detalhado',
      '📌 Débitos IPVA e multas',
    ],
  },
} as const

type TipoConsulta = keyof typeof CONSULTA_CONFIG

function ConsultaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plate = searchParams.get('placa') || ''
  const tipoParam = (searchParams.get('tipo') || 'smart') as TipoConsulta
  const tipo: TipoConsulta = tipoParam === 'premium' ? 'premium' : 'smart'
  const config = CONSULTA_CONFIG[tipo]

  const [step, setStep] = useState<'loading' | 'confirm' | 'processing' | 'report' | 'error'>('loading')
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [pricing, setPricing] = useState<PricingResult | null>(null)
  const [reportId, setReportId] = useState<string>('')
  const [error, setError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?next=/consulta?placa=' + plate + '&tipo=' + tipo)
        return
      }
      setUser(user)

      const { data: wallet } = await supabase
        .from('credit_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      const balance = wallet?.balance ?? 0
      setCredits(balance)

      if (balance < config.credits) {
        setError(`Créditos insuficientes. Você precisa de ${config.credits} créditos para consulta ${config.label}.`)
        setStep('error')
      } else {
        setStep('confirm')
      }
    }

    if (!plate) {
      router.push('/')
      return
    }

    init()
  }, [plate, tipo])

  const handleConfirm = async () => {
    setStep('processing')
    const supabase = createClient()

    try {
      // 1. Buscar dados do veículo (passando o tipo)
      const vehicleData = await VehicleService.getFullReport(plate, tipo)
      if (!vehicleData) throw new Error('Veículo não encontrado')
      setVehicle(vehicleData)

      // 2. Calcular score
      const scoreResult = calculateScore(vehicleData)
      setScore(scoreResult)

      // 3. Calcular preço justo
      const pricingResult = calculateFairPrice(vehicleData, scoreResult.total)
      setPricing(pricingResult)

      // 4. Deduzir créditos e salvar relatório
      const res = await fetch('/api/vehicle/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate,
          vehicleData,
          score: scoreResult.total,
          fairPrice: pricingResult.fair_price,
          riskLevel: scoreResult.risk_level,
          tipo,
          creditsConsumed: config.credits,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao salvar relatório')

      setReportId(data.report_id)
      setCredits(prev => prev - config.credits)
      setStep('report')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar consulta')
      setStep('error')
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !vehicle || !score || !pricing) return

    try {
      toast.loading('Gerando PDF...', { id: 'pdf' })
      const { generateVehiclePDF } = await import('@/lib/pdf-generator')
      await generateVehiclePDF({ vehicle, score, pricing, reportId, plate })
      toast.success('PDF gerado com sucesso!', { id: 'pdf' })
    } catch {
      toast.error('Erro ao gerar PDF', { id: 'pdf' })
    }
  }

  // ─── Loading ───
  if (step === 'loading') return <LoadingScreen message="Verificando créditos..." />

  // ─── Confirm ───
  if (step === 'confirm') {
    const isPremium = tipo === 'premium'
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full" shadow="lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{config.icon}</div>
            <h2 className="text-xl font-black text-slate-900">
              Confirmar consulta {config.label}
            </h2>
            {isPremium && (
              <div className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                ⭐ Relatório Diamante — máximo detalhamento
              </div>
            )}
            <p className="text-slate-500 text-sm mt-2">
              Placa: <strong>{formatPlate(plate)}</strong>
            </p>
          </div>

          <div className={cn(
            'border rounded-xl p-4 mb-6',
            isPremium ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
          )}>
            <div className="font-semibold text-slate-700 text-sm mb-3">O que você receberá:</div>
            <ul className="space-y-1.5">
              {config.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-600">{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-6">
            <span className="text-slate-700 font-semibold">Custo da consulta</span>
            <span className={cn(
              'font-black text-lg',
              isPremium ? 'text-purple-600' : 'text-blue-600'
            )}>
              {config.credits} créditos
            </span>
          </div>

          <div className="text-xs text-slate-500 text-center mb-4">
            Saldo atual: <strong>{credits} créditos</strong> → Após: <strong>{credits - config.credits} créditos</strong>
          </div>

          <Button
            onClick={handleConfirm}
            fullWidth
            size="lg"
            className={isPremium
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
              : undefined
            }
          >
            {config.icon} Confirmar — descontar {config.credits} créditos
          </Button>

          {/* Upsell: se for smart, oferece premium */}
          {!isPremium && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
              <p className="text-xs text-purple-700 mb-2">
                💎 Quer o relatório mais completo? Inclui recall, fotos e ficha técnica.
              </p>
              <Link href={`/consulta?placa=${plate}&tipo=premium`}>
                <button className="text-purple-600 font-bold text-xs border border-purple-300 px-4 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
                  Upgradar para PREMIUM (35 cr.)
                </button>
              </Link>
            </div>
          )}

          <Link href="/dashboard">
            <Button variant="ghost" fullWidth size="sm" className="mt-2">
              ← Cancelar
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // ─── Processing ───
  if (step === 'processing') {
    return <LoadingScreen
      message={`Gerando relatório ${config.label}...`}
      submessage="Verificando sinistro, gravame e calculando score..."
    />
  }

  // ─── Error ───
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center py-10" shadow="lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ops, algo deu errado</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <div className="flex gap-3">
            <Link href="/comprar" className="flex-1">
              <Button fullWidth>Comprar créditos</Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" fullWidth>Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // ─── Report ───
  if (step === 'report' && vehicle && score && pricing) {
    const isPremium = tipo === 'premium'
    const rawApi = vehicle.raw_api as any

    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8" ref={reportRef}>
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relatório</div>
                <span className={cn(
                  'text-xs font-black px-2 py-0.5 rounded-full',
                  isPremium
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                )}>{config.label}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                {vehicle.marca} {vehicle.modelo} {vehicle.ano}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {formatPlate(vehicle.placa)} • {vehicle.cidade}, {vehicle.uf}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">📄 Baixar PDF</Button>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">← Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Score Hero */}
          <Card className="mb-6 overflow-hidden" shadow="lg">
            <div className={cn(
              'bg-gradient-to-r px-6 py-5 -mx-6 -mt-6 mb-6',
              score.risk_level === 'safe' ? 'from-emerald-600 to-emerald-700' :
              score.risk_level === 'attention' ? 'from-amber-500 to-amber-600' :
              'from-red-600 to-red-700'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-xl">Score Anti-Bomba</h2>
                  <p className="text-white/70 text-sm">{score.risk_label}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-white">{score.total}</div>
                  <div className="text-white/70 text-sm">/100</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ScoreItem label="Sinistro" value={vehicle.sinistro ? 'Encontrado 🚨' : 'Limpo ✅'} color={vehicle.sinistro ? 'text-red-600' : 'text-emerald-600'} bg={vehicle.sinistro ? 'bg-red-50' : 'bg-emerald-50'} />
              <ScoreItem label="Gravame"  value={vehicle.gravame  ? 'Ativo ⚠️'     : 'Livre ✅'} color={vehicle.gravame  ? 'text-amber-600' : 'text-emerald-600'} bg={vehicle.gravame  ? 'bg-amber-50' : 'bg-emerald-50'} />
              <ScoreItem
                label="Restrições"
                value={vehicle.restricoes && vehicle.restricoes.length > 0 ? `${vehicle.restricoes.length} encontrada(s) ⚠️` : 'Nenhuma ✅'}
                color={vehicle.restricoes && vehicle.restricoes.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
                bg={vehicle.restricoes && vehicle.restricoes.length > 0 ? 'bg-amber-50' : 'bg-emerald-50'}
              />
            </div>
          </Card>

          {/* Vehicle Data */}
          <Card className="mb-6" shadow="md">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">🚗</span> Dados do veículo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Marca', value: vehicle.marca },
                { label: 'Modelo', value: vehicle.modelo },
                { label: 'Versão', value: vehicle.versao || '-' },
                { label: 'Ano', value: String(vehicle.ano) },
                { label: 'Combustível', value: vehicle.combustivel || '-' },
                { label: 'Câmbio', value: vehicle.cambio || '-' },
                { label: 'Cor', value: vehicle.cor || '-' },
                { label: 'Cidade', value: `${vehicle.cidade}, ${vehicle.uf}` },
                { label: 'FIPE', value: formatCurrency(vehicle.fipe) },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{item.label}</div>
                  <div className="font-semibold text-slate-800 text-sm mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* PREMIUM EXTRAS */}
          {isPremium && rawApi && (
            <>
              {/* Recall */}
              {rawApi.recall && (
                <Card className="mb-6 border-l-4 border-orange-400" shadow="md">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🔔</span> Recall
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Atenção</span>
                  </h3>
                  <p className="text-sm text-slate-700">{rawApi.recall_descricao || 'Recall registrado pelo fabricante. Verifique com a concessionária.'}</p>
                </Card>
              )}

              {/* Leilão detalhado */}
              {rawApi.leilao && (
                <Card className="mb-6 border-l-4 border-red-400" shadow="md">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🏷️</span> Histórico de Leilão
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Classe {rawApi.leilao_classificacao || '?'}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-700">
                    Veículo possui registro de leilão.{' '}
                    {rawApi.leilao_classificacao === 'D'
                      ? 'Classe D indica perda total — risco alto.'
                      : rawApi.leilao_classificacao === 'C'
                      ? 'Classe C indica danos severos.'
                      : 'Verifique os detalhes antes de comprar.'}
                  </p>
                </Card>
              )}

              {/* Débitos */}
              {(rawApi.debitos_ipva || rawApi.debitos_multa) && (
                <Card className="mb-6 border-l-4 border-yellow-400" shadow="md">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📌</span> Débitos Pendentes
                  </h3>
                  <div className="flex gap-4">
                    {rawApi.debitos_ipva && <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">⚠️ IPVA pendente</span>}
                    {rawApi.debitos_multa && <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">⚠️ Multas pendentes</span>}
                  </div>
                </Card>
              )}

              {/* Imagens */}
              {rawApi.imagens && Array.isArray(rawApi.imagens) && rawApi.imagens.length > 0 && (
                <Card className="mb-6" shadow="md">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">📷</span> Fotos Oficiais</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {rawApi.imagens.slice(0, 6).map((url: string, i: number) => (
                      <img key={i} src={url} alt={`Foto ${i+1}`} className="rounded-xl w-full h-28 object-cover border border-slate-200" />
                    ))}
                  </div>
                </Card>
              )}

              {/* Ficha Técnica */}
              {rawApi.ficha_tecnica && Object.keys(rawApi.ficha_tecnica).length > 0 && (
                <Card className="mb-6" shadow="md">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">📋</span> Ficha Técnica</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(rawApi.ficha_tecnica).slice(0, 12).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 rounded-xl p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">{k}</div>
                        <div className="font-semibold text-slate-800 text-sm mt-0.5">{String(v)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Alerts */}
          {score.alerts.length > 0 && (
            <Card className="mb-6" shadow="md">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">🚨</span> Alertas encontrados</h3>
              <div className="space-y-3">
                {score.alerts.map((alert, i) => (
                  <AlertCard key={i} type={alert.type} title={alert.title} description={alert.description} icon={alert.icon} />
                ))}
              </div>
            </Card>
          )}

          {/* Fair Price */}
          <Card className="mb-6" shadow="md">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">💰</span> Preço Justo IA</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">FIPE</div>
                <div className="text-xl font-black text-slate-800">{formatCurrency(pricing.fipe_value)}</div>
              </div>
              <div className={cn('rounded-xl p-4 text-center', pricing.discount_percent === 0 ? 'bg-emerald-50' : 'bg-blue-50')}>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Preço justo</div>
                <div className={cn('text-xl font-black', pricing.discount_percent === 0 ? 'text-emerald-700' : 'text-blue-700')}>
                  {formatCurrency(pricing.fair_price)}
                </div>
              </div>
            </div>
            {pricing.discount_percent > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-semibold text-sm">Desconto recomendado</span>
                  <span className="text-blue-800 font-black">{pricing.discount_percent}% ({formatCurrency(pricing.discount_value)})</span>
                </div>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="text-sm font-semibold text-amber-800 mb-1">💡 Dica de negociação</div>
              <div className="text-sm text-amber-700">{pricing.negotiation_tip}</div>
            </div>
          </Card>

          {/* Recommendations */}
          {score.recommendations.length > 0 && (
            <Card className="mb-6" shadow="md">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">✅</span> Recomendações</h3>
              <ul className="space-y-2">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">→</span>{rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Upsell — se for smart, oferecer premium */}
          {!isPremium && (
            <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50" shadow="md">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💎</div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 mb-1">Quer ainda mais informações?</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    O relatório PREMIUM inclui recall, fotos oficiais, ficha técnica, histórico de leilão e débitos — por apenas 35 créditos.
                  </p>
                  <Link href={`/consulta?placa=${plate}&tipo=premium`}>
                    <button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all shadow-md">
                      Consultar Premium — 35 créditos
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadPDF} size="lg" className="flex-1">📄 Baixar PDF completo</Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" fullWidth>🏠 Dashboard</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="ghost" size="lg" fullWidth>🔍 Nova consulta</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function ScoreItem({ label, value, color, bg }: { label: string, value: string, color: string, bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-bold text-sm ${color}`}>{value}</div>
    </div>
  )
}

function LoadingScreen({ message, submessage }: { message: string, submessage?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
      <div className="text-center max-w-xs">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{message}</h3>
        {submessage && <p className="text-slate-500 text-sm">{submessage}</p>}
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConsultaPage() {
  return (
    <Suspense>
      <ConsultaContent />
    </Suspense>
  )
}
