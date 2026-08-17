'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Sparkles, Radio, HelpCircle } from 'lucide-react';
import { ScenarioType } from '@/types';

interface HeaderBarProps {
  activeTab: string;
  isSimRunning: boolean;
  simSpeed: number;
  currentScenario: ScenarioType;
  cachingMode: 'intelligent' | 'static' | 'disabled';
  totalRequests: number;
  hitRate: number;
  onToggleSimulator: () => void;
  onSetSpeed: (speed: number) => void;
  onSelectScenario: (sc: ScenarioType) => void;
  onTriggerBurst: () => void;
  onReset: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  isSimRunning,
  simSpeed,
  currentScenario,
  cachingMode,
  totalRequests,
  hitRate,
  onToggleSimulator,
  onSetSpeed,
  onSelectScenario,
  onTriggerBurst,
  onReset,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Analytics Dashboard';
      case 'intelligence':
        return 'Caching Directory & TTL Matrix';
      case 'storefront':
        return 'Product Storefront Explorer';
      case 'simulator':
        return 'Simulator & Workload Lab';
      case 'benchmark':
        return 'Static vs Intelligent ROI';
      default:
        return 'Control Room';
    }
  };

  return (
    <header className="h-16 bg-[var(--background)]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans transition-colors">
      {/* Title */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
          {getTabTitle()}
        </h2>
        <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mt-0.5">
          Cache Ledger Optimization Engine
        </p>
      </div>

      {/* Simulator Control Dock */}
      <div className="flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 shadow-sm">
        {/* Play/Pause Button */}
        <button
          onClick={onToggleSimulator}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] text-[11px] font-bold transition-all shadow-sm ${
            isSimRunning
              ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'
              : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
          }`}
        >
          {isSimRunning ? (
            <>
              <Pause className="h-3 w-3 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              Run Traffic
            </>
          )}
        </button>

        {/* Scenario Dropdown */}
        <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 text-[11px] font-bold">
          <Radio className={`h-3 w-3 ${isSimRunning ? 'text-[var(--primary)] animate-pulse' : 'text-[var(--muted-foreground)]'}`} />
          <select
            value={currentScenario}
            onChange={(e) => onSelectScenario(e.target.value as ScenarioType)}
            className="bg-transparent text-[var(--foreground)] border-none focus:outline-none cursor-pointer"
          >
            <option value="NORMAL" className="bg-[var(--card)] text-[var(--foreground)] font-semibold">Normal Traffic</option>
            <option value="VIRAL_SURGE" className="bg-[var(--card)] text-[var(--foreground)] font-semibold">Viral Spike 🔥</option>
            <option value="PRODUCT_DECLINE" className="bg-[var(--card)] text-[var(--foreground)] font-semibold">Decline ❄️</option>
            <option value="CACHE_PRESSURE" className="bg-[var(--card)] text-[var(--foreground)] font-semibold">Pressure ⚠️</option>
            <option value="FLASH_SALE" className="bg-[var(--card)] text-[var(--foreground)] font-semibold">Flash Sale ⚡</option>
          </select>
        </div>

        {/* Speed */}
        <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-0.5 text-[10px] font-mono">
          {[1, 5, 10, 25].map((speed) => (
            <button
              key={speed}
              onClick={() => onSetSpeed(speed)}
              className={`px-1.5 py-0.5 rounded-[var(--radius)] font-bold transition-all ${
                simSpeed === speed
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Burst Button */}
        <button
          onClick={onTriggerBurst}
          className="flex items-center gap-1 bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)] hover:opacity-90 text-[10px] font-bold px-2 py-1 rounded-[var(--radius)] transition-all"
          title="Inject instant 20 requests"
        >
          <Sparkles className="h-3 w-3 text-[var(--primary)]" />
          Burst
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] p-1 rounded-[var(--radius)] hover:bg-[var(--card)] transition-all border border-transparent hover:border-[var(--border)]"
          title="Reset Metrics"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
