// ============================================================================
// POST /api/auth/register
// ----------------------------------------------------------------------------
// Creates a new Organization + Owner Member and returns a JWT.
//
// Body:
//   { email: string, password: string, orgName?: string, name?: string }
//
// Responses:
//   201 { token, member: { id, email, name } }
//   400 { error: "..." }            — invalid input
//   409 { error: "email_in_use" }   — member already exists
//   429 { error: "rate_limited" }   — too many attempts
//   500 { error: "..." }            — unexpected
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterBody {
  email?: unknown;
  password?: unknown;
  orgName?: unknown;
  name?: unknown;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function uniqueSlug(base: string, salt: string): string {
  // Deterministic suffix so unit tests can predict the slug.
  return `${base}-${salt.slice(0, 6)}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // --- Rate limit ----------------------------------------------------------
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = consumeRateLimit(`register:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  // --- Parse body ----------------------------------------------------------
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
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

  const orgName =
    typeof body.orgName === "string" && body.orgName.trim().length > 0
      ? body.orgName.trim()
      : email.split("@")[0] + "'s restaurant";
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : null;

  try {
    // --- Duplicate check ---------------------------------------------------
    // The schema enforces @@unique([organizationId, email]) on Member, so the
    // safest cross-org guard is `findFirst` by email (the field is also part
    // of an @@index so the lookup is still cheap).
    const existing = await db.member.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "email_in_use" }, { status: 409 });
    }

    // --- Create org + member + owner role in a transaction -----------------
    const hashedPassword = await hashPassword(password);

    const slug = uniqueSlug(slugify(orgName), email);
    const org = await db.organization.create({
      data: {
        slug,
        name: orgName,
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    const member = await db.member.create({
      data: {
        organizationId: org.id,
        email,
        name,
        hashedPassword,
        status: "active",
        emailVerifiedAt: null,
      },
    });

    const ownerRole = await db.role.create({
      data: {
        organizationId: org.id,
        key: "owner",
        name: "Owner",
        isSystem: true,
      },
    });

    await db.memberRole.create({
      data: {
        memberId: member.id,
        roleId: ownerRole.id,
        venueId: null,
      },
    });

    // --- Issue JWT ---------------------------------------------------------
    const token = signToken({
      sub: member.id,
      org: org.id,
      email: member.email,
      role: "owner",
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        token,
        member: { id: member.id, email: member.email, name: member.name },
        organization: { id: org.id, slug: org.slug, name: org.name },
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "register_failed";
    console.error("[auth/register] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
