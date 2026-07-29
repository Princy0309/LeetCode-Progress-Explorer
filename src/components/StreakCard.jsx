import React, { useMemo } from 'react';

/**
 * Builds a 12-week grid (84 cells, Mon–Sun columns) ending today.
 * Returns an array of { dateKey, count, col, row } objects.
 */
function buildHeatmapGrid(dayMap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // End on the coming Sunday (or today if Sunday)
  const endDate = new Date(today);
  const dayOfWeek = endDate.getDay(); // 0=Sun … 6=Sat
  endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

  // Start = endDate minus 83 days (gives 12 full weeks = 84 cells)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 83);

  const cells = [];
  const cursor = new Date(startDate);
  let col = 0;
  let row = cursor.getDay(); // 0=Sun

  while (cursor <= endDate) {
    const dateKey = cursor.toISOString().slice(0, 10);
    cells.push({
      dateKey,
      count: dayMap?.[dateKey] || 0,
      col,
      row: cursor.getDay(), // Sun=0 … Sat=6
    });
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() === 0) col++; // new week starts on Sunday
  }

  // Total columns = number of distinct weeks
  const totalCols = col + 1;
  return { cells, totalCols };
}

function intensityClass(count) {
  if (count === 0) return 'heatmap-cell-empty';
  if (count <= 2) return 'heatmap-cell-low';
  if (count <= 5) return 'heatmap-cell-mid';
  if (count <= 9) return 'heatmap-cell-high';
  return 'heatmap-cell-max';
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function StreakCard({ streakData }) {
  const { cells, totalCols } = useMemo(
    () => buildHeatmapGrid(streakData?.dayMap),
    [streakData]
  );

  if (!streakData) return null;

  const { currentStreak, longestStreak, totalActiveDays } = streakData;

  // Pick 4 evenly-spaced month labels from the heatmap columns
  const monthLabels = useMemo(() => {
    const labels = [];
    const seen = new Set();
    for (const cell of cells) {
      const month = cell.dateKey.slice(0, 7); // "YYYY-MM"
      if (!seen.has(month)) {
        seen.add(month);
        labels.push({ col: cell.col, label: new Date(cell.dateKey + 'T00:00:00').toLocaleString('default', { month: 'short' }) });
      }
    }
    return labels;
  }, [cells]);

  return (
    <div className="card shadow-sm p-4 mb-4 streak-card">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="streak-flame" aria-hidden="true">🔥</span>
        <h4 className="mb-0 fire-gradient-text">Submission Streak</h4>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="streak-stat-box fire-border">
            <div className="streak-stat-value fire-gradient-text">{currentStreak}</div>
            <div className="streak-stat-label">Current Streak</div>
            <div className="streak-stat-unit">days</div>
          </div>
        </div>
        <div className="col-4">
          <div className="streak-stat-box">
            <div className="streak-stat-value">{longestStreak}</div>
            <div className="streak-stat-label">Longest Streak</div>
            <div className="streak-stat-unit">days</div>
          </div>
        </div>
        <div className="col-4">
          <div className="streak-stat-box">
            <div className="streak-stat-value">{totalActiveDays}</div>
            <div className="streak-stat-label">Active Days</div>
            <div className="streak-stat-unit">total</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="heatmap-wrapper">
        {/* Month labels */}
        <div className="heatmap-month-row" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
          {monthLabels.map(({ col, label }) => (
            <span
              key={`${col}-${label}`}
              className="heatmap-month-label"
              style={{ gridColumn: col + 1 }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Grid: 7 rows (Sun–Sat) × totalCols columns */}
        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
          {cells.map((cell) => (
            <div
              key={cell.dateKey}
              className={`heatmap-cell ${intensityClass(cell.count)}`}
              style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
              title={cell.count > 0 ? `${cell.dateKey}: ${cell.count} submission${cell.count > 1 ? 's' : ''}` : cell.dateKey}
              role="img"
              aria-label={`${cell.dateKey}: ${cell.count} submissions`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Less</span>
          <div className="heatmap-cell heatmap-cell-empty heatmap-legend-cell" />
          <div className="heatmap-cell heatmap-cell-low heatmap-legend-cell" />
          <div className="heatmap-cell heatmap-cell-mid heatmap-legend-cell" />
          <div className="heatmap-cell heatmap-cell-high heatmap-legend-cell" />
          <div className="heatmap-cell heatmap-cell-max heatmap-legend-cell" />
          <span className="heatmap-legend-label">More</span>
        </div>
      </div>

      {/* Active streak badge */}
      {currentStreak > 0 && (
        <div className="streak-active-badge mt-3">
          <span className="streak-flame-sm" aria-hidden="true">🔥</span>
          <span>
            {currentStreak >= 30
              ? `On fire! ${currentStreak}-day streak`
              : currentStreak >= 7
              ? `Great momentum! ${currentStreak}-day streak`
              : `${currentStreak}-day streak — keep it up!`}
          </span>
        </div>
      )}
    </div>
  );
}
