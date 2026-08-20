'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { HeroCostCard } from '@/components/HeroCostCard';
import { KpiGrid } from '@/components/KpiGrid';
import { ChartsSection } from '@/components/ChartsSection';
import { DecisionFeed } from '@/components/DecisionFeed';
import { CacheTable } from '@/components/CacheTable';
import { StorefrontView } from '@/components/StorefrontView';
import { SimulatorLab } from '@/components/SimulatorLab';
import { BenchmarkView } from '@/components/BenchmarkView';
import { ProductInspectModal } from '@/components/ProductInspectModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  SystemMetrics,
  TimeSeriesPoint,
  ProductStats,
  Product,
  CacheEvent,
  CostConfig,
  ScenarioType,
  BenchmarkComparison,
} from '@/types';
import { Cpu } from 'lucide-react';

// Import local client-side engines directly
import { stateManager } from '@/lib/engine/state-manager';
import { trafficSimulator } from '@/lib/engine/traffic-simulator';
import { cacheStore } from '@/lib/engine/cache-store';
import { computeBenchmarkComparison } from '@/lib/engine/cost-engine';

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    missRate: 0,
    dbRequests: 0,
    dbRequestsAvoided: 0,
    estimatedDbSavings: 0,
    estimatedCacheCost: 0,
    netSavings: 0,
    cachedItemsCount: 0,
    cacheCapacity: 18,
    cacheUtilizationPercent: 0,
    totalEvictions: 0,
    avgLatencyMs: 0,
    cacheLatencyMs: 2.2,
    dbLatencyMs: 46.8,
    requestsPerSecond: 0,
    requestsPerMinute: 0,
    cachingMode: 'intelligent',
  });

  const [history, setHistory] = useState<TimeSeriesPoint[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CacheEvent[]>([]);
  const [config, setConfig] = useState<CostConfig>({
    dbCostPerRequest: 0.0001,
    cacheCostPerGB: 0.15,
    cacheCapacityMaxItems: 18,
    staticTTLSeconds: 600,
    cachingMode: 'intelligent',
  });

  const [benchmark, setBenchmark] = useState<BenchmarkComparison>({
    intelligent: {
      hitRate: 0,
      dbRequests: 0,
      dbRequestsAvoided: 0,
      savings: 0,
      avgLatency: 0,
      cacheUtilization: 0,
      evictions: 0,
    },
    staticTTL: {
      hitRate: 0,
      dbRequests: 0,
      dbRequestsAvoided: 0,
      savings: 0,
      avgLatency: 0,
      cacheUtilization: 0,
      evictions: 0,
    },
    noCache: {
      hitRate: 0,
      dbRequests: 0,
      dbRequestsAvoided: 0,
      savings: 0,
      avgLatency: 48.5,
    },
    improvementPercent: {
      hitRate: 0,
      dbReduction: 0,
      savings: 0,
      latencyReduction: 0,
    },
  });

  // Modal States
  const [inspectProductId, setInspectProductId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Set mounted status on client-side loading to prevent Next.js SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll client-side StateManager directly (Zero server load)
  useEffect(() => {
    if (!mounted) return;

    // Load initial products list from client-side stateManager map
    setProducts(stateManager.getProducts());

    const updateReactState = () => {
      const now = Date.now();
      const clientMetrics = stateManager.getMetrics(now);
      const clientConfig = stateManager.getConfig();
      const clientHistory = stateManager.getHistory();
      const clientStats = stateManager.getProductStats();
      const clientEvents = stateManager.getEvents(25);
      const simulatorStatus = trafficSimulator.getStatus();

      // Compute A/B benchmark stats locally
      const clientBenchmark = computeBenchmarkComparison(
        clientMetrics.totalRequests,
        clientMetrics.cacheHits,
        clientMetrics.dbRequests,
        clientMetrics.totalEvictions,
        cacheStore.getMemoryUsageBytes(now),
        clientConfig
      );

      setMetrics(clientMetrics);
      setConfig(clientConfig);
      setHistory([...clientHistory]);
      setProductStats([...clientStats]);
      setEvents([...clientEvents]);
      setIsSimRunning(simulatorStatus.isRunning);
      setSimSpeed(simulatorStatus.speedMultiplier);
      setCurrentScenario(simulatorStatus.currentScenario);
      setBenchmark(clientBenchmark);
    };

    // Update state immediately
    updateReactState();

    // Pull changes from local StateManager faster (600ms) for responsive visual meters
    const timer = setInterval(() => {
      updateReactState();
    }, 600);

    return () => {
      clearInterval(timer);
    };
  }, [mounted]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handler: Start/Stop Simulator
  const handleToggleSimulator = () => {
    if (isSimRunning) {
      trafficSimulator.stop();
    } else {
      trafficSimulator.start(simSpeed);
    }
  };

  // Handler: Change Speed
  const handleSetSpeed = (speed: number) => {
    setSimSpeed(speed);
    trafficSimulator.setSpeed(speed);
  };

  // Handler: Switch Scenario
  const handleSelectScenario = (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    stateManager.setScenario(scenario);
  };

  // Handler: Trigger Burst
  const handleTriggerBurst = (count: number = 20, productId?: string) => {
    trafficSimulator.runBurst(count, productId);
  };

  // Handler: Reset All
  const handleReset = () => {
    trafficSimulator.stop();
    stateManager.resetAll();
  };

  // Handler: Toggle Mode (Intelligent vs Static)
  const handleToggleMode = (mode: 'intelligent' | 'static') => {
    stateManager.updateConfig({ cachingMode: mode });
  };

  // Handler: Save Settings
  const handleSaveSettings = (newConfig: CostConfig) => {
    stateManager.updateConfig(newConfig);
  };

  // Handler: Manual Single Request on Product
  const handleManualRequest = (productId: string) => {
    stateManager.requestProduct(productId);
  };

  const inspectedProduct = products.find((p) => p.id === inspectProductId) || null;
  const inspectedStats = productStats.find((s) => s.productId === inspectProductId) || null;

  // Render server-side safety skeleton loader before client hydration finishes
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1C1917] text-[#F5F5F4] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Hydrating Cache Ledger Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden transition-colors duration-200 antialiased">
        {/* Left Side: Modern Executive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          cachingMode={config.cachingMode}
        />

        {/* Right Side: Main Application Viewport */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar of Main Viewport */}
          <HeaderBar
            activeTab={activeTab}
            isSimRunning={isSimRunning}
            simSpeed={simSpeed}
            currentScenario={currentScenario}
            cachingMode={config.cachingMode}
            totalRequests={metrics.totalRequests}
            hitRate={metrics.hitRate}
            onToggleSimulator={handleToggleSimulator}
            onSetSpeed={handleSetSpeed}
            onSelectScenario={handleSelectScenario}
            onTriggerBurst={() => handleTriggerBurst(20)}
            onReset={handleReset}
          />

          {/* Main View Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* VIEW 1: Dashboard View */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Cost Savings visual hero anchor */}
                <HeroCostCard metrics={metrics} config={config} />

                {/* KPI Metrics row (3x2 grid) */}
                <KpiGrid metrics={metrics} />

                {/* Performance Timeline Recharts */}
                <ChartsSection history={history} metrics={metrics} />

                {/* Cache Directory Matrix & Live Decision Feed split row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-1">
                    <DecisionFeed events={events} />
                  </div>
                  <div className="lg:col-span-2">
                    <CacheTable
                      stats={productStats}
                      onInspectProduct={(id) => setInspectProductId(id)}
                      onManualRequest={handleManualRequest}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: Cache Intelligence View */}
            {activeTab === 'intelligence' && (
              <div className="space-y-6">
                <CacheTable
                  stats={productStats}
                  onInspectProduct={(id) => setInspectProductId(id)}
                  onManualRequest={handleManualRequest}
                />
                <DecisionFeed events={events} />
              </div>
            )}

            {/* VIEW 3: Product Storefront Explorer */}
            {activeTab === 'storefront' && (
              <StorefrontView
                products={products}
                stats={productStats}
                onInspectProduct={(id) => setInspectProductId(id)}
                onManualRequest={handleManualRequest}
              />
            )}

            {/* VIEW 4: Simulator Lab */}
            {activeTab === 'simulator' && (
              <div className="space-y-6">
                <SimulatorLab
                  isSimRunning={isSimRunning}
                  simSpeed={simSpeed}
                  currentScenario={currentScenario}
                  metrics={metrics}
                  onToggleSimulator={handleToggleSimulator}
                  onSetSpeed={handleSetSpeed}
                  onSelectScenario={handleSelectScenario}
                  onTriggerBurst={handleTriggerBurst}
                  onReset={handleReset}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartsSection history={history} metrics={metrics} />
                  <DecisionFeed events={events} />
                </div>
              </div>
            )}

            {/* VIEW 5: Benchmark & ROI projections */}
            {activeTab === 'benchmark' && (
              <BenchmarkView benchmark={benchmark} metrics={metrics} config={config} />
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Math Inspect Drawer / Modal */}
      <ProductInspectModal
        product={inspectedProduct}
        stats={inspectedStats}
        onClose={() => setInspectProductId(null)}
        onManualRequest={handleManualRequest}
      />

      {/* Settings Modal */}
      <SettingsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
