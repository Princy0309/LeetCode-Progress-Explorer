export default function SearchBox({ username, setUsername, onSearch, loading }) {
  return (
    <div className="input-group mb-3">
      <input 
        className="form-control"
        type="text"
        placeholder="Enter leetcode username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="off"
      />
      <button 
        className="btn btn-dark" 
        type="button"
        onClick={onSearch}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}