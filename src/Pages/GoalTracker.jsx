import React, { useState, useEffect } from 'react';

export default function GoalTracker() {
  const [viewMode, setViewMode] = useState('weekly');

  const [weeklyGoals, setWeeklyGoals] = useState(() => {
    const saved = localStorage.getItem('lc_weekly_goals');
    return saved ? JSON.parse(saved) : { easy: '', medium: '', hard: '' };
  });

  const [monthlyGoals, setMonthlyGoals] = useState(() => {
    const saved = localStorage.getItem('lc_monthly_goals');
    return saved ? JSON.parse(saved) : { easy: '', medium: '', hard: '' };
  });

  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('lc_goal_completed');
    return saved ? JSON.parse(saved) : { 
      weekly: { easy: 0, medium: 0, hard: 0 }, 
      monthly: { easy: 0, medium: 0, hard: 0 } 
    };
  });

  useEffect(() => {
    localStorage.setItem('lc_weekly_goals', JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem('lc_monthly_goals', JSON.stringify(monthlyGoals));
  }, [monthlyGoals]);

  useEffect(() => {
    localStorage.setItem('lc_goal_completed', JSON.stringify(completed));
  }, [completed]);

  const currentGoals = viewMode === 'weekly' ? weeklyGoals : monthlyGoals;
  const currentCompleted = viewMode === 'weekly' ? completed.weekly : completed.monthly;

  const handleGoalChange = (tier, value) => {
    const val = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    if (viewMode === 'weekly') {
      setWeeklyGoals(prev => ({ ...prev, [tier]: val }));
    } else {
      setMonthlyGoals(prev => ({ ...prev, [tier]: val }));
    }
  };

  const handleIncrement = (tier) => {
    if (viewMode === 'weekly') {
      setCompleted(prev => ({
        ...prev,
        weekly: { ...prev.weekly, [tier]: prev.weekly[tier] + 1 }
      }));
    } else {
      setCompleted(prev => ({
        ...prev,
        monthly: { ...prev.monthly, [tier]: prev.monthly[tier] + 1 }
      }));
    }
  };

  const calculatePercentage = (comp, goal) => {
    const numGoal = parseInt(goal);
    if (!numGoal || numGoal === 0) return 0;
    return Math.min(100, Math.round((comp / numGoal) * 100));
  };

  const getCircleStyle = (percent, color) => {
    const degrees = (percent / 100) * 360;
    return {
      background: `conic-gradient(${color} ${degrees}deg, rgba(255, 255, 255, 0.1) 0deg)`
    };
  };

  return (
    <div className="container mt-5 text-light">
      <h1 className="text-center mb-4">Make goals and track them!</h1>

      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === 'weekly' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly Goals
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly Goals ({new Date().toLocaleString('default', { month: 'long' })})
          </button>
        </div>
      </div>

      <div className="row g-4">
        <TierCard
          title="Easy Tier"
          headerColor="text-success"
          ringColor="#198754"
          goal={currentGoals.easy}
          completed={currentCompleted.easy}
          percentage={calculatePercentage(currentCompleted.easy, currentGoals.easy)}
          onGoalChange={(val) => handleGoalChange('easy', val)}
          onIncrement={() => handleIncrement('easy')}
          circleStyle={getCircleStyle(calculatePercentage(currentCompleted.easy, currentGoals.easy), '#198754')}
        />

        <TierCard
          title="Medium Tier"
          headerColor="text-warning"
          ringColor="#ffc107"
          goal={currentGoals.medium}
          completed={currentCompleted.medium}
          percentage={calculatePercentage(currentCompleted.medium, currentGoals.medium)}
          onGoalChange={(val) => handleGoalChange('medium', val)}
          onIncrement={() => handleIncrement('medium')}
          circleStyle={getCircleStyle(calculatePercentage(currentCompleted.medium, currentGoals.medium), '#ffc107')}
        />

        <TierCard
          title="Hard Tier"
          headerColor="text-danger"
          ringColor="#dc3545"
          goal={currentGoals.hard}
          completed={currentCompleted.hard}
          percentage={calculatePercentage(currentCompleted.hard, currentGoals.hard)}
          onGoalChange={(val) => handleGoalChange('hard', val)}
          onIncrement={() => handleIncrement('hard')}
          circleStyle={getCircleStyle(calculatePercentage(currentCompleted.hard, currentGoals.hard), '#dc3545')}
        />
      </div>
    </div>
  );
}

function TierCard({ title, headerColor, goal, completed, percentage, onGoalChange, onIncrement, circleStyle }) {
  const displayGoal = goal === '' ? '--' : goal;

  return (
    <div className="col-md-4">
      <div className="card bg-dark border-secondary shadow-sm p-4 text-light h-100 d-flex flex-column align-items-center">
        <h3 className={`mb-3 ${headerColor}`}>{title}</h3>

        <div className="circular-progress my-3 d-flex align-items-center justify-content-center" style={circleStyle}>
          <div className="inner-circle bg-dark d-flex flex-column align-items-center justify-content-center rounded-circle">
            <span className="fs-3 fw-bold">{percentage}%</span>
            <small className="text-muted">{completed} / {displayGoal}</small>
          </div>
        </div>

        <div className="w-100 mt-3">
          <label className="form-label text-muted small">Target Goal:</label>
          <input
            type="number"
            className="form-control bg-secondary text-light border-0 mb-3"
            value={goal}
            placeholder="--"
            onChange={(e) => onGoalChange(e.target.value)}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">Completed: <strong>{completed}</strong></span>
            <button className="btn btn-sm btn-outline-light" onClick={onIncrement}>+ Add Solved</button>
          </div>
        </div>
      </div>

      <style>{`
        .circular-progress {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          position: relative;
        }
        .inner-circle {
          width: 115px;
          height: 115px;
        }
      `}</style>
    </div>
  );
}