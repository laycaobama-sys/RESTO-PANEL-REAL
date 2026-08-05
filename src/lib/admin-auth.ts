// ============================================================================
// RestoPanel — SuperAdmin 2FA (VULN-05 fix)
// ----------------------------------------------------------------------------
// Replaces the static `SUPER_ADMIN_2FA_CODE` env var with real TOTP (RFC 6238).
//
// Flow:
//   1. First-time setup: `POST /api/admin/2fa/setup` calls `generateSetup()`
//      which returns `{ secret, otpauthUri, qrDataUrl, recoveryCodes }`. The
//      secret is persisted to a server-side file (`SUPER_ADMIN_2FA_FILE`) so
//      it survives restarts. The recovery codes are hashed with bcrypt and
//      stored next to the secret.
//   2. The admin adds the secret to Google Authenticator (or any TOTP app)
//      and confirms setup with `confirmSetup()`.
//   3. `/api/admin/auth/login` runs password + `verifyToken()` checks. A
//      recovery code can be used in place of the TOTP token (one-shot).
//
// No env-based static code is ever read. The legacy `SUPER_ADMIN_2FA_CODE`
// variable is deliberately ignored by this module.
// ============================================================================

import { OTP } from "otplib";
import bcrypt from "bcryptjs";
import { promises as fs } from "node:fs";
import { randomInt } from "node:crypto";
import path from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ISSUER = "RestoPanel";
const ACCOUNT = "superadmin@restopanel.local";

/** Resolve the secret store path. Defaults to `.superadmin-2fa.json` in cwd. */
function storePath(): string {
  return process.env.SUPER_ADMIN_2FA_FILE ?? path.resolve(process.cwd(), ".superadmin-2fa.json");
}

/**
 * Single TOTP instance configured for a 30s step, 6 digits and ±1 step of
 * tolerance (matches Google Authenticator behaviour).
 */
const totp = new OTP({ strategy: "totp" });

const TOTP_PERIOD_SECONDS = 30;
const TOTP_TOLERANCE_SECONDS = 30; // accept current + previous + next 30s window

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface TwoFactorRecord {
  /** Base32 TOTP secret. */
  secret: string;
  /** bcrypt-hashed recovery codes. Plaintext is returned ONCE at setup time. */
  recoveryHashes: string[];
  /** Whether the admin has confirmed setup by entering one valid TOTP code. */
  confirmed: boolean;
  /** ISO timestamp of the last successful verification. */
  lastVerifiedAt: string | null;
}

async function load(): Promise<TwoFactorRecord | null> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    return JSON.parse(raw) as TwoFactorRecord;
  } catch {
    return null;
  }
}

async function save(record: TwoFactorRecord): Promise<void> {
  await fs.writeFile(storePath(), JSON.stringify(record, null, 2), { mode: 0o600 });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
  qrDataUrl: string;
  recoveryCodes: string[];
  confirmed: boolean;
}

function generateRecoveryCodes(count = 10): string[] {
  // 10 codes of the form `XXXX-XXXX` (8 base32 chars + dash) — easy to read,
  // hard to brute-force (32 bits of entropy each).
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648 base32
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let left = "";
    let right = "";
    for (let j = 0; j < 4; j++) {
      left += alphabet[cryptoRandomInt(alphabet.length)];
      right += alphabet[cryptoRandomInt(alphabet.length)];
    }
    codes.push(`${left}-${right}`);
  }
  return codes;
}

function cryptoRandomInt(maxExclusive: number): number {
  // `node:crypto.randomInt(max)` returns an unbiased integer in [0, max).
  return randomInt(0, maxExclusive);
}

async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
}

/**
 * Idempotent setup generator. If a secret already exists it is returned
 * (recovery codes are NOT regenerated — call `rotateRecoveryCodes()` for
 * that). Otherwise a fresh secret + 10 recovery codes are minted and
 * persisted.
 */
