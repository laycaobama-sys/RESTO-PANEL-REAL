// ============================================================================
// /api/employees — Create + list (VULN-03 fix)
// ----------------------------------------------------------------------------
// The PIN field is now hashed with bcrypt (salt 10) via `hashPin()` from
// `src/lib/staff-auth.ts` before being persisted. The plaintext PIN never
// touches the database.
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuthForVenue } from "@/lib/rbac";
import { hashPin } from "@/lib/staff-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, venueId } = await requireAuthForVenue(req);

    const employees = await db.employee.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
      // Never expose the PIN hash to the client.
      select: {
        id: true,
        venueId: true,
        memberId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        hireDate: true,
        terminationDate: true,
        hourlyCostCents: true,
        maxHoursWeek: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Intentionally omit `pin`.
      },
    });

    return NextResponse.json({ employees, venueId, memberId: user.sub });
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
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      role?: string;
      pin?: string; // plaintext PIN — hashed before save
      hireDate?: string;
      hourlyCostCents?: number;
      maxHoursWeek?: number;
      memberId?: string;
    } | null;
    if (!body || !body.firstName || !body.lastName) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }
    if (body.pin !== undefined && (body.pin.length < 4 || body.pin.length > 32)) {
      return NextResponse.json({ error: "PIN_LENGTH_INVALID" }, { status: 400 });
    }

    // Hash the PIN with bcrypt before persisting — never store plaintext.
    const pinHash = body.pin ? await hashPin(body.pin) : undefined;

    const employee = await db.employee.create({
      data: {
        venueId,
        memberId: body.memberId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        role: body.role ?? "staff",
        pin: pinHash,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,
        hourlyCostCents: body.hourlyCostCents ?? 0,
        maxHoursWeek: body.maxHoursWeek ?? 40,
        isActive: true,
      },
      // Re-read via the same select mask used by GET so the response shape is
      // stable and the PIN hash is never echoed back.
    });

    return NextResponse.json(
      {
        employee: {
          id: employee.id,
          venueId: employee.venueId,
          memberId: employee.memberId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          isActive: employee.isActive,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : msg === "VENUE_REQUIRED" ? 400 : msg === "PIN must be at least 4 characters" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
