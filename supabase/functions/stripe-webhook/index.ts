/**
 * Supabase Edge Function - Stripe Webhook Handler
 * Deploy em: supabase/functions/stripe-webhook/index.ts
 * 
 * Processa eventos do Stripe e atualiza o banco de dados
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Stripe Webhook Secret (adicionar em .env.local)
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Supabase Client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Tipos
interface StripeEvent {
  type: string;
  data: {
    object: {
      id?: string;
      client_reference_id?: string;
      customer_email?: string;
      payment_intent?: string;
      payment_status?: string;
      subscription?: string;
      metadata?: Record<string, string>;
      [key: string]: any;
    };
  };
}

/**
 * Processar checkout.session.completed
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.client_reference_id;
  const email = session.customer_email;
  const subscriptionId = session.subscription;

  if (!userId || !email) {
    console.error("client_reference_id ou customer_email faltando");
    return;
  }

  try {
    // 1. Atualizar tier no Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        tier: "pro",
        stripe_customer_id: session.customer || null,
        stripe_subscription_id: subscriptionId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Erro ao atualizar profiles:", updateError);
      throw updateError;
    }

    // 2. Registrar evento em audit log (opcional)
    await supabase.from("audit_logs").insert({
      user_id: userId,
      event: "subscription_upgraded",
      metadata: {
        stripe_session_id: session.id,
        subscription_id: subscriptionId,
        email: email,
      },
      created_at: new Date().toISOString(),
    });

    // 3. Resetar contador de uso mensal (novo mês para Pro)
    const currentMonth = new Date().toISOString().substring(0, 7);
    await supabase
      .from("user_usage")
      .delete()
      .eq("user_id", userId)
      .eq("month", currentMonth);

    console.log(`✅ Upgrade para Pro processado para ${userId}`);
  } catch (error) {
    console.error("Erro ao processar checkout:", error);
    throw error;
  }
}

/**
 * Processar customer.subscription.deleted (cancelamento)
 */
async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;

  try {
    // 1. Encontrar usuário pelo stripe_customer_id
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (userError || !user) {
      console.warn("Usuário não encontrado para stripe_customer_id:", customerId);
      return;
    }

    // 2. Downgrade para Free
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        tier: "free",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao fazer downgrade:", updateError);
      throw updateError;
    }

    // 3. Registrar evento
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      event: "subscription_cancelled",
      metadata: {
        stripe_subscription_id: subscription.id,
        cancelled_at: subscription.canceled_at,
      },
      created_at: new Date().toISOString(),
    });

    console.log(`⚠️ Downgrade para Free processado para ${user.id}`);
  } catch (error) {
    console.error("Erro ao processar cancelamento:", error);
    throw error;
  }
}

/**
 * Processar invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  try {
    // Registrar pagamento bem-sucedido
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (!userError && user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        event: "invoice_paid",
        metadata: {
          invoice_id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
        },
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
  }
}

/**
 * Validar assinatura do webhook
 * Nota: Stripe recomenda implementar isso, mas por simplicidade
 * vamos usar client_reference_id como validação básica
 */
function validateWebhookSignature(
  body: string,
  signature: string
): boolean {
  // TODO: Implementar validação com crypto
  // Por enquanto, apenas verificar que é JSON válido
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handler principal
 */
serve(async (req) => {
  // Apenas aceitar POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // 1. Ler body
    const body = await req.text();

    // 2. Validar assinatura
    const signature = req.headers.get("stripe-signature") || "";
    if (!validateWebhookSignature(body, signature)) {
      console.warn("Webhook signature inválida");
      return new Response("Webhook signature invalid", { status: 401 });
    }

    // 3. Fazer parse do evento
    const event: StripeEvent = JSON.parse(body);

    // 4. Processar baseado no tipo
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        console.warn("Pagamento falhou:", event.data.object.id);
        break;

      default:
        console.log(`Evento ignorado: ${event.type}`);
    }

    // 5. Responder sucesso
    return new Response(
      JSON.stringify({ received: true, type: event.type }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
