import { NextRequest, NextResponse } from 'next/server';
import { trafficSimulator } from '@/lib/engine/traffic-simulator';
import { stateManager } from '@/lib/engine/state-manager';
import { ScenarioType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: trafficSimulator.getStatus(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, scenario, speed, burstCount, productId } = body;

    switch (action) {
      case 'start':
        trafficSimulator.start(speed || 1);
        break;

      case 'stop':
        trafficSimulator.stop();
        break;

      case 'speed':
        if (speed && typeof speed === 'number') {
          trafficSimulator.setSpeed(speed);
        }
        break;

      case 'scenario':
        if (scenario) {
          stateManager.setScenario(scenario as ScenarioType);
        }
        break;

      case 'burst':
        await trafficSimulator.runBurst(burstCount || 20, productId);
        break;

      case 'reset':
        trafficSimulator.stop();
        stateManager.resetAll();
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: trafficSimulator.getStatus(),
      metrics: stateManager.getMetrics(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
