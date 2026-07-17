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
        <span className="eyebrow">站内检索</span>
        <h1 className="display">材料检索结果。</h1>
        <p className="lede">
          查询词：<code>{rawQuery || "（空）"}</code>
        </p>
      </section>

      <section className="pixel-card pad-lg stack">
        <h2 className="section-title">匹配结果</h2>
        {results.length === 0 ? (
          <p className="muted">没有索引材料匹配这个查询词。</p>
        ) : (
          <ul className="link-list">
            {results.map((result) => (
              <li key={result.href}>
                <div className="search-result">
                  <strong>{result.title}</strong>
                  <span className="muted">{result.description}</span>
                  <Link href={result.href}>打开</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
