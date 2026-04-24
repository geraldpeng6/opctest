import type { ExamLevel } from "@/lib/types";

export const LEVELS: ExamLevel[] = ["level-1", "level-2"];
export const PASS_RATIO = 0.6;

export function levelNumber(level: ExamLevel) {
  return Number(level.replace("level-", ""));
}

export function unlockedLevelsFromMaxLevel(maxLevel: number) {
  return LEVELS.filter((level) => levelNumber(level) <= maxLevel);
}

export function previousLevel(level: ExamLevel): ExamLevel | null {
  const index = LEVELS.indexOf(level);
  return index > 0 ? LEVELS[index - 1] ?? null : null;
}
