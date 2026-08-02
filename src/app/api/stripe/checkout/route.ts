// ============================================================================
// /api/stripe/checkout — Stripe checkout endpoint (VULN-02 fix)
// ----------------------------------------------------------------------------
// Creates a Checkout Session and returns its URL. The caller MUST be
// authenticated (`requireAuth`) — only logged-in members can start a
// subscription upgrade. The session is bound to the caller's email so Stripe
// can attribute the checkout to the right customer.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey } from "@/lib/services/stripe";
import { requireAuth } from "@/lib/rbac";

interface CheckoutRequestBody {
  planKey?: PlanKey;
  email?: string;
}

const isPlanKey = (value: unknown): value is PlanKey =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    // --- Auth ---------------------------------------------------------------
    const user = await requireAuth();

    // --- Body parse + validation -------------------------------------------
    let payload: CheckoutRequestBody;
    try {
      payload = (await req.json()) as CheckoutRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { planKey, email } = payload;
    if (!isPlanKey(planKey)) {
      return NextResponse.json({ error: "Invalid or missing planKey" }, { status: 400 });
    }
    // Prefer the body-supplied email; fall back to the authenticated user's
    // email claim so the checkout is always attributed to a known account.
    const customerEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? email
      : user.email;
    if (!customerEmail) {
      return NextResponse.json({ error: "Invalid or missing email" }, { status: 400 });
    }

    // --- Stripe call -------------------------------------------------------
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await createCheckoutSession({
      planKey,
      customerEmail,
      successUrl: `${appUrl}/?checkout=success`,
      cancelUrl: `${appUrl}/?checkout=cancelled`,
    });
    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("[stripe/checkout] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
