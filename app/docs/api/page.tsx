import Link from "next/link";

const loginExample = `curl -X POST http://localhost:3000/api/auth/login \\
  -H "content-type: application/json" \\
  -d '{
    "code": "elephant-xxxxxxxxxxxxxxxxxxxx",
    "name": "FirstTimeOnly"
  }'`;

const meExample = `curl -s http://localhost:3000/api/auth/me \\
  -H "authorization: Bearer <session_token>"`;

const getExample = `curl -s http://localhost:3000/api/exams/level-1 \\
  -H "authorization: Bearer <session_token>"`;

const getLevel2Example = `curl -s http://localhost:3000/api/exams/level-2 \\
  -H "authorization: Bearer <session_token>"`;

const submitExample = `curl -X POST http://localhost:3000/api/submissions \\
  -H "content-type: application/json" \\
  -H "authorization: Bearer <session_token>" \\
  -d '{
    "exam_id": "level-1-20260424",
    "attempt_id": "replace-with-attempt-id-from-fetch",
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
          <Link className="pixel-button" href="/">
            Home
          </Link>
        </div>
      </section>

      <section className="grid-2">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">POST /api/auth/login</h2>
          <p className="muted">
            Activates a candidate code and returns a session token. If the code has
            no bound display name yet, a unique name is required.
          </p>
          <div className="code-panel">
            <pre>{loginExample}</pre>
          </div>
        </article>

        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">GET /api/auth/me</h2>
          <p className="muted">
            Validates the cached session token and returns the candidate profile,
            unlocked levels, passed levels, and finalized levels.
          </p>
          <div className="code-panel">
            <pre>{meExample}</pre>
          </div>
        </article>
      </section>

      <section className="grid-2">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">GET /api/exams/level-1</h2>
          <p className="muted">
            Returns the authenticated candidate's active Level 1 paper, or creates
            one if the level is unlocked and not finalized.
          </p>
          <div className="code-panel">
            <pre>{getExample}</pre>
          </div>
        </article>

        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">GET /api/exams/level-2</h2>
          <p className="muted">
            Returns Level 2 only when the candidate has both permission and a pass
            on the previous level.
          </p>
          <div className="code-panel">
            <pre>{getLevel2Example}</pre>
          </div>
        </article>
      </section>

      <section className="pixel-card pad-lg stack">
        <h2 className="section-title">POST /api/submissions</h2>
        <p className="muted">
          Accepts a final answer sheet for a specific authenticated attempt and
          returns score, status, timing, and the result breakdown.
        </p>
        <div className="code-panel">
          <pre>{submitExample}</pre>
        </div>
        <p className="microcopy">
          Each fetched exam gets a unique <code>attempt_id</code>. The timer starts
          when that attempt is created. The default maximum duration is 30 minutes.
          Late submissions are marked absent with a score of 0. Every submission is
          recorded on the server. Each candidate can finalize each level only once.
        </p>
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
