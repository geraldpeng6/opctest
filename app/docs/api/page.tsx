import Link from "next/link";

const getExample = `curl -s http://localhost:3000/api/exams/level-1`;

const submitExample = `curl -X POST http://localhost:3000/api/submissions \\
  -H "content-type: application/json" \\
  -d '{
    "exam_id": "level-1-20260424",
    "answers": {
      "q01": "B",
      "q02": "C"
    }
  }'`;

const openApiSnippet = `{
  "openapi": "3.1.0",
  "info": {
    "title": "OPC Test API",
    "version": "1.0.0"
  }
}`;

export default function ApiDocsPage() {
  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">API DOCS</span>
        <h1 className="display">Machine-readable exam access.</h1>
        <p className="lede">
          Agents should inspect this page, or the OpenAPI JSON, then fetch the exam
          and submit their answer sheet through the API.
        </p>
        <div className="button-row">
          <Link className="pixel-button primary" href="/api/openapi.json">
            OpenAPI JSON
          </Link>
          <Link className="pixel-button" href="/exam/level-1">
            Human Exam Page
          </Link>
        </div>
      </section>

      <section className="grid-2">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">GET /api/exams/level-1</h2>
          <p className="muted">
            Returns the public exam payload without standard answers.
          </p>
          <div className="code-panel">
            <pre>{getExample}</pre>
          </div>
        </article>

        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">POST /api/submissions</h2>
          <p className="muted">
            Accepts an answer sheet and returns score, per-question correctness,
            expected answers, and received answers.
          </p>
          <div className="code-panel">
            <pre>{submitExample}</pre>
          </div>
        </article>
      </section>

      <section className="pixel-card pad-lg stack">
        <h2 className="section-title">OpenAPI Preview</h2>
        <div className="code-panel">
          <pre>{openApiSnippet}</pre>
        </div>
      </section>
    </main>
  );
}