export async function generateSetup(): Promise<TwoFactorSetup> {
  const existing = await load();
  if (existing && existing.secret) {
    const otpauthUri = totp.generateURI({
      issuer: ISSUER,
      label: ACCOUNT,
      secret: existing.secret,
    });
    return {
      secret: existing.secret,
      otpauthUri,
      qrDataUrl: await toQrDataUrl(otpauthUri),
      recoveryCodes: [], // already shown to the user at first setup
      confirmed: existing.confirmed,
    };
  }

  const secret = totp.generateSecret(20);
  const recoveryCodes = generateRecoveryCodes(10);
  const recoveryHashes = await hashRecoveryCodes(recoveryCodes);

  await save({
    secret,
    recoveryHashes,
    confirmed: false,
    lastVerifiedAt: null,
  });

  const otpauthUri = totp.generateURI({
    issuer: ISSUER,
    label: ACCOUNT,
    secret,
  });
  return {
    secret,
    otpauthUri,
    qrDataUrl: await toQrDataUrl(otpauthUri),
    recoveryCodes,
    confirmed: false,
  };
}

/** Mark the setup as confirmed after the admin enters a valid TOTP code. */
export async function confirmSetup(token: string): Promise<boolean> {
  const record = await load();
  if (!record) throw new Error("2FA_NOT_INITIALIZED");
  if (!verifyTotpToken(token, record.secret)) return false;
  record.confirmed = true;
  record.lastVerifiedAt = new Date().toISOString();
  await save(record);
  return true;
}

// ---------------------------------------------------------------------------
// Verification (used by `/api/admin/auth/login`)
// ---------------------------------------------------------------------------

async function verifyTotpToken(token: string, secret: string): Promise<boolean> {
  const clean = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  try {
    const result = await totp.verify({
      secret,
      token: clean,
      period: TOTP_PERIOD_SECONDS,
      epochTolerance: TOTP_TOLERANCE_SECONDS,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export interface VerifyResult {
  ok: boolean;
  /** "totp" | "recovery" | null when the token was wrong. */
  method: "totp" | "recovery" | null;
}

/**
 * Verify a TOTP token (or consume a recovery code). When a recovery code is
 * used, its hash is removed from the store so it can only be redeemed once.
 */
export async function verifyToken(input: string): Promise<VerifyResult> {
  const record = await load();
  if (!record || !record.secret) throw new Error("2FA_NOT_INITIALIZED");

  if (await verifyTotpToken(input, record.secret)) {
    record.lastVerifiedAt = new Date().toISOString();
    await save(record);
    return { ok: true, method: "totp" };
  }

  // Try recovery codes (constant-time-ish: bcrypt.compare is constant time).
  for (let i = 0; i < record.recoveryHashes.length; i++) {
    const matches = await bcrypt.compare(input, record.recoveryHashes[i]);
    if (matches) {
      record.recoveryHashes.splice(i, 1);
      record.lastVerifiedAt = new Date().toISOString();
      await save(record);
      return { ok: true, method: "recovery" };
    }
  }

  return { ok: false, method: null };
}

/** True once `confirmSetup()` has succeeded at least once. */
export async function isSetupConfirmed(): Promise<boolean> {
  const record = await load();
  return Boolean(record?.confirmed);
}

/**
 * Issue a fresh batch of recovery codes. The previous codes are invalidated.
 * Returns the plaintext codes (shown once to the admin).
 */
export async function rotateRecoveryCodes(): Promise<string[]> {
  const record = await load();
  if (!record) throw new Error("2FA_NOT_INITIALIZED");
  const codes = generateRecoveryCodes(10);
  record.recoveryHashes = await hashRecoveryCodes(codes);
  await save(record);
  return codes;
}

// ---------------------------------------------------------------------------
// QR helpers
// ---------------------------------------------------------------------------

async function toQrDataUrl(otpauthUri: string): Promise<string> {
  // Dynamic import keeps `qrcode` (which uses canvas under the hood) out of
  // the hot path and lets the module load in environments without a DOM.
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(otpauthUri, { errorCorrectionLevel: "M", width: 240 });
}
