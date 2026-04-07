'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Os dados são oficiais e atualizados?',
    a: 'Sim. Consultamos bases de dados oficiais do DETRAN, DENATRAN e SERASA em tempo real para garantir a precisão das informações fornecidas em cada relatório.',
    icon: '🛡️',
  },
  {
    q: 'Os créditos têm validade?',
    a: 'Sim. Pacote Inicial: 30 dias. Recomendado: 60 dias. Inteligente: 90 dias. Após o vencimento, os créditos não utilizados expiram.',
    icon: '⏱️',
  },
  {
    q: 'Posso consultar qualquer placa brasileira?',
    a: 'Sim, qualquer placa nos formatos Mercosul (ABC1D23) ou antigo (ABC1234), de qualquer estado do Brasil.',
    icon: '📍',
  },
  {
    q: 'O relatório substitui uma vistoria cautelar?',
    a: 'Não. O relatório é uma análise de dados eletrônicos e score de risco. Para compra segura, recomendamos também realizar vistoria cautelar presencial.',
    icon: '🔍',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Atualmente aceitamos PIX via Mercado Pago. O pagamento é instantâneo e os créditos são liberados automaticamente em segundos após confirmação.',
    icon: '💳',
  },
  {
    q: 'Posso pedir reembolso dos créditos?',
    a: 'Créditos comprados não são reembolsáveis após pagamento confirmado, exceto em caso de falha técnica comprovada do sistema.',
    icon: '🔄',
  },
  {
    q: 'Ganho créditos ao me cadastrar?',
    a: 'Sim! Todo novo usuário recebe 5 créditos de bônus ao criar sua conta, suficientes para explorar partes do sistema.',
    icon: '🎁',
  },
  {
    q: 'Preciso me cadastrar para consultar a prévia?',
    a: 'Não. A prévia grátis com marca, modelo, ano e faixa FIPE é disponível sem cadastro. Para o relatório SMART completo, é necessário conta e créditos.',
    icon: '👤',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-24 bg-[#030712] overflow-hidden">
      <div className="absolute inset-0 line-grid opacity-30" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-14">
          <span className="inline-block text-slate-400 font-semibold text-xs uppercase tracking-widest
            bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
            Dúvidas frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Perguntas{' '}
            <span className="gradient-text">frequentes</span>
          </h2>
          <p className="text-slate-400">Tudo que você precisa saber antes de começar.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
                ${open === i
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                }`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="text-xl flex-shrink-0">{faq.icon}</span>
                <span className={`flex-1 font-semibold text-sm ${open === i ? 'text-white' : 'text-slate-300'}`}>
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${open === i ? 'bg-blue-500 rotate-45' : 'bg-white/10'}`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              <div className={`transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ overflow: 'hidden' }}>
                <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed pl-[3.75rem]">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            Ainda tem dúvidas?{' '}
            <a href="mailto:suporte@carcheck.pro" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Fale conosco
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
