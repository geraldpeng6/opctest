import type { QuestionType } from "@/lib/types";

export function normalizeAnswer(value: string | undefined, type: QuestionType): string {
  const raw = (value ?? "").trim();

  switch (type) {
    case "single_choice":
      return raw.toUpperCase().replace(/\s+/g, "");
    case "integer":
      return raw.replace(/\s+/g, "");
    case "date_yyyymmdd":
      return raw.replace(/\D/g, "");
    case "exact_text":
    default:
      return raw;
  }
}
