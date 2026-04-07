/**
 * ══════════════════════════════════════════════════════════
 *  ConsultarPlaca API — Integração completa
 *  Docs: https://docs.consultarplaca.com.br
 *
 *  Fluxo:
 *  1. POST /v2/solicitarRelatorio  → recebe protocolo
 *  2. GET  /v2/consultarProtocolo  → polling até "finalizada"
 * ══════════════════════════════════════════════════════════
 */

const BASE_URL = 'https://api.consultarplaca.com.br'
const MAX_POLL_ATTEMPTS = 12   // tentativas de polling
const POLL_INTERVAL_MS  = 3000 // 3s entre cada tentativa

// ── Credenciais (defina no .env.local) ──────────────────────
function getAuthHeader(): string {
  const email  = process.env.CONSULTARPLACA_EMAIL  || ''
  const apiKey = process.env.CONSULTARPLACA_API_KEY || ''
  if (!email || !apiKey) {
    throw new Error('CONSULTARPLACA_EMAIL e CONSULTARPLACA_API_KEY não configurados no .env.local')
  }
  return 'Basic ' + Buffer.from(`${email}:${apiKey}`).toString('base64')
}

// ── Tipos da resposta da API ─────────────────────────────────
export interface ConsultarPlacaResult {
  placa:           string
  chassi:          string
  marca:           string
  modelo:          string
  versao:          string
  ano_fabricacao:  string
  ano_modelo:      string
  cor:             string
  combustivel:     string
  municipio:       string
  uf:              string
  // Alertas
  sinistro:        boolean
  sinistro_detalhes: string
  gravame:         boolean
  gravame_detalhes: string
  restricoes:      string[]
  roubo_furto:     boolean
  leilao:          boolean
  leilao_classificacao: string // A, B, C, D
  debitos_ipva:    boolean
  debitos_multa:   boolean
  recall:          boolean
  recall_descricao: string
  // FIPE
  fipe:            number
  fipe_codigo:     string
  fipe_modelo:     string
  // Extras exclusivos do plano Diamante (premium)
  imagens:         string[]   // URLs das fotos do veículo
  ficha_tecnica:   Record<string, string>  // dados técnicos extras
  // Raw para guardar no banco
  raw_json:        Record<string, unknown>
}

export type TipoConsulta = 'smart' | 'premium'

// Mapeia nosso tipo interno para o plano da ConsultarPlaca API
function mapTipo(tipo: TipoConsulta): string {
  return tipo === 'premium' ? 'diamante' : 'ouro'
}

