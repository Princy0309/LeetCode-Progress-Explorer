import React, { useState } from 'react';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest } from '../services/leetcodeApi';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fetchUserDataBundle = async (username) => {
  const [solved, badges, contest] = await Promise.allSettled([
    fetchLeetCodeData(username),
    fetchUserBadges(username),
    fetchUserContest(username),
  ]);

  if (solved.status !== 'fulfilled' || !solved.value) {
    throw new Error(`User "${username}" not found.`);
  }

  return {
    username,
    solved: solved.value,
    badges: badges.status === 'fulfilled' ? badges.value : null,
    contest: contest.status === 'fulfilled' ? contest.value : null,
  };
};

// Returns 1 if a > b, -1 if a < b, 0 if equal
const cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

// ─── Single stat row ──────────────────────────────────────────────────────────
function StatRow({ label, v1, v2, higherIsBetter = true, formatter = (x) => x, darkMode = false }) {
  const winner = higherIsBetter ? cmp(v1, v2) : cmp(v2, v1); // 1=left, -1=right, 0=tie

  return (
    <div className={`cmp-stat-row ${darkMode ? 'text-light' : 'text-dark'}`}>
      <span className={`cmp-stat-val ${winner === 1 ? 'cmp-winner' : winner === 0 ? 'cmp-tie' : 'cmp-loser'}`}>
        {formatter(v1)}
        {winner === 1 && <span className="cmp-crown">👑</span>}
      </span>

      <span className={`cmp-stat-label ${darkMode ? 'text-light-emphasis' : 'text-muted'}`}>
        {label}
      </span>

      <span className={`cmp-stat-val ${winner === -1 ? 'cmp-winner' : winner === 0 ? 'cmp-tie' : 'cmp-loser'}`}>
        {winner === -1 && <span className="cmp-crown">👑</span>}
        {formatter(v2)}
      </span>
    </div>
  );
}

// ─── Horizontal bar for a difficulty ─────────────────────────────────────────
function DiffBar({ label, v1, v2, color, darkMode }) {
  const max = Math.max(v1, v2, 1);
  const pct1 = Math.round((v1 / max) * 100);
  const pct2 = Math.round((v2 / max) * 100);

  return (
    <div className={`cmp-bar-row ${darkMode ? 'text-light' : 'text-dark'}`}>
      <span className={`cmp-bar-val cmp-bar-val--left ${darkMode ? 'text-light' : ''}`}>
        {v1}
      </span>

      <div className={`cmp-bar-track ${darkMode ? 'bg-secondary border border-secondary' : 'bg-light border'}`}>
        <div
          className="cmp-bar-fill cmp-bar-fill--left"
          style={{ width: `${pct1}%`, background: color }}
        />
        <span className={`cmp-bar-label ${darkMode ? 'text-light' : 'text-dark'}`}>
          {label}
        </span>
        <div
          className="cmp-bar-fill cmp-bar-fill--right"
          style={{ width: `${pct2}%`, background: color }}
        />
      </div>

      <span className={`cmp-bar-val cmp-bar-val--right ${darkMode ? 'text-light' : ''}`}>
        {v2}
      </span>
    </div>
  );
}

