import { Card } from '@/components/ui/Card'

const steps = [
  {
    number: '01',
    icon: '🔍',
    title: 'Digite a placa',
    description: 'Insira a placa do veículo que deseja comprar. Funciona com qualquer placa brasileira (Mercosul ou antiga).',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    icon: '📋',
    title: 'Veja a prévia grátis',
    description: 'Receba instantaneamente marca, modelo, ano, cidade de emplacamento e faixa FIPE — sem custo.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    number: '03',
    icon: '💳',
    title: 'Desbloqueie o relatório',
    description: 'Use 16 créditos para acessar o relatório SMART completo com score, alertas e preço justo.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    number: '04',
    icon: '🏆',
    title: 'Negocie com segurança',
    description: 'Use o score anti-bomba e o preço justo IA para negociar o melhor valor e evitar golpes.',
    color: 'from-emerald-500 to-emerald-600',
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Como funciona</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Simples, rápido e confiável
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Em menos de 2 minutos você sabe se o carro vale a pena comprar ou não.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-10" />
              )}
              <Card className="text-center h-full" shadow="md">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="text-xs font-bold text-slate-400 tracking-widest mb-2">PASSO {step.number}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhatIsAnalyzedSection() {
  const items = [
    { icon: '🚨', label: 'Registro de sinistro', description: 'Acidentes, colisões e perda total' },
    { icon: '🔒', label: 'Gravame financeiro', description: 'Financiamentos e alienação fiduciária' },
    { icon: '📋', label: 'Restrições ativas', description: 'Judicial, administrativa e policial' },
    { icon: '💰', label: 'Tabela FIPE', description: 'Valor de referência atualizado' },
    { icon: '📅', label: 'Ano e fabricação', description: 'Histórico de propriedade' },
    { icon: '📍', label: 'Local de emplacamento', description: 'Cidade e estado de origem' },
    { icon: '🔧', label: 'Dados técnicos', description: 'Combustível, câmbio e versão' },
    { icon: '🤖', label: 'Score inteligente', description: 'Análise IA de risco combinado' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">O que analisamos</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">
              Relatório completo em segundos
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Nosso motor de análise cruza múltiplas fontes de dados oficiais para entregar o relatório mais completo do mercado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup do Score */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest">Relatório SMART</p>
                  <p className="text-white font-bold text-lg mt-0.5">Toyota Corolla 2020</p>
                  <p className="text-slate-400 text-sm">ABC-1D23 • São Paulo, SP</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400">87</div>
                  <div className="text-emerald-400 text-xs font-medium">/100</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Sinistro', status: 'ok', text: 'Nenhum registro' },
                  { label: 'Gravame', status: 'ok', text: 'Livre de restrições' },
                  { label: 'Restrições', status: 'ok', text: 'Nenhuma encontrada' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                    <span className="text-slate-300 text-sm">{item.label}</span>
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                      <span>✓</span> {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs">Preço Justo IA</p>
                    <p className="text-emerald-400 font-black text-xl">R$ 98.500</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">FIPE</p>
                    <p className="text-white font-semibold text-sm">R$ 98.500</p>
                  </div>
                </div>
                <div className="mt-3 bg-emerald-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-emerald-300 text-xs font-semibold">✅ Compra Segura — Score 87/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Carlos Mendes',
      city: 'São Paulo, SP',
      avatar: 'CM',
      text: 'Descobri que o carro tinha gravame usando o Carcheck Pro antes de fechar negócio. Economizei R$ 12.000 numa furada que quase caí!',
      score: 5,
      vehicle: 'Honda Civic 2019',
    },
    {
      name: 'Ana Paula Ramos',
      city: 'Rio de Janeiro, RJ',
      avatar: 'AP',
      text: 'O score mostrou sinistro em um carro que o vendedor disse estar impecável. Mostrei o relatório e ele caiu fora da mentira na hora.',
      score: 5,
      vehicle: 'Toyota Corolla 2021',
    },
    {
      name: 'Roberto Silva',
      city: 'Curitiba, PR',
      avatar: 'RS',
      text: 'Usei o preço justo para negociar e consegui R$ 8.000 de desconto porque o carro tinha restrição. Valeu cada centavo do crédito.',
      score: 5,
      vehicle: 'Chevrolet Onix 2022',
    },
    {
      name: 'Fernanda Costa',
      city: 'Belo Horizonte, MG',
      avatar: 'FC',
      text: 'Interface incrível, resultado em segundos. Muito melhor do que outros serviços que testei. Recomendo para qualquer compra de usado.',
      score: 5,
      vehicle: 'Volkswagen Polo 2020',
    },
  ]

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Depoimentos</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Quem usa, recomenda
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} shadow="md">
              <div className="flex gap-1 mb-3">
                {[...Array(t.score)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.city} • {t.vehicle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  const faqs = [
    {
      q: 'Os dados são oficiais e atualizados?',
      a: 'Sim. Consultamos bases de dados oficiais do DETRAN, DENATRAN e SERASA para garantir a precisão das informações.',
    },
    {
      q: 'Os créditos têm validade?',
      a: 'Sim. Pacote Inicial: 30 dias. Recomendado: 60 dias. Inteligente: 90 dias. Após o vencimento, os créditos não utilizados são perdidos.',
    },
    {
      q: 'Posso consultar qualquer placa?',
      a: 'Sim, qualquer placa brasileira nos formatos Mercosul (ABC1D23) e antigo (ABC1234).',
    },
    {
      q: 'O relatório substitui uma vistoria cautelar?',
      a: 'Não. O relatório é uma análise de dados e score. Para compra de veículos, recomendamos também realizar vistoria cautelar presencial.',
    },
    {
      q: 'Aceita quais formas de pagamento?',
      a: 'Atualmente aceitamos PIX via Mercado Pago. Pagamento instantâneo e créditos liberados em segundos.',
    },
    {
      q: 'Posso pedir reembolso?',
      a: 'Créditos comprados não são reembolsáveis, exceto em caso de falha técnica comprovada do sistema.',
    },
  ]

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Dúvidas</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Perguntas frequentes</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="p-0 overflow-hidden" shadow="sm">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none">
                  <span>{faq.q}</span>
                  <span className="text-blue-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4">▼</span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              </details>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Não arrisque seu dinheiro
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Por apenas R$ 15,99 você descobre tudo sobre o carro antes de comprar. Evite prejuízos de R$ 20.000 ou mais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/comprar" className="bg-white text-blue-600 hover:bg-blue-50 transition-colors font-bold px-8 py-4 rounded-2xl shadow-xl text-lg inline-flex items-center justify-center gap-2">
            💳 Comprar créditos
          </a>
          <a href="/resultado" className="border-2 border-white/30 text-white hover:bg-white/10 transition-colors font-bold px-8 py-4 rounded-2xl text-lg inline-flex items-center justify-center gap-2">
            🔍 Consultar placa grátis
          </a>
        </div>
      </div>
    </section>
  )
}
