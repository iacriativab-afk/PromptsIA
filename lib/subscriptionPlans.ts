/**
 * Subscription Plans Configuration
 * Define todos os planos, limites de uso e preços
 * Centraliza a lógica de negócios para fácil manutenção
 */

export type PlanType = 'free' | 'pro' | 'pro_annual';

export interface PlanLimits {
  // Geração de Conteúdo
  textGenerations: number;           // Quantas gerações de texto por mês
  imageGenerations: number;          // Quantas imagens por mês
  videoGenerations: number;          // Quantos vídeos por mês
  audioGenerations: number;          // Quantos áudios por mês
  
  // Features
  agentsAccess: string[];            // IDs dos agentes disponíveis
  coursesAccess: string[];           // IDs dos cursos disponíveis
  prompLibraryAccess: boolean;       // Acesso à biblioteca de prompts
  
  // Limites de Contexto
  maxTokensPerRequest: number;       // Máximo de tokens por requisição
  maxConcurrentRequests: number;     // Requisições simultâneas
  
  // Thinking Budget (Gemini Pro Thinking)
  thinkingBudgetPerMonth: number;    // Tokens de "thinking" por mês
  
  // Suporte
  supportLevel: 'community' | 'email' | 'priority'; // Nível de suporte
  maxSupportTickets: number;
}

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  description: string;
  monthlyPrice: number;              // Preço em reais (R$)
  annualPrice?: number;              // Preço anual (com desconto)
  discountPercentage?: number;       // Desconto anual (ex: 20 = 20% de desconto)
  
  // Features Básicas
  features: string[];                // Lista de features para marketing
  limits: PlanLimits;
  
  // Metadata
  color: string;                     // Cor do plano (Tailwind)
  highlight?: boolean;               // Destaca plano como "popular"
  ctaText: string;                   // Texto do botão de CTA
  
  // Stripe
  stripeMonthlyPriceId?: string;     // ID do preço no Stripe (mensal)
  stripAnnualPriceId?: string;       // ID do preço no Stripe (anual)
}

/**
 * DEFINIÇÃO DOS PLANOS
 * 
 * Estratégia:
 * - FREE: Teste sem compromisso com limites baixos
 * - PRO: Acesso completo + suporte
 * - PRO_ANNUAL: PRO com desconto anual
 */

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  // ============================================
  // PLANO GRATUITO
  // ============================================
  free: {
    id: 'free',
    name: 'Iniciante',
    description: 'Teste grátis sem cartão. Limite de uso para explorar.',
    monthlyPrice: 0,
    features: [
      '✓ 5 gerações de texto/dia',
      '✓ 3 gerações de imagem/dia',
      '✓ 2 gerações de vídeo/semana',
      '✓ Acesso a agentes gratuitos',
      '✓ Biblioteca de prompts pública',
      '✓ 5.000 tokens/requisição',
      '✓ Suporte por comunidade'
    ],
    limits: {
      textGenerations: 150,           // ~5/dia * 30 dias
      imageGenerations: 90,           // ~3/dia * 30 dias
      videoGenerations: 8,            // ~2/semana * 4 semanas
      audioGenerations: 50,           // ~1,6/dia
      agentsAccess: [
        'tiktok-architect',
        'digital-launchpad',
        'prompt-productizer',
        'prompt-engineer',
        'academic-summarizer',
        'aida-scriptwriter',
        'content-organizer',
        'text-rewriter',
        'technical-translator'  // Sem custo para free
      ],
      coursesAccess: ['c3'],          // Apenas curso gratuito
      prompLibraryAccess: true,
      maxTokensPerRequest: 5000,
      maxConcurrentRequests: 1,
      thinkingBudgetPerMonth: 0,      // Zero thinking para free
      supportLevel: 'community',
      maxSupportTickets: 0
    },
    color: 'from-slate-500 to-slate-700',
    ctaText: 'Explorar Grátis'
  },

  // ============================================
  // PLANO PRO MENSAL
  // ============================================
  pro: {
    id: 'pro',
    name: 'Pro Master',
    description: 'Acesso ilimitado a todos os agentes premium e recursos avançados.',
    monthlyPrice: 29.90,
    features: [
      '✓ Gerações ilimitadas de texto',
      '✓ Gerações ilimitadas de imagem (Imagen 4.0)',
      '✓ 50 gerações de vídeo/mês (Veo 3.1)',
      '✓ Gerações ilimitadas de áudio',
      '✓ Acesso a TODOS os agentes',
      '✓ Gemini 3 Pro com Deep Thinking',
      '✓ 100.000 tokens/requisição',
      '✓ Suporte prioritário por email',
      '✓ Biblioteca completa de prompts',
      '✓ Acesso a todos os cursos',
      '✓ 512.000 tokens thinking/mês'
    ],
    limits: {
      textGenerations: -1,            // -1 = ilimitado
      imageGenerations: -1,
      videoGenerations: 50,           // Limite para vídeo por custo
      audioGenerations: -1,
      agentsAccess: [
        // Todos os agentes
        'masterhub-tutor',
        'viral-clipper',
        'tiktok-architect',
        'saas-blueprint',
        'digital-launchpad',
        'prompt-productizer',
        'deep-reasoner',
        'hyper-realist',
        'cinematic-director',
        'prompt-engineer',
        'academic-summarizer',
        'ebook-creator',
        'aida-scriptwriter',
        'content-organizer',
        'text-rewriter',
        'technical-translator',
        'audio-generator'
      ],
      coursesAccess: ['c1', 'c2', 'c3'],  // Todos os cursos
      prompLibraryAccess: true,
      maxTokensPerRequest: 100000,
      maxConcurrentRequests: 3,
      thinkingBudgetPerMonth: 512000,    // Muito thinking
      supportLevel: 'priority',
      maxSupportTickets: -1              // Ilimitado
    },
    color: 'from-brand-accent to-purple-600',
    highlight: true,
    ctaText: 'Assinar Pro'
  },

  // ============================================
  // PLANO PRO ANUAL (COM DESCONTO)
  // ============================================
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Master Anual',
    description: 'Mesmo acesso do Pro, mas pague 1 ano e economize 2 meses.',
    monthlyPrice: 29.90,  // Para comparação
    annualPrice: 299.00,  // 12 * 29.90 * 0.83 (17% de desconto)
    discountPercentage: 17,
    features: [
      '✓ Tudo do Pro Master',
      '✓ 17% de desconto anual',
      '✓ Economize R$ 60 ao ano',
      '✓ Pagamento único anual',
      '✓ Renovação automática'
    ],
    limits: {
      // Mesmos limites do Pro
      textGenerations: -1,
      imageGenerations: -1,
      videoGenerations: 50,
      audioGenerations: -1,
      agentsAccess: [
        'masterhub-tutor',
        'viral-clipper',
        'tiktok-architect',
        'saas-blueprint',
        'digital-launchpad',
        'prompt-productizer',
        'deep-reasoner',
        'hyper-realist',
        'cinematic-director',
        'prompt-engineer',
        'academic-summarizer',
        'ebook-creator',
        'aida-scriptwriter',
        'content-organizer',
        'text-rewriter',
        'technical-translator',
        'audio-generator'
      ],
      coursesAccess: ['c1', 'c2', 'c3'],
      prompLibraryAccess: true,
      maxTokensPerRequest: 100000,
      maxConcurrentRequests: 3,
      thinkingBudgetPerMonth: 512000,
      supportLevel: 'priority',
      maxSupportTickets: -1
    },
    color: 'from-brand-accent to-purple-600',
    ctaText: 'Assinar Anual'
  }
};

