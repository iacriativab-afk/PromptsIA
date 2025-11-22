# 🚀 Guia Simples para Colocar seu Site no Ar

**Leia isto primeiro!** Este guia é para iniciantes absolutos.

---

## ⏱️ Quanto tempo leva?
- **Total: 15 a 20 minutos**
- Nenhuma etapa é complicada, você só vai clicar botões e copiar/colar texto

---

## 📋 O que você vai fazer

Você vai fazer 3 coisas bem simples:

1. **Ir a um site** e fazer login
2. **Conectar seu repositório** (pasta do projeto) lá
3. **Clicar um botão** para colocar seu site no ar

É literalmente isto. Sem código, sem programação.

---

## ✅ PASSO 1: Criar Conta no Vercel (5 minutos)

**O que é Vercel?**  
É um site que pega seu projeto e coloca na internet para que qualquer pessoa acesse. Tipo um "hospedeiro" do seu site.

### Passos:

1. Abra este link no seu navegador:
   ```
   https://vercel.com
   ```

2. Clique em **"Sign Up"** (no canto superior direito)
   
3. Escolha **"Continue with GitHub"** (com a logo do GitHub)

4. Você vai entrar com a conta do GitHub (aquela que você já tem)

5. Pronto! Sua conta no Vercel está criada.

---

## ✅ PASSO 2: Conectar seu Projeto (5 minutos)

Agora você vai dizer ao Vercel qual é o seu projeto.

### Passos:

1. Depois que fizer login, clique em **"New Project"** (ou "Add New Project")

2. Você vai ver uma lista de seus repositórios do GitHub
   - Procure por **"PromptsIA"**

3. Clique nele para selecioná-lo

4. Uma tela nova vai aparecer. **Não mude nada!** Clique direto em **"Deploy"**
   - O Vercel vai automaticamente detectar tudo que precisa

5. Aguarde... pode levar de 2 a 5 minutos
   - Você vai ver uma barra de progresso

---

## ⚙️ PASSO 3: Adicionar as Senhas Secretas (5 minutos)

Seu site precisa de algumas "senhas" para funcionar:
- Senha do Google IA
- Senha do banco de dados (Supabase)
- Etc.

**IMPORTANTE:** Essas senhas NÃO vão para a internet. Ficam seguras no Vercel.

### Como fazer:

1. Procure por um arquivo chamado **`.env.local.example`** na pasta do projeto
   - Ele tem lista de todas as senhas que você precisa

2. Para cada item na lista:
   - **Google Generative AI Key**: Você já deve ter isso (da configuração anterior)
   - **Supabase URL** e **Supabase Key**: Você já deve ter isso (do Supabase)
   - **Google Client ID**: Você tem isso também (do Google OAuth)

3. No Vercel, depois do deploy:
   - Clique em **"Settings"** (engrenagem)
   - Procure por **"Environment Variables"**
   - Clique em **"Add Environment Variable"**
   
4. Para cada senha:
   - **Nome** (lado esquerdo): Copie do arquivo `.env.local.example`
   - **Valor** (lado direito): Copie a senha que você tem
   - Clique **"Save"**

5. Exemplo:
   ```
   Nome: VITE_GEMINI_API_KEY
   Valor: (sua chave do Google, aquele texto longo)
   ```

---

## 🎉 PASSO 4: Seu Site Está No Ar!

Depois de adicionar todas as senhas:

1. Clique em **"Deployments"** (abas no topo)

2. Clique no deployment mais recente (o primeiro da lista)

3. Você vai ver um link como:
   ```
   https://promptsia-xxxxx.vercel.app
   ```

4. **Clique neste link!** Seu site vai abrir.

---

## 🧪 Testando seu Site

Quando ele abrir, teste:

- ✅ Conseguiu fazer login com Google?
- ✅ Conseguiu acessar o dashboard?
- ✅ Conseguiu usar a busca?
- ✅ Os prompts aparecem?

Se tudo funcionar = **Parabéns! Seu site está no ar!** 🎊

---

## ❌ Se Deu Erro...

Se algo não funcionou, a causa é quase sempre uma destas:

### Erro: "Deployment failed"
- Significa que o Vercel não conseguiu preparar o site
- **Solução**: Volte ao PASSO 2 e clique em "Redeploy" para tentar novamente

### Erro: "Cannot find variable" ou "undefined"
- Significa que esqueceu de adicionar uma senha no Passo 3
- **Solução**: Volta ao PASSO 3 e verifica se copiou todas as senhas

### Erro: "Cannot connect to database"
- Significa que a senha do Supabase está errada
- **Solução**: Copia de novo do Supabase e cola no Vercel

### Erro: "Google login not working"
- Significa que a senha do Google está errada
- **Solução**: Verifica se o Google Client ID está correto

---

## 📞 Resumo Rápido

| O quê | Quanto tempo | Como |
|-------|-----------|------|
| Criar conta Vercel | 2 min | Vai no site, clica "Sign Up", entra com GitHub |
| Conectar projeto | 3 min | Clica "New Project", escolhe PromptsIA, clica "Deploy" |
| Adicionar senhas | 5 min | Vai em Settings > Environment Variables, cola as 4-5 senhas |
| Testar o site | 2 min | Abre o link que Vercel dá e testa se funciona |
| **TOTAL** | **15 min** | **Seu site está no ar!** |

---

## 🎯 Próximo: Usar seu Site

Depois que o site estiver no ar, você pode:

1. **Compartilhar o link** com outras pessoas
2. **Usar no seu navegador** normalmente
3. **Criar um domínio personalizado** (opcional, mais complicado)

---

## 📱 Dúvidas Frequentes

**P: Preciso fazer algo no meu computador?**  
R: Não! Tudo é pelo navegador. Vercel faz o trabalho.

**P: As senhas ficam seguras?**  
R: Sim! O Vercel usa criptografia. Ninguém vê suas senhas.

**P: Posso desfazer se errar?**  
R: Sim! Clica em "Redeploy" e tenta novamente.

**P: Meu site fica no ar 24/7?**  
R: Sim! Fica sempre disponível.

**P: Custa dinheiro?**  
R: A versão gratuita é suficiente para começar!

---

## 🏁 Checklist Final

Antes de começar, confirme que você tem:

- [ ] Link do GitHub (https://github.com/seu-usuario/PromptsIA)
- [ ] Conta no Google (para fazer login no site)
- [ ] Supabase URL e Key (do seu banco de dados)
- [ ] Google Generative AI Key (para IA funcionar)
- [ ] Google Client ID (para login com Google)

Tem tudo? Então vamos lá! 🚀

---

**Pronto para começar?**  
👉 Vai direto para **PASSO 1** acima!
