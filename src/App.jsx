import { useState } from 'react';
import SearchBox from './components/SearchBox';
import { fetchLeetCodeData } from './services/leetcodeApi';

export default function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const data = await fetchLeetCodeData(username);
      setUserData(data);
    } catch (error) {
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

     
    </div>
  );
}