// ============================================================================
// /api/admin/auth/login — SuperAdmin login (VULN-05 fix)
// ----------------------------------------------------------------------------
// Replaces the static `SUPER_ADMIN_2FA_CODE` env var with real TOTP.
//
// Request body: `{ password: string, token: string }`
//   - `password` is checked against `SUPER_ADMIN_PASSWORD_HASH` (bcrypt)
//   - `token` is the 6-digit TOTP code OR a single-use recovery code
//
// On success the route returns a short-lived admin JWT minted with
// `signAccessToken()` from `@/lib/auth`. The legacy `SUPER_ADMIN_2FA_CODE`
// env var is deliberately ignored.
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken, isSetupConfirmed } from "@/lib/admin-auth";
import { signAccessToken, buildAuthCookie } from "@/lib/auth";

interface LoginBody {
  password?: string;
  token?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;
  if (!body || !body.password || !body.token) {
    return NextResponse.json(
      { error: "PASSWORD_AND_TOKEN_REQUIRED" },
      { status: 400 },
    );
  }

  // 1. Password check — constant time via bcrypt.compare.
  const passwordHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    return NextResponse.json({ error: "ADMIN_NOT_CONFIGURED" }, { status: 500 });
  }
  const passwordOk = await bcrypt.compare(body.password, passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  // 2. Refuse login if 2FA setup hasn't been confirmed yet.
  const confirmed = await isSetupConfirmed();
  if (!confirmed) {
    return NextResponse.json(
      { error: "2FA_NOT_CONFIRMED", hint: "POST /api/admin/2fa/setup to confirm setup" },
      { status: 412 },
    );
  }

  // 3. TOTP / recovery-code verification (replaces the old static code).
  let verify;
  try {
    verify = await verifyToken(body.token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  if (!verify.ok) {
    return NextResponse.json({ error: "INVALID_TOTP_TOKEN" }, { status: 401 });
  }

  // 4. Mint a short-lived admin token. `orgId` is empty because SuperAdmin
  //    sits above the org tenant boundary; the `role: "superadmin"` claim
  //    lets downstream guards distinguish it from regular members.
  const accessToken = signAccessToken({
    sub: "superadmin",
    orgId: "__platform__",
    venueId: "*",
    role: "superadmin",
    ttlSeconds: 60 * 60, // 1h — admins re-authenticate frequently
  });

  const response = NextResponse.json({
    ok: true,
    method: verify.method,
    accessToken,
    expiresIn: 3600,
  });
  response.headers.set("set-cookie", buildAuthCookie(accessToken, 3600));
  return response;
}
