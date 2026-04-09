/**
 * VehicleService
 * ─────────────────────────────────────────────────────────────
 * Usa a ConsultarPlaca API quando as env vars estiverem configuradas.
 * Cai em mock data caso contrário (modo desenvolvimento sem chave).
 */

import { VehicleData, VehiclePreview } from '@/types'
import { consultarVeiculo, TipoConsulta } from '@/lib/consultarplaca'

/**
 * Custo em créditos por tipo de consulta:
 *   smart    = 16 créditos  (API Prata ~R$12,90)  — SEM leilão
 *   completo = 48 créditos  (API Ouro  ~R$19,90)  — COM leilão
 *   premium  = legacy / upsell (diamante)
 */
export const CREDITOS_POR_PLANO: Record<TipoConsulta, number> = {
  smart:    16,
  completo: 48,
  premium:  48,
}

// ── Verifica se a API real está configurada ──────────────────
function isApiConfigured(): boolean {
  return !!(process.env.CONSULTARPLACA_EMAIL && process.env.CONSULTARPLACA_API_KEY)
}

// ══════════════════════════════════════════════════════════════
//  MOCK DATA — usado apenas quando a API não está configurada
// ══════════════════════════════════════════════════════════════
const MOCK_VEHICLES: Record<string, VehicleData> = {
  'ABC1D23': {
    placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla',
    versao: '2.0 XEi Dynamic Force Flex', ano: 2020,
    combustivel: 'Flex', cambio: 'Automático CVT',
    cidade: 'São Paulo', uf: 'SP', fipe: 98500,
    fipe_codigo: '005297-6', sinistro: false, gravame: false,
    restricoes: [], cor: 'Prata', chassi_parcial: '***1234***',
  },
  'XYZ9H87': {
    placa: 'XYZ9H87', marca: 'Honda', modelo: 'Civic',
    versao: '1.5 Touring Turbo', ano: 2019,
    combustivel: 'Gasolina', cambio: 'Automático CVT',
    cidade: 'Rio de Janeiro', uf: 'RJ', fipe: 112000,
    sinistro: true, gravame: false,
    restricoes: ['Multa administrativa'],
    cor: 'Preto', chassi_parcial: '***5678***',
  },
  'DEF2E34': {
    placa: 'DEF2E34', marca: 'Volkswagen', modelo: 'Polo',
    versao: '1.0 TSI Highline', ano: 2022,
    combustivel: 'Flex', cambio: 'Automático 6 marchas',
    cidade: 'Curitiba', uf: 'PR', fipe: 78000,
    sinistro: false, gravame: true,
    restricoes: [], cor: 'Branco', chassi_parcial: '***9012***',
  },
  'GHI3F45': {
    placa: 'GHI3F45', marca: 'Chevrolet', modelo: 'Onix',
    versao: '1.0 Turbo Premier', ano: 2021,
    combustivel: 'Flex', cambio: 'Automático 6 marchas',
    cidade: 'Belo Horizonte', uf: 'MG', fipe: 72000,
    sinistro: true, gravame: true,
    restricoes: ['Restrição judicial', 'Débito IPVA'],
    cor: 'Vermelho', chassi_parcial: '***3456***',
  },
}

// ══════════════════════════════════════════════════════════════
//  SERVICE
// ══════════════════════════════════════════════════════════════
export class VehicleService {

  /** Prévia grátis — mostra marca, modelo, ano e faixa FIPE */
  static async getPreview(plate: string): Promise<VehiclePreview | null> {
    const p = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (isApiConfigured()) {
      try {
        const result = await consultarVeiculo(p)
        const fipeBase = result.fipe || 0
        return {
          placa:         result.placa,
          marca:         result.marca,
          modelo:        result.modelo,
          ano:           parseInt(result.ano_modelo || result.ano_fabricacao || '0', 10),
          cidade:        result.municipio,
          fipe_min:      Math.round(fipeBase * 0.9),
          fipe_max:      Math.round(fipeBase * 1.1),
          fipe_formatted: formatFipeRange(fipeBase),
          is_preview:    true,
        }
      } catch (err) {
        console.error('[VehicleService] ConsultarPlaca error:', err)
        throw err
      }
    }

    // ── fallback mock ──
    await sleep(800)
    const v = MOCK_VEHICLES[p] ?? generateGenericVehicle(p)
    return {
      placa:         v.placa,
      marca:         v.marca,
      modelo:        v.modelo,
      ano:           v.ano,
      cidade:        v.cidade,
      fipe_min:      Math.round(v.fipe * 0.9),
      fipe_max:      Math.round(v.fipe * 1.1),
      fipe_formatted: formatFipeRange(v.fipe),
      is_preview:    true,
    }
  }

