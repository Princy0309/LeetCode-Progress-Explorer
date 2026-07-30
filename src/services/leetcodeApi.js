const CORS_PROXY = "https://proxy.corsfix.com/?";
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

export async function fetchRecentSubmissions(username) {
  const query = `
    query recentAcSubmissions($username: String!) {
      recentAcSubmissionList(username: $username, limit: 15) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();
    return data?.data?.recentAcSubmissionList || [];
  } catch (error) {
    console.error("Error fetching recent submissions:", error);
    return [];
  }
}

export async function fetchSubmissionCalendar(username) {
  const query = `
    query userCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
          totalActiveDays
          streak
        }
      }
    }
  `;

  try {
    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();
    const calendar = json.data?.matchedUser?.userCalendar;

    if (!calendar) return null;

    const rawMap = JSON.parse(calendar.submissionCalendar || "{}");

    const dayMap = {};
    for (const [ts, count] of Object.entries(rawMap)) {
      const dateKey = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
      dayMap[dateKey] = (dayMap[dateKey] || 0) + count;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toKey = (d) => d.toISOString().slice(0, 10);

    let currentStreak = 0;
    const cursor = new Date(today);
    if (!dayMap[toKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
    while (dayMap[toKey(cursor)]) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const sortedDays = Object.keys(dayMap).sort();
    let longest = 0;
    let run = 0;
    let prevDate = null;
    for (const key of sortedDays) {
      const d = new Date(key);
      if (prevDate) {
        const diff = (d - prevDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          run++;
        } else {
          run = 1;
        }
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
      prevDate = d;
    }

    return {
      currentStreak,
      longestStreak: Math.max(longest, calendar.streak || 0),
      totalActiveDays: calendar.totalActiveDays || Object.keys(dayMap).length,
      dayMap,
    };
  } catch (error) {
    console.error("Error fetching submission calendar:", error);
    return null;
  }
}

export async function fetchUserTagStats(username) {
  const query = `
    query userTagStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`${CORS_PROXY}${LEETCODE_GRAPHQL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();
    const tagData = json.data?.matchedUser?.tagProblemCounts;
    if (!tagData) return null;

    const allTags = [
      ...tagData.fundamental.map(t => ({ ...t, tier: 'fundamental' })),
      ...tagData.intermediate.map(t => ({ ...t, tier: 'intermediate' })),
      ...tagData.advanced.map(t => ({ ...t, tier: 'advanced' })),
    ];

    return allTags;
  } catch (error) {
    console.error("Error fetching tag stats:", error);
    return null;
  }
}