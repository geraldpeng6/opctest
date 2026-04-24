import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PASS_RATIO } from "@/lib/levels";
import { ensureRuntimeDir } from "@/lib/runtime-paths";
import type { ExamLevel, SubmissionRecord } from "@/lib/types";

function finalsDir() {
  return ensureRuntimeDir("records", "finals");
}

function finalRecordPath(candidateId: string, level: ExamLevel) {
  return join(finalsDir(), `${candidateId}__${level}.json`);
}

export function getFinalSubmission(candidateId: string, level: ExamLevel) {
  const filePath = finalRecordPath(candidateId, level);
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as SubmissionRecord;
}

export function hasFinalSubmission(candidateId: string, level: ExamLevel) {
  return existsSync(finalRecordPath(candidateId, level));
}

export function persistFinalLevelSubmission(record: SubmissionRecord) {
  writeFileSync(
    finalRecordPath(record.candidate_id, record.level),
    JSON.stringify(record, null, 2),
    { flag: "wx" },
  );
}

export function getAllFinalSubmissions() {
  return readdirSync(finalsDir())
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      JSON.parse(readFileSync(join(finalsDir(), file), "utf8")) as SubmissionRecord,
    );
}

export function didPassLevel(record: SubmissionRecord | null) {
  if (!record) {
    return false;
  }

  return record.score / Math.max(1, record.total) >= PASS_RATIO;
}
