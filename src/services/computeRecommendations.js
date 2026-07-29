/**
 * computeRecommendations.js
 *
 * Analyses a user's solved-tag distribution and produces a ranked list
 * of topic areas they should focus on next.
 *
 * Scoring model
 * -------------
 * Each tag gets a "gap score" — higher means more important to practise.
 *
 *   gapScore = tierWeight × (1 - solvedRatio) × urgencyBoost
 *
 *   tierWeight   — fundamental tags matter more early on; advanced matter
 *                  more once basics are covered
 *   solvedRatio  — solved / totalInCategory  (we estimate totalInCategory
 *                  from the known LeetCode tag problem counts table below)
 *   urgencyBoost — tags with ZERO solved problems get a small extra push
 *                  so complete blind-spots always surface
 *
 * The engine returns the top N tags split into three buckets:
 *   • focus_now   — highest gap, user has barely touched these
 *   • improve     — partially solved but still lots of room
 *   • almost_done — user is doing well but a few more would round things out
 */

// ─── Approximate total problems per tag on LeetCode (as of mid-2025) ─────────
// Used to compute a solved-ratio even though the API only returns solved count.
// Sourced from LeetCode's public tag pages. Numbers are intentionally rounded.
const TAG_TOTALS = {
  // Fundamentals
  "array":                    1600,
  "string":                    760,
  "hash-table":                680,
  "sorting":                   490,
  "math":                      580,
  "two-pointers":              240,
  "binary-search":             280,
  "sliding-window":            130,
  "prefix-sum":                200,
  "simulation":                190,
  "counting":                  200,
  "greedy":                    490,
  "recursion":                  90,
  "bit-manipulation":          180,

  // Intermediate
  "stack":                     280,
  "queue":                     110,
  "linked-list":               180,
  "tree":                      330,
  "binary-tree":               260,
  "depth-first-search":        400,
  "breadth-first-search":      340,
  "heap-priority-queue":       200,
  "graph":                     350,
  "dynamic-programming":       550,
  "backtracking":              160,
  "matrix":                    210,
  "union-find":                110,
  "monotonic-stack":            90,
  "trie":                       80,

  // Advanced
  "divide-and-conquer":        100,
  "binary-search-tree":        100,
  "segment-tree":               60,
  "binary-indexed-tree":        40,
  "topological-sort":           55,
  "shortest-path":              70,
  "minimum-spanning-tree":      30,
  "game-theory":                50,
  "memoization":               100,
  "number-theory":              90,
  "string-matching":            80,
  "suffix-array":               30,
};

const TIER_WEIGHTS = {
  fundamental:   1.0,
  intermediate:  1.3,
  advanced:      1.1,  // advanced weighted slightly less than intermediate
                       // so we don't surface niche topics before core gaps
};

// Minimum total to bother recommending (filters out obscure micro-tags)
const MIN_TOTAL = 30;

// How many recommendations to return in total
const TOP_N = 12;

/**
 * Returns a list of recommendation objects, sorted by gapScore descending.
 *
 * @param {Array} tagStats  Output of fetchUserTagStats — array of
 *   { tagName, tagSlug, problemsSolved, tier }
 * @param {Object} userData { easySolved, mediumSolved, hardSolved, totalSolved }
 * @returns {Array} recommendations
 */
export function computeRecommendations(tagStats, userData) {
  if (!tagStats?.length) return [];

  const totalSolved = userData?.totalSolved || 0;

  // Determine user skill tier to bias recommendations
  // beginner < 50, intermediate 50–200, advanced 200+
  const skillLevel =
    totalSolved < 50  ? 'beginner' :
    totalSolved < 200 ? 'intermediate' : 'advanced';

  const scored = tagStats
    .map((tag) => {
      const slug  = tag.tagSlug;
      const total = TAG_TOTALS[slug] ?? null;

      // Skip tags we don't have total counts for (too niche / unknown)
      if (!total || total < MIN_TOTAL) return null;

      const solved      = tag.problemsSolved || 0;
      const solvedRatio = Math.min(solved / total, 1);

      // Tier weight — beginners should focus on fundamentals more
      let tierWeight = TIER_WEIGHTS[tag.tier] ?? 1.0;
      if (skillLevel === 'beginner' && tag.tier === 'advanced') tierWeight *= 0.5;
      if (skillLevel === 'beginner' && tag.tier === 'fundamental') tierWeight *= 1.3;
      if (skillLevel === 'advanced' && tag.tier === 'fundamental' && solvedRatio > 0.4) tierWeight *= 0.6;

      // Urgency boost for completely untouched tags
      const urgencyBoost = solved === 0 ? 1.25 : 1.0;

      const gapScore = tierWeight * (1 - solvedRatio) * urgencyBoost;

      return {
        tagName:     tag.tagName,
        tagSlug:     slug,
        tier:        tag.tier,
        solved,
        total,
        solvedRatio,
        gapScore,
        // Link to LeetCode filtered problem list
        url: `https://leetcode.com/tag/${slug}/`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, TOP_N);

  // Bucket into three groups based on solvedRatio
  const focusNow   = scored.filter(t => t.solvedRatio < 0.15);
  const improve    = scored.filter(t => t.solvedRatio >= 0.15 && t.solvedRatio < 0.5);
  const almostDone = scored.filter(t => t.solvedRatio >= 0.5);

  return { focusNow, improve, almostDone, all: scored, skillLevel };
}

/**
 * Returns a human-readable insight sentence for the header.
 */
export function generateInsightSummary(recommendations, username) {
  if (!recommendations?.all?.length) return null;

  const { skillLevel, focusNow } = recommendations;
  const topTag = focusNow[0] || recommendations.all[0];

  const levelLabel = {
    beginner:     'just starting out',
    intermediate: 'making solid progress',
    advanced:     'at an advanced level',
  }[skillLevel];

  return `${username} is ${levelLabel}. The biggest opportunity right now is **${topTag.tagName}** — only ${topTag.solved} of ~${topTag.total} problems solved.`;
}
