import { ExamClient } from "@/components/exam-client";
import { getLevel1PublicExam } from "@/lib/exams";

export default function Level1ExamPage() {
  const exam = getLevel1PublicExam();

  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">Exam / level-1-20260424</span>
        <h1 className="display">{exam.title}</h1>
        <p className="lede">
          Ten questions. Mixed browsing, logic, and API usage. Submit once to see
          the score report on the same page.
        </p>
      </section>
      <ExamClient exam={exam} />
    </main>
  );
}
