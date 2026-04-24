import Link from "next/link";

import { findSearchResults } from "@/lib/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q ?? "";
  const results = findSearchResults(rawQuery);

  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">Search</span>
        <h1 className="display">Station search results.</h1>
        <p className="lede">
          Query: <code>{rawQuery || "(empty)"}</code>
        </p>
      </section>

      <section className="pixel-card pad-lg stack">
        <h2 className="section-title">Results</h2>
        {results.length === 0 ? (
          <p className="muted">No indexed materials matched this search query.</p>
        ) : (
          <ul className="link-list">
            {results.map((result) => (
              <li key={result.href}>
                <div className="search-result">
                  <strong>{result.title}</strong>
                  <span className="muted">{result.description}</span>
                  <Link href={result.href}>{result.href}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
