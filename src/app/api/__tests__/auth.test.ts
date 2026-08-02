// ============================================================================
// Integration tests for /api/auth/register and /api/auth/login
// ----------------------------------------------------------------------------
// Mocks:
//   * @/lib/db           — Prisma client (no real DB touched)
//   * @/lib/auth         — hashPassword / signToken / setSessionCookie
//   * @/lib/rate-limit   — reset between tests so each case starts clean
//
// Real:
//   * next/headers cookies() — mocked globally in vitest.setup.ts
// ============================================================================

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetRateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Mock wiring
// ---------------------------------------------------------------------------

const dbMocks = {
  member: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  organization: {
    create: vi.fn(),
  },
  role: {
    create: vi.fn(),
  },
  memberRole: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({ db: dbMocks }));

const authMocks = {
  hashPassword: vi.fn().mockResolvedValue("hashed-pw"),
  verifyPassword: vi.fn(),
  signToken: vi.fn().mockReturnValue("mock-jwt-token"),
  setSessionCookie: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/lib/auth", () => ({
  hashPassword: authMocks.hashPassword,
  verifyPassword: authMocks.verifyPassword,
  signToken: authMocks.signToken,
  setSessionCookie: authMocks.setSessionCookie,
}));

// Route handlers are imported AFTER the mocks above so the module graph
// resolves them through vi.mock's factory.
const { POST: registerPOST } = await import("@/app/api/auth/register/route");
const { POST: loginPOST } = await import("@/app/api/auth/login/route");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function callRegister(body: unknown, headers: Record<string, string> = {}) {
  const res = await registerPOST(makeRequest("/api/auth/register", body, headers));
  return { status: res.status, body: await res.json() };
}

async function callLogin(body: unknown, headers: Record<string, string> = {}) {
  const res = await loginPOST(makeRequest("/api/auth/login", body, headers));
  return { status: res.status, body: await res.json() };
}

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimit();
  // Re-set the default mock implementations that clearAllMocks wiped.
  authMocks.hashPassword.mockResolvedValue("hashed-pw");
  authMocks.signToken.mockReturnValue("mock-jwt-token");
  authMocks.setSessionCookie.mockResolvedValue(undefined);
});

// ===========================================================================
// /api/auth/register
// ===========================================================================

describe("POST /api/auth/register", () => {
  it("201 — happy path: creates org + member + owner role, returns JWT", async () => {
    dbMocks.member.findFirst.mockResolvedValue(null);
    dbMocks.organization.create.mockResolvedValue({
      id: "org-1",
      slug: "acme-restaurant",
      name: "Acme Restaurant",
    });
    dbMocks.member.create.mockResolvedValue({
      id: "member-1",
      email: "owner@acme.com",
      name: "Owner",
    });
    dbMocks.role.create.mockResolvedValue({ id: "role-1" });
    dbMocks.memberRole.create.mockResolvedValue({ id: "mr-1" });

    const { status, body } = await callRegister({
      email: "owner@acme.com",
      password: "password123",
      orgName: "Acme Restaurant",
      name: "Owner",
    });

    expect(status).toBe(201);
    expect(body.token).toBe("mock-jwt-token");
    expect(body.member).toEqual({
      id: "member-1",
      email: "owner@acme.com",
      name: "Owner",
    });
    expect(body.organization.id).toBe("org-1");

    // Side-effect assertions
    expect(authMocks.hashPassword).toHaveBeenCalledWith("password123");
    expect(authMocks.signToken).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "member-1",
        org: "org-1",
        email: "owner@acme.com",
        role: "owner",
      }),
    );
    expect(authMocks.setSessionCookie).toHaveBeenCalledWith("mock-jwt-token");
    expect(dbMocks.member.findFirst).toHaveBeenCalledTimes(1);
    expect(dbMocks.organization.create).toHaveBeenCalledTimes(1);
    expect(dbMocks.member.create).toHaveBeenCalledTimes(1);
    expect(dbMocks.role.create).toHaveBeenCalledTimes(1);
    expect(dbMocks.memberRole.create).toHaveBeenCalledTimes(1);
  });

  it("409 — duplicate email returns email_in_use", async () => {
    dbMocks.member.findFirst.mockResolvedValue({ id: "existing-member" });

    const { status, body } = await callRegister({
      email: "taken@acme.com",
      password: "password123",
    });

    expect(status).toBe(409);
    expect(body.error).toBe("email_in_use");
    expect(dbMocks.organization.create).not.toHaveBeenCalled();
    expect(dbMocks.member.create).not.toHaveBeenCalled();
  });

  it("400 — invalid email is rejected before any DB call", async () => {
    const { status, body } = await callRegister({
      email: "not-an-email",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body.error).toBe("invalid_email");
    expect(dbMocks.member.findFirst).not.toHaveBeenCalled();
  });

  it("400 — weak password (<6 chars) is rejected", async () => {
    const { status, body } = await callRegister({
      email: "ok@acme.com",
      password: "abc",
    });
    expect(status).toBe(400);
    expect(body.error).toBe("weak_password");
  });

  it("400 — invalid JSON body returns invalid_json", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: "{not valid json",
    });
    const res = await registerPOST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe("invalid_json");
  });
});

// ===========================================================================
// /api/auth/login
// ===========================================================================