// ── Passo 1: solicitar relatório ────────────────────────────
async function solicitarRelatorio(placa: string, tipo: TipoConsulta = 'smart'): Promise<string> {
  const form = new FormData()
  form.append('placa', placa)
  form.append('tipo_consulta', mapTipo(tipo)) // smart→ouro | premium→diamante

  const res = await fetch(`${BASE_URL}/v2/solicitarRelatorio`, {
    method:  'POST',
    headers: { Authorization: getAuthHeader() },
    body:    form,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ConsultarPlaca solicitar erro ${res.status}: ${err}`)
  }

  const data = await res.json()

  if (data.status === 'erro') {
    throw new Error(`ConsultarPlaca: ${data.mensagem} (${data.tipo_do_erro ?? 'sem tipo'})`)
  }

  return data.protocolo as string
}

// ── Passo 2: consultar protocolo (polling) ──────────────────
async function consultarProtocolo(protocolo: string): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS)

    const res = await fetch(
      `${BASE_URL}/v2/consultarProtocolo?protocolo=${protocolo}&tipo_retorno=JSON`,
      { headers: { Authorization: getAuthHeader() } }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`ConsultarPlaca polling erro ${res.status}: ${err}`)
    }

    const data = await res.json()

    if (data.status === 'erro') {
      throw new Error(`ConsultarPlaca: ${data.mensagem}`)
    }

    const situacao = data.situacao_consulta as string
    if (situacao === 'finalizada' || situacao === 'parcialmente_finalizada') {
      return data.dados as Record<string, unknown>
    }
    // situacao === 'em_processamento' → aguarda próxima tentativa
  }

  throw new Error('ConsultarPlaca: timeout — relatório não finalizado em tempo hábil')
}

// ── Parser: transforma o JSON raw em nosso tipo interno ──────
function parseResponse(dados: unknown[], placa: string): ConsultarPlacaResult {
  // Helper para buscar bloco por chave principal
  function get<T>(key: string): T | null {
    const block = dados.find((d: any) => key in d)
    return block ? (block as any)[key] : null
  }

  /* ── Informações do veículo ── */
  const infoVeiculo = get<any>('informacoes_veiculo')
  const dadosVeiculo   = infoVeiculo?.dados_veiculo   ?? {}

  /* ── FIPE ── */
  const fipeBlock     = get<any>('referencia_precificador')
  const precosArray   = fipeBlock?.preco_medio ?? []
  const fipeValor     = precosArray.length > 0
    ? parseInt(precosArray[0].valor ?? '0', 10)
    : 0
  const fipeCodigo    = fipeBlock?.desvalorizacao?.[0]?.codigo ?? ''
  const fipeModeloStr = precosArray[0]?.versao ?? ''

  /* ── Leilão ── */
  const leilaoBlock   = get<any>('informacoes_sobre_leilao')
  const leilaoPossui  = leilaoBlock?.possui_registro === 'sim'
  const leilaoClasse  = leilaoBlock?.registro_sobre_oferta?.classificacao ?? ''

  /* ── Sinistro (leilão ou perda total) ── */
  const perdaTotal    = get<any>('registro_sinistro_com_perda_total')
  const sinistroFlag  = perdaTotal?.possui_registro === 'sim'
  const sinistroDesc  = sinistroFlag ? 'Registro de sinistro com perda total encontrado.' : ''

  /* ── Roubo/Furto ── */
  const rouboBlock    = get<any>('historico_roubo_furto')
  const rouboFlag     = rouboBlock?.registros_roubo_furto?.possui_registro === 'sim'

  /* ── DETRAN restrições ── */
  const detranBlock   = get<any>('informacoes_do_detran')
  const restricoesDet = detranBlock?.restricoes_detran ?? {}
  const restricoes: string[] = []

  if (restricoesDet.restricao_administrativa?.possui_restricao === 'sim')
    restricoes.push(`Restrição administrativa: ${restricoesDet.restricao_administrativa.descricao || restricoesDet.restricao_administrativa.restricao}`)
  if (restricoesDet.restricao_judicial?.possui_restricao === 'sim')
    restricoes.push(`Restrição judicial: ${restricoesDet.restricao_judicial.descricao || restricoesDet.restricao_judicial.restricao}`)
  if (restricoesDet.restricao_tributaria?.possui_restricao === 'sim')
    restricoes.push(`Restrição tributária: ${restricoesDet.restricao_tributaria.descricao || restricoesDet.restricao_tributaria.restricao}`)
  if (restricoesDet.restricao_furto?.possui_restricao === 'sim')
    restricoes.push(`Restrição furto/roubo: ${restricoesDet.restricao_furto.descricao || restricoesDet.restricao_furto.restricao}`)

  /* ── Gravame (RENAJUD / judicial federal) ── */
  const renajudBlock  = get<any>('registro_de_bloqueio_judicial_renajud')
  const gravameFlag   = (renajudBlock?.possui_bloqueio === 'sim') || restricoes.some(r => r.includes('judicial'))
  const gravameDesc   = gravameFlag ? 'Restrição financeira ou judicial encontrada.' : ''

  /* ── Débitos ── */
  const debIpva       = detranBlock?.debitos_detran?.debitos_ipva?.possui_debido === 'sim'
  const debMulta      = detranBlock?.debitos_detran?.debitos_multa?.possui_debido === 'sim'

  /* ── Recall ── */
  const recallBlocks  = dados.filter((d: any) => 'possui_recall' in d)
  const recallFlag    = recallBlocks.some((d: any) => d.possui_recall === 'sim')
  const recallDesc    = recallFlag
    ? (recallBlocks[0] as any)?.registros?.[0]?.montadora ?? 'Recall registrado'
    : ''

  /* ── Imagens (diamante) ── */
  const imagensBlock  = get<any>('galeria_de_fotos')
  const imagens: string[] = imagensBlock?.fotos?.map((f: any) => f.url ?? f).filter(Boolean) ?? []

  /* ── Ficha Técnica (diamante) ── */
  const fichBlock     = get<any>('ficha_tecnica_comparativa')
  const fichaTecnica: Record<string, string> = {}
  if (fichBlock?.itens) {
    for (const item of fichBlock.itens) {
      if (item.descricao && item.valor) fichaTecnica[item.descricao] = item.valor
    }
  }

  return {
    placa:               (dadosVeiculo.placa   ?? placa).toUpperCase(),
    chassi:              dadosVeiculo.chassi   ?? '',
    marca:               dadosVeiculo.marca    ?? '',
    modelo:              dadosVeiculo.modelo   ?? '',
    versao:              fipeModeloStr,
    ano_fabricacao:      dadosVeiculo.ano_fabricacao ?? '',
    ano_modelo:          dadosVeiculo.ano_modelo     ?? dadosVeiculo.ano_fabricacao ?? '',
    cor:                 dadosVeiculo.cor      ?? '',
    combustivel:         dadosVeiculo.combustivel ?? '',
    municipio:           dadosVeiculo.municipio ?? '',
    uf:                  dadosVeiculo.uf_municipio ?? '',
    sinistro:            sinistroFlag,
    sinistro_detalhes:   sinistroDesc,
    gravame:             gravameFlag,
    gravame_detalhes:    gravameDesc,
    restricoes,
    roubo_furto:         rouboFlag,
    leilao:              leilaoPossui,
    leilao_classificacao: leilaoClasse,
    debitos_ipva:        debIpva,
    debitos_multa:       debMulta,
    recall:              recallFlag,
    recall_descricao:    recallDesc,
    fipe:                fipeValor,
    fipe_codigo:         fipeCodigo,
    fipe_modelo:         fipeModeloStr,
    imagens,
    ficha_tecnica:       fichaTecnica,
    raw_json:            { dados },
  }
}

// ── Função principal exportada ───────────────────────────────
/**
 * Consulta completa de um veículo pela placa.
 * Aguarda o processamento assíncrono da API via polling.
 * Lança exceção em caso de erro.
 */
export async function consultarVeiculo(placa: string, tipo: TipoConsulta = 'smart'): Promise<ConsultarPlacaResult> {
  const cleanPlate = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Passo 1: solicitar
  const protocolo = await solicitarRelatorio(cleanPlate, tipo)

  // Passo 2: aguardar e buscar resultado
  const dados = await consultarProtocolo(protocolo)

  // Compatibilidade: dados pode ser array ou objeto
  const dadosArray = Array.isArray(dados) ? dados : [dados]

  return parseResponse(dadosArray, cleanPlate)
}

/**
 * Consulta prévia (somente dados básicos) — usa a mesma rota
 * mas retorna apenas os campos públicos sem sinistro detalhado.
 * Para manter backward compat com vehicle-service.ts.
 */
export async function consultarPreview(placa: string): Promise<{
  placa: string
  marca: string
  modelo: string
  ano: number
  municipio: string
  uf: string
  fipe: number
}> {
  const result = await consultarVeiculo(placa)
  return {
    placa:    result.placa,
    marca:    result.marca,
    modelo:   result.modelo,
    ano:      parseInt(result.ano_modelo || result.ano_fabricacao || '0', 10),
    municipio: result.municipio,
    uf:       result.uf,
    fipe:     result.fipe,
  }
}

// ── Helpers ─────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
