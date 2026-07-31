// Stripe checkout endpoint — creates a Checkout Session and returns its URL.
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey } from "@/lib/services/stripe";

interface CheckoutRequestBody {
  planKey?: PlanKey;
  email?: string;
}

const isPlanKey = (value: unknown): value is PlanKey =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
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
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid or missing email" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const session = await createCheckoutSession({
      planKey,
      customerEmail: email,
      successUrl: `${appUrl}/?checkout=success`,
      cancelUrl: `${appUrl}/?checkout=cancelled`,
    });
    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
