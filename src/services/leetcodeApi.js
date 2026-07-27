const CORS_PROXY = "https://corsproxy.io/?";
const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

export async function fetchLeetCodeData(username) {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();
    const stats = json.data?.matchedUser?.submitStats?.acSubmissionNum;

    if (!stats) throw new Error("User not found");

    return {
      totalSolved: stats.find(s => s.difficulty === "All")?.count || 0,
      easySolved: stats.find(s => s.difficulty === "Easy")?.count || 0,
      mediumSolved: stats.find(s => s.difficulty === "Medium")?.count || 0,
      hardSolved: stats.find(s => s.difficulty === "Hard")?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("User not found or API error");
  }
}

export async function fetchUserBadges(username) {
  try {
    const query = `
      query userBadges($username: String!) {
        matchedUser(username: $username) {
          badges {
            id
            name
            icon
            creationDate
          }
        }
      }
    `;

    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();
    return json.data?.matchedUser?.badges || [];
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
}

export async function fetchUserContest(username) {
  try {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          rating
          globalRanking
          attendedContestsCount
        }
      }
    `;

    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();
    const contestData = json.data?.userContestRanking;

    if (!contestData) {
      return { contestRating: 0, contestGlobalRanking: "N/A", contestAttend: 0 };
    }

    return {
      contestRating: contestData.rating || 0,
      contestGlobalRanking: contestData.globalRanking || "N/A",
      contestAttend: contestData.attendedContestsCount || 0,
    };
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return { contestRating: 0, contestGlobalRanking: "N/A", contestAttend: 0 };
  }
}