export default function UserProfile({ data }) {
  if (!data) return null;

  const totalSolved = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);

  const stats = [
    {
      label: 'Total Solved',
      value: totalSolved,
      accent: '#6c8cff',
      bg: 'rgba(108, 140, 255, 0.08)',
      border: 'rgba(108, 140, 255, 0.3)',
    },
    {
      label: 'Easy',
      value: data.easySolved || 0,
      accent: '#00e676',
      bg: 'rgba(0, 230, 118, 0.08)',
      border: 'rgba(0, 230, 118, 0.3)',
    },
    {
      label: 'Medium',
      value: data.mediumSolved || 0,
      accent: '#ff9800',
      bg: 'rgba(255, 152, 0, 0.08)',
      border: 'rgba(255, 152, 0, 0.3)',
    },
    {
      label: 'Hard',
      value: data.hardSolved || 0,
      accent: '#ff5252',
      bg: 'rgba(255, 82, 82, 0.08)',
      border: 'rgba(255, 82, 82, 0.3)',
    },
  ];

  return (
    <div className="card shadow-sm lc-progress-card">
      <div className="card-body p-4">

        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <span className="lc-progress-icon" aria-hidden="true">📊</span>
          <h4 className="mb-0 fw-bold lc-progress-title">LeetCode Progress</h4>
        </div>

        {/* Stat tiles */}
        <div className="lc-progress-grid">
          {stats.map(({ label, value, accent, bg, border }) => (
            <div
              key={label}
              className="lc-stat-tile"
              style={{ '--tile-accent': accent, '--tile-bg': bg, '--tile-border': border }}
            >
              {/* Coloured top bar */}
              <div className="lc-stat-tile-bar" />

              <div className="lc-stat-tile-value">{value}</div>
              <div className="lc-stat-tile-label">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
