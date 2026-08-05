import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses service role key (bypasses RLS).
 *
 * ⚠️ SECURITY: This client MUST NEVER be imported in client-side code.
 * Only use in:
 * - Stripe webhook handlers
 * - Provisioning (post-payment)
 * - System jobs
 * - SuperAdmin operations
 *
 * Every function using this client MUST:
 * 1. Receive organizationId explicitly
 * 2. Validate the org exists
 * 3. Write to audit_log
 */

let adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase admin credentials not configured");
    }
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

/**
 * Execute a query as admin with explicit org validation.
 * Always logs to audit_log.
 */
export async function adminQuery<T>(
  organizationId: string,
  action: string,
  fn: (client: ReturnType<typeof createClient>) => Promise<T>,
): Promise<T> {
  const client = getAdminClient();

  // Validate org exists
  const { data: org, error } = await client
    .from("organizations")
    .select("id, status")
    .eq("id", organizationId)
    .single();

  if (error || !org) {
    throw new Error(`ORG_NOT_FOUND: ${organizationId}`);
  }

  // Execute the query
  const result = await fn(client);

  // Audit log
  await client.from("audit_log").insert({
    organization_id: organizationId,
    actor_type: "system",
    action,
    entity: "admin_query",
    entity_id: organizationId,
  });

  return result;
}
