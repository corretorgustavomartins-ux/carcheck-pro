'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/dashboard'
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const supabase = createClient()

    if (tab === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou senha incorretos.')
        setLoading(false)
        return
      }
      if (data.session) {
        // Aguarda o supabase salvar a sessão no storage antes de redirecionar
        await new Promise(r => setTimeout(r, 500))
        window.location.replace('/dashboard')
        return
      }
    } else {
      if (password.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError('Este email já está cadastrado. Faça login.')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }
      // Confirmação desabilitada → sessão criada direto
      if (data.session) {
        // Aguarda o supabase salvar a sessão no storage antes de redirecionar
        await new Promise(r => setTimeout(r, 500))
        window.location.replace('/dashboard')
        return
      }
      // Confirmação ainda ativa → mostrar mensagem
      setSuccess('Verifique seu email para confirmar o cadastro.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #0c1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 16px 32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Glow effects */}
      <div style={{ position: 'absolute', top: 80, right: 40, width: 384, height: 384, background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 80, left: 40, width: 320, height: 320, background: 'rgba(6,182,212,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>C</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>Carcheck Pro</span>
          </Link>
          <p style={{ color: '#94a3b8', marginTop: 10, fontSize: 14 }}>
            Entre ou crie sua conta para acessar o dashboard
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            color: '#34d399', padding: '6px 14px', borderRadius: 999, fontSize: 13, marginTop: 10,
          }}>
            🎁 Ganhe 5 créditos grátis no cadastro
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                  background: tab === t ? '#2563eb' : 'transparent',
                  color: tab === t ? '#fff' : '#94a3b8',
                  boxShadow: tab === t ? '0 4px 14px rgba(37,99,235,0.4)' : 'none',
                }}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, padding: '12px 16px',
                  color: '#fff', fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, padding: '12px 16px',
                  color: '#fff', fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 12, padding: '12px 16px', color: '#34d399', fontSize: 14,
              }}>
                ✅ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: loading ? '#1e40af' : '#2563eb',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                marginTop: 4,
              }}
            >
              {loading
                ? (tab === 'login' ? 'Entrando...' : 'Criando conta...')
                : (tab === 'login' ? 'Entrar' : 'Criar conta grátis')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 20 }}>
          Ao entrar, você concorda com os{' '}
          <Link href="/termos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Termos de uso</Link>
          {' '}e a{' '}
          <Link href="/privacidade" style={{ color: '#94a3b8', textDecoration: 'none' }}>Política de privacidade</Link>
        </p>
      </div>
    </div>
  )
}
