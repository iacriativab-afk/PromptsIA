import React from 'react';
import { ChevronDownIcon } from './Icons';

const TermsOfService: React.FC = () => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 'intro',
      title: '1. Introdução',
      content: `Bem-vindo ao PromptsIA ("Plataforma"). Estes Termos de Uso e a Política de Privacidade descrevem como coletamos, usamos e protegemos seus dados.

Ao usar esta plataforma, você concorda com estes termos. Se não concordar, por favor não use a plataforma.`
    },
    {
      id: 'data-collection',
      title: '2. O Que Coletamos?',
      content: `Coletamos apenas as informações necessárias para funcionamento da plataforma:

**Dados Coletados via Google OAuth:**
- Nome completo (do seu perfil Google)
- Email (verificado pelo Google)
- Avatar/Foto de perfil (do seu perfil Google)
- ID único de autenticação

**Dados Opcionais que Você Fornece:**
- Feedback sobre cancelamento de assinatura
- Chave API do Google (apenas se você for admin)

**Dados NÃO Coletados:**
- ❌ Senhas (OAuth gerencia automaticamente)
- ❌ Número de telefone
- ❌ Endereço físico
- ❌ Dados bancários (Stripe gerencia pagamentos)
- ❌ Histórico de navegação
- ❌ Cookies de rastreamento`
    },
    {
      id: 'data-usage',
      title: '3. Como Usamos Seus Dados?',
      content: `Seus dados são usados APENAS para:

1. **Autenticação Segura**
   - Permitir login via Google OAuth
   - Manter sua sessão segura
   - Recuperar sua conta se necessário

2. **Prestação do Serviço**
   - Exibir sua biblioteca de prompts
   - Gerenciar sua assinatura (free/pro)
   - Armazenar suas preferências

3. **Suporte**
   - Responder a dúvidas por email
   - Investigar problemas técnicos
   - Melhorar a experiência do usuário

4. **Conformidade Legal**
   - Cumprir leis de proteção de dados (LGPD)
   - Prevenir fraude
   - Executar contratos

NÃO usamos seus dados para:
- ❌ Vender para terceiros
- ❌ Criar perfis publicitários
- ❌ Rastreamento de comportamento
- ❌ Marketing não solicitado`
    },
    {
      id: 'data-protection',
      title: '4. Como Protegemos Seus Dados?',
      content: `Usamos múltiplas camadas de segurança:

**Segurança Técnica:**
- 🔐 Criptografia HTTPS para todos os dados em trânsito
- 🔐 Banco de dados Supabase com encriptação em repouso
- 🔐 Row Level Security (RLS) - você só vê seus dados
- 🔐 OAuth 2.0 - padrão da indústria para autenticação
- 🔐 Tokens de sessão com expiração automática

**Acesso aos Dados:**
- Apenas você pode ver seus dados pessoais
- Administradores da plataforma (você ou parceiros) têm acesso limitado
- NUNCA compartilhamos com terceiros sem seu consentimento

**Conformidade:**
- ✅ LGPD (Lei Geral de Proteção de Dados - Brasil)
- ✅ GDPR pronto (Regulamento Geral de Proteção de Dados - EU)
- ✅ Sem tracking de usuários
- ✅ Sem cookies invasivos`
    },
    {
      id: 'user-rights',
      title: '5. Seus Direitos',
      content: `Você tem os seguintes direitos sobre seus dados:

**Direito de Acesso:**
- Você pode ver todos os seus dados a qualquer momento em "Meu Perfil"

**Direito de Retificação:**
- Você pode atualizar seu nome e avatar através da conta Google

**Direito ao Esquecimento:**
- Você pode solicitar a exclusão total de seus dados
- Responderemos em até 30 dias
- Alguns dados podem ser retidos por obrigação legal

**Direito de Portabilidade:**
- Você pode solicitar uma cópia de seus dados em formato legível
- Responderemos em até 15 dias

**Direito de Oposição:**
- Você pode optar por não receber comunicações de marketing
- Você pode desativar sua conta a qualquer momento

**Para Exercer Seus Direitos:**
Envie um email para: suporte@promptsia.com
Inclua: seu email registrado + solicitação clara
Responderemos em até 5 dias úteis`
    },
    {
      id: 'google-oauth',
      title: '6. Integração com Google OAuth',
      content: `A autenticação do PromptsIA é feita 100% através do Google OAuth.

**O Que Isso Significa:**
- Você não cria uma senha no PromptsIA
- Você usa a senha do Google (que já existe)
- Google verifica sua identidade
- PromptsIA recebe apenas: nome, email e avatar

**Benefícios:**
- ✅ Mais seguro (Google gerencia senhas)
- ✅ 2FA automático (se habilitado na sua conta Google)
- ✅ Você controla as permissões no Google
- ✅ Pode revogar acesso a qualquer momento

**Como Revogar Acesso:**
1. Acesse: https://myaccount.google.com/permissions
2. Encontre "PromptsIA"
3. Clique em "Remover Acesso"
4. Sua conta será desativada automaticamente

**Política de Privacidade do Google:**
PromptsIA segue a política de privacidade do Google. Para mais detalhes, visite: https://policies.google.com/privacy`
    },
    {
      id: 'api-key',
      title: '7. Chave API do Google (Administradores)',
      content: `Se você é proprietário do PromptsIA (admin):

**O Que é a Chave API?**
- Um token que permite gerar respostas com o Google Gemini
- Usa seus créditos do Google AI
- Necessária para o SaaS funcionar

**Como é Armazenada?**
- Armazenada apenas no seu navegador (localStorage)
- Nunca enviada ao servidor
- Você é responsável por mantê-la segura

**Boas Práticas:**
- 🔑 Regenere a chave periodicamente
- 🔑 Nunca a compartilhe
- 🔑 Monitorar uso no Google Cloud Console
- 🔑 Se comprometida, regenere imediatamente

**Riscos:**
Se sua chave vazar, alguém pode:
- Gerar conteúdo usando seus créditos
- Aumentar seus custos do Google

**Mitigação:**
Você pode regenerar a chave a qualquer momento em: https://aistudio.google.com/app/apikey`
    },
    {
      id: 'data-retention',
      title: '8. Retenção de Dados',
      content: `Mantemos seus dados pelo seguinte período:

**Durante Atividade:**
- Enquanto sua conta está ativa: indefinidamente
- Necessário para funcionamento do serviço

**Após Exclusão de Conta:**
- Dados pessoais: deletados em até 30 dias
- Logs de atividade: deletados em até 90 dias
- Backups: deletados em até 6 meses
- Dados de transação: retidos por 7 anos (obrigação legal)

**Exceções Legais:**
- Obrigações fiscais: 5 anos (lei brasileira)
- Investigações: conforme necessário
- Fraude: indefinidamente

Para solicitar exclusão, envie email para: suporte@promptsia.com`
    },
    {
      id: 'third-parties',
      title: '9. Terceiros e Integrações',
      content: `PromptsIA usa os seguintes serviços terceirizados:

**Supabase (Banco de Dados)**
- Armazena sua conta e dados de perfil
- Política: https://supabase.com/privacy

**Google (Autenticação e API)**
- Autentica seu acesso
- Gera respostas com Gemini
- Política: https://policies.google.com/privacy

**Stripe (Pagamentos)**
- Processa assinaturas Pro
- Nunca tem acesso a dados pessoais (apenas email)
- Política: https://stripe.com/privacy

**Vercel (Hospedagem)**
- Hospeda a plataforma
- Coleta IPs e User-Agents (padrão)
- Política: https://vercel.com/legal/privacy-policy

**NÃO compartilhamos com:**
- ❌ Empresas de publicidade
- ❌ Redes sociais
- ❌ Afiliados de marketing
- ❌ Ninguém sem seu consentimento

Você pode revisar cada política acessando os links acima.`
    },
    {
      id: 'payment-data',
      title: '10. Dados de Pagamento',
      content: `Processamos pagamentos com segurança máxima:

**Como Funciona:**
1. Você clica em "Assinar"
2. Você é redirecionado para Stripe (não PromptsIA)
3. Você insere dados do cartão no Stripe
4. Stripe processa e nos confirma o pagamento

**PromptsIA NUNCA VÊ:**
- ❌ Número do cartão
- ❌ CVV/Código de segurança
- ❌ Data de validade
- ❌ Dados bancários

**Stripe VÊ:**
- ✅ Seu email (para confirmar)
- ✅ Valor da transação
- ✅ Data do pagamento

**Conformidade:**
- ✅ PCI DSS Level 1 (mais seguro possível)
- ✅ Criptografia de ponta a ponta
- ✅ Sem armazenamento de cartão

Para revisar políticas: https://stripe.com/privacy`
    },
    {
      id: 'children',
      title: '11. Proteção de Menores',
      content: `PromptsIA não é destinado a menores de 13 anos.

**Sua Responsabilidade:**
- Você confirma ter 13+ anos
- Se for menor, peça permissão aos pais

**O Que Não Permitimos:**
- ❌ Contas de menores de 13 anos
- ❌ Coleta de dados de menores de idade
- ❌ Conteúdo impróprio para menores

**Se Descobrirmos:**
- Deletaremos a conta imediatamente
- Removeremos todos os dados
- Notificaremos responsáveis se possível

Se você é pai/responsável de menor usando a plataforma, entre em contato: suporte@promptsia.com`
    },
    {
      id: 'changes',
      title: '12. Mudanças nos Termos',
      content: `Podemos atualizar estes termos a qualquer momento.

**Como Funcionam Atualizações:**
- Publicaremos mudanças aqui
- Você será notificado por email (se fizer login)
- Mudanças maiores têm 30 dias de aviso

**Se Você Continuar Usando:**
- Significa que você aceita as mudanças
- Se não concordar, você pode deletar sua conta

**Histórico:**
- Versão 1.0: 22 de Novembro de 2025
- Próxima revisão: Quando necessário

Para revisar mudanças anteriores, entre em contato: suporte@promptsia.com`
    },
    {
      id: 'contact',
      title: '13. Contato e Dúvidas',
      content: `Tem dúvidas sobre privacidade ou segurança?

**Formas de Contato:**

📧 **Email:** suporte@promptsia.com
- Responderemos em até 2 dias úteis
- Compartilhamos informações de privacidade

💬 **Formulário de Privacidade:** (será adicionado em breve)
- Para solicitações formais de dados
- Resposta garantida em 5 dias úteis

📍 **Endereço:**
PromptsIA
Privacidade e Segurança
(será adicionado quando legal entity criada)

**Autoridade Supervisora (LGPD):**
Se você acha que seus direitos foram violados, pode contatar:
- Autoridade Nacional de Proteção de Dados (ANPD)
- https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd

Levaremos suas preocupações a sério! 🤝`
    }
  ];

  return (
    <div className="min-h-screen bg-brand-primary text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-6 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
          </span>
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Segurança & Privacidade</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Termos de Uso e Política de Privacidade</h1>
        <p className="text-xl text-brand-text-secondary max-w-2xl">
          Leia com atenção. Queremos que você entenda como cuidamos dos seus dados e quais são seus direitos.
        </p>
        <p className="text-sm text-brand-text-secondary/60 mt-6">
          Última atualização: 22 de Novembro de 2025
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-0 border border-white/10 rounded-2xl overflow-hidden bg-brand-surface/50 backdrop-blur">
          {sections.map((section, index) => (
            <div 
              key={section.id}
              className={`border-b border-white/10 last:border-b-0 ${
                expandedSections.has(section.id) ? 'bg-brand-surface/80' : ''
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-brand-surface/50 transition-colors text-left group"
              >
                <h2 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors">
                  {section.title}
                </h2>
                <ChevronDownIcon 
                  className={`h-5 w-5 text-brand-accent transition-transform duration-300 ${
                    expandedSections.has(section.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections.has(section.id) && (
                <div className="px-8 pb-6 text-brand-text-secondary leading-relaxed space-y-4 animate-fade-in">
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <div key={i}>
                      {paragraph.includes('**') ? (
                        <div className="space-y-2">
                          {paragraph.split('\n').map((line, j) => (
                            <div key={j}>
                              {line.includes('**') ? (
                                <p>
                                  {line.split('**').map((part, k) => 
                                    k % 2 === 0 ? part : <strong key={k} className="text-white font-semibold">{part}</strong>
                                  )}
                                </p>
                              ) : (
                                <p>{line}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{paragraph}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-brand-accent/10 border border-brand-accent/30">
          <h3 className="text-xl font-bold text-white mb-4">Concorda com Estes Termos?</h3>
          <p className="text-brand-text-secondary mb-6">
            Ao usar PromptsIA, você automaticamente concorda com estes termos e nossa política de privacidade.
          </p>
          <button className="px-8 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg transition-colors">
            Voltar para Plataforma
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
