import type { QuestionType } from "@/lib/types";

function splitParts(value: string) {
  return value
    .split(/[\s,;，；、>]+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function stableJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableJson);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableJson(item)]),
    );
  }

  return value;
}

export function normalizeAnswer(value: string | undefined, type: QuestionType): string {
  const raw = (value ?? "").trim();

  switch (type) {
    case "single_choice":
      return raw.toUpperCase().replace(/\s+/g, "");
    case "multiple_choice":
      return [...new Set(splitParts(raw).map((part) => part.toUpperCase()))]
        .sort()
        .join(",");
    case "ordered_list":
      return splitParts(raw)
        .map((part) => part.toUpperCase())
        .join(">");
    case "integer":
      return raw.replace(/\s+/g, "");
    case "decimal": {
      const compact = raw.replace(/\s+/g, "").replace(/。/g, ".");
      const parsed = Number(compact);
      return Number.isFinite(parsed) ? String(parsed) : compact;
    }
    case "date_yyyymmdd":
      return raw.replace(/\D/g, "");
    case "json_object":
      try {
        return JSON.stringify(stableJson(JSON.parse(raw)));
      } catch {
        return raw.replace(/\s+/g, "");
      }
    case "code_patch":
      return raw.toUpperCase().replace(/\s+/g, "");
    case "exact_text":
    default:
      return raw;
  }
}
