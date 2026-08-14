export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  baseDemand: 'HOT' | 'WARM' | 'COLD';
}

export interface CacheEntry {
  key: string;
  value: Product;
  ttlSeconds: number;
  initialTtlSeconds: number;
  expiresAt: number; // timestamp in ms
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
  hitCount: number;
  sizeBytes: number;
}

export interface ProductStats {
  productId: string;
  name: string;
  category: string;
  totalRequests: number;
  hits: number;
  misses: number;
  hitRate: number;
  popularityScore: number;
  frequencyScore: number;
  recencyScore: number;
  growthScore: number;
  historicalScore: number;
  currentTTL: number; // in seconds
  previousTTL: number;
  status: 'CACHED' | 'UNCACHED' | 'EVICT_CANDIDATE' | 'EXPIRED';
  lastAccessed: number;
  lastTtlChangeReason?: string;
  recentTrafficHistory: number[]; // request count in recent intervals
}

export type EventType =
  | 'CACHE_HIT'
  | 'CACHE_MISS'
  | 'CACHE_SET'
  | 'CACHE_EVICTION'
  | 'TTL_INCREASE'
  | 'TTL_DECREASE';

export interface CacheEvent {
  id: string;
  timestamp: string;
  timestampMs: number;
  productId: string;
  productName: string;
  eventType: EventType;
  latencyMs: number;
  details: string;
  reason?: string;
}

export interface CostConfig {
  dbCostPerRequest: number; // e.g. $0.0001 or $0.00001
  cacheCostPerGB: number; // e.g. $0.15 / GB
  cacheCapacityMaxItems: number; // e.g. 30 items for interactive demo
  staticTTLSeconds: number; // e.g. 600 seconds (10 min)
  cachingMode: 'intelligent' | 'static' | 'disabled';
}

export interface SystemMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  missRate: number;
  dbRequests: number;
  dbRequestsAvoided: number;
  estimatedDbSavings: number;
  estimatedCacheCost: number;
  netSavings: number;
  cachedItemsCount: number;
  cacheCapacity: number;
  cacheUtilizationPercent: number;
  totalEvictions: number;
  avgLatencyMs: number;
  cacheLatencyMs: number;
  dbLatencyMs: number;
  requestsPerSecond: number;
  requestsPerMinute: number;
  cachingMode: 'intelligent' | 'static' | 'disabled';
}

export interface TimeSeriesPoint {
  time: string;
  timestamp: number;
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  dbRequests: number;
  dbRequestsAvoided: number;
  cumulativeSavings: number;
  cacheUtilization: number;
  avgLatency: number;
}

export type ScenarioType = 'NORMAL' | 'VIRAL_SURGE' | 'PRODUCT_DECLINE' | 'CACHE_PRESSURE' | 'FLASH_SALE';

export interface TrafficScenario {
  id: ScenarioType;
  name: string;
  description: string;
  badge: string;
  viralProductIds?: string[];
  decliningProductIds?: string[];
  trafficRate: number; // requests per interval
  pressureIntensity?: number;
}

export interface BenchmarkComparison {
  intelligent: {
    hitRate: number;
    dbRequests: number;
    dbRequestsAvoided: number;
    savings: number;
    avgLatency: number;
    cacheUtilization: number;
    evictions: number;
  };
  staticTTL: {
    hitRate: number;
    dbRequests: number;
    dbRequestsAvoided: number;
    savings: number;
    avgLatency: number;
    cacheUtilization: number;
    evictions: number;
  };
  noCache: {
    hitRate: number;
    dbRequests: number;
    dbRequestsAvoided: number;
    savings: number;
    avgLatency: number;
  };
  improvementPercent: {
    hitRate: number;
    dbReduction: number;
    savings: number;
    latencyReduction: number;
  };
}
