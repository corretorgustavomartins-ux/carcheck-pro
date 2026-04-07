import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">C</span>
              </div>
              <span className="font-black text-white text-lg">Carcheck Pro</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Descubra se o carro usado que você quer comprar é uma bomba ou um ótimo negócio. Score Anti-Bomba + Preço Justo IA.
            </p>
            <p className="text-xs mt-4 text-slate-500">
              ⚡ Powered by dados oficiais do DETRAN e DENATRAN
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
              <li><Link href="/#pacotes" className="hover:text-white transition-colors">Pacotes</Link></li>
              <li><Link href="/comprar" className="hover:text-white transition-colors">Comprar créditos</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link href="/suporte" className="hover:text-white transition-colors">Suporte</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2024 Carcheck Pro. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-500">
            💳 Pagamentos seguros via Mercado Pago PIX
          </p>
        </div>
      </div>
    </footer>
  )
}
