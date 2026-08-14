import { CacheEntry, ProductStats } from '@/types';

/**
 * Smart Eviction Engine (SRS FR-09, FR-21, PRD #31)
 * Evaluates cache pressure and computes eviction scores to protect hot items while purging low-value items.
 */

export interface EvictionCandidate {
  key: string;
  productId: string;
  productName: string;
  evictionScore: number;
  frequencyComponent: number;
  recencyComponent: number;
  popularityComponent: number;
  remainingTtlSeconds: number;
  reason: string;
}

export interface EvictionResult {
  triggered: boolean;
  pressurePercent: number;
  evictedCount: number;
  evictedItems: EvictionCandidate[];
  retainedCount: number;
  reason: string;
}

export function calculateEvictionScore(
  frequencyScore: number,
  recencyScore: number,
  popularityScore: number
): number {
  // Eviction Score formula: 0.40 * Frequency + 0.30 * Recency + 0.30 * Popularity
  const raw = 0.4 * frequencyScore + 0.3 * recencyScore + 0.3 * popularityScore;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function evaluateEvictions(
  entries: CacheEntry[],
  statsMap: Map<string, ProductStats>,
  maxCapacity: number,
  currentTimeMs: number,
  targetPurgeCount?: number
): EvictionResult {
  const currentCount = entries.length;
  const pressurePercent = Math.round((currentCount / Math.max(1, maxCapacity)) * 100);

  // If cache is under 90% pressure and no forced purge requested, no eviction needed
  if (pressurePercent < 90 && (!targetPurgeCount || targetPurgeCount <= 0)) {
    return {
      triggered: false,
      pressurePercent,
      evictedCount: 0,
      evictedItems: [],
      retainedCount: currentCount,
      reason: `Cache operating within normal capacity (${pressurePercent}% utilization).`,
    };
  }

  // Rank all entries by Eviction Score (ascending: lowest score is prime target to evict)
  const scoredCandidates: EvictionCandidate[] = entries.map((entry) => {
    const stats = statsMap.get(entry.value.id);
    const frequency = stats?.frequencyScore ?? 10;
    const recency = stats?.recencyScore ?? 10;
    const popularity = stats?.popularityScore ?? 10;
    const evictionScore = calculateEvictionScore(frequency, recency, popularity);

    const remainingTtlSeconds = Math.max(0, Math.round((entry.expiresAt - currentTimeMs) / 1000));

    let reason = `Eviction score: ${evictionScore}/100 (Freq: ${frequency}, Recency: ${recency}, Pop: ${popularity})`;
    if (popularity < 25) {
      reason += ' — Low demand & cold traffic profile';
    } else if (recency < 20) {
      reason += ' — Stale entry with decaying access recency';
    }

    return {
      key: entry.key,
      productId: entry.value.id,
      productName: entry.value.name,
      evictionScore,
      frequencyComponent: frequency,
      recencyComponent: recency,
      popularityComponent: popularity,
      remainingTtlSeconds,
      reason,
    };
  });

  // Sort ascending (lowest eviction score first)
  scoredCandidates.sort((a, b) => {
    if (a.evictionScore !== b.evictionScore) {
      return a.evictionScore - b.evictionScore;
    }
    return a.remainingTtlSeconds - b.remainingTtlSeconds;
  });

  // Determine how many items to evict to bring utilization down to ~75% or honor targetPurgeCount
  const itemsToRelievePressure = Math.max(1, Math.ceil(currentCount - maxCapacity * 0.75));
  const countToEvict = targetPurgeCount ?? Math.max(1, itemsToRelievePressure);

  const evictedItems = scoredCandidates.slice(0, countToEvict);

  return {
    triggered: true,
    pressurePercent,
    evictedCount: evictedItems.length,
    evictedItems,
    retainedCount: currentCount - evictedItems.length,
    reason: `Cache Pressure ${pressurePercent}% (>90% threshold). Smart Eviction pruned ${evictedItems.length} low-value entries to protect high-demand assets.`,
  };
}
