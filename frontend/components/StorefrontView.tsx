'use client';

import React, { useState } from 'react';
import { Product, ProductStats } from '@/types';
import {
  ShoppingBag,
  Zap,
  Database,
  Star,
} from 'lucide-react';
import { formatTTLDisplay } from '@/lib/engine/ttl-engine';

interface StorefrontViewProps {
  products: Product[];
  stats: ProductStats[];
  onInspectProduct: (productId: string) => void;
  onManualRequest: (productId: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  stats,
  onInspectProduct,
  onManualRequest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [lastActionResult, setLastActionResult] = useState<{
    productName: string;
    hit: boolean;
    latency: number;
    ttl: number;
  } | null>(null);

  const statsMap = new Map(stats.map((s) => [s.productId, s]));

  const categories = ['ALL', 'Smartphones', 'Laptops', 'Audio', 'Gaming', 'Wearables', 'Accessories', 'Electronics', 'Cameras'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (prod: Product) => {
    const productStats = statsMap.get(prod.id);
    const isCached = productStats?.status === 'CACHED';
    const latency = isCached ? 2.1 : 46.5;

    setLastActionResult({
      productName: prod.name,
      hit: isCached,
      latency,
      ttl: productStats?.currentTTL || 600,
    });

    onManualRequest(prod.id);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Instructions */}
      <div className="theme-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--muted)] px-2.5 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--border)] mb-2">
              <ShoppingBag className="h-3.5 w-3.5" />
              Interactive E-Commerce Storefront
            </span>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Live Product Catalog & Cache Inspector</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-2xl">
              Click any product to generate realistic client traffic. Watch how the engine serves repeat views
              from Redis memory (~2ms) while routing initial/expired views to the database (~45ms).
            </p>
          </div>

          {/* Toast of last action */}
          {lastActionResult && (
            <div className={`rounded-[var(--radius)] p-3.5 border text-xs shadow-md transition-all ${
              lastActionResult.hit
                ? 'bg-[var(--card)] border-[var(--primary)] text-[var(--foreground)]'
                : 'bg-[var(--card)] border-[var(--destructive)] text-[var(--foreground)]'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {lastActionResult.hit ? (
                  <Zap className="h-4 w-4 text-[var(--primary)] fill-current" />
                ) : (
                  <Database className="h-4 w-4 text-[var(--destructive)]" />
                )}
                <span className={lastActionResult.hit ? 'text-[var(--primary)] font-bold' : 'text-[var(--destructive)] font-bold'}>
                  {lastActionResult.hit ? 'CACHE HIT (Redis)' : 'CACHE MISS (PostgreSQL)'}
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-1">
                {lastActionResult.productName.substring(0, 24)}...
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono flex items-center gap-2">
                <span>Latency: <strong className="text-[var(--foreground)]">{lastActionResult.latency}ms</strong></span>
                <span>TTL: <strong className="text-[var(--foreground)]">{formatTTLDisplay(lastActionResult.ttl)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter catalog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] px-3.5 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] w-full sm:w-60 font-medium"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const productStats = statsMap.get(prod.id);
          const isCached = productStats?.status === 'CACHED';
          const ttl = productStats?.currentTTL || 600;

          return (
            <div
              key={prod.id}
              className="theme-card-hover p-5 flex flex-col justify-between group relative overflow-hidden shadow-sm"
            >
              {/* Top Meta Bar */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)]">
                    {prod.category}
                  </span>

                  {/* Cache Status Badge */}
                  {isCached ? (
                    <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 py-0.5 text-[11px] font-bold shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-foreground)] animate-pulse" />
                      CACHE HIT ({formatTTLDisplay(ttl)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--muted)] text-[var(--muted-foreground)] px-2.5 py-0.5 text-[11px] font-medium border border-[var(--border)]">
                      <Database className="h-3 w-3 text-[var(--muted-foreground)]" />
                      COLD / UNCACHED
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {prod.name}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                  {prod.description}
                </p>

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1 text-[var(--primary)]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold text-[var(--foreground)]">{prod.rating}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">({prod.reviewCount})</span>
                  </div>
                  <span>•</span>
                  <span>Stock: {prod.stock}</span>
                </div>
              </div>

              {/* Bottom Price & Simulator Actions */}
              <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Price</div>
                  <div className="text-xl font-bold font-mono text-[var(--foreground)]">
                    ${prod.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspectProduct(prod.id)}
                    className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--secondary)] p-2 text-[var(--foreground)] transition-all text-xs font-bold"
                    title="Inspect Math & Decision Details"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => handleProductClick(prod)}
                    className="flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold text-xs px-3.5 py-2 shadow-sm transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Request (API)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
