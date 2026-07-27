import React from 'react';

export default function RecentSubmissions({ submissions }) {
  if (!submissions || submissions.length === 0) return null;

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Recent Accepted Submissions</h4>
      <div className="list-group">
        {submissions.map((sub) => {
          const date = new Date(sub.timestamp * 1000).toLocaleDateString();
          return (
            <a
              key={sub.id}
              href={`https://leetcode.com/problems/${sub.titleSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <span className="fw-medium text-primary">{sub.title}</span>
              <small className="text-muted">{date}</small>
            </a>
          );
        })}
      </div>
    </div>
  );
}