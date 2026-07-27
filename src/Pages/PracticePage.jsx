import React, { useState } from 'react';

export default function PracticePage() {
  const [selectedTier, setSelectedTier] = useState('Easy');

  const sampleQuestions = {
    Easy: [
      { title: 'Two Sum', acceptance: '49.2%', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Valid Parentheses', acceptance: '41.1%', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/' },
      { title: 'Palindrome Number', acceptance: '53.5%', difficulty: 'Easy', link: 'https://leetcode.com/problems/palindrome-number/' }
    ],
    Medium: [
      { title: 'Add Two Numbers', acceptance: '42.4%', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/' },
      { title: 'Longest Substring Without Repeating Characters', acceptance: '34.8%', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { title: '3Sum', acceptance: '33.5%', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/' }
    ],
    Hard: [
      { title: 'Median of Two Sorted Arrays', acceptance: '41.0%', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { title: 'Merge k Sorted Lists', acceptance: '53.2%', difficulty: 'Hard', link: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { title: 'Trapping Rain Water', acceptance: '60.8%', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/' }
    ]
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold fire-gradient-text mb-1">🔥 Curated Practice Arena</h2>
        <p className="text-muted">Master data structures and algorithms with hand-picked high-yield problems.</p>
      </div>

      <div className="btn-group mb-4 gap-2" role="group">
        {['Easy', 'Medium', 'Hard'].map((tier) => {
          const isActive = selectedTier === tier;
          return (
            <button
              key={tier}
              className={`btn px-4 py-2 rounded-3 fw-semibold ${
                isActive ? 'fire-btn fire-glow' : 'btn-outline-dark text-light border-secondary'
              }`}
              onClick={() => setSelectedTier(tier)}
              style={!isActive ? { backgroundColor: '#121212' } : {}}
            >
              {tier} Arena
            </button>
          );
        })}
      </div>

      <div className="card shadow-lg p-4 rounded-4 fire-border">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="m-0 fw-bold text-light">{selectedTier} Tier Queue</h4>
          <span className="text-muted small">{sampleQuestions[selectedTier].length} problems available</span>
        </div>
        
        <div className="list-group list-group-flush gap-2">
          {sampleQuestions[selectedTier].map((q, index) => (
            <div 
              key={index} 
              className="list-group-item d-flex justify-content-between align-items-center p-3 rounded-3 border"
              style={{ backgroundColor: '#181818', borderColor: '#262626' }}
            >
              <div>
                <h6 className="mb-1 text-light fw-bold">{q.title}</h6>
                <span className="text-muted small">Acceptance Rate: <strong className="text-light">{q.acceptance}</strong></span>
              </div>
              <a 
                href={q.link} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm fire-btn px-3 py-2 rounded-2"
              >
                Solve Now ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}