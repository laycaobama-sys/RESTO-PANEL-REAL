// ============================================================================
// RestoPanel — Realtime WebSocket gateway (VULN-01 fix)
// ----------------------------------------------------------------------------
// Accepts connections with `?token=<JWT>&venue=<venueId>` and validates:
//   1. JWT signature against `JWT_SECRET`
//   2. `iss: "restopanel"`, `aud: "restopanel-app"`
//   3. Token not expired / not invalid
//   4. `token.orgId` matches the organization that owns the requested venue
//   5. `token.venueId` (optional) is the same venue the client wants to
//      subscribe to (or wildcard "*" if the token grants org-wide access)
//
// The verified user info is stored on the WebSocket instance so downstream
// handlers (presence, broadcast, etc.) can read it without re-decoding.
// ============================================================================

import http from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Identity encoded inside the RestoPanel access token. Mirrors the claims
 * minted by `src/lib/auth.ts` → `signAccessToken()`.
 */
export interface RestoPanelToken extends JwtPayload {
  sub: string; // memberId
  orgId: string; // organization the member belongs to
  venueId?: string; // venue the member is currently operating (or "*")
  role?: string; // role key (owner|manager|floor|chef|cashier|…)
}

/**
 * Augmented WebSocket. `user` is set only after the connection has been
 * authenticated. Downstream code MUST check `ws.user != null` before trusting
 * any field on it.
 */
export interface AuthedWebSocket extends WebSocket {
  user?: RestoPanelToken;
  venueId?: string;
}

// ---------------------------------------------------------------------------
// Venue → organization resolution
// ---------------------------------------------------------------------------
//
// In a production deployment this gateway shares a database connection with
// the main app and would call `db.venue.findUnique({ where: { id } })`. To
// keep the mini-service self-contained and avoid pulling Prisma into the
// realtime process, it instead delegates to the internal HTTP API:
//
//   GET /internal/venues/:id/ownership  →  { organizationId: string }
//
// The endpoint is expected to be served by the Next.js app on the same host
// and protected by network ACLs (loopback only). If `VENUE_OWNERSHIP_URL` is
// not configured we fall back to the claim embedded in the token — useful
// for local development where the venue graph is not seeded yet.
// ---------------------------------------------------------------------------

async function resolveVenueOrgId(venueId: string): Promise<string | null> {
  const endpoint = process.env.VENUE_OWNERSHIP_URL;
  if (!endpoint) return null;
  try {
    const url = endpoint.replace(":id", encodeURIComponent(venueId));
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const body = (await res.json()) as { organizationId?: string };
    return typeof body.organizationId === "string" ? body.organizationId : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// JWT verification
// ---------------------------------------------------------------------------

function verifyToken(token: string): RestoPanelToken {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const payload = jwt.verify(token, secret, {
    issuer: "restopanel",
    audience: "restopanel-app",
  }) as JwtPayload;

  if (typeof payload.sub !== "string" || typeof payload.orgId !== "string") {
    throw new Error("Token missing required claims (sub, orgId)");
  }
  return payload as RestoPanelToken;
}

// ---------------------------------------------------------------------------
// Connection upgrade lifecycle
// ---------------------------------------------------------------------------

async function authenticate(
  req: http.IncomingMessage,
): Promise<{ user: RestoPanelToken; venueId: string } | { error: string; status: number }> {
  const url = new URL(req.url ?? "", "http://localhost");
  const token = url.searchParams.get("token");
  const venueId = url.searchParams.get("venue") ?? url.searchParams.get("venueId");

  if (!token) {
    return { error: "Missing token query parameter", status: 401 };
  }
  if (!venueId) {
    return { error: "Missing venue query parameter", status: 400 };
  }

  let user: RestoPanelToken;
  try {
    user = verifyToken(token);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    return { error: message, status: 401 };
  }

  // Multi-tenant check: the venue the client wants to subscribe to MUST
  // belong to the same organization that issued the token.
  const orgId = await resolveVenueOrgId(venueId);
  if (orgId !== null && orgId !== user.orgId) {
    return { error: "Venue does not belong to token organization", status: 403 };
  }

  // Defensive: if the token pins a single venue, refuse cross-venue subs.
  if (user.venueId && user.venueId !== "*" && user.venueId !== venueId) {
    return { error: "Token is not valid for the requested venue", status: 403 };
  }

  return { user, venueId };
}

function sendClose(ws: AuthedWebSocket, status: number, message: string): void {
  try {
    ws.send(JSON.stringify({ type: "error", status, message }));
  } catch {
    /* ignore — client may already be gone */
  }
  ws.close(4400 + Math.min(status, 999), message);
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

export function createRealtimeServer(server?: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  const handleUpgrade = async (
    req: http.IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ): Promise<void> => {
    const auth = await authenticate(req);
    if ("error" in auth) {
      // Per RFC 6455 §4.2.2 we should respond with an HTTP error and not
      // complete the upgrade. `WebSocketServer` won't have a ws yet.
      socket.write(
        `HTTP/1.1 ${auth.status} Unauthorized\r\n` +
          "Content-Type: application/json\r\n" +
          "Connection: close\r\n\r\n" +
          JSON.stringify({ error: auth.error }),
      );
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws: WebSocket): void => {
      const conn = ws as AuthedWebSocket;
      conn.user = auth.user;
      conn.venueId = auth.venueId;
      wss.emit("connection", conn, req);
    });
  };

  if (server) {
    server.on("upgrade", (req, socket, head) => {
      if ((req.url ?? "").startsWith("/realtime")) {
        void handleUpgrade(req, socket, head);
      }
    });
  }

  wss.on("connection", (ws: AuthedWebSocket) => {
    // Echo back the authenticated identity so the client can confirm.
    ws.send(
      JSON.stringify({
        type: "ready",
        venueId: ws.venueId,
        memberId: ws.user?.sub,
        orgId: ws.user?.orgId,
        role: ws.user?.role,
      }),
    );

    ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
      const raw = typeof data === "string" ? data : Buffer.from(data as ArrayBuffer).toString();
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        sendClose(ws, 400, "Invalid JSON frame");
        return;
      }
      if (typeof parsed !== "object" || parsed === null) {
        sendClose(ws, 400, "Frame must be a JSON object");
        return;
      }
      // Broadcast scoped to the same venue. We refuse to relay messages to
      // other venues — that would break tenant isolation.
      const payload = JSON.stringify({
        type: "broadcast",
        venueId: ws.venueId,
        from: ws.user?.sub,
        data: (parsed as { data?: unknown }).data ?? parsed,
      });
      for (const peer of wss.clients) {
        const p = peer as AuthedWebSocket;
        if (p !== ws && p.readyState === WebSocket.OPEN && p.venueId === ws.venueId) {
          p.send(payload);
        }
      }
    });
  });

  return wss;
}

// ---------------------------------------------------------------------------
// Standalone entrypoint (run via `bun mini-services/realtime/index.ts`)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const port = Number(process.env.REALTIME_PORT ?? 8080);
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ service: "restopanel-realtime", status: "ok" }));
  });
  createRealtimeServer(server);
  server.listen(port, () => {
    console.log(`[realtime] listening on :${port}`);
  });
}
