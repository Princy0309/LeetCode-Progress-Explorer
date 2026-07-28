import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GoalTracker from './Pages/GoalTracker';
import ComparePage from './pages/ComparePage';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest, fetchRecentSubmissions } from './services/leetcodeApi';

export default function App() {
  const [username, setUsername] = useState(() => sessionStorage.getItem('lc_app_username') || '');
  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_userdata');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_badges');
    return saved ? JSON.parse(saved) : null;
  });
  const [contestData, setContestData] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_contest');
    return saved ? JSON.parse(saved) : null;
  });
  const [submissions, setSubmissions] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_submissions');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep sessionStorage updated automatically
  useEffect(() => {
    sessionStorage.setItem('lc_app_username', username);
    if (userData) sessionStorage.setItem('lc_app_userdata', JSON.stringify(userData));
    else sessionStorage.removeItem('lc_app_userdata');

    if (badges) sessionStorage.setItem('lc_app_badges', JSON.stringify(badges));
    else sessionStorage.removeItem('lc_app_badges');

    if (contestData) sessionStorage.setItem('lc_app_contest', JSON.stringify(contestData));
    else sessionStorage.removeItem('lc_app_contest');

    if (submissions) sessionStorage.setItem('lc_app_submissions', JSON.stringify(submissions));
    else sessionStorage.removeItem('lc_app_submissions');
  }, [username, userData, badges, contestData, submissions]);

  const handleSearch = async (searchUsername) => {
    const targetUser = searchUsername || username;
    if (!targetUser.trim()) {
      alert("Please enter a valid username");
      return;
    }
    
    setLoading(true);
    setError(null);
    setUserData(null);
    setBadges(null);
    setContestData(null);
    setSubmissions(null);

    try {
      const [solvedData, badgeData, contestRes, submissionRes] = await Promise.allSettled([
        fetchLeetCodeData(targetUser), 
        fetchUserBadges(targetUser), 
        fetchUserContest(targetUser), 
        fetchRecentSubmissions(targetUser)
      ]);

      const solved = solvedData.status === 'fulfilled' ? solvedData.value : null;
      const badgesVal = badgeData.status === 'fulfilled' ? badgeData.value : null;
      const contestVal = contestRes.status === 'fulfilled' ? contestRes.value : null;
      const submissionVal = submissionRes.status === 'fulfilled' ? submissionRes.value : null;

      if (!solved) {
        throw new Error("User not found.");
      }

      setUserData(solved);
      setBadges(badgesVal);
      setContestData(contestVal);
      setSubmissions(submissionVal);
    } catch (err) {
      setError(err.message || "Failed to fetch user data. Please try again.");
      setUserData(null);
      setBadges(null);
      setContestData(null);
      setSubmissions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-4">
        <span className="navbar-brand">Lead-your-leet!</span>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Dashboard</Link>
          <Link className="nav-link" to="/practice">Goals</Link>
          <Link className="nav-link" to="/compare">Compare Users</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                username={username}
                setUsername={setUsername}
                userData={userData}
                badges={badges}
                contestData={contestData}
                submissions={submissions}
                loading={loading}
                error={error}
                onSearch={handleSearch}
              />
            } 
          />
          <Route path="/practice" element={<GoalTracker />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}