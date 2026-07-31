// Unified AI provider layer — multi-provider with automatic fallback.
// Provider order: GLM (primary) → Qwen (fallback) → Google AI (fallback).
// Each provider is only attempted if its API key is present in process.env.

export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  tokensUsed: number;
  cost: number;
  sources?: string[];
}

interface ProviderDef {
  name: string;
  key: string | undefined;
  call: (req: AIRequest, apiKey: string) => Promise<AIResponse>;
}

/** A provider whose API key is present in process.env. */
type ConfiguredProvider = ProviderDef & { key: string };

/** Builds the ordered list of providers that have an API key configured. */
function resolveProviders(): ConfiguredProvider[] {
  const providers: ProviderDef[] = [
    { name: "glm", key: process.env.GLM_API_KEY, call: callGLM },
    { name: "qwen", key: process.env.QWEN_API_KEY, call: callQwen },
    { name: "google", key: process.env.GOOGLE_AI_API_KEY, call: callGoogleAI },
  ];
  return providers.filter((p): p is ConfiguredProvider => Boolean(p.key));
}

/** Calls the first available provider; falls back on error. Throws if all fail. */
export async function callAI(req: AIRequest): Promise<AIResponse> {
  const providers = resolveProviders();
  if (providers.length === 0) {
    throw new Error("No AI providers configured (set GLM_API_KEY, QWEN_API_KEY or GOOGLE_AI_API_KEY)");
  }

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await provider.call(req, provider.key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${msg}`);
      console.error(`[ai-provider] Provider ${provider.name} failed:`, msg);
      // Try next provider.
    }
  }
  throw new Error(`All AI providers failed — ${errors.join(" | ")}`);
}

// ---------------------------------------------------------------------------
// Provider: GLM (via z-ai-web-dev-sdk)
// ---------------------------------------------------------------------------

interface ZAIChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
}

interface ZAISDK {
  chat: {
    completions: {
      create: (body: {
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
        max_tokens?: number;
        temperature?: number;
        thinking?: { type: "enabled" | "disabled" };
      }) => Promise<ZAIChatCompletionResponse>;
    };
  };
}

interface ZAIModule {
  default: { create: (config?: unknown) => Promise<ZAISDK> };
}

/** Calls GLM via the z-ai-web-dev-sdk (reads no env key — SDK uses .z-ai-config). */
async function callGLM(req: AIRequest, _apiKey: string): Promise<AIResponse> {
  // The z-ai-web-dev-sdk uses its own .z-ai-config file; we still accept the env
  // GLM_API_KEY for telemetry/audit purposes (hence the underscore-prefixed param).
  const mod = (await import("z-ai-web-dev-sdk")) as unknown as ZAIModule;
  const zai = await mod.default.create();

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (req.context) {
    messages.push({ role: "system", content: req.context });
  }
  messages.push({ role: "user", content: req.prompt });

  const response = await zai.chat.completions.create({
    messages,
    max_tokens: req.maxTokens ?? 1000,
    temperature: req.temperature ?? 0.7,
    thinking: { type: "disabled" },
  });

  const content = response.choices?.[0]?.message?.content ?? "";
  const tokensUsed = response.usage?.total_tokens ?? 0;
  return {
    content,
    provider: "glm",
    tokensUsed,
    cost: 0,
  };
}

// ---------------------------------------------------------------------------
// Provider: Qwen (Aliyun DashScope)
// ---------------------------------------------------------------------------

interface QwenResponse {
  output?: { text?: string; finish_reason?: string };
  usage?: { total_tokens?: number; input_tokens?: number; output_tokens?: number };
  request_id?: string;
  code?: string;
  message?: string;
}

async function callQwen(req: AIRequest, apiKey: string): Promise<AIResponse> {
  const body = {
    model: "qwen-turbo",
    input: {
      messages: [
        ...(req.context
          ? [{ role: "system", content: req.context }]
          : []),
        { role: "user", content: req.prompt },
      ],
    },
    parameters: {
      max_tokens: req.maxTokens ?? 1000,
      temperature: req.temperature ?? 0.7,
    },
  };

  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigeneration/text-generation/generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen HTTP ${response.status}: ${text}`);
  }
  const data = (await response.json()) as QwenResponse;
  if (data.code) {
    throw new Error(`Qwen error ${data.code}: ${data.message ?? "unknown"}`);
  }

  return {
    content: data.output?.text ?? "",
    provider: "qwen",
    tokensUsed: data.usage?.total_tokens ?? 0,
    cost: 0,
  };
}

// ---------------------------------------------------------------------------
// Provider: Google AI (Gemini)
// ---------------------------------------------------------------------------

interface GoogleAIResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: { totalTokenCount?: number; promptTokenCount?: number; candidatesTokenCount?: number };
  error?: { code?: number; message?: string; status?: string };
}

async function callGoogleAI(req: AIRequest, apiKey: string): Promise<AIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const fullPrompt = req.context ? `${req.context}\n\n${req.prompt}` : req.prompt;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: req.maxTokens ?? 1000,
        temperature: req.temperature ?? 0.7,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google AI HTTP ${response.status}: ${text}`);
  }
  const data = (await response.json()) as GoogleAIResponse;
  if (data.error) {
    throw new Error(`Google AI error ${data.error.code ?? "?"}: ${data.error.message ?? "unknown"}`);
  }

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    provider: "google",
    tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
    cost: 0,
  };
}
