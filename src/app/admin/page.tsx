'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_EMAIL, ADMIN_SECRET } from '@/lib/admin'

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const BG = '#030712'
const CARD = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'

type Tab = 'usuarios' | 'vouchers'

type UserRow = {
  user_id: string
  email: string
  created_at: string
  credits: number
  total_reports: number
  last_report_at: string | null
}

type Voucher = {
  id: string
  code: string
  credits: number
  used: boolean
  used_by: string | null
  used_at: string | null
  note: string | null
  created_at: string
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const showSecret = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  const handleLogin = async () => {
    setError('')
    if (showSecret && secret !== ADMIN_SECRET) {
      setError('Código de acesso incorreto')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Email ou senha incorretos'); setLoading(false); return }
    onLogin()
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <span style={{ color: '#fff', fontSize: 22 }}>🛡️</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>Painel Admin</h1>
            <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Carcheck Pro</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email" placeholder="Email admin" value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password" placeholder="Senha" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !showSecret && handleLogin()}
              style={inputStyle}
            />
            {showSecret && (
              <input
                type="password" placeholder="Código de acesso" value={secret}
                onChange={e => setSecret(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ ...inputStyle, border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}
              />
            )}
            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleLogin} disabled={loading}
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
  outline: 'none', fontFamily: font, width: '100%', boxSizing: 'border-box',
}

// ─── MODAL EDITAR USUÁRIO ─────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }: { user: UserRow; onClose: () => void; onSave: () => void }) {
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [credits, setCredits] = useState(user.credits)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    setLoading(true); setMsg('')
    try {
      // Edita email/senha
      if (email !== user.email || password) {
        const res = await fetch('/api/admin/edit-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id, email: email !== user.email ? email : undefined, password: password || undefined }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error)
      }
      // Atualiza créditos
      if (credits !== user.credits) {
        const res = await fetch('/api/admin/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id, new_balance: credits }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error)
      }
      setMsg('✅ Salvo com sucesso!')
      setTimeout(() => { onSave(); onClose() }, 800)
    } catch (e: any) {
      setMsg('❌ ' + (e.message || 'Erro ao salvar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: font }}>
      <div style={{ background: '#0f172a', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>✏️ Editar usuário</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ color: '#475569', fontSize: 12, marginBottom: 20 }}>ID: {user.user_id}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nova senha <span style={{ color: '#475569' }}>(deixe vazio para não alterar)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Créditos</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" value={credits} onChange={e => setCredits(Math.max(0, parseInt(e.target.value) || 0))} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => setCredits(c => c + 26)} style={quickBtn('#3b82f6')}>+26</button>
              <button onClick={() => setCredits(c => c + 49)} style={quickBtn('#f59e0b')}>+49</button>
              <button onClick={() => setCredits(0)} style={quickBtn('#ef4444')}>0</button>
            </div>
          </div>

          {msg && <p style={{ color: msg.startsWith('✅') ? '#34d399' : '#f87171', fontSize: 13, textAlign: 'center' }}>{msg}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 0', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={save} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 12, padding: '12px 0', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Salvando...' : '💾 Salvar alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }
const quickBtn = (color: string): React.CSSProperties => ({
  background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 8,
  padding: '8px 10px', color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
})

// ─── ABA USUÁRIOS ─────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)

  const load = useCallback(async (s = search, p = page) => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(s)}&page=${p}&limit=50`)
    const d = await res.json()
    setUsers(d.users ?? [])
    setTotal(d.total ?? 0)
    setPages(d.pages ?? 1)
    setLoading(false)
  }, [search, page])

  useEffect(() => { load() }, [])

  const handleSearch = () => { setPage(1); load(search, 1) }

  return (
    <div>
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSave={() => load()} />}

      {/* Barra de busca */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar por email..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={handleSearch} style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Buscar
        </button>
      </div>

      <p style={{ color: '#475569', fontSize: 13, marginBottom: 14 }}>
        {total.toLocaleString('pt-BR')} usuário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
      </p>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {['Email', 'Créditos', 'Consultas', 'Cadastro', 'Ações'].map(h => (
                <th key={h} style={{ color: '#475569', fontWeight: 700, textAlign: 'left', padding: '10px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Carregando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Nenhum usuário encontrado</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.user_id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '12px 12px', color: '#e2e8f0' }}>{u.email}</td>
                <td style={{ padding: '12px 12px' }}>
                  <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontWeight: 700, padding: '3px 10px', borderRadius: 8, fontSize: 13 }}>
                    {u.credits} cr
                  </span>
                </td>
                <td style={{ padding: '12px 12px', color: '#94a3b8' }}>{u.total_reports}</td>
                <td style={{ padding: '12px 12px', color: '#64748b', fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '12px 12px' }}>
                  <button
                    onClick={() => setEditing(u)}
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '5px 12px', color: '#60a5fa', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(search, p) }} disabled={page === 1} style={pageBtn(page === 1)}>← Anterior</button>
          <span style={{ color: '#64748b', fontSize: 13, padding: '8px 12px' }}>Página {page} de {pages}</span>
          <button onClick={() => { const p = Math.min(pages, page + 1); setPage(p); load(search, p) }} disabled={page === pages} style={pageBtn(page === pages)}>Próxima →</button>
        </div>
      )}
    </div>
  )
}

const pageBtn = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.1)',
  border: `1px solid ${disabled ? BORDER : 'rgba(59,130,246,0.2)'}`,
  borderRadius: 8, padding: '8px 16px',
  color: disabled ? '#334155' : '#60a5fa',
  fontWeight: 600, fontSize: 13,
  cursor: disabled ? 'default' : 'pointer',
})

// ─── ABA VOUCHERS ──────────────────────────────────────────────────
function VouchersTab() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCredits, setNewCredits] = useState('')
  const [newNote, setNewNote] = useState('')
  const [msg, setMsg] = useState('')
  const [newCode, setNewCode] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/vouchers')
    const d = await res.json()
    setVouchers(d.vouchers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    const credits = parseInt(newCredits)
    if (!credits || credits < 1) { setMsg('❌ Digite uma quantidade válida de créditos'); return }
    setCreating(true); setMsg('')
    const res = await fetch('/api/admin/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits, note: newNote || undefined }),
    })
    const d = await res.json()
    if (!res.ok) { setMsg('❌ ' + d.error); setCreating(false); return }
    setNewCode(d.voucher.code)
    setMsg(`✅ Voucher criado: ${d.voucher.code}`)
    setNewCredits(''); setNewNote('')
    load()
    setCreating(false)
  }

  const deleteVoucher = async (id: string) => {
    if (!confirm('Deletar este voucher?')) return
    await fetch(`/api/admin/vouchers?id=${id}`, { method: 'DELETE' })
    load()
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setMsg('📋 Código copiado!')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div>
      {/* Criar voucher */}
      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
        <h3 style={{ color: '#34d399', fontSize: 16, fontWeight: 800, marginBottom: 18 }}>🎟️ Criar novo voucher</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={labelStyle}>Créditos a conceder</label>
            <input
              type="number" value={newCredits}
              onChange={e => setNewCredits(e.target.value)}
              placeholder="Ex: 200"
              min="1" max="99999"
              style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }}
            />
          </div>
          <div style={{ flex: '2 1 220px' }}>
            <label style={labelStyle}>Observação <span style={{ color: '#334155' }}>(opcional)</span></label>
            <input
              value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Ex: Presente para cliente João"
              style={inputStyle}
            />
          </div>
          <button
            onClick={create} disabled={creating}
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 46 }}
          >
            {creating ? 'Gerando...' : '✨ Gerar código'}
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ color: msg.startsWith('✅') ? '#34d399' : '#f87171', fontSize: 14, fontWeight: 600 }}>{msg}</p>
            {newCode && (
              <button onClick={() => copy(newCode)} style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, padding: '4px 12px', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                📋 Copiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de vouchers */}
      <h3 style={{ color: '#94a3b8', fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
        Vouchers criados ({vouchers.length})
      </h3>

      {loading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: 40 }}>Carregando...</p>
      ) : vouchers.length === 0 ? (
        <p style={{ color: '#334155', textAlign: 'center', padding: 40 }}>Nenhum voucher criado ainda</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vouchers.map(v => (
            <div key={v.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              background: v.used ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.04)',
              border: `1px solid ${v.used ? BORDER : 'rgba(16,185,129,0.15)'}`,
              borderRadius: 12, padding: '12px 16px',
              opacity: v.used ? 0.6 : 1,
            }}>
              <button onClick={() => copy(v.code)} title="Clique para copiar" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <code style={{ color: v.used ? '#475569' : '#34d399', fontWeight: 900, fontSize: 14, letterSpacing: 2, fontFamily: 'monospace' }}>{v.code}</code>
              </button>
              <span style={{ background: v.used ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.1)', color: v.used ? '#64748b' : '#60a5fa', fontWeight: 700, fontSize: 13, padding: '3px 10px', borderRadius: 8 }}>
                {v.credits} cr
              </span>
              {v.note && <span style={{ color: '#64748b', fontSize: 12 }}>— {v.note}</span>}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                {v.used ? (
                  <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>✗ Usado em {new Date(v.used_at!).toLocaleDateString('pt-BR')}</span>
                ) : (
                  <span style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}>✓ Disponível</span>
                )}
                <span style={{ color: '#334155', fontSize: 11 }}>{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                {!v.used && (
                  <button onClick={() => deleteVoucher(v.id)} title="Deletar" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 8px', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PAINEL PRINCIPAL ─────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<Tab>('usuarios')
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setAdminEmail(session.user.email)
    })
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: font, color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(3,7,18,0.96)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}`, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>Admin — Carcheck Pro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#475569', fontSize: 12 }}>{adminEmail}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px 60px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 4, width: 'fit-content' }}>
          {([['usuarios', '👥 Usuários'], ['vouchers', '🎟️ Vouchers']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: tab === id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              borderRadius: 10, padding: '8px 20px',
              color: tab === id ? '#60a5fa' : '#64748b',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28 }}>
          {tab === 'usuarios' && <UsersTab />}
          {tab === 'vouchers' && <VouchersTab />}
        </div>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? ''
      setAuthed(email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
    })
  }, [])

  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
        <div style={{ width: 40, height: 40, border: '4px solid rgba(59,130,246,0.2)', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />
  return <AdminPanel />
}
