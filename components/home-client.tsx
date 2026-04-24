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

export function HomeClient() {
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
    }
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
      return;
    }

    const loadMe = async () => {
      const response = await fetch("/api/auth/me", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setToken("");
        setCandidate(null);
        return;
      }

      const payload = (await response.json()) as AuthMeResponse;
      setCandidate(payload.candidate);
    };

    void loadMe();
  }, [token]);

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
      <article className="pixel-card pad-lg stack">
        <h2 className="section-title">Entry</h2>
        {!candidate ? (
          <>
            <p className="lede">
              Enter your candidate code. If this code has not claimed a display name
              yet, also provide a unique name.
            </p>
            <div className="stack">
              <input
                className="answer-input"
                onChange={(event) => setCode(event.target.value)}
                placeholder="Candidate code"
                type="text"
                value={code}
              />
              <input
                className="answer-input"
                onChange={(event) => setName(event.target.value)}
                placeholder="Display name (first activation only)"
                type="text"
                value={name}
              />
            </div>
            <div className="button-row">
              <button className="pixel-button primary" disabled={loading} onClick={login} type="button">
                {loading ? "Logging In..." : "Enter Arena"}
              </button>
              <Link className="pixel-button" href="/docs/api">
                API Docs
              </Link>
            </div>
            {error ? <p className="muted">{error}</p> : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </article>

      {leaderboards ? (
        <>
          <article className="pixel-card pad-lg stack">
            <h2 className="section-title">Overall Top 3</h2>
            {leaderboards.overall_top3.length === 0 ? (
              <p className="muted">No finalized scores yet.</p>
            ) : (
              <ul className="result-list">
                {leaderboards.overall_top3.map((entry) => (
                  <li className="result-item" key={`${entry.rank}-${entry.name}`}>
                    <p className="result-row">
                      <strong>#{entry.rank}</strong> {entry.name}
                    </p>
                    <p className="result-row">
                      Score: {entry.total_score} / {entry.total_possible}
                    </p>
                    <p className="result-row">
                      Time: {formatDuration(entry.total_duration_sec)} / Weighted:{" "}
                      {entry.weighted_score}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>

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
        </>
      ) : null}
    </section>
  );
}
