'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CTASection() {
  const router = useRouter()
  const [plate, setPlate] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (raw.length <= 7) setPlate(raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw)
  }

  const handleSearch = () => {
    const clean = plate.replace(/-/g, '')
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean)
    const old = /^[A-Z]{3}[0-9]{4}$/.test(clean)
    if (mercosul || old) router.push(`/resultado?placa=${clean}`)
  }

  return (
    <section
      className="relative py-28"
      style={{
        background: 'linear-gradient(135deg, #0d1829 0%, #0a1628 50%, #060c18 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Blue blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: '25%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent)',
          filter: 'blur(60px)',
          opacity: 0.8,
        }}
      />
      {/* Purple blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0, right: '25%',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent)',
          filter: 'blur(60px)',
        }}
      />

      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center" style={{ zIndex: 10 }}>

        {/* Warning badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          ⚠️ Não arrisque seu dinheiro
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Cada consulta pode te{' '}
          <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            economizar milhares
          </span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Por <strong className="text-white">R$ 15,99</strong> você descobre tudo sobre o carro antes de comprar.
          Evite prejuízos de <strong className="text-white">R$ 20.000 ou mais</strong>.
        </p>

        {/* Inline search */}
        <div className="flex gap-3 max-w-md mx-auto mb-8">
          <div
            className="relative flex-1 flex items-center rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex flex-col items-center px-3 py-1 self-stretch gap-0.5 flex-shrink-0"
              style={{ background: 'rgba(29,78,216,0.8)' }}
            >
              <span className="text-yellow-300 font-black text-[9px] tracking-widest">BR</span>
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="w-[2px] h-[2px] bg-yellow-300 rounded-full" style={{ opacity: 0.6 }} />
                ))}
              </div>
            </div>
            <input
              type="text"
              value={plate}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ABC-1D23"
              maxLength={8}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent px-3 py-3.5 text-xl font-black tracking-[0.25em] text-white uppercase outline-none"
              style={{ caretColor: '#3b82f6' }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="text-white font-bold px-5 rounded-2xl flex-shrink-0 transition-all"
            style={{
              background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Buscar
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="/comprar"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
            style={{
              background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            💳 Comprar créditos agora
          </a>
          <a
            href="/#como-funciona"
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.color = '#cbd5e1'
            }}
          >
            Saiba mais
          </a>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {['🔍 48k+ consultas realizadas', '🛡️ 94% de golpes evitados', '⭐ 4.9/5 avaliação'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
