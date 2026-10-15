import React from 'react';
import { PlusCircle, Sparkles, Cpu, Layers } from 'lucide-react';
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
  return (
    <header className="app-header" id="main-header">
      {/* Brand Identity with Precision Aragonite Symbol */}
      <BrandLogo size={38} />

      {/* Control Groups */}
      <div className="header-actions">
        {/* Tank Preset Configuration */}
        <div className="control-group">
          <select
            id="preset-selector"
            className="select-control"
            aria-label="Load Archetype Demo"
            onChange={(e) => onSelectPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Load Demo Archetype...</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            id="system-type-selector"
            className="select-control"
            aria-label="System Ecosystem Type"
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

          {/* Net Volume Quick Input */}
          <div className="volume-pill" title="Net water volume in liters used for stoichiometric dosage calculations">
            <span className="vol-label">VOL</span>
            <input
              type="number"
              className="volume-input"
              value={tankProfile.net_volume_liters}
              onChange={(e) =>
                onTankProfileChange({
                  ...tankProfile,
                  net_volume_liters: Math.max(10, parseFloat(e.target.value) || 10)
                })
              }
            />
            <span className="vol-unit">L</span>
          </div>
        </div>

        {/* Live Hardware & Action Group */}
        <div className="action-group">
          {/* Hardware Controller Link */}
          <button
            id="btn-hardware-link"
            className={`btn-control ${hardwareStatus === 'synced' ? 'btn-hardware-active' : ''}`}
            onClick={onOpenHardwareModal}
            title="Connect Neptune Apex, GHL Profilux, or Hydros controllers"
          >
            <Cpu size={14} className={hardwareStatus === 'synced' ? 'text-emerald' : 'text-cyan'} />
            <span>{hardwareStatus === 'synced' ? 'Apex LAN Linked' : 'Hardware Link'}</span>
          </button>

          {/* Log Test Button */}
          <button
            id="btn-log-test"
            className="btn-primary-action"
            onClick={onOpenLogModal}
          >
            <PlusCircle size={14} />
            <span>+ Log Kit Reading</span>
          </button>

          {/* Pro Tier Button */}
          <button
            id="btn-pro-tier"
            className={`btn-pro-badge ${isPro ? 'btn-pro-active' : ''}`}
            onClick={onOpenProModal}
          >
            <Sparkles size={13} />
            <span>{isPro ? 'Guardian Pro' : 'Upgrade ($4.99)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
