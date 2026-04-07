import { CreditPackage } from '@/types'

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Pacote Inicial',
    credits: 16,
    price: 15.99,
    price_formatted: 'R$ 15,99',
    queries: 1,
    color: 'emerald',
    popular: false,
    features: [
      '1 consulta SMART completa',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF',
      'Válido por 30 dias',
    ],
  },
  {
    id: 'recommended',
    name: 'Pacote Recomendado',
    credits: 48,
    price: 39.90,
    price_formatted: 'R$ 39,90',
    queries: 3,
    badge: 'Mais vendido',
    color: 'blue',
    popular: true,
    features: [
      '3 consultas SMART completas',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF',
      'Histórico salvo',
      'Válido por 60 dias',
    ],
  },
  {
    id: 'smart',
    name: 'Pacote Inteligente',
    credits: 100,
    price: 69.90,
    price_formatted: 'R$ 69,90',
    queries: 6,
    color: 'purple',
    popular: false,
    features: [
      '6+ consultas SMART completas',
      'Score Anti-Bomba',
      'Preço Justo IA',
      'Relatório PDF',
      'Monitoramento de veículo',
      'Suporte prioritário',
      'Válido por 90 dias',
    ],
  },
]

export const CREDITS_PER_QUERY = 16

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(p => p.id === id)
}

export function calculateQueriesFromCredits(credits: number): number {
  return Math.floor(credits / CREDITS_PER_QUERY)
}
