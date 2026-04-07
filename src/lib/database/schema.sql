-- ============================================
-- CARCHECK PRO - SCHEMA DO BANCO DE DADOS
-- Execute no Supabase SQL Editor
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles (complementa auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABELA: credit_wallets
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance INTEGER DEFAULT 0 NOT NULL CHECK (balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para credit_wallets
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.credit_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can update wallets" ON public.credit_wallets
  FOR ALL USING (true);

-- ============================================
-- TABELA: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('starter', 'recommended', 'smart')),
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_id TEXT,
  pix_code TEXT,
  pix_qr_base64 TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage transactions" ON public.transactions
  FOR ALL USING (true);

-- ============================================
-- TABELA: vehicle_reports
-- ============================================
CREATE TABLE IF NOT EXISTS public.vehicle_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plate TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  fair_price DECIMAL(10,2),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'attention', 'danger')),
  api_payload_json JSONB,
  pdf_url TEXT,
  credits_consumed INTEGER DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por placa
CREATE INDEX IF NOT EXISTS idx_vehicle_reports_plate ON public.vehicle_reports(plate);
CREATE INDEX IF NOT EXISTS idx_vehicle_reports_user_id ON public.vehicle_reports(user_id);

-- RLS para vehicle_reports
ALTER TABLE public.vehicle_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.vehicle_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage reports" ON public.vehicle_reports
  FOR ALL USING (true);

-- ============================================
-- TABELA: monitored_vehicles
-- ============================================
CREATE TABLE IF NOT EXISTS public.monitored_vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plate TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plate)
);

-- RLS para monitored_vehicles
ALTER TABLE public.monitored_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own monitored vehicles" ON public.monitored_vehicles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO: criar perfil e carteira automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (id, email, nome, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Criar carteira de créditos com 5 créditos de bônus
  INSERT INTO public.credit_wallets (user_id, balance)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO: deduzir créditos
-- ============================================
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM public.credit_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.credit_wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- ============================================
-- FUNÇÃO: adicionar créditos
-- ============================================
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.credit_wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.credit_wallets (user_id, balance)
    VALUES (p_user_id, p_amount);
  END IF;
END;
$$;
