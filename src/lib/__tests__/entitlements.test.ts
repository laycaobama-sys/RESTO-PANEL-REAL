// ============================================================================
// Unit tests for src/lib/entitlements.ts
// ----------------------------------------------------------------------------
// Covers:
//   * can() returns true for owners, true for explicit permission, false
//     when no role grants the permission.
//   * can() respects venueId scoping.
//   * limit() returns the override numeric value when present.
//   * limit() falls back to the plan value when no override.
//   * limit() returns null for unlimited / unknown features.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from "vitest";

// --- Mock @/lib/db BEFORE importing the SUT -------------------------------
// The mock exposes a mutable `db` object so each test can reprogram the
// resolved values without re-importing the module.

const mocks = {
  memberRole: {
    findMany: vi.fn(),
  },
  entitlementOverride: {
    findFirst: vi.fn(),
  },
  planFeature: {
    findFirst: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  db: mocks,
}));

const { can, limit, hasFeature } = await import("@/lib/entitlements");

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// can()
// ---------------------------------------------------------------------------

describe("can()", () => {
  const member = { sub: "member-1", org: "org-1" };

  it("returns true when the member has the owner role (bypass)", async () => {
    mocks.memberRole.findMany.mockResolvedValue([
      {
        role: {
          key: "owner",
          rolePermissions: [],
        },
      },
    ]);
    expect(await can(member, "billing.write")).toBe(true);
  });

  it("returns true when at least one role grants the permission", async () => {
    mocks.memberRole.findMany.mockResolvedValue([
      {
        role: {
          key: "manager",
          rolePermissions: [
            { permission: { key: "reservations.write" } },
            { permission: { key: "billing.read" } },
          ],
        },
      },
    ]);
    expect(await can(member, "reservations.write")).toBe(true);
    expect(await can(member, "billing.read")).toBe(true);
  });

  it("returns false when no role grants the requested permission", async () => {
    mocks.memberRole.findMany.mockResolvedValue([
      {
        role: {
          key: "floor",
          rolePermissions: [{ permission: { key: "reservations.write" } }],
        },
      },
    ]);
    expect(await can(member, "billing.write")).toBe(false);
  });

  it("returns false when the member has no roles at all", async () => {
    mocks.memberRole.findMany.mockResolvedValue([]);
    expect(await can(member, "reservations.read")).toBe(false);
  });

  it("returns false when member is missing sub/org", async () => {
    expect(await can({ sub: "", org: "org-1" }, "x.read")).toBe(false);
    expect(await can({ sub: "m", org: "" }, "x.read")).toBe(false);
    expect(await can({} as never, "x.read")).toBe(false);
  });

  it("returns false when permission is empty", async () => {
    expect(await can(member, "")).toBe(false);
  });

  it("passes venueId filter into the prisma where clause", async () => {
    mocks.memberRole.findMany.mockResolvedValue([]);
    await can(member, "tickets.refund", { venueId: "venue-9" });
    const arg = mocks.memberRole.findMany.mock.calls[0]?.[0];
    expect(arg).toBeDefined();
    expect(arg.where).toMatchObject({
      memberId: "member-1",
      OR: [{ venueId: "venue-9" }, { venueId: null }],
    });
  });

  it("omits the venue OR clause when no venueId is provided", async () => {
    mocks.memberRole.findMany.mockResolvedValue([]);
    await can(member, "tickets.refund");
    const arg = mocks.memberRole.findMany.mock.calls[0]?.[0];
    expect(arg.where).not.toHaveProperty("OR");
    expect(arg.where).toMatchObject({
      memberId: "member-1",
      role: { organizationId: "org-1" },
    });
  });
});

// ---------------------------------------------------------------------------
// limit()
// ---------------------------------------------------------------------------

describe("limit()", () => {
  it("returns the override valueNum when an active override exists", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue({
      valueNum: 42,
      valueBool: null,
    });
    expect(await limit("org-1", "max_venues")).toBe(42);
  });

  it("returns 0 when override valueBool === false (feature disabled)", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue({
      valueNum: null,
      valueBool: false,
    });
    expect(await limit("org-1", "ai_tokens_per_month")).toBe(0);
  });

  it("returns null when override valueBool === true (unlimited)", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue({
      valueNum: null,
      valueBool: true,
    });
    expect(await limit("org-1", "ai_copilot")).toBeNull();
  });

  it("falls back to planFeature when no override exists", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue(null);
    mocks.planFeature.findFirst.mockResolvedValue({
      valueNum: 3,
      valueBool: null,
    });
    expect(await limit("org-1", "max_venues")).toBe(3);
  });

  it("falls back to 0 when plan valueBool === false", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue(null);
    mocks.planFeature.findFirst.mockResolvedValue({
      valueNum: null,
      valueBool: false,
    });
    expect(await limit("org-1", "kds_advanced")).toBe(0);
  });

  it("returns null when no override and no plan feature (unknown feature)", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue(null);
    mocks.planFeature.findFirst.mockResolvedValue(null);
    expect(await limit("org-1", "unknown_feature")).toBeNull();
  });

  it("returns null when called with empty args", async () => {
    expect(await limit("", "max_venues")).toBeNull();
    expect(await limit("org-1", "")).toBeNull();
    expect(mocks.entitlementOverride.findFirst).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// hasFeature()
// ---------------------------------------------------------------------------

describe("hasFeature()", () => {
  it("returns true when override valueBool === true", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue({
      valueBool: true,
      valueNum: null,
    });
    expect(await hasFeature("org-1", "ai_copilot")).toBe(true);
  });

  it("returns true when plan valueNum > 0", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue(null);
    mocks.planFeature.findFirst.mockResolvedValue({
      valueBool: null,
      valueNum: 5,
    });
    expect(await hasFeature("org-1", "kds_stations")).toBe(true);
  });

  it("returns false when override valueBool === false", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue({
      valueBool: false,
      valueNum: null,
    });
    expect(await hasFeature("org-1", "ai_copilot")).toBe(false);
  });

  it("returns false when nothing is configured", async () => {
    mocks.entitlementOverride.findFirst.mockResolvedValue(null);
    mocks.planFeature.findFirst.mockResolvedValue(null);
    expect(await hasFeature("org-1", "ai_copilot")).toBe(false);
  });
});
