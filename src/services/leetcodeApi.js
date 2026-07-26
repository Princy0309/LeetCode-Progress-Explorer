export async function fetchLeetCodeData(username) {
  try {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
    if (!response.ok) {
      throw new Error("User not found or API error");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function fetchUserBadges(username){
  try{
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/badges`);
    if (!response.ok){
      throw new Error("could not fetch badges");
    }
    const data = await response.json();
    return data;
  }
  catch(error) {
    console.error("Error fetching badges:", error);
    return null;
  }
}