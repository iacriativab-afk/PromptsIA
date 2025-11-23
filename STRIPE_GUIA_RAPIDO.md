# 🎯 GUIA RÁPIDO - INTEGRAÇÃO STRIPE AUTOMATIZADA

**Status:** ✅ Pronto para implementação  
**Tempo de setup:** ~30 minutos  
**Complexidade:** Média  

---

## 📋 Arquivos Criados/Modificados

### ✅ Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `services/stripe.ts` | Serviço principal de integração Stripe |
| `supabase/functions/stripe-webhook/index.ts` | Webhook handler (Edge Function) |
| `STRIPE_SETUP_COMPLETO.md` | Guia step-by-step completo |
| `SUPABASE_SETUP_STRIPE.sql` | SQL para adicionar tabelas Stripe |

### ✅ Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `components/UserProfile.tsx` | Adicionar import e usar `startStripeCheckout()` |
| `components/LimitReachedModal.tsx` | Adicionar import e usar `startStripeCheckout()` |
| `vite-env.d.ts` | Adicionar variáveis de ambiente Stripe |

---

## 🚀 Setup em 5 Passos

### Passo 1: Configurar Stripe Dashboard (10 min)

```bash
1. Acesse https://dashboard.stripe.com
2. Criar 2 produtos:
   - Pro Monthly: R$ 29.90/mês
   - Pro Annual: R$ 299.00/ano
3. Gerar Payment Links (URLs de checkout)
4. Copiar Publishable Key (pk_test_...)
5. Copiar Secret Key (sk_test_...)
6. Criar webhook endpoint
```

**Referência:** Veja `STRIPE_SETUP_COMPLETO.md` para screenshots

### Passo 2: Configurar Variáveis de Ambiente (5 min)

Criar arquivo `.env.local`:

```bash
# Frontend
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
VITE_STRIPE_CHECKOUT_PRO_MONTHLY=https://buy.stripe.com/test_xxxxx
VITE_STRIPE_CHECKOUT_PRO_ANNUAL=https://buy.stripe.com/test_xxxxx
VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_ID_PRO_ANNUAL=price_xxxxx

# Backend (Supabase)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Passo 3: Adicionar Colunas Supabase (5 min)

1. Supabase Dashboard → SQL Editor
2. Copiar conteúdo de `SUPABASE_SETUP_STRIPE.sql`
3. Executar cada comando um por um

**Resultado esperado:**
- ✅ Tabela `audit_logs` criada
- ✅ Tabela `payments` criada
- ✅ Colunas `stripe_*` em `profiles`

### Passo 4: Deploy Edge Function (5 min)

```bash
# No terminal da raiz do projeto
supabase functions deploy stripe-webhook

# Verificar
supabase functions list
```

**Resultado esperado:**
```
- stripe-webhook [active]
```

### Passo 5: Testar Integração (5 min)

**Teste Local:**
1. `npm run dev`
2. Logar como usuário Free
3. Clicar "Upgrade Now"
4. Deve abrir Stripe Checkout
5. Preencher dados de teste (cartão 4242...)
6. Confirmar pagamento
7. Voltar para app → deve ser Pro

**Teste de Webhook:**
```bash
# Usar Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

---

## 📊 Fluxo de Dados

```
USER CLICKS UPGRADE
      ↓
startStripeCheckout(user, 'pro_monthly')
      ↓
Redirect to Stripe Checkout URL (payment_link)
      ↓
User fills payment info
      ↓
Stripe processes payment
      ↓
Stripe sends webhook → Edge Function
      ↓
handleCheckoutSessionCompleted()
      ↓
Update profiles.tier = 'pro'
Update profiles.stripe_subscription_id
      ↓
Log in audit_logs
      ↓
User back in app
      ↓
See Pro features available
```

---

## 🔍 Componentes do Sistema

### Frontend (services/stripe.ts)

**Funções principais:**

```typescript
// 1. Iniciar checkout
startStripeCheckout(user, 'pro_monthly')

// 2. Sincronizar status
syncSubscriptionStatus(userId)

// 3. Verificar subscription
getSubscriptionStatus(userId)

// 4. Downgrades
handleSubscriptionCancelled(sessionData)
```

### Backend (Edge Function)

**Processa webhooks:**
- `checkout.session.completed` → Upgrade
- `customer.subscription.deleted` → Downgrade
- `invoice.payment_succeeded` → Log
- `invoice.payment_failed` → Log

---

## ⚙️ Configurações Avançadas

### Usar Stripe CLI para Testes

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli/install

# Fazer login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:5173/api/stripe-webhook

# Triggar eventos
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
```

### Adicionar Suporte a Desconto

```typescript
// Em Stripe Dashboard → Coupons
// Criar coupon: WELCOME20 (20% off)

// No checkout URL, adicionar parâmetro:
// ?client_reference_id=user-id&coupon=WELCOME20
```

### Email de Confirmação (TODO)

```typescript
// Em handleCheckoutSessionCompleted():
// await sendUpgradeConfirmationEmail(email, planName);
```

---

## 🐛 Troubleshooting

### Problema: Webhook não dispara

**Solução:**
```bash
# Verificar Edge Function está deployed
supabase functions list

# Ver logs
supabase functions list --verbose

# Testar endpoint manualmente
curl -X POST https://seu-project.functions.supabase.co/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'
```

### Problema: Usuário não faz upgrade

**Verificar:**
1. Variáveis de ambiente estão corretas?
2. Edge Function está online?
3. Webhook endpoint está registrado no Stripe?
4. Tabela `profiles` tem coluna `stripe_subscription_id`?

**Debug:**
```sql
-- Ver último webhook recebido
SELECT * FROM audit_logs 
WHERE event = 'subscription_upgraded'
ORDER BY created_at DESC;

-- Ver usuário
SELECT id, tier, stripe_subscription_id 
FROM profiles 
WHERE tier = 'pro';
```

### Problema: Erro "Cannot read properties of undefined"

**Causa:** Variável de ambiente não configurada

**Solução:**
```bash
# Verificar .env.local
cat .env.local | grep STRIPE

# Deve mostrar todas as 8 variáveis Stripe
```

---

## ✅ Checklist de Deploy

- [ ] Stripe account criada
- [ ] Produtos criados (Monthly + Annual)
- [ ] Payment Links gerados
- [ ] API Keys obtidas
- [ ] Webhook configurado
- [ ] Variáveis .env.local preenchidas
- [ ] Colunas Supabase adicionadas
- [ ] Edge Function deployada
- [ ] Teste local realizado (Free → Pro)
- [ ] Webhook testado com Stripe CLI
- [ ] Downgrade testado
- [ ] Build passa sem erros

---

## 📞 Referências

- **Stripe Docs:** https://stripe.com/docs
- **Payment Links:** https://stripe.com/docs/payments/payment-links
- **Webhooks:** https://stripe.com/docs/webhooks
- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## 🎉 Pronto!

Após completar este guia, você terá:

✅ Sistema de pagamento automático  
✅ Upgrade/Downgrade sincronizado  
✅ Webhooks processando em tempo real  
✅ Audit log de todas transações  
✅ Pronto para produção  

**Tempo total:** ~30 minutos  
**Dificuldade:** 2/5 ⭐  

---

**Data:** 22 de Novembro de 2025  
**Versão:** 1.0  
**Autor:** Desenvolvedor Automatizado  
**Status:** ✅ Pronto para Deploy
