'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { Product, ProductStats } from '@/types';
import { formatTTLDisplay } from '@/lib/engine/ttl-engine';

interface ProductInspectModalProps {
  product: Product | null;
  stats: ProductStats | null;
  onClose: () => void;
  onManualRequest: (id: string) => void;
}

export const ProductInspectModal: React.FC<ProductInspectModalProps> = ({
  product,
  stats,
  onClose,
  onManualRequest,
}) => {
  if (!product || !stats) return null;

  const score = stats.popularityScore;
  const isHot = score >= 80;
  const isWarm = score >= 40 && score < 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-2xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-[var(--radius)] bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)] font-mono border border-[var(--border)]">
                {product.id}
              </span>
              <span className="text-xs text-[var(--primary)] font-bold uppercase tracking-wider">
                Algorithmic Inspection & Decision Proof
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">{product.name}</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{product.category} • SKU: {product.sku}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all font-bold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Popularity Score</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[var(--primary)]">
              {score}/100
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">SRS FR-06 Normalized</div>
          </div>

          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Dynamic TTL</div>
            <div className="text-2xl font-bold font-mono text-[var(--foreground)] mt-1">
              {formatTTLDisplay(stats.currentTTL)}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Adaptive Tier</div>
          </div>

          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Hit Rate</div>
            <div className="text-2xl font-bold font-mono text-[var(--primary)] mt-1">
              {stats.hitRate}%
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono">{stats.hits} hits / {stats.totalRequests} reqs</div>
          </div>
        </div>

        {/* Mathematical Breakdown of Popularity Components (SRS FR-06) */}
        <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            Popularity Score Components (Weighted Formula)
          </h4>

          <div className="space-y-2 text-xs">
            {/* Frequency */}
            <div>
              <div className="flex justify-between text-[var(--foreground)] mb-1">
                <span>40% Request Frequency Weight</span>
                <span className="font-mono text-[var(--primary)] font-bold">{stats.frequencyScore}/100 (weighted: {(stats.frequencyScore * 0.4).toFixed(1)})</span>
              </div>
              <div className="w-full bg-[var(--card)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--primary)] h-1.5 rounded-full" style={{ width: `${stats.frequencyScore}%` }} />
              </div>
            </div>

            {/* Recency */}
            <div>
              <div className="flex justify-between text-[var(--foreground)] mb-1">
                <span>30% Access Recency Weight</span>
                <span className="font-mono text-[var(--primary)] font-bold">{stats.recencyScore}/100 (weighted: {(stats.recencyScore * 0.3).toFixed(1)})</span>
              </div>
              <div className="w-full bg-[var(--card)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--secondary-foreground)] h-1.5 rounded-full" style={{ width: `${stats.recencyScore}%` }} />
              </div>
            </div>

            {/* Growth */}
            <div>
              <div className="flex justify-between text-[var(--foreground)] mb-1">
                <span>20% Traffic Growth Velocity Weight</span>
                <span className="font-mono text-[var(--primary)] font-bold">{stats.growthScore}/100 (weighted: {(stats.growthScore * 0.2).toFixed(1)})</span>
              </div>
              <div className="w-full bg-[var(--card)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--primary)] h-1.5 rounded-full" style={{ width: `${stats.growthScore}%` }} />
              </div>
            </div>

            {/* Historical */}
            <div>
              <div className="flex justify-between text-[var(--foreground)] mb-1">
                <span>10% Base Demand & Historical Weight</span>
                <span className="font-mono text-[var(--primary)] font-bold">{stats.historicalScore}/100 (weighted: {(stats.historicalScore * 0.1).toFixed(1)})</span>
              </div>
              <div className="w-full bg-[var(--card)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--muted-foreground)] h-1.5 rounded-full" style={{ width: `${stats.historicalScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Engine Decision Explanation Banner */}
        <div className="rounded-[var(--radius)] bg-[var(--accent)] border border-[var(--border)] p-4 text-[var(--accent-foreground)]">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
                Decision Explainability Log (PRD #20)
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {stats.lastTtlChangeReason || 'Product is currently operating under steady-state adaptive TTL policy.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            Last accessed: {stats.lastAccessed > 0 ? new Date(stats.lastAccessed).toLocaleTimeString() : 'Never'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onManualRequest(product.id)}
              className="rounded-[var(--radius)] bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold px-4 py-2 text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Simulate Request
            </button>
            <button
              onClick={onClose}
              className="rounded-[var(--radius)] bg-[var(--muted)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-4 py-2 text-xs transition-all font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
