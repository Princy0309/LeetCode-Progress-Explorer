import React, { useState, useEffect } from 'react';
import SearchBox from '../components/SearchBox';
import { fetchLeetCodeData, fetchRecentSubmissions } from '../services/leetcodeApi';
import UserProfile from '../components/UserProfile';
import { fetchUserBadges } from '../services/leetcodeApi';
import Badges from '../components/Badges';
import ContestStats from '../components/ContestStats';
import { fetchUserContest } from '../services/leetcodeApi';
import CompareUsers from '../components/CompareUsers';
import VisualInsights from '../components/VisualInsights';
import RecentSubmissions from '../components/RecentSubmissions';

export default function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('lc_search_username') || '';
  });
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('lc_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('lc_badges');
    return saved ? JSON.parse(saved) : null;
  });
  const [contestData, setContestData] = useState(() => {
    const saved = localStorage.getItem('lc_contest_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('lc_submissions');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('lc_search_username', username);
  }, [username]);

  useEffect(() => {
    if (userData) localStorage.setItem('lc_user_data', JSON.stringify(userData));
    else localStorage.removeItem('lc_user_data');
  }, [userData]);

  useEffect(() => {
    if (badges) localStorage.setItem('lc_badges', JSON.stringify(badges));
    else localStorage.removeItem('lc_badges');
  }, [badges]);

  useEffect(() => {
    if (contestData) localStorage.setItem('lc_contest_data', JSON.stringify(contestData));
    else localStorage.removeItem('lc_contest_data');
  }, [contestData]);

  useEffect(() => {
    if (submissions) localStorage.setItem('lc_submissions', JSON.stringify(submissions));
    else localStorage.removeItem('lc_submissions');
  }, [submissions]);

  const handleSearch = async () => {
    if (!username.trim()) {
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
        fetchLeetCodeData(username), 
        fetchUserBadges(username), 
        fetchUserContest(username), 
        fetchRecentSubmissions(username)
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Leetcode Progress Explorer</h1>
      
      <SearchBox 
        username={username}
        setUsername={setUsername}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Error Alert Message */}
      {error && (
        <div className="alert alert-danger text-center my-3" role="alert">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className='text-center my-4'>
          <div className='spinner-border text-primary' role="status">
            <span className='visually-hidden'>Loading....</span>
          </div>
        </div>
      )}
      
      {!loading && userData && <UserProfile data={userData} />}
      {userData && <VisualInsights solved={userData} submissions={submissions} />}
      {badges && <Badges badges={badges} />}
      {contestData && <ContestStats contestData={contestData} />}
      {submissions && <RecentSubmissions submissions={submissions} />}
      <CompareUsers />
    </div>
  );
}