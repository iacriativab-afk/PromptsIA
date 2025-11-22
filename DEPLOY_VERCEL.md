# 🚀 Guia Completo: Deploy no Vercel

**Tempo total: 10-15 minutos**

---

## 📋 O que você vai fazer

1. Ir no Vercel
2. Conectar seu repositório GitHub
3. Adicionar as senhas (variáveis de ambiente)
4. Clicar "Deploy"
5. **Seu site estará no ar!**

Nada de complicado. Só clicar botões.

---

## ✅ PASSO 1: Criar/Entrar na Conta Vercel (2 minutos)

### Se não tem conta ainda:

1. Abra: https://vercel.com
2. Clique em **"Sign Up"** (no canto superior direito)
3. Escolha **"Continue with GitHub"**
4. Faça login com sua conta do GitHub
5. Pronto! Conta criada.

### Se já tem conta:

1. Abra: https://vercel.com
2. Faça login com GitHub
3. Pronto!

---

## ✅ PASSO 2: Criar um Novo Projeto (3 minutos)

Depois de logado no Vercel:

1. Clique em **"Add New..."** (canto superior esquerdo)
2. Escolha **"Project"**
3. Você vai ver uma lista de seus repositórios do GitHub
4. **Procure por "PromptsIA"** e clique nele

**Tela vai ficar assim:**

```
┌─────────────────────────────────┐
│ Configurar Projeto              │
├─────────────────────────────────┤
│ Project Name: PromptsIA         │
│ Framework: Vite                 │
│ Root Directory: ./              │
└─────────────────────────────────┘
```

5. **Não mude nada!** Tudo já está correto.
6. Clique em **"Deploy"** (botão azul)

**Agora espere...** Vai levar de 2 a 5 minutos.

Você vai ver uma tela com uma barra de progresso azul. Deixa ela rodar.

---

## ⚠️ PASSO 3: Adicionar as Senhas (Variáveis de Ambiente) - 5 minutos

**Isso é IMPORTANTE!** Seu site precisa das senhas para funcionar.

### Onde estão as senhas?

Você já tem tudo isso de antes:
- **Google Generative AI Key** (da configuração do Google AI)
- **Supabase URL** (do seu painel Supabase)
- **Supabase Anon Key** (do seu painel Supabase)
- **Google Client ID** (do seu Google OAuth)

### Como adicionar no Vercel:

**Opção A: Antes de fazer Deploy (recomendado)**

1. Antes de clicar "Deploy", vá em **"Environment Variables"**
2. Para cada linha abaixo, clique em **"Add"**:

```
Nome da Variável: VITE_GEMINI_API_KEY
Valor: (sua chave do Google, aquele texto longo)
[Clique "Save"]

Nome da Variável: VITE_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
[Clique "Save"]

Nome da Variável: VITE_SUPABASE_ANON_KEY
Valor: (sua chave pública do Supabase, aquele texto longo)
[Clique "Save"]

Nome da Variável: VITE_GOOGLE_CLIENT_ID
Valor: (seu Google Client ID)
[Clique "Save"]
```

Depois clique em **"Deploy"**.

**Opção B: Depois de fazer Deploy**

Se você já clicou "Deploy" sem adicionar as senhas, não tem problema:

1. Após o deploy terminar, clique em **"Settings"** (aba no topo)
2. Procure por **"Environment Variables"** (no menu esquerdo)
3. Clique em **"Add Environment Variable"**
4. Para cada senha acima:
   - **Name** (esquerda): `VITE_GEMINI_API_KEY` (exemplo)
   - **Value** (direita): sua chave
   - Clique **"Save"**
5. Quando terminar, clique em **"Deployments"** no topo
6. Clique no deployment recente
7. Clique em **"Redeploy"** para ele usar as novas senhas

---

## 🎉 PASSO 4: Seu Site Está No Ar!

Quando o deployment terminar, você vai ver um link como:

```
https://promptsia-xxxxx.vercel.app
```

**Clique nele!** Seu site vai abrir.

---

## 🧪 PASSO 5: Testar o Site (2 minutos)

Quando o site abrir, teste:

