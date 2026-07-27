import { useState } from 'react';
import SearchBox from './components/SearchBox';
import { fetchLeetCodeData } from './services/leetcodeApi';
import UserProfile from './components/UserProfile';
import { fetchUserBadges } from './services/leetcodeApi';
import  Badges  from './components/Badges'
import ContestStats from './components/ContestStats';
import { fetchUserContest } from './services/leetcodeApi';
import CompareUsers from './components/CompareUsers';

export default function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState(null);
  const [contestData, setContestData] = useState(null);

  const handleSearch = async () => {
    if (!username.trim()) {
      alert("Please enter a valid username");
      return;
    }
    
    setLoading(true);
    setError(null);
    setUserData(null);
    setBadges(null);

    try {
      const[solvedData, badgeData, contestRes] = await Promise.allSettled([
        fetchLeetCodeData(username), fetchUserBadges(username), fetchUserContest(username)
      ]);

      const solved = solvedData.status === 'fulfilled' ? solvedData.value : null;
      const badges = badgeData.status === 'fulfilled' ? badgeData.value : null;
      const contestVal = contestRes.status === 'fulfilled' ? contestRes.value:null;

      if(!solved){
        throw new Error("User not found.")
      }

      setUserData(solved);
      setBadges(badges);
      setContestData(contestVal)
  }
  catch (err) {
    setError(err.message || "Failed to fetch user data. Please try again.");
    setUserData(null);
    setBadges(null);
  }
  finally{
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
      {badges && <Badges badges={badges} />}
      {contestData && <ContestStats contestData={contestData} />}
      <CompareUsers />
    </div>
  );
}