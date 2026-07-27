import React from 'react';

export default function VisualInsights({ solved }) {
  if (!solved) return null;

  const total = solved.totalSolved || 1;
  const easy = solved.easySolved || 0;
  const medium = solved.mediumSolved || 0;
  const hard = solved.hardSolved || 0;

  // SVG Circle math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const easyPercent = easy / total;
  const mediumPercent = medium / total;
  const hardPercent = hard / total;

  const easyDash = circumference * easyPercent;
  const mediumDash = circumference * mediumPercent;
  const hardDash = circumference * hardPercent;

  const mediumOffset = -easyDash;
  const hardOffset = -(easyDash + mediumDash);

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Progress Breakdown</h4>
      <div className="d-flex align-items-center justify-content-around flex-wrap">
        
        {/* Circular SVG Meter */}
        <div className="position-relative d-flex justify-content-center align-items-center my-3" style={{ width: '180px', height: '180px' }}>
          <svg width="180" height="180" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#e9ecef"
              strokeWidth="12"
            />
            {/* Easy Ring Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#198754"
              strokeWidth="12"
              strokeDasharray={`${easyDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* Medium Ring Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#ffc107"
              strokeWidth="12"
              strokeDasharray={`${mediumDash} ${circumference}`}
              strokeDashoffset={mediumOffset}
              strokeLinecap="round"
            />
            {/* Hard Ring Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#dc3545"
              strokeWidth="12"
              strokeDasharray={`${hardDash} ${circumference}`}
              strokeDashoffset={hardOffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center Text */}
          <div className="position-absolute text-center">
            <h3 className="mb-0 fw-bold">{solved.totalSolved}</h3>
            <small className="text-muted">Solved</small>
          </div>
        </div>

        {/* Legend / Breakdown Details */}
        <div className="flex-grow-1 ms-md-4" style={{ maxWidth: '300px' }}>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="badge bg-success">Easy</span>
            <span><strong>{easy}</strong> <small className="text-muted">({((easy / total) * 100).toFixed(1)}%)</small></span>
          </div>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="badge bg-warning text-dark">Medium</span>
            <span><strong>{medium}</strong> <small className="text-muted">({((medium / total) * 100).toFixed(1)}%)</small></span>
          </div>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="badge bg-danger">Hard</span>
            <span><strong>{hard}</strong> <small className="text-muted">({((hard / total) * 100).toFixed(1)}%)</small></span>
          </div>
        </div>

      </div>
    </div>
  );
}