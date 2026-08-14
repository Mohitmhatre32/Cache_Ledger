/**
 * Popularity Engine (SRS FR-06)
 * Calculates a normalized score (0-100) using:
 * - 40% Request Frequency (requests in recent time window vs system max)
 * - 30% Recency (how recently the product was accessed)
 * - 20% Growth Score (traffic acceleration / trending velocity)
 * - 10% Historical Score (base demand profile + historical cumulative requests)
 */

export interface PopularityComponents {
  score: number;
  frequencyScore: number;
  recencyScore: number;
  growthScore: number;
  historicalScore: number;
  trend: 'SURGING' | 'GROWING' | 'STABLE' | 'DECLINING' | 'DORMANT';
}

export function calculatePopularityScore(
  requestsInWindow: number,
  maxRequestsInWindow: number,
  lastAccessedMs: number,
  currentTimeMs: number,
  recentHistory: number[], // e.g. [req_t-2, req_t-1, req_t]
  cumulativeRequests: number,
  baseDemand: 'HOT' | 'WARM' | 'COLD' = 'WARM'
): PopularityComponents {
  // 1. Frequency Score (0 - 100)
  // Relative to the peak product traffic in the current interval
  const safeMax = Math.max(maxRequestsInWindow, 10);
  const rawFrequency = (requestsInWindow / safeMax) * 100;
  const frequencyScore = Math.min(100, Math.max(0, Math.round(rawFrequency)));

  // 2. Recency Score (0 - 100)
  // 100 if accessed just now; decays over elapsed seconds
  const elapsedSeconds = Math.max(0, (currentTimeMs - lastAccessedMs) / 1000);
  let recencyScore = 100;
  if (lastAccessedMs === 0) {
    recencyScore = 5;
  } else if (elapsedSeconds <= 5) {
    recencyScore = 100;
  } else if (elapsedSeconds <= 30) {
    recencyScore = 90 - (elapsedSeconds - 5) * 1.5;
  } else if (elapsedSeconds <= 120) {
    recencyScore = 52 - (elapsedSeconds - 30) * 0.35;
  } else if (elapsedSeconds <= 600) {
    recencyScore = 20 - (elapsedSeconds - 120) * 0.03;
  } else {
    recencyScore = Math.max(0, 5 - (elapsedSeconds - 600) * 0.005);
  }
  recencyScore = Math.min(100, Math.max(0, Math.round(recencyScore)));

  // 3. Growth Score (0 - 100)
  // Compares latest traffic to previous intervals
  let growthScore = 50; // default baseline neutral
  if (recentHistory.length >= 2) {
    const prev = recentHistory[recentHistory.length - 2] || 0;
    const current = recentHistory[recentHistory.length - 1] || 0;
    if (prev === 0 && current > 0) {
      growthScore = Math.min(100, 70 + current * 5); // breakout growth
    } else if (prev > 0) {
      const growthRatio = (current - prev) / prev;
      if (growthRatio > 1.5) {
        growthScore = Math.min(100, 85 + growthRatio * 5); // surging
      } else if (growthRatio > 0.5) {
        growthScore = Math.min(85, 65 + growthRatio * 15); // growing
      } else if (growthRatio >= -0.2) {
        growthScore = 50; // stable
      } else if (growthRatio >= -0.6) {
        growthScore = 30; // declining
      } else {
        growthScore = 10; // rapid drop
      }
    }
  }

  // 4. Historical Score (0 - 100)
  let baseBonus = baseDemand === 'HOT' ? 80 : baseDemand === 'WARM' ? 50 : 20;
  const cumulativeBonus = Math.min(20, Math.floor(cumulativeRequests / 50));
  const historicalScore = Math.min(100, Math.max(0, Math.round(baseBonus * 0.8 + cumulativeBonus)));

  // Final Weighted Popularity Formula (SRS FR-06)
  const rawScore =
    0.4 * frequencyScore +
    0.3 * recencyScore +
    0.2 * growthScore +
    0.1 * historicalScore;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let trend: 'SURGING' | 'GROWING' | 'STABLE' | 'DECLINING' | 'DORMANT' = 'STABLE';
  if (growthScore >= 80) trend = 'SURGING';
  else if (growthScore >= 60) trend = 'GROWING';
  else if (growthScore <= 20) trend = 'DECLINING';
  else if (score < 15 && recencyScore < 20) trend = 'DORMANT';

  return {
    score,
    frequencyScore,
    recencyScore,
    growthScore,
    historicalScore,
    trend,
  };
}
