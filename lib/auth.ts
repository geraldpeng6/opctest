import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";

import { getFinalSubmission, didPassLevel } from "@/lib/results";
import { LEVELS, previousLevel, unlockedLevelsFromMaxLevel } from "@/lib/levels";
import {
  createSalt,
  createSessionToken,
  hashCode,
  hashSessionToken,
  normalizeCode,
  normalizeDisplayName,
  verifyCode,
} from "@/lib/security";
import { ensureRuntimeDir, runtimePath } from "@/lib/runtime-paths";
import type {
  AuthLoginPayload,
  AuthLoginResponse,
  AuthMeResponse,
  CandidateRecord,
  CandidateRegistry,
  CandidateSummary,
  ExamLevel,
  SessionRecord,
} from "@/lib/types";

const SESSION_TTL_SEC = 30 * 24 * 60 * 60;

export class AuthError extends Error {}
export class AuthorizationError extends Error {}

function authDir() {
  return ensureRuntimeDir("auth");
}

function registryPath() {
  return runtimePath("auth", "registry.json");
}

function sessionsDir() {
  const dir = join(authDir(), "sessions");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function sessionPath(tokenHash: string) {
  return join(sessionsDir(), `${tokenHash}.json`);
}

export function loadRegistry(): CandidateRegistry {
  const filePath = registryPath();
  if (!existsSync(filePath)) {
    return { candidates: [] };
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as CandidateRegistry;
}

export function saveRegistry(registry: CandidateRegistry) {
  const filePath = registryPath();
  const parent = dirname(filePath);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(registry, null, 2));
}

export function createCandidateRecord(code: string, maxLevel: number, nowIso: string) {
  const normalizedCode = normalizeCode(code);
  const [animalPrefix] = normalizedCode.split("-");
  const salt = createSalt();

  return {
    candidate_id: randomUUID(),
    code_salt: salt,
    code_hash: hashCode(normalizedCode, salt),
    animal_prefix: animalPrefix || "animal",
    code_length: normalizedCode.length,
    max_level: maxLevel,
    name: null,
    created_at: nowIso,
  } satisfies CandidateRecord;
}

function findCandidateByCode(code: string, registry: CandidateRegistry) {
  const normalizedCode = normalizeCode(code);
  return (
    registry.candidates.find((candidate) =>
      verifyCode(normalizedCode, candidate.code_salt, candidate.code_hash),
    ) ?? null
  );
}

export function getCandidateById(candidateId: string) {
  return loadRegistry().candidates.find((candidate) => candidate.candidate_id === candidateId) ?? null;
}

function isDuplicateName(name: string, registry: CandidateRegistry, candidateId: string) {
  return registry.candidates.some(
    (candidate) =>
      candidate.candidate_id !== candidateId &&
      candidate.name !== null &&
      candidate.name.toLowerCase() === name.toLowerCase(),
  );
}

function buildCandidateSummary(candidate: CandidateRecord): CandidateSummary {
  const passedLevels = LEVELS.filter((level) =>
    didPassLevel(getFinalSubmission(candidate.candidate_id, level)),
  );
  const finalizedLevels = LEVELS.filter((level) =>
    getFinalSubmission(candidate.candidate_id, level) !== null,
  );
  const unlockedByMaxLevel = unlockedLevelsFromMaxLevel(candidate.max_level);
  const unlockedLevels = unlockedByMaxLevel.filter((level) => {
    const prev = previousLevel(level);
    return prev ? passedLevels.includes(prev) : true;
  });

  return {
    candidate_id: candidate.candidate_id,
    name: candidate.name,
    max_level: candidate.max_level,
    unlocked_levels: unlockedLevels,
    passed_levels: passedLevels,
    finalized_levels: finalizedLevels,
  };
}

function createStoredSession(candidateId: string, nowMs: number) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const record: SessionRecord = {
    session_id: randomUUID(),
    token_hash: tokenHash,
    candidate_id: candidateId,
    created_at: new Date(nowMs).toISOString(),
    expires_at: new Date(nowMs + SESSION_TTL_SEC * 1000).toISOString(),
  };

  writeFileSync(sessionPath(tokenHash), JSON.stringify(record, null, 2));
  return token;
}

export function loginWithCode(
  payload: AuthLoginPayload,
  nowMs = Date.now(),
): AuthLoginResponse {
  if (!payload.code || typeof payload.code !== "string") {
    throw new AuthError("code is required.");
  }

  const registry = loadRegistry();
  const candidate = findCandidateByCode(payload.code, registry);

  if (!candidate) {
    throw new AuthError("Invalid code.");
  }

  if (!candidate.name) {
    const proposedName = normalizeDisplayName(payload.name ?? "");
    if (!proposedName) {
      throw new AuthError("Name is required for first-time activation.");
    }
    if (isDuplicateName(proposedName, registry, candidate.candidate_id)) {
      throw new AuthError("This name is already taken. Please choose another one.");
    }
    candidate.name = proposedName;
    saveRegistry(registry);
  }

  return {
    session_token: createStoredSession(candidate.candidate_id, nowMs),
    candidate: buildCandidateSummary(candidate),
  };
}

function loadSessionByToken(token: string) {
  if (!token) {
    return null;
  }

  const filePath = sessionPath(hashSessionToken(token));
  if (!existsSync(filePath)) {
    return null;
  }

  const record = JSON.parse(readFileSync(filePath, "utf8")) as SessionRecord;
  if (Date.now() > new Date(record.expires_at).getTime()) {
    unlinkSync(filePath);
    return null;
  }
  return record;
}

export function getCandidateSummaryFromToken(token: string) {
  const session = loadSessionByToken(token);
  if (!session) {
    throw new AuthorizationError("Invalid or expired session token.");
  }

  const candidate = getCandidateById(session.candidate_id);
  if (!candidate) {
    throw new AuthorizationError("Unknown candidate session.");
  }

  return buildCandidateSummary(candidate);
}

export function getAuthMeResponse(token: string): AuthMeResponse {
  return {
    candidate: getCandidateSummaryFromToken(token),
  };
}

export function ensureLevelAccess(token: string, level: ExamLevel) {
  const candidate = getCandidateSummaryFromToken(token);
  if (!candidate.unlocked_levels.includes(level)) {
    throw new AuthorizationError(`Access to ${level} is not unlocked for this candidate.`);
  }
  return candidate;
}

export function listActiveSessions() {
  return readdirSync(sessionsDir())
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      JSON.parse(readFileSync(join(sessionsDir(), file), "utf8")) as SessionRecord,
    );
}
