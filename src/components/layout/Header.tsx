'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('credit_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        setCredits(data?.balance ?? 0)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <span className="text-white font-black text-base">C</span>
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight">Carcheck</span>
              <span className="font-black text-blue-600 text-lg tracking-tight"> Pro</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#como-funciona" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
              Como funciona
            </Link>
            <Link href="/#pacotes" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
              Preços
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Dashboard
                </Link>
                {credits !== null && (
                  <Link href="/comprar" className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    <span>💳</span>
                    <span>{credits} créditos</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-slate-600 hover:text-red-600 transition-colors font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/comprar">
                  <Button size="sm">Comprar créditos</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          <Link href="/#como-funciona" className="block py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>
            Como funciona
          </Link>
          <Link href="/#pacotes" className="block py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>
            Preços
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              {credits !== null && (
                <Link href="/comprar" className="flex items-center gap-2 py-2 text-blue-700 font-semibold" onClick={() => setMenuOpen(false)}>
                  <span>💳</span> {credits} créditos disponíveis
                </Link>
              )}
              <button onClick={handleSignOut} className="block py-2 text-red-600 font-medium w-full text-left">
                Sair
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" fullWidth>Entrar</Button>
              </Link>
              <Link href="/comprar" onClick={() => setMenuOpen(false)}>
                <Button fullWidth>Comprar créditos</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
