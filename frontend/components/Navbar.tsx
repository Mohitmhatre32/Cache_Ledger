'use client';

import React from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Settings,
  Activity,
  Layers,
  ShoppingBag,
  Sliders,
  Scale,
  Sun,
  Moon,
  Radio,
} from 'lucide-react';
import { ScenarioType } from '@/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimRunning: boolean;
  simSpeed: number;
  currentScenario: ScenarioType;
  cachingMode: 'intelligent' | 'static' | 'disabled';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSimulator: () => void;
  onSetSpeed: (speed: number) => void;
  onSelectScenario: (sc: ScenarioType) => void;
  onTriggerBurst: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onToggleMode: (mode: 'intelligent' | 'static') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSimRunning,
  simSpeed,
  currentScenario,
  cachingMode,
  isDarkMode,
  onToggleDarkMode,
  onToggleSimulator,
  onSetSpeed,
  onSelectScenario,
  onTriggerBurst,
  onReset,
  onOpenSettings,
  onToggleMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)] shadow-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Main Header Bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & System Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-[var(--foreground)] font-sans">
                  CacheMind
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary)] border border-[var(--border)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                  ENGINE ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] font-medium hidden sm:block">
                Predictive Cloud-Cost Caching Engine
              </p>
            </div>
          </div>

          {/* Right Controls: Mode Selector, Theme Toggle, Settings */}
          <div className="flex items-center gap-2.5">
            {/* Mode Selector Pill */}
            <div className="flex items-center bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] p-0.5 text-xs">
              <button
                onClick={() => onToggleMode('intelligent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-bold transition-all ${
                  cachingMode === 'intelligent'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Adaptive TTL
              </button>
              <button
                onClick={() => onToggleMode('static')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-bold transition-all ${
                  cachingMode === 'static'
                    ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Static 10m TTL
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="flex items-center justify-center h-8 w-8 rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-[var(--primary)]" /> : <Moon className="h-4 w-4 text-[var(--primary)]" />}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center h-8 w-8 rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
              title="Engine Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto py-1 border-t border-[var(--border)]/60 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
            { id: 'intelligence', label: 'Cache Intelligence & Decisions', icon: Layers },
            { id: 'storefront', label: 'Product Explorer & Inspector', icon: ShoppingBag },
            { id: 'simulator', label: 'Traffic Simulator Lab', icon: Sliders },
            { id: 'benchmark', label: 'Static vs Intelligent ROI', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tier 3: Dedicated Ergonomic Simulator Action Ribbon */}
        <div className="py-2.5 border-t border-[var(--border)]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Simulation Engine Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Start / Pause Button */}
            <button
              onClick={onToggleSimulator}
              className={`flex items-center gap-1.5 rounded-[var(--radius)] px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${
                isSimRunning
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
              }`}
            >
              {isSimRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run Traffic
                </>
              )}
            </button>

            {/* Scenario Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-2.5 py-1 text-xs">
              <Radio className={`h-3.5 w-3.5 ${isSimRunning ? 'text-[var(--primary)] animate-pulse' : 'text-[var(--muted-foreground)]'}`} />
              <select
                value={currentScenario}
                onChange={(e) => onSelectScenario(e.target.value as ScenarioType)}
                className="bg-transparent text-[var(--foreground)] text-xs focus:outline-none cursor-pointer font-bold"
              >
                <option value="NORMAL" className="bg-[var(--card)] text-[var(--foreground)]">Scenario: Normal Skewed Traffic</option>
                <option value="VIRAL_SURGE" className="bg-[var(--card)] text-[var(--foreground)]">Scenario: Viral Product Spike 🔥</option>
                <option value="PRODUCT_DECLINE" className="bg-[var(--card)] text-[var(--foreground)]">Scenario: Demand Decline ❄️</option>
                <option value="CACHE_PRESSURE" className="bg-[var(--card)] text-[var(--foreground)]">Scenario: Capacity Pressure ⚠️</option>
                <option value="FLASH_SALE" className="bg-[var(--card)] text-[var(--foreground)]">Scenario: Flash Sale Peak ⚡</option>
              </select>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] p-0.5 text-xs">
              {[1, 5, 10, 25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSetSpeed(speed)}
                  className={`px-2 py-0.5 rounded-[var(--radius)] text-[11px] font-bold font-mono transition-all ${
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
              title="Inject instant 20 synthetic user requests"
              className="flex items-center gap-1 bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)] hover:opacity-90 text-xs font-bold px-2.5 py-1 rounded-[var(--radius)] transition-all"
            >
              <Sparkles className="h-3 w-3 text-[var(--primary)]" />
              +20 Burst
            </button>
          </div>

          {/* Right: Reset Action */}
          <button
            onClick={onReset}
            title="Reset metrics, cache, and history"
            className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] text-xs font-semibold px-2 py-1 rounded-[var(--radius)] hover:bg-[var(--muted)] transition-all ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset State
          </button>
        </div>
      </div>
    </header>
  );
};
