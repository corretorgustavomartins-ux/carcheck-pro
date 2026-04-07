'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

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

        {/* Auth Form */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'rgba(255,255,255,0.05)',
                    defaultButtonBackgroundHover: 'rgba(255,255,255,0.1)',
                    defaultButtonBorder: 'rgba(255,255,255,0.15)',
                    defaultButtonText: 'white',
                    dividerBackground: 'rgba(255,255,255,0.1)',
                    inputBackground: 'rgba(255,255,255,0.05)',
                    inputBorder: 'rgba(255,255,255,0.15)',
                    inputBorderHover: '#3b82f6',
                    inputBorderFocus: '#3b82f6',
                    inputText: 'white',
                    inputLabelText: 'rgba(255,255,255,0.7)',
                    inputPlaceholder: 'rgba(255,255,255,0.3)',
                    messageText: 'rgba(255,255,255,0.7)',
                    anchorTextColor: '#60a5fa',
                    anchorTextHoverColor: '#93c5fd',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '12px',
                    baseButtonSize: '14px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'font-semibold',
              },
            }}
            providers={['google']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha forte',
                  button_label: 'Criar conta',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem conta? Cadastre-se',
                  confirmation_text: 'Verifique seu email para confirmar o cadastro',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Nova senha',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  link_text: 'Esqueceu a senha?',
                  confirmation_text: 'Verifique seu email para redefinir a senha',
                },
              },
            }}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined}
          />
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
