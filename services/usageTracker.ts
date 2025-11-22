/**
 * Usage Tracker Service
 * Rastreia o uso mensal de cada usuário
 * Salva em localStorage (para demo) e Supabase (produção)
 */

import { supabase } from './supabase';
import type { PlanType } from '../lib/subscriptionPlans';
import { getPlan } from '../lib/subscriptionPlans';

export interface UserUsage {
  userId: string;
  month: string;                    // "2025-11" format
  textGenerations: number;
  imageGenerations: number;
  videoGenerations: number;
  audioGenerations: number;
  thinkingTokensUsed: number;
  totalTokensUsed: number;
  lastUpdated: string;
}

export interface UsageLimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  message?: string;
}

/**
 * LOCAL STORAGE KEYS
 */
const USAGE_STORAGE_KEY = 'promptsia_usage_';
const USAGE_MONTH_KEY = 'promptsia_usage_month';

/**
 * Obter mês atual em formato ISO (YYYY-MM)
 */
function getCurrentMonth(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Obter dados de uso do usuário
 * Primeiro tenta Supabase, depois localStorage
 */
export async function getUserUsage(userId: string): Promise<UserUsage> {
  const month = getCurrentMonth();
  const localKey = `${USAGE_STORAGE_KEY}${userId}_${month}`;

  try {
    // Tentar Supabase (produção)
    if (supabase) {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('userId', userId)
        .eq('month', month)
        .single();

      if (data && !error) {
        return data as UserUsage;
      }
    }
  } catch (e) {
    console.warn('Supabase usage fetch failed, using localStorage', e);
  }

  // Fallback para localStorage
  try {
    const stored = localStorage.getItem(localKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing localStorage usage:', e);
  }

  // Retornar novo objeto de uso (zerando)
  return {
    userId,
    month,
    textGenerations: 0,
    imageGenerations: 0,
    videoGenerations: 0,
    audioGenerations: 0,
    thinkingTokensUsed: 0,
    totalTokensUsed: 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Atualizar uso do usuário
 * Incrementa contador de uso
 */
export async function incrementUsage(
  userId: string,
  type: 'text' | 'image' | 'video' | 'audio' | 'thinking',
  amount: number = 1,
  tokenCount: number = 0
): Promise<UserUsage> {
  const month = getCurrentMonth();
  const usage = await getUserUsage(userId);

  // Incrementar contador apropriado
  switch (type) {
    case 'text':
      usage.textGenerations += amount;
      break;
    case 'image':
      usage.imageGenerations += amount;
      break;
    case 'video':
      usage.videoGenerations += amount;
      break;
    case 'audio':
      usage.audioGenerations += amount;
      break;
    case 'thinking':
      usage.thinkingTokensUsed += amount;
      break;
  }

  // Atualizar tokens
  usage.totalTokensUsed += tokenCount;
  usage.lastUpdated = new Date().toISOString();

  // Salvar em localStorage
  const localKey = `${USAGE_STORAGE_KEY}${userId}_${month}`;
  localStorage.setItem(localKey, JSON.stringify(usage));

  // Salvar em Supabase (background)
  if (supabase) {
    try {
      await supabase
        .from('user_usage')
        .upsert(usage, { onConflict: 'userId,month' })
        .select();
    } catch (e) {
      console.warn('Failed to sync usage to Supabase:', e);
      // Continuar mesmo que falhe no Supabase
    }
  }

  return usage;
}

/**
 * Verificar se usuário pode fazer uma geração
 * Retorna se está permitido e quantas requisições restam
 */
export async function checkUsageLimit(
  userId: string,
  planId: PlanType,
  type: 'text' | 'image' | 'video' | 'audio'
): Promise<UsageLimitCheckResult> {
  const usage = await getUserUsage(userId);
  const plan = getPlan(planId);
  const limits = plan.limits;

  // Mapear tipo para campo apropriado
  const typeMap = {
    text: { usage: usage.textGenerations, limit: limits.textGenerations },
    image: { usage: usage.imageGenerations, limit: limits.imageGenerations },
    video: { usage: usage.videoGenerations, limit: limits.videoGenerations },
    audio: { usage: usage.audioGenerations, limit: limits.audioGenerations }
  };

  const { usage: currentUsage, limit } = typeMap[type];

  // Se limite é -1, é ilimitado
  if (limit === -1) {
    return {
      allowed: true,
      remaining: 999999,  // Número grande para "ilimitado"
      limit: -1
    };
  }

  const allowed = currentUsage < limit;
  const remaining = limit - currentUsage;

  return {
    allowed,
    remaining,
    limit,
    message: allowed
      ? `Você tem ${remaining} ${type}s restantes este mês.`
      : `Limite de ${limit} ${type}s atingido. Faça upgrade para ilimitado.`
  };
}

/**
 * Obter porcentagem de uso (para visual de progresso)
 */
export async function getUsagePercentage(
  userId: string,
  planId: PlanType,
  type: 'text' | 'image' | 'video' | 'audio'
): Promise<number> {
  const usage = await getUserUsage(userId);
  const plan = getPlan(planId);
  const limits = plan.limits;

  const typeMap = {
    text: { usage: usage.textGenerations, limit: limits.textGenerations },
    image: { usage: usage.imageGenerations, limit: limits.imageGenerations },
    video: { usage: usage.videoGenerations, limit: limits.videoGenerations },
    audio: { usage: usage.audioGenerations, limit: limits.audioGenerations }
  };

  const { usage: currentUsage, limit } = typeMap[type];

  if (limit === -1) return 0;  // Ilimitado = 0%
  if (limit === 0) return 100; // Sem limite = 100%

  return Math.min(100, Math.round((currentUsage / limit) * 100));
}

/**
 * Resetar uso mensal (para teste)
 */
export function resetMonthlyUsage(userId: string): void {
  const month = getCurrentMonth();
  const localKey = `${USAGE_STORAGE_KEY}${userId}_${month}`;
  localStorage.removeItem(localKey);
}

/**
 * Obter resumo de uso para dashboard
 */
export async function getUsageSummary(userId: string, planId: PlanType) {
  const usage = await getUserUsage(userId);
  const plan = getPlan(planId);
  const limits = plan.limits;

  return {
    textGenerations: {
      used: usage.textGenerations,
      limit: limits.textGenerations,
      percentage: limits.textGenerations === -1 ? 0 : Math.round((usage.textGenerations / limits.textGenerations) * 100)
    },
    imageGenerations: {
      used: usage.imageGenerations,
      limit: limits.imageGenerations,
      percentage: limits.imageGenerations === -1 ? 0 : Math.round((usage.imageGenerations / limits.imageGenerations) * 100)
    },
    videoGenerations: {
      used: usage.videoGenerations,
      limit: limits.videoGenerations,
      percentage: limits.videoGenerations === -1 ? 0 : Math.round((usage.videoGenerations / limits.videoGenerations) * 100)
    },
    audioGenerations: {
      used: usage.audioGenerations,
      limit: limits.audioGenerations,
      percentage: limits.audioGenerations === -1 ? 0 : Math.round((usage.audioGenerations / limits.audioGenerations) * 100)
    },
    thinkingTokens: {
      used: usage.thinkingTokensUsed,
      limit: limits.thinkingBudgetPerMonth,
      percentage: limits.thinkingBudgetPerMonth === 0 ? 100 : Math.round((usage.thinkingTokensUsed / limits.thinkingBudgetPerMonth) * 100)
    }
  };
}

/**
 * Verificar se usuário pode acessar feature Pro
 */
export async function canAccessProFeature(userId: string, planId: PlanType): Promise<boolean> {
  return planId !== 'free';
}

/**
 * Obter mensagem de limite atingido (user-friendly)
 */
export function getUpgradeMessage(type: 'text' | 'image' | 'video' | 'audio'): string {
  const messages = {
    text: '🔒 Limite de gerações de texto atingido! Faça upgrade para ilimitado.',
    image: '🔒 Limite de gerações de imagem atingido! Faça upgrade para ilimitado.',
    video: '🔒 Limite de gerações de vídeo atingido! Aumente seu limite com Pro.',
    audio: '🔒 Limite de gerações de áudio atingido! Faça upgrade para ilimitado.'
  };

  return messages[type];
}
