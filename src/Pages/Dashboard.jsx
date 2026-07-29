import React from 'react';
import SearchBox from '../components/SearchBox';
import UserProfile from '../components/UserProfile';
import Badges from '../components/Badges';
import ContestStats from '../components/ContestStats';
import VisualInsights from '../components/VisualInsights';
import RecentSubmissions from '../components/RecentSubmissions';
import StreakCard from '../components/StreakCard';

export default function Dashboard({
  username,
  setUsername,
  userData,
  badges,
  contestData,
  submissions,
  streakData,
  loading,
  error,
  onSearch
}) {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Leetcode Progress Explorer</h1>
      
      <SearchBox 
        username={username}
        setUsername={setUsername}
        onSearch={() => onSearch(username)}
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
      {streakData && <StreakCard streakData={streakData} />}
      {userData && <VisualInsights solved={userData} submissions={submissions} />}
      {badges && <Badges badges={badges} />}
      {contestData && <ContestStats contestData={contestData} />}
      {submissions && <RecentSubmissions submissions={submissions} />}
    </div>
  );
}