/**
 * HELPER FUNCTIONS
 */

export function getPlan(planId: PlanType): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId];
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

export function getMonthlyEquivalent(annualPrice: number): number {
  return Math.round((annualPrice / 12) * 100) / 100;
}

export function getSavingsPercentage(monthlyPrice: number, discountPercentage: number): number {
  return monthlyPrice * 12 * (discountPercentage / 100);
}

// Verificar se agente está disponível para plano
export function hasAgentAccess(planId: PlanType, agentId: string): boolean {
  const plan = getPlan(planId);
  return plan.limits.agentsAccess.includes(agentId);
}

// Verificar se curso está disponível para plano
export function hasCourseAccess(planId: PlanType, courseId: string): boolean {
  const plan = getPlan(planId);
  return plan.limits.coursesAccess.includes(courseId);
}

// Verificar se usuário pode fazer geração de texto
export function canGenerateText(planId: PlanType, currentMonthCount: number): boolean {
  const plan = getPlan(planId);
  if (plan.limits.textGenerations === -1) return true; // Ilimitado
  return currentMonthCount < plan.limits.textGenerations;
}

// Obter mensagem amigável de limite atingido
export function getLimitMessage(planId: PlanType, type: 'text' | 'image' | 'video' | 'audio'): string {
  const plan = getPlan(planId);
  const limits = plan.limits;

  const messages: Record<string, string> = {
    text: `Você atingiu o limite de ${limits.textGenerations} gerações de texto este mês. Faça upgrade para Pro para usar ilimitadamente.`,
    image: `Você atingiu o limite de ${limits.imageGenerations} gerações de imagem este mês. Faça upgrade para Pro para usar ilimitadamente.`,
    video: `Você atingiu o limite de ${limits.videoGenerations} gerações de vídeo este mês. Faça upgrade para Pro para aumentar o limite.`,
    audio: `Você atingiu o limite de ${limits.audioGenerations} gerações de áudio este mês. Faça upgrade para Pro para usar ilimitadamente.`
  };

  return messages[type] || 'Você atingiu o limite. Faça upgrade para continuar.';
}
