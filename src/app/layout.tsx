import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carcheck Pro — Descubra se o carro é bomba antes de comprar',
  description: 'Consulte histórico, sinistro, gravame, FIPE e receba um score inteligente com preço justo. O Serasa dos carros usados.',
  keywords: 'consulta veicular, placa, sinistro, gravame, FIPE, score, carcheck',
  openGraph: {
    title: 'Carcheck Pro — Score Anti-Bomba para carros usados',
    description: 'Descubra em segundos se o carro é uma bomba ou vale a pena comprar.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
