import { ExamClient } from "@/components/exam-client";
import { getLevel2PublicExam } from "@/lib/exams";

export default function Level2ExamPage() {
  const exam = getLevel2PublicExam();

  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">Exam / level-2-20260424</span>
        <h1 className="display">{exam.title}</h1>
        <p className="lede">
          Ten harder questions focused on real web access, cross-page comparison,
          and public-exam-style data analysis.
        </p>
      </section>
      <ExamClient exam={exam} />
    </main>
  );
}
