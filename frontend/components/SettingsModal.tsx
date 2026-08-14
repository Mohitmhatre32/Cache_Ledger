'use client';

import React, { useState } from 'react';
import { Settings, X, Save, RotateCcw, DollarSign, HardDrive, Clock } from 'lucide-react';
import { CostConfig } from '@/types';

interface SettingsModalProps {
  config: CostConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: CostConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formConfig, setFormConfig] = useState<CostConfig>({ ...config });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formConfig);
    onClose();
  };

  const handleResetDefaults = () => {
    setFormConfig({
      dbCostPerRequest: 0.0001,
      cacheCostPerGB: 0.15,
      cacheCapacityMaxItems: 18,
      staticTTLSeconds: 600,
      cachingMode: 'intelligent',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-lg rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] border border-[var(--border)]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)]">Engine & Cost Configuration</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Tune cloud unit costs and cache capacity thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-[var(--radius)] hover:bg-[var(--muted)] font-bold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          {/* DB Cost Per Request */}
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-[var(--foreground)] flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-[var(--primary)]" />
                Database Cost Per Query
              </span>
              <span className="text-[var(--primary)] font-mono">${formConfig.dbCostPerRequest.toFixed(5)}</span>
            </div>
            <input
              type="number"
              step="0.00001"
              min="0.00001"
              max="0.001"
              value={formConfig.dbCostPerRequest}
              onChange={(e) =>
                setFormConfig({ ...formConfig, dbCostPerRequest: parseFloat(e.target.value) || 0.0001 })
              }
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] font-mono"
            />
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Typical AWS RDS Aurora read IOPS cost ($0.00005 - $0.00020)</p>
          </div>

          {/* Cache Capacity Max Items */}
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-[var(--foreground)] flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5 text-[var(--primary)]" />
                Logical Cache Capacity (Max Keys)
              </span>
              <span className="text-[var(--primary)] font-mono">{formConfig.cacheCapacityMaxItems} items</span>
            </div>
            <input
              type="number"
              min="10"
              max="100"
              value={formConfig.cacheCapacityMaxItems}
              onChange={(e) =>
                setFormConfig({ ...formConfig, cacheCapacityMaxItems: parseInt(e.target.value) || 18 })
              }
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] font-mono"
            />
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Threshold above which Smart Eviction activates (&gt;90% pressure)</p>
          </div>

          {/* Static TTL Baseline */}
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-[var(--foreground)] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                Static Baseline TTL (Seconds)
              </span>
              <span className="text-[var(--primary)] font-mono">{formConfig.staticTTLSeconds}s ({Math.floor(formConfig.staticTTLSeconds / 60)}m)</span>
            </div>
            <input
              type="number"
              min="30"
              max="3600"
              step="30"
              value={formConfig.staticTTLSeconds}
              onChange={(e) =>
                setFormConfig({ ...formConfig, staticTTLSeconds: parseInt(e.target.value) || 600 })
              }
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] font-mono"
            />
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Default fixed TTL used when comparing against static policy</p>
          </div>

          {/* Caching Mode Toggle */}
          <div>
            <label className="text-[var(--foreground)] font-bold block mb-1">Caching Strategy Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, cachingMode: 'intelligent' })}
                className={`py-2 rounded-[var(--radius)] text-xs font-bold transition-all ${
                  formConfig.cachingMode === 'intelligent'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                    : 'bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Intelligent Dynamic TTL
              </button>
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, cachingMode: 'static' })}
                className={`py-2 rounded-[var(--radius)] text-xs font-bold transition-all ${
                  formConfig.cachingMode === 'static'
                    ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm'
                    : 'bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Static Fixed TTL Policy
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius)] bg-[var(--muted)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-4 py-2 text-xs transition-all font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-[var(--radius)] bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold px-4 py-2 text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
