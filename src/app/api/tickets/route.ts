// ============================================================================
// /api/tickets — Fiscal tickets list + create (VULN-02 + VULN-04)
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);

    const tickets = await db.ticket.findMany({
      where: { venueId, ...(status ? { status } : {}) },
      orderBy: { issuedAt: "desc" },
      take: limit,
      include: { orders: true, payments: true },
    });

    return NextResponse.json({ tickets, venueId, memberId: user.sub });
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
      type?: string;
      subtotalCents?: number;
      taxCents?: number;
      discountCents?: number;
      tipCents?: number;
      totalCents?: number;
      orderIds?: string[];
      paymentMethod?: string;
    } | null;
    if (!body) return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });

    const ticket = await db.ticket.create({
      data: {
        venueId,
        number: `TKT-${venueId.slice(-6)}-${Date.now()}`,
        type: body.type ?? "invoice",
        subtotalCents: body.subtotalCents ?? 0,
        taxCents: body.taxCents ?? 0,
        discountCents: body.discountCents ?? 0,
        tipCents: body.tipCents ?? 0,
        totalCents: body.totalCents ?? body.subtotalCents ?? 0,
        paymentMethod: body.paymentMethod,
        orders: body.orderIds?.length ? { connect: body.orderIds.map((id) => ({ id })) } : undefined,
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
