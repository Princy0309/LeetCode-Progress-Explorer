import { useState } from 'react';
import SearchBox from './components/SearchBox';
import { fetchLeetCodeData } from './services/leetcodeApi';
import UserProfile from './components/UserProfile';

export default function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!username.trim()) {
      alert("Please enter a valid username");
      return;
    }
    
    setLoading(true);
    setError(null);
    setUserData(null);

    try {
      const data = await fetchLeetCodeData(username);
      
      // If your service returns null or an error structure, catch it
      if (!data) {
        throw new Error("User not found. Please check the username and try again!");
      }

      setUserData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch user data. Please try again.");
      setUserData(null);
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

      {/* User Profile Component */}
      {!loading && userData && <UserProfile data={userData} />}
    </div>
  );
}