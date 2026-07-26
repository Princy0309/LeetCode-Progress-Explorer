export default function UserProfile({ data }) {
  if (!data) return null; 

  const totalSolved = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);

  return (
    <div className="card mt-4 shadow-sm"> 
      <div className="card-body">
        <h3 className="card-title text-center mb-3">LeetCode Progress</h3>
        
        <div className="row text-center"> 
          <div className="col">
            <div className="p-3 border bg-light rounded">
              <h5>Total Solved</h5>
              <p className="fs-4 fw-bold text-primary mb-0">{totalSolved || 0}</p>
            </div>
          </div>
          <div className="col">
            <div className="p-3 border bg-light rounded">
              <h5>Easy</h5>
              <p className="fs-4 fw-bold text-success mb-0">{data.easySolved || 0}</p>
            </div>
          </div>
          <div className="col">
            <div className="p-3 border bg-light rounded">
              <h5>Medium</h5>
              <p className="fs-4 fw-bold text-warning mb-0">{data.mediumSolved || 0}</p>
            </div>
          </div>
          <div className="col">
            <div className="p-3 border bg-light rounded">
              <h5>Hard</h5>
              <p className="fs-4 fw-bold text-danger mb-0">{data.hardSolved || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}