import { NextResponse } from 'next/server';
import { stateManager } from '@/lib/engine/state-manager';
import { cacheStore } from '@/lib/engine/cache-store';
import { computeBenchmarkComparison } from '@/lib/engine/cost-engine';
import { trafficSimulator } from '@/lib/engine/traffic-simulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = Date.now();
    const metrics = stateManager.getMetrics(now);
    const history = stateManager.getHistory();
    const productStats = stateManager.getProductStats();
    const events = stateManager.getEvents(25);
    const config = stateManager.getConfig();
    const simulatorStatus = trafficSimulator.getStatus();

    const benchmark = computeBenchmarkComparison(
      metrics.totalRequests,
      metrics.cacheHits,
      metrics.dbRequests,
      metrics.totalEvictions,
      cacheStore.getMemoryUsageBytes(now),
      config
    );

    return NextResponse.json({
      success: true,
      timestamp: now,
      metrics,
      history,
      productStats,
      events,
      config,
      simulatorStatus,
      benchmark,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
