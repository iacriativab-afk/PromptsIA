# 🧪 TESTE DE INTEGRAÇÃO - SISTEMA SAAS

**Data:** 22 de Novembro de 2025  
**Versão:** 1.0  
**Status:** Pronto para Testes Manuais

---

## 🎯 ROTEIROS DE TESTE

### TESTE 1: Usuário Free - Acesso Limitado

```
Cenário: Usuário free tenta usar agente Pro
Resultado Esperado: Acesso bloqueado com modal amigável

Passos:
1. Logar como usuário free
2. Ir para Dashboard
3. Procurar agente com badge "PRO"
4. Clicar no agente
5. Verificar se modal "Acesso Restrito" aparece
6. Clicar em "Fazer Upgrade"
7. Verificar se abre link Stripe

✅ Passou se: Modal aparece + Link funciona
```

### TESTE 2: Usuário Free - Limite de Uso (Text)

```
Cenário: Usuário free usa 150 textos e tenta usar mais

Resultado Esperado: 151ª tentativa bloqueada

Passos:
1. Logar como usuário free
2. Abrir DevTools → Console
3. Executar: localStorage.removeItem('promptsia_user_tier')
4. localStorage.setItem('promptsia_user_tier', 'free')
5. Ir para um agente de Text
6. Executar 150 vezes (simular)
   - localStorage setItem: promptsia_usage_{userId}_{YYYY-MM}
   - Set textGenerations = 150
7. Tentar executar 151ª vez
8. Modal "Limite Atingido" deve aparecer
9. Mostrar: "150 de 150 usado"
10. Mostrar lista de benefícios Pro

✅ Passou se: Modal aparece no 151ª vez
```

### TESTE 3: Usuário Free - Limite de Uso (Video)

```
Cenário: Usuário free usa 8 vídeos/mês

Resultado Esperado: 9ª tentativa bloqueada

Passos:
1. Logar como usuário free
2. Clicar em agente Video
3. Completar 8 gerações de vídeo
4. Tentar 9ª vez
5. Modal deve bloquear: "Você atingiu o limite de 8 vídeos"
6. Oferecer upgrade

✅ Passou se: Modal bloqueia 9ª tentativa
```

### TESTE 4: Usuário Pro - Acesso Completo

```
Cenário: Usuário pro tem acesso a todos agentes

Resultado Esperado: Sem bloqueios, sem avisos

Passos:
1. Logar como usuário pro (tier='pro')
2. Ir para Dashboard
3. Verificar que agentes Pro têm badge "PRO" mas não impedem clique
4. Clicar em agente Pro
5. Não deve haver modal de acesso
6. Deve executar normalmente

✅ Passou se: Clique funciona sem modal
```

### TESTE 5: Usuário Pro - Limite de Video

```
Cenário: Usuário pro tem limite de 50 videos/mês

Resultado Esperado: 51ª tentativa bloqueada

Passos:
1. Logar como usuário pro
2. Clicar em agente Video
3. Executar 50 vezes
4. Tentar 51ª vez
5. Modal deve aparecer: "50 de 50 vídeos"
6. Text/Image/Audio não devem ter limite

✅ Passou se: 51ª tentativa bloqueada
```

### TESTE 6: Dashboard de Uso

```
Cenário: Usuário vê seu uso em tempo real

Resultado Esperado: Dashboard exibe limites e avisos

Passos:
1. Logar como usuário free
2. Clicar em botão "📊 Meu Uso"
3. Dashboard expande
4. Verificar campos:
   - Text: X de 150 (barra verde)
   - Image: X de 90 (barra verde)
   - Video: X de 8 (barra amarela se >6)
   - Audio: X de 50 (barra verde)
5. Fazer 1 geração de texto
6. Clicar em "Refresh"
7. Verificar que contador incrementou

✅ Passou se: Dashboard exibe + atualiza
```

### TESTE 7: Upgrade CTA

```
Cenário: Usuário clica em upgrade

Resultado Esperado: Abre checkout Stripe

Passos:
1. Logar como usuário free
2. Método A: Clicar em modal de acesso → Upgrade
3. Método B: Clicar em modal de limite → Upgrade
4. Método C: Clicar em UsageDashboard → Upgrade
5. Verificar que abre: https://buy.stripe.com/test_...

✅ Passou se: Link abre em nova aba
```

### TESTE 8: Persistent Usage

```
Cenário: Uso persiste entre navegações

Resultado Esperado: Dados não são perdidos

Passos:
1. Logar como usuário free
2. Clicar em UsageDashboard
3. Anotar: "Text: 10 de 150"
4. F5 (refresh página)
5. UsageDashboard ainda mostra: "Text: 10 de 150"
6. Fechar aba e reabrir
7. Verificar que dados persistem

✅ Passou se: Dados persistem em localStorage
```

### TESTE 9: Badge de Aviso

```
Cenário: Quando usuário tem <10 remaining

Resultado Esperado: Badge ⚠️ aparece

Passos:
1. Logar como usuário free
2. Simular: textGenerations = 145
3. Ir para Dashboard
4. Clicar em agente Text
5. Deve mostrar badge: "⚠️ 5"
6. Se remaining = 0
7. Badge deve ser vermelho: "❌ 0"

✅ Passou se: Badges aparecem nas quantidades corretas
```

