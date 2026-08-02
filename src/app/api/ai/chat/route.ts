// ============================================================================
// /api/ai/chat — AI chat endpoint (VULN-02 fix)
// ----------------------------------------------------------------------------
// Proxies a prompt through the unified AI provider layer. Every request must
// be authenticated (`requireAuth`) AND the caller's organization must have the
// `ai_copilot` entitlement enabled (VULN-02 plan-gating fix).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/services/ai-provider";
import { requireAuth } from "@/lib/rbac";
import { hasFeature } from "@/lib/entitlements";

interface ChatRequestBody {
  prompt?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    // --- Auth + entitlement -------------------------------------------------
    const user = await requireAuth();
    const aiEnabled = await hasFeature(user.orgId, "ai_copilot");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI_ENTITLEMENT_REQUIRED" },
        { status: 403 },
      );
    }

    // --- Body parse + validation -------------------------------------------
    let payload: ChatRequestBody;
    try {
      payload = (await req.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { prompt, context, maxTokens, temperature } = payload;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Missing or empty prompt" }, { status: 400 });
    }
    if (context !== undefined && typeof context !== "string") {
      return NextResponse.json({ error: "context must be a string" }, { status: 400 });
    }
    if (maxTokens !== undefined && (typeof maxTokens !== "number" || maxTokens <= 0)) {
      return NextResponse.json({ error: "maxTokens must be a positive number" }, { status: 400 });
    }
    if (
      temperature !== undefined &&
      (typeof temperature !== "number" || temperature < 0 || temperature > 2)
    ) {
      return NextResponse.json({ error: "temperature must be between 0 and 2" }, { status: 400 });
    }

    // --- AI call -----------------------------------------------------------
    const response = await callAI({
      prompt,
      context,
      maxTokens,
      temperature,
    });
    return NextResponse.json(response);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI call failed";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("[ai/chat] error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
