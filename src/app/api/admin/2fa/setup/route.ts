// ============================================================================
// /api/admin/2fa/setup — SuperAdmin TOTP setup (VULN-05 fix)
// ----------------------------------------------------------------------------
//   GET  → returns `{ secret, otpauthUri, qrDataUrl, confirmed }`
//          (recovery codes are returned ONLY on first-time setup)
//   POST → verifies a TOTP code to confirm setup. Subsequent logins will
//          require a valid 6-digit code from the authenticator app.
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { generateSetup, confirmSetup } from "@/lib/admin-auth";

// SuperAdmin is gated by an environment-configured password (bcrypt-hashed
// via `SUPER_ADMIN_PASSWORD_HASH`). This route does not authenticate against
// the member/role graph — it's the bootstrap path.
function verifyAdminPassword(provided: string | null): boolean {
  const hash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!hash || !provided) return false;
  return bcrypt.compareSync(provided, hash);
}

function readBearerPassword(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim() || null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const password = readBearerPassword(req);
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const setup = await generateSetup();
    return NextResponse.json(setup);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const password = readBearerPassword(req);
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token) {
    return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  }

  try {
    const ok = await confirmSetup(body.token);
    if (!ok) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    return NextResponse.json({ confirmed: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
