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