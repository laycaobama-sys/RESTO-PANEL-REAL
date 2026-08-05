// ============================================================================
// RestoPanel — Core auth primitives
// ----------------------------------------------------------------------------
// Provides:
//
//   Legacy API (kept for backward compat with /api/auth/{login,register},
//   src/lib/entitlements.ts and src/lib/__tests__/auth.test.ts):
//     - signToken({ sub, org, email, role })     → JWT string
//     - verifyToken(token)                       → AuthTokenPayload | null
//     - hashPassword(plain)                      → bcrypt hash (min 6 chars)
//     - verifyPassword(plain, hash)              → boolean
//     - setSessionCookie(token)                  → async, sets httpOnly cookie
//     - AuthTokenPayload                         → type { sub, org, email, role, ... }
//
//   New API (used by mini-services/realtime, src/lib/rbac.ts,
//   /api/admin/auth/login, the 6 RBAC-protected data-plane routes):
//     - signAccessToken({ sub, orgId, venueId, role }) → JWT string
//     - verifyAccessToken(token)                       → RestoPanelToken
//     - getCurrentUser(req?)                           → Promise<RestoPanelToken | null>
//     - buildAuthCookie(token, maxAge)                 → Set-Cookie string
//     - buildClearAuthCookie()                         → Set-Cookie string
//     - RestoPanelToken                                → type
//
// The JWT carries the standard RestoPanel claims consumed by the WebSocket
// gateway (`mini-services/realtime/index.ts`) and by `src/lib/rbac.ts`:
//   iss: "restopanel", aud: "restopanel-app", sub, org, email, role, iat, exp
// ============================================================================

import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { headers, cookies } from "next/headers";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ISSUER = "restopanel";
const AUDIENCE = "restopanel-app";
const TOKEN_COOKIE = "rp_access_token";
const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8h
const MIN_PASSWORD_LENGTH = 6;
const MIN_JWT_SECRET_LENGTH = 16;
const DEV_FALLBACK_SECRET = "dev-insecure-secret-change-me-16chars";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Legacy token payload. The org claim is named `org` (NOT `orgId`) for
 * backward compatibility with /api/auth/{login,register} and entitlements.ts.
 */
export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  org: string;
  email?: string;
  role?: string;
}

/**
 * New token payload. Adds `orgId` as a typed alias for the `org` claim so
 * the new RBAC / WS code reads semantically-correct identifiers without
 * breaking the legacy `org` claim stored in issued tokens.
 */
export interface RestoPanelToken extends AuthTokenPayload {
  /** Always equal to `org`. Read by rbac.ts and the realtime gateway. */
  orgId: string;
  /** Optional venue scope. "*" means org-wide. */
  venueId?: string;
}

// ---------------------------------------------------------------------------
// Secret resolution
// ---------------------------------------------------------------------------

/**
 * Returns the configured JWT_SECRET or throws / returns a dev fallback
 * depending on NODE_ENV. The 16-char minimum is enforced in production.
 */
