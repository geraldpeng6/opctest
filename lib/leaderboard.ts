import { getAllFinalSubmissions } from "@/lib/results";
import { LEVELS } from "@/lib/levels";
import type {
  ExamLevel,
  LeaderboardEntry,
  LeaderboardsResponse,
  OverallLeaderboardEntry,
} from "@/lib/types";

function weightedScore(score: number, durationSec: number) {
  return score * 100000 - durationSec;
}

export function getLeaderboards(): LeaderboardsResponse {
  const finals = getAllFinalSubmissions();

  const byLevel = Object.fromEntries(
    LEVELS.map((level) => {
      const rows = finals
        .filter((record) => record.level === level && record.candidate_name)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }
          if (left.duration_sec !== right.duration_sec) {
            return left.duration_sec - right.duration_sec;
          }
          return left.submitted_at.localeCompare(right.submitted_at);
        })
        .map((record, index) => ({
          rank: index + 1,
          name: record.candidate_name ?? "Anonymous",
          level: level as ExamLevel,
          score: record.score,
          total: record.total,
          duration_sec: record.duration_sec,
          weighted_score: weightedScore(record.score, record.duration_sec),
          submitted_at: record.submitted_at,
        })) satisfies LeaderboardEntry[];

      return [level, rows];
    }),
  ) as Record<ExamLevel, LeaderboardEntry[]>;

  const overall = new Map<
    string,
    {
      name: string;
      total_score: number;
      total_possible: number;
      total_duration_sec: number;
      weighted_score: number;
    }
  >();

  finals
    .filter((record) => record.candidate_name)
    .forEach((record) => {
      const entry = overall.get(record.candidate_id) ?? {
        name: record.candidate_name ?? "Anonymous",
        total_score: 0,
        total_possible: 0,
        total_duration_sec: 0,
        weighted_score: 0,
      };

      entry.total_score += record.score;
      entry.total_possible += record.total;
      entry.total_duration_sec += record.duration_sec;
      entry.weighted_score += weightedScore(record.score, record.duration_sec);
      overall.set(record.candidate_id, entry);
    });

  const overallTop3: OverallLeaderboardEntry[] = [...overall.values()]
    .sort((left, right) => {
      if (right.total_score !== left.total_score) {
        return right.total_score - left.total_score;
      }
      if (right.weighted_score !== left.weighted_score) {
        return right.weighted_score - left.weighted_score;
      }
      return left.total_duration_sec - right.total_duration_sec;
    })
    .slice(0, 3)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

  return {
    overall_top3: overallTop3,
    by_level: byLevel,
  };
}
