import { NextResponse } from 'next/server';
import { stateManager } from '@/lib/engine/state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    events: stateManager.getEvents(40),
  });
}