### TESTE 10: Modal Type-Specific

```
Cenário: Modal mostra ícone correto

Resultado Esperado: Cores e ícones match tipo

Passos para cada tipo:
1. Image → Ícone 🎨, cor pink/rose
2. Video → Ícone 🎬, cor purple
3. Audio → Ícone 🔊, cor cyan
4. Text → Ícone 📝, cor blue

✅ Passou se: Todos match

```

---

## 🔧 TESTES TÉCNICOS

### Cache Test

```javascript
// No console do navegador

// 1. Verificar localStorage
JSON.parse(localStorage.getItem('promptsia_usage_<userId>_2025-11'))

// Esperado:
{
  userId: "...",
  month: "2025-11",
  textGenerations: 45,
  imageGenerations: 12,
  videoGenerations: 2,
  audioGenerations: 8,
  thinkingTokensUsed: 50000
}

// 2. Verificar que chave é correta
localStorage.getItem('promptsia_usage_USER_2025-11')

// 3. Limpar manualmente
localStorage.removeItem('promptsia_usage_USER_2025-11')

// 4. Refresh e verificar que recarrega do Supabase
location.reload()
```

### Hook Test

```typescript
// No componente que usa useUsage()

import { useUsage } from '../UsageContext';

const Demo = () => {
  const { usage, loading, getRemaining, checkLimit, incrementUsageCount } = useUsage();

  return (
    <div>
      <p>Loading: {loading ? 'Sim' : 'Não'}</p>
      <p>Text Remaining: {getRemaining('text')}</p>
      <p>Image Remaining: {getRemaining('image')}</p>
      
      <button onClick={() => checkLimit('text')}>
        Check Text Limit
      </button>
      
      <button onClick={() => incrementUsageCount('text', 1)}>
        Increment Text
      </button>

      <pre>{JSON.stringify(usage, null, 2)}</pre>
    </div>
  );
};
```

### API Integration Test

```typescript
// Testar que geminiService chama onUsageIncrement

const testCallback = async (type: string, amount: number) => {
  console.log(`[USAGE TRACKED] ${type}: +${amount}`);
};

const result = await runAgentGeneration(
  agent,
  "test prompt",
  setLoadingMessage,
  {},
  testCallback  // ← Novo parâmetro
);

// Verificar que console mostra: [USAGE TRACKED] text: +1
```

---

## ⚙️ TESTE DE BUILD

```bash
# 1. Limpar build anterior
rm -r dist

# 2. Build novo
npm run build

# 3. Verificar output
# Esperado:
# - 133 modules
# - 473.64 kB total
# - 136.94 kB gzip
# - 0 errors
# - built in ~5s

# 4. Verificar arquivos criados
ls -la dist/

# 5. Servir localmente
npm run preview
# Abre em http://localhost:4173
```

---

## 📱 TESTE DE RESPONSIVIDADE

```
Dispositivos a testar:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1440x900)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Verificar em cada:
- Botão "📊 Meu Uso" funciona
- Dashboard não fica muito grande
- Modal é legível
- Badges não cobrem texto
```

---

## 🐛 TESTE DE CASOS EXTREMOS

### Caso 1: User null

```typescript
// Quando usuário não está logado
const result = await validateAgentAccess(null, agentFree);
// Esperado: allowed = false
```

### Caso 2: Missing tier

```typescript
// Usuário sem tier definido
const user = { id: '123', name: 'Test' } as User;
// Sistema deve defaultar para 'free'
```

### Caso 3: Concurrent requests

```typescript
// Simular 2 requests simultâneos
const [r1, r2] = await Promise.all([
  incrementUsageCount('text', 1),
  incrementUsageCount('text', 1)
]);
// Esperado: Ambas executam, contador = 2
// Verificar race condition
```

### Caso 4: localStorage full

```javascript
// Preencher localStorage até o limite
// Verificar que Supabase fallback é usado
```

### Caso 5: Offline mode

```typescript
// Desligar internet
// Verificar que localStorage é usado
// Verificar que sync acontece quando voltar online
```

---

## ✅ CHECKLIST FINAL

Antes de mover para produção:

- [ ] Todos os 10 testes de funcionalidade passaram
- [ ] Todos os 5 testes técnicos passaram
- [ ] Build não tem erros/warnings
- [ ] Responsividade funciona em 4 devices
- [ ] Casos extremos foram testados
- [ ] localStorage funciona
- [ ] Supabase integration está pronta (TODO)
- [ ] Stripe webhooks estão prontos (TODO)
- [ ] Equipe revisou código
- [ ] Performance é aceitável (>90 Lighthouse)

---

## 📊 RESULTADO DOS TESTES

```
Data: _______________
Testador: _______________
Versão: 2.0

Resultado Geral: [ ] PASSOU [ ] FALHOU [ ] COM ISSUES

Detalhes:
_________________________________________________
_________________________________________________
_________________________________________________

Assinado:
```

---

**Pronto para testes manuais!**

Desenvolvido com ❤️ para PromptsIA
