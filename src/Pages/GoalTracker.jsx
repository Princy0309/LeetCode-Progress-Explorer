import React, { useState, useEffect } from 'react';

export default function GoalTracker() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('lc_practice_goals');
    return saved ? JSON.parse(saved) : { easy: 100, medium: 150, hard: 50 };
  });

  const [current, setCurrent] = useState(() => {
    const saved = localStorage.getItem('lc_practice_current');
    return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 };
  });

  useEffect(() => {
    localStorage.setItem('lc_practice_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lc_practice_current', JSON.stringify(current));
  }, [current]);

  const handleChange = (tier, field, value) => {
    const val = Math.max(0, parseInt(value) || 0);
    if (field === 'goal') {
      setGoals(prev => ({ ...prev, [tier]: val }));
    } else {
      setCurrent(prev => ({ ...prev, [tier]: val }));
    }
  };

  const calculateProgress = (curr, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((curr / goal) * 100));
  };

  const tiers = [
    { key: 'easy', label: 'Easy Tier', color: '#00e676' },
    { key: 'medium', label: 'Medium Tier', color: '#ff9800' },
    { key: 'hard', label: 'Hard Tier', color: '#ff5722' }
  ];

  return (
    <div className="container mt-4">
      <div className="p-4" style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}>
        <h2 className="mb-4 text-center" style={{ fontWeight: '700', letterSpacing: '0.5px' }}>Practice Goal Tracker</h2>
        <div className="row g-4">
          {tiers.map(tier => {
            const progress = calculateProgress(current[tier.key], goals[tier.key]);
            return (
              <div className="col-md-4" key={tier.key}>
                <div className="p-3 h-100 d-flex flex-column justify-content-between" style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h5 style={{ color: tier.color, fontWeight: '600' }}>{tier.label}</h5>
                    <div className="mb-3">
                      <label className="form-label text-muted small">Target Goal</label>
                      <input 
                        type="number" 
                        className="form-control bg-dark text-light border-secondary"
                        value={goals[tier.key]}
                        onChange={(e) => handleChange(tier.key, 'goal', e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">Completed</label>
                      <input 
                        type="number" 
                        className="form-control bg-dark text-light border-secondary"
                        value={current[tier.key]}
                        onChange={(e) => handleChange(tier.key, 'current', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1 small text-muted">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${progress}%`, backgroundColor: tier.color, borderRadius: '4px', transition: 'width 0.4s ease' }} 
                        aria-valuenow={progress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}