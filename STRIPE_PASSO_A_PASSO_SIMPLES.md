# 🚀 STRIPE - Guia Passo a Passo (SEM COMPLICAÇÃO)

> **Você não precisa entender TUDO sobre Stripe. Só precisa copiar e colar algumas informações.**

---

## ✅ O QUE VOCÊ JÁ CONSEGUIU FAZER

Parabéns! Você já:
- ✅ Criou a conta no Stripe
- ✅ Criou um produto com 2 preços (Monthly R$29,90 e Annual R$299)
- ✅ Gerou o Payment Link para Monthly
- ✅ Conseguiu o Publishable Key

**Você está em 60% do caminho!** 🎉

---

## 📋 CHECKLIST - O QUE FALTA

- [ ] **Passo 1:** Criar Payment Link para Annual (2 minutos)
- [ ] **Passo 2:** Copiar Secret Key (1 minuto)
- [ ] **Passo 3:** Criar Webhook Secret (2 minutos)
- [ ] **Passo 4:** Configurar .env.local (5 minutos)
- [ ] **Passo 5:** Fazer SQL do Supabase (3 minutos)
- [ ] **Passo 6:** Deploy do Webhook (2 minutos)
- [ ] **Passo 7:** Testar com cartão fake (5 minutos)

**TOTAL: 20 minutos** ⏱️

---

## 🔧 PASSO 1: Criar Payment Link para ANNUAL (2 min)

**Você já fez um, agora vamos fazer outro igual, mas para o plano anual.**

### No Stripe Dashboard:

1. **Menu esquerdo** → "Payment Links"
2. Clique em **"+ Create payment link"** (botão azul)
3. Uma popup vai abrir com "Select a product"
4. **Procure por "PromptsIA Pro - Annual"** (ou "Annual")
5. Clique nele para selecionar
6. Clique em **"Create link"**
7. **Copie a URL** que aparece

**PRONTO!** Agora você tem:
- ✅ Payment Link Monthly: `https://buy.stripe.com/test_dRm8wR4FJe8Sfsg2n987K00`
- ✅ Payment Link Annual: `https://buy.stripe.com/test_XXXXXXXXXXXX` (novo)

---

## 🔐 PASSO 2: Copiar Secret Key (1 min)

**Você já tem a Publishable Key. Agora precisa da Secret Key (ela é secreta mesmo, não compartilhe com ninguém).**

### No Stripe Dashboard:

1. **Menu esquerdo** → "Developers" → "API keys"
2. Você vai ver:
   - **Publishable key** (a que você já tem)
   - **Secret key** (procure por `sk_test_...`)
3. Clique no ícone **"copy"** da Secret Key
4. **Cole em um arquivo de texto** para não perder

**Você agora tem:**
- ✅ Publishable Key: `pk_test_51SVz2qPPLcjxs14KFSJIRRjgDDXIkA8UnswdYVOys9tZ9W6Kukjvx9ejVjqIlRi5E8zu3WjX29GScwNQvv6mYt6Z00gKImLwaP`
- ✅ Secret Key: `sk_test_XXXXXXXXXXXX` (novo - copie agora!)

---

## 🔔 PASSO 3: Criar Webhook Secret (2 min)

**Webhook é só um endereço para o Stripe avisar quando alguém pagou.**

### No Stripe Dashboard:

1. **Menu esquerdo** → "Developers" → "Webhooks"
2. Clique em **"Add endpoint"**
3. Uma janela vai abrir. Preencha:
   - **Endpoint URL:** (vamos deixar pré-preenchido por enquanto)
   - **Events to send:** Procure e MARQUE:
     - ✅ `checkout.session.completed` (quando paga)
     - ✅ `customer.subscription.deleted` (quando cancela)
     - ✅ `invoice.payment_succeeded` (pagamento aprovado)
4. Clique em **"Add endpoint"**
5. Vai aparecer uma nova tela. **Copie o "Signing secret"** (começa com `whsec_`)

**Você agora tem:**
- ✅ Webhook Secret: `whsec_XXXXXXXXXXXX` (copie agora!)

---

## 📝 PASSO 4: Configurar .env.local (5 min)

**Este é o arquivo onde você COLA todas as informações que você copiou.**

### Criar o arquivo:

1. **Abra VS Code**
2. Na pasta do PromptsIA, crie um novo arquivo chamado **`.env.local`**
3. **Cole o seguinte conteúdo** (substituindo os XXX pelas suas informações):

