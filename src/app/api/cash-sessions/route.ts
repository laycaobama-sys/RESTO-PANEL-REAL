// ============================================================================
// /api/cash-sessions — Cash session open/close/list (VULN-02 + VULN-04)
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);

    const sessions = await db.cashSession.findMany({
      where: { venueId, ...(status ? { status } : {}) },
      orderBy: { openedAt: "desc" },
      take: limit,
      include: { payments: true },
    });

    return NextResponse.json({ sessions, venueId, memberId: user.sub });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const body = (await req.json().catch(() => null)) as {
      openingFloatCents?: number;
      notes?: string;
    } | null;
    if (!body) return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });

    // Refuse to open a new session while another is already open.
    const openSession = await db.cashSession.findFirst({
      where: { venueId, status: "open" },
    });
    if (openSession) {
      return NextResponse.json(
        { error: "SESSION_ALREADY_OPEN", sessionId: openSession.id },
        { status: 409 },
      );
    }

    const session = await db.cashSession.create({
      data: {
        venueId,
        openedByMemberId: user.sub,
        openingFloatCents: body.openingFloatCents ?? 0,
        notes: body.notes,
        status: "open",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
