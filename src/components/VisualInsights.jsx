import React from 'react';

export default function VisualInsights({ solved }) {
  if (!solved) return null;

  const total = solved.totalSolved || 1; // Prevent division by zero
  const easyPercent = ((solved.easySolved / total) * 100).toFixed(1);
  const mediumPercent = ((solved.mediumSolved / total) * 100).toFixed(1);
  const hardPercent = ((solved.hardSolved / total) * 100).toFixed(1);

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Visual Insights & Breakdown</h4>
      
      <div className="mb-3">
        <div className="d-flex justify-content-between mb-1">
          <span>Easy ({solved.easySolved})</span>
          <span>{easyPercent}%</span>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${easyPercent}%` }}></div>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between mb-1">
          <span>Medium ({solved.mediumSolved})</span>
          <span>{mediumPercent}%</span>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${mediumPercent}%` }}></div>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between mb-1">
          <span>Hard ({solved.hardSolved})</span>
          <span>{hardPercent}%</span>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${hardPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
}