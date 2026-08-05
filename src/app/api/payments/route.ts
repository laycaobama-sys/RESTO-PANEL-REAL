// ============================================================================
// /api/payments — Payments list + create (VULN-02 + VULN-04)
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const url = new URL(req.url);
    const method = url.searchParams.get("method");
    const ticketId = url.searchParams.get("ticketId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);

    const payments = await db.payment.findMany({
      where: {
        venueId,
        ...(method ? { method } : {}),
        ...(ticketId ? { ticketId } : {}),
      },
      orderBy: { processedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ payments, venueId, memberId: user.sub });
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
      ticketId: string;
      method: string;
      amountCents: number;
      tipCents?: number;
      reference?: string;
      processorRef?: string;
      cashSessionId?: string;
    } | null;
    if (!body || !body.ticketId || !body.method || typeof body.amountCents !== "number") {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    // Defensive: confirm the ticket belongs to the same venue.
    const ticket = await db.ticket.findFirst({ where: { id: body.ticketId, venueId } });
    if (!ticket) return NextResponse.json({ error: "TICKET_NOT_FOUND" }, { status: 404 });

    const payment = await db.payment.create({
      data: {
        venueId,
        ticketId: body.ticketId,
        method: body.method,
        amountCents: body.amountCents,
        tipCents: body.tipCents ?? 0,
        reference: body.reference,
        processorRef: body.processorRef,
        cashSessionId: body.cashSessionId,
        status: "succeeded",
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
