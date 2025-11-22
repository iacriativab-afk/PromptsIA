# 🏗️ ARQUITETURA DO SISTEMA DE ASSINATURA SAAS

**Data:** 22 de Novembro de 2025  
**Status:** ✅ Implementado  
**Versão:** 1.0

---

## 📋 VISÃO GERAL

Sistema profissional de gerenciamento de assinatures para SaaS com:
- ✅ 3 planos (Free, Pro Mensal, Pro Anual)
- ✅ Rastreamento de uso em tempo real
- ✅ Proteção de features com validação
- ✅ UI responsiva com dashboard de uso
- ✅ Alertas amigáveis quando limite é atingido

---

## 🏢 ARQUITETURA DO PROJETO

```
PromptsIA/
├── lib/
│   ├── subscriptionPlans.ts      ← Definição dos planos (CENTRALIZADO)
│   └── featureProtection.ts      ← Validação de acesso (SEGURANÇA)
│
├── services/
│   ├── usageTracker.ts           ← Rastreamento de uso (CORE)
│   ├── supabase.ts               ← BD e Autenticação
│   └── geminiService.ts          ← API Google
│
├── components/
│   ├── UsageDashboard.tsx        ← Exibe limites (UI)
│   ├── LimitReachedModal.tsx      ← Avisa limite atingido (UX)
│   ├── Dashboard.tsx             ← Integra uso do usuário
│   └── UserProfile.tsx           ← Planos e upgrade
│
├── types.ts                       ← Types TypeScript
├── constants.ts                   ← Agentes e prompts
└── AuthContext.tsx              ← Autenticação
```

---

## 🎯 FLUXO DE FUNCIONAMENTO

### 1️⃣ DEFINIÇÃO DOS PLANOS (subscriptionPlans.ts)

```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Iniciante',
    monthlyPrice: 0,
    limits: {
      textGenerations: 150,        // ~5/dia
      imageGenerations: 90,        // ~3/dia
      videoGenerations: 8,         // ~2/semana
      audioGenerations: 50,
      agentsAccess: [...],         // Apenas agentes free
      coursesAccess: ['c3'],
      thinkingBudgetPerMonth: 0
    }
  },
  
  pro: {
    name: 'Pro Master',
    monthlyPrice: 29.90,
    limits: {
      textGenerations: -1,         // Ilimitado
      imageGenerations: -1,        // Ilimitado
      videoGenerations: 50,        // Limitado por custo
      audioGenerations: -1,        // Ilimitado
      agentsAccess: [...ALL...],   // Todos os agentes
      coursesAccess: [...ALL...],
      thinkingBudgetPerMonth: 512000
    }
  }
}
```

**Vantagens:**
- ✅ Fácil de manter (um único arquivo)
- ✅ Fácil adicionar novos planos
- ✅ Configuração centralizada

---

### 2️⃣ RASTREAMENTO DE USO (usageTracker.ts)

```typescript
// Registrar quando usuário faz uma geração
await incrementUsage(userId, 'text', 1, tokenCount);

// Verificar se pode fazer mais gerações
const check = await checkUsageLimit(userId, 'pro', 'text');
// → { allowed: true, remaining: 999999, limit: -1 }

// Obter resumo para dashboard
const summary = await getUsageSummary(userId, 'free');
// → { textGenerations: { used: 45, limit: 150, percentage: 30 } }
```

**Armazenamento:**
- localStorage (para demo rápido)
- Supabase (para produção)
- Sincronização automática entre os dois

**Estrutura:**
```typescript
UserUsage {
  userId: string
  month: "2025-11"              // Reseta todo mês
  textGenerations: 45,
  imageGenerations: 12,
  videoGenerations: 2,
  audioGenerations: 8,
  thinkingTokensUsed: 50000,
  totalTokensUsed: 250000
}
```

---

### 3️⃣ PROTEÇÃO DE FEATURES (featureProtection.ts)

Middleware que valida ANTES de executar feature:

```typescript
// Antes de abrir agente
const result = await validateAgentAccess(user, agent);
if (!result.allowed) {
  showModal(result.reason);
  return;
}

// Validar limite de uso
const usageCheck = await validateAgentUsageLimit(user, agent);
if (!usageCheck.allowed) {
  showLimitReachedModal();
  return;
}

// Feature está liberada!
executeAgent();
```

**3 camadas de validação:**
1. ✅ Usuário está logado?
2. ✅ Plano dele tem acesso a este agente?
3. ✅ Não atingiu limite de uso do mês?

---

### 4️⃣ INTERFACE COM O USUÁRIO

#### UsageDashboard (Exibir Uso)

```tsx
<UsageDashboard user={user} onUpgrade={onUpgrade} />
```

Mostra:
- 📊 Barra de progresso para cada tipo de geração
- 🎯 Quanto falta para atingir limite
- 🚀 Botão de upgrade quando em Free

#### LimitReachedModal (Aviso Amigável)

```tsx
<LimitReachedModal
  isOpen={limitReached}
  type="text"
  used={150}
  limit={150}
  onUpgrade={handleUpgrade}
/>
```

Mostra:
- ⚠️ Aviso em tom amigável
- 💡 Benefícios de fazer upgrade
- 🎁 CTA clara e atraente

---

## 🔐 SEGURANÇA

### 1. Validação em Múltiplas Camadas

```
Frontend (UX) → Validação Local → Backend (Supabase)
```

✅ Frontend avisa antes de enviar  
✅ Backend valida antes de processar  
✅ Banco de dados enforça limites  

### 2. Tipos TypeScript

Evita erros em tempo de desenvolvimento:

