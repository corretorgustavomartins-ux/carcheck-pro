'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'

/* ─────────────────────────────────────────
   SCORE RING — animated SVG circle
───────────────────────────────────────── */
function ScoreRing({ target = 87 }: { target?: number }) {
  const [score, setScore] = useState(0)
  const r = 54
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const delay = setTimeout(() => {
      let v = 0
      const interval = setInterval(() => {
        v += 2
        if (v >= target) { setScore(target); clearInterval(interval) }
        else setScore(v)
      }, 20)
      return () => clearInterval(interval)
    }, 600)
    return () => clearTimeout(delay)
  }, [target])

  const pct = score / 100
  const offset = circ - pct * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
      <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.04s linear, stroke 0.4s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color }}>{score}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>/100</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PLATE INPUT
───────────────────────────────────────── */
function PlateInput({
  value, onChange, onSearch, loading, error, size = 'large'
}: {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
  loading?: boolean
  error?: string
  size?: 'large' | 'small'
}) {
  const isLarge = size === 'large'

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 16,
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.10)',
        background: '#0d1829',
        marginBottom: error ? 8 : 0,
      }}>
        {/* BR badge */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 12px', gap: 4, flexShrink: 0,
          background: '#1d4ed8',
        }}>
          <span style={{ color: '#fde047', fontWeight: 900, fontSize: 10, letterSpacing: '0.15em' }}>BR</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[0,1,2,3].map(i => (
              <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(253,224,71,0.5)' }} />
            ))}
          </div>
        </div>
        {/* Text */}
        <input
          type="text"
          value={value}
          onChange={e => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
            if (raw.length <= 7) onChange(raw.length > 3 ? `${raw.slice(0,3)}-${raw.slice(3)}` : raw)
          }}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          placeholder="ABC-1D23"
          maxLength={8}
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1, background: 'transparent',
            border: 'none', outline: 'none',
            padding: isLarge ? '16px 16px' : '12px 12px',
            fontSize: isLarge ? 28 : 20,
            fontWeight: 900,
            letterSpacing: '0.3em',
            color: '#fff',
            textTransform: 'uppercase',
            caretColor: '#3b82f6',
          }}
        />
      </div>
      {error && (
        <p style={{ color: '#f87171', fontSize: 13, margin: '4px 0 0 4px' }}>⚠ {error}</p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()
  const [plate, setPlate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({})

  const howRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const pricRef = useRef<HTMLDivElement>(null)
  const testRef = useRef<HTMLDivElement>(null)
  const faqRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const refs = [
      { ref: howRef, key: 'how' },
      { ref: featRef, key: 'feat' },
      { ref: pricRef, key: 'pric' },
      { ref: testRef, key: 'test' },
      { ref: faqRef, key: 'faq' },
    ]
    const observers = refs.map(({ ref, key }) => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setVisibleSections(prev => ({ ...prev, [key]: true }))
      }, { threshold: 0.1 })
      if (ref.current) obs.observe(ref.current)
      return obs
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  function validate(raw: string) {
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(raw)
    const old = /^[A-Z]{3}[0-9]{4}$/.test(raw)
    return mercosul || old
  }

  function handleSearch() {
    const clean = plate.replace(/-/g, '')
    if (!validate(clean)) {
      setError('Placa inválida. Ex: ABC-1D23 ou ABC-1234')
      return
    }
    setLoading(true)
    router.push(`/resultado?placa=${clean}`)
  }

  const fadeStyle = (key: string, delay = 0): React.CSSProperties => ({
    opacity: visibleSections[key] ? 1 : 0,
    transform: visibleSections[key] ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  // ─── COLORS ───
  const BG1 = '#060c18'
  const BG2 = '#030712'
  const BORDER = 'rgba(255,255,255,0.07)'
  const CARD  = 'rgba(13,24,41,0.9)'

  return (
    <div style={{ background: BG2, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${BG1} 0%, #0d1829 60%, ${BG1} 100%)`,
        overflow: 'hidden',
        paddingTop: 80,
      }}>
        {/* grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg,rgba(148,163,184,0.05) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* blue glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)',
          filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0,
        }} />
        {/* purple glow */}
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)',
          filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 1280,
          margin: '0 auto', padding: '64px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
          gap: 64, alignItems: 'center',
        }}>
          {/* LEFT */}
          <div>
            {/* badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              borderRadius: 999, padding: '6px 16px', marginBottom: 28,
              border: '1px solid rgba(59,130,246,0.25)',
              background: 'rgba(59,130,246,0.08)',
              color: '#93c5fd', fontSize: 13, fontWeight: 600,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#60a5fa',
                boxShadow: '0 0 0 3px rgba(96,165,250,0.3)',
                animation: 'pulse 2s infinite',
                display: 'inline-block',
              }} />
              Score Anti-Bomba em tempo real
            </div>

            {/* headline */}
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 900, color: '#fff',
              lineHeight: 1.1, marginBottom: 20,
              letterSpacing: '-0.02em',
            }}>
              Descubra se o carro é{' '}
              <span style={{
                background: 'linear-gradient(135deg,#f97316,#ef4444)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>bomba</span>{' '}
              antes de comprar
            </h1>

            <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7, maxWidth: 480 }}>
              Consulte <strong style={{ color: '#e2e8f0' }}>sinistro, gravame e FIPE</strong> em segundos.
              Receba um <strong style={{ color: '#e2e8f0' }}>Score 0–100</strong> e o{' '}
              <strong style={{ color: '#e2e8f0' }}>preço justo</strong> para negociar com confiança.
            </p>

            {/* input + CTA */}
            <div style={{ maxWidth: 440, marginBottom: 24 }}>
              <PlateInput
                value={plate} onChange={v => { setPlate(v); setError('') }}
                onSearch={handleSearch} loading={loading} error={error} size="large"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  marginTop: 12, width: '100%',
                  padding: '16px 24px', borderRadius: 14,
                  background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                  boxShadow: '0 4px 24px rgba(37,99,235,0.40)',
                  color: '#fff', fontWeight: 700, fontSize: 17,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? (
                  '⏳ Consultando...'
                ) : (
                  <>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    Ver score do carro grátis
                  </>
                )}
              </button>
              <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#475569' }}>
                🔓 Prévia grátis · 16 créditos para relatório completo
              </p>
            </div>

            {/* trust pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {['🛡️ Dados DETRAN oficiais','⚡ Resultado em 2s','🔒 100% seguro'].map(t => (
                <span key={t} style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — mock card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: 360,
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 48px rgba(59,130,246,0.07)',
            }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Relatório SMART</p>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Toyota Corolla 2020</p>
                  <p style={{ color: '#64748b', fontSize: 12 }}>São Paulo, SP</p>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: '#93c5fd', fontFamily: 'monospace', fontSize: 12,
                }}>ABC-1D23</div>
              </div>

              {/* score + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <ScoreRing target={87} />
                <div>
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Classificação</p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 10, marginBottom: 6,
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>Compra Segura</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#475569' }}>Risco mínimo detectado</p>
                </div>
              </div>

              {/* rows */}
              {[
                { l: 'Sinistro',    v: 'Sem registro',        ok: true },
                { l: 'Gravame',     v: 'Livre',                ok: true },
                { l: 'Restrições',  v: 'Nenhuma',              ok: true },
              ].map(r => (
                <div key={r.l} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: 10, marginBottom: 6,
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.ok ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.ok ? '#4ade80' : '#f87171' }} />
                    {r.v}
                  </span>
                </div>
              ))}

              {/* price */}
              <div style={{
                marginTop: 14, padding: 16, borderRadius: 14,
                background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(6,182,212,0.08))',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Preço Justo IA</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>R$ 98.500</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>FIPE</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>R$ 98.500</p>
                  </div>
                </div>
                <div style={{
                  padding: '6px 10px', borderRadius: 8,
                  background: 'rgba(34,197,94,0.12)',
                  fontSize: 12, color: '#4ade80', fontWeight: 600,
                }}>
                  ✅ Preço alinhado ao mercado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: `1px solid ${BORDER}`,
          background: 'rgba(6,12,24,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto', padding: '20px 24px',
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 16, textAlign: 'center',
          }}>
            {[
              { v: '48k+',    l: 'Consultas' },
              { v: '94%',     l: 'Golpes evitados' },
              { v: 'R$2.4M',  l: 'Economizados' },
              { v: '4.9 ⭐',  l: 'Avaliação' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMO FUNCIONA
      ══════════════════════════════════════ */}
      <section id="como-funciona" style={{ background: BG2, padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>Como funciona</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              De zero ao relatório em{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                menos de 2 minutos
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Processo 100% digital, seguro e instantâneo.
            </p>
          </div>

          <div ref={howRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {[
              { n:'01', emoji:'🔍', title:'Digite a placa',       desc:'Formato Mercosul ou antigo. Qualquer placa brasileira.', color:'#3b82f6', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.2)' },
              { n:'02', emoji:'👁️', title:'Prévia grátis',        desc:'Marca, modelo, ano e faixa FIPE — sem custo algum.',       color:'#06b6d4', bg:'rgba(6,182,212,0.08)',  border:'rgba(6,182,212,0.2)' },
              { n:'03', emoji:'💳', title:'Escolha o relatório',  desc:'SMART (16 cr.) ou PREMIUM (35 cr.) para máximo detalhamento com fotos e recall.',  color:'#8b5cf6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.2)' },
              { n:'04', emoji:'🏆', title:'Negocie com poder',    desc:'Apresente o relatório e negocie com dados oficiais.',     color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' },
            ].map((s, i) => (
              <div key={i} style={{
                ...fadeStyle('how', i * 0.1),
                padding: 28, borderRadius: 20,
                background: s.bg, border: `1px solid ${s.border}`,
                textAlign: 'center',
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: s.bg, border: `1px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 16px',
                }}>
                  {s.emoji}
                </div>
                <div style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)', color: s.color,
                  fontSize: 10, fontWeight: 900, marginBottom: 10, letterSpacing: '0.1em',
                }}>PASSO {s.n}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg,#030712,#060c18)', padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>Funcionalidades</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              Proteção completa na{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                compra do seu carro
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Não é só consulta de placa — é um sistema completo de proteção.
            </p>
          </div>

          <div ref={featRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            {[
              { emoji:'🏆', title:'Score Anti-Bomba',     desc:'Algoritmo exclusivo 0–100 que analisa sinistro, gravame, restrições e idade do veículo.', tag:'Exclusivo', color:'#f59e0b', bg:'rgba(245,158,11,0.06)',  border:'rgba(245,158,11,0.15)' },
              { emoji:'💰', title:'Preço Justo IA',        desc:'Motor inteligente que sugere o valor ideal baseado na FIPE, sinistro e condição geral.', tag:'IA',        color:'#60a5fa', bg:'rgba(59,130,246,0.06)',  border:'rgba(59,130,246,0.15)' },
              { emoji:'🚨', title:'Detector de Sinistro', desc:'Acidentes, perda total, colisões e histórico de indenizações nas bases oficiais.',       tag:'Proteção',  color:'#f87171', bg:'rgba(239,68,68,0.06)',   border:'rgba(239,68,68,0.15)' },
              { emoji:'🔒', title:'Gravame',               desc:'Financiamentos ativos, alienação fiduciária e restrições financeiras sobre o bem.',      tag:'Segurança', color:'#c084fc', bg:'rgba(139,92,246,0.06)', border:'rgba(139,92,246,0.15)' },
              { emoji:'📄', title:'Relatório PDF',         desc:'Relatório profissional completo para apresentar ao vendedor e negociar com firmeza.',    tag:'Download',  color:'#34d399', bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.15)' },
              { emoji:'📍', title:'Dados Oficiais',        desc:'Cruzamento de DETRAN, DENATRAN e SERASA para máxima precisão nas informações.',         tag:'Confiável', color:'#22d3ee', bg:'rgba(6,182,212,0.06)',  border:'rgba(6,182,212,0.15)' },
            ].map((f, i) => (
              <div key={i} style={{
                ...fadeStyle('feat', i * 0.07),
                padding: 24, borderRadius: 18,
                background: f.bg, border: `1px solid ${f.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{f.emoji}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                    background: `${f.bg}`, border: `1px solid ${f.border}`, color: f.color,
                  }}>{f.tag}</span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section id="pacotes" style={{ background: BG2, padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#34d399', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>Planos & Preços</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              Simples, sem{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                assinaturas
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>
              Compre créditos uma vez e use quando precisar. Sem taxas ocultas.
            </p>
          </div>

          <div ref={pricRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 960, margin: '0 auto 40px' }}>
            {[
              {
                id: 'starter', name: 'Inicial', credits: 16, queries: 1,
                price: 'R$ 15,99', priceNum: 15.99,
                color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)',
                btnBg: 'linear-gradient(135deg,#059669,#10b981)', btnShadow: 'rgba(16,185,129,0.3)',
                popular: false, badge: null, icon: '🟢',
                features: ['1 consulta SMART','Score Anti-Bomba 0-100','Preço Justo IA','Relatório PDF','Validade 30 dias'],
              },
              {
                id: 'recommended', name: 'Recomendado', credits: 48, queries: 3,
                price: 'R$ 39,90', priceNum: 39.90,
                color: '#3b82f6', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.35)',
                btnBg: 'linear-gradient(135deg,#2563eb,#3b82f6)', btnShadow: 'rgba(59,130,246,0.35)',
                popular: true, badge: '⭐ Mais vendido', icon: '🔥',
                features: ['3 consultas SMART','Score Anti-Bomba 0-100','Preço Justo IA','Relatório PDF','Monitoramento básico','Validade 60 dias'],
              },
              {
                id: 'smart', name: 'Inteligente', credits: 100, queries: 6,
                price: 'R$ 69,90', priceNum: 69.90,
                color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)',
                btnBg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', btnShadow: 'rgba(139,92,246,0.3)',
                popular: false, badge: null, icon: '🟣',
                features: ['6 consultas SMART','Score Anti-Bomba 0-100','Preço Justo IA','Relatório PDF','Monitoramento avançado','Suporte prioritário','Validade 90 dias'],
              },
            ].map((pkg, i) => (
              <div key={pkg.id} style={{
                ...fadeStyle('pric', i * 0.1),
                position: 'relative',
                padding: pkg.popular ? '36px 28px 28px' : '28px',
                borderRadius: 22,
                background: CARD,
                border: `1px solid ${pkg.border}`,
                boxShadow: pkg.popular ? `0 0 40px ${pkg.bg}, 0 16px 48px rgba(0,0,0,0.3)` : '0 4px 20px rgba(0,0,0,0.2)',
                outline: pkg.popular ? `2px solid ${pkg.border}` : 'none',
                outlineOffset: 2,
              }}>
                {pkg.badge && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    padding: '5px 20px', borderRadius: 999, whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
                    color: '#fff', fontSize: 12, fontWeight: 900,
                  }}>{pkg.badge}</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{pkg.icon}</span>
                      <span style={{ color: '#64748b', fontSize: 13 }}>{pkg.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 42, fontWeight: 900, color: pkg.color, lineHeight: 1 }}>{pkg.credits}</span>
                      <span style={{ color: '#475569', fontSize: 13 }}>créditos</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{pkg.price}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>via PIX</div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
                    {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''} SMART
                  </span>
                  <span style={{ color: pkg.color, fontSize: 12, fontWeight: 700 }}>
                    R$ {(pkg.priceNum / pkg.queries).toFixed(2)}/cada
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{ color: pkg.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={`/comprar?pacote=${pkg.id}`}>
                  <button style={{
                    width: '100%', padding: '13px 20px', borderRadius: 12,
                    background: pkg.btnBg, boxShadow: `0 4px 20px ${pkg.btnShadow}`,
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    border: 'none', cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}>
                    Comprar {pkg.name}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
            {['💚 Pagamento via PIX','⚡ Créditos em segundos','🔒 Mercado Pago','🔄 Sem mensalidade'].map(t => (
              <span key={t} style={{ fontSize: 13, color: '#475569' }}>{t}</span>
            ))}
          </div>

          {/* ── Comparativo de relatórios ── */}
          <div style={{ maxWidth: 780, margin: '64px auto 0', background: '#0a1628', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Qual relatório escolher?</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Compare o que cada tipo de consulta oferece</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Header */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recurso</span>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.08)', padding: '14px 16px', borderBottom: '1px solid rgba(59,130,246,0.2)', borderRight: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ color: '#60a5fa', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 2 }}>🔍 SMART</div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>16 créditos</div>
              </div>
              <div style={{ background: 'rgba(139,92,246,0.1)', padding: '14px 16px', borderBottom: '1px solid rgba(139,92,246,0.3)', textAlign: 'center', position: 'relative' }}>
                <div style={{ color: '#a78bfa', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 2 }}>💎 PREMIUM</div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>35 créditos</div>
              </div>
              {/* Rows */}
              {[
                { label: 'Score Anti-Bomba',        smart: '✅', premium: '✅' },
                { label: 'Sinistro + Gravame',       smart: '✅', premium: '✅' },
                { label: 'Preço Justo IA',            smart: '✅', premium: '✅' },
                { label: 'Restrições DETRAN',        smart: '✅', premium: '✅' },
                { label: 'Relatório PDF',             smart: '✅', premium: '✅' },
                { label: 'Histórico de leilão',      smart: '—',  premium: '✅' },
                { label: 'Recall do fabricante',     smart: '—',  premium: '✅' },
                { label: 'Fotos oficiais',            smart: '—',  premium: '✅' },
                { label: 'Ficha técnica completa',   smart: '—',  premium: '✅' },
                { label: 'Débitos IPVA e multas',    smart: '—',  premium: '✅' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div style={{ padding: '12px 16px', borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderRight: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{row.label}</span>
                  </div>
                  <div style={{ padding: '12px 16px', borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderRight: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(59,130,246,0.03)' : 'rgba(59,130,246,0.05)', textAlign: 'center' as const }}>
                    <span style={{ color: row.smart === '✅' ? '#4ade80' : '#334155', fontSize: 16 }}>{row.smart}</span>
                  </div>
                  <div style={{ padding: '12px 16px', borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.07)', textAlign: 'center' as const }}>
                    <span style={{ color: row.premium === '✅' ? '#a78bfa' : '#334155', fontSize: 16 }}>{row.premium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg,#030712,#060c18)', padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#fbbf24', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>Depoimentos</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              Quem usa,{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                recomenda
              </span>
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0' }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#fbbf24', fontSize: 18 }}>{s}</span>)}
            </div>
            <p style={{ color: '#64748b', fontSize: 14 }}>4.9/5 baseado em +2.400 avaliações</p>
          </div>

          <div ref={testRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            {[
              { name:'Carlos Mendes',   city:'São Paulo, SP',       init:'CM', g1:'#3b82f6', g2:'#1d4ed8', text:'Descobri que o carro tinha gravame antes de fechar negócio. Economizei R$ 12.000 numa furada que quase caí!', saved:'Economizou R$ 12k',       vehicle:'Honda Civic 2019' },
              { name:'Ana Paula Ramos', city:'Rio de Janeiro, RJ',  init:'AP', g1:'#8b5cf6', g2:'#6d28d9', text:'O score mostrou sinistro em um carro que o vendedor disse estar impecável. Relatório provou a mentira.',     saved:'Golpe evitado',             vehicle:'Toyota Corolla 2021' },
              { name:'Roberto Silva',   city:'Curitiba, PR',         init:'RS', g1:'#10b981', g2:'#059669', text:'Usei o preço justo para negociar e consegui R$ 8.000 de desconto porque o carro tinha restrição.',        saved:'Negociou R$ 8k a menos',   vehicle:'Chevrolet Onix 2022' },
              { name:'Fernanda Costa',  city:'Belo Horizonte, MG',  init:'FC', g1:'#ec4899', g2:'#be185d', text:'Interface incrível, resultado em segundos. Muito melhor do que outros serviços. Super recomendo!',         saved:'3 consultas realizadas',   vehicle:'VW Polo 2020' },
              { name:'Lucas Almeida',   city:'Porto Alegre, RS',    init:'LA', g1:'#f59e0b', g2:'#d97706', text:'O PDF do relatório é excelente. Imprimi e levei pro despachante. Ficou impressionado com a qualidade.',    saved:'Compra tranquila',          vehicle:'Jeep Renegade 2021' },
              { name:'Mariana Torres',  city:'Brasília, DF',        init:'MT', g1:'#06b6d4', g2:'#0891b2', text:'Fiz 4 consultas antes de achar o carro ideal. O score me ajudou a descartar os problemáticos rapidinho.', saved:'4 consultas, 1 certa',      vehicle:'Hyundai Creta 2022' },
            ].map((t, i) => (
              <div key={i} style={{
                ...fadeStyle('test', i * 0.08),
                padding: 22, borderRadius: 18,
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#fbbf24', fontSize: 13 }}>{s}</span>)}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>"{t.text}"</p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 999, marginBottom: 16,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  color: '#34d399', fontSize: 11, fontWeight: 700,
                }}>✓ {t.saved}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg,${t.g1},${t.g2})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 12,
                  }}>{t.init}</div>
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{t.name}</p>
                    <p style={{ color: '#475569', fontSize: 11 }}>{t.city} · {t.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section id="faq" style={{ background: BG2, padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
              color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>FAQ</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              Perguntas{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                frequentes
              </span>
            </h2>
          </div>

          <div ref={faqRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon:'🛡️', q:'Os dados são oficiais?',                a:'Sim. Consultamos DETRAN, DENATRAN e SERASA em tempo real para garantir a precisão de cada relatório.' },
              { icon:'⏱️', q:'Os créditos têm validade?',              a:'Pacote Inicial: 30 dias. Recomendado: 60 dias. Inteligente: 90 dias. Créditos não usados expiram.' },
              { icon:'📍', q:'Funciona com qualquer placa?',           a:'Sim, formatos Mercosul (ABC1D23) e antigo (ABC1234), de qualquer estado do Brasil.' },
              { icon:'🔍', q:'Substitui vistoria cautelar?',           a:'Não. É análise de dados eletrônicos. Para compra segura, recomendamos também a vistoria presencial.' },
              { icon:'💳', q:'Quais formas de pagamento?',             a:'PIX via Mercado Pago. Pagamento instantâneo e créditos liberados automaticamente em segundos.' },
              { icon:'🎁', q:'Ganho créditos ao me cadastrar?',        a:'Sim! Todo novo usuário recebe 5 créditos de bônus ao criar a conta.' },
              { icon:'👤', q:'Preciso de cadastro para a prévia?',     a:'Não. Prévia grátis (marca, modelo, ano, FIPE) sem cadastro. Relatório SMART requer conta e créditos.' },
            ].map((f, i) => (
              <div
                key={i}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${faqOpen === i ? 'rgba(59,130,246,0.3)' : BORDER}`,
                  background: faqOpen === i ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.25s, background 0.25s',
                  overflow: 'hidden',
                  ...fadeStyle('faq', i * 0.06),
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: faqOpen === i ? '#fff' : '#cbd5e1' }}>{f.q}</span>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: faqOpen === i ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: faqOpen === i ? 'rotate(45deg)' : 'none',
                    transition: 'background 0.25s, transform 0.25s',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path strokeLinecap="round" d="M12 4v16M4 12h16" />
                    </svg>
                  </div>
                </div>
                {faqOpen === i && (
                  <div style={{ padding: '0 20px 16px 52px', color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: '96px 24px',
        background: 'linear-gradient(135deg,#0d1829,#0a1628,#060c18)',
        overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '20%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(59,130,246,0.10),transparent)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999, marginBottom: 28,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: 13, fontWeight: 600,
          }}>⚠️ Não arrisque seu dinheiro</div>

          <h2 style={{
            fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900,
            color: '#fff', lineHeight: 1.1, marginBottom: 20,
          }}>
            Cada consulta pode te{' '}
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              economizar milhares
            </span>
          </h2>

          <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Por <strong style={{ color: '#fff' }}>R$ 15,99</strong> você descobre tudo antes de comprar.
            Evite prejuízos de <strong style={{ color: '#fff' }}>R$ 20.000 ou mais</strong>.
          </p>

          {/* CTA plate input */}
          <div style={{ maxWidth: 460, margin: '0 auto 24px' }}>
            <PlateInput
              value={plate} onChange={v => { setPlate(v); setError('') }}
              onSearch={handleSearch} loading={loading} error={error} size="small"
            />
            <button
              onClick={handleSearch}
              style={{
                marginTop: 10, width: '100%',
                padding: '14px 24px', borderRadius: 13,
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                boxShadow: '0 4px 24px rgba(37,99,235,0.35)',
                color: '#fff', fontWeight: 700, fontSize: 16,
                border: 'none', cursor: 'pointer',
              }}
            >
              Ver score do carro grátis
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 32 }}>
            {['🔍 48k+ consultas','🛡️ 94% golpes evitados','⭐ 4.9/5 avaliação'].map(t => (
              <span key={t} style={{ fontSize: 13, color: '#475569' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
