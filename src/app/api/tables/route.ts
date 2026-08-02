// ============================================================================
// /api/tables — Tables list + create (VULN-02 + VULN-04)
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const zoneId = url.searchParams.get("zoneId");

    const tables = await db.table.findMany({
      where: {
        venueId,
        ...(status ? { status } : {}),
        ...(zoneId ? { zoneId } : {}),
      },
      orderBy: [{ zoneId: "asc" }, { number: "asc" }],
      include: { zone: true },
    });

    return NextResponse.json({ tables, venueId, memberId: user.sub });
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
      number: string;
      label?: string;
      shape?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number;
      capacity?: number;
      minCapacity?: number;
      zoneId?: string;
    } | null;
    if (!body || !body.number) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const table = await db.table.create({
      data: {
        venueId,
        zoneId: body.zoneId,
        number: body.number,
        label: body.label,
        shape: body.shape ?? "rect",
        x: body.x ?? 0,
        y: body.y ?? 0,
        width: body.width ?? 80,
        height: body.height ?? 80,
        rotation: body.rotation ?? 0,
        capacity: body.capacity ?? 4,
        minCapacity: body.minCapacity ?? 1,
        status: "free",
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
