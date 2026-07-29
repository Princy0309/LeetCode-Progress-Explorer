import React from "react";

export default function ContestStats({ contestData }) {
  if (!contestData) return null;

  return (
    <div className="card shadow-sm p-4 contest-card">
      <h4 className="mb-3">Contest & Ranking Stats</h4>
      <div className="row text-center">
        <div className="col-md-4 mb-3">
          <div className="p-3 border rounded bg-light">
            <h6 className="text-muted">Contest Rating</h6>
            <h3>{Math.round(contestData.contestRating || 0)}</h3>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-3 border rounded bg-light">
            <h6 className="text-muted">Global Ranking</h6>
            <h3>{contestData.contestGlobalRanking || "N/A"}</h3>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-3 border rounded bg-light">
            <h6 className="text-muted">Attended Contests</h6>
            <h3>{contestData.contestAttend || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}