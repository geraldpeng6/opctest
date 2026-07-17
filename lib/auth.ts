import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

import {
  deleteD1Record,
  getD1Record,
  hasD1Database,
  listD1Records,
  putD1Record,
} from "@/lib/d1-records";
import { LEVELS, previousLevel, unlockedLevelsFromMaxLevel } from "@/lib/levels";
import { getFinalSubmission, didPassLevel } from "@/lib/results";
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

function candidateKey(name: string) {
  return name.toLowerCase();
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

export async function getCandidateById(candidateId: string) {
  if (hasD1Database()) {
    // ponytail: linear scan is enough for this small benchmark; add an indexed candidate table if volume grows.
    const candidates = await listD1Records<CandidateRecord>("candidate");
    return candidates.find((candidate) => candidate.candidate_id === candidateId) ?? null;
  }
  return loadRegistry().candidates.find((candidate) => candidate.candidate_id === candidateId) ?? null;
}

function findCandidateByName(name: string, registry: CandidateRegistry) {
  const normalizedName = candidateKey(name);
  return (
    registry.candidates.find(
      (candidate) => candidate.name?.toLowerCase() === normalizedName,
    ) ?? null
  );
}

async function buildCandidateSummary(candidate: CandidateRecord): Promise<CandidateSummary> {
  const finals = await Promise.all(
    LEVELS.map((level) => getFinalSubmission(candidate.candidate_id, level)),
  );
  const passedLevels = LEVELS.filter((_, index) => didPassLevel(finals[index]));
  const finalizedLevels = LEVELS.filter((_, index) => finals[index] !== null);
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

async function createStoredSession(candidateId: string, nowMs: number) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const record: SessionRecord = {
    session_id: randomUUID(),
    token_hash: tokenHash,
    candidate_id: candidateId,
    created_at: new Date(nowMs).toISOString(),
    expires_at: new Date(nowMs + SESSION_TTL_SEC * 1000).toISOString(),
  };

  if (hasD1Database()) {
    await putD1Record("session", tokenHash, record);
  } else {
    writeFileSync(sessionPath(tokenHash), JSON.stringify(record, null, 2));
  }
  return token;
}

export async function loginWithName(
  payload: AuthLoginPayload,
  nowMs = Date.now(),
): Promise<AuthLoginResponse> {
  const nickname = normalizeNickname(payload.name ?? "");
  if (!nickname) {
    throw new AuthError("必须填写昵称。");
  }

  let candidate: CandidateRecord | null;
  if (hasD1Database()) {
    const key = candidateKey(nickname);
    candidate = await getD1Record<CandidateRecord>("candidate", key);
    if (!candidate) {
      const proposed = createCandidateRecord(
        nickname,
        LEVELS.length,
        new Date(nowMs).toISOString(),
      );
      await putD1Record("candidate", key, proposed, true);
      candidate = await getD1Record<CandidateRecord>("candidate", key);
    }
  } else {
    const registry = loadRegistry();
    candidate = findCandidateByName(nickname, registry);
    if (!candidate) {
      candidate = createCandidateRecord(
        nickname,
        LEVELS.length,
        new Date(nowMs).toISOString(),
      );
      registry.candidates.push(candidate);
      saveRegistry(registry);
    }
  }

  if (!candidate) {
    throw new Error("无法创建考生记录。");
  }

  return {
    session_token: await createStoredSession(candidate.candidate_id, nowMs),
    candidate: await buildCandidateSummary(candidate),
  };
}

async function loadSessionByToken(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  let record: SessionRecord | null;
  if (hasD1Database()) {
    record = await getD1Record<SessionRecord>("session", tokenHash);
  } else {
    const filePath = sessionPath(tokenHash);
    if (!existsSync(filePath)) {
      return null;
    }
    record = JSON.parse(readFileSync(filePath, "utf8")) as SessionRecord;
  }

  if (!record) {
    return null;
  }
  if (Date.now() > new Date(record.expires_at).getTime()) {
    if (hasD1Database()) {
      await deleteD1Record("session", tokenHash);
    } else {
      unlinkSync(sessionPath(tokenHash));
    }
    return null;
  }
  return record;
}

export async function getCandidateSummaryFromToken(token: string) {
  const session = await loadSessionByToken(token);
  if (!session) {
    throw new AuthorizationError("会话令牌无效或已过期。");
  }

  const candidate = await getCandidateById(session.candidate_id);
  if (!candidate) {
    throw new AuthorizationError("找不到该考生会话。");
  }

  return buildCandidateSummary(candidate);
}

export async function getAuthMeResponse(token: string): Promise<AuthMeResponse> {
  return {
    candidate: await getCandidateSummaryFromToken(token),
  };
}

export async function ensureLevelAccess(token: string, level: ExamLevel) {
  const candidate = await getCandidateSummaryFromToken(token);
  if (!candidate.unlocked_levels.includes(level)) {
    throw new AuthorizationError(`该考生尚未解锁 ${level}。`);
  }
  return candidate;
}

export async function listActiveSessions() {
  if (hasD1Database()) {
    return listD1Records<SessionRecord>("session");
  }
  return readdirSync(sessionsDir())
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      JSON.parse(readFileSync(join(sessionsDir(), file), "utf8")) as SessionRecord,
    );
}
