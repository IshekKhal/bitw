import React from 'react';
import { Activity, PlusCircle, Sparkles, Layers } from 'lucide-react';

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
      <div className="brand-section">
        <div className="brand-icon-box" aria-hidden="true">
          <Activity size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="brand-title">Before It Turns White</h1>
            <span className="badge-tag">REPORTS &bull; PREDICTIONS</span>
          </div>
          <p className="brand-subtitle">
            48-HOUR CORAL REEF WATER CHEMISTRY CRASH GUARD
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            id="preset-selector"
            className="select-control"
            aria-label="Load Archetype Demo"
            onChange={(e) => onSelectPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Load Demo Tank...</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tank Profile Type */}
        <select
          id="system-type-selector"
          className="select-control"
          aria-label="System Ecosystem Type"
          value={tankProfile.system_type}
          onChange={(e) =>
            onTankProfileChange({
              ...tankProfile,
              system_type: e.target.value
            })
          }
        >
          <option value="sps_dominant">SPS Dominant (Acropora)</option>
          <option value="mixed_reef">Mixed Reef (LPS + SPS)</option>
          <option value="lps_softie">LPS &amp; Soft Corals</option>
          <option value="nano_reef">Nano Reef (&lt;40 Gal)</option>
        </select>

        {/* Net Volume Quick Input */}
        <div className="volume-pill" title="Net water volume in liters used for liquid dosage calculations">
          <span>Vol:</span>
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
          <span style={{ color: 'var(--text-muted)' }}>L</span>
        </div>

        {/* Hardware Link Button */}
        <button
          id="btn-hardware-link"
          className="btn btn-secondary"
          onClick={onOpenHardwareModal}
          title="Connect Neptune Apex, GHL Profilux, or Hydros controllers"
          style={{ borderColor: hardwareStatus === 'synced' ? 'var(--status-stable)' : 'var(--border-subtle)' }}
        >
          <Layers size={14} color={hardwareStatus === 'synced' ? '#4ade80' : '#38bdf8'} />
          <span>{hardwareStatus === 'synced' ? 'Apex Linked' : 'Hardware Link'}</span>
        </button>

        {/* Log Test Button */}
        <button
          id="btn-log-test"
          className="btn btn-primary"
          onClick={onOpenLogModal}
        >
          <PlusCircle size={15} />
          <span>Log Kit Reading</span>
        </button>

        {/* Pro Button */}
        <button
          id="btn-pro-tier"
          className={`btn ${isPro ? 'btn-secondary' : 'btn-pro'}`}
          onClick={onOpenProModal}
        >
          <Sparkles size={15} />
          <span>{isPro ? 'Guardian Pro' : 'Get Pro ($4.99)'}</span>
        </button>
      </div>
    </header>
  );
}
