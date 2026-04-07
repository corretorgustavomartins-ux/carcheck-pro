'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    n: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Digite a placa',
    desc: 'Insira a placa no formato Mercosul ou antigo. Funciona com qualquer placa brasileira.',
    color: 'from-blue-500 to-blue-600',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    n: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Prévia grátis',
    desc: 'Veja marca, modelo, ano, cidade e faixa FIPE instantaneamente — sem custo algum.',
    color: 'from-cyan-500 to-cyan-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    n: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Desbloqueie o SMART',
    desc: 'Use 16 créditos para acessar score completo, alertas de sinistro e preço justo IA.',
    color: 'from-violet-500 to-violet-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    n: '04',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Negocie com poder',
    desc: 'Apresente o relatório ao vendedor e negocie o preço justo com dados oficiais na mão.',
    color: 'from-emerald-500 to-emerald-600',
    glow: 'rgba(16,185,129,0.3)',
  },
]

function StepCard({ step, index, visible }: { step: typeof steps[0]; index: number; visible: boolean }) {
  return (
    <div
      className="relative flex flex-col items-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
      }}
    >
      {/* connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-9 left-[calc(50%+3rem)] right-[-3rem] h-px"
          style={{ background: 'linear-gradient(to right, rgba(148,163,184,0.3), transparent)' }} />
      )}

      {/* Icon circle */}
      <div className="relative mb-5">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center
          text-white shadow-xl`}
          style={{ boxShadow: `0 8px 32px ${step.glow}` }}>
          {step.icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700
          flex items-center justify-center text-[10px] font-black text-slate-400">
          {step.n}
        </div>
      </div>

      <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
    </div>
  )
}

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="como-funciona" className="relative py-24 bg-[#030712] overflow-hidden">
      {/* subtle grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* header */}
        <div className="text-center mb-16">
          <span className="inline-block text-blue-400 font-semibold text-xs uppercase tracking-widest
            bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
            Como funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            De zero ao relatório em{' '}
            <span className="gradient-text">menos de 2 minutos</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Processo 100% digital, seguro e instantâneo. Sem burocracia.
          </p>
        </div>

        {/* steps */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} visible={visible} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <a href="#pacotes"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300
              text-sm font-semibold transition-colors group">
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
