// AI chat endpoint — proxies a prompt through the unified AI provider layer.
import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/services/ai-provider";

interface ChatRequestBody {
  prompt?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
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

  try {
    const response = await callAI({
      prompt,
      context,
      maxTokens,
      temperature,
    });
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI call failed";
    console.error("[ai/chat] error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
