'use client';

import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ProductStats } from '@/types';
import { formatTTLDisplay } from '@/lib/engine/ttl-engine';

interface CacheTableProps {
  stats: ProductStats[];
  onInspectProduct: (productId: string) => void;
  onManualRequest: (productId: string) => void;
}

export const CacheTable: React.FC<CacheTableProps> = ({
  stats,
  onInspectProduct,
  onManualRequest,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const categories = ['ALL', 'Smartphones', 'Laptops', 'Audio', 'Gaming', 'Wearables', 'Accessories', 'Electronics', 'Cameras'];

  const filteredStats = stats.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CACHED' && s.status === 'CACHED') ||
      (statusFilter === 'EVICT' && s.status === 'EVICT_CANDIDATE') ||
      (statusFilter === 'UNCACHED' && (s.status === 'UNCACHED' || s.status === 'EXPIRED'));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="theme-card p-5 space-y-4 font-sans shadow-sm">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--primary)]" />
            Intelligent Cache Directory & TTL Matrix
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Real-time popularity scoring, adaptive TTL decisions, and access analytics across all catalog items
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] w-44 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] cursor-pointer font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border)] bg-[var(--muted)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            <tr>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3 text-center">Popularity</th>
              <th className="py-3 px-3 text-center">Dynamic TTL</th>
              <th className="py-3 px-3 text-center">Engine Decision</th>
              <th className="py-3 px-3 text-center">Traffic & Hit Rate</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {filteredStats.map((item) => {
              const score = item.popularityScore;
              const isHot = score >= 80;
              const isWarm = score >= 40 && score < 80;

              return (
                <tr
                  key={item.productId}
                  className="hover:bg-[var(--muted)]/40 transition-colors group"
                >
                  {/* Product Info */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5 font-mono">
                      <span className="rounded bg-[var(--muted)] px-1.5 py-0.2 border border-[var(--border)] font-sans">{item.category}</span>
                      <span>ID: {item.productId}</span>
                    </div>
                  </td>

                  {/* Popularity Score Meter */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isHot
                            ? 'text-[var(--primary)]'
                            : isWarm
                            ? 'text-[var(--secondary-foreground)]'
                            : 'text-[var(--muted-foreground)]'
                        }`}
                      >
                        {score}/100
                      </span>
                      <div className="w-16 bg-[var(--muted)] rounded-full h-1 mt-1 overflow-hidden border border-[var(--border)]">
                        <div
                          className="h-1 rounded-full bg-[var(--primary)]"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Dynamic TTL */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 bg-[var(--muted)] border border-[var(--border)] px-2.5 py-1 rounded-[var(--radius)] font-mono text-xs font-bold text-[var(--foreground)]">
                      <Clock className="h-3 w-3 text-[var(--primary)]" />
                      {formatTTLDisplay(item.currentTTL)}
                    </div>
                  </td>

                  {/* Decision Badge */}
                  <td className="py-3 px-3 text-center">
                    {item.currentTTL > item.previousTTL && item.previousTTL > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-[var(--radius)] bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent-foreground)] border border-[var(--border)]">
                        <ArrowUpRight className="h-3 w-3 text-[var(--primary)]" />
                        ↑ Increased
                      </span>
                    ) : item.currentTTL < item.previousTTL && item.previousTTL > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-[var(--radius)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--destructive)] border border-[var(--border)]">
                        <ArrowDownRight className="h-3 w-3 text-[var(--destructive)]" />
                        ↓ Decreased
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-[var(--radius)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)] border border-[var(--border)]">
                        <Check className="h-3 w-3 text-[var(--muted-foreground)]" />
                        Maintained
                      </span>
                    )}
                  </td>

                  {/* Traffic & Hit Rate */}
                  <td className="py-3 px-3 text-center font-mono">
                    <div className="text-[var(--foreground)] font-bold">{item.totalRequests} reqs</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      <span className="text-[var(--primary)] font-bold">{item.hitRate}%</span> hit rate
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {item.status === 'CACHED' ? (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 text-[11px] font-bold shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-foreground)] animate-pulse" />
                        CACHED
                      </span>
                    ) : item.status === 'EVICT_CANDIDATE' ? (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--destructive)] text-[var(--destructive-foreground)] px-2 py-0.5 text-[11px] font-bold">
                        EVICT CANDIDATE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium">
                        UNCACHED
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onManualRequest(item.productId)}
                        title="Simulate 1 user request"
                        className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] px-2.5 py-1 text-[11px] font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                      >
                        Request
                      </button>
                      <button
                        onClick={() => onInspectProduct(item.productId)}
                        title="Inspect dynamic math & formula"
                        className="rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-1 text-[11px] font-bold hover:opacity-90 transition-all flex items-center gap-0.5"
                      >
                        Why?
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
