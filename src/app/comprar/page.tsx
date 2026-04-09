'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Estrutura de planos:
 *
 * SMART = 16 créditos = R$15,90
 *   → 1 consulta SMART (API Prata ~R$12,90, margem ~R$3,00)
 *   → SEM histórico de leilão
 *
 * RECOMENDADO = 48 créditos = R$35,90
 *   → 1 consulta COMPLETA com leilão (API Ouro ~R$19,90, margem ~R$16,00)
 *   OU 3 consultas SMART (3 × R$12,90 = R$38,70 custo API, margem -R$2,80 ← atenção!)
 *   → Melhor uso: 1 Completo + 1 Smart = R$12,90+R$19,90 = R$32,80 custo, margem R$3,10
 *
 * PROFISSIONAL = 100 créditos = R$69,90
 *   → 2 consultas Completas + 0 Smarts = R$39,80 custo, margem R$30,10
 *   OU 6 consultas Smart = R$77,40 custo → NÃO USAR assim (prejuízo)
 *   → Recomendado: máx 2 Completas (96cr) + créditos extras para 0 Smarts
 */
const PACKAGES = [
  {
    id: 'starter',
    name: 'Consulta SMART',
    price: 'R$ 15,90',
    credits: 16,
    queries: 1,
    queriesCompleto: 0,
    badge: null,
    color: '#3b82f6',
    features: [
      '1 consulta SMART completa',
      'Score Anti-Bomba (0–100)',
      'Sinistro + Gravame + Restrições',
      'Roubo e furto',
      'Preço Justo por IA',
      'Relatório em PDF',
    ],
    obs: '❌ Não inclui histórico de leilão',
  },
  {
    id: 'recommended',
    name: 'Consulta Completa + Leilão',
    price: 'R$ 35,90',
    credits: 48,
    queries: 0,
    queriesCompleto: 1,
    badge: 'Mais recomendado',
    color: '#f59e0b',
    features: [
      '1 consulta COMPLETA com leilão',
      'Histórico completo de leilão',
      'Classificação do leilão (A, B, C, D)',
      'Score Anti-Bomba (0–100)',
      'Sinistro + Gravame + Restrições',
      'Débitos IPVA e multas',
      'Recall do fabricante',
      'Preço Justo por IA',
    ],
    obs: '✅ Inclui histórico completo de leilão',
  },
  {
    id: 'smart',
    name: 'Pacote Profissional',
    price: 'R$ 69,90',
    credits: 96,
    queries: 0,
    queriesCompleto: 2,
    badge: null,
    color: '#8b5cf6',
    features: [
      '2 consultas COMPLETAS com leilão',
      'Histórico completo de leilão em cada',
      'Score Anti-Bomba (0–100)',
      'Sinistro + Gravame + Restrições',
      'Débitos IPVA e multas',
      'Recall do fabricante',
      'Preço Justo por IA',
      'Histórico salvo no painel',
    ],
    obs: '✅ 2 consultas Completas + Leilão',
  },
]

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

  const selectedPackage = PACKAGES.find(p => p.id === selected)!

  const handleBuy = async () => {
    if (!user) { window.location.href = '/login?next=/comprar'; return }
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
      alert(err.message || 'Erro ao processar pagamento')
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
        }
      } catch {}
    }, 3000)
    setTimeout(() => { clearInterval(interval); setPolling(false) }, 600000)
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixData?.pix_code || '')
    alert('Código PIX copiado!')
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #0c1628 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    paddingTop: 80,
    paddingBottom: 60,
    paddingLeft: 16,
    paddingRight: 16,
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  }

  if (paymentStep === 'success') {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Pagamento aprovado!</h2>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>
              {selectedPackage.credits} créditos foram adicionados à sua conta.
            </p>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '14px 20px', marginBottom: 24 }}>
              <p style={{ color: '#34d399', fontWeight: 700 }}>✅ {selectedPackage.credits} créditos</p>
              <p style={{ color: '#6ee7b7', fontSize: 13 }}>
                {selectedPackage.queriesCompleto > 0
                  ? `${selectedPackage.queriesCompleto} consulta${selectedPackage.queriesCompleto > 1 ? 's' : ''} Completa${selectedPackage.queriesCompleto > 1 ? 's' : ''} com Leilão disponíve${selectedPackage.queriesCompleto > 1 ? 'is' : 'l'}`
                  : `${selectedPackage.queries} consulta${selectedPackage.queries > 1 ? 's' : ''} SMART disponível${selectedPackage.queries > 1 ? 'is' : ''}`
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => window.location.href = '/dashboard'} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Ir ao Dashboard
              </button>
              <button onClick={() => window.location.href = '/'} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Consultar placa
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStep === 'pix' && pixData) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(16,185,129,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>💚</div>
              <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>Pague via PIX</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{selectedPackage.price} • {selectedPackage.credits} créditos</p>
            </div>

            {pixData.pix_qr_base64 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 16 }}>
                  <img src={`data:image/png;base64,${pixData.pix_qr_base64}`} alt="QR Code PIX" style={{ width: 192, height: 192, display: 'block' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Código PIX (Copia e Cola)</label>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pixData.pix_code}</p>
                <button onClick={copyPix} style={{ color: '#60a5fa', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Copiar</button>
              </div>
            </div>

            {polling && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px', textAlign: 'center', color: '#fbbf24', fontSize: 14, marginBottom: 16 }}>
                ⏳ Aguardando pagamento...
              </div>
            )}

            <button onClick={copyPix} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>
              📋 Copiar código PIX
            </button>
            <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>⏱ Expira em 30 minutos • 🔄 Créditos liberados automaticamente</p>
            <button onClick={() => setPaymentStep('select')} style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>← Voltar e escolher outro pacote</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      {/* Glow */}
      <div style={{ position: 'fixed', top: 80, right: 40, width: 384, height: 384, background: 'rgba(59,130,246,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Comprar créditos</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Escolha o pacote ideal para você</p>
          {!user && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', padding: '8px 16px', borderRadius: 999, fontSize: 14, marginTop: 12 }}>
              🎁 Crie sua conta e ganhe 5 créditos grátis!
            </div>
          )}
        </div>

        {/* Packages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
          {PACKAGES.map((pkg) => {
            const isSelected = selected === pkg.id
            return (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  background: isSelected
                    ? `rgba(${pkg.color === '#3b82f6' ? '59,130,246' : pkg.color === '#f59e0b' ? '245,158,11' : '139,92,246'},0.1)`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? pkg.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 20,
                  padding: '28px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 8px 32px ${pkg.color}30` : 'none',
                }}
              >
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
                    {pkg.badge}
                  </div>
                )}

                {isSelected && (
                  <div style={{ position: 'absolute', top: 16, right: 16, width: 24, height: 24, background: pkg.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 14 }}>✓</span>
                  </div>
                )}

                <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{pkg.name}</div>
                <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{pkg.price}</div>
                <div style={{ color: pkg.color, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  {pkg.credits} créditos
                  {pkg.queriesCompleto > 0 && <span> • {pkg.queriesCompleto} consulta{pkg.queriesCompleto > 1 ? 's' : ''} Completa{pkg.queriesCompleto > 1 ? 's' : ''} + Leilão</span>}
                  {pkg.queries > 0 && <span> • {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''} SMART</span>}
                </div>
                {pkg.obs && (
                  <div style={{ color: pkg.id === 'starter' ? '#f87171' : '#34d399', fontSize: 12, marginBottom: 14 }}>{pkg.obs}</div>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pkg.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Summary */}
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={cardStyle}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Resumo do pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: 14 }}>{selectedPackage.name}</span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{selectedPackage.credits} créditos</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: 14 }}>Consultas incluídas</span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                  {selectedPackage.queriesCompleto > 0 && `${selectedPackage.queriesCompleto} Completa${selectedPackage.queriesCompleto > 1 ? 's' : ''} c/ Leilão`}
                  {selectedPackage.queries > 0 && `${selectedPackage.queries} SMART`}
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
                <span style={{ color: '#3b82f6', fontWeight: 900, fontSize: 20 }}>{selectedPackage.price}</span>
              </div>
            </div>
            <button
              onClick={handleBuy}
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#166534' : 'linear-gradient(135deg, #16a34a, #059669)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '15px 0',
                fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              {loading ? 'Processando...' : '💚 Pagar via PIX'}
            </button>
            <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
              🔒 Pagamento seguro • ⚡ Créditos em segundos
            </p>
          </div>
        </div>
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