  /** Relatório completo — consome créditos conforme CREDITOS_POR_PLANO */
  static async getFullReport(plate: string, tipo: TipoConsulta = 'smart'): Promise<VehicleData | null> {
    const p = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (isApiConfigured()) {
      try {
        const r = await consultarVeiculo(p, tipo)

        // Monta restricoes incluindo débitos, roubo
        // Leilão só aparece nos planos 'completo' e 'premium'
        const restricoes: string[] = [...r.restricoes]
        if (r.roubo_furto)     restricoes.push('Histórico de roubo/furto')
        if ((tipo === 'completo' || tipo === 'premium') && r.leilao)
          restricoes.push(`Veículo de leilão (Classe ${r.leilao_classificacao})`)
        if (r.debitos_ipva)    restricoes.push('Débito de IPVA')
        if (r.debitos_multa)   restricoes.push('Débito de multa')
        if (r.recall)          restricoes.push(`Recall: ${r.recall_descricao}`)

        return {
          placa:         r.placa,
          marca:         r.marca,
          modelo:        r.modelo,
          versao:        r.versao,
          ano:           parseInt(r.ano_modelo || r.ano_fabricacao || '0', 10),
          combustivel:   r.combustivel,
          cambio:        '',
          cidade:        r.municipio,
          uf:            r.uf,
          fipe:          r.fipe,
          fipe_codigo:   r.fipe_codigo,
          sinistro:      r.sinistro,
          gravame:       r.gravame,
          restricoes,
          cor:           r.cor,
          chassi_parcial: r.chassi ? maskChassi(r.chassi) : '***',
          // Campos extras do Premium (diamante)
          raw_api:       {
            ...r.raw_json,
            recall:              r.recall,
            recall_descricao:    r.recall_descricao,
            leilao:              r.leilao,
            leilao_classificacao: r.leilao_classificacao,
            debitos_ipva:        r.debitos_ipva,
            debitos_multa:       r.debitos_multa,
            roubo_furto:         r.roubo_furto,
            imagens:             r.imagens,
            ficha_tecnica:       r.ficha_tecnica,
          },
        }
      } catch (err) {
        console.error('[VehicleService] ConsultarPlaca full report error:', err)
        throw err
      }
    }

    // ── fallback mock ──
    await sleep(1200)
    return MOCK_VEHICLES[p] ?? generateGenericVehicle(p)
  }

  static validatePlate(plate: string): boolean {
    const n = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    return /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(n) || /^[A-Z]{3}[0-9]{4}$/.test(n)
  }

  static formatPlate(plate: string): string {
    const n = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    return n.length === 7 ? `${n.slice(0, 3)}-${n.slice(3)}` : n
  }
}

// ── Helpers ─────────────────────────────────────────────────

function maskChassi(chassi: string): string {
  if (chassi.length < 6) return '***'
  return `***${chassi.slice(-6, -3)}***`
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function formatFipeRange(fipe: number): string {
  return `R$ ${Math.round(fipe * 0.9 / 1000)}k – R$ ${Math.round(fipe * 1.1 / 1000)}k`
}

function generateGenericVehicle(plate: string): VehicleData {
  const brands = ['Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Hyundai', 'Toyota']
  const models = ['HB20', 'Gol', 'Uno', 'Ka', 'Creta', 'Etios']
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre']
  const hash = plate.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    placa: plate,
    marca: brands[hash % brands.length],
    modelo: models[hash % models.length],
    versao: '1.0 Flex',
    ano: 2015 + (hash % 9),
    combustivel: 'Flex',
    cambio: 'Manual',
    cidade: cities[hash % cities.length],
    uf: 'SP',
    fipe: 30000 + (hash % 50) * 1000,
    sinistro: hash % 5 === 0,
    gravame: hash % 4 === 0,
    restricoes: hash % 3 === 0 ? ['Débito IPVA'] : [],
    cor: ['Branco', 'Prata', 'Preto', 'Cinza'][hash % 4],
    chassi_parcial: `***${hash.toString().slice(-4)}***`,
  }
}
