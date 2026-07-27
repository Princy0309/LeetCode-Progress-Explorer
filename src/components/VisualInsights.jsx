import React from 'react';

export default function VisualInsights({ solved }) {
  if (!solved) return null;

  const { easySolved, mediumSolved, hardSolved, totalSolved } = solved;

  const renderCircleRing = (solvedCount, label, strokeColor) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const percentage = totalSolved > 0 ? Math.min(solvedCount / totalSolved, 1) : 0;
    const strokeDashoffset = circumference - percentage * circumference;

    return (
      <div className="text-center d-flex flex-column align-items-center">
        <svg width="100" height="100" className="mb-2">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#1a1a1a"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            className="fw-bold"
            style={{ fontSize: '18px', fill: '#f5f5f5' }}
          >
            {solvedCount}
          </text>
        </svg>
        <span className="text-muted small text-uppercase tracking-wider fw-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div className="card shadow-lg p-4 mb-4 rounded-4 fire-border">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="m-0 fw-bold fire-gradient-text">Performance Matrix</h4>
        <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: 'rgba(255,87,34,0.15)', color: '#ff5722', border: '1px solid rgba(255,87,34,0.3)' }}>
          Total Solved: {totalSolved}
        </span>
      </div>
      
      <div className="row text-center justify-around align-items-center">
        <div className="col-4">
          {renderCircleRing(easySolved, 'Easy', '#00e676')}
        </div>
        <div className="col-4">
          {renderCircleRing(mediumSolved, 'Medium', '#ff9800')}
        </div>
        <div className="col-4">
          {renderCircleRing(hardSolved, 'Hard', '#ff5722')}
        </div>
      </div>
    </div>
  );
}