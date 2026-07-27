import React from 'react';

export default function VisualInsights({ solved, submissions }) {
  if (!solved) return null;

  const { easySolved, mediumSolved, hardSolved, totalSolved } = solved;

  const renderCircleRing = (solvedCount, label, colorClass, strokeColor) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const percentage = totalSolved > 0 ? Math.min(solvedCount / totalSolved, 1) : 0;
    const strokeDashoffset = circumference - percentage * circumference;

    return (
      <div className="text-center d-flex flex-column align-items-center">
        <svg width="90" height="90" className="mb-2">
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="#e9ecef"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text
            x="45"
            y="45"
            textAnchor="middle"
            dominantBaseline="central"
            className="fw-bold"
            style={{ fontSize: '16px', fill: '#333' }}
          >
            {solvedCount}
          </text>
        </svg>
        <span className={`fw-medium text-${colorClass}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Problem Difficulty Distribution</h4>
      
      <div className="row text-center justify-around mb-2">
        <div className="col-4">
          {renderCircleRing(easySolved, 'Easy', 'success', '#198754')}
        </div>
        <div className="col-4">
          {renderCircleRing(mediumSolved, 'Medium', 'warning', '#ffc107')}
        </div>
        <div className="col-4">
          {renderCircleRing(hardSolved, 'Hard', 'danger', '#dc3545')}
        </div>
      </div>
    </div>
  );
}