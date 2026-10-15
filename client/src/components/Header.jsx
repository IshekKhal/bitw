import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Shield, Cpu, ChevronDown, Check, FlaskConical, Settings, Waves } from 'lucide-react';
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
  const [showTankMenu, setShowTankMenu] = useState(false);
  const tankMenuRef = useRef(null);

  // Close tank menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (tankMenuRef.current && !tankMenuRef.current.contains(event.target)) {
        setShowTankMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCoralLoadLabel = (type) => {
    switch (type) {
      case 'heavy_sps':
        return 'SPS Acropora';
      case 'mixed_reef':
        return 'Mixed Reef';
      case 'lps_softie':
        return 'LPS & Softies';
      case 'nano_reef':
        return 'Nano Reef';
      default:
        return 'SPS Dominant';
    }
  };

  return (
    <header className="app-header-single-bar" id="main-header">
      {/* Left: Brand Identity & Active Tank Context */}
      <div className="header-brand-and-tank">
        <BrandLogo size={28} />

        {/* Tank Profile Popover Trigger */}
        <div className="tank-context-container" ref={tankMenuRef}>
          <button
            id="btn-tank-context"
            className="btn-tank-context"
            onClick={() => setShowTankMenu(!showTankMenu)}
            title="Configure aquarium volume and coral bioload"
            aria-expanded={showTankMenu}
          >
            <Waves size={13} className="text-cyan" style={{ flexShrink: 0 }} />
            <span className="tank-name-label">
              {tankProfile.net_volume_liters}L {getCoralLoadLabel(tankProfile.coral_load)}
            </span>
            <ChevronDown size={12} className={`chevron-icon ${showTankMenu ? 'rotated' : ''}`} />
          </button>

          {showTankMenu && (
            <div className="tank-config-popover">
              <div className="popover-header">
                <Settings size={13} className="text-cyan" />
                <span>Aquarium Setup</span>
              </div>
              <div className="popover-body">
                <div className="popover-row">
                  <label htmlFor="popover-coral-load">Ecosystem Type</label>
                  <select
                    id="popover-coral-load"
                    className="select-param"
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

                <div className="popover-row">
                  <label htmlFor="popover-net-volume">Net Volume (Liters)</label>
                  <div className="volume-input-wrapper">
                    <input
                      id="popover-net-volume"
                      type="number"
                      className="input-volume"
                      value={tankProfile.net_volume_liters}
                      onChange={(e) =>
                        onTankProfileChange({
                          ...tankProfile,
                          net_volume_liters: Math.max(10, parseFloat(e.target.value) || 10)
                        })
                      }
                    />
                    <span className="unit-label">L</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls, Hardware Sync, Simulation Scenarios & Single Primary Action */}
      <div className="header-controls-suite">
        {/* Simulation Scenarios Dropdown (Discreet, Not Dominating Header) */}
        <div className="scenario-select-wrapper">
          <FlaskConical size={13} className="scenario-icon text-cyan" />
          <select
            id="preset-selector"
            className="select-scenario-compact"
            aria-label="Load Simulation Scenario"
            onChange={(e) => {
              if (e.target.value) onSelectPreset(e.target.value);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              🧪 Scenarios...
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

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
            {hardwareStatus === 'synced' ? 'Apex Live' : 'Hardware'}
          </span>
          <span className="live-status-dot" />
        </button>

        {/* Discreet Pro Status Button */}
        <button
          id="btn-pro-tier"
          className={`btn-header-pill btn-pro-pill ${isPro ? 'pro-unlocked' : ''}`}
          onClick={onOpenProModal}
          title="Guardian Pro TabPFN Foundation Access"
        >
          <Shield size={13} className={isPro ? 'text-emerald' : 'text-muted'} />
          <span className="pill-text-desktop">{isPro ? 'Pro' : '$4.99'}</span>
        </button>

        {/* Sole Primary Action on Viewport: Log Water Test */}
        <button
          id="btn-log-test"
          className="btn-primary-action"
          onClick={onOpenLogModal}
          title="Log manual test kit measurements (Salifert, Hanna, Red Sea)"
        >
          <PlusCircle size={15} />
          <span className="btn-action-label">+ Log Test</span>
        </button>
      </div>
    </header>
  );
}
