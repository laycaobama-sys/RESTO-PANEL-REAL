// ============================================================================
// Unit tests for src/lib/auth.ts
// ----------------------------------------------------------------------------
// Covers:
//   * hashPassword produces different hashes for the same input (salting).
//   * verifyPassword returns true for the right password, false otherwise.
//   * signToken produces a JWT that round-trips through verifyToken.
//   * verifyToken returns null for malformed/expired/tampered tokens.
// ============================================================================

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from "@/lib/auth";

const PLAIN = "super-secret-pw-123";

describe("hashPassword", () => {
  it("returns a bcrypt hash with the expected prefix", async () => {
    const hash = await hashPassword(PLAIN);
    expect(hash).toMatch(/^\$2[abxy]\$\d{2}\$.+/);
  });

  it("produces a different hash on every call (salt is random)", async () => {
    const a = await hashPassword(PLAIN);
    const b = await hashPassword(PLAIN);
    expect(a).not.toEqual(b);
    // But both should still verify against the same plain text.
    expect(await verifyPassword(PLAIN, a)).toBe(true);
    expect(await verifyPassword(PLAIN, b)).toBe(true);
  });

  it("rejects passwords shorter than 6 characters", async () => {
    await expect(hashPassword("abc")).rejects.toThrow(/at least 6 characters/);
    await expect(hashPassword("")).rejects.toThrow();
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const hash = await hashPassword(PLAIN);
    expect(await verifyPassword(PLAIN, hash)).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const hash = await hashPassword(PLAIN);
    expect(await verifyPassword("totally-wrong", hash)).toBe(false);
  });

  it("returns false when either argument is empty", async () => {
    expect(await verifyPassword("", "fakehash")).toBe(false);
    expect(await verifyPassword(PLAIN, "")).toBe(false);
    expect(await verifyPassword("", "")).toBe(false);
  });

  it("returns false for a malformed hash (does not throw)", async () => {
    expect(await verifyPassword(PLAIN, "not-a-real-bcrypt-hash")).toBe(false);
  });
});

describe("signToken / verifyToken round-trip", () => {
  const payload = { sub: "member-1", org: "org-1", email: "a@b.com" };

  it("signToken returns a non-empty string with three JWT parts", () => {
    const token = signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyToken returns the decoded payload for a fresh token", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("member-1");
    expect(decoded?.org).toBe("org-1");
    expect(decoded?.email).toBe("a@b.com");
    expect(decoded?.iat).toBeTypeOf("number");
    expect(decoded?.exp).toBeTypeOf("number");
    expect((decoded?.exp ?? 0) - (decoded?.iat ?? 0)).toBeGreaterThan(0);
  });

  it("tokens issued for different payloads differ from each other", () => {
    const t1 = signToken({ sub: "a", org: "o", email: "a@b.com" });
    const t2 = signToken({ sub: "b", org: "o", email: "b@b.com" });
    expect(t1).not.toEqual(t2);
  });
});

describe("verifyToken rejects bad input", () => {
  it("returns null for an empty string", () => {
    expect(verifyToken("")).toBeNull();
  });

  it("returns null for a malformed string", () => {
    expect(verifyToken("not-a-jwt")).toBeNull();
  });

  it("returns null for a token signed with a different secret", () => {
    const token = jwt.sign(
      { sub: "x", org: "y", email: "z@z.com" },
      "a-different-secret-entirely",
      { algorithm: "HS256", expiresIn: "1h" },
    );
    expect(verifyToken(token)).toBeNull();
  });

  it("returns null when payload is missing required claims", () => {
    // Missing `org` and `email` — should be rejected by our verifier.
    const token = jwt.sign({ sub: "x" }, process.env.JWT_SECRET ?? "dev-insecure-secret-change-me", {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    expect(verifyToken(token)).toBeNull();
  });

  it("returns null for an expired token", () => {
    const token = jwt.sign(
      { sub: "x", org: "y", email: "z@z.com" },
      process.env.JWT_SECRET ?? "dev-insecure-secret-change-me",
      { algorithm: "HS256", expiresIn: "-1s" }, // already expired
    );
    expect(verifyToken(token)).toBeNull();
  });
});

// ----------------------------------------------------------------------------
// Environment / hygiene
// ----------------------------------------------------------------------------

describe("JWT secret handling", () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    if (originalSecret !== undefined) process.env.JWT_SECRET = originalSecret;
    else delete process.env.JWT_SECRET;
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
  });

  it("uses a dev fallback secret when JWT_SECRET is unset (non-prod)", () => {
    process.env.NODE_ENV = "test";
    const token = signToken({ sub: "s", org: "o", email: "e@e.com" });
    expect(verifyToken(token)).not.toBeNull();
  });

  it("throws in production when JWT_SECRET is unset", () => {
    process.env.NODE_ENV = "production";
    expect(() =>
      signToken({ sub: "s", org: "o", email: "e@e.com" }),
    ).toThrow(/JWT_SECRET/);
  });

  it("throws when JWT_SECRET is too short", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "short";
    expect(() =>
      signToken({ sub: "s", org: "o", email: "e@e.com" }),
    ).toThrow(/16 characters/);
  });
});
