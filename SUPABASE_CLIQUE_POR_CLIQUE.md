# 🖱️ CLIQUE POR CLIQUE - SUPABASE SETUP

**Objetivo:** Você vai seguir exatamente como um jogo  
**Tempo:** 10 minutos  
**Dificuldade:** ⭐ Fácil (nada de programação)

---

## 📍 MAPA DE LOCALIZAÇÃO

```
URL do Supabase que você vê agora:
https://supabase.com/dashboard/project/miyzvptgfehssglty/sql/04955cc3-88f1-46eb-8ade-f0b7d39c5e3e

Você está em: SQL Editor ✅ (lugar certo!)
```

---

## 🎯 CLIQUE 1: Nova Query

**Você vê isto:**
```
┌─────────────────────────────┐
│ SQL Editor                  │
│ Search queries...           │
│ SHARED                      │
│ FAVORITES                   │
│ PRIVATE (1)                 │
│   └─ User profiles with... │
│      (query que existe)     │
└─────────────────────────────┘
```

**O que fazer:**
1. Procure pelo botão **"+"** (está perto de "PRIVATE" ou em cima onde diz "+ New Query")
2. **CLIQUE nele** ← Este botão cria uma query nova

**Resultado esperado:**
```
Uma janela grande branca aparece com um editor vazio
```

---

## 📋 CLIQUE 2: Selecionar o Primeiro Comando SQL

**Arquivo para abrir:** `SUPABASE_SETUP_COPIAR_COLAR.sql`

**O que fazer:**
1. Abra o arquivo `SUPABASE_SETUP_COPIAR_COLAR.sql` em um editor de texto
2. Encontre a seção:
   ```
   -- ============================================================
   -- COMANDO 1: CRIAR TABELA
   -- ============================================================
   ```
3. Selecione TODO o código SQL (do `CREATE TABLE` até o `;` final)
4. Copie com **Ctrl+C**

---

## ⌨️ CLIQUE 3: Colar no Supabase

**Você vê isto:**
```
┌──────────────────────────────────────┐
│ (editor vazio pronto para código)    │
│                                      │
│  >>> CLIQUE AQUI e cole o SQL <<<   │
│                                      │
└──────────────────────────────────────┘
```

**O que fazer:**
1. Clique dentro da janela branca do editor
2. Cole o código com **Ctrl+V**

**Resultado esperado:**
```
O código SQL aparece no editor com colores (syntax highlighting)
```

---

## ▶️ CLIQUE 4: Executar (RUN)

**Você vê isto no editor:**
```
┌─────────────────────────────────────────┐
│ CREATE TABLE IF NOT EXISTS user_usage   │
│   id BIGINT PRIMARY KEY ...             │
│   user_id TEXT NOT NULL,               │
│   ... (mais código)                    │
│                                        │
│ [RUN] ← Este botão azul                │
└─────────────────────────────────────────┘
```

**O que fazer:**
1. Procure o botão **RUN** (é azul, lado superior direito)
2. **CLIQUE nele**

**Resultado esperado:**
```
"0 row affected" ou nenhuma mensagem de erro
↓
SUCESSO! ✅
```

**Se vir erro "already exists":**
```
É normal! Significa a tabela pode já existir.
Continue para o próximo comando.
```

---

## 🔄 CLIQUE 5: Limpar e Repetir para Comando 2

**Você vê isto:**
```
┌─────────────────────────────────────────┐
│ CREATE TABLE IF NOT EXISTS user_usage   │
│   (código antigo do comando 1)          │
└─────────────────────────────────────────┘
```

**O que fazer:**
1. Clique no editor (clique em qualquer lugar do código)
2. Selecione TUDO com **Ctrl+A**
3. Delete com **Delete** ou **Backspace**

**Resultado:**
```
Editor vazio novamente
```

---

## 📝 CLIQUE 6: Colar Comando 2

**Do arquivo `SUPABASE_SETUP_COPIAR_COLAR.sql`:**
```
-- ============================================================
-- COMANDO 2: ATIVAR SEGURANÇA
-- ============================================================

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
```

**O que fazer:**
1. Selecione SÓ este comando
2. Copie com **Ctrl+C**
3. Clique no editor vazio
4. Cole com **Ctrl+V**
5. Clique **RUN**

**Resultado esperado:**
```
Sem mensagem de erro = Sucesso ✅
```

---

## 🔐 CLIQUE 7-9: Repetir para Políticas (3x)

