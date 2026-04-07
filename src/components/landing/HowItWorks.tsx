'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    n: '01',
    emoji: '🔍',
    title: 'Digite a placa',
    desc: 'Insira a placa no formato Mercosul ou antigo. Funciona com qualquer placa brasileira.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.25)',
    border: 'rgba(59,130,246,0.3)',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    n: '02',
    emoji: '👁️',
    title: 'Prévia grátis',
    desc: 'Veja marca, modelo, ano, cidade e faixa FIPE instantaneamente — sem custo algum.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.25)',
    border: 'rgba(6,182,212,0.3)',
    bg: 'rgba(6,182,212,0.08)',
  },
  {
    n: '03',
    emoji: '💳',
    title: 'Desbloqueie o SMART',
    desc: 'Use 16 créditos para acessar score completo, alertas de sinistro e preço justo IA.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    border: 'rgba(139,92,246,0.3)',
    bg: 'rgba(139,92,246,0.08)',
  },
  {
    n: '04',
    emoji: '🏆',
    title: 'Negocie com poder',
    desc: 'Apresente o relatório ao vendedor e negocie o preço justo com dados oficiais na mão.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
    border: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.08)',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="como-funciona"
      className="relative py-24"
      style={{ background: '#030712', overflow: 'hidden' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            Como funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            De zero ao relatório em{' '}
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              menos de 2 minutos
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Processo 100% digital, seguro e instantâneo. Sem burocracia.
          </p>
        </div>

        {/* Steps grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl"
              style={{
                background: step.bg,
                border: `1px solid ${step.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
              }}
            >
              {/* Step number badge */}
              <div
                className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: 'rgba(255,255,255,0.08)', color: step.color }}
              >
                {step.n}
              </div>

              {/* Emoji icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${step.bg}, rgba(255,255,255,0.05))`,
                  border: `1px solid ${step.border}`,
                  boxShadow: `0 8px 24px ${step.glow}`,
                }}
              >
                {step.emoji}
              </div>

              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Arrow connector (desktop) */}
        <div className="hidden lg:flex items-center justify-center mt-8 gap-2">
          {steps.map((_, i) => (
            i < steps.length - 1 ? (
              <div key={i} className="flex items-center gap-2">
                <div className="w-20 h-px" style={{ background: 'rgba(148,163,184,0.15)' }} />
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ) : null
          ))}
        </div>

        {/* CTA link */}
        <div className="mt-12 text-center">
          <a
            href="#pacotes"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
            style={{ color: '#60a5fa' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
            onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}
          >
            Ver planos de créditos
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
