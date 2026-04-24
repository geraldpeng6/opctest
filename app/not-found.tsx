import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="pixel-card pad-lg stack">
        <span className="eyebrow">404 / missing page</span>
        <h1 className="display">Nothing loaded here.</h1>
        <p className="lede">
          The requested page does not exist in this exam world. Jump back to the
          homepage or return to the test.
        </p>
        <div className="button-row">
          <Link className="pixel-button primary" href="/">
            Back Home
          </Link>
          <Link className="pixel-button" href="/exam/level-1">
            Open Exam
          </Link>
        </div>
      </section>
    </main>
  );
}
