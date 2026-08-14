/**
 * Dynamic TTL Engine (SRS FR-07, FR-08, PRD #20)
 * Evaluates popularity scores to assign optimal TTLs and generates explainable reasoning.
 */

export interface TTLDecision {
  ttlSeconds: number;
  tierLabel: string;
  hasChanged: boolean;
  action: 'INCREASE' | 'DECREASE' | 'MAINTAIN' | 'INITIAL';
  reason: string;
  previousTTL: number;
}

export function getTTLForScore(score: number): { ttlSeconds: number; tierLabel: string } {
  if (score >= 80) {
    return { ttlSeconds: 3600, tierLabel: '60m (Hot Tier)' };
  }
  if (score >= 60) {
    return { ttlSeconds: 1800, tierLabel: '30m (Warm Tier)' };
  }
  if (score >= 40) {
    return { ttlSeconds: 600, tierLabel: '10m (Active Tier)' };
  }
  if (score >= 20) {
    return { ttlSeconds: 120, tierLabel: '2m (Cool Tier)' };
  }
  return { ttlSeconds: 30, tierLabel: '30s (Cold/Evict Tier)' };
}

export function formatTTLDisplay(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${seconds}s`;
}

export function evaluateTTLDecision(
  productName: string,
  newScore: number,
  previousTTL: number,
  frequencyScore: number,
  recencyScore: number,
  growthScore: number,
  trend: string
): TTLDecision {
  const { ttlSeconds, tierLabel } = getTTLForScore(newScore);

  if (previousTTL === 0) {
    return {
      ttlSeconds,
      tierLabel,
      hasChanged: true,
      action: 'INITIAL',
      reason: `Initial cache admission with Popularity Score ${newScore}/100 (${tierLabel}).`,
      previousTTL: 0,
    };
  }

  if (ttlSeconds > previousTTL) {
    const growthNote = growthScore >= 70 ? `surging traffic velocity (+${growthScore}%)` : `increased access frequency (${frequencyScore}/100)`;
    return {
      ttlSeconds,
      tierLabel,
      hasChanged: true,
      action: 'INCREASE',
      reason: `Promoted ${formatTTLDisplay(previousTTL)} → ${formatTTLDisplay(ttlSeconds)} due to ${growthNote} and rising popularity score (${newScore}/100).`,
      previousTTL,
    };
  }

  if (ttlSeconds < previousTTL) {
    const decayNote = recencyScore < 30 ? 'access recency decay' : 'reduced request frequency';
    return {
      ttlSeconds,
      tierLabel,
      hasChanged: true,
      action: 'DECREASE',
      reason: `Demoted ${formatTTLDisplay(previousTTL)} → ${formatTTLDisplay(ttlSeconds)} due to ${decayNote} (Score dropped to ${newScore}/100).`,
      previousTTL,
    };
  }

  return {
    ttlSeconds,
    tierLabel,
    hasChanged: false,
    action: 'MAINTAIN',
    reason: `Maintained ${formatTTLDisplay(ttlSeconds)} (Popularity score stable at ${newScore}/100).`,
    previousTTL,
  };
}
