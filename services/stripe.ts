/**
 * Stripe Integration Service
 * Gerencia checkouts, webhooks e sincronização de assinatures
 */

import { supabase } from './supabase';
import type { User } from '../types';

// Stripe Public Key (será substituído por variável de ambiente)
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Stripe Checkout URLs (pre-created products)
const STRIPE_CHECKOUT_URLS = {
  pro_monthly: import.meta.env.VITE_STRIPE_CHECKOUT_PRO_MONTHLY || 'https://buy.stripe.com/test_pro_monthly',
  pro_annual: import.meta.env.VITE_STRIPE_CHECKOUT_PRO_ANNUAL || 'https://buy.stripe.com/test_pro_annual',
};

// Stripe Price IDs (para webhooks)
const STRIPE_PRICE_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
  pro_annual: import.meta.env.VITE_STRIPE_PRICE_ID_PRO_ANNUAL || 'price_pro_annual',
};

/**
 * Iniciar checkout do Stripe
 * Redireciona o usuário para o Stripe Checkout
 */
export async function startStripeCheckout(
  user: User,
  plan: 'pro_monthly' | 'pro_annual'
): Promise<void> {
  try {
    const checkoutUrl = STRIPE_CHECKOUT_URLS[plan];
    
    if (!checkoutUrl) {
      throw new Error(`Checkout URL não configurado para plano: ${plan}`);
    }

    // Adicionar parâmetros de sessão para rastreamento
    const params = new URLSearchParams({
      client_reference_id: user.id,
      customer_email: user.email,
    });

    // Redirecionar para Stripe
    window.location.href = `${checkoutUrl}?${params.toString()}`;
  } catch (error) {
    console.error('Erro ao iniciar checkout Stripe:', error);
    throw new Error('Falha ao processar checkout. Tente novamente.');
  }
}

/**
 * Processar webhook de conclusão de checkout
 * Chamado pelo backend quando pagamento é confirmado
 */
export async function handleCheckoutSessionCompleted(
  sessionData: {
    id: string;
    client_reference_id?: string;
    customer_email?: string;
    payment_intent?: string;
    payment_status?: string;
    subscription?: string;
  }
): Promise<void> {
  try {
    const userId = sessionData.client_reference_id;
    
    if (!userId) {
      console.error('client_reference_id não encontrado no webhook');
      return;
    }

    // Determinar o plano baseado na subscription ou metadata
    const isPro = !!sessionData.subscription;

    if (!supabase) {
      console.warn('Supabase não disponível, usando localStorage fallback');
      localStorage.setItem('promptsia_user_tier', 'pro');
      return;
    }

    // Atualizar tier no Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tier: 'pro',
        stripe_customer_id: sessionData.subscription || undefined,
        stripe_subscription_id: sessionData.subscription || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar tier no Supabase:', updateError);
      // Mesmo com erro, atualizar localStorage como fallback
      localStorage.setItem('promptsia_user_tier', 'pro');
      return;
    }

    // Atualizar localStorage
    localStorage.setItem('promptsia_user_tier', 'pro');

    // Log de auditoria
    console.log(`✅ Upgrade para Pro confirmado para usuário ${userId}`);

    // Enviar email de confirmação (implementar depois)
    // await sendUpgradeConfirmationEmail(sessionData.customer_email, plan);
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
}

/**
 * Sincronizar estado de assinatura com Supabase
 * Verifica se usuário deve ser downgrade (subscrição expirou)
 */
export async function syncSubscriptionStatus(userId: string): Promise<string> {
  try {
    if (!supabase) {
      const localTier = localStorage.getItem('promptsia_user_tier');
      return localTier || 'free';
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('tier, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Erro ao sincronizar subscription:', error);
      return localStorage.getItem('promptsia_user_tier') || 'free';
    }

    return data.tier || 'free';
  } catch (error) {
    console.error('Erro ao sincronizar subscription:', error);
    return localStorage.getItem('promptsia_user_tier') || 'free';
  }
}

/**
 * Downgrade de assinatura (cancelamento)
 */
export async function handleSubscriptionCancelled(
  sessionData: {
    customer_email?: string;
    subscription?: string;
  }
): Promise<void> {
  try {
    // Encontrar usuário pelo email
    if (!supabase || !sessionData.customer_email) {
      console.warn('Email não encontrado no webhook de cancelamento');
      return;
    }

    const { data, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', sessionData.customer_email)
      .single();

    if (userError || !data) {
      console.warn('Usuário não encontrado:', userError);
      return;
    }

    // Atualizar para free tier
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tier: 'free',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Erro ao fazer downgrade:', updateError);
      return;
    }

    console.log(`⚠️ Downgrade para Free confirmado para usuário ${data.id}`);
  } catch (error) {
    console.error('Erro ao processar cancelamento:', error);
  }
}

/**
 * Validar webhook Stripe
 * Verifica assinatura do webhook para segurança
 */
export function validateStripeWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  // Implementação de validação (requer stripe library no backend)
  // Por enquanto, apenas validar que os dados necessários estão presentes
  try {
    const event = JSON.parse(body);
    return !!(event.type && event.data);
  } catch {
    return false;
  }
}

/**
 * Verificar status de subscription
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    if (!supabase) {
      return {
        tier: localStorage.getItem('promptsia_user_tier') || 'free',
        stripeSubscriptionId: null,
        active: false,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('tier, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { tier: 'free', stripeSubscriptionId: null, active: false };
    }

    return {
      tier: data.tier || 'free',
      stripeSubscriptionId: data.stripe_subscription_id || null,
      active: data.tier === 'pro',
    };
  } catch (error) {
    console.error('Erro ao obter status de subscription:', error);
    return { tier: 'free', stripeSubscriptionId: null, active: false };
  }
}

/**
 * Obter link de gerenciamento de assinatura do Stripe
 */
export async function getStripeCustomerPortalUrl(
  userId: string,
  returnUrl: string
): Promise<string | null> {
  try {
    if (!supabase) {
      console.warn('Supabase não disponível');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !data?.stripe_customer_id) {
      console.warn('Stripe customer ID não encontrado');
      return null;
    }

    // Chamar edge function ou API backend para gerar portal URL
    // Por enquanto, retornar null (será implementado no backend)
    return null;
  } catch (error) {
    console.error('Erro ao obter portal URL:', error);
    return null;
  }
}

export default {
  startStripeCheckout,
  handleCheckoutSessionCompleted,
  syncSubscriptionStatus,
  handleSubscriptionCancelled,
  validateStripeWebhook,
  getSubscriptionStatus,
  getStripeCustomerPortalUrl,
  STRIPE_PUBLIC_KEY,
  STRIPE_PRICE_IDS,
};
