import { NextRequest, NextResponse } from 'next/server';
import { stateManager } from '@/lib/engine/state-manager';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await stateManager.requestProduct(id);

    const headers = new Headers({
      'X-Cache-Status': result.cacheHit ? 'HIT' : 'MISS',
      'X-Latency-Ms': result.latencyMs.toString(),
      'X-TTL-Remaining': result.ttlRemainingSeconds.toString(),
      'X-Popularity-Score': result.popularityScore.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: result.product,
        cache: {
          hit: result.cacheHit,
          status: result.cacheHit ? 'HIT' : 'MISS',
          latencyMs: result.latencyMs,
          ttlRemainingSeconds: result.ttlRemainingSeconds,
          popularityScore: result.popularityScore,
          lifecycleStatus: result.status,
          decisionReason: result.reason,
        },
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Product not found';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 404 }
    );
  }
}
