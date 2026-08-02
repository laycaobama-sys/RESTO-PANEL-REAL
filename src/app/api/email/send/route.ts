// ============================================================================
// /api/email/send — Email send endpoint (VULN-02 fix)
// ----------------------------------------------------------------------------
// Routes the request to the appropriate Resend email template. Every request
// must be authenticated (`requireAuth`) — email sending is a privileged
// operation that can be abused for spam / phishing if left anonymous.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendPasswordReset,
  sendInvoiceEmail,
  sendReservationConfirmation,
  type ReservationDetails,
} from "@/lib/services/email";
import { requireAuth } from "@/lib/rbac";

type EmailType =
  | "welcome"
  | "password_reset"
  | "invoice"
  | "reservation_confirmation";

interface EmailRequestBody {
  type?: EmailType;
  to?: string;
  data?: Record<string, unknown>;
}

const isEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    // --- Auth ---------------------------------------------------------------
    await requireAuth();

    // --- Body parse + validation -------------------------------------------
    let payload: EmailRequestBody;
    try {
      payload = (await req.json()) as EmailRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { type, to, data } = payload;
    if (!type) {
      return NextResponse.json({ error: "Missing email type" }, { status: 400 });
    }
    if (!isEmail(to)) {
      return NextResponse.json({ error: "Invalid or missing recipient" }, { status: 400 });
    }
    const ctx = data ?? {};

    // --- Dispatch ----------------------------------------------------------
    let result: { id: string };
    switch (type) {
      case "welcome": {
        const restaurantName = ctx.restaurantName;
        if (typeof restaurantName !== "string") {
          return NextResponse.json({ error: "Missing restaurantName" }, { status: 400 });
        }
        result = await sendWelcomeEmail(to, restaurantName);
        break;
      }
      case "password_reset": {
        const resetLink = ctx.resetLink;
        if (typeof resetLink !== "string") {
          return NextResponse.json({ error: "Missing resetLink" }, { status: 400 });
        }
        result = await sendPasswordReset(to, resetLink);
        break;
      }
      case "invoice": {
        const invoiceUrl = ctx.invoiceUrl;
        if (typeof invoiceUrl !== "string") {
          return NextResponse.json({ error: "Missing invoiceUrl" }, { status: 400 });
        }
        result = await sendInvoiceEmail(to, invoiceUrl);
        break;
      }
      case "reservation_confirmation": {
        const required: Array<keyof ReservationDetails> = [
          "restaurantName",
          "guestName",
          "date",
          "time",
          "partySize",
        ];
        for (const key of required) {
          if (!(key in ctx) || typeof ctx[key] !== (key === "partySize" ? "number" : "string")) {
            return NextResponse.json(
              { error: `Missing or invalid field: ${String(key)}` },
              { status: 400 },
            );
          }
        }
        const details: ReservationDetails = {
          restaurantName: ctx.restaurantName as string,
          guestName: ctx.guestName as string,
          date: ctx.date as string,
          time: ctx.time as string,
          partySize: ctx.partySize as number,
          zone: typeof ctx.zone === "string" ? ctx.zone : undefined,
        };
        result = await sendReservationConfirmation(to, details);
        break;
      }
      default: {
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
      }
    }
    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email send failed";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("[email/send] error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
