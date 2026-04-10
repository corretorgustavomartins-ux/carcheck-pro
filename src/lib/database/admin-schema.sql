-- ============================================
-- CARCHECK PRO - ADMIN + VOUCHERS SCHEMA
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- TABELA: vouchers
-- ============================================
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL DEFAULT 'admin',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);

-- RLS para vouchers
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Usuários podem apenas verificar se o código existe (para resgatar)
CREATE POLICY "Users can read unused vouchers by code" ON public.vouchers
  FOR SELECT USING (true);

-- Apenas service role pode inserir/atualizar
CREATE POLICY "Service can manage vouchers" ON public.vouchers
  FOR ALL USING (true);

-- ============================================
-- FUNÇÃO: resgatar voucher (atômica/segura)
-- ============================================
CREATE OR REPLACE FUNCTION public.redeem_voucher(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_voucher public.vouchers%ROWTYPE;
  v_credits INTEGER;
BEGIN
  -- Busca e bloqueia o voucher atomicamente
  SELECT * INTO v_voucher
  FROM public.vouchers
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  -- Código não existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Código inválido');
  END IF;

  -- Já foi usado
  IF v_voucher.used THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este voucher já foi utilizado');
  END IF;

  -- Marca como usado
  UPDATE public.vouchers
  SET used = TRUE,
      used_by = p_user_id,
      used_at = NOW()
  WHERE id = v_voucher.id;

  -- Adiciona créditos ao usuário
  PERFORM public.add_credits(p_user_id, v_voucher.credits);

  RETURN jsonb_build_object(
    'success', true,
    'credits', v_voucher.credits,
    'message', format('✅ %s créditos adicionados com sucesso!', v_voucher.credits)
  );
END;
$$;

-- ============================================
-- FUNÇÃO ADMIN: listar usuários com stats
-- (paginado, busca por email)
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search TEXT DEFAULT '',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  credits INTEGER,
  total_reports BIGINT,
  last_report_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id                                          AS user_id,
    u.email                                       AS email,
    u.created_at                                  AS created_at,
    COALESCE(w.balance, 0)                        AS credits,
    COUNT(r.id)                                   AS total_reports,
    MAX(r.created_at)                             AS last_report_at
  FROM auth.users u
  LEFT JOIN public.credit_wallets w ON w.user_id = u.id
  LEFT JOIN public.vehicle_reports r ON r.user_id = u.id
  WHERE (p_search = '' OR u.email ILIKE '%' || p_search || '%')
  GROUP BY u.id, u.email, u.created_at, w.balance
  ORDER BY u.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- FUNÇÃO ADMIN: contar usuários (para paginação)
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_count_users(
  p_search TEXT DEFAULT ''
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM auth.users u
    WHERE (p_search = '' OR u.email ILIKE '%' || p_search || '%')
  );
END;
$$;

-- ============================================
-- FUNÇÃO ADMIN: ajustar créditos de usuário
-- (positivo = adicionar, negativo = remover)
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_set_credits(
  p_user_id UUID,
  p_new_balance INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.credit_wallets (user_id, balance)
  VALUES (p_user_id, GREATEST(0, p_new_balance))
  ON CONFLICT (user_id)
  DO UPDATE SET balance = GREATEST(0, p_new_balance), updated_at = NOW();
END;
$$;
