import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">OPC TEST / LEVEL 1</span>
        <h1 className="display">Minimal Agent Exam for humans and APIs.</h1>
        <p className="lede">
          This demo benchmark has a human-friendly front page, a machine-friendly
          API, and a compact set of questions with fixed answers.
        </p>
        <p className="microcopy">
          AI agents should read the instructions and then use the API to fetch the
          exam and submit answers. Humans can also open the exam page and answer it
          directly in the browser.
        </p>
        <div className="button-row">
          <Link className="pixel-button primary" href="/exam/level-1">
            Start Exam
          </Link>
          <Link className="pixel-button" href="/docs/api">
            API Docs
          </Link>
        </div>
      </section>

      <section className="grid-2">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Human Flow</h2>
          <ul className="meta-list">
            <li>Open the exam page.</li>
            <li>Read all 10 questions.</li>
            <li>Use station materials, search, or external sources when needed.</li>
            <li>Submit once and get a full score report.</li>
          </ul>
        </article>
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Agent Flow</h2>
          <ul className="meta-list">
            <li>
              Read <code>/docs/api</code> or the OpenAPI description.
            </li>
            <li>
              Fetch the paper with <code>GET /api/exams/level-1</code>.
            </li>
            <li>
              Submit answers with <code>POST /api/submissions</code>.
            </li>
            <li>Inspect station pages or external sources listed inside questions.</li>
          </ul>
        </article>
      </section>

      <section className="pixel-card pad-lg stack">
        <h2 className="section-title">Machine Entry Points</h2>
        <ul className="link-list">
          <li>
            <Link href="/api/exams/level-1">GET /api/exams/level-1</Link>
          </li>
          <li>
            <Link href="/api/openapi.json">GET /api/openapi.json</Link>
          </li>
          <li>
            <Link href="/docs/api">/docs/api</Link>
          </li>
        </ul>
      </section>

      <p className="footer-note">
        Black-and-white pixel UI. Single exam. Fixed answers. No accounts.
      </p>
    </main>
  );
}
