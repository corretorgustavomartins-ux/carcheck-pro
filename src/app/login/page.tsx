'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Se já estiver logado, vai pro dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.')
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (data.session) {
      router.replace('/dashboard')
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirecionar após confirmação (caso esteja ativada)
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Se sessão criada direto (confirmação desabilitada) → vai pro dashboard
    if (data.session) {
      router.replace('/dashboard')
      return
    }

    // Se precisar confirmar email
    setSuccess('Conta criada! Verifique seu email para confirmar e acessar.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4 pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <span className="font-black text-white text-2xl">Carcheck Pro</span>
          </Link>
          <p className="text-slate-400 mt-3 text-sm">Entre para acessar seu dashboard e histórico</p>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm mt-3">
            🎁 Ganhe 5 créditos grátis no cadastro
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-white/5 rounded-2xl p-1">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'signup'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading
                ? (tab === 'login' ? 'Entrando...' : 'Criando conta...')
                : (tab === 'login' ? 'Entrar' : 'Criar conta grátis')
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Ao entrar, você concorda com os{' '}
          <Link href="/termos" className="text-slate-400 hover:text-white transition-colors">Termos de uso</Link>
          {' '}e a{' '}
          <Link href="/privacidade" className="text-slate-400 hover:text-white transition-colors">Política de privacidade</Link>
        </p>
      </div>
    </div>
  )
}
