import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import GoalTracker from './Pages/GoalTracker';
import ComparePage from './Pages/ComparePage';
import AuthModal, { Avatar } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest, fetchRecentSubmissions, fetchSubmissionCalendar, fetchUserTagStats } from './services/leetcodeApi';

export default function App() {
  const { profile, isLoggedIn, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

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

      const solved = solvedData.status === 'fulfilled' ? solvedData.value : null;
      const badgesVal = badgeData.status === 'fulfilled' ? badgeData.value : null;
      const contestVal = contestRes.status === 'fulfilled' ? contestRes.value : null;
      const submissionVal = submissionRes.status === 'fulfilled' ? submissionRes.value : null;
      const streakVal = streakRes.status === 'fulfilled' ? streakRes.value : null;
      const tagVal = tagRes.status === 'fulfilled' ? tagRes.value : null;

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
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'navbar-light bg-white border-bottom'} px-3 px-lg-4 py-2`}>
          <div className="container-fluid">
            {/* Brand */}
            <Link
              className="navbar-brand fw-bold text-decoration-none me-3"
              to="/"
              onClick={closeMobileMenu}
            >
              Lead-your-leet!
            </Link>

            {/* Mobile Toggler */}
            <button
              className="navbar-toggler border-0 p-2 d-lg-none ms-auto"
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Collapsible Content */}
            <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''} mt-2 mt-lg-0`}>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/dashboard"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/practice"
                    onClick={closeMobileMenu}
                  >
                    Goals
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/compare"
                    onClick={closeMobileMenu}
                  >
                    Compare Users
                  </NavLink>
                </li>
              </ul>

              {/* Right Side Items (Theme Toggle & Auth) */}
              <div className="d-flex align-items-center gap-2 ms-lg-auto mt-2 mt-lg-0">
                <button
                  onClick={toggleTheme}
                  className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                >
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>

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

        <div className="container-fluid px-2 px-sm-3 px-lg-4 pb-4">
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

        <div className={`d-lg-none position-sticky bottom-0 start-0 end-0 border-top ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'} px-2 py-2`} style={{ zIndex: 1030 }}>
          <div className="d-flex justify-content-around gap-2">
            <NavLink
              to="/dashboard"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `btn btn-sm flex-fill ${isActive
                  ? darkMode ? 'btn-light text-dark' : 'btn-dark text-light'
                  : darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`
              }
            >
              📊 Dashboard
            </NavLink>

            <NavLink
              to="/practice"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `btn btn-sm flex-fill ${isActive
                  ? darkMode ? 'btn-light text-dark' : 'btn-dark text-light'
                  : darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`
              }
            >
              🎯 Goals
            </NavLink>

            <NavLink
              to="/compare"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `btn btn-sm flex-fill ${isActive
                  ? darkMode ? 'btn-light text-dark' : 'btn-dark text-light'
                  : darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`
              }
            >
              👥 Compare
            </NavLink>
          </div>
        </div>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </BrowserRouter>
  );
}