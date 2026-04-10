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

// POST /api/admin/credits  { user_id, new_balance }
export async function POST(req: NextRequest) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { user_id, new_balance } = await req.json()

  if (!user_id || typeof new_balance !== 'number' || new_balance < 0) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const { error: err } = await supabase!
    .rpc('admin_set_credits', { p_user_id: user_id, p_new_balance: new_balance })

  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  return NextResponse.json({ success: true, new_balance })
}
