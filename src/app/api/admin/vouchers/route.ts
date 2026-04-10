import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), supabase: null }
  }
  return { error: null, supabase }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem I, O, 0, 1 (confusos)
  let code = 'CARCHECK-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET /api/admin/vouchers — lista todos
export async function GET(req: NextRequest) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { data, error: err } = await supabase!
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (err) return NextResponse.json({ error: err.message }, { status: 500 })
  return NextResponse.json({ vouchers: data ?? [] })
}

// POST /api/admin/vouchers — cria novo voucher { credits, note? }
export async function POST(req: NextRequest) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { credits, note } = await req.json()

  if (!credits || credits < 1 || credits > 99999) {
    return NextResponse.json({ error: 'Quantidade de créditos inválida (1–99999)' }, { status: 400 })
  }

  // Gera código único (tenta até 5x em caso de colisão)
  let code = ''
  let attempts = 0
  while (attempts < 5) {
    code = generateCode()
    const { data: existing } = await supabase!
      .from('vouchers').select('id').eq('code', code).single()
    if (!existing) break
    attempts++
  }

  const { data, error: insertError } = await supabase!
    .from('vouchers')
    .insert({ code, credits, note: note || null })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ success: true, voucher: data })
}

// DELETE /api/admin/vouchers?id=xxx — deleta voucher não usado
export async function DELETE(req: NextRequest) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  // Só deleta se não foi usado
  const { error: delError } = await supabase!
    .from('vouchers')
    .delete()
    .eq('id', id)
    .eq('used', false)

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
