// ============================================================================
// /api/orders — Orders list + create (VULN-02 + VULN-04)
// ----------------------------------------------------------------------------
// Every request is authenticated (`requireAuthForVenue`) and scoped to the
// venue resolved from `x-venue-id` / `?venueId=` / JSON body. The venue is
// verified to belong to the caller's organization before any query runs.
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

    const orders = await db.order.findMany({
      where: {
        venueId,
        ...(status ? { status } : {}),
      },
      orderBy: { openedAt: "desc" },
      take: limit,
      include: { items: true },
    });

    return NextResponse.json({ orders, venueId, memberId: user.sub });
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
      type?: string;
      tableId?: string;
      tableLabel?: string;
      guestId?: string;
      covers?: number;
      notes?: string;
      items?: Array<{
        menuItemId?: string;
        menuItemName: string;
        menuItemPrice: number;
        quantity?: number;
        notes?: string;
      }>;
    } | null;
    if (!body) return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });

    const subtotalCents = (body.items ?? []).reduce(
      (sum, item) => sum + item.menuItemPrice * (item.quantity ?? 1),
      0,
    );

    // Allocate the next sequential order number for the venue/day.
    const last = await db.order.findFirst({
      where: { venueId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const order = await db.order.create({
      data: {
        venueId,
        number: (last?.number ?? 0) + 1,
        code: `ORD-${venueId.slice(-6)}-${(last?.number ?? 0) + 1}`,
        type: body.type ?? "dine_in",
        tableId: body.tableId,
        tableLabel: body.tableLabel,
        guestId: body.guestId,
        serverMemberId: user.sub,
        covers: body.covers ?? 1,
        subtotalCents,
        totalCents: subtotalCents,
        notes: body.notes,
        items: body.items?.length
          ? {
              create: body.items.map((item) => ({
                menuItemId: item.menuItemId,
                menuItemName: item.menuItemName,
                menuItemPrice: item.menuItemPrice,
                quantity: item.quantity ?? 1,
                notes: item.notes,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
