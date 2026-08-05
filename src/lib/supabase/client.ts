"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — uses anon key with RLS.
 * The user's JWT determines which organization_id they can access.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
