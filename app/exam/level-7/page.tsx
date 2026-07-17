import { ExamClient } from "@/components/exam-client";
import { getLevelDefinition } from "@/lib/levels";

export default function Level7ExamPage() {
  const level = getLevelDefinition("level-7")!;

  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">{level.shortTitle}</span>
        <h1 className="display">{level.category}</h1>
        <p className="lede">{level.focus}</p>
      </section>
      <ExamClient level="level-7" />
    </main>
  );
}
