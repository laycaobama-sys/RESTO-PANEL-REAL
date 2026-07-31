// Stripe service — real integration using lazy-initialized client.
// All keys are read from process.env; never hardcoded.

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/** Lazy Stripe client. Throws if STRIPE_SECRET_KEY is not configured. */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

/** Plan definitions matching the pricing page (amounts in cents, EUR). */
export const PLANS = {
  starter_monthly: { price: 4900, name: "Starter", interval: "month" },
  starter_annual: { price: 47000, name: "Starter", interval: "year" },
  professional_monthly: { price: 9900, name: "Professional", interval: "month" },
  professional_annual: { price: 95000, name: "Professional", interval: "year" },
  enterprise_monthly: { price: 24900, name: "Enterprise", interval: "month" },
  enterprise_annual: { price: 239000, name: "Enterprise", interval: "year" },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Parameters required to create a Stripe Checkout session. */
export interface CreateCheckoutSessionParams {
  planKey: PlanKey;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

/** Idempotent per-email price cache (avoids creating duplicate prices). */
const priceCache = new Map<string, Stripe.Price>();

/** Finds or creates a recurring price for the given plan key + customer email. */
async function findOrCreatePrice(
  planKey: PlanKey,
  customerEmail: string,
): Promise<Stripe.Price> {
  const cacheKey = `${planKey}:${customerEmail}`;
  const cached = priceCache.get(cacheKey);
  if (cached) return cached;

  const plan = PLANS[planKey];
  const stripe = getStripe();
  const price = await stripe.prices.create({
    unit_amount: plan.price,
    currency: "eur",
    recurring: { interval: plan.interval },
    product_data: { name: `RestoPanel ${plan.name}` },
  });
  priceCache.set(cacheKey, price);
  return price;
}

/** Creates a Stripe Checkout session for a subscription plan. */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const price = await findOrCreatePrice(params.planKey, params.customerEmail);
  return stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { plan: params.planKey },
  });
}

/** Result of handling a Stripe webhook event. */
export interface WebhookHandleResult {
  received: true;
  type: string;
  eventId: string;
  action?: string;
}

/** Verifies and processes a Stripe webhook event. */
export async function handleWebhook(
  rawBody: string,
  signature: string,
): Promise<WebhookHandleResult> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  let action: string | undefined;
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Idempotency: only provision if metadata.plan is set and customer present.
      const plan = session.metadata?.plan;
      if (plan && session.customer) {
        // Provision tenant here (database wiring is left to the caller layer).
        action = `provision:${plan}`;
      }
      break;
    }
    case "customer.subscription.updated": {
      // Update entitlements based on the new subscription status/items.
      action = "update_entitlements";
      break;
    }
    case "customer.subscription.deleted": {
      // Downgrade to Starter when subscription is canceled.
      action = "downgrade_to_starter";
      break;
    }
    case "invoice.payment_failed": {
      // Mark tenant as past_due.
      action = "mark_past_due";
      break;
    }
    default:
      // Unhandled event type — acknowledge receipt only.
      break;
  }

  return { received: true, type: event.type, eventId: event.id, action };
}

/** Creates a Stripe Billing Portal session for self-service subscription management. */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/** Helper: list customers by email (idempotency check before creating one). */
export async function findCustomerByEmail(
  email: string,
): Promise<Stripe.Customer | null> {
  const stripe = getStripe();
  const list = await stripe.customers.list({ email, limit: 1 });
  return list.data[0] ?? null;
}