- [ ] Clique em **"Entrar com Google"** - faz login funcionar?
- [ ] Tente fazer login
- [ ] Se funcionar, parabéns! 🎊
- [ ] Se não, volta ao Passo 3 e verifica as senhas

### Se o login não funciona:

**Causa 1: Senhas erradas**
- Volta ao Vercel
- Settings > Environment Variables
- Verifica se copiou tudo certo
- Clica "Redeploy"
- Aguarda 2 minutos

**Causa 2: Google Client ID configurado errado**
- Vai no Google Cloud Console
- Verifica se configurou o Vercel como origem autorizada
- Copia o Client ID correto
- Cola no Vercel
- Clica "Redeploy"

**Causa 3: Supabase URL ou Key errada**
- Vai no Supabase
- Clica em "Settings" > "API"
- Copia URL e Anon Key de novo
- Cola no Vercel
- Clica "Redeploy"

---

## 📍 Como Copiar as Senhas

### Do Google (Gemini API Key)

1. Vai em: https://aistudio.google.com/apikey
2. Procura por: "API key for PromptsIA" (ou a que você criou)
3. Clica em "Copy"
4. Cola no Vercel em `VITE_GEMINI_API_KEY`

### Do Google (Client ID)

1. Vai em: https://console.cloud.google.com
2. Procura por seu projeto
3. Vai em "APIs & Services" > "Credentials"
4. Procura por "OAuth 2.0 Client ID"
5. Copia o "Client ID"
6. Cola no Vercel em `VITE_GOOGLE_CLIENT_ID`

### Do Supabase

1. Vai em seu projeto no Supabase: https://supabase.com
2. Clica em "Settings" (engrenagem, embaixo à esquerda)
3. Clica em "API"
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (key) → `VITE_SUPABASE_ANON_KEY`
5. Cola no Vercel

---

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Tem conta no Vercel
- [ ] Tem repositório "PromptsIA" no GitHub
- [ ] Tem Google Generative AI Key
- [ ] Tem Google Client ID
- [ ] Tem Supabase URL
- [ ] Tem Supabase Anon Key
- [ ] Criou tabela `profiles` no Supabase
- [ ] GitHub tem as últimas mudanças (corrigimos alguns bugs)

Se marcou tudo ✅, está pronto para fazer deploy!

---

## 🏁 Resumo Rápido

| O quê | Tempo | Como |
|-------|-------|------|
| Entrar no Vercel | 1 min | Abrir vercel.com, fazer login |
| Criar projeto | 2 min | Clique "Add Project", escolha PromptsIA |
| Adicionar senhas | 3 min | Environment Variables, adicione 4 variáveis |
| Fazer deploy | 3 min | Clique "Deploy", aguarde |
| Testar | 2 min | Abre o link, testa login |
| **TOTAL** | **15 min** | **Site no ar!** |

---

## 🚨 Problemas Comuns

### "Deployment failed"
- Significa que houve um erro no build
- **Solução**: Clique em "Logs" para ver qual é o erro
- Geralmente é variável de ambiente faltando

### "Cannot find module"
- Significa que falta instalar algum pacote
- **Solução**: Não deve acontecer, pra gente já verificou

### "Google login not working"
- Significa que Google Client ID está errado
- **Solução**: Copia de novo do Google Cloud Console

### "Cannot connect to database"
- Significa que Supabase URL ou Key está errada
- **Solução**: Copia de novo do Supabase

---

## 💡 Dicas

1. **Auto-deployment**: Toda vez que você faz push no GitHub, Vercel redeploy automaticamente
2. **Domínio gratuito**: Você ganha um domínio grátis `.vercel.app`
3. **SSL grátis**: HTTPS vem de graça
4. **Analytics**: Vercel mostra quanto seu site é acessado
5. **Logs**: Você pode ver o que aconteceu em cada deploy

---

## 📞 Precisa de Ajuda?

Se deu erro, procure por:
- URL do seu site em Vercel
- Nome do erro
- No Google: "Vercel [nome do erro]"
- Geralmente tem solução

---

**🎉 Pronto! Agora é só fazer deploy e seu site estará no ar!**

**Qualquer dúvida, me chama!**
