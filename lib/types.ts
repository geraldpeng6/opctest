export type ExamLevel = "level-1" | "level-2";

export type QuestionType =
  | "single_choice"
  | "exact_text"
  | "integer"
  | "date_yyyymmdd";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  materials?: string[];
  source_urls?: string[];
  answer_format_hint?: string;
  verified_at?: string;
}

export interface PublicExam {
  level?: ExamLevel;
  exam_id: string;
  title: string;
  time_limit_sec: number;
  submit_url: string;
  questions: Question[];
  attempt_id?: string;
  started_at?: string;
  expires_at?: string;
  shuffled?: boolean;
  candidate_name?: string;
}

export interface AnswerKey {
  exam_id: string;
  answers: Record<string, string>;
  normalizers: Record<string, QuestionType>;
}

export interface SubmissionPayload {
  exam_id: string;
  attempt_id: string;
  answers: Record<string, string>;
}

export interface SubmissionResult {
  id: string;
  correct: boolean;
  expected: string;
  received: string;
}

export interface SubmissionResponse {
  attempt_id: string;
  exam_id: string;
  status: "submitted" | "absent";
  score: number;
  total: number;
  accuracy: number;
  duration_sec: number;
  started_at: string;
  submitted_at: string;
  expires_at: string;
  record_id: string;
  results: SubmissionResult[];
}

export interface CandidateRecord {
  candidate_id: string;
  code_salt: string;
  code_hash: string;
  animal_prefix: string;
  code_length: number;
  max_level: number;
  name: string | null;
  created_at: string;
}

export interface CandidateRegistry {
  candidates: CandidateRecord[];
}

export interface SessionRecord {
  session_id: string;
  token_hash: string;
  candidate_id: string;
  created_at: string;
  expires_at: string;
}

export interface CandidateSummary {
  candidate_id: string;
  name: string | null;
  max_level: number;
  unlocked_levels: ExamLevel[];
  passed_levels: ExamLevel[];
  finalized_levels: ExamLevel[];
}

export interface AuthLoginPayload {
  code: string;
  name?: string;
}

export interface AuthLoginResponse {
  session_token: string;
  candidate: CandidateSummary;
}

export interface AuthMeResponse {
  candidate: CandidateSummary;
}

export interface StoredAttempt {
  attempt_id: string;
  candidate_id: string;
  candidate_name: string | null;
  level: ExamLevel;
  exam_id: string;
  started_at: string;
  expires_at: string;
  time_limit_sec: number;
  questions: Question[];
  answer_key: Record<string, string>;
  normalizers: Record<string, QuestionType>;
}

export interface SubmissionRecord extends SubmissionResponse {
  candidate_id: string;
  candidate_name: string | null;
  level: ExamLevel;
  answers: Record<string, string>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: ExamLevel;
  score: number;
  total: number;
  duration_sec: number;
  weighted_score: number;
  submitted_at: string;
}

export interface OverallLeaderboardEntry {
  rank: number;
  name: string;
  total_score: number;
  total_possible: number;
  total_duration_sec: number;
  weighted_score: number;
}

export interface LeaderboardsResponse {
  overall_top3: OverallLeaderboardEntry[];
  by_level: Record<ExamLevel, LeaderboardEntry[]>;
}

export type MaterialBlock =
  | {
      type: "text";
      title?: string;
      text: string;
    }
  | {
      type: "ordered";
      title?: string;
      items: string[];
    }
  | {
      type: "keyValue";
      title?: string;
      rows: { label: string; value: string }[];
    }
  | {
      type: "table";
      title?: string;
      columns: string[];
      rows: string[][];
    };

export interface MaterialPage {
  id: string;
  category: string;
  title: string;
  summary?: string;
  slug: string[];
  blocks: MaterialBlock[];
}

export interface SearchResult {
  title: string;
  href: string;
  description: string;
  query: string;
}
