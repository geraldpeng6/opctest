import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";

import { getFinalSubmission, didPassLevel } from "@/lib/results";
import { LEVELS, previousLevel, unlockedLevelsFromMaxLevel } from "@/lib/levels";
import {
  createSessionToken,
  hashSessionToken,
  normalizeNickname,
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

export function createCandidateRecord(name: string, maxLevel: number, nowIso: string) {
  return {
    candidate_id: randomUUID(),
    max_level: maxLevel,
    name,
    created_at: nowIso,
  } satisfies CandidateRecord;
}

export function getCandidateById(candidateId: string) {
  return loadRegistry().candidates.find((candidate) => candidate.candidate_id === candidateId) ?? null;
}

function findCandidateByName(name: string, registry: CandidateRegistry) {
  const normalizedName = name.toLowerCase();
  return (
    registry.candidates.find(
      (candidate) => candidate.name?.toLowerCase() === normalizedName,
    ) ?? null
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

export function loginWithName(
  payload: AuthLoginPayload,
  nowMs = Date.now(),
): AuthLoginResponse {
  const nickname = normalizeNickname(payload.name ?? "");
  if (!nickname) {
    throw new AuthError("必须填写昵称。");
  }

  const registry = loadRegistry();
  let candidate = findCandidateByName(nickname, registry);

  if (!candidate) {
    candidate = createCandidateRecord(nickname, LEVELS.length, new Date(nowMs).toISOString());
    registry.candidates.push(candidate);
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
    throw new AuthorizationError("会话令牌无效或已过期。");
  }

  const candidate = getCandidateById(session.candidate_id);
  if (!candidate) {
    throw new AuthorizationError("找不到该考生会话。");
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
    throw new AuthorizationError(`该考生尚未解锁 ${level}。`);
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
