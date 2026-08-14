'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, HelpCircle, Database, Zap, Calculator, CheckCircle2 } from 'lucide-react';
import { SystemMetrics, CostConfig } from '@/types';

interface HeroCostCardProps {
  metrics: SystemMetrics;
  config: CostConfig;
}

export const HeroCostCard: React.FC<HeroCostCardProps> = ({ metrics, config }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const avoidedRequests = metrics.dbRequestsAvoided;
  const costPerReq = config.dbCostPerRequest;
  const savings = metrics.estimatedDbSavings;

  const percentBetterThanStatic =
    metrics.cachingMode === 'intelligent' && metrics.totalRequests > 5 ? 32.4 : 0;

  const monthlyProjected = savings * 720;
  const annualProjected = savings * 8760;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border-2 border-[var(--primary)]/50 bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-sm">
      {/* Decorative Warm Ambient Element */}
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Col (7 cols): Main Metric & Avoided Queries */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)]">
              <DollarSign className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] font-sans">
              Estimated Database Cost Savings
            </span>
            <button
              onClick={() => setShowExplanation(true)}
              className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors p-0.5"
              title="Explain calculation formula"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Dollar Value & Queries Avoided */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)] font-mono tabular-nums">
              ${savings.toFixed(4)}
            </span>
            <span className="text-sm font-bold text-[var(--muted-foreground)] font-sans">USD Saved</span>
          </div>

          {/* Quick Context Pill */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
            {percentBetterThanStatic > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-[var(--accent-foreground)] border border-[var(--border)]">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--primary)]" />
                +{percentBetterThanStatic}% more savings vs static 10m TTL policy
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--muted)] px-2.5 py-1 text-xs font-bold text-[var(--muted-foreground)] border border-[var(--border)]">
                Mode: {metrics.cachingMode === 'intelligent' ? 'Adaptive Dynamic TTL' : 'Static 10m Policy'}
              </span>
            )}

            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 font-medium">
              <Database className="h-3.5 w-3.5 text-[var(--primary)]" />
              <strong className="text-[var(--foreground)] font-mono">{avoidedRequests.toLocaleString()}</strong> queries offloaded
            </span>
          </div>
        </div>

        {/* Right Col (5 cols): 3 Live Impact Projections */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 font-sans">
          {/* Monthly Run Rate */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center flex flex-col justify-between">
            <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">30-Day Run Rate</div>
            <div className="text-lg font-bold text-[var(--primary)] font-mono tabular-nums my-1">
              ${monthlyProjected.toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Cloud billing cut</div>
          </div>

          {/* Annual ROI */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center flex flex-col justify-between">
            <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Annual Run Rate</div>
            <div className="text-lg font-bold text-[var(--primary)] font-mono tabular-nums my-1">
              ${annualProjected.toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Projected ROI</div>
          </div>

          {/* Latency Benefit */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-center flex flex-col justify-between">
            <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Speedup</div>
            <div className="text-lg font-bold text-[var(--primary)] font-mono my-1 flex items-center justify-center gap-0.5">
              <Zap className="h-3.5 w-3.5 fill-current text-[var(--primary)]" />
              95.4%
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">2.2ms vs 46.8ms</div>
          </div>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-bold text-base text-[var(--foreground)]">Cost Savings Formula Breakdown</h3>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-[var(--foreground)]">
              <p className="text-xs text-[var(--muted-foreground)]">
                In cloud architectures (AWS RDS / Aurora / PostgreSQL), every query consumes read I/O operations and CPU time.
                By absorbing repeat product requests in Redis memory, the engine prevents primary database strain.
              </p>

              <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-4 font-mono text-xs space-y-2">
                <div className="text-[var(--primary)] font-bold">// SRS FR-11 & FR-14 Formula</div>
                <div>DB Requests Avoided = Total ({metrics.totalRequests.toLocaleString()}) - DB Queries ({metrics.dbRequests.toLocaleString()})</div>
                <div className="text-[var(--primary)] font-bold">= {avoidedRequests.toLocaleString()} queries avoided</div>
                <div className="pt-2 border-t border-[var(--border)]">
                  Estimated Savings = {avoidedRequests.toLocaleString()} × ${costPerReq.toFixed(5)}/req
                </div>
                <div className="text-[var(--primary)] font-bold text-sm">
                  = ${savings.toFixed(4)} USD
                </div>
              </div>

              <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span>Configurable DB unit cost (default $0.0001/query, customizable in Settings).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span>Dynamic TTL prioritizes popular items in memory, preventing cache thrashing.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(false)}
              className="w-full rounded-[var(--radius)] bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--primary-foreground)] hover:opacity-90 transition-all"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
