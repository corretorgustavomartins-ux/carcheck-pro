import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// Helper: valida se o caller é admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), supabase: null, user: null }
  }
  return { error: null, supabase, user }
}

// GET /api/admin/users?search=&page=1&limit=50
export async function GET(req: NextRequest) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
  const offset = (page - 1) * limit

  const { data: users, error: err } = await supabase!
    .rpc('admin_list_users', { p_search: search, p_limit: limit, p_offset: offset })

  const { data: countData } = await supabase!
    .rpc('admin_count_users', { p_search: search })

  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  return NextResponse.json({
    users: users ?? [],
    total: Number(countData ?? 0),
    page,
    limit,
    pages: Math.ceil(Number(countData ?? 0) / limit),
  })
}
