const BASE_URL = "https://alfa-leetcode-api.onrender.com";

export async function fetchLeetCodeData(username) {
  try {
    const response = await fetch(`${BASE_URL}/${username}/solved`);
    if (response.status === 429) {
      throw new Error("API rate limit exceeded. Please wait a moment and try again.");
    }
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

export async function fetchUserBadges(username) {
  try {
    const response = await fetch(`${BASE_URL}/${username}/badges`);
    if (!response.ok) {
      throw new Error("could not fetch badges");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching badges:", error);
    return null;
  }
}

export async function fetchUserContest(username) {
  try {
    const response = await fetch(`${BASE_URL}/${username}/contest`);
    if (!response.ok) {
      throw new Error("could not fetch contest data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return null;
  }
}