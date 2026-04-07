'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VehicleService } from '@/lib/vehicle-service'

export function CTASection() {
  const router = useRouter()
  const [plate, setPlate] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (raw.length <= 7) setPlate(raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw)
  }

  const handleSearch = () => {
    const clean = plate.replace(/-/g, '')
    if (VehicleService.validatePlate(clean)) router.push(`/resultado?placa=${clean}`)
  }

  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d1829 0%, #0a1628 50%, #060c18 100%)' }}>

      {/* Animated bg */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-float-delayed"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Diagonal border top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">

        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20
          text-red-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          ⚠️ Não arrisque seu dinheiro
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Cada consulta pode te{' '}
          <span className="gradient-text">economizar milhares</span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Por <strong className="text-white">R$ 15,99</strong> você descobre tudo sobre o carro antes de comprar.
          Evite prejuízos de <strong className="text-white">R$ 20.000 ou mais</strong>.
        </p>

        {/* Inline search */}
        <div className="flex gap-3 max-w-md mx-auto mb-8">
          <div className="relative flex-1 flex items-center bg-white/8 border border-white/15
            rounded-2xl overflow-hidden focus-within:border-blue-500/60 transition-colors">
            <div className="flex flex-col items-center px-3 py-1 bg-blue-700/80 self-stretch gap-0.5">
              <span className="text-yellow-300 font-black text-[9px] tracking-widest">BR</span>
              <div className="flex gap-0.5">
                {[...Array(4)].map((_,i) => <span key={i} className="w-[2px] h-[2px] bg-yellow-300/60 rounded-full" />)}
              </div>
            </div>
            <input
              type="text"
              value={plate}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ABC-1D23"
              maxLength={8}
              className="flex-1 bg-transparent px-3 py-3.5 text-xl font-black tracking-[0.25em]
                text-white uppercase placeholder:text-white/20 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
              text-white font-bold px-5 rounded-2xl transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-blue-500/30"
          >
            Buscar
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/comprar"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
              text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl
              shadow-blue-500/25 inline-flex items-center justify-center gap-2 text-base">
            💳 Comprar créditos agora
          </a>
          <a href="/#como-funciona"
            className="border border-white/15 text-slate-300 hover:text-white hover:border-white/30
              font-semibold px-8 py-4 rounded-2xl transition-all inline-flex items-center justify-center gap-2 text-base">
            Saiba mais
          </a>
        </div>

        {/* Social proof mini */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {['🔍 48k+ consultas realizadas', '🛡️ 94% de golpes evitados', '⭐ 4.9/5 avaliação'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
