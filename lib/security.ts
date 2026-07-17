import { createHash, randomBytes } from "node:crypto";

const SESSION_TOKEN_BYTES = 24;

export function normalizeNickname(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function createSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
