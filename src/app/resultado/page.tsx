'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { VehicleService } from '@/lib/vehicle-service'
import { VehiclePreview } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PlateInput } from '@/components/ui/PlateInput'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

function ResultadoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plate = searchParams.get('placa') || ''

  const [preview, setPreview] = useState<VehiclePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPlate, setNewPlate] = useState(plate.replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]{3})(.+)$/, '$1-$2'))

  useEffect(() => {
    if (!plate) {
      router.push('/')
      return
    }
    loadPreview()
  }, [plate])

  const loadPreview = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await VehicleService.getPreview(plate)
      setPreview(data)
    } catch {
      setError('Erro ao consultar placa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = () => {
    const clean = newPlate.replace(/[^A-Z0-9]/g, '')
    if (VehicleService.validatePlate(clean)) {
      router.push(`/resultado?placa=${clean}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Consultando placa</h3>
          <p className="text-slate-500 text-sm">Buscando dados do veículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Search bar */}
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Consultar outra placa</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <PlateInput
                value={newPlate}
                onChange={setNewPlate}
                onSearch={handleNewSearch}
                size="md"
              />
            </div>
            <Button onClick={handleNewSearch} size="md">
              Buscar
            </Button>
          </div>
        </Card>

        {error ? (
          <Card className="text-center py-10">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{error}</h3>
            <Button onClick={loadPreview} variant="outline" size="sm">Tentar novamente</Button>
          </Card>
        ) : preview ? (
          <>
            {/* Preview Card */}
            <Card className="mb-6 overflow-hidden" shadow="lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 -mx-6 -mt-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Prévia Grátis</div>
                    <div className="text-white text-2xl font-black tracking-wider">
                      {VehicleService.formatPlate(preview.placa)}
                    </div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-400/20 rounded-xl px-4 py-2 text-center">
                    <div className="text-blue-300 text-xs">FIPE estimada</div>
                    <div className="text-white font-bold text-sm">{preview.fipe_formatted}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoRow icon="🚗" label="Veículo" value={`${preview.marca} ${preview.modelo}`} />
                <InfoRow icon="📅" label="Ano" value={String(preview.ano)} />
                <InfoRow icon="📍" label="Cidade" value={preview.cidade} />
                <InfoRow icon="💰" label="FIPE" value={preview.fipe_formatted} />
              </div>

              {/* Blurred items */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Relatório SMART completo
                </div>
                {['Score Anti-Bomba (0-100)', 'Registro de Sinistro', 'Gravame Financeiro', 'Restrições Ativas', 'Preço Justo IA', 'Dica de Negociação', 'PDF do Relatório'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 relative overflow-hidden">
                    <span className="text-slate-700 text-sm font-medium blur-sm select-none">{item}</span>
                    <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded">🔒 Bloqueado</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl mb-2">🔓</div>
                <h3 className="font-black text-slate-900 text-lg mb-1">Desbloquear score completo</h3>
                <p className="text-slate-500 text-sm mb-4">Use 16 créditos para ver sinistro, gravame, score e preço justo</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/consulta?placa=${plate}`} className="flex-1">
                    <Button fullWidth size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700">
                      🔓 Desbloquear por 16 créditos
                    </Button>
                  </Link>
                  <Link href="/comprar">
                    <Button variant="outline" size="lg">
                      Comprar créditos
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mt-3">Primeiro acesso? Cadastre-se e ganhe 5 créditos grátis</p>
              </div>
            </Card>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔐', text: 'Dados oficiais' },
                { icon: '⚡', text: 'Resultado em segundos' },
                { icon: '📄', text: 'PDF incluso' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center border border-slate-100">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs text-slate-600 font-medium">{item.text}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-semibold text-slate-800 text-sm">{value}</div>
      </div>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense>
      <ResultadoContent />
    </Suspense>
  )
}
