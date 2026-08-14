'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TimeSeriesPoint, SystemMetrics } from '@/types';
import { TrendingUp, Database, DollarSign, Activity } from 'lucide-react';

interface ChartsSectionProps {
  history: TimeSeriesPoint[];
  metrics: SystemMetrics;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ history, metrics }) => {
  const chartData = history.length > 0 ? history : [
    { time: '00:00', hitRate: 0, cacheHits: 0, dbRequests: 0, cumulativeSavings: 0, cacheUtilization: 0, avgLatency: 45 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Chart 1: Cache Hit Rate Over Time */}
      <div className="ui-card p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
              <TrendingUp className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Cache Hit Rate Trajectory</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Real-time hit rate % climbing as dynamic TTL stabilizes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-[var(--primary)] tabular-nums">{metrics.hitRate}%</span>
            <span className="text-[10px] text-[var(--muted-foreground)] block">Current Hit %</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="hitRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
                formatter={(val: any) => [`${val}%`, 'Hit Rate']}
              />
              <Area
                type="monotone"
                dataKey="hitRate"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#hitRateGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Database Load vs Cache Offload */}
      <div className="ui-card p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Database Load vs Cache Requests</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Cache absorbing traffic vs direct database hits</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-[var(--primary)] tabular-nums">{metrics.dbRequestsAvoided.toLocaleString()}</span>
            <span className="text-[10px] text-[var(--muted-foreground)] block">Avoided DB Hits</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="cacheHits" name="Cache Offloaded" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="dbRequests" name="Direct DB Hits" fill="var(--destructive)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Cumulative Database Cost Savings ($) */}
      <div className="ui-card p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
              <DollarSign className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Cumulative Cost Savings ($)</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Real-time cumulative dollar savings based on avoid query multiplier</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-[var(--primary)] tabular-nums">${metrics.estimatedDbSavings.toFixed(4)}</span>
            <span className="text-[10px] text-[var(--muted-foreground)] block">Total Saved</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
                formatter={(val: any) => [`$${Number(val).toFixed(4)}`, 'Savings']}
              />
              <Area
                type="monotone"
                dataKey="cumulativeSavings"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#savingsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Cache Capacity Utilization vs Pressure */}
      <div className="ui-card p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--secondary-foreground)] border border-[var(--border)]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Cache Memory Pressure Load</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Pressure threshold triggers Smart Eviction at &gt;90%</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-[var(--foreground)] tabular-nums">{metrics.cacheUtilizationPercent}%</span>
            <span className="text-[10px] text-[var(--muted-foreground)] block">Capacity Used</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
                formatter={(val: any) => [`${val}%`, 'Utilization']}
              />
              <Area
                type="monotone"
                dataKey="cacheUtilization"
                stroke="var(--secondary-foreground)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#utilGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
