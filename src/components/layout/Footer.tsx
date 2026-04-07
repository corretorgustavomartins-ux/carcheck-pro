import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#030712] border-t border-white/6 text-slate-500 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">C</span>
              </div>
              <span className="font-black text-white text-lg">Carcheck Pro</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-slate-500 mb-4">
              Descubra se o carro usado que você quer comprar é uma bomba ou um ótimo negócio.
              Score Anti-Bomba + Preço Justo IA.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Sistema operacional 24/7
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produto</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/#como-funciona', label: 'Como funciona' },
                { href: '/#pacotes', label: 'Planos e preços' },
                { href: '/comprar', label: 'Comprar créditos' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/privacidade', label: 'Privacidade' },
                { href: '/termos', label: 'Termos de uso' },
                { href: '/suporte', label: 'Suporte' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2024 Carcheck Pro. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">💚</span> Pagamentos via PIX Mercado Pago
            </span>
            <span className="flex items-center gap-1.5">
              <span>🔒</span> SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
