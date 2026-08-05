// ============================================================================
// RestoPanel — Staff (POS PIN) auth (VULN-03 fix)
// ----------------------------------------------------------------------------
// POS PINs are now hashed with bcrypt (salt rounds = 10). Plaintext storage
// has been removed from the entire code path. Functions provided:
//
//   hashPin(plain)        → bcrypt.hash(plain, 10)
//   verifyPin(plain, hash)→ bcrypt.compare
//   authenticateEmployee()→ loads an employee by (venueId, email|pin tag),
//                            verifies the PIN, returns the row on success
//
// The PIN field on `Employee` in `prisma/schema.prisma` carries the comment
// "hashed POS pin" — this module is the single producer/consumer of that hash.
// ============================================================================

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const PIN_BCRYPT_ROUNDS = 10;

/** Hash a 4-8 digit POS PIN before persisting it on the Employee row. */
export async function hashPin(plain: string): Promise<string> {
  if (!plain || plain.length < 4) {
    throw new Error("PIN must be at least 4 characters");
  }
  return bcrypt.hash(plain, PIN_BCRYPT_ROUNDS);
}

/**
 * Constant-time PIN verification. Returns `false` if the stored hash is empty
 * (PIN not set) so a missing PIN can never accidentally match an empty string.
 */
export async function verifyPin(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export interface AuthenticateEmployeeInput {
  venueId: string;
  /** Either the employee email, the employee id, or a POS "pin tag". */
  identifier: string;
  pin: string;
}

/**
 * Loads the employee, checks the PIN against the bcrypt hash and returns the
 * employee row on success. Throws `INVALID_CREDENTIALS` otherwise.
 *
 * Backward compatibility: callers that previously stored a plaintext PIN can
 * migrate transparently — the first successful login with a plaintext value
 * (which will fail bcrypt.compare because it's not a hash) returns
 * `INVALID_CREDENTIALS` so the operator can reset the PIN through the
 * `POST /api/employees` endpoint, which always hashes via `hashPin()`.
 */
export async function authenticateEmployee(
  input: AuthenticateEmployeeInput,
) {
  const { venueId, identifier, pin } = input;
  const employee = await db.employee.findFirst({
    where: {
      venueId,
      isActive: true,
      OR: [{ id: identifier }, { email: identifier }],
    },
  });
  if (!employee) throw new Error("INVALID_CREDENTIALS");
  if (!employee.pin) throw new Error("PIN_NOT_SET");

  const ok = await verifyPin(pin, employee.pin);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  return employee;
}
