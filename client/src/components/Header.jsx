import React, { useState } from 'react';
import { PlusCircle, Shield, Cpu, SlidersHorizontal, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header({
  tankProfile,
  onTankProfileChange,
  presets,
  onSelectPreset,
  onOpenLogModal,
  onOpenHardwareModal,
  onOpenProModal,
  isPro,
  hardwareStatus = 'idle'
}) {
  const [showTankConfig, setShowTankConfig] = useState(false);

  return (
    <header className="app-header-container" id="main-header">
      {/* Top Navigation Bar: Brand + Quick Telemetry Status + Key Actions */}
      <div className="header-primary-row">
        {/* Brand Mark & Identity */}
        <BrandLogo size={32} />

        {/* Global Action Suite */}
        <div className="header-actions-suite">
          {/* Hardware Connection Pill */}
          <button
            id="btn-hardware-link"
            className={`btn-header-pill ${hardwareStatus === 'synced' ? 'pill-synced' : ''}`}
            onClick={onOpenHardwareModal}
            title="Connect Neptune Apex, GHL Profilux, or CoralVue Hydros"
            aria-label="Hardware Link"
          >
            <Cpu size={14} className={hardwareStatus === 'synced' ? 'text-emerald' : 'text-cyan'} />
            <span className="pill-text-desktop">
              {hardwareStatus === 'synced' ? 'Apex Live Link' : 'Hardware Link'}
            </span>
            <span className="live-status-dot" />
          </button>

          {/* Discreet Guardian Pro Status / Upgrade (No Neon Gimmicks) */}
          <button
            id="btn-pro-tier"
            className={`btn-header-pill btn-pro-pill ${isPro ? 'pro-unlocked' : ''}`}
            onClick={onOpenProModal}
            title="Guardian Pro with Unlimited TabPFN Foundation Inferences"
          >
            <Shield size={13} className={isPro ? 'text-emerald' : 'text-muted'} />
            <span className="pill-text-desktop">{isPro ? 'Pro Active' : 'Pro ($4.99)'}</span>
          </button>

          {/* Primary Action: Log Manual Test */}
          <button
            id="btn-log-test"
            className="btn-primary-action"
            onClick={onOpenLogModal}
            title="Log manual test kit measurements (Salifert, Hanna, Red Sea)"
          >
            <PlusCircle size={15} />
            <span className="btn-action-label">+ Log Water Test</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar: Simulation Scenario Presets & Tank Parameters */}
      <div className="header-context-bar">
        <div className="context-preset-col">
          <label htmlFor="preset-selector" className="context-label">
            Simulation Scenario:
          </label>
          <select
            id="preset-selector"
            className="select-scenario"
            aria-label="Load Simulation Scenario"
            onChange={(e) => onSelectPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Select reef scenario to test...</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tank Parameters: Coral Load & Net Volume */}
        <div className="context-params-col">
          <div className="param-item">
            <span className="param-label">Load:</span>
            <select
              id="system-type-selector"
              className="select-param"
              aria-label="Coral Ecosystem Load"
              value={tankProfile.coral_load || 'heavy_sps'}
              onChange={(e) =>
                onTankProfileChange({
                  ...tankProfile,
                  coral_load: e.target.value
                })
              }
            >
              <option value="heavy_sps">SPS Dominant (Acropora)</option>
              <option value="mixed_reef">Mixed Reef (LPS + SPS)</option>
              <option value="lps_softie">LPS &amp; Soft Corals</option>
              <option value="nano_reef">Nano Reef (&lt;40 Gal)</option>
            </select>
          </div>

          <div className="param-item volume-box">
            <span className="param-label">Vol:</span>
            <input
              type="number"
              className="input-volume"
              value={tankProfile.net_volume_liters}
              onChange={(e) =>
                onTankProfileChange({
                  ...tankProfile,
                  net_volume_liters: Math.max(10, parseFloat(e.target.value) || 10)
                })
              }
              aria-label="Net Water Volume in Liters"
            />
            <span className="unit-label">L</span>
          </div>
        </div>
      </div>
    </header>
  );
}
