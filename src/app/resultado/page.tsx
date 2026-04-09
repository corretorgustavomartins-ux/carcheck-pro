'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { VehicleService } from '@/lib/vehicle-service'
import { VehiclePreview } from '@/types'
import Link from 'next/link'

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function ResultadoContent() {
  const searchParams = useSearchParams()
  const plate = searchParams.get('placa') || ''

  const [preview, setPreview] = useState<VehiclePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPlate, setNewPlate] = useState(plate)

  useEffect(() => {
    if (!plate) { window.location.href = '/'; return }
    loadPreview()
  }, [plate])

  const loadPreview = async () => {
    setLoading(true)
    setError('')
    try {
      // Chama via API route (server-side) para ter acesso às env vars
      const res = await fetch(`/api/vehicle/preview?plate=${plate}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao consultar placa')
      }
      const data = await res.json()
      setPreview(data.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar placa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const clean = newPlate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length >= 7) window.location.href = `/resultado?placa=${clean}`
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#030712',
    fontFamily: font,
    paddingTop: 80,
    paddingBottom: 60,
    color: '#f8fafc',
  }

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(59,130,246,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        </div>
        <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Consultando placa</p>
        <p style={{ color: '#64748b', fontSize: 13 }}>Buscando dados do veículo...</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', animation: `bounce 0.9s ease ${i*0.2}s infinite` }} />)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={pageStyle}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>

        {/* Barra de busca */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '18px 20px', marginBottom: 20 }}>
          <p style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Consultar outra placa</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={newPlate}
              onChange={e => setNewPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: ABC1D23"
              maxLength={7}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                outline: 'none',
                fontFamily: font,
              }}
            />
            <button
              onClick={handleSearch}
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 12, padding: '12px 22px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Buscar
            </button>
          </div>
        </div>

        {error ? (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 18, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{error}</p>
            <button onClick={loadPreview} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 22px', color: '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>
              Tentar novamente
            </button>
          </div>
        ) : preview ? (
          <>
            {/* Card de prévia */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>

              {/* Header da placa */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Prévia Grátis</p>
                    <p style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>{VehicleService.formatPlate(preview.placa)}</p>
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
                    <p style={{ color: '#93c5fd', fontSize: 11, marginBottom: 2 }}>FIPE estimada</p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{preview.fipe_formatted}</p>
                  </div>
                </div>
              </div>

              {/* Infos do veículo */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: '🚗', label: 'Veículo', value: `${preview.marca} ${preview.modelo}` },
                    { icon: '📅', label: 'Ano', value: String(preview.ano) },
                    { icon: '📍', label: 'Cidade', value: preview.cidade },
                    { icon: '💰', label: 'FIPE', value: preview.fipe_formatted },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <div>
                        <p style={{ color: '#475569', fontSize: 11 }}>{item.label}</p>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, marginTop: 2 }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Itens bloqueados */}
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Relatório SMART — bloqueado</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Score Anti-Bomba (0–100)', 'Registro de Sinistro', 'Gravame Financeiro', 'Restrições Ativas', 'Preço Justo IA', 'Dica de Negociação'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                      <span style={{ color: 'transparent', textShadow: '0 0 8px rgba(255,255,255,0.3)', fontSize: 13, userSelect: 'none' }}>{item}</span>
                      <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>🔒 Bloqueado</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opções de desbloqueio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

              {/* SMART */}
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>SMART</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>Padrão</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>16 créditos</p>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>≈ R$ 15,99 no pacote inicial</p>
                <div style={{ flex: 1, marginBottom: 14 }}>
                  {['Score Anti-Bomba', 'Sinistro + Gravame', 'Preço Justo IA', 'Restrições', 'PDF incluso'].map((f, i) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#3b82f6', fontWeight: 700 }}>✓</span>{f}
                    </p>
                  ))}
                </div>
                <Link href={`/consulta?placa=${plate}&tipo=smart`}>
                  <button style={{ width: '100%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
                    🔓 Desbloquear — 16 cr.
                  </button>
                </Link>
              </div>

              {/* PREMIUM */}
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
                  ⭐ MAIS COMPLETO
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 }}>
                  <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>PREMIUM</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>Diamante</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>35 créditos</p>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>Tudo do SMART + extras</p>
                <div style={{ flex: 1, marginBottom: 14 }}>
                  {['Tudo do SMART', 'Histórico de leilão', 'Recall do fabricante', 'Fotos oficiais', 'Débitos e multas'].map((f, i) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700 }}>✓</span>{f}
                    </p>
                  ))}
                </div>
                <Link href={`/consulta?placa=${plate}&tipo=premium`}>
                  <button style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                    💎 Premium — 35 cr.
                  </button>
                </Link>
              </div>
            </div>

            {/* Comprar créditos */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>Não tem créditos suficientes?</p>
              <Link href="/comprar">
                <button style={{ background: 'transparent', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '10px 24px', color: '#60a5fa', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  💳 Comprar créditos
                </button>
              </Link>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Primeiro acesso? Cadastre-se e ganhe 5 créditos grátis</p>
            </div>

            {/* Trust */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[{ icon: '🔐', text: 'Dados oficiais' }, { icon: '⚡', text: 'Resultado em segundos' }, { icon: '📄', text: 'PDF incluso' }].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense>
      <ResultadoContent />
    </Suspense>
  )
}
