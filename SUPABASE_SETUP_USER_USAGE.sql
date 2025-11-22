-- ===============================================
-- SUPABASE SETUP: Tabela user_usage com RLS
-- ===============================================
-- Execute estes comandos no SQL Editor do Supabase
-- ===============================================

-- 1. CRIAR TABELA user_usage
CREATE TABLE IF NOT EXISTS user_usage (
  -- Identificadores
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL,
  
  -- Período (mês em formato YYYY-MM, ex: "2025-11")
  month TEXT NOT NULL,
  
  -- Contadores de uso
  text_generations INT DEFAULT 0,
  image_generations INT DEFAULT 0,
  video_generations INT DEFAULT 0,
  audio_generations INT DEFAULT 0,
  thinking_tokens_used INT DEFAULT 0,
  total_tokens_used INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Apenas 1 registro por user+month
  UNIQUE(user_id, month),
  
  -- Foreign key (opcional, se tiver tabela profiles)
  -- CONSTRAINT user_usage_user_id_fkey 
  --   FOREIGN KEY (user_id) 
  --   REFERENCES profiles(id) ON DELETE CASCADE
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id 
  ON user_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_user_usage_month 
  ON user_usage(month);

CREATE INDEX IF NOT EXISTS idx_user_usage_user_month 
  ON user_usage(user_id, month);

-- 3. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 4. DELETAR POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Usuários veem seu próprio uso" ON user_usage;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio uso" ON user_usage;
DROP POLICY IF EXISTS "Sistema pode inserir uso" ON user_usage;
DROP POLICY IF EXISTS "Sistema pode deletar uso" ON user_usage;

-- 5. CRIAR POLÍTICAS RLS

-- 5.1 Política SELECT: Usuários veem apenas seu próprio uso
CREATE POLICY "Usuários veem seu próprio uso"
  ON user_usage
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 5.2 Política INSERT: Usuários podem inserir seu próprio uso
CREATE POLICY "Usuários podem inserir seu próprio uso"
  ON user_usage
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 5.3 Política UPDATE: Usuários podem atualizar seu próprio uso
CREATE POLICY "Usuários podem atualizar seu próprio uso"
  ON user_usage
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 5.4 Política DELETE: Apenas admins podem deletar
-- (comentado por padrão - descomente se precisar de admin access)
-- CREATE POLICY "Admins podem deletar uso"
--   ON user_usage
--   FOR DELETE
--   USING (auth.jwt() ->> 'email' IN (SELECT email FROM profiles WHERE role = 'admin'));

-- 6. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_user_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
DROP TRIGGER IF EXISTS update_user_usage_timestamp_trigger ON user_usage;

CREATE TRIGGER update_user_usage_timestamp_trigger
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_user_usage_timestamp();

-- 8. (OPCIONAL) CRIAR FUNÇÃO PARA UPSERT SEGURO
CREATE OR REPLACE FUNCTION upsert_user_usage(
  p_user_id TEXT,
  p_month TEXT,
  p_increment_type TEXT,
  p_amount INT
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validar entrada
  IF p_user_id IS NULL OR p_month IS NULL OR p_amount IS NULL THEN
    RETURN json_build_object('error', 'Missing required parameters');
  END IF;

  -- Validar tipo de incremento
  IF p_increment_type NOT IN ('text', 'image', 'video', 'audio', 'thinking') THEN
    RETURN json_build_object('error', 'Invalid increment type');
  END IF;

  -- UPSERT
  INSERT INTO user_usage (user_id, month, text_generations, image_generations, video_generations, audio_generations, thinking_tokens_used)
  VALUES (
    p_user_id,
    p_month,
    CASE WHEN p_increment_type = 'text' THEN p_amount ELSE 0 END,
    CASE WHEN p_increment_type = 'image' THEN p_amount ELSE 0 END,
    CASE WHEN p_increment_type = 'video' THEN p_amount ELSE 0 END,
    CASE WHEN p_increment_type = 'audio' THEN p_amount ELSE 0 END,
    CASE WHEN p_increment_type = 'thinking' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id, month) DO UPDATE SET
    text_generations = CASE 
      WHEN p_increment_type = 'text' 
      THEN user_usage.text_generations + p_amount 
      ELSE user_usage.text_generations 
    END,
    image_generations = CASE 
      WHEN p_increment_type = 'image' 
      THEN user_usage.image_generations + p_amount 
      ELSE user_usage.image_generations 
    END,
    video_generations = CASE 
      WHEN p_increment_type = 'video' 
      THEN user_usage.video_generations + p_amount 
      ELSE user_usage.video_generations 
    END,
    audio_generations = CASE 
      WHEN p_increment_type = 'audio' 
      THEN user_usage.audio_generations + p_amount 
      ELSE user_usage.audio_generations 
    END,
    thinking_tokens_used = CASE 
      WHEN p_increment_type = 'thinking' 
      THEN user_usage.thinking_tokens_used + p_amount 
      ELSE user_usage.thinking_tokens_used 
    END,
    total_tokens_used = total_tokens_used + CASE 
      WHEN p_increment_type = 'thinking' 
      THEN p_amount 
      ELSE 0 
    END;

  -- Buscar registro atualizado
  SELECT json_build_object(
    'success', true,
    'user_id', user_id,
    'month', month,
    'text_generations', text_generations,
    'image_generations', image_generations,
    'video_generations', video_generations,
    'audio_generations', audio_generations,
    'thinking_tokens_used', thinking_tokens_used
  ) INTO v_result
  FROM user_usage
  WHERE user_id = p_user_id AND month = p_month;

  RETURN COALESCE(v_result, json_build_object('error', 'Failed to upsert'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. (OPCIONAL) DAR PERMISSÃO PARA CHAMAR FUNÇÃO
-- Comentado por padrão - descomente se precisar
-- GRANT EXECUTE ON FUNCTION upsert_user_usage TO authenticated;

-- ===============================================
-- TESTES E VALIDAÇÃO
-- ===============================================

-- Para testar RLS, use:
-- SELECT * FROM user_usage; -- Deve mostrar apenas seus registros

-- Para inserir teste:
-- INSERT INTO user_usage (user_id, month, text_generations)
-- VALUES ('seu-user-id', '2025-11', 10);

-- Para verificar:
-- SELECT * FROM user_usage WHERE user_id = 'seu-user-id';

-- ===============================================
-- CHECKLIST DE IMPLEMENTAÇÃO
-- ===============================================
-- ✅ 1. Executar CREATE TABLE
-- ✅ 2. Executar CREATE INDEX (3x)
-- ✅ 3. Executar ALTER TABLE ENABLE RLS
-- ✅ 4. Executar DROP POLICY (4x)
-- ✅ 5. Executar CREATE POLICY (3x)
-- ✅ 6. Executar CREATE FUNCTION timestamp
-- ✅ 7. Executar CREATE TRIGGER
-- ✅ 8. (OPCIONAL) Executar CREATE FUNCTION upsert
-- ✅ 9. Testar SELECT (RLS)
-- ✅ 10. Testar INSERT
-- ✅ 11. Testar UPDATE
-- ✅ 12. Atualizar usageTracker.ts para usar Supabase
-- ✅ 13. Deploy e teste em produção

-- ===============================================
-- FIM
-- ===============================================
