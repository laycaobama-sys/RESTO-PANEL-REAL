// Stripe webhook endpoint — verifies and processes Stripe events.
// Body is read as raw text so the signature can be verified by the Stripe SDK.
import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/services/stripe";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  try {
    const result = await handleWebhook(body, signature);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook failed";
    console.error("[stripe/webhook] error:", msg);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
