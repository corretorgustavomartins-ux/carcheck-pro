'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('credit_wallets').select('balance').eq('user_id', user.id).single()
        setCredits(data?.balance ?? 0)
      }
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    // define scrolled inicial
    setScrolled(window.scrollY > 20)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      // Sempre com fundo sólido — resolve o "quadrado flutuante" no mobile
      scrolled
        ? 'bg-[#060c18]/98 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40'
        : 'bg-[#060c18]/90 backdrop-blur-md border-b border-white/5'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl
              flex items-center justify-center shadow-lg shadow-blue-500/30
              group-hover:shadow-blue-500/50 transition-shadow flex-shrink-0">
              <span className="text-white font-black text-sm sm:text-base leading-none">C</span>
            </div>
            <div className="leading-none">
              <span className="font-black text-white text-base sm:text-lg tracking-tight">Carcheck</span>
              <span className="font-black text-blue-400 text-base sm:text-lg tracking-tight"> Pro</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/#como-funciona">Como funciona</NavLink>
            <NavLink href="/#pacotes">Preços</NavLink>
            {user ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                {credits !== null && (
                  <Link href="/comprar"
                    className="flex items-center gap-2 ml-2 bg-blue-500/15 border border-blue-500/25
                      hover:bg-blue-500/25 text-blue-300 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all">
                    <span>💳</span>
                    <span>{credits} créditos</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="ml-1 text-slate-400 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-xl hover:bg-red-500/10">
                  Sair
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login"
                  className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-xl">
                  Entrar
                </Link>
                <Link href="/comprar"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
                    text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20
                    active:scale-95">
                  Comprar créditos
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile right side: créditos pill + hamburguer */}
          <div className="md:hidden flex items-center gap-2">
            {user && credits !== null && (
              <Link href="/comprar"
                className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/25
                  text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <span>💳</span>
                <span>{credits}</span>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-all"
              aria-label="Menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — dropdown com fundo sólido */}
      <div className={cn(
        'md:hidden border-t border-white/8 bg-[#060c18] transition-all duration-300 overflow-hidden',
        menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      )}>
        <div className="px-4 py-4 space-y-1">
          <MobileNavLink href="/#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</MobileNavLink>
          <MobileNavLink href="/#pacotes" onClick={() => setMenuOpen(false)}>Preços</MobileNavLink>
          {user ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              {credits !== null && (
                <MobileNavLink href="/comprar" onClick={() => setMenuOpen(false)}>
                  <span className="flex items-center gap-2">💳 {credits} créditos</span>
                </MobileNavLink>
              )}
              <button onClick={handleSignOut}
                className="block w-full text-left py-2.5 px-3 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/10 transition-colors">
                Sair da conta
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block text-center py-3 px-4 text-slate-200 border border-white/15 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                Entrar
              </Link>
              <Link href="/comprar" onClick={() => setMenuOpen(false)}
                className="block text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg">
                Comprar créditos
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-xl hover:bg-white/6">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className="block py-3 px-3 text-slate-200 hover:text-white text-sm font-medium rounded-xl hover:bg-white/6 transition-colors">
      {children}
    </Link>
  )
}
