'use client';

import React from 'react';
import {
  Zap,
  Activity,
  Layers,
  ShoppingBag,
  Sliders,
  Scale,
  Sun,
  Moon,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  cachingMode: 'intelligent' | 'static' | 'disabled';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  cachingMode,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, desc: 'Executive savings & KPI telemetry' },
    { id: 'intelligence', label: 'Caching Matrix', icon: Layers, desc: 'Directory, dynamic TTLs & popularity' },
    { id: 'storefront', label: 'Product Explorer', icon: ShoppingBag, desc: 'Interactive catalog & latency inspector' },
    { id: 'simulator', label: 'Simulator Lab', icon: Sliders, desc: 'Workloads & synthetic traffic' },
    { id: 'benchmark', label: 'ROI Benchmark', icon: Scale, desc: 'Comparison & scale ROI calculator' },
  ];

  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)]/20 flex flex-col justify-between h-screen sticky top-0 shrink-0 font-sans transition-colors">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border)]/20 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-base text-[var(--foreground)] leading-none">
              Cache Ledger
            </h1>
            <span className="text-[10px] text-[var(--muted-foreground)] font-bold tracking-wide uppercase mt-1 block">
              Predictive Cache
            </span>
          </div>
        </div>

        {/* Engine Live Status Badge */}
        <div className="px-5 py-4 border-b border-[var(--border)]/20 bg-[var(--muted)]/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Engine Status
            </span>
            <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-foreground)] border border-[var(--border)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Active
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[var(--muted-foreground)] flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Mode: {cachingMode === 'intelligent' ? 'Adaptive TTL' : 'Static TTL'}</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-[var(--radius)] text-left transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? 'text-[var(--primary-foreground)]' : 'text-[var(--primary)]'}`} />
                <div>
                  <div className="text-xs font-bold leading-none">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-[var(--primary-foreground)]/80' : 'text-[var(--muted-foreground)]'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-[var(--border)]/20 bg-[var(--muted)]/40 space-y-3">
        {/* Toggle Theme / Settings */}
        <div className="flex items-center gap-2">
          {/* Theme Toggler */}
          <button
            onClick={onToggleDarkMode}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-[var(--primary)]" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[var(--primary)]" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Config Settings */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
            title="Configure Caching Engine"
          >
            <Settings className="h-4 w-4 text-[var(--primary)]" />
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="text-[10px] text-[var(--muted-foreground)] text-center font-mono leading-none">
           Cache Ledger v2.0.0
        </div>
      </div>
    </aside>
  );
};
