import type { SearchResult } from "@/lib/types";

const searchIndex: SearchResult[] = [
  {
    query: "蓝港",
    title: "蓝港档案",
    href: "/materials/archive/blue-harbor-note",
    description: "包含蓝港档案码的归档条目。",
  },
];

export function findSearchResults(rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return searchIndex.filter((entry) => entry.query === query);
}
