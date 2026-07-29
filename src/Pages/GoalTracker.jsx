import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Tier config ──────────────────────────────────────────────────────────────
const TIERS = [
  { key: 'easy',   label: 'Easy',   color: '#00e676', textClass: 'text-success' },
  { key: 'medium', label: 'Medium', color: '#ff9800', textClass: 'text-warning' },
  { key: 'hard',   label: 'Hard',   color: '#ff5252', textClass: 'text-danger'  },
];

// ─── Motivational messages ────────────────────────────────────────────────────
function motivation(pct) {
  if (pct === 0)         return { msg: "Not started yet — let's go! 🚀",   cls: 'text-muted' };
  if (pct < 25)          return { msg: "Great start, keep the momentum!",   cls: 'text-info'  };
  if (pct < 50)          return { msg: "Quarter way there — solid work 💪", cls: 'text-info'  };
  if (pct < 75)          return { msg: "Halfway done — don't stop now! ⚡", cls: 'text-warning'};
  if (pct < 100)         return { msg: "Almost there — final push! 🔥",    cls: 'text-warning'};
  return                        { msg: "Goal crushed! 🎉 Set a new one!",   cls: 'text-success'};
}

// ─── Deadline helpers ─────────────────────────────────────────────────────────
function daysLeftInWeek() {
  const now = new Date();
  // Week ends Sunday
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (7 - now.getDay()));
  sunday.setHours(23, 59, 59, 999);
  return Math.ceil((sunday - now) / 86400000);
}

function daysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return Math.ceil((lastDay - now) / 86400000);
}

// ─── Tiny confetti burst ──────────────────────────────────────────────────────
function ConfettiBurst({ color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: W / 2, y: H / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.8) * 10,
      size: Math.random() * 6 + 3,
      alpha: 1,
      c: Math.random() > 0.5 ? color : '#ffffff',
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.3;      // gravity
        p.alpha -= 0.018;
        if (p.alpha <= 0) return;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      if (particles.some(p => p.alpha > 0)) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
               pointerEvents: 'none', borderRadius: 'inherit' }}
    />
  );
}

