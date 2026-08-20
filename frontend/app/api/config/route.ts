import { NextRequest, NextResponse } from 'next/server';
import { stateManager } from '@/lib/engine/state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    config: stateManager.getConfig(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    stateManager.updateConfig(body);
    return NextResponse.json({
      success: true,
      config: stateManager.getConfig(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid configuration';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
