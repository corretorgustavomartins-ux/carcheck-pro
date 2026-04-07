'use client'

import { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: '🏆',
    title: 'Score Anti-Bomba',
    desc: 'Algoritmo que analisa sinistro, gravame, restrições e idade para gerar um score de risco de 0 a 100 pontos.',
    tag: 'Exclusivo',
    tagColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    gradient: 'from-yellow-600/20 to-orange-600/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: '💰',
    title: 'Preço Justo IA',
    desc: 'Motor de precificação inteligente que sugere o valor ideal baseado na FIPE, histórico de sinistro e condição geral.',
    tag: 'IA',
    tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    gradient: 'from-blue-600/20 to-cyan-600/10',
    border: 'border-blue-500/20',
  },
  {
    icon: '🚨',
    title: 'Detector de Sinistro',
    desc: 'Verifica registros de acidentes, colisões, perda total e histórico de indenizações nas bases oficiais.',
    tag: 'Proteção',
    tagColor: 'text-red-400 bg-red-400/10 border-red-400/20',
    gradient: 'from-red-600/20 to-rose-600/10',
    border: 'border-red-500/20',
  },
  {
    icon: '🔒',
    title: 'Verificação de Gravame',
    desc: 'Detecta financiamentos ativos, alienação fiduciária e qualquer restrição financeira sobre o veículo.',
    tag: 'Segurança',
    tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    gradient: 'from-purple-600/20 to-violet-600/10',
    border: 'border-purple-500/20',
  },
  {
    icon: '📄',
    title: 'Relatório em PDF',
    desc: 'Gere e baixe um relatório profissional completo para apresentar ao vendedor durante a negociação.',
    tag: 'Download',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    gradient: 'from-emerald-600/20 to-green-600/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: '📍',
    title: 'Dados Oficiais',
    desc: 'Cruzamento de bases do DETRAN, DENATRAN e SERASA para máxima precisão nas informações fornecidas.',
    tag: 'Confiável',
    tagColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    gradient: 'from-cyan-600/20 to-teal-600/10',
    border: 'border-cyan-500/20',
  },
]

function FeatureCard({ f, index, visible }: { f: typeof features[0]; index: number; visible: boolean }) {
  return (
    <div
      className={`relative rounded-2xl p-6 border bg-gradient-to-br ${f.gradient} ${f.border}
        hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-default group`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s, box-shadow 0.3s ease`,
      }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 70%)' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{f.icon}</div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${f.tagColor}`}>
          {f.tag}
        </span>
      </div>

      <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
    </div>
  )
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030712 0%, #060c18 50%, #030712 100%)' }}>

      {/* bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
        rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <span className="inline-block text-violet-400 font-semibold text-xs uppercase tracking-widest
            bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">comprar com segurança</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Não é só uma consulta de placa — é um sistema completo de proteção na compra de carros usados.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} f={f} index={i} visible={visible} />
          ))}
        </div>

        {/* Bottom comparison */}
        <div className="mt-16 glass-dark rounded-3xl p-8 border border-white/6">
          <div className="text-center mb-8">
            <h3 className="text-white font-black text-xl mb-2">Carcheck Pro vs. Outros serviços</h3>
            <p className="text-slate-400 text-sm">Por que somos a melhor opção do mercado</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Recurso</th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-blue-400 font-bold">Carcheck Pro</span>
                  </th>
                  <th className="py-3 px-4 text-center text-slate-500 font-medium text-xs">Concorrentes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Score Anti-Bomba 0-100', true, false],
                  ['Preço Justo IA', true, false],
                  ['Interface moderna e rápida', true, false],
                  ['Relatório PDF profissional', true, false],
                  ['Sinistro + Gravame + Restrições', true, true],
                  ['Dados FIPE integrados', true, true],
                ].map(([feature, us, them], i) => (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 text-slate-300">{feature as string}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg ${us ? 'text-green-400' : 'text-red-400'}`}>
                        {us ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg ${them ? 'text-green-400' : 'text-red-400'}`}>
                        {them ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
