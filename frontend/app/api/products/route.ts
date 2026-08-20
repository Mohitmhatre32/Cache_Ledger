import { NextRequest, NextResponse } from 'next/server';
import { stateManager } from '@/lib/engine/state-manager';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    const products = stateManager.getProducts();
    const statsList = stateManager.getProductStats();
    const statsMap = new Map(statsList.map((s) => [s.productId, s]));

    let results = products.map((prod) => ({
      ...prod,
      stats: statsMap.get(prod.id),
    }));

    if (category && category !== 'ALL') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      products: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
