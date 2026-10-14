import React from 'react';
import { Activity, ShieldAlert, PlusCircle, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

export default function Header({
  tankProfile,
  onTankProfileChange,
  presets,
  onSelectPreset,
  onOpenLogModal,
  onOpenProModal,
  isPro,
  isOnline,
  engineMode
}) {
  return (
    <header className="app-header" id="main-header">
      <div className="brand-section">
        <div className="brand-icon-box" aria-hidden="true">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="brand-title">
            Before It Turns White
          </h1>
          <p className="brand-subtitle">
            48-HOUR PREDICTIVE WATER CHEMISTRY CRASH GUARD
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Preset Selector */}
        <select
          id="preset-selector"
          className="select-control"
          aria-label="Load Telemetry Preset"
          onChange={(e) => onSelectPreset(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Load Case Archetype...</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

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
          <option value="lps_softie">LPS & Soft Corals</option>
          <option value="nano_reef">Nano Reef (&lt;40 Gallons)</option>
        </select>

        {/* Log Test Button */}
        <button
          id="btn-log-test"
          className="btn btn-secondary"
          onClick={onOpenLogModal}
        >
          <PlusCircle size={16} />
          <span>Log Test Kit</span>
        </button>

        {/* Pro Button */}
        <button
          id="btn-pro-tier"
          className={`btn ${isPro ? 'btn-secondary' : 'btn-pro'}`}
          onClick={onOpenProModal}
        >
          <Sparkles size={16} />
          <span>{isPro ? 'Guardian Pro Active' : 'Upgrade to Pro ($4.99)'}</span>
        </button>
      </div>
    </header>
  );
}
