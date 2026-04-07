'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VehicleService } from '@/lib/vehicle-service'
import Link from 'next/link'

/* ─── Animated Score Demo ─── */
function ScoreDemo() {
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
    }, 600)
    return () => clearTimeout(t)
  }, [])

  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none">{score}</span>
        <span className="text-slate-400 text-xs mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

/* ─── Floating card component ─── */
function FloatingCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`glass rounded-2xl px-4 py-3 shadow-2xl ${className}`}>
      {children}
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
      setPlate(raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw)
    }
  }

  const handleSearch = () => {
    const clean = plate.replace(/-/g, '')
    if (!VehicleService.validatePlate(clean)) {
      setError('Placa inválida. Ex: ABC-1D23 ou ABC-1234')
      inputRef.current?.focus()
      return
    }
    setLoading(true)
    router.push(`/resultado?placa=${clean}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#060C18]">

      {/* ── Deep background layers ── */}
      <div className="absolute inset-0 line-grid opacity-60" />

      {/* Radial gradient center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)' }} />
      </div>

      {/* Animated blobs */}
      <div className="absolute top-16 left-[10%] w-72 h-72 rounded-full blur-3xl opacity-20 animate-float"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      <div className="absolute bottom-20 right-[8%] w-96 h-96 rounded-full blur-3xl opacity-15 animate-float-delayed"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      <div className="absolute top-1/3 right-[15%] w-48 h-48 rounded-full blur-2xl opacity-20"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — Copy & CTA */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8
              border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              Score Anti-Bomba em tempo real
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Descubra se o{' '}
              <br className="hidden sm:block" />
              carro é{' '}
              <span className="relative inline-block">
                <span className="gradient-text-danger">bomba</span>
                {/* underline decoration */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6 Q50 2 100 6 Q150 10 198 4" stroke="#ef4444" strokeWidth="2.5"
                    strokeLinecap="round" strokeDasharray="4 3" opacity="0.7" />
                </svg>
              </span>
              <br />antes de comprar
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Consulte <strong className="text-slate-200">histórico, sinistro, gravame e FIPE</strong> em segundos.
              Receba um <strong className="text-slate-200">Score de Risco 0–100</strong> e descubra o{' '}
              <strong className="text-slate-200">preço justo</strong> para negociar com segurança.
            </p>

            {/* ── PLATE INPUT ── */}
            <div className="max-w-lg mx-auto lg:mx-0 space-y-3 mb-8">
              <div className={`relative group ${error ? 'shake' : ''}`}>
                {/* glow ring on focus */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-0
                  group-focus-within:opacity-60 transition-opacity duration-300" />

                <div className={`relative flex items-center bg-[#0d1829] rounded-2xl overflow-hidden
                  border-2 transition-all duration-200
                  ${error ? 'border-red-500' : 'border-white/10 focus-within:border-blue-500/70'}`}>

                  {/* BR Badge */}
                  <div className="flex flex-col items-center justify-center bg-blue-700 px-3.5 py-1 self-stretch gap-0.5 flex-shrink-0">
                    <span className="text-yellow-300 font-black text-[10px] tracking-[0.2em]">BR</span>
                    <div className="flex gap-[3px]">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="w-[3px] h-[3px] rounded-full bg-yellow-300/60" />
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
                    className="flex-1 bg-transparent px-5 py-5 text-3xl font-black tracking-[0.3em]
                      text-white uppercase placeholder:text-white/15 placeholder:tracking-[0.2em]
                      outline-none caret-blue-400"
                  />

                  {/* car icon */}
                  <div className="pr-5 text-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h1m6-2h1m3-5h3l2 3v4h-2m-3-7l-1-3H6l-1 3" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm flex items-center gap-2 pl-1">
                  <span>⚠️</span> {error}
                </p>
              )}

              {/* CTA Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="relative w-full py-4 rounded-2xl text-white font-bold text-lg
                  overflow-hidden group transition-all duration-200 active:scale-[0.98]
                  disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)' }}
              >
                {/* shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12
                  translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />

                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Consultando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Ver score do carro grátis
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <p className="text-center text-xs text-slate-600">
                🔓 Prévia grátis &nbsp;·&nbsp; 16 créditos para relatório completo &nbsp;·&nbsp; Sem cadastro para prévia
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              {[
                { icon: '🛡️', text: 'Dados oficiais DETRAN' },
                { icon: '⚡', text: 'Resultado em 2s' },
                { icon: '🔒', text: '100% seguro' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Animated Dashboard Card */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">

              {/* Main card */}
              <div className="relative glass-dark rounded-3xl p-6 shadow-2xl border border-white/8
                card-3d" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.1)' }}>

                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Relatório SMART</p>
                    <p className="text-white font-bold text-base mt-0.5">Toyota Corolla 2020</p>
                  </div>
                  <div className="glass rounded-xl px-3 py-1.5 text-xs text-blue-300 font-mono tracking-wider">
                    ABC-1D23
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-5 mb-5">
                  <ScoreDemo />
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Classificação</p>
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20
                      rounded-xl px-3 py-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 font-bold text-sm">Compra Segura</span>
                    </div>
                    <p className="text-slate-500 text-xs">Risco mínimo detectado</p>
                  </div>
                </div>

                {/* Status rows */}
                <div className="space-y-2 mb-5">
                  {[
                    { label: 'Sinistro', ok: true, value: 'Nenhum registro' },
                    { label: 'Gravame', ok: true, value: 'Livre de restrições' },
                    { label: 'Restrições', ok: true, value: 'Nenhuma encontrada' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between
                      bg-white/4 rounded-xl px-3.5 py-2.5">
                      <span className="text-slate-400 text-xs">{item.label}</span>
                      <span className={`text-xs font-semibold flex items-center gap-1.5 ${item.ok ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price block */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/20
                  rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-slate-400 text-xs">Preço Justo IA</p>
                      <p className="text-2xl font-black text-white">R$ 98.500</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">FIPE atual</p>
                      <p className="text-slate-300 font-semibold text-sm">R$ 98.500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/15 rounded-lg px-3 py-1.5">
                    <span className="text-green-400 text-xs font-bold">✅ Preço alinhado ao mercado</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <FloatingCard className="absolute -top-4 -left-6 animate-float hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-white text-xs font-bold">Score 87/100</p>
                    <p className="text-slate-400 text-[10px]">Compra segura</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard className="absolute -bottom-4 -right-4 animate-float-delayed hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-base">💰</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Preço Justo IA</p>
                    <p className="text-green-400 text-[10px]">-0% do FIPE</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard className="absolute top-1/2 -right-8 -translate-y-1/2 animate-float hidden lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <p className="text-white text-xs font-bold">PDF gerado</p>
                </div>
              </FloatingCard>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-20 border-t border-white/6 pt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              { value: '48.000+', label: 'Consultas realizadas', icon: '🔍' },
              { value: '94%', label: 'Golpes evitados', icon: '🛡️' },
              { value: 'R$ 2.4M', label: 'Economizados pelos usuários', icon: '💰' },
              { value: '4.9 ⭐', label: 'Avaliação média', icon: '🏆' },
            ].map((s) => (
              <div key={s.label} className="group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #030712)' }} />
    </section>
  )
}
