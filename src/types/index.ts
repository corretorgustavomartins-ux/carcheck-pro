// ===== TIPOS GLOBAIS DO SISTEMA =====

export interface User {
  id: string
  email: string
  nome: string
  avatar_url?: string
  created_at: string
}

export interface CreditWallet {
  id: string
  user_id: string
  balance: number
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  package: 'starter' | 'recommended' | 'smart'
  amount: number
  credits: number
  payment_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  payment_id?: string
  pix_code?: string
  created_at: string
}

export interface VehicleReport {
  id: string
  user_id: string
  plate: string
  score: number
  fair_price: number
  risk_level: 'safe' | 'attention' | 'danger'
  api_payload_json: VehicleData
  pdf_url?: string
  credits_consumed: number
  created_at: string
}

export interface MonitoredVehicle {
  id: string
  user_id: string
  plate: string
  expires_at: string
  created_at: string
}

// ===== DADOS DO VEÍCULO =====

export interface VehicleData {
  placa: string
  marca: string
  modelo: string
  versao?: string
  ano: number
  combustivel?: string
  cambio?: string
  cidade: string
  fipe: number
  fipe_codigo?: string
  sinistro: boolean
  gravame: boolean
  restricoes?: string[]
  observacoes?: string[]
  cor?: string
  chassi_parcial?: string
  municipio_emplacamento?: string
  uf?: string
  raw_api?: Record<string, unknown>
}

// ===== SCORE ENGINE =====

export interface ScoreResult {
  total: number
  breakdown: {
    sinistro: number
    gravame: number
    restricoes: number
    idade: number
    base: number
  }
  risk_level: 'safe' | 'attention' | 'danger'
  risk_label: string
  risk_color: string
  recommendations: string[]
  alerts: Alert[]
}

export interface Alert {
  type: 'danger' | 'warning' | 'info'
  title: string
  description: string
  icon: string
}

// ===== PREÇO JUSTO =====

export interface PricingResult {
  fipe_value: number
  fair_price: number
  discount_percent: number
  discount_value: number
  negotiation_tip: string
  price_label: string
  verdict: 'abaixo' | 'justo' | 'acima'
  verdict_label: string
  factors: PricingFactor[]
}

export interface PricingFactor {
  label: string
  impact: number
  description: string
}

// ===== PACOTES DE CRÉDITOS =====

export interface CreditPackage {
  id: 'starter' | 'recommended' | 'smart'
  name: string
  credits: number
  price: number
  price_formatted: string
  queries: number
  badge?: string
  color: string
  popular: boolean
  features: string[]
}

// ===== PRÉVIA GRÁTIS =====

export interface VehiclePreview {
  placa: string
  marca: string
  modelo: string
  ano: number
  cidade: string
  fipe_min: number
  fipe_max: number
  fipe_formatted: string
  is_preview: true
}

// ===== API RESPONSES =====

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaymentResponse {
  payment_id: string
  pix_code: string
  pix_qr_base64: string
  expires_at: string
  amount: number
  status: 'pending'
}
