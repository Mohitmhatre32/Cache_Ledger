import {
  Product,
  ProductStats,
  CacheEvent,
  CostConfig,
  SystemMetrics,
  TimeSeriesPoint,
  ScenarioType,
  TrafficScenario,
} from '@/types';
import { SEED_PRODUCTS } from './products-data';
import { cacheStore } from './cache-store';
import { calculatePopularityScore } from './popularity-engine';
import { evaluateTTLDecision, getTTLForScore } from './ttl-engine';
import { evaluateEvictions } from './eviction-engine';
import { calculateCostMetrics } from './cost-engine';

export class StateManager {
  private products: Map<string, Product> = new Map();
  private stats: Map<string, ProductStats> = new Map();
  private events: CacheEvent[] = [];
  private history: TimeSeriesPoint[] = [];
  private config: CostConfig = {
    dbCostPerRequest: 0.0001,
    cacheCostPerGB: 0.15,
    cacheCapacityMaxItems: 18, // Optimal interactive size for demo & visual pressure
    staticTTLSeconds: 600, // 10 minutes for static baseline
    cachingMode: 'intelligent',
  };

  private currentScenario: ScenarioType = 'NORMAL';
  private isSimulatorRunning: boolean = false;
  private simulationSpeedMultiplier: number = 1;
  private simulatorIntervalHandle: NodeJS.Timeout | null = null;
  private totalRequests: number = 0;
  private totalDbRequests: number = 0;
  private requestsInCurrentWindow: number = 0;
  private lastWindowResetMs: number = Date.now();
  private windowProductRequests: Map<string, number> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Seed products and initialize stats
    for (const prod of SEED_PRODUCTS) {
      this.products.set(prod.id, prod);

      const initialTtlInfo = getTTLForScore(prod.baseDemand === 'HOT' ? 85 : prod.baseDemand === 'WARM' ? 50 : 15);
      const initialScore = prod.baseDemand === 'HOT' ? 85 : prod.baseDemand === 'WARM' ? 50 : 15;

      this.stats.set(prod.id, {
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        totalRequests: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
        popularityScore: initialScore,
        frequencyScore: initialScore,
        recencyScore: initialScore,
        growthScore: 50,
        historicalScore: prod.baseDemand === 'HOT' ? 80 : prod.baseDemand === 'WARM' ? 50 : 20,
        currentTTL: initialTtlInfo.ttlSeconds,
        previousTTL: 0,
        status: 'UNCACHED',
        lastAccessed: 0,
        lastTtlChangeReason: 'Initialized from base demand tier.',
        recentTrafficHistory: [0, 0, 0],
      });
    }

