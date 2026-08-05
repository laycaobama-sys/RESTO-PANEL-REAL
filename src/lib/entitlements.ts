// ============================================================================
// RestoPanel · Entitlements & RBAC engine
// ----------------------------------------------------------------------------
// Two responsibilities:
//   1. RBAC:  can(member, permission, ctx?)  -> Promise<boolean>
//   2. Plan:  limit(org, featureKey)         -> Promise<number | null>
//
// Resolution order for `can`:
//   a. Member is owner → always true.
//   b. Member has any role whose RolePermission.key === permission → true.
//   c. Otherwise false.
//
// Resolution order for `limit`:
//   a. EntitlementOverride for org+feature (not expired) → numeric value.
//   b. PlanFeature on the org's current plan → numeric value.
//   c. null = unlimited (or unknown).
//
// All DB access goes through `@/lib/db` so unit tests can mock the prisma
// client without touching this module's internals.
// ============================================================================

import { db } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";

export interface PermissionContext {
  venueId?: string;
}

const OWNER_ROLE_KEY = "owner";

// ----------------------------------------------------------------------------
// RBAC: can()
// ----------------------------------------------------------------------------

/**
 * Returns true iff `member` is allowed to perform the action identified by
 * `permission` (e.g. "reservations.write", "billing.read").
 *
 * Resolution is purely additive — deny by default. The owner role bypasses
 * the permission catalog entirely.
 */
export async function can(
  member: Pick<AuthTokenPayload, "sub" | "org">,
  permission: string,
  ctx: PermissionContext = {},
): Promise<boolean> {
  if (!member?.sub || !member?.org) return false;
  if (typeof permission !== "string" || permission.length === 0) return false;

  // 1. Find all roles currently assigned to this member (optionally scoped to
  //    the requested venue, or org-wide when venueId is null).
  const memberRoles = await db.memberRole.findMany({
    where: {
      memberId: member.sub,
      ...(ctx.venueId
        ? { OR: [{ venueId: ctx.venueId }, { venueId: null }] }
        : {}),
      role: { organizationId: member.org },
    },
    select: {
      role: {
        select: { key: true, rolePermissions: { select: { permission: { select: { key: true } } } } },
      },
    },
  });

  if (memberRoles.length === 0) return false;

  // 2. Owner bypass.
  if (memberRoles.some((mr) => mr.role.key === OWNER_ROLE_KEY)) {
    return true;
  }

  // 3. Permission lookup across all roles.
  for (const mr of memberRoles) {
    for (const rp of mr.role.rolePermissions) {
      if (rp.permission.key === permission) return true;
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// Plan entitlements: limit()
// ----------------------------------------------------------------------------

/**
 * Resolves the numeric limit for a plan-gated feature (e.g. "max_venues",
 * "ai_tokens_per_month", "kds_stations").
 *
 * Returns:
 *   - `number` (>0) when a finite limit applies.
 *   - `null` when the feature is unlimited or unknown (no override + no plan row).
 *
 * Note: `null` is intentionally ambiguous between "unlimited" and "not configured".
 * Callers that need to distinguish should call `hasFeature()` separately (TODO).
 */
export async function limit(
  orgId: string,
  featureKey: string,
): Promise<number | null> {
  if (!orgId || !featureKey) return null;

  // 1. Active EntitlementOverride wins.
  const override = await db.entitlementOverride.findFirst({
    where: {
      organizationId: orgId,
      feature: { key: featureKey },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { valueNum: true, valueBool: true },
  });
  if (override) {
    if (typeof override.valueNum === "number") return override.valueNum;
    if (override.valueBool === false) return 0;
    // boolean true → unlimited
    return null;
  }

  // 2. Fall back to the PlanFeature on the org's current subscription.
  const planFeature = await db.planFeature.findFirst({
    where: {
      feature: { key: featureKey },
      plan: { subscriptions: { some: { organizationId: orgId } } },
    },
    select: { valueNum: true, valueBool: true },
  });
  if (planFeature) {
    if (typeof planFeature.valueNum === "number") return planFeature.valueNum;
    if (planFeature.valueBool === false) return 0;
    return null;
  }

  // 3. Unknown feature → unlimited (fail open).
  return null;
}

/**
 * Boolean feature gate (e.g. "ai_copilot", "kds_advanced"). Resolves through
 * the same override → plan cascade as `limit()`.
 */
export async function hasFeature(
  orgId: string,
  featureKey: string,
): Promise<boolean> {
  if (!orgId || !featureKey) return false;
  const override = await db.entitlementOverride.findFirst({
    where: {
      organizationId: orgId,
      feature: { key: featureKey },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { valueBool: true, valueNum: true },
  });
  if (override) {
    if (typeof override.valueBool === "boolean") return override.valueBool;
    if (typeof override.valueNum === "number") return override.valueNum > 0;
  }

  const planFeature = await db.planFeature.findFirst({
    where: {
      feature: { key: featureKey },
      plan: { subscriptions: { some: { organizationId: orgId } } },
    },
    select: { valueBool: true, valueNum: true },
  });
  if (planFeature) {
    if (typeof planFeature.valueBool === "boolean") return planFeature.valueBool;
    if (typeof planFeature.valueNum === "number") return planFeature.valueNum > 0;
  }
  return false;
}