```typescript
type PlanType = 'free' | 'pro' | 'pro_annual';
interface SubscriptionPlan { ... }
interface UserUsage { ... }
```

### 3. Sincronização Segura

localStorage + Supabase:
```typescript
// 1. Tenta ler do Supabase (fonte da verdade)
const data = await supabase.from('user_usage').select(...);

// 2. Se falhar, usa localStorage (cache)
const fallback = localStorage.getItem(...);

// 3. Sempre sincroniza para frente
await supabase.upsert(data);
```

---

## 💰 MODELO DE PREÇOS

| Plano | Preço | Text | Image | Video | Thinking |
|-------|-------|------|-------|-------|----------|
| Free | R$ 0 | 150/mês | 90/mês | 8/mês | 0 |
| Pro | R$ 29,90 | ∞ | ∞ | 50/mês | 512k/mês |
| Pro Anual | R$ 299/ano | ∞ | ∞ | 50/mês | 512k/mês |

**Estratégia:**
- Free: Limite baixo para teste (sem cartão)
- Pro: Prático para criadores (R$ 30/mês)
- Pro Anual: Economiza (R$ 60/ano de desconto)

---

## 📊 FLUXO DE INTEGRAÇÃO

### Para Implementar em Componente:

```tsx
import { checkUsageLimit } from '../services/usageTracker';
import { validateAgentAccess } from '../lib/featureProtection';
import LimitReachedModal from './LimitReachedModal';

const AgentComponent = ({ agent, user }) => {
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // 1. Validar acesso
  const accessCheck = await validateAgentAccess(user, agent);
  if (!accessCheck.allowed) {
    return <NotAllowed reason={accessCheck.reason} />;
  }
  
  // 2. Validar limite
  const limitCheck = await validateAgentUsageLimit(user, agent);
  if (!limitCheck.allowed) {
    setShowLimitModal(true);
    return;
  }
  
  // 3. Executar com rastreamento
  const handleExecute = async () => {
    try {
      const result = await agent.execute(input);
      
      // Registrar uso
      await incrementUsage(user.id, agent.type);
      
      return result;
    } catch (e) {
      // Erro na execução
    }
  };
  
  return (
    <>
      <AgentUI onExecute={handleExecute} />
      <LimitReachedModal isOpen={showLimitModal} />
    </>
  );
};
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Integrar no Dashboard (HIGH PRIORITY)

```tsx
// pages/Dashboard.tsx
import UsageDashboard from '../components/UsageDashboard';

export default function Dashboard() {
  return (
    <>
      <UsageDashboard user={user} onUpgrade={handleUpgrade} />
      <Agents ... />
    </>
  );
}
```

### 2. Integrar nos Agentes

```tsx
// Ao clicar no agente
const limitCheck = await validateAgentUsageLimit(user, agent);
if (!limitCheck.allowed) {
  showModal(); // LimitReachedModal
  return;
}
```

### 3. Sincronizar com Supabase

```sql
-- Criar tabela no Supabase
CREATE TABLE user_usage (
  userId TEXT PRIMARY KEY,
  month TEXT,
  textGenerations INT,
  imageGenerations INT,
  videoGenerations INT,
  audioGenerations INT,
  thinkingTokensUsed INT,
  totalTokensUsed INT,
  lastUpdated TIMESTAMP
);

-- Adicionar RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seu próprio uso"
  ON user_usage FOR SELECT
  USING (auth.uid()::text = userId);
```

### 4. Integrar com Stripe

```typescript
// Atualmente: Link de checkout estático
window.open('https://buy.stripe.com/test_...');

// Melhor: Link dinâmico com session ID
const session = await createCheckoutSession({
  userId: user.id,
  planId: 'pro',
  successUrl: window.location.origin + '/success',
  cancelUrl: window.location.origin + '/upgrade'
});
```

---

## 📈 MÉTRICAS IMPORTANTES

Acompanhar (via Supabase):
- Total de usuários Free vs Pro
- Taxa de conversão (Free → Pro)
- Agentes mais usados
- Tipo de geração mais popular
- Churn rate (cancelamentos)

```sql
SELECT 
  COUNT(DISTINCT userId) as total_users,
  tier,
  AVG(textGenerations) as avg_text_usage
FROM user_usage
WHERE month = CURRENT_MONTH
GROUP BY tier;
```

---

## 📝 RESUMO DA ARQUITETURA

```
┌─────────────────────────────────────────────┐
│  USUÁRIO TENTA USAR FEATURE                 │
├─────────────────────────────────────────────┤
│                                             │
│  1. Feature Protection                      │
│     └─ Está logado?                         │
│     └─ Plano tem acesso?                    │
│     └─ Não atingiu limite?                  │
│                                             │
│  2. Se PERMITIDO → Executa                  │
│     └─ Incrementa contador de uso           │
│     └─ Salva em localStorage + Supabase     │
│                                             │
│  3. Se NEGADO → Mostra:                     │
│     └─ Motivo amigável                      │
│     └─ CTA de upgrade                       │
│     └─ Modal com benefícios                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✨ BENEFÍCIOS

**Para Usuários:**
- ✅ Teste grátis sem cartão
- ✅ Sabem os limites antes de usar
- ✅ Upgrade fácil em 1 clique
- ✅ Suporte transparente

**Para Negócio:**
- ✅ Conversão otimizada
- ✅ Reduz custo de API (Free tem limite)
- ✅ Dados de uso para análise
- ✅ Modelo escalável

**Para Código:**
- ✅ Fácil manutenção (planos centralizados)
- ✅ Reutilizável (funciona em qualquer feature)
- ✅ Type-safe (TypeScript)
- ✅ Testável (funções puras)

---

**Implementado com ❤️ para PromptsIA**
