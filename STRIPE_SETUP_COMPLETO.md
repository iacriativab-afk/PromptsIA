# 🔐 INTEGRAÇÃO STRIPE - GUIA COMPLETO

## 📋 Conteúdo

1. [Setup Stripe Dashboard](#setup-stripe-dashboard)
2. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
3. [Deploy Webhook](#deploy-webhook)
4. [Testar Integração](#testar-integração)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Setup Stripe Dashboard

### 1. Criar Conta Stripe

1. Acesse https://dashboard.stripe.com/register
2. Criar conta (pessoal ou negócio)
3. Verificar email
4. Configurar país e moeda (BRL - Real)

### 2. Criar Produtos

#### Produto: Pro Monthly

```
Nome: PromptsIA Pro - Monthly
Descrição: Acesso ilimitado por 1 mês
Preço: R$ 29,90 / mês
ID: price_pro_monthly_xxx (copiar)
```

**Passos:**
1. Dashboard → Products → Add product
2. Nome: "PromptsIA Pro - Monthly"
3. Descrição: "Acesso ilimitado ao PromptsIA por 1 mês"
4. Pricing model: Standard pricing
5. Price: 29.90
6. Billing period: Monthly
7. Save

#### Produto: Pro Annual

```
Nome: PromptsIA Pro - Annual
Descrição: Acesso ilimitado por 1 ano
Preço: R$ 299,00 / ano
ID: price_pro_annual_xxx (copiar)
```

**Passos:** (similar ao monthly)
- Preço: 299.00
- Billing period: Yearly

### 3. Criar Payment Links (Checkout)

#### Pro Monthly Link

1. Dashboard → Payment Links → Create payment link
2. Select product: "PromptsIA Pro - Monthly"
3. Customize → Allow discounts: OFF
4. Customize → Collect email: ON
5. Create link
6. Copiar URL (ex: https://buy.stripe.com/test_...)

#### Pro Annual Link

1. Repetir para "PromptsIA Pro - Annual"
2. Copiar URL

### 4. Gerar API Keys

1. Dashboard → Developers → API keys
2. Copiar "Publishable key" (começa com `pk_test_`)
3. Copiar "Secret key" (começa com `sk_test_`)

### 5. Configurar Webhook

1. Dashboard → Developers → Webhooks
2. "Add endpoint"
3. Endpoint URL: `https://seu-supabase-project.functions.supabase.co/stripe-webhook`
4. Events to send:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
5. "Add endpoint"
6. Copiar "Signing secret" (começa com `whsec_`)

---

## 🔑 Configurar Variáveis de Ambiente

### Frontend (.env ou .env.local)

```bash
# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Checkout URLs (copiar do Stripe Dashboard)
VITE_STRIPE_CHECKOUT_PRO_MONTHLY=https://buy.stripe.com/test_xxxxx
VITE_STRIPE_CHECKOUT_PRO_ANNUAL=https://buy.stripe.com/test_xxxxx

# Price IDs (opcional - para dashboard)
VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_ID_PRO_ANNUAL=price_xxxxx
```

### Backend (Supabase - .env.local)

```bash
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Arquivo .env.example (para documentação)

```bash
# === STRIPE ===
VITE_STRIPE_PUBLIC_KEY=pk_test_
VITE_STRIPE_CHECKOUT_PRO_MONTHLY=https://buy.stripe.com/test_
VITE_STRIPE_CHECKOUT_PRO_ANNUAL=https://buy.stripe.com/test_
VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_
VITE_STRIPE_PRICE_ID_PRO_ANNUAL=price_

# === STRIPE BACKEND ===
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
```

---

## 🚀 Deploy Webhook

### 1. Deploy Edge Function (Supabase)

```bash
# No terminal da raiz do projeto
supabase functions deploy stripe-webhook
```

### 2. Verificar Deployment

```bash
supabase functions list
```

Deve aparecer: `stripe-webhook`

### 3. Testar Endpoint

```bash
curl -X POST https://seu-supabase-project.functions.supabase.co/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "client_reference_id": "user-uuid",
        "customer_email": "user@email.com",
        "subscription": "sub_123"
      }
    }
  }'
```

---

## 🧪 Testar Integração

### 1. Teste Manual (Free → Pro)

**Passos:**
1. Logar como usuário Free
2. Clicar em "Upgrade Now"
3. Deve abrir Stripe Checkout
4. Preencher dados de teste:
   ```
   Email: test@example.com
   Card: 4242 4242 4242 4242
   Exp: 12/25
   CVC: 123
   ```
5. "Subscribe"
6. Voltar para app
7. Verificar se tier mudou para "Pro"

### 2. Teste com Stripe CLI (webhooks)

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Fazer login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Triggar evento de teste
stripe trigger checkout.session.completed
```

### 3. Verificar Supabase

1. Dashboard Supabase → SQL Editor
2. Rodar query:
```sql
SELECT id, tier, stripe_subscription_id, updated_at 
FROM profiles 
WHERE tier = 'pro'
ORDER BY updated_at DESC;
```

3. Deve ver upgrade recente

### 4. Testar Cancelamento

1. Stripe Dashboard → Subscriptions
2. Abrir subscription de teste
3. "Cancel subscription"
4. Webhook deve processar
5. Usuário deve voltar a Free

---

## 🐛 Troubleshooting

### Problema: Checkout não abre

**Possíveis causas:**
- URL de checkout inválida
- Variável de ambiente não carregada

**Solução:**
```bash
# Verificar variável
console.log(import.meta.env.VITE_STRIPE_CHECKOUT_PRO_MONTHLY)

# Deve mostrar: https://buy.stripe.com/test_...
```

### Problema: Webhook não dispara

**Possíveis causas:**
- Endpoint URL errada
- Firewall bloqueando
- Edge Function offline

**Solução:**
```bash
# Verificar status da function
supabase functions list

# Ver logs
supabase functions list --verbose

# Testar com curl
curl -X POST https://seu-function-url.functions.supabase.co/stripe-webhook
```

### Problema: Usuário não faz upgrade

**Possíveis causas:**
- Webhook não processou
- Supabase profiles não tem coluna stripe_subscription_id

**Solução:**
```sql
-- Verificar que coluna existe
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP;
```

### Problema: Erro "PK missing"

**Causa:** Testando com client_reference_id inválido

**Solução:**
```bash
# Usar UUID válido de usuário existente
client_reference_id = "550e8400-e29b-41d4-a716-446655440000"
```

---

## ✅ Checklist Final

- [ ] Stripe account criada
- [ ] Produtos criados (Monthly + Annual)
- [ ] Payment Links gerados
- [ ] API Keys obtidas (Public + Secret)
- [ ] Webhook endpoint criado
- [ ] Variáveis de ambiente configuradas
- [ ] Edge Function deployada
- [ ] Teste manual realizado (Free → Pro)
- [ ] Webhook sendo recebido
- [ ] Usuário upgrade em Supabase
- [ ] Cancelamento testado
- [ ] Rollback para Free funcionando

---

## 📞 Suporte

- **Documentação Stripe:** https://stripe.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Status:** https://status.stripe.com

---

**Data:** 22 de Novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para implementação
