import { VehicleData, VehiclePreview } from '@/types'

// ============================================
// MOCK DATA - substitua por API real
// ============================================

const MOCK_VEHICLES: Record<string, VehicleData> = {
  'ABC1D23': {
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    versao: '2.0 XEi Dynamic Force Flex',
    ano: 2020,
    combustivel: 'Flex',
    cambio: 'Automático CVT',
    cidade: 'São Paulo',
    uf: 'SP',
    fipe: 98500,
    fipe_codigo: '005297-6',
    sinistro: false,
    gravame: false,
    restricoes: [],
    cor: 'Prata',
    chassi_parcial: '***1234***',
  },
  'XYZ9H87': {
    placa: 'XYZ9H87',
    marca: 'Honda',
    modelo: 'Civic',
    versao: '1.5 Touring Turbo',
    ano: 2019,
    combustivel: 'Gasolina',
    cambio: 'Automático CVT',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    fipe: 112000,
    sinistro: true,
    gravame: false,
    restricoes: ['Multa administrativa'],
    cor: 'Preto',
    chassi_parcial: '***5678***',
  },
  'DEF2E34': {
    placa: 'DEF2E34',
    marca: 'Volkswagen',
    modelo: 'Polo',
    versao: '1.0 TSI Highline',
    ano: 2022,
    combustivel: 'Flex',
    cambio: 'Automático 6 marchas',
    cidade: 'Curitiba',
    uf: 'PR',
    fipe: 78000,
    sinistro: false,
    gravame: true,
    restricoes: [],
    cor: 'Branco',
    chassi_parcial: '***9012***',
  },
  'GHI3F45': {
    placa: 'GHI3F45',
    marca: 'Chevrolet',
    modelo: 'Onix',
    versao: '1.0 Turbo Premier',
    ano: 2021,
    combustivel: 'Flex',
    cambio: 'Automático 6 marchas',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    fipe: 72000,
    sinistro: true,
    gravame: true,
    restricoes: ['Restrição judicial', 'Débito IPVA'],
    cor: 'Vermelho',
    chassi_parcial: '***3456***',
  },
}

// ============================================
// SERVIÇO DE VEÍCULOS
// ============================================

export class VehicleService {
  /**
   * Busca prévia grátis (sem consumir créditos)
   */
  static async getPreview(plate: string): Promise<VehiclePreview | null> {
    // Normalizar placa
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))

    // Buscar nos mocks
    const vehicle = MOCK_VEHICLES[normalizedPlate]

    if (!vehicle) {
      // Gerar dado genérico para qualquer placa não mapeada
      return generateGenericPreview(normalizedPlate)
    }

    return {
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      cidade: vehicle.cidade,
      fipe_min: Math.round(vehicle.fipe * 0.9),
      fipe_max: Math.round(vehicle.fipe * 1.1),
      fipe_formatted: formatFipeRange(vehicle.fipe),
      is_preview: true,
    }
  }

  /**
   * Busca consulta completa (consome 16 créditos)
   */
  static async getFullReport(plate: string): Promise<VehicleData | null> {
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1200))

    const vehicle = MOCK_VEHICLES[normalizedPlate]

    if (!vehicle) {
      return generateGenericVehicle(normalizedPlate)
    }

    return vehicle
  }

  /**
   * Valida formato da placa (Mercosul e antiga)
   */
  static validatePlate(plate: string): boolean {
    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    // Formato Mercosul: ABC1D23
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(normalized)
    // Formato antigo: ABC1234
    const antigo = /^[A-Z]{3}[0-9]{4}$/.test(normalized)
    return mercosul || antigo
  }

  /**
   * Formata placa para exibição
   */
  static formatPlate(plate: string): string {
    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (normalized.length === 7) {
      return `${normalized.slice(0, 3)}-${normalized.slice(3)}`
    }
    return normalized
  }
}

// ============================================
// HELPERS INTERNOS
// ============================================

function generateGenericPreview(plate: string): VehiclePreview {
  const brands = ['Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Hyundai', 'Toyota']
  const models = ['HB20', 'Gol', 'Uno', 'Ka', 'Creta', 'Etios']
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre']

  const hash = plate.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const brand = brands[hash % brands.length]
  const model = models[hash % models.length]
  const city = cities[hash % cities.length]
  const year = 2015 + (hash % 9)
  const fipe = 30000 + (hash % 50) * 1000

  return {
    placa: plate,
    marca: brand,
    modelo: model,
    ano: year,
    cidade: city,
    fipe_min: Math.round(fipe * 0.9),
    fipe_max: Math.round(fipe * 1.1),
    fipe_formatted: formatFipeRange(fipe),
    is_preview: true,
  }
}

function generateGenericVehicle(plate: string): VehicleData {
  const brands = ['Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Hyundai', 'Toyota']
  const models = ['HB20', 'Gol', 'Uno', 'Ka', 'Creta', 'Etios']
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre']

  const hash = plate.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  return {
    placa: plate,
    marca: brands[hash % brands.length],
    modelo: models[hash % models.length],
    versao: '1.0 Comfort',
    ano: 2015 + (hash % 9),
    combustivel: 'Flex',
    cambio: 'Manual 5 marchas',
    cidade: cities[hash % cities.length],
    uf: 'SP',
    fipe: 30000 + (hash % 50) * 1000,
    sinistro: hash % 5 === 0,
    gravame: hash % 4 === 0,
    restricoes: hash % 3 === 0 ? ['Débito IPVA'] : [],
    cor: ['Branco', 'Prata', 'Preto', 'Cinza'][hash % 4],
    chassi_parcial: '***' + hash.toString().slice(-4) + '***',
  }
}

function formatFipeRange(fipe: number): string {
  const min = fipe * 0.9
  const max = fipe * 1.1
  return `R$ ${Math.round(min / 1000)}k – R$ ${Math.round(max / 1000)}k`
}
