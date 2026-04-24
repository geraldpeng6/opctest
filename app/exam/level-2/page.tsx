import { ExamClient } from "@/components/exam-client";

export default function Level2ExamPage() {
  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">Exam / level-2-20260424</span>
        <h1 className="display">Agent Benchmark Level 2</h1>
        <p className="lede">
          Ten harder questions focused on real web access, cross-page comparison,
          and public-exam-style data analysis.
        </p>
      </section>
      <ExamClient level="level-2" />
    </main>
  );
}
