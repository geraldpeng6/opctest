import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_TOKEN_BYTES = 24;

export function normalizeCode(raw: string) {
  return raw.trim().toLowerCase();
}

export function normalizeDisplayName(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function createSalt() {
  return randomBytes(16).toString("hex");
}

export function hashCode(code: string, salt: string) {
  return scryptSync(normalizeCode(code), salt, 64).toString("hex");
}

export function verifyCode(code: string, salt: string, expectedHex: string) {
  const actual = Buffer.from(hashCode(code, salt), "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