function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not configured");
    }
    return DEV_FALLBACK_SECRET;
  }
  if (process.env.NODE_ENV === "production" && secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Legacy: signToken / verifyToken
// ---------------------------------------------------------------------------

export interface SignTokenInput {
  sub: string;
  org: string;
  email?: string;
  role?: string;
  /** Override the default 8h TTL (seconds). */
  ttlSeconds?: number;
}

export function signToken(input: SignTokenInput): string {
  const secret = resolveSecret(); // throws in production when misconfigured
  const now = Math.floor(Date.now() / 1000);
  const ttl = input.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  return jwt.sign(
    {
      sub: input.sub,
      org: input.org,
      email: input.email,
      role: input.role,
      iat: now,
    },
    secret,
    {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: ttl,
    },
  );
}

/**
 * Verifies signature, expiry, issuer + audience AND that the payload has the
 * required `sub`, `org`, `email` claims. Returns `null` for any failure —
 * callers MUST treat `null` as "not authenticated".
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  if (!token) return null;
  try {
    const secret = resolveSecret();
    const payload = jwt.verify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as JwtPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.org !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// New: signAccessToken / verifyAccessToken
// ---------------------------------------------------------------------------

export interface SignAccessTokenInput {
  sub: string;
  orgId: string;
  venueId?: string;
  role?: string;
  email?: string;
  ttlSeconds?: number;
}

/**
 * Mints an access token with the new RestoPanelToken shape. The org claim is
 * written as `org` (legacy claim name) so legacy `verifyToken()` callers can
 * still decode it; `orgId` is added explicitly so new consumers don't have
 * to know about the legacy alias.
 */
export function signAccessToken(input: SignAccessTokenInput): string {
  const secret = resolveSecret();
  const now = Math.floor(Date.now() / 1000);
  const ttl = input.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  return jwt.sign(
    {
      sub: input.sub,
      org: input.orgId, // legacy claim name (kept for backward compat)
      orgId: input.orgId, // new explicit claim
      venueId: input.venueId,
      email: input.email,
      role: input.role,
      iat: now,
    },
    secret,
    {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: ttl,
    },
  );
}

/**
 * Verifies a token issued by `signAccessToken`. Throws on invalid/expired
 * tokens so route handlers can map the error to a 401. Use `verifyToken()`
 * (the legacy function) when you want a `null`-on-failure API instead.
 */
export function verifyAccessToken(token: string): RestoPanelToken {
  const secret = resolveSecret();
  const payload = jwt.verify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JwtPayload;

  if (typeof payload.sub !== "string") {
    throw new Error("Token missing required claim: sub");
  }
  const orgId = (payload.orgId as string | undefined) ?? (payload.org as string | undefined);
  if (typeof orgId !== "string") {
    throw new Error("Token missing required claim: orgId");
  }
  return {
    ...payload,
    sub: payload.sub,
    org: orgId, // legacy alias populated for free
    orgId,
    email: payload.email as string | undefined,
    role: payload.role as string | undefined,
    venueId: payload.venueId as string | undefined,
  } as RestoPanelToken;
}

// ---------------------------------------------------------------------------
// Request-bound lookup (Next.js)
// ---------------------------------------------------------------------------

function readBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim() || null;
  }
  return null;
}

/**
 * Returns the authenticated user for the current request, or `null` when the
 * caller is anonymous. Throws on a malformed token — callers should treat
 * `null` as "logged out" and rejections as "auth required".
 *
 * If a NextRequest is supplied, the bearer token is read synchronously from
 * the `Authorization` header. Without an argument the function falls back to
 * the async `headers()` / `cookies()` helpers from `next/headers`.
 */
export async function getCurrentUser(req?: NextRequest): Promise<RestoPanelToken | null> {
  let token: string | null = null;

  if (req) {
    token = readBearer(req);
  }

  if (!token) {
    try {
      const headerList = await headers();
      const authHeader = headerList.get("authorization") ?? headerList.get("Authorization");
      if (authHeader && /^Bearer\s+/i.test(authHeader)) {
        token = authHeader.replace(/^Bearer\s+/i, "").trim() || null;
      }
      if (!token) {
        const store = await cookies();
        const cookie = store.get(TOKEN_COOKIE);
        if (cookie?.value) token = cookie.value;
      }
    } catch {
      // Called outside a request scope — caller must supply a NextRequest.
    }
  }

  if (!token) return null;
  return verifyAccessToken(token);
}

// ---------------------------------------------------------------------------
// Password hashing (members + admin + recovery codes)
// ---------------------------------------------------------------------------

/**
 * Hashes a plaintext password with bcrypt (10 rounds). Throws
 * "Password must be at least 6 characters" for short input — matches the
 * behavior expected by `src/lib/__tests__/auth.test.ts`.
 */
export async function hashPassword(plain: string): Promise<string> {
  if (typeof plain !== "string" || plain.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return bcrypt.hash(plain, 10);
}

/**
 * Constant-time bcrypt comparison. Returns `false` (never throws) when either
 * argument is empty or when the hash is malformed.
 */
export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/**
 * Sets the access-token cookie by writing to the response headers. Returns
 * the cookie string so the caller can attach it to a `NextResponse`.
 */
export async function setSessionCookie(token: string): Promise<string> {
  return buildAuthCookie(token);
}

/** Build a `Set-Cookie` header value for the access token. */
export function buildAuthCookie(token: string, maxAgeSeconds = DEFAULT_TTL_SECONDS): string {
  const parts = [
    `${TOKEN_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

/** Build a `Set-Cookie` header that clears the access token. */
export function buildClearAuthCookie(): string {
  const parts = [`${TOKEN_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}
