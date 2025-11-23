-- ⚡ SUPABASE SQL - ADICIONAR COLUNAS STRIPE À TABELA PROFILES
-- ⚡ Execute um comando por vez no Supabase SQL Editor

-- ============================================================
-- COMANDO 1: ADICIONAR COLUNAS STRIPE À PROFILES
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_stripe_sync TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- COMANDO 2: CRIAR ÍNDICE PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);

-- ============================================================
-- COMANDO 3: CRIAR TABELA DE AUDIT LOG (OPCIONAL)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- COMANDO 4: CRIAR ÍNDICE PARA AUDIT LOGS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- COMANDO 5: ATIVAR ROW LEVEL SECURITY NAS AUDIT LOGS
-- ============================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMANDO 6: POLÍTICA RLS - AUDIT LOGS
-- ============================================================

CREATE POLICY "Users see own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- COMANDO 7: CRIAR TABELA DE PAGAMENTOS (OPCIONAL)
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  amount INT,
  currency TEXT DEFAULT 'brl',
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stripe_payment_intent_id)
);

-- ============================================================
-- COMANDO 8: CRIAR ÍNDICES PARA PAYMENTS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================
-- COMANDO 9: ATIVAR ROW LEVEL SECURITY NAS PAYMENTS
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMANDO 10: POLÍTICA RLS - PAYMENTS
-- ============================================================

CREATE POLICY "Users see own payments"
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id);

-- ============================================================
-- FIM! TABELAS STRIPE ESTÃO PRONTAS!
-- ============================================================
--
-- Próximo: Configure as variáveis de ambiente no Supabase
--
-- 1. Settings → Configuration → Edge Functions
-- 2. Adicionar:
--    - STRIPE_SECRET_KEY = sk_test_xxx
--    - STRIPE_WEBHOOK_SECRET = whsec_xxx
--
-- ============================================================
