'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CREDIT_PACKAGES } from '@/lib/credit-packages'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pacotes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Planos</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Créditos simples e transparentes
          </h2>
          <p className="text-slate-500 mt-3">
            Sem assinaturas. Compre uma vez, use quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <PricingCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          💳 Pagamento via PIX • ⚡ Créditos liberados em segundos • 🔒 100% seguro
        </p>
      </div>
    </section>
  )
}

function PricingCard({ pkg }: { pkg: typeof CREDIT_PACKAGES[0] }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: 'bg-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      credits: 'text-emerald-600',
      ring: 'ring-emerald-200',
    },
    blue: {
      bg: 'bg-blue-600',
      border: 'border-blue-500',
      badge: 'bg-yellow-400 text-yellow-900',
      icon: 'bg-blue-500',
      button: 'bg-white text-blue-600 hover:bg-blue-50',
      credits: 'text-blue-100',
      ring: 'ring-blue-400',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      icon: 'bg-purple-500',
      button: 'bg-purple-600 hover:bg-purple-700',
      credits: 'text-purple-600',
      ring: 'ring-purple-200',
    },
  }

  const colors = colorMap[pkg.color as keyof typeof colorMap]
  const isPopular = pkg.popular

  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
      isPopular ? `${colors.bg} ${colors.border} ring-2 ${colors.ring}` : `bg-white ${colors.border}`
    )}>
      {pkg.badge && (
        <div className={cn('text-center text-xs font-bold py-2 tracking-widest uppercase', colors.badge)}>
          {pkg.badge}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className={cn(
            'text-2xl font-bold mb-1',
            isPopular ? 'text-white' : 'text-slate-900'
          )}>
            {pkg.name}
          </div>
          <div className={cn('flex items-baseline gap-1', isPopular ? colors.credits : 'text-blue-600')}>
            <span className="text-4xl font-black">{pkg.credits}</span>
            <span className="text-sm font-medium opacity-75">créditos</span>
          </div>
          <div className={cn('text-sm mt-1', isPopular ? 'text-blue-100' : 'text-slate-500')}>
            {pkg.queries} consulta{pkg.queries > 1 ? 's' : ''} SMART completa{pkg.queries > 1 ? 's' : ''}
          </div>
        </div>

        {/* Price */}
        <div className={cn('text-3xl font-black mb-6', isPopular ? 'text-white' : 'text-slate-900')}>
          {pkg.price_formatted}
          <span className={cn('text-sm font-normal ml-1', isPopular ? 'text-blue-200' : 'text-slate-500')}>
            à vista
          </span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {pkg.features.map((feature, i) => (
            <li key={i} className={cn('flex items-center gap-2 text-sm', isPopular ? 'text-blue-100' : 'text-slate-600')}>
              <span className="flex-shrink-0">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href={`/comprar?pacote=${pkg.id}`}>
          <button className={cn(
            'w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95',
            isPopular ? colors.button : `text-white ${colors.button}`
          )}>
            Comprar {pkg.name}
          </button>
        </Link>
      </div>
    </div>
  )
}
