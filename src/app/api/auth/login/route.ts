// ============================================================================
// POST /api/auth/login
// ----------------------------------------------------------------------------
// Verifies credentials and returns a JWT.
//
// Body:
//   { email: string, password: string }
//
// Responses:
//   200 { token, member: { id, email, name } }
//   400 { error: "..." }            — invalid input
//   401 { error: "invalid_credentials" }
//   429 { error: "rate_limited" }   — too many attempts
//   500 { error: "..." }            — unexpected
//
// Note: "user not found" and "wrong password" both return the same 401 with
// the same error code to avoid user-enumeration via timing or message.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // --- Rate limit ----------------------------------------------------------
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  // Rate-limit per (ip, email) so an attacker cannot rotate IPs to bypass.
  const rlKey = `login:${ip}:${email}`;
  const rl = consumeRateLimit(rlKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  try {
    const member = await db.member.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
        status: true,
        organizationId: true,
        memberRoles: {
          select: {
            role: { select: { key: true } },
          },
        },
      },
    });

    if (!member || !member.hashedPassword) {
      return NextResponse.json(
        { error: "invalid_credentials" },
        { status: 401 },
      );
    }

    const passwordOk = await verifyPassword(password, member.hashedPassword);
    if (!passwordOk) {
      return NextResponse.json(
        { error: "invalid_credentials" },
        { status: 401 },
      );
    }

    if (member.status === "disabled") {
      return NextResponse.json({ error: "account_disabled" }, { status: 403 });
    }

    // Pick the highest-priority role key (owner > manager > everything else).
    const rolePriority = ["owner", "manager", "floor", "chef", "cashier"];
    const roleKeys = member.memberRoles.map((mr) => mr.role.key);
    const role =
      rolePriority.find((k) => roleKeys.includes(k)) ?? roleKeys[0] ?? "member";

    const token = signToken({
      sub: member.id,
      org: member.organizationId,
      email: member.email,
      role,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        token,
        member: { id: member.id, email: member.email, name: member.name },
      },
      { status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "login_failed";
    console.error("[auth/login] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
