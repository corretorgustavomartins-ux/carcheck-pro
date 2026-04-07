import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPlate(plate: string): string {
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (normalized.length === 7) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`
  }
  return normalized
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'safe':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'attention':
      return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'danger':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-400 to-emerald-500'
  if (score >= 50) return 'from-amber-400 to-yellow-500'
  return 'from-red-400 to-rose-500'
}
