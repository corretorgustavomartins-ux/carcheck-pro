import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VehicleService } from '@/lib/vehicle-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const plate = searchParams.get('plate')

    if (!plate) {
      return NextResponse.json({ error: 'Placa é obrigatória' }, { status: 400 })
    }

    if (!VehicleService.validatePlate(plate)) {
      return NextResponse.json({ error: 'Formato de placa inválido' }, { status: 400 })
    }

    const preview = await VehicleService.getPreview(plate)

    if (!preview) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: preview })
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
