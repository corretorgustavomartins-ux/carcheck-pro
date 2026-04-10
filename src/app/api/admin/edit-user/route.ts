import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { createClient as createAdminClient } from '@supabase/supabase-js'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
  }
  return { error: null }
}

// POST /api/admin/edit-user  { user_id, email?, password? }
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { user_id, email, password } = await req.json()

  if (!user_id || (!email && !password)) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  // Usa service role key para editar qualquer usuário
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const updates: Record<string, string> = {}
  if (email) updates.email = email
  if (password) updates.password = password

  const { error: editError } = await adminSupabase.auth.admin.updateUserById(user_id, updates)

  if (editError) return NextResponse.json({ error: editError.message }, { status: 500 })

  // Atualiza profiles.email também se mudou
  if (email) {
    const supabase = await createClient()
    await supabase.from('profiles').update({ email }).eq('id', user_id)
  }

  return NextResponse.json({ success: true })
}
