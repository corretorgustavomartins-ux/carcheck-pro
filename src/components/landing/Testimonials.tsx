'use client'

import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    name: 'Carlos Mendes',
    city: 'São Paulo, SP',
    initials: 'CM',
    color: 'from-blue-500 to-blue-700',
    text: 'Descobri que o carro tinha gravame usando o Carcheck Pro antes de fechar negócio. Economizei R$ 12.000 numa furada que quase caí!',
    stars: 5,
    vehicle: 'Honda Civic 2019',
    saved: 'Economizou R$ 12k',
  },
  {
    name: 'Ana Paula Ramos',
    city: 'Rio de Janeiro, RJ',
    initials: 'AP',
    color: 'from-violet-500 to-violet-700',
    text: 'O score mostrou sinistro em um carro que o vendedor disse estar impecável. Mostrei o relatório e ele caiu fora da mentira na hora.',
    stars: 5,
    vehicle: 'Toyota Corolla 2021',
    saved: 'Golpe evitado',
  },
  {
    name: 'Roberto Silva',
    city: 'Curitiba, PR',
    initials: 'RS',
    color: 'from-emerald-500 to-emerald-700',
    text: 'Usei o preço justo para negociar e consegui R$ 8.000 de desconto porque o carro tinha restrição. Valeu cada centavo.',
    stars: 5,
    vehicle: 'Chevrolet Onix 2022',
    saved: 'Negociou R$ 8k a menos',
  },
  {
    name: 'Fernanda Costa',
    city: 'Belo Horizonte, MG',
    initials: 'FC',
    color: 'from-pink-500 to-rose-600',
    text: 'Interface incrível, resultado em segundos. Muito melhor do que outros serviços. Recomendo para qualquer compra de usado.',
    stars: 5,
    vehicle: 'Volkswagen Polo 2020',
    saved: '3 consultas realizadas',
  },
  {
    name: 'Lucas Almeida',
    city: 'Porto Alegre, RS',
    initials: 'LA',
    color: 'from-amber-500 to-orange-600',
    text: 'O PDF do relatório é excelente. Imprimi e levei para o despachante. Ficou impressionado com a qualidade das informações.',
    stars: 5,
    vehicle: 'Jeep Renegade 2021',
    saved: 'Compra tranquila',
  },
  {
    name: 'Mariana Torres',
    city: 'Brasília, DF',
    initials: 'MT',
    color: 'from-cyan-500 to-cyan-700',
    text: 'Fiz 4 consultas antes de achar o carro ideal. O score me ajudou a descartar logo os carros com problema e focar no certo.',
    stars: 5,
    vehicle: 'Hyundai Creta 2022',
    saved: '4 consultas, 1 compra certa',
  },
]

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030712 0%, #060c18 100%)' }}>

      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <span className="inline-block text-yellow-400 font-semibold text-xs uppercase tracking-widest
            bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Quem usa,{' '}
            <span className="gradient-text">recomenda</span>
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-400 text-sm">4.9/5 baseado em +2.400 avaliações</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-dark rounded-2xl p-5 border border-white/6 hover:border-white/12
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s, box-shadow 0.3s, border-color 0.3s`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.stars)].map((_, j) => (
                  <svg key={j} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* saved badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20
                text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full mb-4">
                ✓ {t.saved}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-white/6 pt-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color}
                  flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.city} · {t.vehicle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
