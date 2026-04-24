"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SESSION_STORAGE_KEY } from "@/lib/session";
import type {
  AuthLoginResponse,
  AuthMeResponse,
  CandidateSummary,
  ExamLevel,
  LeaderboardsResponse,
} from "@/lib/types";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function levelLabel(level: ExamLevel) {
  return level === "level-1" ? "Level 1" : "Level 2";
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
  const [code, setCode] = useState("");
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
          code,
          name,
        }),
      });

      const payload = (await response.json()) as AuthLoginResponse | { error: string };
      if (!response.ok) {
        setError("error" in payload ? payload.error : "Login failed.");
        return;
      }

      const auth = payload as AuthLoginResponse;
      window.localStorage.setItem(SESSION_STORAGE_KEY, auth.session_token);
      setToken(auth.session_token);
      setCandidate(auth.candidate);
      setCode("");
      setName("");
    } catch {
      setError("Network error while logging in.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken("");
    setCandidate(null);
  };

  return (
    <section className="stack">
      {leaderboards ? (
        <article className="pixel-card pad-lg stack">
          <div className="podium-heading">
            <h2 className="section-title">Overall Top 3</h2>
            <p className="muted">Ranked by total score first, then weighted time.</p>
          </div>
          {leaderboards.overall_top3.length === 0 ? (
            <div className="podium-empty">
              <p className="muted">No finalized scores yet.</p>
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
                        <p className="podium-name">Vacant</p>
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
            <span className="eyebrow">Entry Gate / Candidate Code</span>
            <h2 className="display entry-panel__title">Unlock the arena with a single code.</h2>
            <p className="lede">
              Enter a pre-issued candidate code to activate this browser session.
              First-time activation also needs a unique display name.
            </p>
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                void login();
              }}
            >
              <label className="entry-field">
                <span className="stat-label">Candidate Code</span>
                <input
                  autoComplete="off"
                  className="answer-input entry-input"
                  name="candidate_code"
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="elephant-xxxxxxxxxxxxxxxxxxxx"
                  type="text"
                  value={code}
                />
              </label>
              <label className="entry-field">
                <span className="stat-label">Display Name</span>
                <input
                  autoComplete="nickname"
                  className="answer-input entry-input"
                  name="display_name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="First activation only"
                  type="text"
                  value={name}
                />
              </label>
              <div className="button-row">
                <button className="pixel-button primary" disabled={loading || booting} type="submit">
                  {booting ? "Checking Session..." : loading ? "Logging In..." : "Enter Arena"}
                </button>
                <Link className="pixel-button" href="/docs/api">
                  API Docs
                </Link>
              </div>
            </form>
            {error ? <p className="entry-error">{error}</p> : null}
          </article>
        </section>
      ) : null}

      {candidate ? (
        <article className="pixel-card pad-lg stack">
          <h2 className="section-title">Candidate Console</h2>
          <p className="lede">
            Logged in as <strong>{candidate.name}</strong>.
          </p>
          <div className="stat-grid">
            <div className="stat">
              <p className="stat-label">Unlocked</p>
              <p className="stat-value">{candidate.unlocked_levels.map(levelLabel).join(", ") || "None"}</p>
            </div>
            <div className="stat">
              <p className="stat-label">Passed</p>
              <p className="stat-value">{candidate.passed_levels.map(levelLabel).join(", ") || "None"}</p>
            </div>
            <div className="stat">
              <p className="stat-label">Finalized</p>
              <p className="stat-value">{candidate.finalized_levels.map(levelLabel).join(", ") || "None"}</p>
            </div>
          </div>
          <div className="button-row">
            <Link className="pixel-button primary" href="/exam/level-1">
              Enter Level 1
            </Link>
            <Link className="pixel-button" href="/exam/level-2">
              Enter Level 2
            </Link>
            <button className="pixel-button" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </article>
      ) : null}

      {leaderboards ? (
        <section className="grid-2">
          {(["level-1", "level-2"] as ExamLevel[]).map((level) => (
            <article className="pixel-card pad-lg stack" key={level}>
              <h2 className="section-title">{levelLabel(level)} Ladder</h2>
              {leaderboards.by_level[level].length === 0 ? (
                <p className="muted">No finalized scores yet.</p>
              ) : (
                <ul className="result-list">
                  {leaderboards.by_level[level].slice(0, 10).map((entry) => (
                    <li className="result-item" key={`${level}-${entry.rank}-${entry.name}`}>
                      <p className="result-row">
                        <strong>#{entry.rank}</strong> {entry.name}
                      </p>
                      <p className="result-row">
                        Score: {entry.score} / {entry.total}
                      </p>
                      <p className="result-row">
                        Time: {formatDuration(entry.duration_sec)} / Weighted:{" "}
                        {entry.weighted_score}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      ) : null}
    </section>
  );
}
