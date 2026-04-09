'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadCredits = async (uid: string) => {
      const { data } = await supabase
        .from('credit_wallets').select('balance').eq('user_id', uid).single()
      setCredits(data?.balance ?? 0)
    }

    // Usa getSession() — lê do localStorage sem chamada de rede
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadCredits(session.user.id)
      }
    })

    // Escuta mudanças de auth sem fazer chamadas extras
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        loadCredits(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setCredits(null)
      }
    })

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    setScrolled(window.scrollY > 20)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      backgroundColor: scrolled ? '#060c18' : '#060c18ee',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      transition: 'box-shadow 0.3s',
    }}>
      {/* barra principal */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>C</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Carcheck<span style={{ color: '#60a5fa' }}> Pro</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
          <NavLink href="/#como-funciona">Como funciona</NavLink>
          <NavLink href="/#pacotes">Preços</NavLink>
          {user ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              {credits !== null && (
                <Link href="/comprar" style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8,
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                  color: '#93c5fd', padding: '6px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>
                  <span>💳</span><span>{credits} créditos</span>
                </Link>
              )}
              <button onClick={handleSignOut} style={{
                marginLeft: 4, color: '#94a3b8', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, padding: '6px 12px', borderRadius: 10,
              }}>Sair</button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link href="/login" style={{ color: '#94a3b8', fontSize: 13, padding: '6px 12px', borderRadius: 10, textDecoration: 'none' }}>
                Entrar
              </Link>
              <Link href="/comprar" style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
                boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
              }}>
                Comprar créditos
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile: créditos + hamburguer */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          {user && credits !== null && (
            <Link href="/comprar" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd', padding: '4px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>
              <span>💳</span><span>{credits}</span>
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: 8, borderRadius: 10, background: 'none', border: 'none',
              color: '#cbd5e1', cursor: 'pointer', lineHeight: 0,
            }}
            aria-label="Menu">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div style={{
        overflow: 'hidden',
        maxHeight: menuOpen ? 320 : 0,
        opacity: menuOpen ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
        background: '#060c18',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }} className="show-mobile-block">
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <MobileNavLink href="/#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</MobileNavLink>
          <MobileNavLink href="/#pacotes" onClick={() => setMenuOpen(false)}>Preços</MobileNavLink>
          {user ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              {credits !== null && (
                <MobileNavLink href="/comprar" onClick={() => setMenuOpen(false)}>
                  💳 {credits} créditos
                </MobileNavLink>
              )}
              <button onClick={handleSignOut} style={{
                textAlign: 'left', padding: '10px 12px', color: '#f87171',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, borderRadius: 10,
              }}>
                Sair da conta
              </button>
            </>
          ) : (
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display: 'block', textAlign: 'center', padding: '12px 16px',
                color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                Entrar
              </Link>
              <Link href="/comprar" onClick={() => setMenuOpen(false)} style={{
                display: 'block', textAlign: 'center', padding: '12px 16px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
              }}>
                Comprar créditos
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CSS para responsividade do header */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile   { display: none !important; }
        .show-mobile-block { display: none !important; }
        @media (max-width: 767px) {
          .hidden-mobile     { display: none !important; }
          .show-mobile       { display: flex !important; }
          .show-mobile-block { display: block !important; }
        }
      `}</style>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      color: '#94a3b8', fontSize: 14, padding: '6px 12px',
      borderRadius: 10, textDecoration: 'none', fontWeight: 500,
      transition: 'color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'block', padding: '10px 12px', color: '#e2e8f0',
      fontSize: 14, fontWeight: 500, borderRadius: 10, textDecoration: 'none',
    }}>
      {children}
    </Link>
  )
}
