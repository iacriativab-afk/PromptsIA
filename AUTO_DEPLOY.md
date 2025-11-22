# 🤖 Auto-Deploy: GitHub → Vercel (Automático)

## ✅ Status: CONFIGURADO!

Seu repositório está **conectado ao Vercel** e funciona assim:

---

## 🔄 Como Funciona o Auto-Deploy

```
Você edita código
        ↓
Faz commit (git commit -m "...")
        ↓
Faz push para GitHub (git push origin main)
        ↓
GitHub recebe as mudanças
        ↓
Webhook dispara para Vercel
        ↓
Vercel faz build automaticamente
        ↓
Seu site é atualizado em 2-3 minutos
        ↓
✅ Site está no ar com a nova versão!
```

---

## 📝 Fluxo Passo a Passo

### 1️⃣ Você trabalha localmente

```bash
# Edita os arquivos no seu computador
# Exemplo: edita App.tsx, adiciona uma feature nova
```

### 2️⃣ Commit no Git

```bash
git add .                                    # Adiciona todas as mudanças
git commit -m "feat: adicionar nova feature" # Cria um commit
```

### 3️⃣ Push para GitHub

```bash
git push origin main                         # Envia para GitHub
```

**Output esperado:**
```
To https://github.com/iacriativab-afk/PromptsIA.git
   25813cd..ff9d455  main -> main
```

### 4️⃣ Vercel recebe e faz build (automático!)

- ✅ Vercel é notificado
- ✅ Faz download do código novo do GitHub
- ✅ Roda `npm install`
- ✅ Roda `npm run build`
- ✅ Faz deploy

**Você não precisa fazer nada!**

### 5️⃣ Site atualizado

```
Seu site em: https://promptsia-xxxxx.vercel.app
✅ Atualizado com a nova versão!
```

---

## ⏱️ Quanto Tempo Leva?

| Etapa | Tempo |
|-------|-------|
| Push para GitHub | Instantâneo |
| Vercel recebe notificação | 5 segundos |
| Build começa | 10 segundos |
| npm install | 30 segundos |
| Build do Vite | 30 segundos |
| Deploy | 10 segundos |
| **TOTAL** | **~2-3 minutos** |

---

## 📊 Acompanhar o Deploy

### No Vercel:

1. Abra: https://vercel.com
2. Clique em seu projeto "PromptsIA"
3. Clique em **"Deployments"**
4. Veja a lista de deploys
5. O mais recente está em processo ou pronto

**Status possíveis:**
- 🟡 **Building** - Está fazendo build
- 🟢 **Ready** - Pronto e no ar!
- 🔴 **Error** - Deu erro no build

---

## ✅ Exemplos de Commits Automáticos

Toda vez que você faz isso, Vercel faz deploy:

```bash
# Exemplo 1: Adicionar feature nova
git push origin main
# → Vercel faz deploy em 2-3 minutos

# Exemplo 2: Corrigir bug
git push origin main
# → Vercel faz deploy em 2-3 minutos

# Exemplo 3: Atualizar documentação
git push origin main
# → Vercel faz deploy em 2-3 minutos
```

---

## 🚨 Se o Deploy Falhar

Se vir 🔴 **Error**, clique nele e veja:

1. **Qual foi o erro?** (aparece na tela)
2. **Copie a mensagem de erro**
3. **Procure por uma solução**

**Erros comuns:**

| Erro | Solução |
|------|---------|
| `Cannot find module` | Falta instalar um pacote |
| `SyntaxError` | Erro no código (parentese faltando, etc) |
| `Cannot resolve` | Falta importar algo |
| `Environment variable` | Falta adicionar variável no Vercel |

---

## 💡 Dicas Úteis

### 1. Commits Descritivos

Sempre use mensagens claras:

```bash
# ✅ BOM
git commit -m "feat: adicionar login com Google"
git commit -m "fix: corrigir erro de validação"
git commit -m "docs: atualizar README"

# ❌ RUIM
git commit -m "update"
git commit -m "ajustes"
git commit -m "teste"
```

### 2. Testar Localmente Antes

Sempre teste antes de fazer push:

```bash
# Roda o projeto localmente
npm run dev

# Abre em: http://localhost:3000
# Testa a nova feature
# Se tudo ok, faz commit e push
```

### 3. Monitorar Deployments

Sempre acompanhe:

```
Fez push → Espera 2-3 minutos → Verifica se ficou verde (Ready)
```

### 4. Rollback (Voltar atrás)

Se der erro e quiser voltar:

```bash
# Ver histórico
git log --oneline

# Voltar para um commit anterior
git reset --hard <hash-do-commit>
git push origin main -f

# Vercel faz deploy da versão anterior
```

---

## 📱 Visualizar Status em Tempo Real

### Terminal Local:

```bash
# Usa git para acompanhar
git log --oneline
git status
```

### No Vercel:

```
https://vercel.com/seu-usuario/promptsia/deployments
```

---

## 🎯 Checklist: Antes de Cada Deploy

- [ ] Código está funcionando localmente?
- [ ] Testou no `npm run dev`?
- [ ] Rodou `npm run build` e não deu erro?
- [ ] Mensagem de commit é clara?
- [ ] Push foi bem-sucedido?

Se passou em tudo ✅, seu site vai estar atualizado em 2-3 minutos!

---

## 📞 Resumo

| Ação | Comando |
|------|---------|
| Ver mudanças | `git status` |
| Adicionar mudanças | `git add .` |
| Fazer commit | `git commit -m "mensagem"` |
| Enviar para GitHub | `git push origin main` |
| Ver histórico | `git log --oneline` |
| Ver status Vercel | Abrir vercel.com |

---

## 🎉 Tudo Pronto!

Seu site está **100% automatizado**!

```
Você edita → Push → GitHub → Vercel → Site atualizado!
Tudo automático, sem você fazer nada! 🚀
```

---

**Pronto para fazer seu primeiro deploy automático?**

1. Faça uma pequena mudança no código
2. `git add .`
3. `git commit -m "test: primeiro deploy automático"`
4. `git push origin main`
5. Aguarde 2-3 minutos
6. Abra seu site no Vercel
7. ✅ Mudança apareceu automaticamente!

**Parabéns! Seu site está automático!** 🎊
