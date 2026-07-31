// Cloudflare API helper for managing Workers, D1, KV and R2.
// Uses the REST API (https://api.cloudflare.com/client/v4) — no SDK dependency.
// All credentials are read from process.env; never hardcoded.

const CF_BASE = "https://api.cloudflare.com/client/v4";

/** Common Cloudflare API response shape. */
interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T | null;
}

/** Returns the auth headers for Cloudflare API calls. */
function authHeaders(): HeadersInit {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Returns the configured Cloudflare account id from env. */
function requireAccountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) throw new Error("CLOUDFLARE_ACCOUNT_ID not configured");
  return id;
}

/** Generic JSON request helper with error handling. */
async function cfRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<CloudflareResponse<T>> {
  const response = await fetch(`${CF_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  });
  const data = (await response.json()) as CloudflareResponse<T>;
  if (!response.ok || !data.success) {
    const first = data.errors?.[0];
    const msg = first ? `${first.code}: ${first.message}` : `HTTP ${response.status}`;
    throw new Error(`Cloudflare API error at ${path} — ${msg}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// D1 — managed SQLite databases
// ---------------------------------------------------------------------------

export interface D1DatabaseInfo {
  uuid: string;
  name: string;
  created_at: string;
}

/** Creates a new D1 database. Idempotent: returns existing database if name matches. */
export async function createD1Database(name: string): Promise<D1DatabaseInfo> {
  const accountId = requireAccountId();
  const data = await cfRequest<D1DatabaseInfo>(
    `/accounts/${accountId}/d1/database`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
  );
  // The API returns the created database (or an error handled by cfRequest).
  if (!data.result) {
    throw new Error(`createD1Database: empty result for "${name}"`);
  }
  return data.result;
}

// ---------------------------------------------------------------------------
// KV — Workers KV namespaces
// ---------------------------------------------------------------------------

export interface KVNamespaceInfo {
  id: string;
  title: string;
}

/** Creates a Workers KV namespace. */
export async function createKVNamespace(
  title: string,
): Promise<KVNamespaceInfo> {
  const accountId = requireAccountId();
  const data = await cfRequest<KVNamespaceInfo>(
    `/accounts/${accountId}/storage/kv/namespaces`,
    {
      method: "POST",
      body: JSON.stringify({ title }),
    },
  );
  if (!data.result) {
    throw new Error(`createKVNamespace: empty result for "${title}"`);
  }
  return data.result;
}

// ---------------------------------------------------------------------------
// R2 — object storage buckets
// ---------------------------------------------------------------------------

export interface R2BucketInfo {
  name: string;
  creation_date: string;
}

/** Creates an R2 bucket. */
export async function createR2Bucket(name: string): Promise<R2BucketInfo> {
  const accountId = requireAccountId();
  const data = await cfRequest<R2BucketInfo>(
    `/accounts/${accountId}/r2/buckets`,
    {
      method: "POST",
      body: JSON.stringify({ name, locationHint: "eu-central-1" }),
    },
  );
  if (!data.result) {
    throw new Error(`createR2Bucket: empty result for "${name}"`);
  }
  return data.result;
}

// ---------------------------------------------------------------------------
// Workers — serverless functions
// ---------------------------------------------------------------------------

export interface WorkerDeployResult {
  id: string;
  modified_on: string;
}

/** Deployable worker definition. */
export interface DeployWorkerParams {
  name: string;
  script: string;
  compatibilityDate?: string;
  bindings?: Array<
    | { type: "kv_namespace"; name: string; namespace_id: string }
    | { type: "d1"; name: string; id: string }
    | { type: "r2_bucket"; name: string; bucket_name: string }
    | { type: "var"; name: string; text: string }
  >;
}

/**
 * Deploys a Worker via the Wrangler-style PUT /scripts/{name} endpoint.
 * Uses multipart form-data when bindings are present; plain JS module otherwise.
 */
export async function deployWorker(
  name: string,
  script: string,
): Promise<WorkerDeployResult> {
  const accountId = requireAccountId();
  // Simple deployment: single ES module worker script as application/javascript+module.
  const body = JSON.stringify({
    main_module: "worker.mjs",
    compatibility_date: new Date().toISOString().slice(0, 10),
  });
  const formData = new FormData();
  formData.set("metadata", body);
  formData.set(
    "worker.mjs",
    new Blob([script], { type: "application/javascript+module" }),
    "worker.mjs",
  );

  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN not configured");
  const response = await fetch(
    `${CF_BASE}/accounts/${accountId}/workers/scripts/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );
  const data = (await response.json()) as CloudflareResponse<WorkerDeployResult>;
  if (!response.ok || !data.success) {
    const first = data.errors?.[0];
    const msg = first ? `${first.code}: ${first.message}` : `HTTP ${response.status}`;
    throw new Error(`Cloudflare deployWorker error — ${msg}`);
  }
  if (!data.result) {
    throw new Error(`deployWorker: empty result for "${name}"`);
  }
  return data.result;
}
