"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SESSION_STORAGE_KEY } from "@/lib/session";
import { LEVEL_DEFINITIONS, levelCategory, levelFocus, levelLabel } from "@/lib/levels";
import type {
  AuthLoginResponse,
  AuthMeResponse,
  CandidateSummary,
  ExamLevel,
  LeaderboardsResponse,
} from "@/lib/types";

const LADDER_LEVELS: ExamLevel[] = LEVEL_DEFINITIONS.map((definition) => definition.level);
const LADDER_PAGE_SIZE = 10;

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function podiumOrder(entries: LeaderboardsResponse["overall_top3"]) {
  const second = entries.find((entry) => entry.rank === 2) ?? null;
  const first = entries.find((entry) => entry.rank === 1) ?? null;
  const third = entries.find((entry) => entry.rank === 3) ?? null;
  return [second, first, third];
}

export function HomeClient() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState<string>("");
  const [candidate, setCandidate] = useState<CandidateSummary | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardsResponse | null>(null);
  const [ladderPages, setLadderPages] = useState<Partial<Record<ExamLevel, number>>>({});
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "";
    if (stored) {
      setToken(stored);
      return;
    }

    setBooting(false);
  }, []);

  useEffect(() => {
    const loadLeaderboards = async () => {
      const response = await fetch("/api/leaderboards", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      setLeaderboards((await response.json()) as LeaderboardsResponse);
    };

    void loadLeaderboards();
  }, []);

  useEffect(() => {
    if (!token) {
      setCandidate(null);
      setBooting(false);
      return;
    }

    const loadMe = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setToken("");
          setCandidate(null);
          setBooting(false);
          return;
        }

        const payload = (await response.json()) as AuthMeResponse;
        setCandidate(payload.candidate);
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setToken("");
        setCandidate(null);
      } finally {
        setBooting(false);
      }
    };

    void loadMe();
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", !candidate);

    return () => {
      document.body.classList.remove("overlay-open");
    };
  }, [candidate]);

  const login = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const payload = (await response.json()) as AuthLoginResponse | { error: string };
      if (!response.ok) {
        setError("error" in payload ? payload.error : "登录失败。");
        return;
      }

      const auth = payload as AuthLoginResponse;
      window.localStorage.setItem(SESSION_STORAGE_KEY, auth.session_token);
      setToken(auth.session_token);
      setCandidate(auth.candidate);
      setName("");
    } catch {
      setError("登录时网络异常。");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken("");
    setCandidate(null);
  };

  const setLadderPage = (level: ExamLevel, page: number) => {
    setLadderPages((current) => ({
      ...current,
      [level]: Math.max(1, page),
    }));
  };

  return (
    <section className="stack">
      {leaderboards ? (
        <article className="pixel-card pad-lg stack">
          <div className="podium-heading">
            <h2 className="section-title">总榜</h2>
          </div>
          {leaderboards.overall_top3.length === 0 ? (
            <div className="podium-empty">
              <p className="muted">暂无成绩</p>
            </div>
          ) : (
            <div className="podium-grid">
              {podiumOrder(leaderboards.overall_top3).map((entry, index) => {
                const slot = [2, 1, 3][index]!;

                if (!entry) {
                  return (
                    <div className={`podium-slot podium-slot--${slot} podium-slot--empty`} key={`empty-${slot}`}>
                      <div className="podium-card">
                        <p className="podium-rank">#{slot}</p>
                        <p className="podium-name">空</p>
                      </div>
                      <div className="podium-step" />
                    </div>
                  );
                }

                return (
                  <div className={`podium-slot podium-slot--${slot}`} key={`${entry.rank}-${entry.name}`}>
                    <div className="podium-card">
                      <p className="podium-rank">#{entry.rank}</p>
                      <p className="podium-name">{entry.name}</p>
                      <p className="podium-detail">
                        {entry.total_score} / {entry.total_possible}
                      </p>
                      <p className="podium-detail">{formatDuration(entry.total_duration_sec)}</p>
                    </div>
                    <div className="podium-step">
                      <span>{entry.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      ) : null}

      {!candidate ? (
        <section className="entry-overlay" aria-modal="true" role="dialog">
          <div className="entry-overlay__scrim" />
          <article className="pixel-card entry-panel">
            <h2 className="display entry-panel__title">进入评测</h2>
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                void login();
              }}
            >
              <label className="entry-field">
                <span className="stat-label">昵称</span>
                <input
                  autoComplete="nickname"
                  className="answer-input entry-input"
                  name="nickname"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="输入昵称"
                  type="text"
                  value={name}
                />
              </label>
              <div className="button-row">
                <button className="pixel-button primary" disabled={loading || booting} type="submit">
                  {booting ? "检查中" : loading ? "进入中" : "进入"}
                </button>
              </div>
            </form>
            {error ? <p className="entry-error">{error}</p> : null}
          </article>
        </section>
      ) : null}

      {candidate ? (
        <article className="pixel-card pad-lg stack console-panel">
          <div className="console-heading">
            <h1 className="display">开始</h1>
            <p className="muted">{candidate.name}</p>
          </div>
          <div className="stat-grid">
            <div className="stat">
              <p className="stat-label">已解锁</p>
              <p className="stat-value">{candidate.unlocked_levels.map(levelLabel).join("、") || "无"}</p>
            </div>
            <div className="stat">
              <p className="stat-label">已通过</p>
              <p className="stat-value">{candidate.passed_levels.map(levelLabel).join("、") || "无"}</p>
            </div>
            <div className="stat">
              <p className="stat-label">已定稿</p>
              <p className="stat-value">{candidate.finalized_levels.map(levelLabel).join("、") || "无"}</p>
            </div>
          </div>
          <div className="button-row">
            {candidate.unlocked_levels.map((level, index) => (
              <Link
                className={`pixel-button${index === 0 ? " primary" : ""}`}
                href={`/exam/${level}`}
                key={level}
              >
                {levelLabel(level)}：{levelCategory(level)}
              </Link>
            ))}
            <button className="pixel-button" onClick={logout} type="button">
              退出
            </button>
          </div>
        </article>
      ) : null}

      {leaderboards ? (
        <section className="grid-2">
          {LADDER_LEVELS.map((level) => {
            const rows = leaderboards.by_level[level] ?? [];
            const totalPages = Math.max(1, Math.ceil(rows.length / LADDER_PAGE_SIZE));
            const currentPage = Math.min(ladderPages[level] ?? 1, totalPages);
            const startIndex = (currentPage - 1) * LADDER_PAGE_SIZE;
            const visibleRows = rows.slice(startIndex, startIndex + LADDER_PAGE_SIZE);
            const firstVisible = rows.length === 0 ? 0 : startIndex + 1;
            const lastVisible = Math.min(startIndex + visibleRows.length, rows.length);

            return (
              <article className="pixel-card pad-lg stack" key={level}>
                <div className="ladder-header">
                  <h2 className="section-title">{levelLabel(level)}</h2>
                  <p className="muted">{levelCategory(level)}</p>
                  <p className="microcopy">{levelFocus(level)}</p>
                  <p className="muted">
                    {rows.length === 0
                      ? "暂无"
                      : `${firstVisible}-${lastVisible} / ${rows.length}`}
                  </p>
                </div>
                {rows.length === 0 ? (
                  <p className="muted">暂无成绩</p>
                ) : (
                  <>
                    <ul className="result-list">
                      {visibleRows.map((entry) => (
                        <li className="result-item" key={`${level}-${entry.rank}-${entry.name}`}>
                          <p className="result-row">
                            <strong>#{entry.rank}</strong> {entry.name}
                          </p>
                          <p className="result-row">
                            得分：{entry.score} / {entry.total}
                          </p>
                          <p className="result-row">
                            用时：{formatDuration(entry.duration_sec)} / 加权分：{" "}
                            {entry.weighted_score}
                          </p>
                        </li>
                      ))}
                    </ul>
                    {totalPages > 1 ? (
                      <div className="pager-row">
                        <button
                          className="pixel-button pager-button"
                          disabled={currentPage <= 1}
                          onClick={() => setLadderPage(level, currentPage - 1)}
                          type="button"
                        >
                          上一页
                        </button>
                        <span className="pager-status">
                          第 {currentPage} / {totalPages} 页
                        </span>
                        <button
                          className="pixel-button pager-button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setLadderPage(level, currentPage + 1)}
                          type="button"
                        >
                          下一页
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </section>
      ) : null}
    </section>
  );
}
