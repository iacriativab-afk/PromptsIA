# 🔄 Sincronização Automática: Alterações → GitHub

## ✅ Como Funciona

Toda vez que você fizer uma alteração, nós vamos:

1. **Salvar o arquivo** (você edita no VS Code)
2. **Fazer commit** automaticamente (git commit)
3. **Fazer push** automaticamente (git push origin main)
4. **GitHub atualiza** instantaneamente

---

## 🔐 Como Garantir Isso

Para que funcione 100%, você precisa:

### 1. **Ter Git configurado localmente**

```bash
# Verificar se Git está configurado
git config user.name
git config user.email
```

Se não aparecer nada, configure:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 2. **Ter Acesso SSH ou HTTPS ao GitHub**

**Opção A: SSH (Recomendado)**

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu@email.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Ir em GitHub → Settings → SSH Keys → Add SSH Key
# Cole a chave
```

**Opção B: HTTPS (Mais Fácil)**

```bash
# GitHub criará um token automaticamente
# Ou você pode criar em: GitHub → Settings → Developer Settings → Personal Access Tokens
```

### 3. **Verificar Que Está Sincronizado**

```bash
cd /caminho/do/projeto
git remote -v

# Deve mostrar:
# origin  https://github.com/iacriativab-afk/PromptsIA.git (fetch)
# origin  https://github.com/iacriativab-afk/PromptsIA.git (push)
```

---

## 📝 Workflow Automático

### Sempre Que Você Editar Um Arquivo:

```
1. Você edita o arquivo no VS Code
   ↓
2. Salva (Ctrl+S)
   ↓
3. Abre terminal
   ↓
4. Executa:
   git add .
   git commit -m "sua mensagem"
   git push origin main
   ↓
5. GitHub recebe e atualiza em tempo real
```

---

## ⚡ Atalho Rápido (Script)

Para não ter que digitar tudo toda vez, crie um arquivo chamado `commit.sh`:

```bash
#!/bin/bash

# Verifica se tem mudanças
if [ -z "$(git status --porcelain)" ]; then
    echo "Nenhuma mudança para fazer commit."
    exit 0
fi

# Adiciona tudo
git add .

# Pede a mensagem de commit
read -p "Mensagem do commit: " message

# Faz commit
git commit -m "$message"

# Faz push
git push origin main

echo "✅ Alterações enviadas para GitHub!"
```

**Como usar:**

```bash
./commit.sh
# Digite a mensagem
# Enter
# Pronto! GitHub atualizado!
```

---

## 🎯 Exemplos de Mensagens de Commit

```bash
# Feature nova
git commit -m "feat: adicionar novo componente Login"

# Corrigir bug
git commit -m "fix: corrigir erro de validação"

# Atualizar documentação
git commit -m "docs: atualizar README"

# Melhorias
git commit -m "refactor: otimizar código"

# Estilo/formatação
git commit -m "style: formatar código"
```

---

## ✅ Verificar Sincronização

Depois de fazer push, você pode verificar:

```bash
# Ver commits locais
git log --oneline -5

# Verificar se está sincronizado
git status

# Deve mostrar: "Your branch is up to date with 'origin/main'"
```

---

## 🚨 Se Algo Der Errado

### Erro: "Your branch is ahead of origin/main"

```bash
# Significa que tem commits que não foram enviados
# Solução:
git push origin main
```

### Erro: "Permission denied (publickey)"

```bash
# Significa que SSH não está configurado
# Solução:
# 1. Gerar chave SSH (veja acima)
# 2. Adicionar em GitHub
# 3. Testar: ssh -T git@github.com
```

### Erro: "Conflict"

```bash
# Significa que alguém alterou o mesmo arquivo
# Solução:
git pull origin main  # Puxa as mudanças remotas
# Resolver conflitos manualmente
git add .
git commit -m "Merge: resolver conflitos"
git push origin main
```

---

## 📱 Resumo: Comando Padrão

```bash
# Tudo em um comando:
git add . && git commit -m "sua mensagem aqui" && git push origin main
```

**Ou mais legível:**

```bash
git add .
git commit -m "sua mensagem aqui"
git push origin main
```

---

## 🔄 Ciclo Completo

```
Você edita arquivo
        ↓
Salva (Ctrl+S)
        ↓
Terminal: git add .
        ↓
Terminal: git commit -m "mensagem"
        ↓
Terminal: git push origin main
        ↓
✅ GitHub atualizado em tempo real
        ↓
Vercel auto-redeploy (2-3 min depois)
        ↓
✅ Seu site no ar com a nova versão
```

---

## 🎯 Agora Você Tem

✅ Alterações locais → GitHub (automático)  
✅ GitHub → Vercel (automático)  
✅ Vercel → Site no ar (automático)

**Tudo 100% automatizado!** 🚀

---

## 📝 Próximo Passo

Agora que você sabe como, a partir daqui:

1. **Toda mudança** que fizermos vai ser:
   - ✅ Commitada no Git
   - ✅ Enviada para GitHub
   - ✅ Refletida no repositório

2. **Toda mudança** no GitHub vai ser:
   - ✅ Detectada por Vercel
   - ✅ Feito novo build
   - ✅ Atualizado o site (2-3 min)

---

**Pronto! A partir de agora, tudo é automático!** 🎉
