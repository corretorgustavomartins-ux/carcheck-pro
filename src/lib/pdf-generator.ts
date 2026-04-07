import { VehicleData, ScoreResult, PricingResult } from '@/types'

interface PDFParams {
  vehicle: VehicleData
  score: ScoreResult
  pricing: PricingResult
  reportId: string
  plate: string
}

export async function generateVehiclePDF({ vehicle, score, pricing, reportId, plate }: PDFParams) {
  const jsPDF = (await import('jspdf')).default
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = 0

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPlateFn = (p: string) => {
    const clean = p.replace(/[^A-Z0-9]/g, '')
    return clean.length === 7 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean
  }

  // HEADER
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 45, 'F')

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text('CARCHECK', margin, 18)
  doc.setTextColor(255, 255, 255)
  doc.text(' PRO', margin + 45, 18)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('Relatorio SMART de Consulta Veicular', margin, 25)
  doc.text(`ID: ${reportId.slice(0, 8).toUpperCase()}`, pageWidth - margin, 18, { align: 'right' })
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 25, { align: 'right' })

  y = 52

  // PLATE + VEHICLE
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(formatPlateFn(plate), margin, y)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`, margin, y + 8)

  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.text(`${vehicle.cidade}, ${vehicle.uf || ''}`, margin, y + 15)

  y += 28

  // SCORE
  const scoreColor: [number, number, number] = score.risk_level === 'safe'
    ? [34, 197, 94] : score.risk_level === 'attention'
    ? [245, 158, 11] : [239, 68, 68]

  doc.setFillColor(...scoreColor)
  doc.roundedRect(margin, y, 70, 25, 3, 3, 'F')
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(`${score.total}/100`, margin + 35, y + 12, { align: 'center' })
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('SCORE ANTI-BOMBA', margin + 35, y + 20, { align: 'center' })

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scoreColor)
  doc.text(score.risk_label, margin + 80, y + 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  const riskDesc = score.risk_level === 'safe'
    ? 'Veiculo em boas condicoes para compra'
    : score.risk_level === 'attention'
    ? 'Requer verificacao antes de comprar'
    : 'Alto risco - analise com cautela'
  doc.text(riskDesc, margin + 80, y + 20)

  y += 35

  // STATUS ITEMS
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('STATUS DO VEICULO', margin, y)
  y += 6

  const statusItems = [
    { label: 'Sinistro', value: vehicle.sinistro ? 'ENCONTRADO' : 'LIMPO', ok: !vehicle.sinistro },
    { label: 'Gravame', value: vehicle.gravame ? 'ATIVO' : 'LIVRE', ok: !vehicle.gravame },
    { label: 'Restricoes', value: vehicle.restricoes?.length ? `${vehicle.restricoes.length} ATIVA(S)` : 'NENHUMA', ok: !vehicle.restricoes?.length },
  ]

  statusItems.forEach((item, i) => {
    const x = margin + i * 62
    doc.setFillColor(...(item.ok ? [240, 253, 244] as [number,number,number] : [254, 242, 242] as [number,number,number]))
    doc.roundedRect(x, y, 58, 20, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(item.label, x + 29, y + 7, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(item.ok ? [22, 101, 52] as [number,number,number] : [185, 28, 28] as [number,number,number]))
    doc.text(item.value, x + 29, y + 15, { align: 'center' })
  })

  y += 28

  // VEHICLE DATA
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('DADOS DO VEICULO', margin, y)
  y += 6

  const vehicleFields = [
    ['Marca', vehicle.marca],
    ['Modelo', vehicle.modelo],
    ['Versao', vehicle.versao || '-'],
    ['Ano', String(vehicle.ano)],
    ['Combustivel', vehicle.combustivel || '-'],
    ['Cambio', vehicle.cambio || '-'],
    ['Cor', vehicle.cor || '-'],
    ['Cidade/UF', `${vehicle.cidade}, ${vehicle.uf || ''}`],
    ['FIPE', formatMoney(vehicle.fipe)],
  ]

  vehicleFields.forEach(([label, value], i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = margin + col * 62
    const yPos = y + row * 16
    doc.setFillColor(248, 250, 252)
    doc.rect(x, yPos, 58, 13, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(label.toUpperCase(), x + 3, yPos + 5)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text(value || '-', x + 3, yPos + 11)
  })

  y += Math.ceil(vehicleFields.length / 3) * 16 + 8

  // FAIR PRICE
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('PRECO JUSTO IA', margin, y)
  y += 6

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(margin, y, 85, 22, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('TABELA FIPE', margin + 42, y + 6, { align: 'center' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(formatMoney(pricing.fipe_value), margin + 42, y + 16, { align: 'center' })

  doc.setFillColor(239, 246, 255)
  doc.roundedRect(margin + 90, y, 85, 22, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('PRECO JUSTO', margin + 132, y + 6, { align: 'center' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(29, 78, 216)
  doc.text(formatMoney(pricing.fair_price), margin + 132, y + 16, { align: 'center' })

  y += 30

  // Dica
  doc.setFillColor(255, 251, 235)
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(146, 64, 14)
  doc.text('Dica: ', margin + 3, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 53, 15)
  const tip = doc.splitTextToSize(pricing.negotiation_tip, contentWidth - 18)
  doc.text(tip[0] || '', margin + 16, y + 7)
  y += 18

  // ALERTS
  if (score.alerts.length > 0 && y < 245) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('ALERTAS DETECTADOS', margin, y)
    y += 6
    score.alerts.slice(0, 3).forEach((alert) => {
      const alertBg: [number, number, number] = alert.type === 'danger' ? [254, 242, 242] : alert.type === 'warning' ? [255, 251, 235] : [239, 246, 255]
      const alertText: [number, number, number] = alert.type === 'danger' ? [185, 28, 28] : alert.type === 'warning' ? [146, 64, 14] : [30, 64, 175]
      doc.setFillColor(...alertBg)
      doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...alertText)
      doc.text(`${alert.title}`, margin + 3, y + 6)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      const desc = doc.splitTextToSize(alert.description, contentWidth - 6)
      doc.text(desc[0] || '', margin + 3, y + 11)
      y += 16
    })
  }

  // FOOTER
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 280, pageWidth, 17, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('(c) Carcheck Pro - Relatorio gerado automaticamente', margin, 287)
  doc.text('carcheck.pro', pageWidth - margin, 287, { align: 'right' })
  doc.setTextColor(71, 85, 105)
  doc.text('Este relatorio e informativo. Recomendamos vistoria cautelar presencial antes da compra.', margin, 292)

  doc.save(`carcheck-${formatPlateFn(plate)}-${new Date().toISOString().split('T')[0]}.pdf`)
}
