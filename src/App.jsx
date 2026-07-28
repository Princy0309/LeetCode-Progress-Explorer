import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GoalTracker from './pages/GoalTracker';
import ComparePage from './pages/ComparePage';
import ThemeToggle from './components/themeToggle';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest, fetchRecentSubmissions } from './services/leetcodeApi';

export default function App() {
  const isPageReload = window.performance.getEntriesByType("navigation")[0]?.type === "reload";

  if (isPageReload) {
    sessionStorage.clear();
  }

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('lc_app_dark_mode');
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

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

  useEffect(() => {
    localStorage.setItem('lc_app_dark_mode', JSON.stringify(darkMode));
    document.body.className = darkMode ? 'bg-dark text-light' : 'bg-light text-dark';
  }, [darkMode]);

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
      <div className={`min-vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'navbar-light bg-white border-bottom'} px-4 mb-4`}>
          <span className="navbar-brand fw-bold">Lead-your-leet!</span>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/practice">Goals</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/compare">Compare Users</Link>
              </li>
            </ul>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
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
                  darkMode={darkMode}
                />
              } 
            />
            <Route path="/practice" element={<GoalTracker darkMode={darkMode} />} />
            <Route path="/compare" element={<ComparePage darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}