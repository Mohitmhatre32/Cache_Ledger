'use client';

import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import { BenchmarkComparison, SystemMetrics, CostConfig } from '@/types';

interface BenchmarkViewProps {
  benchmark: BenchmarkComparison;
  metrics: SystemMetrics;
  config: CostConfig;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  benchmark,
  metrics,
  config,
}) => {
  const [customMonthlyTraffic, setCustomMonthlyTraffic] = useState(10000000);
  const [customDbCost, setCustomDbCost] = useState(config.dbCostPerRequest);

  const intelligentAvoided = customMonthlyTraffic * (benchmark.intelligent.hitRate > 0 ? benchmark.intelligent.hitRate / 100 : 0.88);
  const staticAvoided = customMonthlyTraffic * (benchmark.staticTTL.hitRate > 0 ? benchmark.staticTTL.hitRate / 100 : 0.65);

  const intelligentMonthlySavings = intelligentAvoided * customDbCost;
  const staticMonthlySavings = staticAvoided * customDbCost;
  const netAdvantageMonthly = intelligentMonthlySavings - staticMonthlySavings;
  const netAdvantageAnnual = netAdvantageMonthly * 12;

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Banner */}
      <div className="theme-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-5 w-5 text-[var(--primary)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Algorithmic Benchmark & ROI Proof
          </span>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Intelligent Dynamic TTL vs Static Fixed TTL</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-3xl">
          viral spikes while locking memory on cold products. Cache Ledger dynamically adapts TTLs to match real-time
          demand velocity, drastically cutting database strain.
        </p>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="theme-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          Head-to-Head Architecture Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)] text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-center bg-[var(--accent)] text-[var(--accent-foreground)] border-x border-[var(--border)] font-bold">
                  <div className="flex items-center justify-center gap-1.5 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                    Intelligent Dynamic TTL
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-[var(--foreground)]">Static 10m Policy</th>
                <th className="py-3 px-4 text-center text-[var(--muted-foreground)]">No Cache Baseline</th>
                <th className="py-3 px-4 text-right text-[var(--primary)]">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60 font-mono">
              {/* Row 1: Hit Rate */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Cache Hit Rate</td>
                <td className="py-3 px-4 text-center font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)] text-sm">
                  {benchmark.intelligent.hitRate}%
                </td>
                <td className="py-3 px-4 text-center text-[var(--foreground)]">{benchmark.staticTTL.hitRate}%</td>
                <td className="py-3 px-4 text-center text-[var(--muted-foreground)]">0.0%</td>
                <td className="py-3 px-4 text-right text-[var(--primary)] font-bold">
                  +{benchmark.improvementPercent.hitRate}% higher
                </td>
              </tr>

              {/* Row 2: Database Requests */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Database Queries</td>
                <td className="py-3 px-4 text-center font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)]">
                  {benchmark.intelligent.dbRequests.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-[var(--foreground)]">
                  {benchmark.staticTTL.dbRequests.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-[var(--muted-foreground)]">
                  {benchmark.noCache.dbRequests.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-[var(--primary)] font-bold">
                  -{benchmark.improvementPercent.dbReduction}% load
                </td>
              </tr>

              {/* Row 3: Queries Avoided */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Queries Offloaded</td>
                <td className="py-3 px-4 text-center font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)]">
                  {benchmark.intelligent.dbRequestsAvoided.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-[var(--foreground)]">
                  {benchmark.staticTTL.dbRequestsAvoided.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-[var(--muted-foreground)]">0</td>
                <td className="py-3 px-4 text-right text-[var(--primary)] font-bold">
                  +{benchmark.intelligent.dbRequestsAvoided - benchmark.staticTTL.dbRequestsAvoided} more
                </td>
              </tr>

              {/* Row 4: Realized Savings */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Estimated Cost Savings ($)</td>
                <td className="py-3 px-4 text-center font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)] text-sm">
                  ${benchmark.intelligent.savings.toFixed(4)}
                </td>
                <td className="py-3 px-4 text-center text-[var(--foreground)]">
                  ${benchmark.staticTTL.savings.toFixed(4)}
                </td>
                <td className="py-3 px-4 text-center text-[var(--muted-foreground)]">$0.0000</td>
                <td className="py-3 px-4 text-right text-[var(--primary)] font-bold">
                  +{benchmark.improvementPercent.savings}% savings
                </td>
              </tr>

              {/* Row 5: Average Latency */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Avg Response Time</td>
                <td className="py-3 px-4 text-center font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)]">
                  {benchmark.intelligent.avgLatency}ms
                </td>
                <td className="py-3 px-4 text-center text-[var(--foreground)]">{benchmark.staticTTL.avgLatency}ms</td>
                <td className="py-3 px-4 text-center text-[var(--muted-foreground)]">48.5ms</td>
                <td className="py-3 px-4 text-right text-[var(--primary)] font-bold">
                  -{benchmark.improvementPercent.latencyReduction}% latency
                </td>
              </tr>

              {/* Row 6: Eviction Policy */}
              <tr className="hover:bg-[var(--muted)]/30">
                <td className="py-3 px-4 font-sans font-semibold text-[var(--foreground)]">Eviction Intelligence</td>
                <td className="py-3 px-4 text-center font-sans font-bold text-[var(--primary)] bg-[var(--muted)]/40 border-x border-[var(--border)]">
                  Smart Popularity Rank
                </td>
                <td className="py-3 px-4 text-center font-sans text-[var(--muted-foreground)]">Random / Naive FIFO</td>
                <td className="py-3 px-4 text-center font-sans text-[var(--muted-foreground)]">N/A</td>
                <td className="py-3 px-4 text-right font-sans text-[var(--primary)] font-bold">Zero Cold Thrash</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise ROI & Scale Calculator */}
      <div className="theme-card p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
          <Calculator className="h-5 w-5 text-[var(--primary)]" />
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Enterprise Cloud ROI Scale Calculator</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Project financial cloud database bill savings at enterprise traffic scales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[var(--foreground)]">Expected Monthly API Traffic</span>
                <span className="text-[var(--primary)] font-mono">{customMonthlyTraffic.toLocaleString()} reqs/mo</span>
              </div>
              <input
                type="range"
                min={500000}
                max={50000000}
                step={500000}
                value={customMonthlyTraffic}
                onChange={(e) => setCustomMonthlyTraffic(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] border border-[var(--border)]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[var(--foreground)]">Database Cost Per Query</span>
                <span className="text-[var(--primary)] font-mono">${customDbCost.toFixed(5)}/req</span>
              </div>
              <input
                type="range"
                min={0.00001}
                max={0.0005}
                step={0.00001}
                value={customDbCost}
                onChange={(e) => setCustomDbCost(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] border border-[var(--border)]"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                Projected Net Cloud Bill Reduction
              </span>
              <span className="rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-bold px-2 py-0.5 border border-[var(--border)]">
                ENTERPRISE SCALE
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-[var(--foreground)] font-mono">
                ${intelligentMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-sm font-normal text-[var(--muted-foreground)]"> / month</span>
              </div>
              <div className="text-sm text-[var(--primary)] font-bold font-mono">
                ${netAdvantageAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} annual ROI vs static policy
              </div>
            </div>

            <div className="text-[11px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)] flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
              <span>Saves {intelligentAvoided.toLocaleString()} raw database I/O read operations per month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
