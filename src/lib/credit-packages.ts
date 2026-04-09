import { CreditPackage } from '@/types'

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Consulta SMART',
    credits: 26,
    price: 25.99,
    price_formatted: 'R$ 25,99',
    queries: 1,
    color: 'emerald',
    popular: false,
    features: [
      '1 consulta SMART completa',
      'Dados básicos do veículo',
      'Sinistro / Perda Total',
      'Gravame (alienação)',
      'Restrições federais',
      'Roubo / Furto',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF',
    ],
  },
  {
    id: 'recommended',
    name: 'Consulta Completa + Leilão',
    credits: 49,
    price: 48.90,
    price_formatted: 'R$ 48,90',
    queries: 1,
    badge: 'Recomendado',
    color: 'blue',
    popular: true,
    features: [
      '1 consulta COMPLETA com leilão',
      'Tudo do plano SMART',
      'Histórico de leilões (Prime)',
      'Frota / Remarketing',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF completo',
    ],
  },
  {
    id: 'pro',
    name: 'Pacote Profissional',
    credits: 98,
    price: 89.90,
    price_formatted: 'R$ 89,90',
    queries: 2,
    color: 'purple',
    popular: false,
    features: [
      '2 consultas COMPLETAS com leilão',
      'Tudo do plano Completo',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF completo',
      'Histórico salvo',
    ],
  },
]

// Créditos por tipo de consulta
export const CREDITS_POR_TIPO: Record<string, number> = {
  smart: 26,
  completo: 49,
  premium: 49, // alias legado
}

/** @deprecated use CREDITS_POR_TIPO */
export const CREDITS_PER_QUERY = 26

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(p => p.id === id)
}

export function calculateQueriesFromCredits(credits: number, tipo: 'smart' | 'completo' = 'smart'): number {
  const cost = CREDITS_POR_TIPO[tipo] ?? 26
  return Math.floor(credits / cost)
}
