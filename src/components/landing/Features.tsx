'use client'

import { useEffect, useRef, useState } from 'react'

const features = [
  {
    emoji: '🏆',
    title: 'Score Anti-Bomba',
    desc: 'Algoritmo exclusivo que analisa sinistro, gravame, restrições e idade para gerar um score de risco de 0 a 100 pontos.',
    tag: 'Exclusivo',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.1)',
    tagBorder: 'rgba(245,158,11,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.05))',
    cardBorder: 'rgba(245,158,11,0.15)',
  },
  {
    emoji: '💰',
    title: 'Preço Justo IA',
    desc: 'Motor de precificação inteligente que sugere o valor ideal baseado na FIPE, histórico de sinistro e condição geral.',
    tag: 'IA',
    tagColor: '#60a5fa',
    tagBg: 'rgba(59,130,246,0.1)',
    tagBorder: 'rgba(59,130,246,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))',
    cardBorder: 'rgba(59,130,246,0.15)',
  },
  {
    emoji: '🚨',
    title: 'Detector de Sinistro',
    desc: 'Verifica registros de acidentes, colisões, perda total e histórico de indenizações nas bases oficiais.',
    tag: 'Proteção',
    tagColor: '#f87171',
    tagBg: 'rgba(239,68,68,0.1)',
    tagBorder: 'rgba(239,68,68,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.04))',
    cardBorder: 'rgba(239,68,68,0.15)',
  },
  {
    emoji: '🔒',
    title: 'Verificação de Gravame',
    desc: 'Detecta financiamentos ativos, alienação fiduciária e qualquer restrição financeira sobre o veículo.',
    tag: 'Segurança',
    tagColor: '#c084fc',
    tagBg: 'rgba(139,92,246,0.1)',
    tagBorder: 'rgba(139,92,246,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(109,40,217,0.04))',
    cardBorder: 'rgba(139,92,246,0.15)',
  },
  {
    emoji: '📄',
    title: 'Relatório em PDF',
    desc: 'Gere e baixe um relatório profissional completo para apresentar ao vendedor durante a negociação.',
    tag: 'Download',
    tagColor: '#34d399',
    tagBg: 'rgba(16,185,129,0.1)',
    tagBorder: 'rgba(16,185,129,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
    cardBorder: 'rgba(16,185,129,0.15)',
  },
  {
    emoji: '📍',
    title: 'Dados Oficiais',
    desc: 'Cruzamento de bases do DETRAN, DENATRAN e SERASA para máxima precisão nas informações fornecidas.',
    tag: 'Confiável',
    tagColor: '#22d3ee',
    tagBg: 'rgba(6,182,212,0.1)',
    tagBorder: 'rgba(6,182,212,0.2)',
    cardBg: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(8,145,178,0.04))',
    cardBorder: 'rgba(6,182,212,0.15)',
  },
]

const comparison = [
  ['Score Anti-Bomba 0-100', true, false],
  ['Preço Justo IA', true, false],
  ['Interface moderna e rápida', true, false],
  ['Relatório PDF profissional', true, false],
  ['Sinistro + Gravame + Restrições', true, true],
  ['Dados FIPE integrados', true, true],
]

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      className="relative py-24"
      style={{ background: 'linear-gradient(180deg, #030712 0%, #060c18 50%, #030712 100%)', overflow: 'hidden' }}
    >
      {/* Center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%', left: '50%',
          width: '600px', height: '600px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05), transparent)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>

        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Tudo que você precisa para{' '}
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              comprar com segurança
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Não é só uma consulta de placa — é um sistema completo de proteção na compra de carros usados.
          </p>
        </div>

        {/* Feature cards */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl group cursor-default"
              style={{
                background: f.cardBg,
                border: `1px solid ${f.cardBorder}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{f.emoji}</span>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ color: f.tagColor, background: f.tagBg, border: `1px solid ${f.tagBorder}` }}
                >
                  {f.tag}
                </span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div
          className="rounded-3xl p-8"
          style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-center mb-8">
            <h3 className="text-white font-black text-xl mb-2">Carcheck Pro vs. Outros serviços</h3>
            <p className="text-slate-400 text-sm">Por que somos a melhor opção do mercado</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-sm" style={{ minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Recurso</th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-blue-400 font-bold">Carcheck Pro</span>
                  </th>
                  <th className="py-3 px-4 text-center text-slate-500 font-medium text-xs">Concorrentes</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([feat, us, them], i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="py-3 px-4 text-slate-300">{feat as string}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg font-bold ${us ? 'text-green-400' : 'text-red-400'}`}>
                        {us ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg font-bold ${them ? 'text-green-400' : 'text-red-400'}`}>
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