// ─── History log ──────────────────────────────────────────────────────────────
function HistoryLog({ log, onUndo }) {
  if (!log?.length) return (
    <p className="text-muted small text-center mt-2 mb-0">No activity yet.</p>
  );
  return (
    <div className="goal-history-list">
      {log.map((entry, i) => (
        <div key={entry.id} className="goal-history-entry d-flex justify-content-between align-items-center">
          <span className="small">
            <span style={{ color: entry.color }}>●</span>{' '}
            <strong>{entry.label}</strong> solved
            <span className="text-muted ms-2">{entry.time}</span>
          </span>
          {i === 0 && (
            <button
              className="btn btn-sm goal-undo-btn"
              onClick={onUndo}
              title="Undo last entry"
            >
              ↩ Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Single tier card ─────────────────────────────────────────────────────────
function TierCard({ tier, goal, completed, onGoalChange, onIncrement, onDecrement, darkMode }) {
  const pct     = goal ? Math.min(100, Math.round((completed / parseInt(goal)) * 100)) : 0;
  const mot     = motivation(pct);
  const degrees = (pct / 100) * 360;
  const [burst, setBurst] = useState(false);
  const prevPct = useRef(pct);

  useEffect(() => {
    if (pct === 100 && prevPct.current < 100) {
      setBurst(true);
      setTimeout(() => setBurst(false), 2200);
    }
    prevPct.current = pct;
  }, [pct]);

  const ringBg = `conic-gradient(${tier.color} ${degrees}deg, rgba(128,128,128,0.15) 0deg)`;

  return (
    <div className="col-md-4">
      <div
        className={`goal-tier-card card shadow-sm p-4 h-100 d-flex flex-column align-items-center`}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {burst && <ConfettiBurst color={tier.color} />}

        <h3 className={`mb-1 fw-bold ${tier.textClass}`}>{tier.label}</h3>
        <p className={`small mb-3 ${mot.cls}`} style={{ minHeight: '1.4rem' }}>{mot.msg}</p>

        {/* Ring */}
        <div
          className="goal-ring my-2 d-flex align-items-center justify-content-center"
          style={{ background: ringBg }}
        >
          <div
            className="goal-ring-inner d-flex flex-column align-items-center justify-content-center rounded-circle"
            style={{ background: darkMode ? '#121212' : '#f4f6f9' }}
          >
            <span className="fs-2 fw-bold" style={{ color: tier.color }}>{pct}%</span>
            <small className="text-muted">{completed} / {goal || '--'}</small>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-100 goal-progress-track mt-2 mb-3">
          <div
            className="goal-progress-fill"
            style={{ width: `${pct}%`, background: tier.color }}
          />
        </div>

        {/* Goal input */}
        <div className="w-100 mb-3">
          <label className="form-label text-muted small mb-1">Target:</label>
          <input
            type="number"
            min="1"
            className="form-control form-control-sm"
            value={goal}
            placeholder="Set a number"
            onChange={e => onGoalChange(e.target.value)}
          />
        </div>

        {/* Controls */}
        <div className="d-flex gap-2 w-100">
          <button
            className="btn btn-sm goal-decrement-btn flex-shrink-0"
            onClick={onDecrement}
            disabled={completed === 0}
            title="Remove one"
          >−</button>
          <button
            className="btn btn-sm goal-increment-btn flex-grow-1"
            style={{ background: tier.color, borderColor: tier.color }}
            onClick={onIncrement}
          >
            + Mark Solved
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoalTracker({ darkMode }) {
  const { isLoggedIn, profile } = useAuth();

  // Storage keys are scoped to the active profile so each user has their own data
  const scope       = isLoggedIn ? profile.username : 'guest';
  const KEY_WEEKLY  = `lc_weekly_goals_${scope}`;
  const KEY_MONTHLY = `lc_monthly_goals_${scope}`;
  const KEY_DONE    = `lc_goal_completed_${scope}`;
  const KEY_LOG     = `lc_goal_log_${scope}`;
  const [viewMode, setViewMode] = useState('weekly');

  const [weeklyGoals, setWeeklyGoals] = useState(() => {
    const s = localStorage.getItem(KEY_WEEKLY);
    return s ? JSON.parse(s) : { easy: '', medium: '', hard: '' };
  });

  const [monthlyGoals, setMonthlyGoals] = useState(() => {
    const s = localStorage.getItem(KEY_MONTHLY);
    return s ? JSON.parse(s) : { easy: '', medium: '', hard: '' };
  });

  const [completed, setCompleted] = useState(() => {
    const s = localStorage.getItem(KEY_DONE);
    return s ? JSON.parse(s) : {
      weekly:  { easy: 0, medium: 0, hard: 0 },
      monthly: { easy: 0, medium: 0, hard: 0 },
    };
  });

  const [activityLog, setActivityLog] = useState(() => {
    const s = localStorage.getItem(KEY_LOG);
    return s ? JSON.parse(s) : { weekly: [], monthly: [] };
  });

  // Re-load data when profile switches
  useEffect(() => {
    setWeeklyGoals(() => {
      const s = localStorage.getItem(KEY_WEEKLY);
      return s ? JSON.parse(s) : { easy: '', medium: '', hard: '' };
    });
    setMonthlyGoals(() => {
      const s = localStorage.getItem(KEY_MONTHLY);
      return s ? JSON.parse(s) : { easy: '', medium: '', hard: '' };
    });
    setCompleted(() => {
      const s = localStorage.getItem(KEY_DONE);
      return s ? JSON.parse(s) : { weekly: { easy: 0, medium: 0, hard: 0 }, monthly: { easy: 0, medium: 0, hard: 0 } };
    });
    setActivityLog(() => {
      const s = localStorage.getItem(KEY_LOG);
      return s ? JSON.parse(s) : { weekly: [], monthly: [] };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Persist
  useEffect(() => { localStorage.setItem(KEY_WEEKLY,  JSON.stringify(weeklyGoals));  }, [weeklyGoals,  KEY_WEEKLY]);
  useEffect(() => { localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyGoals)); }, [monthlyGoals, KEY_MONTHLY]);
  useEffect(() => { localStorage.setItem(KEY_DONE,    JSON.stringify(completed));    }, [completed,    KEY_DONE]);
  useEffect(() => { localStorage.setItem(KEY_LOG,     JSON.stringify(activityLog));  }, [activityLog,  KEY_LOG]);

  const currentGoals     = viewMode === 'weekly' ? weeklyGoals  : monthlyGoals;
  const currentCompleted = viewMode === 'weekly' ? completed.weekly : completed.monthly;
  const currentLog       = activityLog[viewMode] ?? [];
  const daysLeft         = viewMode === 'weekly' ? daysLeftInWeek() : daysLeftInMonth();

  const handleGoalChange = (tier, value) => {
    const val = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    if (viewMode === 'weekly') setWeeklyGoals(p => ({ ...p, [tier]: val }));
    else                        setMonthlyGoals(p => ({ ...p, [tier]: val }));
  };

  const addLogEntry = useCallback((tierKey) => {
    const tierMeta = TIERS.find(t => t.key === tierKey);
    const entry = {
      id:    Date.now(),
      label: tierMeta.label,
      color: tierMeta.color,
      time:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivityLog(prev => ({
      ...prev,
      [viewMode]: [entry, ...prev[viewMode]].slice(0, 10),
    }));
  }, [viewMode]);

  const handleIncrement = useCallback((tier) => {
    setCompleted(prev => ({
      ...prev,
      [viewMode]: { ...prev[viewMode], [tier]: prev[viewMode][tier] + 1 },
    }));
    addLogEntry(tier);
  }, [viewMode, addLogEntry]);

  const handleDecrement = useCallback((tier) => {
    setCompleted(prev => {
      const cur = prev[viewMode][tier];
      if (cur <= 0) return prev;
      return { ...prev, [viewMode]: { ...prev[viewMode], [tier]: cur - 1 } };
    });
  }, [viewMode]);

  // Undo = remove most recent log entry and decrement its tier
  const handleUndo = useCallback(() => {
    const latest = currentLog[0];
    if (!latest) return;
    const tierKey = latest.label.toLowerCase();
    handleDecrement(tierKey);
    setActivityLog(prev => ({
      ...prev,
      [viewMode]: prev[viewMode].slice(1),
    }));
  }, [currentLog, handleDecrement, viewMode]);

  // Summary totals
  const totalGoal = TIERS.reduce((s, t) => s + (parseInt(currentGoals[t.key]) || 0), 0);
  const totalDone = TIERS.reduce((s, t) => s + currentCompleted[t.key], 0);
  const totalPct  = totalGoal > 0 ? Math.min(100, Math.round((totalDone / totalGoal) * 100)) : 0;

  return (
    <div className="container mt-4 pb-5">
      {/* ── Page header ── */}
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-1">Goal Tracker</h1>
        <p className="text-muted mb-0">
          {isLoggedIn
            ? `Tracking goals for ${profile.displayName}`
            : 'Set targets, mark progress, stay consistent.'}
        </p>
      </div>

      {/* ── Guest nudge ── */}
      {!isLoggedIn && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
          <span>⚠️</span>
          <span>
            You're using guest mode — goals won't be saved per profile.{' '}
            <strong>Sign in</strong> from the navbar to keep your progress.
          </span>
        </div>
      )}

      {/* ── Mode toggle ── */}
      <div className="d-flex justify-content-center mb-4">
        <div className="goal-mode-toggle" role="group">
          {['weekly', 'monthly'].map(mode => (
            <button
              key={mode}
              className={`goal-mode-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'weekly'
                ? '📅 Weekly'
                : `🗓 Monthly — ${new Date().toLocaleString('default', { month: 'long' })}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary banner ── */}
      <div className="goal-summary-banner card shadow-sm p-3 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <span className="fw-semibold">Overall Progress</span>
            <span className="text-muted small ms-2">{totalDone} / {totalGoal || '--'} problems</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="goal-deadline-badge">
              ⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </span>
            <span className="fw-bold" style={{ color: 'var(--fire-orange)' }}>{totalPct}%</span>
          </div>
        </div>
        <div className="goal-summary-track mt-2">
          <div className="goal-summary-fill" style={{ width: `${totalPct}%` }} />
        </div>
      </div>

      {/* ── Tier cards ── */}
      <div className="row g-4 mb-4">
        {TIERS.map(tier => (
          <TierCard
            key={tier.key}
            tier={tier}
            goal={currentGoals[tier.key]}
            completed={currentCompleted[tier.key]}
            onGoalChange={val => handleGoalChange(tier.key, val)}
            onIncrement={() => handleIncrement(tier.key)}
            onDecrement={() => handleDecrement(tier.key)}
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* ── Activity log ── */}
      <div className="card shadow-sm p-4 goal-log-card">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0 fw-bold">📋 Activity Log</h5>
          <span className="text-muted small">{viewMode === 'weekly' ? 'This week' : 'This month'}</span>
        </div>
        <HistoryLog log={currentLog} onUndo={handleUndo} />
      </div>
    </div>
  );
}
