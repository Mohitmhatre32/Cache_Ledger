'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  TrendingDown,
  AlertTriangle,
  Sliders,
  Radio,
} from 'lucide-react';
import { ScenarioType, SystemMetrics } from '@/types';

interface SimulatorLabProps {
  isSimRunning: boolean;
  simSpeed: number;
  currentScenario: ScenarioType;
  metrics: SystemMetrics;
  onToggleSimulator: () => void;
  onSetSpeed: (speed: number) => void;
  onSelectScenario: (sc: ScenarioType) => void;
  onTriggerBurst: (count?: number, productId?: string) => void;
  onReset: () => void;
}

export const SimulatorLab: React.FC<SimulatorLabProps> = ({
  isSimRunning,
  simSpeed,
  currentScenario,
  metrics,
  onToggleSimulator,
  onSetSpeed,
  onSelectScenario,
  onTriggerBurst,
  onReset,
}) => {
  const scenarios: {
    id: ScenarioType;
    title: string;
    description: string;
    expectedBehavior: string;
    icon: any;
    badge: string;
  }[] = [
    {
      id: 'NORMAL',
      title: 'Scenario 1: Normal Skewed Workload',
      description: 'Realistic Zipf distribution where 20% of catalog generates 80% of views.',
      expectedBehavior: 'High hit rate (~80%+), stable dynamic TTLs, minimal cache thrashing.',
      icon: Sparkles,
      badge: 'Baseline Workload',
    },
    {
      id: 'VIRAL_SURGE',
      title: 'Scenario 2: Viral Product Surge (Wow Moment #1)',
      description: 'A previously cold product (Vintage Mechanical Keyboard) suddenly explodes with 80% of traffic.',
      expectedBehavior: 'Engine detects surge velocity: Popularity jumps 18 → 88, TTL promotes automatically from 30s → 60m!',
      icon: Flame,
      badge: 'Dynamic TTL Promotion',
    },
    {
      id: 'PRODUCT_DECLINE',
      title: 'Scenario 3: Product Demand Decline',
      description: 'A previously hot product loses user traffic as interest shifts elsewhere.',
      expectedBehavior: 'Engine detects traffic drop: Popularity decays, TTL demotes from 60m → 2m to free memory.',
      icon: TrendingDown,
      badge: 'TTL Demotion & Decay',
    },
    {
      id: 'CACHE_PRESSURE',
      title: 'Scenario 4: Cache Storm Pressure (Wow Moment #2)',
      description: 'High dispersion flood across 30+ distinct products pushing memory utilization beyond 90%.',
      expectedBehavior: 'Smart Eviction activates automatically: Prunes low-value keys while strictly protecting hot flagships.',
      icon: AlertTriangle,
      badge: 'Smart Eviction Engine',
    },
    {
      id: 'FLASH_SALE',
      title: 'Scenario 5: Flash Sale Burst',
      description: 'Extremely concentrated high-QPS traffic surge across top 3 tech devices.',
      expectedBehavior: 'Near 100% cache hit rate, massive database queries avoided, rapid cost savings accumulation.',
      icon: Zap,
      badge: 'High QPS Peak',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Control Console */}
      <div className="theme-card p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-[var(--border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Traffic Simulation Laboratory</h2>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xl">
              Conduct synthetic workload experiments to observe how the predictive caching engine adapts
              TTLs, ranks popularity, and protects database resources under diverse traffic conditions.
            </p>
          </div>

          {/* Player Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleSimulator}
              className={`flex items-center gap-2 rounded-[var(--radius)] px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${
                isSimRunning
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
              }`}
            >
              {isSimRunning ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Start Continuous Traffic
                </>
              )}
            </button>

            <button
              onClick={() => onTriggerBurst(25)}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)] px-4 py-2.5 text-sm font-bold shadow-sm hover:opacity-90 transition-all"
            >
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              Inject +25 Burst
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--muted)] hover:bg-[var(--card)] border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Speed & Live Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Speed Selector */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-4">
            <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider block mb-2">
              Simulation QPS Speed
            </label>
            <div className="flex items-center gap-2">
              {[1, 5, 10, 25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSetSpeed(speed)}
                  className={`flex-1 py-1.5 rounded-[var(--radius)] text-xs font-bold transition-all ${
                    simSpeed === speed
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Active Scenario Card */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-4">
            <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
              Active Scenario
            </div>
            <div className="text-sm font-bold text-[var(--primary)] flex items-center gap-1.5 font-mono">
              <Radio className="h-4 w-4 text-[var(--primary)] animate-pulse" />
              {currentScenario}
            </div>
          </div>

          {/* Current Traffic Processed */}
          <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-4">
            <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
              Total Traffic Executed
            </div>
            <div className="text-sm font-bold text-[var(--foreground)] font-mono">
              {metrics.totalRequests.toLocaleString()} requests
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <Radio className="h-5 w-5 text-[var(--primary)]" />
          Select & Launch Test Scenarios
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = currentScenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`cursor-pointer rounded-[var(--radius)] p-5 border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[var(--card)] border-2 border-[var(--primary)] shadow-md'
                    : 'theme-card-hover'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{sc.title}</h4>
                      <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider font-mono">
                        {sc.badge}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 py-0.5 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  {sc.description}
                </p>

                <div className="rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] p-3 text-[11px]">
                  <span className="text-[var(--muted-foreground)] font-bold block mb-0.5">Expected Engine Decision:</span>
                  <span className="text-[var(--foreground)] font-medium">{sc.expectedBehavior}</span>
                </div>

                {/* Instant Launch Button */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--muted-foreground)]">Click to switch scenario</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScenario(sc.id);
                      onTriggerBurst(20);
                    }}
                    className="rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1 text-xs font-bold hover:opacity-90 transition-all"
                  >
                    Switch & Burst
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
