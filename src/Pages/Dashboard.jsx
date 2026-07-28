import React, { useState, useEffect } from 'react';
import SearchBox from '../components/SearchBox';
import { fetchLeetCodeData, fetchRecentSubmissions } from '../services/leetcodeApi';
import UserProfile from '../components/UserProfile';
import { fetchUserBadges } from '../services/leetcodeApi';
import Badges from '../components/Badges';
import ContestStats from '../components/ContestStats';
import { fetchUserContest } from '../services/leetcodeApi';
import VisualInsights from '../components/VisualInsights';
import RecentSubmissions from '../components/RecentSubmissions';


export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState(null);
  const [contestData, setContestData] = useState(null);
  const [submissions, setSubmissions] = useState(null);

  // Force clear browser cache/memory restore on load
  useEffect(() => {
    setUsername('');
    setUserData(null);
    setBadges(null);
    setContestData(null);
    setSubmissions(null);
  }, []);

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

      {error && (
        <div className="alert alert-danger text-center my-3" role="alert">
          {error}
        </div>
      )}

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
      
    </div>
  );
}