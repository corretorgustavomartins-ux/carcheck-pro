'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plate, setPlate] = useState('')
  const [plateError, setPlateError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    const loadUserData = async (uid: string) => {
      const { data: wallet } = await supabase
        .from('credit_wallets').select('balance').eq('user_id', uid).single()
      setCredits(wallet?.balance ?? 0)

      const { data: reps } = await supabase
        .from('vehicle_reports').select('*').eq('user_id', uid)
        .order('created_at', { ascending: false }).limit(10)
      setReports(reps || [])

      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        window.location.href = '/login'
      }
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleSearch = () => {
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length < 7) {
      setPlateError('Digite uma placa válida. Ex: ABC1D23')
      return
    }
    if (credits < 26) {
      window.location.href = '/comprar'
      return
    }
    setPlateError('')
    // Vai direto para tela de seleção de consulta
    window.location.href = `/selecionar-consulta?placa=${clean}`
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#030712',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '4px solid rgba(59,130,246,0.2)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const safeCount = reports.filter(r => r.risk_level === 'safe').length
  const alertCount = reports.filter(r => r.risk_level !== 'safe').length
  const userName = user?.email?.split('@')[0] || 'usuário'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingTop: 72,
    }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(3,7,18,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>C</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Carcheck Pro</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10,
            padding: '6px 14px',
            textAlign: 'center',
          }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 15 }}>{credits}</span>
            <span style={{ color: '#475569', fontSize: 12, marginLeft: 4 }}>créditos</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              padding: '7px 16px',
              color: '#f87171',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 800, margin: 0 }}>
            Olá, {userName} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{user?.email}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '💳', value: credits, label: 'Créditos disponíveis', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
            { icon: '🔍', value: reports.length, label: 'Consultas realizadas', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)' },
            { icon: '✅', value: safeCount, label: 'Compras seguras', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
            { icon: '⚠️', value: alertCount, label: 'Alertas detectados', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 16,
              padding: '20px 22px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>

          {/* Left: Nova Consulta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Consulta Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: 24,
            }}>
              <h2 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                🔍 Consultar placa
              </h2>
              <p style={{ color: '#475569', fontSize: 12, marginBottom: 20 }}>
                Digite a placa para ver os planos disponíveis
              </p>

              {credits < 26 ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                    Você precisa de pelo menos <strong style={{ color: '#f8fafc' }}>26 créditos</strong> para consultar.
                  </p>
                  <p style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Créditos atuais: {credits}</p>
                  <Link href="/comprar">
                    <button style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '13px 0',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}>
                      💳 Comprar créditos
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={plate}
                    onChange={e => { setPlate(e.target.value.toUpperCase()); setPlateError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Ex: ABC1D23"
                    maxLength={8}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)',
                      border: plateError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      color: '#fff',
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: 4,
                      textAlign: 'center',
                      outline: 'none',
                      marginBottom: 8,
                    }}
                  />
                  {plateError && (
                    <p style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>⚠️ {plateError}</p>
                  )}
                  <button
                    onClick={handleSearch}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px 0',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                    }}
                  >
                    Ver planos de consulta →
                  </button>

                  {/* Mini preview dos planos */}
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 10, padding: '8px 14px' }}>
                      <div>
                        <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13 }}>SMART</div>
                        <div style={{ color: '#475569', fontSize: 11 }}>Dados + Score + Sinistro + Gravame</div>
                      </div>
                      <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: 14 }}>26 créditos</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10, padding: '8px 14px' }}>
                      <div>
                        <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>COMPLETO + LEILÃO</div>
                        <div style={{ color: '#475569', fontSize: 11 }}>Tudo do SMART + Histórico de Leilão</div>
                      </div>
                      <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: 14 }}>49 créditos</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Links */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: 20,
            }}>
              <h3 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Acesso rápido</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { href: '/comprar', icon: '💳', label: 'Comprar créditos' },
                  { href: '/dashboard/transacoes', icon: '📋', label: 'Histórico de compras' },
                  { href: '/dashboard/perfil', icon: '👤', label: 'Meu perfil' },
                ].map(link => (
                  <Link key={link.href} href={link.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    color: '#cbd5e1',
                    fontSize: 14,
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 16 }}>›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Recent Reports */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Histórico de consultas
              </h2>
              <span style={{ color: '#475569', fontSize: 13 }}>{reports.length} consulta{reports.length !== 1 ? 's' : ''}</span>
            </div>

            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
                <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma consulta realizada ainda.</p>
                <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Faça sua primeira consulta de placa!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map(report => {
                  const riskColor = report.risk_level === 'safe' ? '#34d399' : report.risk_level === 'attention' ? '#fb923c' : '#f87171'
                  const riskBg = report.risk_level === 'safe' ? 'rgba(52,211,153,0.1)' : report.risk_level === 'attention' ? 'rgba(251,146,60,0.1)' : 'rgba(248,113,113,0.1)'
                  const riskLabel = report.risk_level === 'safe' ? '✅ Seguro' : report.risk_level === 'attention' ? '⚠️ Atenção' : '🚨 Risco'
                  const vehicle = report.api_payload_json as any
                  const date = new Date(report.created_at).toLocaleDateString('pt-BR')

                  return (
                    <div key={report.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14,
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 42, height: 42,
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#94a3b8', fontWeight: 700, fontSize: 11,
                        }}>
                          {report.plate?.slice(0, 3)}
                        </div>
                        <div>
                          <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 14 }}>
                            {vehicle?.marca || ''} {vehicle?.modelo || ''} {vehicle?.ano || ''}
                          </div>
                          <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                            📍 {report.plate} &nbsp;•&nbsp; 🕐 {date}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>{report.score}</div>
                          <div style={{ color: '#475569', fontSize: 11 }}>Score</div>
                        </div>
                        <span style={{
                          background: riskBg,
                          color: riskColor,
                          border: `1px solid ${riskColor}33`,
                          borderRadius: 999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {riskLabel}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
