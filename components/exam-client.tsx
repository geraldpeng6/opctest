"use client";

import { useEffect, useMemo, useState } from "react";

import { SESSION_STORAGE_KEY } from "@/lib/session";
import type { ExamLevel, PublicExam, Question, SubmissionResponse } from "@/lib/types";

type AnswersState = Record<string, string>;

function renderQuestionLinks(question: Question) {
  const links = [
    ...(question.materials ?? []).map((href, index) => ({ label: `资料 ${index + 1}`, href })),
    ...(question.source_urls ?? []).map((href, index) => ({ label: `来源 ${index + 1}`, href })),
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
      return "选择";
    case "multiple_choice":
      return "多选";
    case "ordered_list":
      return "排序";
    case "integer":
      return "整数";
    case "decimal":
      return "小数";
    case "date_yyyymmdd":
      return "日期";
    case "json_object":
      return "JSON";
    case "code_patch":
      return "补丁";
    default:
      return "文本";
  }
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function submissionStatusLabel(status: SubmissionResponse["status"]) {
  return status === "submitted" ? "已提交" : "超时缺考";
}

export function ExamClient({ level }: { level: ExamLevel }) {
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
        setError("请先回到首页，填写昵称进入。");
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

          setError("error" in body ? body.error : "试卷加载失败。");
          return;
        }

        if (!cancelled) {
          setExam(body as PublicExam);
        }
      } catch {
        if (!cancelled) {
          setError("拉取试卷时网络异常。");
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

  const toggleMultiChoiceAnswer = (id: string, choice: string) => {
    setAnswers((current) => {
      const selected = new Set(
        (current[id] ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      );

      if (selected.has(choice)) {
        selected.delete(choice);
      } else {
        selected.add(choice);
      }

      return {
        ...current,
        [id]: [...selected].sort().join(","),
      };
    });
  };

  const submit = async () => {
    if (!exam?.attempt_id) {
      setError("当前答题记录尚未就绪。");
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
        setError("error" in body ? body.error : "提交失败。");
        setResult(null);
        return;
      }

      setResult(body as SubmissionResponse);
    } catch {
      setError("提交答卷时网络异常。");
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
          <h2 className="section-title">加载中</h2>
        </article>
      </section>
    );
  }

  if (!exam) {
    return (
      <section className="stack">
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">无法进入</h2>
          <p className="lede">{error ?? "无法加载当前答题记录。"}</p>
        </article>
        {result ? (
          <article className="pixel-card pad-lg stack">
            <h2 className="section-title">最终结果</h2>
            <div className="stat-grid">
              <div className="stat">
                <p className="stat-label">状态</p>
                <p className="stat-value">{submissionStatusLabel(result.status)}</p>
              </div>
              <div className="stat">
                <p className="stat-label">得分</p>
                <p className="stat-value">
                  {result.score} / {result.total}
                </p>
              </div>
              <div className="stat">
                <p className="stat-label">答题用时</p>
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
        <h2 className="section-title">答题</h2>
        <div className="stat-grid">
          <div className="stat">
            <p className="stat-label">题目数</p>
            <p className="stat-value">{exam.questions.length}</p>
          </div>
          <div className="stat">
            <p className="stat-label">已作答</p>
            <p className="stat-value">{answeredCount}</p>
          </div>
          <div className="stat">
            <p className="stat-label">考生</p>
            <p className="stat-value">{exam.candidate_name ?? "未知"}</p>
          </div>
          <div className="stat">
            <p className="stat-label">剩余时间</p>
            <p className="stat-value">
              {remainingSec === null ? "--:--" : formatDuration(remainingSec)}
            </p>
          </div>
        </div>
      </article>

      {exam.questions.map((question, index) => (
        <article className="pixel-card pad-lg question-card" key={question.id}>
          <div className="question-header">
            <span className="question-number">第 {String(index + 1).padStart(2, "0")} 题</span>
            <span className="pill">{questionTypeLabel(question)}</span>
          </div>

          <div className="stack">
            <p className="lede">{question.prompt}</p>
            {question.answer_format_hint ? (
              <p className="microcopy">{question.answer_format_hint}</p>
            ) : null}
          </div>

          {renderQuestionLinks(question)}

          {question.type === "single_choice" || question.type === "multiple_choice" ? (
            <div className="options-grid">
              {question.options?.map((option, optionIndex) => {
                const choice = String.fromCharCode(65 + optionIndex);
                const selected =
                  question.type === "multiple_choice"
                    ? (answers[question.id] ?? "")
                        .split(",")
                        .map((item) => item.trim().toUpperCase())
                        .includes(choice)
                    : (answers[question.id] ?? "").trim().toUpperCase() === choice;

                return (
                  <button
                    className={`option-button${selected ? " selected" : ""}`}
                    key={choice}
                    onClick={() => {
                      if (question.type === "multiple_choice") {
                        toggleMultiChoiceAnswer(question.id, choice);
                        return;
                      }

                      updateAnswer(question.id, choice);
                    }}
                    type="button"
                  >
                    <strong>{choice}</strong>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          ) : question.type === "ordered_list" ||
            question.type === "json_object" ||
            question.type === "code_patch" ? (
            <textarea
              className="answer-input answer-textarea"
              onChange={(event) => updateAnswer(question.id, event.target.value)}
              placeholder="输入答案"
              rows={4}
              value={answers[question.id] ?? ""}
            />
          ) : (
            <input
              className="answer-input"
              onChange={(event) => updateAnswer(question.id, event.target.value)}
              placeholder="输入答案"
              type="text"
              value={answers[question.id] ?? ""}
            />
          )}
        </article>
      ))}

      <article className="pixel-card pad-lg stack">
        <button className="pixel-button primary" disabled={loading} onClick={submit} type="button">
          {loading ? "正在提交..." : "提交答卷"}
        </button>
        {error ? <p className="muted">{error}</p> : null}
      </article>

      {result ? (
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">成绩报告</h2>
          <div className="stat-grid">
            <div className="stat">
              <p className="stat-label">状态</p>
              <p className="stat-value">{submissionStatusLabel(result.status)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">得分</p>
              <p className="stat-value">
                {result.score} / {result.total}
              </p>
            </div>
            <div className="stat">
              <p className="stat-label">正确率</p>
              <p className="stat-value">{(result.accuracy * 100).toFixed(0)}%</p>
            </div>
            <div className="stat">
              <p className="stat-label">答题用时</p>
              <p className="stat-value">{formatDuration(result.duration_sec)}</p>
            </div>
          </div>
          <p className="microcopy">
            已记录最终成绩。
          </p>
          <ul className="result-list">
            {result.results.map((entry) => (
              <li
                className={`result-item ${entry.correct ? "correct" : "incorrect"}`}
                key={entry.id}
              >
                <p className="result-row">
                  <strong>{entry.id}</strong> / {entry.correct ? "正确" : "错误"}
                </p>
                <p className="result-row">收到答案：{entry.received || "（空）"}</p>
                <p className="result-row">标准答案：{entry.expected}</p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
