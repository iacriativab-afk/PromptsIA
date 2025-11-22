/**
 * Feature Protection Middleware
 * Valida acesso a features com base no plano e limites de uso
 * Centraliza a lógica de autenticação de features
 */

import type { User } from '../types';
import type { Agent, Prompt, Course } from '../types';
import type { PlanType } from './subscriptionPlans';
import { hasAgentAccess, hasCourseAccess, getPlan } from './subscriptionPlans';
import { checkUsageLimit, getUsagePercentage, getUserUsage } from '../services/usageTracker';

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  plan?: string;
  upgrade?: {
    message: string;
    actionUrl?: string;
  };
}

/**
 * VALIDAR ACESSO AO AGENTE
 */
export async function validateAgentAccess(
  user: User | null,
  agent: Agent
): Promise<FeatureAccessResult> {
  // Não logado = sem acesso a agentes Pro
  if (!user) {
    if (agent.requiresPro) {
      return {
        allowed: false,
        reason: 'Você precisa estar logado para acessar este agente.',
        upgrade: {
          message: 'Faça login ou crie uma conta gratuita para continuar.'
        }
      };
    }
    // Deixar anônimos acessarem agentes gratuitos
    return { allowed: true };
  }

  // Verificar se agente requer Pro
  if (agent.requiresPro && user.tier !== 'pro') {
    return {
      allowed: false,
      reason: `O agente "${agent.name}" está disponível apenas no plano Pro Master.`,
      plan: 'pro',
      upgrade: {
        message: 'Faça upgrade para Pro Master para acessar este agente exclusivo.',
        actionUrl: '/upgrade'
      }
    };
  }

  // Verificar plano
  if (!hasAgentAccess(user.tier, agent.id)) {
    return {
      allowed: false,
      reason: `Este agente não está disponível no seu plano (${user.tier}).`,
      upgrade: {
        message: 'Faça upgrade para acessar todos os agentes.',
        actionUrl: '/upgrade'
      }
    };
  }

  return { allowed: true };
}

/**
 * VALIDAR LIMITE DE USO DO AGENTE
 */
export async function validateAgentUsageLimit(
  user: User,
  agent: Agent
): Promise<FeatureAccessResult> {
  if (!user) {
    return {
      allowed: false,
      reason: 'Você precisa estar logado.'
    };
  }

  // Mapear tipo de agente para tipo de uso
  const typeMap = {
    text: 'text' as const,
    image: 'image' as const,
    audio: 'audio' as const,
    video: 'video' as const
  };

  const usageType = typeMap[agent.type];

  try {
    const limitCheck = await checkUsageLimit(user.id, user.tier, usageType);

    if (!limitCheck.allowed) {
      return {
        allowed: false,
        reason: limitCheck.message,
        upgrade: {
          message: `Você atingiu seu limite mensal de ${usageType}s. Faça upgrade para continuar.`,
          actionUrl: '/upgrade'
        }
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Erro ao verificar limite de uso:', error);
    // Deixar passar em caso de erro (fail-open)
    return { allowed: true };
  }
}

/**
 * VALIDAR ACESSO AO CURSO
 */
export async function validateCourseAccess(
  user: User | null,
  course: Course
): Promise<FeatureAccessResult> {
  if (!user) {
    return {
      allowed: false,
      reason: 'Você precisa estar logado para acessar cursos.',
      upgrade: {
        message: 'Crie uma conta gratuita para começar.'
      }
    };
  }

  if (course.requiresPro && user.tier !== 'pro') {
    return {
      allowed: false,
      reason: `O curso "${course.title}" está disponível apenas no plano Pro Master.`,
      plan: 'pro',
      upgrade: {
        message: 'Faça upgrade para Pro Master para acessar este curso exclusivo.',
        actionUrl: '/upgrade'
      }
    };
  }

  if (!hasCourseAccess(user.tier, course.id)) {
    return {
      allowed: false,
      reason: `Este curso não está disponível no seu plano.`,
      upgrade: {
        message: 'Faça upgrade para acessar todos os cursos.',
        actionUrl: '/upgrade'
      }
    };
  }

  return { allowed: true };
}

/**
 * VALIDAR ACESSO À PROMPT
 */
export async function validatePromptAccess(
  user: User | null,
  prompt: Prompt
): Promise<FeatureAccessResult> {
  if (prompt.requiresPro && (!user || user.tier !== 'pro')) {
    return {
      allowed: false,
      reason: 'Esta prompt requer o plano Pro Master.',
      upgrade: {
        message: 'Faça upgrade para acessar prompts premium.',
        actionUrl: '/upgrade'
      }
    };
  }

  return { allowed: true };
}

/**
 * OBTER RECOMENDAÇÃO DE PLANO
 * Baseado no uso atual do usuário
 */
export async function recommendPlanUpgrade(user: User): Promise<{
  shouldUpgrade: boolean;
  reason: string;
  currentPlan: string;
  recommendedPlan: PlanType;
}> {
  try {
    const usage = await getUserUsage(user.id);
    const plan = getPlan(user.tier);
    const limits = plan.limits;

    // Calcular uso percentual
    const textPercentage = limits.textGenerations === -1 ? 0 : (usage.textGenerations / limits.textGenerations) * 100;
    const imagePercentage = limits.imageGenerations === -1 ? 0 : (usage.imageGenerations / limits.imageGenerations) * 100;
    const videoPercentage = limits.videoGenerations === -1 ? 0 : (usage.videoGenerations / limits.videoGenerations) * 100;

    const maxUsage = Math.max(textPercentage, imagePercentage, videoPercentage);

    // Se usando mais de 80%, recomendar upgrade
    if (user.tier === 'free' && maxUsage > 80) {
      return {
        shouldUpgrade: true,
        reason: `Você está usando ${Math.round(maxUsage)}% de seu limite mensal.`,
        currentPlan: 'free',
        recommendedPlan: 'pro'
      };
    }

    return {
      shouldUpgrade: false,
      reason: 'Seu uso está dentro dos limites.',
      currentPlan: user.tier,
      recommendedPlan: user.tier as PlanType
    };
  } catch (error) {
    console.error('Erro ao recomendar plano:', error);
    return {
      shouldUpgrade: false,
      reason: 'Não foi possível analisar o uso.',
      currentPlan: user.tier,
      recommendedPlan: user.tier as PlanType
    };
  }
}

/**
 * FORMATADOR: Converter resultado em componente
 */
export function formatAccessDenialMessage(result: FeatureAccessResult): string {
  if (result.allowed) return '';

  let message = result.reason || 'Acesso negado.';

  if (result.upgrade?.message) {
    message += '\n\n' + result.upgrade.message;
  }

  return message;
}