describe("POST /api/auth/login", () => {
  const memberFixture = {
    id: "member-1",
    email: "owner@acme.com",
    name: "Owner",
    hashedPassword: "hashed-pw",
    status: "active",
    organizationId: "org-1",
    memberRoles: [{ role: { key: "owner" } }],
  };

  it("200 — happy path with correct password returns JWT", async () => {
    dbMocks.member.findFirst.mockResolvedValue(memberFixture);
    authMocks.verifyPassword.mockResolvedValue(true);

    const { status, body } = await callLogin({
      email: "owner@acme.com",
      password: "password123",
    });

    expect(status).toBe(200);
    expect(body.token).toBe("mock-jwt-token");
    expect(body.member).toEqual({
      id: "member-1",
      email: "owner@acme.com",
      name: "Owner",
    });
    expect(authMocks.verifyPassword).toHaveBeenCalledWith("password123", "hashed-pw");
    expect(authMocks.signToken).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "member-1",
        org: "org-1",
        email: "owner@acme.com",
        role: "owner",
      }),
    );
  });

  it("401 — wrong password returns invalid_credentials (no token issued)", async () => {
    dbMocks.member.findFirst.mockResolvedValue(memberFixture);
    authMocks.verifyPassword.mockResolvedValue(false);

    const { status, body } = await callLogin({
      email: "owner@acme.com",
      password: "wrong-password",
    });

    expect(status).toBe(401);
    expect(body.error).toBe("invalid_credentials");
    expect(authMocks.signToken).not.toHaveBeenCalled();
    expect(authMocks.setSessionCookie).not.toHaveBeenCalled();
  });

  it("401 — unknown user returns the same invalid_credentials (no enumeration)", async () => {
    dbMocks.member.findFirst.mockResolvedValue(null);

    const { status, body } = await callLogin({
      email: "ghost@acme.com",
      password: "password123",
    });

    expect(status).toBe(401);
    expect(body.error).toBe("invalid_credentials");
    // Verify the real bcrypt path is never hit when the user is unknown.
    expect(authMocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("403 — disabled account returns account_disabled", async () => {
    dbMocks.member.findFirst.mockResolvedValue({ ...memberFixture, status: "disabled" });
    authMocks.verifyPassword.mockResolvedValue(true);

    const { status, body } = await callLogin({
      email: "owner@acme.com",
      password: "password123",
    });

    expect(status).toBe(403);
    expect(body.error).toBe("account_disabled");
    expect(authMocks.signToken).not.toHaveBeenCalled();
  });

  it("400 — invalid email is rejected before any DB call", async () => {
    const { status, body } = await callLogin({
      email: "bad",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body.error).toBe("invalid_email");
    expect(dbMocks.member.findFirst).not.toHaveBeenCalled();
  });

  it("400 — weak password is rejected before any DB call", async () => {
    const { status, body } = await callLogin({
      email: "ok@acme.com",
      password: "abc",
    });
    expect(status).toBe(400);
    expect(body.error).toBe("weak_password");
    expect(dbMocks.member.findFirst).not.toHaveBeenCalled();
  });

  it("picks the highest-priority role key for the JWT (owner > manager)", async () => {
    dbMocks.member.findFirst.mockResolvedValue({
      ...memberFixture,
      memberRoles: [
        { role: { key: "cashier" } },
        { role: { key: "manager" } },
      ],
    });
    authMocks.verifyPassword.mockResolvedValue(true);

    await callLogin({
      email: "owner@acme.com",
      password: "password123",
    });

    expect(authMocks.signToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: "manager" }),
    );
  });
});

// ===========================================================================
// Rate limiting
// ===========================================================================

describe("rate limiting", () => {
  it("blocks the 6th register attempt from the same IP with 429", async () => {
    dbMocks.member.findFirst.mockResolvedValue(null);
    dbMocks.organization.create.mockResolvedValue({ id: "o", slug: "s", name: "n" });
    dbMocks.member.create.mockResolvedValue({ id: "m", email: "e", name: null });
    dbMocks.role.create.mockResolvedValue({ id: "r" });
    dbMocks.memberRole.create.mockResolvedValue({ id: "mr" });

    const results: { status: number; error?: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await callRegister(
        { email: `user${i}@x.com`, password: "password123" },
        { "x-forwarded-for": "203.0.113.9" },
      );
      results.push({ status: r.status, error: r.body.error });
    }

    const ok = results.filter((r) => r.status === 201);
    const limited = results.filter((r) => r.status === 429);
    expect(ok.length).toBe(5);
    expect(limited.length).toBe(1);
    expect(limited[0].error).toBe("rate_limited");
  });

  it("blocks the 6th login attempt for the same (ip, email) with 429", async () => {
    dbMocks.member.findFirst.mockResolvedValue(null);
    authMocks.verifyPassword.mockResolvedValue(false);

    const results: { status: number; error?: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await callLogin(
        { email: "victim@x.com", password: "wrong-pw-1" },
        { "x-forwarded-for": "198.51.100.7" },
      );
      results.push({ status: r.status, error: r.body.error });
    }

    const unauthorized = results.filter((r) => r.status === 401);
    const limited = results.filter((r) => r.status === 429);
    expect(unauthorized.length).toBe(5);
    expect(limited.length).toBe(1);
    expect(limited[0].error).toBe("rate_limited");
  });

  it("isolates rate-limit buckets per IP", async () => {
    dbMocks.member.findFirst.mockResolvedValue(null);

    // Exhaust the limit for IP-A.
    for (let i = 0; i < 5; i++) {
      await callRegister(
        { email: `a${i}@x.com`, password: "password123" },
        { "x-forwarded-for": "10.0.0.1" },
      );
    }
    // 6th attempt from IP-A → blocked.
    const blocked = await callRegister(
      { email: "a-blocked@x.com", password: "password123" },
      { "x-forwarded-for": "10.0.0.1" },
    );
    expect(blocked.status).toBe(429);

    // First attempt from IP-B → still allowed.
    const fresh = await callRegister(
      { email: "b@x.com", password: "password123" },
      { "x-forwarded-for": "10.0.0.2" },
    );
    expect([201, 409]).toContain(fresh.status);
  });
});
