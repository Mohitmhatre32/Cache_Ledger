import { CacheEntry, Product } from '@/types';

/**
 * Cache Store Layer (SRS FR-02, FR-03, FR-04, FR-17)
 * High-performance Cache-Aside engine with TTL-based expiration and memory tracking.
 */

class CacheStore {
  private cache: Map<string, CacheEntry> = new Map();
  private totalHits: number = 0;
  private totalMisses: number = 0;
  private totalSets: number = 0;
  private totalEvictions: number = 0;

  constructor() {
    // Run background cleanup timer every 2 seconds to prune naturally expired keys
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.pruneExpired();
      }, 2000);
    }
  }

  /**
   * Get product from cache
   */
  public get(key: string, currentTimeMs: number = Date.now()): { hit: boolean; value: Product | null; entry?: CacheEntry } {
    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      return { hit: false, value: null };
    }

    // Check if expired
    if (currentTimeMs >= entry.expiresAt) {
      this.cache.delete(key);
      this.totalMisses++;
      return { hit: false, value: null };
    }

    // Cache HIT
    this.totalHits++;
    entry.lastAccessedAt = currentTimeMs;
    entry.accessCount++;
    entry.hitCount++;

    return { hit: true, value: entry.value, entry };
  }

  /**
   * Store product in cache with specific TTL in seconds
   */
  public set(key: string, value: Product, ttlSeconds: number, currentTimeMs: number = Date.now()): CacheEntry {
    const sizeBytes = this.estimateSizeBytes(value);
    const expiresAt = currentTimeMs + ttlSeconds * 1000;

    const existing = this.cache.get(key);
    const entry: CacheEntry = {
      key,
      value,
      ttlSeconds,
      initialTtlSeconds: ttlSeconds,
      expiresAt,
      createdAt: existing?.createdAt ?? currentTimeMs,
      lastAccessedAt: currentTimeMs,
      accessCount: (existing?.accessCount ?? 0) + 1,
      hitCount: existing?.hitCount ?? 0,
      sizeBytes,
    };

    this.cache.set(key, entry);
    this.totalSets++;
    return entry;
  }

  /**
   * Update TTL of an existing cached item without resetting its value or access stats
   */
  public updateTTL(key: string, newTtlSeconds: number, currentTimeMs: number = Date.now()): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.ttlSeconds = newTtlSeconds;
    entry.expiresAt = currentTimeMs + newTtlSeconds * 1000;
    return true;
  }

  /**
   * Delete specific key
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Evict items manually or from eviction engine
   */
  public evict(keys: string[]): number {
    let count = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) {
        count++;
        this.totalEvictions++;
      }
    }
    return count;
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Reset all counters and cache
   */
  public resetMetrics(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
    this.totalSets = 0;
    this.totalEvictions = 0;
  }

  /**
   * Return all currently valid entries
   */
  public getEntries(currentTimeMs: number = Date.now()): CacheEntry[] {
    const valid: CacheEntry[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (currentTimeMs < entry.expiresAt) {
        valid.push(entry);
      } else {
        this.cache.delete(key);
      }
    }
    return valid;
  }

  /**
   * Total count of valid items in cache
   */
  public size(currentTimeMs: number = Date.now()): number {
    return this.getEntries(currentTimeMs).length;
  }

  /**
   * Estimated total bytes in memory
   */
  public getMemoryUsageBytes(currentTimeMs: number = Date.now()): number {
    let bytes = 0;
    for (const entry of this.getEntries(currentTimeMs)) {
      bytes += entry.sizeBytes;
    }
    return bytes;
  }

  /**
   * Prune naturally expired keys
   */
  public pruneExpired(currentTimeMs: number = Date.now()): number {
    let pruned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (currentTimeMs >= entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Returns lifetime hit and miss counters
   */
  public getStats() {
    return {
      hits: this.totalHits,
      misses: this.totalMisses,
      sets: this.totalSets,
      evictions: this.totalEvictions,
      itemCount: this.cache.size,
    };
  }

  private estimateSizeBytes(product: Product): number {
    const json = JSON.stringify(product);
    return json.length * 2 + 128; // String UTF-16 representation + object overhead in bytes
  }
}

// Global Singleton instance for Next.js API lifecycle
const globalForCache = globalThis as unknown as { cacheStoreSingleton?: CacheStore };
export const cacheStore = globalForCache.cacheStoreSingleton ?? new CacheStore();
if (process.env.NODE_ENV !== 'production') globalForCache.cacheStoreSingleton = cacheStore;
