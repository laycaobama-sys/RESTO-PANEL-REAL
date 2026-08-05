// ============================================================================
// /api/reservations — Reservations list + create (VULN-02 + VULN-04)
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const date = url.searchParams.get("date"); // YYYY-MM-DD
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);

    const reservations = await db.reservation.findMany({
      where: {
        venueId,
        ...(status ? { status } : {}),
        ...(date
          ? {
              date: {
                gte: new Date(`${date}T00:00:00Z`),
                lt: new Date(`${date}T23:59:59Z`),
              },
            }
          : {}),
      },
      orderBy: { startTime: "asc" },
      take: limit,
      include: { guest: true, table: true },
    });

    return NextResponse.json({ reservations, venueId, memberId: user.sub });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { venueId } = await requireAuthForVenue(req);

    const body = (await req.json().catch(() => null)) as {
      guestId?: string;
      tableId?: string;
      partySize: number;
      date: string; // ISO
      startTime: string; // ISO
      durationMin?: number;
      zonePreference?: string;
      source?: string;
      notes?: string;
      depositCents?: number;
    } | null;
    if (!body || typeof body.partySize !== "number" || !body.date || !body.startTime) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const reservation = await db.reservation.create({
      data: {
        venueId,
        guestId: body.guestId,
        tableId: body.tableId,
        code: `RSV-${venueId.slice(-6)}-${Date.now()}`,
        status: "pending",
        partySize: body.partySize,
        date: new Date(body.date),
        startTime: new Date(body.startTime),
        durationMin: body.durationMin ?? 90,
        zonePreference: body.zonePreference,
        source: body.source ?? "manual",
        notes: body.notes,
        depositCents: body.depositCents ?? 0,
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
