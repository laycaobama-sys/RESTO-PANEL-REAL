// ============================================================================
// RestoPanel — RBAC helpers (VULN-02 + VULN-04 fix)
// ----------------------------------------------------------------------------
// Composable guards used by every data-plane API route:
//
//   requireAuth()                  → throws UNAUTHORIZED if no session
//   requireOrganization(user)      → throws FORBIDDEN if org missing/suspended
//   requireVenue(venueId, user)    → throws NOT_FOUND if venue is not in user's org
//   requirePermission(user, perm)  → throws FORBIDDEN if member lacks the perm
//   withAuth(handler)              → wraps a Next route with auth + error mapping
//
// All guards return the loaded entity so the caller can re-use the row without
// a second query.
// ============================================================================

import { getCurrentUser, type RestoPanelToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/** Throws `UNAUTHORIZED` if the caller is anonymous. Returns the JWT payload. */
export async function requireAuth(): Promise<RestoPanelToken> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/**
 * Loads the member's organization and refuses entry if it has been suspended
 * or deleted. Returns the live `Organization` row.
 */
export async function requireOrganization(user: { orgId: string }) {
  const org = await db.organization.findUnique({ where: { id: user.orgId } });
  if (!org || org.status === "suspended") throw new Error("FORBIDDEN");
  return org;
}

/**
 * Multi-tenant venue verification (VULN-04). Confirms the supplied venueId
 * belongs to the user's organization before any data-plane query runs.
 * Throws `NOT_FOUND` if the venue is missing or owned by another tenant.
 */
export async function requireVenue(
  venueId: string,
  user: { orgId: string },
) {
  const venue = await db.venue.findFirst({
    where: { id: venueId, brand: { organizationId: user.orgId } },
  });
  if (!venue) throw new Error("NOT_FOUND");
  return venue;
}

/**
 * Permission check. Walks the member → memberRoles → role → rolePermissions
 * → permission graph. Owners (the built-in `owner` role key on any
 * MemberRole) implicitly pass every check.
 */
export async function requirePermission(
  user: { sub: string; orgId: string },
  permission: string,
): Promise<boolean> {
  const member = await db.member.findFirst({
    where: { id: user.sub, organizationId: user.orgId },
    include: {
      memberRoles: {
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      },
    },
  });
  if (!member) throw new Error("FORBIDDEN");

  // Owner has every permission implicitly.
  const isOwner = member.memberRoles.some((mr) => mr.role.key === "owner");
  if (isOwner) return true;

  const hasPermission = member.memberRoles.some((mr) =>
    mr.role.rolePermissions.some((rp) => rp.permission.key === permission),
  );
  if (!hasPermission) throw new Error("FORBIDDEN");
  return true;
}

// ---------------------------------------------------------------------------
// Route wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a Next.js App Router handler with auth + a uniform error mapper.
 *
 * Usage:
 *   export const POST = withAuth(async (user, req) => { ... });
 *
 * The wrapped handler receives the verified user as its first argument and
 * the original request as the second. Errors thrown by `requireAuth()`,
 * `requireVenue()`, `requireOrganization()` or `requirePermission()` are
 * translated to the right HTTP status code.
 */
export function withAuth(
  handler: (user: RestoPanelToken, req: NextRequest) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      return await handler(user, req);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ error: msg }, { status });
    }
  };
}

/**
 * Combined guard used by every data-plane route. Resolves the venueId from
 * the request (`x-venue-id` header, query string or JSON body) and confirms
 * it belongs to the user's organization. Returns the verified user + venue.
 */
export async function requireAuthForVenue(
  req: NextRequest,
): Promise<{ user: RestoPanelToken; venueId: string }> {
  const user = await requireAuth();
  await requireOrganization(user);

  let venueId: string | null = null;
  venueId = req.headers.get("x-venue-id");
  if (!venueId) {
    const url = new URL(req.url);
    venueId = url.searchParams.get("venueId") ?? url.searchParams.get("venue");
  }
  if (!venueId && req.method !== "GET" && req.method !== "HEAD") {
    try {
      const body = (await req.json()) as { venueId?: string; venue?: string };
      venueId = body.venueId ?? body.venue ?? null;
    } catch {
      // Body wasn't JSON — caller will hit a 400 from their own parser.
    }
  }
  if (!venueId) throw new Error("VENUE_REQUIRED");

  await requireVenue(venueId, user);
  return { user, venueId };
}
