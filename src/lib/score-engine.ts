import { VehicleData, ScoreResult, Alert } from '@/types'

const BASE_SCORE = 100

export function calculateScore(vehicle: VehicleData): ScoreResult {
  let score = BASE_SCORE
  const alerts: Alert[] = []
  const recommendations: string[] = []

  const breakdown = {
    base: BASE_SCORE,
    sinistro: 0,
    gravame: 0,
    restricoes: 0,
    idade: 0,
  }

  // ---- SINISTRO ----
  if (vehicle.sinistro) {
    breakdown.sinistro = -30
    score -= 30
    alerts.push({
      type: 'danger',
      title: 'Sinistro Registrado',
      description: 'Este veículo possui registro de sinistro (acidente, colisão ou perda total). Verifique o histórico completo antes de comprar.',
      icon: '🚨',
    })
    recommendations.push('Solicite laudo de vistoria cautelar antes de negociar')
    recommendations.push('Exija histórico completo de reparos e peças substituídas')
  }

  // ---- GRAVAME ----
  if (vehicle.gravame) {
    breakdown.gravame = -20
    score -= 20
    alerts.push({
      type: 'warning',
      title: 'Gravame Financeiro Ativo',
      description: 'Existe uma restrição financeira (financiamento ou alienação) sobre este veículo. O carro pode estar comprometido como garantia.',
      icon: '⚠️',
    })
    recommendations.push('Verifique se o financiamento está quitado antes de transferir')
    recommendations.push('Exija o CRV original e certidão de quitação')
  }

  // ---- RESTRIÇÕES ----
  const numRestricoes = vehicle.restricoes?.length ?? 0
  if (numRestricoes > 0) {
    const deducao = Math.min(numRestricoes * 10, 25)
    breakdown.restricoes = -deducao
    score -= deducao
    alerts.push({
      type: 'warning',
      title: `${numRestricoes} Restrição(ões) Encontrada(s)`,
      description: `Foram encontradas ${numRestricoes} restrição(ões) no veículo: ${vehicle.restricoes?.join(', ')}`,
      icon: '🔒',
    })
    recommendations.push('Regularize as restrições antes de concluir a compra')
  }

  // ---- IDADE DO VEÍCULO ----
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - vehicle.ano
  if (vehicleAge > 15) {
    breakdown.idade = -15
    score -= 15
    alerts.push({
      type: 'info',
      title: 'Veículo com mais de 15 anos',
      description: 'Carros mais antigos podem apresentar maior desgaste mecânico e menor disponibilidade de peças.',
      icon: '📅',
    })
    recommendations.push('Realize revisão completa antes de adquirir')
  } else if (vehicleAge > 10) {
    breakdown.idade = -8
    score -= 8
  } else if (vehicleAge > 7) {
    breakdown.idade = -4
    score -= 4
  }

  // ---- OBSERVAÇÕES ----
  if (vehicle.observacoes && vehicle.observacoes.length > 0) {
    vehicle.observacoes.forEach(obs => {
      alerts.push({
        type: 'info',
        title: 'Observação',
        description: obs,
        icon: 'ℹ️',
      })
    })
  }

  // Score mínimo 0
  score = Math.max(0, Math.min(100, score))

  // Recomendações gerais
  if (score >= 80) {
    recommendations.push('Realize teste de rodagem antes de fechar negócio')
    recommendations.push('Confirme documentação (CRV, CRLV) original e atualizada')
  }

  // Risk level
  let risk_level: 'safe' | 'attention' | 'danger'
  let risk_label: string
  let risk_color: string

  if (score >= 80) {
    risk_level = 'safe'
    risk_label = 'Compra Segura'
    risk_color = '#22c55e'
  } else if (score >= 50) {
    risk_level = 'attention'
    risk_label = 'Requer Atenção'
    risk_color = '#f59e0b'
  } else {
    risk_level = 'danger'
    risk_label = 'Alto Risco'
    risk_color = '#ef4444'
  }

  return {
    total: score,
    breakdown,
    risk_level,
    risk_label,
    risk_color,
    recommendations,
    alerts,
  }
}
