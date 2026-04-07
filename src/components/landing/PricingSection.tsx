'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CREDIT_PACKAGES } from '@/lib/credit-packages'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const [hovered, setHovered] = useState<string | null>(null)

  const styles = {
    starter: {
      border: 'border-emerald-500/30',
      glow: 'rgba(16,185,129,0.15)',
      icon: '🟢',
      badge: null,
      btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      accent: 'text-emerald-400',
      checkColor: 'text-emerald-400',
      ring: 'ring-emerald-500/40',
    },
    recommended: {
      border: 'border-blue-500/50',
      glow: 'rgba(59,130,246,0.25)',
      icon: '🔥',
      badge: 'Mais vendido',
      btnClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30',
      accent: 'text-blue-400',
      checkColor: 'text-blue-400',
      ring: 'ring-blue-500/50',
    },
    smart: {
      border: 'border-purple-500/30',
      glow: 'rgba(139,92,246,0.15)',
      icon: '🟣',
      badge: null,
      btnClass: 'bg-purple-600 hover:bg-purple-500 text-white',
      accent: 'text-purple-400',
      checkColor: 'text-purple-400',
      ring: 'ring-purple-500/40',
    },
  }

  return (
    <section id="pacotes" className="relative py-24 bg-[#030712] overflow-hidden">
      {/* bg effects */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]
        rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* header */}
        <div className="text-center mb-14">
          <span className="inline-block text-emerald-400 font-semibold text-xs uppercase tracking-widest
            bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-4">
            Planos &amp; Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Simples, transparente{' '}
            <span className="gradient-text">sem assinaturas</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Compre créditos uma vez, use quando precisar. Sem taxas ocultas.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {CREDIT_PACKAGES.map((pkg) => {
            const s = styles[pkg.id as keyof typeof styles]
            const isHov = hovered === pkg.id
            return (
              <div
                key={pkg.id}
                onMouseEnter={() => setHovered(pkg.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'relative rounded-3xl border p-7 transition-all duration-300',
                  's.border',
                  pkg.popular ? 'ring-2 ' + s.ring : '',
                  isHov ? 'scale-[1.02] -translate-y-1' : ''
                )}
                style={{
                  border: `1px solid`,
                  borderColor: pkg.popular ? s.glow.replace('0.25', '0.5') : s.glow.replace('0.15', '0.3'),
                  background: `linear-gradient(135deg, rgba(13,24,41,0.95) 0%, rgba(13,24,41,0.85) 100%)`,
                  boxShadow: isHov || pkg.popular ? `0 0 60px ${s.glow}, 0 20px 40px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Popular badge */}
                {s.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2
                    bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-black
                    px-5 py-1.5 rounded-full shadow-lg shadow-blue-500/30 tracking-wide whitespace-nowrap">
                    ⭐ {s.badge}
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-slate-400 text-sm font-medium">{pkg.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${s.accent}`}>{pkg.credits}</span>
                      <span className="text-slate-500 text-sm">créditos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">{pkg.price_formatted}</div>
                    <div className="text-slate-500 text-xs mt-0.5">à vista via PIX</div>
                  </div>
                </div>

                {/* Queries highlight */}
                <div className={cn(
                  'rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between',
                  'border',
                  pkg.popular
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-white/4 border-white/8'
                )}>
                  <span className="text-slate-300 text-sm font-medium">
                    {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''} SMART
                  </span>
                  <span className={`text-xs font-bold ${s.accent}`}>
                    R$ {(pkg.price / pkg.queries).toFixed(2)}/consulta
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 mb-7">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <span className={`flex-shrink-0 font-bold ${s.checkColor}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={`/comprar?pacote=${pkg.id}`}>
                  <button className={cn(
                    'w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95',
                    s.btnClass
                  )}>
                    Comprar {pkg.name}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

        {/* trust */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {[
            '💚 Pagamento via PIX',
            '⚡ Créditos em segundos',
            '🔒 Pagamento seguro Mercado Pago',
            '🔄 Sem mensalidade',
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5">{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
