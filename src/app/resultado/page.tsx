'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Página /resultado — legada
 * Redireciona para o novo fluxo: /selecionar-consulta
 */
function ResultadoRedirect() {
  const searchParams = useSearchParams()
  const plate = (searchParams.get('placa') || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

  useEffect(() => {
    if (plate && plate.length >= 7) {
      window.location.replace(`/selecionar-consulta?placa=${plate}`)
    } else {
      window.location.replace('/dashboard')
    }
  }, [plate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid rgba(59,130,246,0.2)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Redirecionando...</p>
      </div>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense>
      <ResultadoRedirect />
    </Suspense>
  )
}
