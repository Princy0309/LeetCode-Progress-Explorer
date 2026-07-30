import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import GoalTracker from './Pages/GoalTracker';
import ComparePage from './Pages/ComparePage';
import ThemeToggle from './components/ThemeToggle';
import AuthModal, { Avatar } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest, fetchRecentSubmissions, fetchSubmissionCalendar, fetchUserTagStats } from './services/leetcodeApi';

export default function App() {
  const { profile, isLoggedIn, signOut } = useAuth();
  const [showAuth, setShowAuth]           = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const dropdownRef                       = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
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
  const [streakData, setStreakData] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_streak');
    return saved ? JSON.parse(saved) : null;
  });
  const [tagStats, setTagStats] = useState(() => {
    const saved = sessionStorage.getItem('lc_app_tags');
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

    if (streakData) sessionStorage.setItem('lc_app_streak', JSON.stringify(streakData));
    else sessionStorage.removeItem('lc_app_streak');

    if (tagStats) sessionStorage.setItem('lc_app_tags', JSON.stringify(tagStats));
    else sessionStorage.removeItem('lc_app_tags');
  }, [username, userData, badges, contestData, submissions, streakData, tagStats]);

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
    setStreakData(null);
    setTagStats(null);

    try {
      const [solvedData, badgeData, contestRes, submissionRes, streakRes, tagRes] = await Promise.allSettled([
        fetchLeetCodeData(targetUser), 
        fetchUserBadges(targetUser), 
        fetchUserContest(targetUser), 
        fetchRecentSubmissions(targetUser),
        fetchSubmissionCalendar(targetUser),
        fetchUserTagStats(targetUser),
      ]);

      const solved      = solvedData.status    === 'fulfilled' ? solvedData.value    : null;
      const badgesVal   = badgeData.status     === 'fulfilled' ? badgeData.value     : null;
      const contestVal  = contestRes.status    === 'fulfilled' ? contestRes.value    : null;
      const submissionVal = submissionRes.status === 'fulfilled' ? submissionRes.value : null;
      const streakVal   = streakRes.status     === 'fulfilled' ? streakRes.value     : null;
      const tagVal      = tagRes.status        === 'fulfilled' ? tagRes.value        : null;

      if (!solved) {
        throw new Error("User not found.");
      }

      setUserData(solved);
      setBadges(badgesVal);
      setContestData(contestVal);
      setSubmissions(submissionVal);
      setStreakData(streakVal);
      setTagStats(tagVal);
    } catch (err) {
      setError(err.message || "Failed to fetch user data. Please try again.");
      setUserData(null);
      setBadges(null);
      setContestData(null);
      setSubmissions(null);
      setStreakData(null);
      setTagStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className={`min-vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'navbar-light bg-white border-bottom'} px-3 px-lg-4 mb-4`}>
          <div className="container-fluid">
            <Link className="navbar-brand fw-bold text-decoration-none" to="/">Lead-your-leet!</Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav" 
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/practice">Goals</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/compare">Compare Users</NavLink>
                </li>
              </ul>
              <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
                <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

                {isLoggedIn ? (
                  <div className="nav-profile-wrap" ref={dropdownRef}>
                    <button
                      className="nav-avatar-btn"
                      onClick={() => setShowDropdown(d => !d)}
                      aria-label="Profile menu"
                      aria-expanded={showDropdown}
                    >
                      <Avatar
                        displayName={profile.displayName}
                        color={profile.avatarColor}
                        size={34}
                      />
                      <span className="nav-avatar-name d-none d-md-inline">
                        {profile.displayName}
                      </span>
                      <span className="nav-avatar-chevron">▾</span>
                    </button>

                    {showDropdown && (
                      <div className="nav-dropdown">
                        <div className="nav-dropdown-header">
                          <Avatar displayName={profile.displayName} color={profile.avatarColor} size={40} />
                          <div>
                            <div className="fw-bold">{profile.displayName}</div>
                            <div className="text-muted small">@{profile.username}</div>
                          </div>
                        </div>
                        <hr className="my-1" />
                        <button
                          className="nav-dropdown-item text-danger"
                          onClick={() => { signOut(); setShowDropdown(false); }}
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn fire-btn btn-sm rounded-pill px-3"
                    onClick={() => setShowAuth(true)}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="container px-3 px-md-4">
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  username={username}
                  setUsername={setUsername}
                  userData={userData}
                  badges={badges}
                  contestData={contestData}
                  submissions={submissions}
                  streakData={streakData}
                  tagStats={tagStats}
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

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </BrowserRouter>
  );
}