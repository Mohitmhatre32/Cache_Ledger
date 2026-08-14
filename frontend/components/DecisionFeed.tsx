'use client';

import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Database,
  Trash2,
  Info,
} from 'lucide-react';
import { CacheEvent } from '@/types';

interface DecisionFeedProps {
  events: CacheEvent[];
}

export const DecisionFeed: React.FC<DecisionFeedProps> = ({ events }) => {
  return (
    <div className="ui-card p-5 flex flex-col h-full font-sans shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">Live Decision Stream</h3>
        </div>
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono uppercase tracking-wider">Real-Time</span>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
        {events.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)] text-xs font-medium">
            Awaiting traffic... Start the simulator or click a product to see live caching decisions.
          </div>
        ) : (
          events.map((event) => {
            const isHit = event.eventType === 'CACHE_HIT';
            const isMiss = event.eventType === 'CACHE_MISS';
            const isIncrease = event.eventType === 'TTL_INCREASE';
            const isDecrease = event.eventType === 'TTL_DECREASE';
            const isEviction = event.eventType === 'CACHE_EVICTION';

            return (
              <div
                key={event.id}
                className="group relative rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/50 p-2.5 hover:border-[var(--primary)] transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Event Badge Icon */}
                    {isIncrease && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)]">
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                    {isDecrease && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]">
                        <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                    {isHit && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)]">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                      </span>
                    )}
                    {isMiss && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--card)] text-[var(--destructive)] border border-[var(--border)]">
                        <Database className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {isEviction && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--destructive)] text-[var(--destructive-foreground)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    )}

                    <div>
                      <span className="font-bold text-[var(--foreground)]">{event.productName}</span>
                      <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{event.details}</div>
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono tabular-nums whitespace-nowrap">
                    {event.timestamp}
                  </span>
                </div>

                {/* Reason Explanation Callout */}
                {event.reason && (
                  <div className="mt-2 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] p-2 text-[11px] text-[var(--foreground)] flex items-start gap-1.5 font-medium">
                    <Info className="h-3.5 w-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span>{event.reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
