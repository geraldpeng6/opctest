import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  getD1Record,
  hasD1Database,
  listD1Records,
  putD1Record,
} from "@/lib/d1-records";
import { PASS_RATIO } from "@/lib/levels";
import { ensureRuntimeDir } from "@/lib/runtime-paths";
import type { ExamLevel, SubmissionRecord } from "@/lib/types";

function finalsDir() {
  return ensureRuntimeDir("records", "finals");
}

function finalRecordKey(candidateId: string, level: ExamLevel) {
  return `${candidateId}__${level}`;
}

function finalRecordPath(candidateId: string, level: ExamLevel) {
  return join(finalsDir(), `${finalRecordKey(candidateId, level)}.json`);
}

export async function getFinalSubmission(candidateId: string, level: ExamLevel) {
  if (hasD1Database()) {
    return getD1Record<SubmissionRecord>("submission", finalRecordKey(candidateId, level));
  }
  const filePath = finalRecordPath(candidateId, level);
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as SubmissionRecord;
}

export async function hasFinalSubmission(candidateId: string, level: ExamLevel) {
  return (await getFinalSubmission(candidateId, level)) !== null;
}

export async function persistFinalLevelSubmission(record: SubmissionRecord) {
  if (hasD1Database()) {
    const inserted = await putD1Record(
      "submission",
      finalRecordKey(record.candidate_id, record.level),
      record,
      true,
    );
    if (!inserted) {
      throw Object.assign(new Error("这一关已经定稿。"), { code: "EEXIST" });
    }
    return;
  }
  writeFileSync(
    finalRecordPath(record.candidate_id, record.level),
    JSON.stringify(record, null, 2),
    { flag: "wx" },
  );
}

export async function getAllFinalSubmissions() {
  if (hasD1Database()) {
    return listD1Records<SubmissionRecord>("submission");
  }
  return readdirSync(finalsDir())
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      JSON.parse(readFileSync(join(finalsDir(), file), "utf8")) as SubmissionRecord,
    );
}

export function didPassLevel(record: SubmissionRecord | null | undefined) {
  if (!record) {
    return false;
  }
  return record.score / Math.max(1, record.total) >= PASS_RATIO;
}
