'use client'

import { useState } from 'react'
import Link from 'next/link'

const packages = [
  {
    id: 'starter',
    name: 'Inicial',
    credits: 16,
    queries: 1,
    price: 15.99,
    price_formatted: 'R$ 15,99',
    popular: false,
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    glowHover: 'rgba(16,185,129,0.32)',
    border: 'rgba(16,185,129,0.2)',
    borderHover: 'rgba(16,185,129,0.5)',
    btnBg: 'linear-gradient(135deg,#059669,#10b981)',
    btnShadow: 'rgba(16,185,129,0.3)',
    icon: '🟢',
    badge: null,
    features: ['1 consulta SMART completa', 'Score Anti-Bomba 0-100', 'Preço Justo IA', 'Relatório PDF', 'Validade 30 dias'],
  },
  {
    id: 'recommended',
    name: 'Recomendado',
    credits: 48,
    queries: 3,
    price: 39.90,
    price_formatted: 'R$ 39,90',
    popular: true,
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
    glowHover: 'rgba(59,130,246,0.40)',
    border: 'rgba(59,130,246,0.4)',
    borderHover: 'rgba(59,130,246,0.7)',
    btnBg: 'linear-gradient(135deg,#2563eb,#3b82f6)',
    btnShadow: 'rgba(59,130,246,0.35)',
    icon: '🔥',
    badge: '⭐ Mais vendido',
    features: ['3 consultas SMART completas', 'Score Anti-Bomba 0-100', 'Preço Justo IA', 'Relatório PDF', 'Validade 60 dias', 'Monitoramento básico'],
  },
  {
    id: 'smart',
    name: 'Inteligente',
    credits: 100,
    queries: 6,
    price: 69.90,
    price_formatted: 'R$ 69,90',
    popular: false,
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.18)',
    glowHover: 'rgba(139,92,246,0.32)',
    border: 'rgba(139,92,246,0.2)',
    borderHover: 'rgba(139,92,246,0.5)',
    btnBg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
    btnShadow: 'rgba(139,92,246,0.3)',
    icon: '🟣',
    badge: null,
    features: ['6 consultas SMART completas', 'Score Anti-Bomba 0-100', 'Preço Justo IA', 'Relatório PDF', 'Validade 90 dias', 'Monitoramento avançado', 'Prioridade no suporte'],
  },
]

export function PricingSection() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      id="pacotes"
      className="relative py-24"
      style={{ background: '#030712', overflow: 'hidden' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.6,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>

        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            Planos & Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Simples, transparente,{' '}
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              sem assinaturas
            </span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Compre créditos uma vez, use quando precisar. Sem taxas ocultas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {packages.map((pkg) => {
            const isHov = hovered === pkg.id
            const isActive = isHov || pkg.popular

            return (
              <div
                key={pkg.id}
                className="relative rounded-3xl p-7 cursor-default"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,24,41,0.95), rgba(13,24,41,0.85))',
                  border: `1px solid ${isActive ? pkg.borderHover : pkg.border}`,
                  boxShadow: isActive
                    ? `0 0 48px ${pkg.glow}, 0 20px 40px rgba(0,0,0,0.4)`
                    : '0 4px 20px rgba(0,0,0,0.3)',
                  transform: isActive && isHov ? 'translateY(-6px) scale(1.01)' : 'none',
                  transition: 'all 0.3s ease',
                  outline: pkg.popular ? `2px solid ${pkg.border}` : 'none',
                  outlineOffset: '2px',
                }}
                onMouseEnter={() => setHovered(pkg.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Popular badge */}
                {pkg.badge && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
                  >
                    {pkg.badge}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{pkg.icon}</span>
                      <span className="text-slate-400 text-sm">{pkg.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black" style={{ color: pkg.accent }}>{pkg.credits}</span>
                      <span className="text-slate-500 text-sm">créditos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">{pkg.price_formatted}</div>
                    <div className="text-slate-500 text-xs mt-0.5">via PIX</div>
                  </div>
                </div>

                {/* Queries info */}
                <div
                  className="rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-slate-300 text-sm font-medium">
                    {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''} SMART
                  </span>
                  <span className="text-xs font-bold" style={{ color: pkg.accent }}>
                    R$ {(pkg.price / pkg.queries).toFixed(2)}/cada
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <span className="font-bold flex-shrink-0" style={{ color: pkg.accent }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={`/comprar?pacote=${pkg.id}`}>
                  <button
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all duration-200"
                    style={{
                      background: pkg.btnBg,
                      boxShadow: `0 4px 20px ${pkg.btnShadow}`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Comprar {pkg.name}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {['💚 Pagamento via PIX', '⚡ Créditos em segundos', '🔒 Mercado Pago', '🔄 Sem mensalidade'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
