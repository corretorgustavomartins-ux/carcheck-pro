'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'

/* ─────────────────────────────────────────
   SCORE RING
───────────────────────────────────────── */
function ScoreRing({ target = 87 }: { target?: number }) {
  const [score, setScore] = useState(0)
  const r = 54, circ = 2 * Math.PI * r

  useEffect(() => {
    const delay = setTimeout(() => {
      let v = 0
      const iv = setInterval(() => {
        v += 2
        if (v >= target) { setScore(target); clearInterval(iv) }
        else setScore(v)
      }, 20)
      return () => clearInterval(iv)
    }, 600)
    return () => clearTimeout(delay)
  }, [target])

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const offset = circ - (score / 100) * circ

  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.04s linear, stroke 0.4s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color }}>{score}</span>
        <span style={{ fontSize: 10, color: '#64748b' }}>/100</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PLATE INPUT
───────────────────────────────────────── */
function PlateInput({ value, onChange, onSearch, loading, error }: {
  value: string; onChange: (v: string) => void
  onSearch: () => void; loading?: boolean; error?: string
}) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'stretch', borderRadius: 14,
        overflow: 'hidden', border: '2px solid rgba(255,255,255,0.10)',
        background: '#0d1829', marginBottom: error ? 8 : 0,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 10px', gap: 3, flexShrink: 0,
          background: '#1d4ed8',
        }}>
          <span style={{ color: '#fde047', fontWeight: 900, fontSize: 9, letterSpacing: '0.15em' }}>BR</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {[0,1,2,3].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(253,224,71,0.5)' }} />)}
          </div>
        </div>
        <input
          type="text" value={value}
          onChange={e => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
            if (raw.length <= 7) onChange(raw.length > 3 ? `${raw.slice(0,3)}-${raw.slice(3)}` : raw)
          }}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          placeholder="ABC-1D23" maxLength={8} spellCheck={false} autoComplete="off"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '14px 12px', fontSize: 'clamp(20px, 5vw, 26px)',
            fontWeight: 900, letterSpacing: '0.25em', color: '#fff',
            textTransform: 'uppercase', caretColor: '#3b82f6', minWidth: 0,
          }}
        />
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, margin: '4px 0 0 4px' }}>⚠ {error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()
  const [plate, setPlate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [vis, setVis] = useState<Record<string, boolean>>({})

  const howRef  = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const pricRef = useRef<HTMLDivElement>(null)
  const testRef = useRef<HTMLDivElement>(null)
  const faqRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pairs = [
      { ref: howRef, key: 'how' }, { ref: featRef, key: 'feat' },
      { ref: pricRef, key: 'pric' }, { ref: testRef, key: 'test' },
      { ref: faqRef, key: 'faq' },
    ]
    const obs = pairs.map(({ ref, key }) => {
      const o = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setVis(p => ({ ...p, [key]: true }))
      }, { threshold: 0.08 })
      if (ref.current) o.observe(ref.current)
      return o
    })
    return () => obs.forEach(o => o.disconnect())
  }, [])

  function validate(raw: string) {
    return /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(raw) || /^[A-Z]{3}[0-9]{4}$/.test(raw)
  }

  function handleSearch() {
    const clean = plate.replace(/-/g, '')
    if (!validate(clean)) { setError('Placa inválida. Ex: ABC-1D23 ou ABC-1234'); return }
    setLoading(true)
    router.push(`/selecionar-consulta?placa=${clean}`)
  }

  const fade = (key: string, delay = 0): React.CSSProperties => ({
    opacity: vis[key] ? 1 : 0,
    transform: vis[key] ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  })

  const BG1 = '#060c18', BG2 = '#030712'
  const CARD = 'rgba(13,24,41,0.9)', BORDER = 'rgba(255,255,255,0.07)'

  return (
    <div style={{ background: BG2, minHeight: '100vh', overflowX: 'hidden', paddingTop: 'clamp(56px, 4vw, 64px)' }}>

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        background: `linear-gradient(135deg,${BG1} 0%,#0d1829 60%,${BG1} 100%)`,
        overflow: 'hidden',
      }}>
        {/* grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.04) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }} />
        <div style={{ position: 'absolute', top: '10%', left: '0%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '8%', right: '0%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.10),transparent 70%)', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,6vw,80px) clamp(16px,4vw,32px)' }}>

          {/* 2-col on large, 1-col on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>

            {/* LEFT */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                borderRadius: 999, padding: '5px 14px', marginBottom: 24,
                border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)',
                color: '#93c5fd', fontSize: 12, fontWeight: 600,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 0 3px rgba(96,165,250,0.3)', display: 'inline-block' }} />
                Score Anti-Bomba em tempo real
              </div>

              <h1 style={{ fontSize: 'clamp(32px,6vw,58px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
                Descubra se o carro é{' '}
                <span style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  bomba
                </span>{' '}
                antes de comprar
              </h1>

              <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#94a3b8', marginBottom: 28, lineHeight: 1.7, maxWidth: 480 }}>
                Consulte <strong style={{ color: '#e2e8f0' }}>sinistro, gravame e FIPE</strong> em segundos.
                Receba um <strong style={{ color: '#e2e8f0' }}>Score 0–100</strong> e o{' '}
                <strong style={{ color: '#e2e8f0' }}>preço justo</strong> para negociar.
              </p>

              <div style={{ maxWidth: 440, marginBottom: 20 }}>
                <PlateInput value={plate} onChange={v => { setPlate(v); setError('') }} onSearch={handleSearch} loading={loading} error={error} />
                <button
                  onClick={handleSearch} disabled={loading}
                  style={{
                    marginTop: 10, width: '100%', padding: 'clamp(13px,3vw,16px) 24px',
                    borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                    boxShadow: '0 4px 24px rgba(37,99,235,0.4)', color: '#fff',
                    fontWeight: 700, fontSize: 'clamp(15px,2.5vw,17px)',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'opacity 0.2s',
                  }}>
                  {loading ? '⏳ Consultando...' : '🔍 Ver score do carro grátis'}
                </button>
                <p style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: '#475569' }}>
                  🔓 Prévia grátis · 16 cr. para relatório completo
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {['🛡️ Dados DETRAN','⚡ Resultado em 2s','🔒 100% seguro'].map(t => (
                  <span key={t} style={{ fontSize: 11, color: '#64748b' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* RIGHT — mock card, esconde em telas muito pequenas via CSS var */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: 340,
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 22, padding: 'clamp(16px,3vw,24px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.06)',
              }}>
                {/* header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <p style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 3 }}>Relatório SMART</p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Toyota Corolla 2020</p>
                    <p style={{ color: '#64748b', fontSize: 11 }}>São Paulo, SP</p>
                  </div>
                  <div style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', fontFamily: 'monospace', fontSize: 11 }}>
                    ABC-1D23
                  </div>
                </div>

                {/* score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <ScoreRing target={87} />
                  <div>
                    <p style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>Classificação</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 9, marginBottom: 5, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 12 }}>Compra Segura</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#475569' }}>Risco mínimo detectado</p>
                  </div>
                </div>

                {/* rows */}
                {[
                  { l: 'Sinistro', v: 'Sem registro', ok: true },
                  { l: 'Gravame',  v: 'Livre',         ok: true },
                  { l: 'Restrições', v: 'Nenhuma',    ok: true },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 9, marginBottom: 5, background: 'rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.l}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />{r.v}
                    </span>
                  </div>
                ))}

                {/* price */}
                <div style={{ marginTop: 12, padding: 13, borderRadius: 13, background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(6,182,212,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#64748b', marginBottom: 1 }}>Preço Justo IA</p>
                      <p style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, color: '#fff' }}>R$ 98.500</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10, color: '#475569', marginBottom: 1 }}>FIPE</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>R$ 98.500</p>
                    </div>
                  </div>
                  <div style={{ padding: '5px 9px', borderRadius: 7, background: 'rgba(34,197,94,0.12)', fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
                    ✅ Preço alinhado ao mercado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid ${BORDER}`, background: 'rgba(6,12,24,0.85)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(14px,2vw,20px) clamp(16px,4vw,32px)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center' }}>
            {[
              { v: '48k+',   l: 'Consultas' },
              { v: '94%',    l: 'Golpes evitados' },
              { v: 'R$2.4M', l: 'Economizados' },
              { v: '4.9⭐',  l: 'Avaliação' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 900, color: '#fff' }}>{s.v}</div>
                <div style={{ fontSize: 'clamp(9px,2vw,11px)', color: '#64748b' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section id="como-funciona" style={{ background: BG2, padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel color="#60a5fa" bg="rgba(59,130,246,0.1)" border="rgba(59,130,246,0.2)">Como funciona</SectionLabel>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            De zero ao relatório em{' '}
            <GradText>menos de 2 minutos</GradText>
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px,2vw,16px)', maxWidth: 440, margin: '0 auto 48px', textAlign: 'center' }}>
            Processo 100% digital, seguro e instantâneo.
          </p>

          <div ref={howRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16 }}>
            {[
              { n:'01', emoji:'🔍', title:'Digite a placa',      desc:'Formato Mercosul ou antigo. Qualquer placa brasileira.', color:'#3b82f6', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.2)' },
              { n:'02', emoji:'👁️', title:'Prévia grátis',       desc:'Marca, modelo, ano e faixa FIPE — sem custo algum.',     color:'#06b6d4', bg:'rgba(6,182,212,0.08)',  border:'rgba(6,182,212,0.2)' },
              { n:'03', emoji:'💳', title:'Escolha o relatório', desc:'SMART (16 cr.) ou PREMIUM (35 cr.) com fotos e recall.', color:'#8b5cf6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.2)' },
              { n:'04', emoji:'🏆', title:'Negocie com poder',   desc:'Apresente o relatório e negocie com dados oficiais.',    color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' },
            ].map((s, i) => (
              <div key={i} style={{ ...fade('how', i * 0.1), padding: 'clamp(18px,3vw,28px)', borderRadius: 18, background: s.bg, border: `1px solid ${s.border}`, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>{s.emoji}</div>
                <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: s.color, fontSize: 9, fontWeight: 900, marginBottom: 8, letterSpacing: '0.1em' }}>PASSO {s.n}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 7 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ background: 'linear-gradient(180deg,#030712,#060c18)', padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel color="#a78bfa" bg="rgba(139,92,246,0.1)" border="rgba(139,92,246,0.2)">Funcionalidades</SectionLabel>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            Proteção completa na <GradText>compra do seu carro</GradText>
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px,2vw,16px)', maxWidth: 440, margin: '0 auto 48px', textAlign: 'center' }}>
            Não é só consulta de placa — é proteção completa.
          </p>

          <div ref={featRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
            {[
              { emoji:'🏆', title:'Score Anti-Bomba',     desc:'Algoritmo exclusivo 0–100 que analisa sinistro, gravame, restrições e idade.', tag:'Exclusivo', color:'#f59e0b', bg:'rgba(245,158,11,0.06)',  border:'rgba(245,158,11,0.15)' },
              { emoji:'💰', title:'Preço Justo IA',        desc:'Motor inteligente que sugere o valor ideal baseado na FIPE e condição geral.', tag:'IA',        color:'#60a5fa', bg:'rgba(59,130,246,0.06)',  border:'rgba(59,130,246,0.15)' },
              { emoji:'🚨', title:'Detector de Sinistro', desc:'Acidentes, perda total, colisões e histórico de indenizações nas bases oficiais.', tag:'Proteção',  color:'#f87171', bg:'rgba(239,68,68,0.06)',   border:'rgba(239,68,68,0.15)' },
              { emoji:'🔒', title:'Gravame',               desc:'Financiamentos ativos, alienação fiduciária e restrições financeiras.',       tag:'Segurança', color:'#c084fc', bg:'rgba(139,92,246,0.06)', border:'rgba(139,92,246,0.15)' },
              { emoji:'📄', title:'Relatório PDF',         desc:'Relatório profissional completo para apresentar ao vendedor.',                tag:'Download',  color:'#34d399', bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.15)' },
              { emoji:'📍', title:'Dados Oficiais',        desc:'Cruzamento de DETRAN, DENATRAN e SERASA para máxima precisão.',              tag:'Confiável', color:'#22d3ee', bg:'rgba(6,182,212,0.06)',  border:'rgba(6,182,212,0.15)' },
            ].map((f, i) => (
              <div key={i} style={{ ...fade('feat', i * 0.07), padding: 'clamp(16px,3vw,24px)', borderRadius: 16, background: f.bg, border: `1px solid ${f.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{f.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: f.bg, border: `1px solid ${f.border}`, color: f.color }}>{f.tag}</span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 7 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pacotes" style={{ background: BG2, padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionLabel color="#34d399" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.2)">Planos & Preços</SectionLabel>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            Simples, sem <GradText>assinaturas</GradText>
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px,2vw,16px)', maxWidth: 400, margin: '0 auto 48px', textAlign: 'center' }}>
            Compre créditos uma vez e use quando precisar.
          </p>

          <div ref={pricRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 18, marginBottom: 40 }}>
            {[
              {
                id: 'starter', name: 'Consulta SMART', credits: 26, queries: 1, queriesCompleto: 0,
                price: 'R$ 25,99', priceNum: 25.99, icon: '🔍', popular: false, badge: null,
                color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)',
                btn: 'linear-gradient(135deg,#059669,#10b981)', btnS: 'rgba(16,185,129,0.3)',
                features: ['1 consulta SMART completa','Score Anti-Bomba 0–100','Sinistro + Gravame + Restrições','Histórico roubo e furto','Preço Justo IA','PDF incluído'],
              },
              {
                id: 'recommended', name: 'Completo + Leilão', credits: 49, queries: 0, queriesCompleto: 1,
                price: 'R$ 48,90', priceNum: 48.90, icon: '🏆', popular: true, badge: '⭐ Mais recomendado',
                color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.35)',
                btn: 'linear-gradient(135deg,#d97706,#f59e0b)', btnS: 'rgba(245,158,11,0.35)',
                features: ['1 consulta COMPLETA com leilão','Histórico completo de leilão','Classificação (A, B, C, D)','Score Anti-Bomba 0–100','Débitos IPVA e multas','Recall do fabricante','Preço Justo IA','PDF incluído'],
              },
              {
                id: 'pro', name: 'Profissional', credits: 98, queries: 0, queriesCompleto: 2,
                price: 'R$ 89,90', priceNum: 89.90, icon: '💼', popular: false, badge: null,
                color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)',
                btn: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', btnS: 'rgba(139,92,246,0.3)',
                features: ['2 consultas COMPLETAS com leilão','Tudo do plano Completo','Score Anti-Bomba 0–100','PDF incluído','Histórico salvo no painel'],
              },
            ].map((pkg, i) => (
              <div key={pkg.id} style={{
                ...fade('pric', i * 0.1),
                position: 'relative',
                padding: pkg.popular ? 'clamp(28px,4vw,36px) clamp(18px,3vw,28px) clamp(18px,3vw,28px)' : 'clamp(18px,3vw,28px)',
                borderRadius: 20, background: CARD,
                border: `1px solid ${pkg.border}`,
                boxShadow: pkg.popular ? `0 0 40px ${pkg.bg},0 16px 48px rgba(0,0,0,0.3)` : '0 4px 20px rgba(0,0,0,0.2)',
                outline: pkg.popular ? `2px solid ${pkg.border}` : 'none', outlineOffset: 2,
              }}>
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 18px', borderRadius: 999, whiteSpace: 'nowrap', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', color: '#fff', fontSize: 11, fontWeight: 900 }}>{pkg.badge}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ fontSize: 18 }}>{pkg.icon}</span>
                      <span style={{ color: '#64748b', fontSize: 12 }}>{pkg.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <span style={{ fontSize: 'clamp(32px,5vw,42px)', fontWeight: 900, color: pkg.color, lineHeight: 1 }}>{pkg.credits}</span>
                      <span style={{ color: '#475569', fontSize: 12 }}>créditos</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{pkg.price}</div>
                    <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>via PIX</div>
                  </div>
                </div>

                <div style={{ padding: '9px 12px', borderRadius: 9, marginBottom: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>
                    {pkg.queriesCompleto > 0
                      ? `${pkg.queriesCompleto} consulta${pkg.queriesCompleto > 1 ? 's' : ''} Completa${pkg.queriesCompleto > 1 ? 's' : ''} + Leilão`
                      : `${pkg.queries} consulta SMART`}
                  </span>
                  <span style={{ color: pkg.color, fontSize: 11, fontWeight: 700 }}>
                    {pkg.queriesCompleto > 0
                      ? `R$ ${(pkg.priceNum / pkg.queriesCompleto).toFixed(2)}/cada`
                      : `R$ ${pkg.priceNum.toFixed(2)}`}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: '#94a3b8' }}>
                      <span style={{ color: pkg.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>

                <Link href={`/comprar?pacote=${pkg.id}`}>
                  <button style={{ width: '100%', padding: '12px 18px', borderRadius: 11, background: pkg.btn, boxShadow: `0 4px 20px ${pkg.btnS}`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                    Adquirir — {pkg.price}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 56 }}>
            {['💚 PIX','⚡ Créditos na hora','🔒 Mercado Pago','🔄 Sem mensalidade'].map(t => (
              <span key={t} style={{ fontSize: 12, color: '#475569' }}>{t}</span>
            ))}
          </div>

          {/* Tabela comparativa SMART vs PREMIUM */}
          <div style={{ maxWidth: 700, margin: '0 auto', background: '#0a1628', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 'clamp(20px,4vw,40px) clamp(16px,3vw,32px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h3 style={{ color: '#fff', fontSize: 'clamp(18px,3vw,22px)', fontWeight: 900, marginBottom: 6 }}>Qual relatório escolher?</h3>
              <p style={{ color: '#64748b', fontSize: 13 }}>Compare SMART vs COMPLETO + LEILÃO</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Th style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}><span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const }}>Recurso</span></Th>
              <Th style={{ background: 'rgba(59,130,246,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' as const }}>
                <div style={{ color: '#60a5fa', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' as const }}>🔍 SMART</div>
                <div style={{ color: '#fff', fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 900 }}>26 cr.</div>
                <div style={{ color: '#475569', fontSize: 10 }}>R$ 25,99</div>
              </Th>
              <Th style={{ background: 'rgba(245,158,11,0.1)', textAlign: 'center' as const }}>
                <div style={{ color: '#fbbf24', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' as const }}>🏆 COMPLETO</div>
                <div style={{ color: '#fff', fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 900 }}>49 cr.</div>
                <div style={{ color: '#475569', fontSize: 10 }}>R$ 48,90</div>
              </Th>
              {[
                ['Score Anti-Bomba','✅','✅'],['Sinistro + Perda Total','✅','✅'],
                ['Gravame (alienação)','✅','✅'],['Restrições federais','✅','✅'],
                ['Roubo / Furto','✅','✅'],['Preço Justo IA','✅','✅'],
                ['PDF do relatório','✅','✅'],['Histórico de leilão','—','✅'],
                ['Classificação leilão (A-D)','—','✅'],['Débitos IPVA/multas','—','✅'],
                ['Recall fabricante','—','✅'],['Renavam','—','—'],
              ].map(([label, smart, completo], i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <Td alt={i%2===1} border><span style={{ color: '#94a3b8', fontSize: 'clamp(11px,2vw,13px)' }}>{label}</span></Td>
                  <Td alt={i%2===1} border smartCol><span style={{ color: smart==='✅'?'#4ade80':'#334155', fontSize: 15 }}>{smart}</span></Td>
                  <Td alt={i%2===1} premiumCol><span style={{ color: completo==='✅'?'#fbbf24':'#334155', fontSize: 15 }}>{completo}</span></Td>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ background: 'linear-gradient(180deg,#030712,#060c18)', padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel color="#fbbf24" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)">Depoimentos</SectionLabel>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 6 }}>
            Quem usa, <GradText>recomenda</GradText>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0 6px' }}>
            {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#fbbf24', fontSize: 17 }}>{s}</span>)}
          </div>
          <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 48 }}>4.9/5 baseado em +2.400 avaliações</p>

          <div ref={testRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
            {[
              { name:'Carlos Mendes',   city:'São Paulo, SP',      init:'CM', g1:'#3b82f6', g2:'#1d4ed8', text:'Descobri que o carro tinha gravame antes de fechar negócio. Economizei R$ 12.000 numa furada!', saved:'Economizou R$ 12k', vehicle:'Honda Civic 2019' },
              { name:'Ana Paula Ramos', city:'Rio de Janeiro, RJ', init:'AP', g1:'#8b5cf6', g2:'#6d28d9', text:'O score mostrou sinistro em um carro que o vendedor disse estar impecável. Relatório provou a mentira.', saved:'Golpe evitado', vehicle:'Toyota Corolla 2021' },
              { name:'Roberto Silva',   city:'Curitiba, PR',        init:'RS', g1:'#10b981', g2:'#059669', text:'Usei o preço justo para negociar e consegui R$ 8.000 de desconto porque o carro tinha restrição.', saved:'Negociou R$ 8k a menos', vehicle:'Chevrolet Onix 2022' },
              { name:'Fernanda Costa',  city:'Belo Horizonte, MG', init:'FC', g1:'#ec4899', g2:'#be185d', text:'Interface incrível, resultado em segundos. Muito melhor que outros serviços. Super recomendo!', saved:'3 consultas realizadas', vehicle:'VW Polo 2020' },
              { name:'Lucas Almeida',   city:'Porto Alegre, RS',   init:'LA', g1:'#f59e0b', g2:'#d97706', text:'O PDF do relatório é excelente. Imprimi e levei pro despachante. Ficou impressionado com a qualidade.', saved:'Compra tranquila', vehicle:'Jeep Renegade 2021' },
              { name:'Mariana Torres',  city:'Brasília, DF',       init:'MT', g1:'#06b6d4', g2:'#0891b2', text:'Fiz 4 consultas antes de achar o carro ideal. O score me ajudou a descartar os problemáticos rapidinho.', saved:'4 consultas, 1 certa', vehicle:'Hyundai Creta 2022' },
            ].map((t, i) => (
              <div key={i} style={{ ...fade('test', i * 0.08), padding: 'clamp(16px,3vw,22px)', borderRadius: 16, background: 'rgba(15,23,42,0.6)', border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#fbbf24', fontSize: 12 }}>{s}</span>)}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>"{t.text}"</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, marginBottom: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 10, fontWeight: 700 }}>✓ {t.saved}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg,${t.g1},${t.g2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>{t.init}</div>
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12 }}>{t.name}</p>
                    <p style={{ color: '#475569', fontSize: 10 }}>{t.city} · {t.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ background: BG2, padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel color="#94a3b8" bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.1)">FAQ</SectionLabel>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 48 }}>
            Perguntas <GradText>frequentes</GradText>
          </h2>

          <div ref={faqRef} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { icon:'🛡️', q:'Os dados são oficiais?',              a:'Sim. Consultamos DETRAN, DENATRAN e SERASA em tempo real para garantir precisão.' },
              { icon:'⏱️', q:'Os créditos têm validade?',            a:'Sim, os créditos têm validade conforme o pacote adquirido. Consulte os detalhes de cada plano.' },
              { icon:'📍', q:'Funciona com qualquer placa?',         a:'Sim, Mercosul (ABC1D23) e antigo (ABC1234), de qualquer estado do Brasil.' },
              { icon:'🔍', q:'Substitui vistoria cautelar?',         a:'Não. É análise eletrônica. Para compra segura, recomendamos também vistoria presencial.' },
              { icon:'💳', q:'Quais formas de pagamento?',           a:'PIX via Mercado Pago. Pagamento instantâneo e créditos liberados automaticamente.' },
              { icon:'🎁', q:'Ganho créditos ao me cadastrar?',      a:'Sim! Todo novo usuário recebe 5 créditos de bônus ao criar a conta.' },
              { icon:'👤', q:'Preciso de cadastro para a prévia?',   a:'Não. A prévia grátis não exige conta. O relatório SMART/Premium requer cadastro.' },
            ].map((f, i) => (
              <div key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{ ...fade('faq', i * 0.06), borderRadius: 12, cursor: 'pointer', border: `1px solid ${faqOpen === i ? 'rgba(59,130,246,0.3)' : BORDER}`, background: faqOpen === i ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s,background 0.2s', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'clamp(12px,2vw,16px) clamp(14px,3vw,20px)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 'clamp(12px,2vw,14px)', color: faqOpen === i ? '#fff' : '#cbd5e1' }}>{f.q}</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: faqOpen === i ? '#3b82f6' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: faqOpen === i ? 'rotate(45deg)' : 'none', transition: 'background 0.2s,transform 0.2s' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" d="M12 4v16M4 12h16" /></svg>
                  </div>
                </div>
                {faqOpen === i && (
                  <div style={{ padding: '0 clamp(14px,3vw,20px) 14px clamp(40px,7vw,52px)', color: '#64748b', fontSize: 12, lineHeight: 1.7 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ position: 'relative', padding: 'clamp(60px,8vw,96px) clamp(16px,4vw,24px)', background: 'linear-gradient(135deg,#0d1829,#0a1628,#060c18)', overflow: 'hidden', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ position: 'absolute', top: '-20%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.10),transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, marginBottom: 24, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>⚠️ Não arrisque seu dinheiro</div>
          <h2 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 18 }}>
            Cada consulta pode te{' '}
            <GradText>economizar milhares</GradText>
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(14px,2vw,17px)', lineHeight: 1.7, marginBottom: 36 }}>
            Por <strong style={{ color: '#fff' }}>R$ 25,99</strong> você descobre tudo antes de comprar.
            Evite prejuízos de <strong style={{ color: '#fff' }}>R$ 20.000 ou mais</strong>.
          </p>
          <div style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            <PlateInput value={plate} onChange={v => { setPlate(v); setError('') }} onSearch={handleSearch} loading={loading} error={error} />
            <button onClick={handleSearch} style={{ marginTop: 10, width: '100%', padding: 'clamp(12px,2vw,14px) 24px', borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 24px rgba(37,99,235,0.35)', color: '#fff', fontWeight: 700, fontSize: 'clamp(14px,2.5vw,16px)', border: 'none', cursor: 'pointer' }}>
              Ver score do carro grátis
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
            {['🔍 48k+ consultas','🛡️ 94% golpes evitados','⭐ 4.9/5 avaliação'].map(t => (
              <span key={t} style={{ fontSize: 12, color: '#475569' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ─── Helper components ─── */
function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  )
}

function SectionLabel({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, background: bg, border: `1px solid ${border}`, color, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {children}
      </span>
    </div>
  )
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: 'clamp(10px,2vw,14px) clamp(10px,2vw,16px)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', ...style }}>
      {children}
    </div>
  )
}

function Td({ children, alt, border, smartCol, premiumCol }: { children: React.ReactNode; alt?: boolean; border?: boolean; smartCol?: boolean; premiumCol?: boolean }) {
  return (
    <div style={{
      padding: 'clamp(9px,1.5vw,12px) clamp(10px,2vw,16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      borderRight: border ? '1px solid rgba(255,255,255,0.06)' : undefined,
      background: smartCol
        ? (alt ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.03)')
        : premiumCol
        ? (alt ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.04)')
        : (alt ? 'rgba(255,255,255,0.015)' : 'transparent'),
      textAlign: (smartCol || premiumCol) ? 'center' as const : undefined,
    }}>
      {children}
    </div>
  )
}
