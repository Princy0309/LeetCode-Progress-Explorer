import React, { useState } from 'react';

export default function PracticePage() {
  const [selectedTier, setSelectedTier] = useState('Easy');

  const sampleQuestions = {
    Easy: [
      { title: 'Two Sum', acceptance: '49.2%', link: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Valid Parentheses', acceptance: '41.1%', link: 'https://leetcode.com/problems/valid-parentheses/' }
    ],
    Medium: [
      { title: 'Add Two Numbers', acceptance: '42.4%', link: 'https://leetcode.com/problems/add-two-numbers/' },
      { title: 'Longest Substring Without Repeating Characters', acceptance: '34.8%', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' }
    ],
    Hard: [
      { title: 'Median of Two Sorted Arrays', acceptance: '41.0%', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { title: 'Merge k Sorted Lists', acceptance: '53.2%', link: 'https://leetcode.com/problems/merge-k-sorted-lists/' }
    ]
  };

  return (
    <div>
      <h2 className="mb-3">Problem Difficulty Recommendations</h2>
      <p className="text-muted">Select a difficulty tier to view curated problem recommendations:</p>

      <div className="btn-group mb-4" role="group">
        <button 
          className={`btn ${selectedTier === 'Easy' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setSelectedTier('Easy')}
        >
          Easy
        </button>
        <button 
          className={`btn ${selectedTier === 'Medium' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => setSelectedTier('Medium')}
        >
          Medium
        </button>
        <button 
          className={`btn ${selectedTier === 'Hard' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setSelectedTier('Hard')}
        >
          Hard
        </button>
      </div>

      <div className="card shadow-sm p-4">
        <h4 className="mb-3">{selectedTier} Problems List</h4>
        <ul className="list-group">
          {sampleQuestions[selectedTier].map((q, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{q.title} (Acceptance: {q.acceptance})</span>
              <a href={q.link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                Solve on LeetCode
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}