// ─── Player header card ───────────────────────────────────────────────────────
function PlayerCard({ username, isWinner, darkMode }) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className={`cmp-player-card ${isWinner ? 'cmp-player-card--winner' : ''} ${darkMode ? 'bg-dark border border-secondary text-light' : 'bg-white border border-light text-dark'}`}>
      <div className="cmp-player-avatar">{initials}</div>
      <div className="cmp-player-name">{username}</div>
      {isWinner && <div className="cmp-player-winner-badge">🏆 Winner</div>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ComparePage({ darkMode }) {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) {
      alert('Please enter both usernames.');
      return;
    }

    setLoading(true);
    setError(null);
    setData1(null);
    setData2(null);

    try {
      const [r1, r2] = await Promise.all([
        fetchUserDataBundle(username1.trim()),
        fetchUserDataBundle(username2.trim()),
      ]);

      setData1(r1);
      setData2(r2);
    } catch (err) {
      setError(err.message || 'Failed to fetch comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleCompare();
  };

  // Determine overall winner by total solved + contest rating (weighted)
  let overallWinner = null;
  if (data1 && data2) {
    const score1 =
      (data1.solved.totalSolved || 0) * 3 + (data1.contest?.contestRating || 0) * 0.5;

    const score2 =
      (data2.solved.totalSolved || 0) * 3 + (data2.contest?.contestRating || 0) * 0.5;

    overallWinner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;
  }

  return (
    <div className={`container mt-4 pb-5 ${darkMode ? 'text-light' : 'text-dark'}`}>
      {/* ── Header ── */}
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-1">Compare Profiles</h1>
        <p className={`mb-0 ${darkMode ? 'text-light-emphasis' : 'text-muted'}`}>
          See how two LeetCoders stack up head-to-head
        </p>
      </div>

      {/* ── Input card ── */}
      <div className={`card shadow-sm p-4 mb-4 cmp-input-card ${darkMode ? 'bg-dark border border-secondary text-light' : 'bg-white border border-light text-dark'}`}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className={`form-label small fw-semibold ${darkMode ? 'text-light-emphasis' : 'text-muted'}`}>
              Player 1
            </label>
            <input
              type="text"
              className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
              placeholder="e.g. neal_wu"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="off"
            />
          </div>

          <div className="col-md-2 d-flex justify-content-center align-items-center">
            <div className="cmp-vs-badge">VS</div>
          </div>

          <div className="col-md-5">
            <label className={`form-label small fw-semibold ${darkMode ? 'text-light-emphasis' : 'text-muted'}`}>
              Player 2
            </label>
            <input
              type="text"
              className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
              placeholder="e.g. tourist"
              value={username2}
              onChange={(e) => setUsername2(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn fire-btn px-5 py-2 rounded-pill fw-bold"
            onClick={handleCompare}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Comparing…
              </>
            ) : (
              '⚔️ Compare'
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger text-center mt-3 mb-0">{error}</div>
        )}
      </div>

      {/* ── Results ── */}
      {data1 && data2 && (
        <div className={`cmp-results-card card shadow-sm p-4 ${darkMode ? 'bg-dark border border-secondary text-light' : 'bg-white border border-light text-dark'}`}>
          {/* Overall winner banner */}
          {overallWinner !== 0 && (
            <div className={`cmp-winner-banner mb-4 ${darkMode ? 'bg-secondary text-light' : ''}`}>
              🏆 <strong>{overallWinner === 1 ? data1.username : data2.username}</strong> is ahead overall!
            </div>
          )}
          {overallWinner === 0 && (
            <div className={`cmp-winner-banner cmp-winner-banner--tie mb-4 ${darkMode ? 'bg-secondary text-light' : ''}`}>
              🤝 It's a tie — evenly matched!
            </div>
          )}

          {/* Player header cards */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <PlayerCard username={data1.username} isWinner={overallWinner === 1} darkMode={darkMode} />
            </div>
            <div className="col-6">
              <PlayerCard username={data2.username} isWinner={overallWinner === 2} darkMode={darkMode} />
            </div>
          </div>

          {/* Stat rows */}
          <div className="cmp-stat-table mb-4">
            <StatRow
              label="Total Solved"
              v1={data1.solved.totalSolved || 0}
              v2={data2.solved.totalSolved || 0}
              darkMode={darkMode}
            />
            <StatRow
              label="Contest Rating"
              v1={Math.round(data1.contest?.contestRating || 0)}
              v2={Math.round(data2.contest?.contestRating || 0)}
              darkMode={darkMode}
            />
            <StatRow
              label="Global Rank"
              v1={data1.contest?.contestGlobalRanking || 'N/A'}
              v2={data2.contest?.contestGlobalRanking || 'N/A'}
              higherIsBetter={false}
              darkMode={darkMode}
            />
            <StatRow
              label="Contests Attended"
              v1={data1.contest?.contestAttend || 0}
              v2={data2.contest?.contestAttend || 0}
              darkMode={darkMode}
            />
            <StatRow
              label="Badges"
              v1={Array.isArray(data1.badges) ? data1.badges.length : 0}
              v2={Array.isArray(data2.badges) ? data2.badges.length : 0}
              darkMode={darkMode}
            />
          </div>

          {/* Difficulty bar chart */}
          <div className={`cmp-bars-section mb-2 p-3 rounded-4 border ${darkMode ? 'bg-dark border-secondary' : 'bg-light border-light'}`}>
            <h6 className={`text-uppercase small fw-bold mb-3 text-center ${darkMode ? 'text-light' : 'text-muted'}`}>
              Difficulty Breakdown
            </h6>

            <DiffBar
              label="Easy"
              v1={data1.solved.easySolved || 0}
              v2={data2.solved.easySolved || 0}
              color="#00e676"
              darkMode={darkMode}
            />

            <DiffBar
              label="Medium"
              v1={data1.solved.mediumSolved || 0}
              v2={data2.solved.mediumSolved || 0}
              color="#ff9800"
              darkMode={darkMode}
            />

            <DiffBar
              label="Hard"
              v1={data1.solved.hardSolved || 0}
              v2={data2.solved.hardSolved || 0}
              color="#ff5252"
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}