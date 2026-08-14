'use client';

import React from 'react';
import {
  Percent,
  Database,
  Activity,
  HardDrive,
  Trash2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { SystemMetrics } from '@/types';

interface KpiGridProps {
  metrics: SystemMetrics;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ metrics }) => {
  const hitRate = metrics.hitRate;
  const isHighPressure = metrics.cacheUtilizationPercent >= 85;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
      {/* 1. Cache Hit Rate */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Cache Hit Rate</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
            <Percent className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-2xl font-extrabold text-[var(--primary)] font-mono tabular-nums">{hitRate.toFixed(1)}%</div>
          <div className="w-full bg-[var(--muted)] rounded-full h-1.5 mt-2 overflow-hidden border border-[var(--border)]">
            <div
              className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${hitRate}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-mono">
          <span>Hits: <strong className="text-[var(--primary)]">{metrics.cacheHits.toLocaleString()}</strong></span>
          <span>Misses: <strong className="text-[var(--destructive)]">{metrics.cacheMisses.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* 2. DB Requests Avoided */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">DB Queries Avoided</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
            <Database className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-2xl font-extrabold text-[var(--foreground)] font-mono tabular-nums">
            {metrics.dbRequestsAvoided.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center gap-1 font-sans">
            <ArrowDownRight className="h-3 w-3 text-[var(--primary)]" />
            <span className="text-[var(--primary)] font-bold">{hitRate.toFixed(0)}%</span> database load relief
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
          Direct DB Queries: <strong className="text-[var(--foreground)]">{metrics.dbRequests.toLocaleString()}</strong>
        </div>
      </div>

      {/* 3. Total Traffic Processed */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Traffic Volume</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-2xl font-extrabold text-[var(--foreground)] font-mono tabular-nums">
            {metrics.totalRequests.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] mt-1 font-sans">
            Total Synthetic API Requests
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-ping" />
          <span>Active Rate: ~{metrics.requestsPerSecond} req/s</span>
        </div>
      </div>

      {/* 4. Cache Utilization */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Cache Capacity</span>
          <div className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] ${
            isHighPressure ? 'bg-[var(--destructive)]/20 text-[var(--destructive)]' : 'bg-[var(--muted)] text-[var(--primary)]'
          }`}>
            {isHighPressure ? <AlertTriangle className="h-4 w-4 animate-bounce" /> : <HardDrive className="h-4 w-4" />}
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${isHighPressure ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'}`}>
              {metrics.cacheUtilizationPercent}%
            </span>
            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              ({metrics.cachedItemsCount}/{metrics.cacheCapacity} keys)
            </span>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-1.5 mt-2 overflow-hidden border border-[var(--border)]">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isHighPressure ? 'bg-[var(--destructive)]' : 'bg-[var(--primary)]'
              }`}
              style={{ width: `${Math.min(100, metrics.cacheUtilizationPercent)}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted-foreground)] font-sans">
          {isHighPressure ? (
            <span className="text-[var(--destructive)] font-bold">⚠️ High Pressure (&gt;85%)</span>
          ) : (
            <span>Optimal Memory Headroom</span>
          )}
        </div>
      </div>

      {/* 5. Smart Evictions */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Smart Evictions</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--destructive)] border border-[var(--border)]">
            <Trash2 className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-2xl font-extrabold text-[var(--destructive)] font-mono tabular-nums">
            {metrics.totalEvictions}
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] mt-1 font-sans">
            Low-value keys pruned under pressure
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted-foreground)] font-sans">
          Algorithm: <strong className="text-[var(--foreground)]">FR-09 Smart Rank</strong>
        </div>
      </div>

      {/* 6. Latency Advantage */}
      <div className="ui-card-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Avg Response Time</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-2xl font-extrabold text-[var(--foreground)] font-mono tabular-nums">
            {metrics.avgLatencyMs > 0 ? `${metrics.avgLatencyMs}ms` : '2.2ms'}
          </div>
          <div className="text-[11px] text-[var(--primary)] font-bold flex items-center gap-1 mt-1 font-sans">
            <ArrowUpRight className="h-3 w-3" />
            2.2ms Cache vs 46.8ms DB
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
          p99 Read Latency &lt; 5ms
        </div>
      </div>
    </div>
  );
};
