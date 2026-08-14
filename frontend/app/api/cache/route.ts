import { NextRequest, NextResponse } from 'next/server';
import { cacheStore } from '@/lib/engine/cache-store';
import { stateManager } from '@/lib/engine/state-manager';
import { evaluateEvictions } from '@/lib/engine/eviction-engine';

export async function GET() {
  const now = Date.now();
  const entries = cacheStore.getEntries(now).map((e) => ({
    key: e.key,
    productId: e.value.id,
    productName: e.value.name,
    category: e.value.category,
    price: e.value.price,
    ttlSeconds: e.ttlSeconds,
    remainingSeconds: Math.max(0, Math.round((e.expiresAt - now) / 1000)),
    accessCount: e.accessCount,
    hitCount: e.hitCount,
    sizeBytes: e.sizeBytes,
    createdAt: new Date(e.createdAt).toLocaleTimeString(),
    expiresAt: new Date(e.expiresAt).toLocaleTimeString(),
  }));

  const statsMap = new Map(stateManager.getProductStats().map((s) => [s.productId, s]));
  const evictionAnalysis = evaluateEvictions(
    cacheStore.getEntries(now),
    statsMap,
    stateManager.getConfig().cacheCapacityMaxItems,
    now,
    0
  );

  return NextResponse.json({
    success: true,
    count: entries.length,
    memoryBytes: cacheStore.getMemoryUsageBytes(now),
    entries,
    evictionCandidates: evictionAnalysis.evictedItems,
    cacheUtilizationPercent: Math.round(
      (entries.length / Math.max(1, stateManager.getConfig().cacheCapacityMaxItems)) * 100
    ),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, keys, count } = body;

    const now = Date.now();

    if (action === 'clear') {
      cacheStore.clear();
      return NextResponse.json({ success: true, message: 'Cache flushed completely' });
    }

    if (action === 'evict') {
      if (key) {
        cacheStore.delete(key);
      } else if (keys && Array.isArray(keys)) {
        cacheStore.evict(keys);
      } else {
        // Trigger smart eviction on lowest ranked items
        const statsMap = new Map(stateManager.getProductStats().map((s) => [s.productId, s]));
        const res = evaluateEvictions(
          cacheStore.getEntries(now),
          statsMap,
          stateManager.getConfig().cacheCapacityMaxItems,
          now,
          count || 3
        );
        const evictedKeys = res.evictedItems.map((i) => i.key);
        cacheStore.evict(evictedKeys);
      }
      return NextResponse.json({ success: true, message: 'Eviction executed' });
    }

    if (action === 'recalculate') {
      stateManager.tick(now);
      return NextResponse.json({ success: true, message: 'All TTLs and Popularities recalculated' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
