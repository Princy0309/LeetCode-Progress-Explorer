export default function Badges({ badges }) {
  const badgeList = badges?.value?.badges || badges?.badges || badges || [];

  if (!Array.isArray(badgeList) || badgeList.length === 0) {
    return (
      <div className="card shadow-sm mt-4 p-4 text-center">
        <h4 className="mb-3">Badges</h4>
        <p className="text-muted mb-0">No badges found for this user.</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mt-4 p-4">
      <h4 className="mb-3">Badges ({badgeList.length})</h4>
      <div className="row">
        {badgeList.map((badge, index) => {
          // Handle relative icon paths if the API returns them without the domain
          const iconUrl = badge.icon?.startsWith('http') 
            ? badge.icon 
            : `https://leetcode.com${badge.icon}`;

          return (
            <div key={index} className="col-md-3 col-sm-4 col-6 text-center mb-3">
              <div className="p-2 border rounded h-100 d-flex flex-column align-items-center justify-content-center bg-light">
                {badge.icon && (
                  <img 
                    src={iconUrl} 
                    alt={badge.displayName || badge.name} 
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                    className="mb-2"
                    onError={(e) => { e.target.style.display = 'none'; }} // Hides image gracefully if it fails to load
                  />
                )}
                <span className="small fw-bold">{badge.displayName || badge.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}