# 🎯 GUIA VISUAL - SETUP NO SUPABASE (Passo a Passo com Screenshots)

**Data:** 22 de Novembro de 2025  
**Objetivo:** Criar tabela `user_usage` com RLS  
**Tempo:** 10 minutos  
**Nível:** Iniciante - Não precisa saber SQL  

---

## 🚀 PASSO 1: Ir para SQL Editor

### Você vê isto agora?

```
Supabase Dashboard
├─ Painel esquerdo com:
│  ├─ Home
│  ├─ SQL Editor  ← CLIQUE AQUI
│  ├─ Table Editor
│  ├─ Database
│  └─ Auth
```

**Instrução:** 
1. Procure o ícone de **SQL Editor** no painel esquerdo
2. Clique nele

---

## 📝 PASSO 2: Criar Nova Query

### Você verá:

```
SQL Editor
├─ Search queries...
├─ SHARED
│  └─ (queries compartilhadas)
├─ FAVORITES
└─ PRIVATE
   └─ + (botão de nova query)
```

**Instrução:**
1. Clique no botão **+** em PRIVATE (ou em cima que tem "+ New Query")
2. Um editor em branco aparecerá

---

## 📋 PASSO 3: Copiar SQL - PARTE 1 (Criar Tabela)

### Execute isto primeiro:

```sql
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
```

**O que fazer:**
1. Selecione TODO o texto acima
2. Copie (Ctrl+C)
3. Clique na janela branca do SQL Editor
4. Cole (Ctrl+V)
5. Clique no botão **RUN** (canto superior direito, botão azul)

**Se vir isto = SUCESSO ✅**
```
0 row affected
```

**Se vir erro com "already exists" = IGNORAR (tabela já existe)**

---

## 🔐 PASSO 4: Ativar Segurança (RLS)

### Execute isto:

```sql
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
```

**O que fazer:**
1. Limpe o editor (Ctrl+A, Delete)
2. Cole este comando
3. Clique **RUN**

**Sucesso:** Sem mensagem de erro

---

## 🛡️ PASSO 5: Criar Primeira Política de Segurança

### Execute isto:

```sql
CREATE POLICY "Users see own usage"
  ON user_usage
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

**O que fazer:**
1. Limpe o editor
2. Cole este comando
3. Clique **RUN**

**O que significa:** Usuários só veem seus próprios dados

---

## ✏️ PASSO 6: Criar Segunda Política

### Execute isto:

```sql
CREATE POLICY "Users can insert own usage"
  ON user_usage
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

**O que fazer:**
1. Limpe e cole
2. Clique **RUN**

**O que significa:** Usuários só podem inserir dados deles mesmos

---

## 🔄 PASSO 7: Criar Terceira Política

### Execute isto:

```sql
CREATE POLICY "Users can update own usage"
  ON user_usage
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
```

**O que fazer:**
1. Limpe e cole
2. Clique **RUN**

**O que significa:** Usuários só podem modificar dados deles mesmos

---

## ⚡ PASSO 8: Criar Índices (Performance)

### Execute isto:

```sql
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_month ON user_usage(month);
CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month);
```

**O que fazer:**
1. Limpe e cole
2. Clique **RUN**

**O que significa:** Torna as buscas muito mais rápidas

---

## ⏰ PASSO 9: Criar Atualização Automática de Data

### Execute isto:

```sql
CREATE OR REPLACE FUNCTION update_user_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_usage_timestamp_trigger
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_user_usage_timestamp();
```

**O que fazer:**
1. Limpe e cole
2. Clique **RUN**

**O que significa:** Quando você atualiza um registro, a data de `updated_at` é atualizada automaticamente

---

## ✅ PASSO 10: Verificar Tabela Criada

### Agora vamos verificar se funcionou:

1. Clique em **Table Editor** (painel esquerdo)
2. Procure na lista esquerda pela tabela **user_usage**
3. Clique nela

**Você deve ver:**
```
Tabela: user_usage
├─ Colunas:
│  ├─ id
│  ├─ user_id
│  ├─ month
│  ├─ text_generations
│  ├─ image_generations
│  ├─ video_generations
│  ├─ audio_generations
│  ├─ thinking_tokens_used
│  ├─ total_tokens_used
│  ├─ created_at
│  └─ updated_at
└─ Status: "This table is empty"
```

**Se vir isto = PERFEITO! ✅**

---

## 🧪 PASSO 11: Testar Inserindo Dados

### Agora vamos testar se funciona:

1. Clique no botão **Insert** (verde, canto superior)
2. Uma modal aparece
3. Preencha assim:

```
user_id: (copie seu user ID do Google)
month: 2025-11
text_generations: 5
image_generations: 2
video_generations: 0
audio_generations: 3
thinking_tokens_used: 0
total_tokens_used: 0
```

**Como pegar seu user_id:**
1. Vá para **Auth** no painel esquerdo
2. Procure por sua linha de usuário
3. Copie o ID (começará com algo como "550e8400-e29b...")
4. Volta para Table Editor
5. Cole no campo user_id

4. Clique **Save**

**Se funcionar = ✅ TABELA ESTÁ PRONTA!**

---

## 🔍 PASSO 12: Verificar que RLS Funciona

### Teste de segurança:

1. Volta para **SQL Editor**
2. Execute isto:

```sql
SELECT * FROM user_usage;
```

**O que esperar:**
```
Resultado:
├─ 1 linha (seu registro)
└─ Nenhum registro de outro usuário
```

**Se viu só seus dados = RLS ESTÁ FUNCIONANDO! ✅**

---

## 🎉 PARABÉNS!

Você criou com sucesso:
✅ Tabela `user_usage`  
✅ Row Level Security (RLS)  
✅ 3 Políticas de Segurança  
✅ Índices de Performance  
✅ Trigger de Timestamp  

---

## 📚 PRÓXIMO PASSO

Agora você precisa atualizar o código para usar essa tabela.

### Arquivo para modificar: `services/usageTracker.ts`

Vou criar um guia separado para isso.

---

## 🆘 TROUBLESHOOTING

### Erro: "Relation already exists"

**Significa:** A tabela ou índice já existe (não é problema)  
**Solução:** Ignore e continua

### Erro: "Permission denied"

**Significa:** RLS está bloqueando (é normal no teste)  
**Solução:** Continue normalmente

### Não consigo inserir dados

**Verificar:**
1. ✅ Você está logado no Supabase?
2. ✅ Você completou todos os 9 primeiros passos?
3. ✅ A tabela aparece em Table Editor?

Se sim para todas, algo deu errado. Refaça do PASSO 1.

### Não vejo a tabela em Table Editor

**Solução:**
1. Clique em **Table Editor**
2. Clique em cima de "schema public" (pode estar contraído)
3. Procure por `user_usage`

Se ainda não vir, a tabela não foi criada. Refaça PASSO 3.

---

## ✨ RESUMO VISUAL

```
ANTES (agora):                DEPOIS (pronto):
Sem tabela              →     Tabela user_usage
                              ├─ 10 colunas
                              ├─ RLS ativado
                              ├─ 3 políticas
                              ├─ 3 índices
                              ├─ Trigger automático
                              └─ Pronta para usar!
```

---

**Desenvolvido com ❤️ para PromptsIA**

Qualquer dúvida, volte aqui! 🚀
