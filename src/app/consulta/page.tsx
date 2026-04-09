'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VehicleService } from '@/lib/vehicle-service'
import { calculateScore } from '@/lib/score-engine'
import { calculateFairPrice, formatCurrency } from '@/lib/pricing-engine'
import { VehicleData, ScoreResult, PricingResult } from '@/types'
import Link from 'next/link'

const S = {
  page: {
    minHeight: '100vh',
    background: '#030712',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    paddingTop: 80,
    paddingBottom: 60,
    color: '#f8fafc',
  } as React.CSSProperties,
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '80vh',
  } as React.CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 28,
  } as React.CSSProperties,
  wrap: { maxWidth: 720, margin: '0 auto', padding: '0 20px' } as React.CSSProperties,
}

function LoadingScreen({ message, submessage }: { message: string; submessage?: string }) {
  return (
    <div style={{ ...S.page, ...S.center }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(59,130,246,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔍</div>
        </div>
        <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{message}</p>
        {submessage && <p style={{ color: '#64748b', fontSize: 13 }}>{submessage}</p>}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', animation: `bounce 0.9s ease ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ConsultaContent() {
  const searchParams = useSearchParams()
  const plate = searchParams.get('placa') || ''
  const tipo = searchParams.get('tipo') === 'premium' ? 'premium' : 'smart'
  const credits_needed = tipo === 'premium' ? 35 : 16

  const [step, setStep] = useState<'loading' | 'confirm' | 'processing' | 'report' | 'error'>('loading')
  const [credits, setCredits] = useState(0)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [pricing, setPricing] = useState<PricingResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!plate) { window.location.href = '/'; return }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      supabase.from('credit_wallets').select('balance').eq('user_id', session.user.id).single().then(({ data }) => {
        const bal = data?.balance ?? 0
        setCredits(bal)
        if (bal < credits_needed) {
          setError(`Créditos insuficientes. Você precisa de ${credits_needed} créditos.`)
          setStep('error')
        } else {
          setStep('confirm')
        }
      })
    })
  }, [plate])

  const handleConfirm = async () => {
    setStep('processing')
    const supabase = createClient()
    try {
      const vehicleData = await VehicleService.getFullReport(plate, tipo as any)
      if (!vehicleData) throw new Error('Veículo não encontrado')
      setVehicle(vehicleData)
      const scoreResult = calculateScore(vehicleData)
      setScore(scoreResult)
      const pricingResult = calculateFairPrice(vehicleData, scoreResult.total)
      setPricing(pricingResult)

      const res = await fetch('/api/vehicle/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate, vehicleData, score: scoreResult.total, fairPrice: pricingResult.fair_price, riskLevel: scoreResult.risk_level, tipo, creditsConsumed: credits_needed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar relatório')
      setCredits(prev => prev - credits_needed)
      setStep('report')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar consulta')
      setStep('error')
    }
  }

  if (step === 'loading') return <LoadingScreen message="Verificando créditos..." />
  if (step === 'processing') return <LoadingScreen message={`Gerando relatório ${tipo.toUpperCase()}...`} submessage="Verificando sinistro, gravame e calculando score..." />

  if (step === 'error') return (
    <div style={{ ...S.page, ...S.center }}>
      <div style={{ ...S.card, maxWidth: 420, width: '100%', margin: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Ops, algo deu errado</h2>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/comprar" style={{ flex: 1 }}>
            <button style={{ width: '100%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 12, padding: '12px 0', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Comprar créditos</button>
          </Link>
          <Link href="/dashboard" style={{ flex: 1 }}>
            <button style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 0', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  )

  if (step === 'confirm') return (
    <div style={{ ...S.page, ...S.center }}>
      <div style={{ ...S.card, maxWidth: 460, width: '100%', margin: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{tipo === 'premium' ? '💎' : '🔍'}</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Confirmar consulta {tipo.toUpperCase()}</h2>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Placa: <strong style={{ color: '#f8fafc' }}>{plate}</strong></p>
        </div>

        <div style={{ background: tipo === 'premium' ? 'rgba(167,139,250,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${tipo === 'premium' ? 'rgba(167,139,250,0.2)' : 'rgba(59,130,246,0.2)'}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>O que você receberá:</p>
          {(tipo === 'smart' ? [
            '✅ Dados completos do veículo',
            '🏆 Score Anti-Bomba (0–100)',
            '🚨 Verificação de sinistro',
            '🔒 Verificação de gravame',
            '💰 Preço Justo IA',
          ] : [
            '✅ Tudo do plano SMART',
            '🏷️ Histórico completo de leilão',
            '🔔 Recall do fabricante',
            '📋 Ficha técnica completa',
            '📌 Débitos IPVA e multas',
          ]).map((item, i) => (
            <p key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4 }}>{item}</p>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>Custo</span>
          <span style={{ color: tipo === 'premium' ? '#a78bfa' : '#60a5fa', fontWeight: 800, fontSize: 18 }}>{credits_needed} créditos</span>
        </div>
        <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
          Saldo atual: {credits} → Após: {credits - credits_needed} créditos
        </p>

        <button onClick={handleConfirm} style={{ width: '100%', background: tipo === 'premium' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 14, padding: '15px 0', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.35)', marginBottom: 12 }}>
          {tipo === 'premium' ? '💎' : '🔍'} Confirmar — {credits_needed} créditos
        </button>

        <Link href="/dashboard">
          <button style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 0', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>
            ← Cancelar
          </button>
        </Link>
      </div>
    </div>
  )

  if (step === 'report' && vehicle && score && pricing) {
    const riskColor = score.risk_level === 'safe' ? '#34d399' : score.risk_level === 'attention' ? '#fb923c' : '#f87171'
    const riskBg = score.risk_level === 'safe' ? 'rgba(52,211,153,0.15)' : score.risk_level === 'attention' ? 'rgba(251,146,60,0.15)' : 'rgba(248,113,113,0.15)'
    const riskLabel = score.risk_level === 'safe' ? '✅ Seguro para compra' : score.risk_level === 'attention' ? '⚠️ Atenção necessária' : '🚨 Risco alto'

    return (
      <div style={S.page}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={S.wrap}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Relatório {tipo.toUpperCase()}</p>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{vehicle.marca} {vehicle.modelo} {vehicle.ano}</h1>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Placa: {vehicle.placa} • {vehicle.cidade}, {vehicle.uf}</p>
            </div>
            <Link href="/dashboard">
              <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ← Dashboard
              </button>
            </Link>
          </div>

          {/* Score Hero */}
          <div style={{ ...S.card, background: riskBg, border: `1px solid ${riskColor}33`, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 4 }}>Score Anti-Bomba</h2>
                <span style={{ background: riskBg, color: riskColor, border: `1px solid ${riskColor}44`, borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{riskLabel}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{score.total}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>/100</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { label: 'Sinistro', val: vehicle.sinistro ? '🚨 Encontrado' : '✅ Limpo', alert: vehicle.sinistro },
                { label: 'Gravame', val: vehicle.gravame ? '⚠️ Ativo' : '✅ Livre', alert: vehicle.gravame },
                { label: 'Restrições', val: vehicle.restricoes?.length ? `⚠️ ${vehicle.restricoes.length} encontrada(s)` : '✅ Nenhuma', alert: !!vehicle.restricoes?.length },
              ].map((item, i) => (
                <div key={i} style={{ background: item.alert ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.alert ? '#f87171' : '#34d399', fontWeight: 700, fontSize: 13 }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dados do veículo */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🚗 Dados do veículo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
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
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, marginTop: 3 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas */}
          {score.alerts.length > 0 && (
            <div style={{ ...S.card, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🚨 Alertas encontrados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {score.alerts.map((alert, i) => (
                  <div key={i} style={{ background: alert.type === 'danger' ? 'rgba(248,113,113,0.08)' : 'rgba(251,146,60,0.08)', border: `1px solid ${alert.type === 'danger' ? 'rgba(248,113,113,0.2)' : 'rgba(251,146,60,0.2)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{alert.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{alert.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: 13 }}>{alert.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preço Justo */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💰 Preço Justo IA</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>FIPE</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{formatCurrency(pricing.fipe_value)}</div>
              </div>
              <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Preço justo</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#34d399' }}>{formatCurrency(pricing.fair_price)}</div>
              </div>
            </div>
            {pricing.discount_percent > 0 && (
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>Desconto recomendado</span>
                <span style={{ color: '#60a5fa', fontWeight: 800 }}>{pricing.discount_percent}% ({formatCurrency(pricing.discount_value)})</span>
              </div>
            )}
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>💡 Dica de negociação</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{pricing.negotiation_tip}</div>
            </div>
          </div>

          {/* Recomendações */}
          {score.recommendations.length > 0 && (
            <div style={{ ...S.card, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>✅ Recomendações</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                    <span style={{ color: '#3b82f6', flexShrink: 0 }}>→</span>{rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upsell Premium */}
          {tipo === 'smart' && (
            <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 32 }}>💎</span>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Quer ainda mais informações?</h3>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>O relatório PREMIUM inclui recall, fotos oficiais, ficha técnica e débitos.</p>
                <Link href={`/consulta?placa=${plate}&tipo=premium`}>
                  <button style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Consultar Premium — 35 créditos
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{ flex: 1, minWidth: 140 }}>
              <button style={{ width: '100%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 14, padding: '14px 0', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                🔍 Nova consulta
              </button>
            </Link>
            <Link href="/dashboard" style={{ flex: 1, minWidth: 140 }}>
              <button style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 0', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                🏠 Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function ConsultaPage() {
  return (
    <Suspense>
      <ConsultaContent />
    </Suspense>
  )
}