### Para cada POLÍTICA (Commands 3, 4, 5):

**O que fazer:**
1. Limpe o editor (**Ctrl+A** → **Delete**)
2. Abra arquivo `SUPABASE_SETUP_COPIAR_COLAR.sql`
3. Encontre:
   ```
   -- COMANDO 3: POLÍTICA 1
   -- COMANDO 4: POLÍTICA 2
   -- COMANDO 5: POLÍTICA 3
   ```
4. Copie cada uma
5. Cole no editor
6. Clique **RUN**
7. Repita para as 3 políticas

**Resultado esperado para cada:**
```
Sem erro = Sucesso ✅
```

---

## ⚡ CLIQUE 10: Comandos 6, 7, 8 (Finais)

### Para Índices, Função e Trigger:

**Mesma coisa:**
1. Limpe
2. Copia de `SUPABASE_SETUP_COPIAR_COLAR.sql`
3. Cola
4. RUN
5. Repita

**Total: 3 mais cliques**

---

## ✅ CLIQUE 11: Verificar Tabela Criada

**Você vê isto:**
```
Painel Esquerdo:
├─ Home
├─ SQL Editor  (está aqui agora)
├─ Table Editor ← CLIQUE AQUI
├─ Database
└─ Auth
```

**O que fazer:**
1. Clique em **Table Editor**
2. A página muda para mostrar tabelas

**Você deve ver:**
```
Painel Esquerdo (lista de tabelas):
├─ customers
├─ notes
├─ prices
├─ products
├─ profiles
├─ subscriptions
├─ users
└─ user_usage ← DEVE ESTAR AQUI! ✅
```

---

## 🖇️ CLIQUE 12: Abrir Tabela

**O que fazer:**
1. Procure **user_usage** na lista
2. **CLIQUE nela**

**Resultado:**
```
Tabela user_usage
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
│
├─ Status: "This table is empty"
└─ Botão [Insert] (verde)
```

**Se vê isto = PERFEITO! ✅✅✅**

---

## 🎮 CLIQUE 13: Testar Inserir Dados (Opcional)

**O que fazer:**
1. Clique no botão **Insert** (verde)
2. Uma modal apareça:

```
┌────────────────────────────────┐
│ Insert Row                     │
│                                │
│ user_id: [____________]        │
│ month: [____________]          │
│ text_generations: [0____]      │
│ image_generations: [0____]     │
│ video_generations: [0____]     │
│ audio_generations: [0____]     │
│ thinking_tokens_used: [0___]   │
│ total_tokens_used: [0____]     │
│                                │
│ [Cancel] [Save] ← CLIQUE AQUI  │
└────────────────────────────────┘
```

3. Preencha:
   ```
   user_id: seu-user-id (copie de Auth)
   month: 2025-11
   text_generations: 5
   image_generations: 0
   video_generations: 0
   audio_generations: 0
   thinking_tokens_used: 0
   total_tokens_used: 0
   ```

4. Clique em **Save**

**Resultado:**
```
Volta para a tabela e mostra:
├─ Seu novo registro
│  ├─ user_id: ...
│  ├─ month: 2025-11
│  ├─ text_generations: 5
│  └─ (outras colunas)
│
└─ Status: "1 row"
```

**Se viu isto = RLS FUNCIONA! ✅✅✅**

---

## 🎉 FIM!

Você completou com sucesso!

```
Cliques Totais: ~15 cliques
Tempo Total: ~10 minutos
Resultado: Tabela com RLS pronta para usar! ✅
```

---

## 📝 RESUMO DO CAMINHO

```
SQL Editor
  ↓
Colar Comando 1 (CREATE TABLE)
  ↓ RUN
Colar Comando 2 (ALTER TABLE RLS)
  ↓ RUN
Colar Comando 3 (POLICY 1)
  ↓ RUN
Colar Comando 4 (POLICY 2)
  ↓ RUN
Colar Comando 5 (POLICY 3)
  ↓ RUN
Colar Comando 6 (INDEX)
  ↓ RUN
Colar Comando 7 (FUNCTION)
  ↓ RUN
Colar Comando 8 (TRIGGER)
  ↓ RUN
Table Editor
  ↓
Clicar em user_usage
  ↓
VER TABELA COM 10 COLUNAS ✅
```

---

**Desenvolvido com ❤️ para PromptsIA**

Qualquer dúvida, volte ao guia! 🚀
