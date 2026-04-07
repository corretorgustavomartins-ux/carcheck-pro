'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlateInput } from '@/components/ui/PlateInput'
import { Button } from '@/components/ui/Button'
import { VehicleService } from '@/lib/vehicle-service'

export function HeroSection() {
  const router = useRouter()
  const [plate, setPlate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    const cleanPlate = plate.replace(/[^A-Z0-9]/g, '')
    if (!VehicleService.validatePlate(cleanPlate)) {
      setError('Digite uma placa válida. Ex: ABC1D23 ou ABC1234')
      return
    }
    setError('')
    setLoading(true)
    // Redirect to resultado page with plate
    router.push(`/resultado?placa=${cleanPlate}`)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Score Anti-Bomba + Preço Justo IA
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Descubra se o carro é{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
              bomba
            </span>{' '}
            antes de comprar
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Consulte histórico, sinistro, gravame, FIPE e receba um{' '}
            <strong className="text-white">score inteligente</strong> com preço justo por apenas 16 créditos.
          </p>

          {/* Plate Search */}
          <div className="max-w-xl mx-auto space-y-4 mb-10">
            <PlateInput
              value={plate}
              onChange={setPlate}
              onSearch={handleSearch}
              error={error}
              size="lg"
            />
            <Button
              onClick={handleSearch}
              loading={loading}
              size="xl"
              fullWidth
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl shadow-blue-500/30 text-lg py-4 rounded-2xl"
            >
              🔍 Ver score do carro
            </Button>
            <p className="text-xs text-slate-500">
              🔓 Prévia grátis • 16 créditos para relatório completo
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: '48k+', label: 'Consultas realizadas' },
              { value: '94%', label: 'Golpes evitados' },
              { value: '4.9⭐', label: 'Avaliação média' },
            ].map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 40L0 60Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  )
}
