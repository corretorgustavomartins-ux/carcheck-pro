'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Card'
import { PlateInput } from '@/components/ui/PlateInput'
import { VehicleService } from '@/lib/vehicle-service'
import { VehicleReport } from '@/types'
import { formatDate, formatCurrency, formatPlate, getRiskColor } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [reports, setReports] = useState<VehicleReport[]>([])
  const [loading, setLoading] = useState(true)
  const [plate, setPlate] = useState('')
  const [plateError, setPlateError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      // Load credits
      const { data: wallet } = await supabase
        .from('credit_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      setCredits(wallet?.balance ?? 0)

      // Load recent reports
      const { data: reps } = await supabase
        .from('vehicle_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setReports(reps || [])

      setLoading(false)
    }

    loadData()
  }, [])

  const handleNewQuery = () => {
    const clean = plate.replace(/[^A-Z0-9]/g, '')
    if (!VehicleService.validatePlate(clean)) {
      setPlateError('Digite uma placa válida. Ex: ABC1D23')
      return
    }
    if (credits < 16) {
      toast.error('Créditos insuficientes! Compre créditos para consultar.')
      router.push('/comprar')
      return
    }
    setPlateError('')
    router.push(`/consulta?placa=${clean}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Olá, {profile?.nome?.split(' ')[0] || 'usuário'} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">{profile?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-center">
              <div className="text-2xl font-black text-blue-700">{credits}</div>
              <div className="text-xs text-blue-500 font-medium">créditos</div>
            </div>
            <Link href="/comprar">
              <Button size="sm">+ Comprar créditos</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="💳"
            value={String(credits)}
            label="Créditos disponíveis"
            color="blue"
          />
          <StatCard
            icon="🔍"
            value={String(reports.length)}
            label="Consultas realizadas"
            color="purple"
          />
          <StatCard
            icon="✅"
            value={String(reports.filter(r => r.risk_level === 'safe').length)}
            label="Compras seguras"
            color="green"
          />
          <StatCard
            icon="⚠️"
            value={String(reports.filter(r => r.risk_level !== 'safe').length)}
            label="Alertas detectados"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Query */}
          <div className="lg:col-span-1">
            <Card shadow="md">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🔍</span> Nova consulta
              </h2>

              {credits < 16 ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">💳</div>
                  <p className="text-slate-600 text-sm mb-4">
                    Você precisa de pelo menos <strong>16 créditos</strong> para fazer uma consulta SMART.
                  </p>
                  <p className="text-slate-400 text-xs mb-4">Créditos atuais: {credits}</p>
                  <Link href="/comprar">
                    <Button fullWidth>Comprar créditos</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Digite a placa para consultar. Consome <strong>16 créditos</strong>.
                  </p>
                  <div className="space-y-3">
                    <PlateInput
                      value={plate}
                      onChange={setPlate}
                      onSearch={handleNewQuery}
                      error={plateError}
                      size="md"
                    />
                    <Button onClick={handleNewQuery} fullWidth size="lg">
                      🔓 Consultar — 16 créditos
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Restam {Math.floor(credits / 16)} consulta{Math.floor(credits / 16) !== 1 ? 's' : ''} com seus créditos
                  </p>
                </>
              )}
            </Card>

            {/* Quick Links */}
            <Card className="mt-4" shadow="sm">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Acesso rápido</h3>
              <div className="space-y-1">
                {[
                  { href: '/comprar', icon: '💳', label: 'Comprar créditos' },
                  { href: '/dashboard/transacoes', icon: '📋', label: 'Histórico de compras' },
                  { href: '/dashboard/perfil', icon: '👤', label: 'Meu perfil' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm text-slate-700"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <Card shadow="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xl">📋</span> Histórico de consultas
                </h2>
                <span className="text-xs text-slate-400">{reports.length} consulta{reports.length !== 1 ? 's' : ''}</span>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🚗</div>
                  <p className="text-slate-500 text-sm">Nenhuma consulta realizada ainda.</p>
                  <p className="text-slate-400 text-xs mt-1">Faça sua primeira consulta de placa!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: string, value: string, label: string, color: string }) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    green: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
  }
  const textMap = {
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
  }

  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color as keyof typeof colorMap]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-black ${textMap[color as keyof typeof textMap]}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}

function ReportCard({ report }: { report: VehicleReport }) {
  const riskColors = {
    safe: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    attention: 'bg-amber-50 border-amber-200 text-amber-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }
  const riskLabels = {
    safe: '✅ Seguro',
    attention: '⚠️ Atenção',
    danger: '🚨 Risco',
  }

  const vehicle = report.api_payload_json as any

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600 text-xs">
          {formatPlate(report.plate).slice(0, 3)}
        </div>
        <div>
          <div className="font-semibold text-slate-800 text-sm">
            {vehicle?.marca} {vehicle?.modelo} {vehicle?.ano}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span>📍 {formatPlate(report.plate)}</span>
            <span>•</span>
            <span>🕐 {formatDate(report.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-lg font-black text-slate-900">{report.score}</div>
          <div className="text-xs text-slate-400">Score</div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskColors[report.risk_level]}`}>
          {riskLabels[report.risk_level]}
        </span>
        <Link href={`/consulta/${report.id}`}>
          <button className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  )
}
