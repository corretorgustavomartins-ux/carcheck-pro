'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Animated Score Ring ─── */
function ScoreRing() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0
      const id = setInterval(() => {
        v += 2
        if (v >= 87) { setScore(87); clearInterval(id) }
        else setScore(v)
      }, 18)
      return () => clearInterval(id)
    }, 800)
    return () => clearTimeout(t)
  }, [])

  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="58" cy="58" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black leading-none" style={{ color }}>{score}</span>
        <span className="text-slate-400 text-[10px]">/100</span>
      </div>
    </div>
  )
}

/* ─── Status Row ─── */
function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <span className="text-slate-400 text-xs">{label}</span>
      <span className={`text-xs font-semibold flex items-center gap-1.5 ${ok ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
        {value}
      </span>
    </div>
  )
}

/* ─── Main Hero ─── */
export function HeroSection() {
  const router = useRouter()
  const [plate, setPlate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (raw.length <= 7) {
      setError('')
      setPlate(raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw)
    }
  }

  const handleSearch = () => {
    const clean = plate.replace(/-/g, '')
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean)
    const old = /^[A-Z]{3}[0-9]{4}$/.test(clean)
    if (!mercosul && !old) {
      setError('Placa inválida. Ex: ABC-1D23 ou ABC-1234')
      inputRef.current?.focus()
      return
    }
    setLoading(true)
    router.push(`/resultado?placa=${clean}`)
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center"
      style={{ background: 'linear-gradient(135deg, #060c18 0%, #0d1829 50%, #060c18 100%)', overflow: 'hidden' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      {/* Blue blob top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', left: '2%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Purple blob bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '10%', right: '2%',
          width: '480px', height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Main content */}
      <div
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '7rem', paddingBottom: '5rem', zIndex: 10 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="text-center lg:text-left">

            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 text-blue-300 text-sm font-medium"
              style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)' }}
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              Score Anti-Bomba em tempo real
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
              Descubra se o carro é{' '}
              <span style={{
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                bomba
              </span>{' '}
              antes de comprar
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Consulte <strong className="text-white">sinistro, gravame e FIPE</strong> em segundos.
              Receba um <strong className="text-white">Score 0–100</strong> e o{' '}
              <strong className="text-white">preço justo</strong> para negociar com segurança.
            </p>

            {/* Plate Input */}
            <div className="max-w-md mx-auto lg:mx-0 mb-8">

              {/* Input box */}
              <div
                className="flex items-center rounded-2xl mb-3"
                style={{
                  border: '2px solid rgba(255,255,255,0.10)',
                  background: '#0d1829',
                  overflow: 'hidden',
                }}
              >
                {/* BR badge */}
                <div
                  className="flex flex-col items-center justify-center self-stretch px-3 gap-1 flex-shrink-0"
                  style={{ background: '#1d4ed8' }}
                >
                  <span className="text-yellow-300 font-black text-[10px] tracking-widest">BR</span>
                  <div className="flex gap-[3px]">
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} className="w-[3px] h-[3px] rounded-full bg-yellow-300" style={{ opacity: 0.5 }} />
                    ))}
                  </div>
                </div>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={plate}
                  onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="ABC-1D23"
                  maxLength={8}
                  spellCheck={false}
                  autoComplete="off"
                  className="flex-1 bg-transparent px-4 py-4 text-2xl sm:text-3xl font-black tracking-[0.3em] text-white uppercase outline-none"
                  style={{ caretColor: '#3b82f6' }}
                  // @ts-ignore
                  placeholder-style="color: rgba(255,255,255,0.15)"
                />
              </div>

              {error && (
                <p className="mb-3 text-red-400 text-sm flex items-center gap-1.5">
                  <span>⚠️</span> {error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 24px rgba(37,99,235,0.4)',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Consultando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="11" cy="11" r="8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    Ver score do carro grátis
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-xs text-slate-600">
                🔓 Prévia grátis &nbsp;·&nbsp; 16 créditos para relatório completo
              </p>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
              {[
                { icon: '🛡️', text: 'Dados oficiais DETRAN' },
                { icon: '⚡', text: 'Resultado em 2s' },
                { icon: '🔒', text: '100% seguro' },
              ].map(b => (
                <span key={b.text} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>{b.icon}</span> {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Mock card */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                background: 'rgba(13,24,41,0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.08)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5">Relatório SMART</p>
                  <p className="text-white font-bold">Toyota Corolla 2020</p>
                  <p className="text-slate-500 text-xs">São Paulo, SP</p>
                </div>
                <div
                  className="rounded-xl px-3 py-1.5 font-mono text-xs text-blue-300"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  ABC-1D23
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4 mb-5">
                <ScoreRing />
                <div>
                  <p className="text-slate-400 text-xs mb-2">Classificação</p>
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 mb-2"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    <span className="text-green-400 font-bold text-sm">Compra Segura</span>
                  </div>
                  <p className="text-slate-500 text-xs">Risco mínimo detectado</p>
                </div>
              </div>

              {/* Status items */}
              <div className="space-y-2 mb-5">
                <StatusRow label="Sinistro" value="Nenhum registro" ok={true} />
                <StatusRow label="Gravame" value="Livre de restrições" ok={true} />
                <StatusRow label="Restrições" value="Nenhuma encontrada" ok={true} />
              </div>

              {/* Price block */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.08))',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Preço Justo IA</p>
                    <p className="text-2xl font-black text-white">R$ 98.500</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs mb-0.5">FIPE</p>
                    <p className="text-slate-300 font-semibold text-sm">R$ 98.500</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{ background: 'rgba(34,197,94,0.12)' }}
                >
                  <span className="text-green-400 text-xs font-bold">✅ Preço alinhado ao mercado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-16 pt-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              { value: '48.000+', label: 'Consultas realizadas' },
              { value: '94%', label: 'Golpes evitados' },
              { value: 'R$ 2.4M', label: 'Economizados' },
              { value: '4.9 ⭐', label: 'Avaliação média' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #030712)' }}
      />
    </section>
  )
}
