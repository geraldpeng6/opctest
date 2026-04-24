"use client";

import { useMemo, useState } from "react";

import type { PublicExam, Question, SubmissionResponse } from "@/lib/types";

type AnswersState = Record<string, string>;

function renderQuestionLinks(question: Question) {
  const links = [
    ...(question.materials ?? []).map((href) => ({ label: `Material: ${href}`, href })),
    ...(question.source_urls ?? []).map((href) => ({ label: `Source: ${href}`, href })),
  ];

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="question-links">
      {links.map((link) => (
        <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
          {link.label}
        </a>
      ))}
    </div>
  );
}

function questionTypeLabel(question: Question) {
  switch (question.type) {
    case "single_choice":
      return "choice";
    case "integer":
      return "integer";
    case "date_yyyymmdd":
      return "date";
    default:
      return "text";
  }
}

export function ExamClient({ exam }: { exam: PublicExam }) {
  const [answers, setAnswers] = useState<AnswersState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResponse | null>(null);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers],
  );

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(exam.submit_url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          answers,
        }),
      });

      const body = (await response.json()) as SubmissionResponse | { error: string };

      if (!response.ok) {
        setError("error" in body ? body.error : "Submission failed.");
        setResult(null);
        return;
      }

      setResult(body as SubmissionResponse);
    } catch {
      setError("Network error while submitting the answer sheet.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <article className="pixel-card pad-lg stack">
        <h2 className="section-title">Answer Sheet</h2>
        <div className="stat-grid">
          <div className="stat">
            <p className="stat-label">Questions</p>
            <p className="stat-value">{exam.questions.length}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Answered</p>
            <p className="stat-value">{answeredCount}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Submit URL</p>
            <p className="stat-value">{exam.submit_url}</p>
          </div>
        </div>
      </article>

      {exam.questions.map((question, index) => (
        <article className="pixel-card pad-lg question-card" key={question.id}>
          <div className="question-header">
            <span className="question-number">Q{String(index + 1).padStart(2, "0")}</span>
            <span className="pill">{questionTypeLabel(question)}</span>
          </div>

          <div className="stack">
            <p className="lede">{question.prompt}</p>
            {question.answer_format_hint ? (
              <p className="microcopy">Answer format: {question.answer_format_hint}</p>
            ) : null}
            {question.verified_at ? (
              <p className="microcopy">External source verified at: {question.verified_at}</p>
            ) : null}
          </div>

          {renderQuestionLinks(question)}

          {question.type === "single_choice" ? (
            <div className="options-grid">
              {question.options?.map((option, optionIndex) => {
                const choice = String.fromCharCode(65 + optionIndex);
                const selected = (answers[question.id] ?? "").trim().toUpperCase() === choice;

                return (
                  <button
                    className={`option-button${selected ? " selected" : ""}`}
                    key={choice}
                    onClick={() => updateAnswer(question.id, choice)}
                    type="button"
                  >
                    <strong>{choice}</strong>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              className="answer-input"
              onChange={(event) => updateAnswer(question.id, event.target.value)}
              placeholder={question.answer_format_hint ?? "Type your answer"}
              type="text"
              value={answers[question.id] ?? ""}
            />
          )}
        </article>
      ))}

      <article className="pixel-card pad-lg stack">
        <button className="pixel-button primary" disabled={loading} onClick={submit} type="button">
          {loading ? "Submitting..." : "Submit"}
        </button>
        {error ? <p className="muted">{error}</p> : null}
      </article>

      {result ? (
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Score Report</h2>
          <div className="stat-grid">
            <div className="stat">
              <p className="stat-label">Score</p>
              <p className="stat-value">
                {result.score} / {result.total}
              </p>
            </div>
            <div className="stat">
              <p className="stat-label">Accuracy</p>
              <p className="stat-value">{(result.accuracy * 100).toFixed(0)}%</p>
            </div>
          </div>
          <ul className="result-list">
            {result.results.map((entry) => (
              <li
                className={`result-item ${entry.correct ? "correct" : "incorrect"}`}
                key={entry.id}
              >
                <p className="result-row">
                  <strong>{entry.id}</strong> / {entry.correct ? "correct" : "incorrect"}
                </p>
                <p className="result-row">Received: {entry.received || "(blank)"}</p>
                <p className="result-row">Expected: {entry.expected}</p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
