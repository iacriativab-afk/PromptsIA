-- ⚡ COPIE E COLE ISTO NO SUPABASE SQL EDITOR
-- ⚡ Um comando por vez, clique RUN após cada um

-- ============================================================
-- COMANDO 1: CRIAR TABELA
-- ============================================================
-- Copie tudo abaixo, cole no SQL Editor, clique RUN

CREATE TABLE IF NOT EXISTS user_usage (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  text_generations INT DEFAULT 0,
  image_generations INT DEFAULT 0,
  video_generations INT DEFAULT 0,
  audio_generations INT DEFAULT 0,
  thinking_tokens_used INT DEFAULT 0,
  total_tokens_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ============================================================
-- COMANDO 2: ATIVAR SEGURANÇA
-- ============================================================
-- Limpe o editor, copie isto, clique RUN

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMANDO 3: POLÍTICA 1 - VER DADOS
-- ============================================================

CREATE POLICY "Users see own usage"
  ON user_usage
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- ============================================================
-- COMANDO 4: POLÍTICA 2 - INSERIR DADOS
-- ============================================================

CREATE POLICY "Users can insert own usage"
  ON user_usage
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- COMANDO 5: POLÍTICA 3 - ATUALIZAR DADOS
-- ============================================================

CREATE POLICY "Users can update own usage"
  ON user_usage
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- COMANDO 6: CRIAR ÍNDICES (PERFORMANCE)
-- ============================================================

CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_month ON user_usage(month);
CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month);

-- ============================================================
-- COMANDO 7: CRIAR FUNÇÃO DE TIMESTAMP
-- ============================================================

CREATE OR REPLACE FUNCTION update_user_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMANDO 8: CRIAR TRIGGER (EXECUTA FUNÇÃO ACIMA)
-- ============================================================

CREATE TRIGGER update_user_usage_timestamp_trigger
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_user_usage_timestamp();

-- ============================================================
-- FIM! SUA TABELA ESTÁ PRONTA!
-- ============================================================
-- 
-- Próximo: Vá para Table Editor e verifique se aparece user_usage
--
-- ============================================================
