import Link from 'next/link'

export function Footer() {
  const links = {
    produto: [
      { href: '/#como-funciona', label: 'Como funciona' },
      { href: '/#pacotes', label: 'Planos e preços' },
      { href: '/comprar', label: 'Comprar créditos' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
    legal: [
      { href: '/privacidade', label: 'Privacidade' },
      { href: '/termos', label: 'Termos de uso' },
      { href: '/suporte', label: 'Suporte' },
    ],
  }

  return (
    <footer style={{
      background: '#060c18',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '56px 0 0',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Grid principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>

          {/* Brand — ocupa 2 colunas em desktop */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>C</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Carcheck Pro
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#94a3b8', maxWidth: 280, marginBottom: 16 }}>
              Descubra se o carro usado que você quer comprar é uma bomba ou um ótimo negócio.
              Score Anti-Bomba + Preço Justo IA.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '6px 12px', fontSize: 12, color: '#cbd5e1',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#4ade80', display: 'inline-block',
                boxShadow: '0 0 6px #4ade80',
              }} />
              Sistema operacional 24/7
            </div>
          </div>

          {/* Links Produto */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Produto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.produto.map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.legal.map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '24px 0',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: '#94a3b8',
        }}>
          <p style={{ margin: 0 }}>© 2025 Carcheck Pro. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#4ade80' }}>💚</span> Pagamentos via PIX Mercado Pago
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              🔒 SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
