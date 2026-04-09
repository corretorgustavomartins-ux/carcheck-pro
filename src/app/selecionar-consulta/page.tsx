'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLANOS = [
  {
    id: 'smart',
    nome: 'SMART',
    creditos: 26,
    preco: 'R$ 25,99',
    cor: '#3b82f6',
    corBg: 'rgba(59,130,246,0.08)',
    corBorder: 'rgba(59,130,246,0.2)',
    emoji: '🔍',
    badge: null as string | null,
    descricao: 'Consulta completa sem histórico de leilão',
    items: [
      '✅ Dados completos do veículo',
      '🏆 Score Anti-Bomba (0–100)',
      '🚨 Verificação de sinistro (perda total)',
      '🔒 Verificação de gravame (alienação financeira)',
      '🚫 Restrições judicial e administrativa',
      '🚗 Histórico de roubo e furto',
      '💰 Preço Justo por IA',
      '📄 Relatório em PDF',
    ],
    nao_inclui: [
      '❌ Histórico de leilão não incluído',
      '❌ Renavam não incluído',
    ],
  },
  {
    id: 'completo',
    nome: 'COMPLETO + LEILÃO',
    creditos: 49,
    preco: 'R$ 48,90',
    cor: '#f59e0b',
    corBg: 'rgba(245,158,11,0.08)',
    corBorder: 'rgba(245,158,11,0.25)',
    emoji: '🏆',
    badge: 'Mais completo' as string | null,
    descricao: 'Inclui histórico completo de leilão',
    items: [
      '✅ Tudo do plano SMART',
      '🏷️ Histórico completo de leilão',
      '📊 Classificação do leilão (A, B, C, D)',
      '📌 Débitos IPVA e multas',
      '🔔 Recall do fabricante',
      '📸 Fotos oficiais do veículo',
    ],
    nao_inclui: [
      '❌ Renavam não incluído',
    ],
  },
]

function SelecionarContent() {
  const searchParams = useSearchParams()
  const placa = (searchParams.get('placa') || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    if (!placa) { window.location.href = '/dashboard'; return }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      supabase
        .from('credit_wallets').select('balance').eq('user_id', session.user.id).single()
        .then(({ data }) => {
          setCredits(data?.balance ?? 0)
          setLoading(false)
        })
    })
  }, [placa])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '4px solid rgba(59,130,246,0.2)', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Verificando créditos...</p>
        </div>
      </div>
    )
  }

  const handleSelecionar = (planoId: string) => {
    const plano = PLANOS.find(p => p.id === planoId)!
    if ((credits ?? 0) < plano.creditos) {
      window.location.href = '/comprar'
      return
    }
    window.location.href = `/consulta?placa=${placa}&tipo=${planoId}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', paddingTop: 80, paddingBottom: 60 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header fixo */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>C</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Carcheck Pro</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '6px 14px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 15 }}>{credits}</span>
            <span style={{ color: '#475569', fontSize: 12, marginLeft: 4 }}>créditos</span>
          </div>
          <Link href="/dashboard">
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 16px', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ← Voltar
            </button>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px', animation: 'fadeUp 0.4s ease' }}>

        {/* Placa destaque */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ color: '#475569', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Placa consultada
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 36px', marginBottom: 20 }}>
            <span style={{ color: '#f8fafc', fontSize: 32, fontWeight: 900, letterSpacing: 6, fontFamily: 'monospace' }}>
              {placa.slice(0, 3)}-{placa.slice(3)}
            </span>
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
            Escolha o tipo de consulta
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Selecione o plano que melhor atende sua necessidade
          </p>
        </div>

        {/* Cards dos planos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
          {PLANOS.map(plano => {
            const podeConsultar = (credits ?? 0) >= plano.creditos
            const isHovered = hovered === plano.id

            return (
              <div
                key={plano.id}
                onMouseEnter={() => setHovered(plano.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative',
                  background: isHovered ? plano.corBg : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isHovered ? plano.cor : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 24,
                  padding: 28,
                  transition: 'all 0.2s ease',
                  boxShadow: isHovered ? `0 8px 40px ${plano.cor}22` : 'none',
                  opacity: podeConsultar ? 1 : 0.75,
                  cursor: 'pointer',
                }}
                onClick={() => handleSelecionar(plano.id)}
              >
                {plano.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plano.cor}, ${plano.cor}cc)`, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 18px', borderRadius: 999, boxShadow: `0 4px 14px ${plano.cor}44`, whiteSpace: 'nowrap' }}>
                    {plano.badge}
                  </div>
                )}

                {/* Cabeçalho */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{plano.emoji}</div>
                    <div style={{ color: plano.cor, fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>{plano.nome}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{plano.descricao}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: plano.cor, fontSize: 28, fontWeight: 900 }}>{plano.creditos}</div>
                    <div style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>créditos</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{plano.preco}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Items incluídos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  {plano.items.map((item, i) => (
                    <div key={i} style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ flexShrink: 0 }}>{item.slice(0, 2)}</span>
                      <span>{item.slice(2).trim()}</span>
                    </div>
                  ))}
                </div>

                {/* Não incluídos */}
                {plano.nao_inclui.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {plano.nao_inclui.map((item, i) => (
                      <div key={i} style={{ color: '#475569', fontSize: 12 }}>{item}</div>
                    ))}
                  </div>
                )}

                {/* Alerta créditos insuficientes */}
                {!podeConsultar && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, textAlign: 'center' }}>
                    <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                      ⚠️ Você tem {credits} de {plano.creditos} créditos necessários
                    </span>
                  </div>
                )}

                {/* Botão */}
                <button
                  onClick={e => { e.stopPropagation(); handleSelecionar(plano.id) }}
                  style={{
                    width: '100%',
                    background: podeConsultar ? `linear-gradient(135deg, ${plano.cor}, ${plano.cor}cc)` : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 14, padding: '14px 0',
                    color: podeConsultar ? '#fff' : '#475569',
                    fontWeight: 700, fontSize: 15,
                    cursor: podeConsultar ? 'pointer' : 'default',
                    boxShadow: podeConsultar ? `0 4px 20px ${plano.cor}44` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {podeConsultar
                    ? `${plano.emoji} Consultar — ${plano.creditos} créditos`
                    : `💳 Comprar créditos`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Resumo de saldo */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 24px', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Seus créditos</div>
            <div style={{ color: '#60a5fa', fontWeight: 800, fontSize: 22 }}>{credits}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Consultas SMART</div>
            <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: 22 }}>{Math.floor((credits ?? 0) / 26)}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Consultas Completas</div>
            <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: 22 }}>{Math.floor((credits ?? 0) / 49)}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <Link href="/comprar" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, padding: '8px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                💳 Comprar mais créditos
              </button>
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: 12 }}>
          🔒 Créditos são descontados somente após a consulta ser concluída com sucesso
        </p>
      </div>
    </div>
  )
}

export default function SelecionarConsultaPage() {
  return (
    <Suspense>
      <SelecionarContent />
    </Suspense>
  )
}
