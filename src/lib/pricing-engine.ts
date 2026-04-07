import { VehicleData, PricingResult, PricingFactor } from '@/types'

export function calculateFairPrice(vehicle: VehicleData, score: number): PricingResult {
  const fipe = vehicle.fipe
  let discountMultiplier = 1.0
  const factors: PricingFactor[] = []

  // ---- SINISTRO: -25% ----
  if (vehicle.sinistro) {
    discountMultiplier -= 0.25
    factors.push({
      label: 'Sinistro registrado',
      impact: -25,
      description: 'Redução por histórico de sinistro/acidente',
    })
  }

  // ---- GRAVAME: alerta, sem redução de preço ----
  if (vehicle.gravame) {
    factors.push({
      label: 'Gravame financeiro',
      impact: 0,
      description: 'Alerta: verifique quitação antes de transferir',
    })
  }

  // ---- RESTRIÇÕES: -5% cada (máx -15%) ----
  const numRestricoes = vehicle.restricoes?.length ?? 0
  if (numRestricoes > 0) {
    const deducao = Math.min(numRestricoes * 0.05, 0.15)
    discountMultiplier -= deducao
    factors.push({
      label: `${numRestricoes} restrição(ões)`,
      impact: -(deducao * 100),
      description: 'Redução por restrições ativas no veículo',
    })
  }

  // ---- IDADE ----
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - vehicle.ano
  if (vehicleAge > 15) {
    discountMultiplier -= 0.10
    factors.push({
      label: 'Veículo acima de 15 anos',
      impact: -10,
      description: 'Redução por idade avançada do veículo',
    })
  } else if (vehicleAge > 10) {
    discountMultiplier -= 0.05
    factors.push({
      label: 'Veículo acima de 10 anos',
      impact: -5,
      description: 'Leve redução por idade do veículo',
    })
  }

  // Garantia mínima de 50% do FIPE
  discountMultiplier = Math.max(0.5, discountMultiplier)

  const fairPrice = Math.round(fipe * discountMultiplier / 100) * 100
  const discountValue = fipe - fairPrice
  const discountPercent = Math.round((discountValue / fipe) * 100)

  // Dica de negociação
  let negotiation_tip = ''
  if (discountPercent === 0) {
    negotiation_tip = 'O veículo está em ótimas condições. Negocie pequenos ajustes para custos de transferência.'
  } else if (discountPercent <= 10) {
    negotiation_tip = `Argumente um desconto de ${discountPercent}% pela condição do veículo. Use os alertas como argumento.`
  } else {
    negotiation_tip = `Exija pelo menos ${discountPercent}% de desconto. Apresente este relatório ao vendedor.`
  }

  // Price label
  let price_label = ''
  let verdict: 'abaixo' | 'justo' | 'acima'
  let verdict_label = ''

  if (discountPercent === 0) {
    verdict = 'justo'
    verdict_label = 'Preço justo pelo FIPE'
    price_label = 'Preço alinhado ao mercado'
  } else if (discountPercent <= 15) {
    verdict = 'acima'
    verdict_label = `${discountPercent}% acima do ideal`
    price_label = `Desconto recomendado: R$ ${discountValue.toLocaleString('pt-BR')}`
  } else {
    verdict = 'acima'
    verdict_label = `${discountPercent}% acima do ideal`
    price_label = `Exija pelo menos R$ ${discountValue.toLocaleString('pt-BR')} de desconto`
  }

  return {
    fipe_value: fipe,
    fair_price: fairPrice,
    discount_percent: discountPercent,
    discount_value: discountValue,
    negotiation_tip,
    price_label,
    verdict,
    verdict_label,
    factors,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
