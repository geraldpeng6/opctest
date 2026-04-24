import type { SearchResult } from "@/lib/types";

const searchIndex: SearchResult[] = [
  {
    query: "blue harbor",
    title: "Blue Harbor Note",
    href: "/materials/archive/blue-harbor-note",
    description: "Archive entry containing the code for Blue Harbor.",
  },
];

export function findSearchResults(rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return searchIndex.filter((entry) => entry.query === query);
}