```bash
# STRIPE - Copie e cole suas informações aqui

# 1. Publishable Key (a pública, pode compartilhar)
VITE_STRIPE_PUBLIC_KEY=pk_test_51SVz2qPPLcjxs14KFSJIRRjgDDXIkA8UnswdYVOys9tZ9W6Kukjvx9ejVjqIlRi5E8zu3WjX29GScwNQvv6mYt6Z00gKImLwaP

# 2. Payment Links (cole as URLs que você copiou)
VITE_STRIPE_CHECKOUT_PRO_MONTHLY=https://buy.stripe.com/test_dRm8wR4FJe8Sfsg2n987K00
VITE_STRIPE_CHECKOUT_PRO_ANNUAL=https://buy.stripe.com/test_XXXXXXXXXXXX

# 3. Price IDs (opcional para agora, pode deixar assim)
VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_1234567890
VITE_STRIPE_PRICE_ID_PRO_ANNUAL=price_0987654321

# 4. Secret Key (NUNCA COMPARTILHE ISSO!)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX

# 5. Webhook Secret (vai usar depois)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
```

4. **Salve o arquivo** (Ctrl+S)

**✅ Pronto!** Seu app agora sabe onde está o Stripe.

---

## 💾 PASSO 5: Fazer SQL do Supabase (3 min)

**Você precisa adicionar 3 colunas novas no banco de dados para rastrear as assinaturas.**

### No Supabase:

1. **Abra o painel do Supabase** (sua conta)
2. **SQL Editor** (menu esquerdo)
3. Clique em **"+ New Query"**
4. **Cole o seguinte SQL:**

```sql
-- Adicionar colunas de Stripe na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP;

-- Criar tabela de logs (para rastrear eventos)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  event TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  stripe_payment_intent_id TEXT,
  amount BIGINT,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
```

5. Clique em **"Run"** (ou apertar Ctrl+Enter)
6. **Pronto!** O banco de dados agora tem as colunas novas.

---

## 🚀 PASSO 6: Deploy do Webhook (2 min)

**O webhook é um "robô" que fica ouvindo pagamentos. Você precisa "ligar" esse robô.**

### No Terminal do VS Code:

1. **Abra o Terminal** (Ctrl + `)
2. **Cole este comando:**

```bash
supabase functions deploy stripe-webhook
```

3. **Apertar ENTER**
4. **Esperar aparecer "✓ Function deployed"**

**✅ Pronto!** Seu webhook agora está ligado.

---

## 🧪 PASSO 7: Testar com Cartão Fake (5 min)

**Agora vamos testar se TUDO está funcionando.**

### No seu app PromptsIA:

1. **Faça login** com sua conta
2. **Vá em Perfil**
3. Clique em **"Upgrade Now"** (ou botão de upgrade)
4. Você vai ser **redirecionado para Stripe**

### No Stripe Checkout:

1. **Preencha com dados FAKE:**
   - **Email:** seu.email@teste.com
   - **Cartão:** `4242 4242 4242 4242` (cartão de teste Stripe)
   - **Validade:** `12/34` (qualquer data futura)
   - **CVC:** `123` (qualquer 3 dígitos)
   - **Nome:** `Test User`
2. Clique em **"Pay"** (ou "Pagar")

### Verificar se funcionou:

1. **No seu app**, você deve voltar à página
2. **No Supabase**, vá em **"profiles"** e procure sua conta
3. Verifique se a coluna `tier` agora é **`'pro'`** (não `'free'`)
4. **No Stripe Dashboard**, vá em **"Transactions"** - seu pagamento deve estar lá

**✅ SE CHEGOU ATÉ AQUI, FUNCIONOU!** 🎉

---

## ❌ Se algo não funcionou?

### Problema: "Erro ao processar checkout"
- Verificar se `.env.local` foi salvo
- Verificar se `VITE_STRIPE_CHECKOUT_PRO_MONTHLY` está correto

### Problema: Supabase SQL deu erro
- Copiar e colar cada comando separadamente
- Verifique se não tem caracteres estranhos

### Problema: Webhook não foi deploy
- Verificar se você tem `supabase cli` instalado
- Rodar `supabase login` antes

### Problema: Tier não mudou para 'pro'
- Verificar no Supabase se a coluna `tier` existe
- Verificar se webhook secret está correto

---

## 📞 Resumo das Informações que Você Precisa Copiar

**Crie um arquivo `STRIPE_MINHAS_CHAVES.txt` e salve:**

```
=== INFORMAÇÕES DO STRIPE ===

PUBLISHABLE KEY:
pk_test_XXX

SECRET KEY:
sk_test_XXX

PAYMENT LINK MONTHLY:
https://buy.stripe.com/test_XXX

PAYMENT LINK ANNUAL:
https://buy.stripe.com/test_XXX

WEBHOOK SECRET:
whsec_XXX
```

---

## 🎯 Próximo Passo

Depois que testar e tudo funcionar, você pode:
1. Criar conta REAL no Stripe (não sandbox)
2. Usar cartão real
3. Começar a cobrar dos usuários de verdade!

**Você consegue! É mais fácil do que parece!** 💪

Quer que eu ajude em algum desses passos agora?