    // Seed initial time-series history
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      this.history.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: t.getTime(),
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
        dbRequests: 0,
        dbRequestsAvoided: 0,
        cumulativeSavings: 0,
        cacheUtilization: 0,
        avgLatency: 45,
      });
    }
  }

  /**
   * Request a product through the Cache-Aside pattern
   */
  public async requestProduct(productId: string): Promise<{
    product: Product;
    cacheHit: boolean;
    ttlRemainingSeconds: number;
    latencyMs: number;
    popularityScore: number;
    status: string;
    reason?: string;
  }> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const now = Date.now();
    this.totalRequests++;
    this.requestsInCurrentWindow++;
    const currentProdWindowCount = (this.windowProductRequests.get(productId) ?? 0) + 1;
    this.windowProductRequests.set(productId, currentProdWindowCount);

    const stats = this.stats.get(productId)!;
    stats.totalRequests++;
    stats.lastAccessed = now;

    // 1. Check Cache
    const cacheKey = `product:${productId}`;
    const cachedResult = cacheStore.get(cacheKey, now);

    let cacheHit = false;
    let latencyMs = 0;
    let ttlSecondsToApply = this.config.staticTTLSeconds;

    if (cachedResult.hit && cachedResult.value) {
      // CACHE HIT
      cacheHit = true;
      stats.hits++;
      latencyMs = Math.round(1.5 + Math.random() * 2.5); // Fast memory lookup ~2ms

      this.addEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        timestampMs: now,
        productId,
        productName: product.name,
        eventType: 'CACHE_HIT',
        latencyMs,
        details: `Cache HIT (${latencyMs}ms) — Served from Redis memory. Avoided DB query.`,
      });
    } else {
      // CACHE MISS (Database Query)
      cacheHit = false;
      stats.misses++;
      this.totalDbRequests++;
      latencyMs = Math.round(38 + Math.random() * 22); // DB roundtrip ~45ms

      // Check Cache Pressure & Smart Eviction before inserting
      if (this.config.cachingMode === 'intelligent') {
        const evictionCheck = evaluateEvictions(
          cacheStore.getEntries(now),
          this.stats,
          this.config.cacheCapacityMaxItems,
          now
        );

        if (evictionCheck.triggered && evictionCheck.evictedItems.length > 0) {
          const keysToEvict = evictionCheck.evictedItems.map((item) => item.key);
          cacheStore.evict(keysToEvict);

          for (const evicted of evictionCheck.evictedItems) {
            const evictedStats = this.stats.get(evicted.productId);
            if (evictedStats) evictedStats.status = 'EVICT_CANDIDATE';

            this.addEvent({
              id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date().toLocaleTimeString(),
              timestampMs: now,
              productId: evicted.productId,
              productName: evicted.productName,
              eventType: 'CACHE_EVICTION',
              latencyMs: 1,
              details: `Smart Eviction: Removed '${evicted.productName}' to relieve pressure (${evictionCheck.pressurePercent}%).`,
              reason: evicted.reason,
            });
          }
        }
      }

      // Calculate Dynamic TTL if in intelligent mode
      if (this.config.cachingMode === 'intelligent') {
        const popResult = calculatePopularityScore(
          currentProdWindowCount,
          Math.max(...Array.from(this.windowProductRequests.values())),
          stats.lastAccessed,
          now,
          stats.recentTrafficHistory,
          stats.totalRequests,
          product.baseDemand
        );

        stats.popularityScore = popResult.score;
        stats.frequencyScore = popResult.frequencyScore;
        stats.recencyScore = popResult.recencyScore;
        stats.growthScore = popResult.growthScore;
        stats.historicalScore = popResult.historicalScore;

        const decision = evaluateTTLDecision(
          product.name,
          popResult.score,
          stats.currentTTL,
          popResult.frequencyScore,
          popResult.recencyScore,
          popResult.growthScore,
          popResult.trend
        );

        ttlSecondsToApply = decision.ttlSeconds;
        stats.previousTTL = stats.currentTTL;
        stats.currentTTL = ttlSecondsToApply;
        stats.lastTtlChangeReason = decision.reason;

        if (decision.hasChanged && decision.action !== 'MAINTAIN') {
          this.addEvent({
            id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toLocaleTimeString(),
            timestampMs: now,
            productId,
            productName: product.name,
            eventType: decision.action === 'INCREASE' ? 'TTL_INCREASE' : 'TTL_DECREASE',
            latencyMs: 1,
            details: `Dynamic TTL: ${decision.action === 'INCREASE' ? '↑' : '↓'} TTL adjusted to ${decision.tierLabel}`,
            reason: decision.reason,
          });
        }
      }

      // Store in Cache
      cacheStore.set(cacheKey, product, ttlSecondsToApply, now);
      stats.status = 'CACHED';

      this.addEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        timestampMs: now,
        productId,
        productName: product.name,
        eventType: 'CACHE_MISS',
        latencyMs,
        details: `Cache MISS (${latencyMs}ms) — Fetched from PostgreSQL DB & cached with TTL ${ttlSecondsToApply}s.`,
      });
    }

    stats.hitRate = stats.totalRequests > 0 ? Math.round((stats.hits / stats.totalRequests) * 100) : 0;

    // Remaining TTL
    const entry = cacheStore.getEntries(now).find((e) => e.key === cacheKey);
    const ttlRemainingSeconds = entry ? Math.max(0, Math.round((entry.expiresAt - now) / 1000)) : 0;

    return {
      product,
      cacheHit,
      ttlRemainingSeconds,
      latencyMs,
      popularityScore: stats.popularityScore,
      status: stats.status,
      reason: stats.lastTtlChangeReason,
    };
  }

  /**
   * Periodic recalculation & traffic tick (called by traffic simulator or timer)
   */
  public tick(currentTimeMs: number = Date.now()) {
    // 1. Recalculate popularity & TTLs across all products
    const maxWindowCount = Math.max(1, ...Array.from(this.windowProductRequests.values()));

    for (const [prodId, stats] of this.stats.entries()) {
      const prod = this.products.get(prodId)!;
      const windowCount = this.windowProductRequests.get(prodId) ?? 0;

      // Update traffic history
      stats.recentTrafficHistory.push(windowCount);
      if (stats.recentTrafficHistory.length > 5) stats.recentTrafficHistory.shift();

      if (this.config.cachingMode === 'intelligent') {
        const popResult = calculatePopularityScore(
          windowCount,
          maxWindowCount,
          stats.lastAccessed,
          currentTimeMs,
          stats.recentTrafficHistory,
          stats.totalRequests,
          prod.baseDemand
        );

        const oldScore = stats.popularityScore;
        stats.popularityScore = popResult.score;
        stats.frequencyScore = popResult.frequencyScore;
        stats.recencyScore = popResult.recencyScore;
        stats.growthScore = popResult.growthScore;
        stats.historicalScore = popResult.historicalScore;

        const decision = evaluateTTLDecision(
          prod.name,
          popResult.score,
          stats.currentTTL,
          popResult.frequencyScore,
          popResult.recencyScore,
          popResult.growthScore,
          popResult.trend
        );

        if (decision.hasChanged && Math.abs(oldScore - popResult.score) >= 10) {
          stats.previousTTL = stats.currentTTL;
          stats.currentTTL = decision.ttlSeconds;
          stats.lastTtlChangeReason = decision.reason;
          cacheStore.updateTTL(`product:${prodId}`, decision.ttlSeconds, currentTimeMs);

          this.addEvent({
            id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toLocaleTimeString(),
            timestampMs: currentTimeMs,
            productId: prodId,
            productName: prod.name,
            eventType: decision.action === 'INCREASE' ? 'TTL_INCREASE' : 'TTL_DECREASE',
            latencyMs: 1,
            details: `Auto-Tuned TTL: ${decision.reason}`,
            reason: decision.reason,
          });
        }
      }

      // Update cached status
      const isCached = cacheStore.getEntries(currentTimeMs).some((e) => e.key === `product:${prodId}`);
      if (isCached) {
        stats.status = 'CACHED';
      } else if (stats.status === 'CACHED') {
        stats.status = 'EXPIRED';
      }
    }

    // Reset window counters every tick interval
    this.windowProductRequests.clear();
    this.requestsInCurrentWindow = 0;
    this.lastWindowResetMs = currentTimeMs;

    // Record time-series snapshot
    const metrics = this.getMetrics(currentTimeMs);
    const timeStr = new Date(currentTimeMs).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    this.history.push({
      time: timeStr,
      timestamp: currentTimeMs,
      hitRate: metrics.hitRate,
      totalRequests: metrics.totalRequests,
      cacheHits: metrics.cacheHits,
      dbRequests: metrics.dbRequests,
      dbRequestsAvoided: metrics.dbRequestsAvoided,
      cumulativeSavings: metrics.estimatedDbSavings,
      cacheUtilization: metrics.cacheUtilizationPercent,
      avgLatency: metrics.avgLatencyMs,
    });

    if (this.history.length > 40) {
      this.history.shift();
    }
  }

  public getMetrics(currentTimeMs: number = Date.now()): SystemMetrics {
    const cacheStats = cacheStore.getStats();
    const hits = cacheStats.hits;
    const misses = cacheStats.misses;
    const total = this.totalRequests;
    const dbReqs = this.totalDbRequests;
    const avoided = Math.max(0, total - dbReqs);

    const hitRate = total > 0 ? Number(((hits / total) * 100).toFixed(1)) : 0;
    const missRate = Number((100 - hitRate).toFixed(1));

    const costBreakdown = calculateCostMetrics(
      total,
      hits,
      dbReqs,
      cacheStore.getMemoryUsageBytes(currentTimeMs),
      this.config
    );

    const cachedItemsCount = cacheStore.size(currentTimeMs);
    const cacheUtilizationPercent = Math.min(
      100,
      Math.round((cachedItemsCount / Math.max(1, this.config.cacheCapacityMaxItems)) * 100)
    );

    const avgLatency =
      total > 0
        ? Number(((hits * 2.2 + dbReqs * 46.8) / total).toFixed(1))
        : 0;

    return {
      totalRequests: total,
      cacheHits: hits,
      cacheMisses: misses,
      hitRate,
      missRate,
      dbRequests: dbReqs,
      dbRequestsAvoided: avoided,
      estimatedDbSavings: costBreakdown.estimatedDbSavings,
      estimatedCacheCost: costBreakdown.estimatedCacheCost,
      netSavings: costBreakdown.netSavings,
      cachedItemsCount,
      cacheCapacity: this.config.cacheCapacityMaxItems,
      cacheUtilizationPercent,
      totalEvictions: cacheStats.evictions,
      avgLatencyMs: avgLatency,
      cacheLatencyMs: 2.2,
      dbLatencyMs: 46.8,
      requestsPerSecond: Math.round((total / Math.max(1, (currentTimeMs - (this.history[0]?.timestamp ?? currentTimeMs)) / 1000))),
      requestsPerMinute: Math.round((total / Math.max(1, (currentTimeMs - (this.history[0]?.timestamp ?? currentTimeMs)) / 60000))),
      cachingMode: this.config.cachingMode,
    };
  }

  public getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  public getProductStats(): ProductStats[] {
    return Array.from(this.stats.values());
  }

  public getEvents(limit: number = 30): CacheEvent[] {
    return this.events.slice(0, limit);
  }

  public getHistory(): TimeSeriesPoint[] {
    return this.history;
  }

  public getConfig(): CostConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<CostConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getScenario(): ScenarioType {
    return this.currentScenario;
  }

  public setScenario(scenario: ScenarioType) {
    this.currentScenario = scenario;
    this.addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      timestampMs: Date.now(),
      productId: 'system',
      productName: 'Traffic Simulator',
      eventType: 'CACHE_SET',
      latencyMs: 0,
      details: `Switched Traffic Scenario to: ${scenario}`,
    });
  }

  public isRunning(): boolean {
    return this.isSimulatorRunning;
  }

  public setSimulatorRunning(running: boolean, multiplier: number = 1) {
    this.isSimulatorRunning = running;
    this.simulationSpeedMultiplier = multiplier;
  }

  public resetAll() {
    cacheStore.resetMetrics();
    this.totalRequests = 0;
    this.totalDbRequests = 0;
    this.requestsInCurrentWindow = 0;
    this.windowProductRequests.clear();
    this.events = [];
    this.history = [];
    this.initialize();
  }

  private addEvent(event: CacheEvent) {
    this.events.unshift(event);
    if (this.events.length > 80) {
      this.events.pop();
    }
  }
}

// Global Singleton for Next.js API lifecycle
const globalForState = globalThis as unknown as { stateManagerSingleton?: StateManager };
export const stateManager = globalForState.stateManagerSingleton ?? new StateManager();
if (process.env.NODE_ENV !== 'production') globalForState.stateManagerSingleton = stateManager;
