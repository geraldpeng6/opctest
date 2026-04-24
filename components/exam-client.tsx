"use client";

import { useEffect, useMemo, useState } from "react";

import { SESSION_STORAGE_KEY } from "@/lib/session";
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

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ExamClient({ level }: { level: "level-1" | "level-2" }) {
  const [sessionToken, setSessionToken] = useState("");
  const [exam, setExam] = useState<PublicExam | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [loading, setLoading] = useState(false);
  const [loadingExam, setLoadingExam] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResponse | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    setSessionToken(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadExam = async () => {
      if (!sessionToken) {
        setLoadingExam(false);
        setError("Please log in from the homepage with your candidate code first.");
        return;
      }

      setLoadingExam(true);
      setError(null);
      setResult(null);
      setAnswers({});

      try {
        const response = await fetch(`/api/exams/${level}`, {
          cache: "no-store",
          headers: {
            authorization: `Bearer ${sessionToken}`,
          },
        });
        const body = (await response.json()) as
          | PublicExam
          | { error: string; result?: SubmissionResponse | null };

        if (!response.ok) {
          if (response.status === 409 && "result" in body && body.result) {
            setResult(body.result);
            setExam(null);
            setError("error" in body ? body.error : null);
            return;
          }

          setError("error" in body ? body.error : "Failed to load exam.");
          return;
        }

        if (!cancelled) {
          setExam(body as PublicExam);
        }
      } catch {
        if (!cancelled) {
          setError("Network error while fetching the exam.");
        }
      } finally {
        if (!cancelled) {
          setLoadingExam(false);
        }
      }
    };

    void loadExam();

    return () => {
      cancelled = true;
    };
  }, [level, sessionToken]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers],
  );

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const submit = async () => {
    if (!exam?.attempt_id) {
      setError("Exam attempt is not ready yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(exam.submit_url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          attempt_id: exam.attempt_id,
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

  const remainingSec = useMemo(() => {
    if (!exam?.expires_at) {
      return null;
    }

    const diff = Math.floor((new Date(exam.expires_at).getTime() - nowMs) / 1000);
    return Math.max(0, diff);
  }, [exam?.expires_at, nowMs]);

  if (loadingExam) {
    return (
      <section className="stack">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Loading Exam</h2>
          <p className="lede">Generating a randomized paper and starting the timer...</p>
        </article>
      </section>
    );
  }

  if (!exam) {
    return (
      <section className="stack">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Exam Unavailable</h2>
          <p className="lede">{error ?? "Unable to load the exam attempt."}</p>
        </article>
        {result ? (
          <article className="pixel-card pad-lg stack">
            <h2 className="section-title">Final Result</h2>
            <div className="stat-grid">
              <div className="stat">
                <p className="stat-label">Status</p>
                <p className="stat-value">{result.status}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Score</p>
                <p className="stat-value">
                  {result.score} / {result.total}
                </p>
              </div>
              <div className="stat">
                <p className="stat-label">Answer Time</p>
                <p className="stat-value">{formatDuration(result.duration_sec)}</p>
              </div>
            </div>
          </article>
        ) : null}
      </section>
    );
  }

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
          <div className="stat">
            <p className="stat-label">Attempt</p>
            <p className="stat-value">{exam.attempt_id}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Candidate</p>
            <p className="stat-value">{exam.candidate_name ?? "Unknown"}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Time Limit</p>
            <p className="stat-value">{formatDuration(exam.time_limit_sec)}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Time Left</p>
            <p className="stat-value">
              {remainingSec === null ? "--:--" : formatDuration(remainingSec)}
            </p>
          </div>
        </div>
        <p className="microcopy">
          Started at (UTC) {exam.started_at}. Expires at (UTC) {exam.expires_at}.
          Questions and choice options are randomized for each fetched paper.
        </p>
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
              <p className="stat-label">Status</p>
              <p className="stat-value">{result.status}</p>
            </div>
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
            <div className="stat">
              <p className="stat-label">Answer Time</p>
              <p className="stat-value">{formatDuration(result.duration_sec)}</p>
            </div>
          </div>
          <p className="microcopy">
            Attempt {result.attempt_id}. Started at (UTC) {result.started_at}.
            Submitted at (UTC) {result.submitted_at}. Record ID: {result.record_id}.
          </p>
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
