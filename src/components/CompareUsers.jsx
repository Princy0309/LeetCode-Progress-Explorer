import React, { useState } from 'react';
import { fetchLeetCodeData, fetchUserBadges, fetchUserContest } from '../services/leetcodeApi';

export default function CompareUsers() {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) {
      alert("Please enter both usernames to compare");
      return;
    }

    setLoading(true);
    setError(null);
    setData1(null);
    setData2(null);

    try {
      const [res1, res2] = await Promise.all([
        fetchUserDataBundle(username1),
        fetchUserDataBundle(username2)
      ]);

      setData1(res1);
      setData2(res2);
    } catch (err) {
      setError(err.message || "Failed to fetch comparison data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDataBundle = async (username) => {
    const [solved, badges, contest] = await Promise.allSettled([
      fetchLeetCodeData(username),
      fetchUserBadges(username),
      fetchUserContest(username)
    ]);

    if (solved.status !== 'fulfilled' || !solved.value) {
      throw new Error(`User '${username}' not found or error fetching data.`);
    }

    return {
      username,
      solved: solved.value,
      badges: badges.status === 'fulfilled' ? badges.value : null,
      contest: contest.status === 'fulfilled' ? contest.value : null,
    };
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h3 className="mb-3 text-center">Compare LeetCode Profiles</h3>
      <div className="row g-3 mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="First username"
            value={username1}
            onChange={(e) => setUsername1(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Second username"
            value={username2}
            onChange={(e) => setUsername2(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-primary" onClick={handleCompare} disabled={loading}>
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {data1 && data2 && (
        <div className="row text-center mt-4">
          <div className="col-md-6 border-end">
            <h4>{data1.username}</h4>
            <p><strong>Total Solved:</strong> {data1.solved.totalSolved || 0}</p>
            <p><strong>Easy:</strong> {data1.solved.easySolved || 0}</p>
            <p><strong>Medium:</strong> {data1.solved.mediumSolved || 0}</p>
            <p><strong>Hard:</strong> {data1.solved.hardSolved || 0}</p>
            <p><strong>Contest Rating:</strong> {Math.round(data1.contest?.contestRating || 0)}</p>
          </div>
          <div className="col-md-6">
            <h4>{data2.username}</h4>
            <p><strong>Total Solved:</strong> {data2.solved.totalSolved || 0}</p>
            <p><strong>Easy:</strong> {data2.solved.easySolved || 0}</p>
            <p><strong>Medium:</strong> {data2.solved.mediumSolved || 0}</p>
            <p><strong>Hard:</strong> {data2.solved.hardSolved || 0}</p>
            <p><strong>Contest Rating:</strong> {Math.round(data2.contest?.contestRating || 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
}