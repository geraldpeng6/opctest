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
  exam_id: string;
  title: string;
  time_limit_sec: number;
  submit_url: string;
  questions: Question[];
}

export interface AnswerKey {
  exam_id: string;
  answers: Record<string, string>;
  normalizers: Record<string, QuestionType>;
}

export interface SubmissionPayload {
  exam_id: string;
  answers: Record<string, string>;
}

export interface SubmissionResult {
  id: string;
  correct: boolean;
  expected: string;
  received: string;
}

export interface SubmissionResponse {
  exam_id: string;
  score: number;
  total: number;
  accuracy: number;
  results: SubmissionResult[];
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
