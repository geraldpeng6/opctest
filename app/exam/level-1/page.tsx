import { ExamClient } from "@/components/exam-client";

export default function Level1ExamPage() {
  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">Exam / level-1-20260424</span>
        <h1 className="display">Agent Benchmark Level 1</h1>
        <p className="lede">
          Ten questions. Mixed browsing, logic, and API usage. Submit once to see
          the score report on the same page.
        </p>
      </section>
      <ExamClient level="level-1" />
    </main>
  );
}
