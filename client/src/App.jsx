import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import RadarChart from './components/RadarChart';
import TelemetryGrid from './components/TelemetryGrid';
import ParameterTimeline from './components/ParameterTimeline';
import RemediationDrawer from './components/RemediationDrawer';
import TestHistoryTable from './components/TestHistoryTable';
import LogTestModal from './components/LogTestModal';
import DodoCheckoutModal from './components/DodoCheckoutModal';
import HardwareSyncModal from './components/HardwareSyncModal';
import Tooltip from './components/Tooltip';
import { API_BASE } from './apiConfig';
import { evaluateClientGuardrails } from './guardrails';
import {
  loadSavedProfile,
  saveProfile,
  loadSavedCurrentTest,
  saveCurrentTest,
  loadSavedHistory,
  saveHistory,
  loadSavedProStatus,
  saveProStatus,
  clearAllSavedData
} from './storage';
import {
  Shield,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Cpu,
  Sliders,
  Compass,
  FileText,
  History,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const DEFAULT_TANK_PROFILE = {
  tank_id: 'tank_main',
  net_volume_liters: 280.0,
  system_type: 'sps_dominant',
  dosing_method: 'two_part_balling'
};

const DEFAULT_CURRENT_TEST = {
  timestamp: new Date().toISOString(),
  salinity_sg: 1.0255,
  alkalinity_dkh: 8.4,
  calcium_ppm: 425.0,
  magnesium_ppm: 1360.0,
  nitrate_ppm: 5.0,
  phosphate_ppm: 0.04,
  temperature_c: 25.1,
  ph: 8.25
};

export default function App() {
  // 1. Persistent State (survives browser refresh)
  const [tankProfile, setTankProfile] = useState(() => loadSavedProfile(DEFAULT_TANK_PROFILE));
  const [currentTest, setCurrentTest] = useState(() => loadSavedCurrentTest(DEFAULT_CURRENT_TEST));
  const [history, setHistory] = useState(() => loadSavedHistory([]));
  const [isPro, setIsPro] = useState(() => loadSavedProStatus(false));

  // 2. Ephemeral UI State
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'radar' | 'dosing' | 'history'
  const [presets, setPresets] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState('idle');
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveProfile(tankProfile);
  }, [tankProfile]);

  useEffect(() => {
    saveCurrentTest(currentTest);
  }, [currentTest]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveProStatus(isPro);
  }, [isPro]);

  // Load presets from API or fallbacks
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then((res) => res.json())
      .then((data) => setPresets(data))
      .catch(() => {
        setPresets([
          { id: 'preset_stable_sps', name: '120G Acropora Sanctuary (Equilibrium)' },
          { id: 'preset_mg_collapse', name: 'The Silent Magnesium Collapse' },
          { id: 'preset_alk_shock', name: 'Dosing Pump Clog (Alkalinity Shock & RTN)' },
          { id: 'preset_burnt_tips', name: 'Nutrient Bottom-Out (Burnt Tips)' }
        ]);
      });
  }, []);

  // Recalculate risk on parameter/profile change
  const evaluateTelemetry = useCallback(async (testEntry, hist, profile) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tank_profile: profile,
          current_test: testEntry,
          history: hist
        })
      });

      if (!res.ok) throw new Error('API server unreachable');
      const data = await res.json();
      setPrediction(data);
      setIsOnline(true);
    } catch (err) {
      // Local fallback
      const fallbackData = evaluateClientGuardrails(testEntry, hist, profile);
      setPrediction(fallbackData);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    evaluateTelemetry(currentTest, history, tankProfile);
  }, [currentTest, history, tankProfile, evaluateTelemetry]);

  // Handle Preset Archetype Selection
  const handleSelectPreset = (presetId) => {
    if (presetId === 'preset_fresh_start') {
      clearAllSavedData();
      setTankProfile(DEFAULT_TANK_PROFILE);
      setCurrentTest(DEFAULT_CURRENT_TEST);
      setHistory([]);
      return;
    }

    const selected = presets.find((p) => p.id === presetId);
    if (selected && selected.current_test) {
      setTankProfile(selected.tank_profile);
      setCurrentTest(selected.current_test);
      setHistory(selected.history || []);
    } else {
      const now = new Date();
      const prev = new Date(now.getTime() - 2 * 86400000);

      if (presetId === 'preset_mg_collapse') {
        setCurrentTest({
          timestamp: now.toISOString(),
          salinity_sg: 1.025,
          alkalinity_dkh: 8.1,
          calcium_ppm: 430.0,
          magnesium_ppm: 1160.0,
          nitrate_ppm: 4.2,
          phosphate_ppm: 0.03,
          temperature_c: 25.2,
          ph: 8.28
        });
        setHistory([
          {
            timestamp: prev.toISOString(),
            salinity_sg: 1.025,
            alkalinity_dkh: 8.4,
            calcium_ppm: 430.0,
            magnesium_ppm: 1220.0,
            nitrate_ppm: 4.0,
            phosphate_ppm: 0.03,
            temperature_c: 25.1,
            ph: 8.26
          }
        ]);
      } else if (presetId === 'preset_alk_shock') {
        setCurrentTest({
          timestamp: now.toISOString(),
          salinity_sg: 1.0252,
          alkalinity_dkh: 6.8,
          calcium_ppm: 415.0,
          magnesium_ppm: 1340.0,
          nitrate_ppm: 6.0,
          phosphate_ppm: 0.05,
          temperature_c: 25.1,
          ph: 8.12
        });
        setHistory([
          {
            timestamp: prev.toISOString(),
            salinity_sg: 1.0252,
            alkalinity_dkh: 8.0,
            calcium_ppm: 420.0,
            magnesium_ppm: 1345.0,
            nitrate_ppm: 5.8,
            phosphate_ppm: 0.05,
            temperature_c: 25.0,
            ph: 8.22
          }
        ]);
      } else if (presetId === 'preset_burnt_tips') {
        setCurrentTest({
          timestamp: now.toISOString(),
          salinity_sg: 1.025,
          alkalinity_dkh: 9.4,
          calcium_ppm: 440.0,
          magnesium_ppm: 1350.0,
          nitrate_ppm: 0.20,
          phosphate_ppm: 0.000,
          temperature_c: 25.3,
          ph: 8.35
        });
        setHistory([
          {
            timestamp: prev.toISOString(),
            salinity_sg: 1.025,
            alkalinity_dkh: 9.2,
            calcium_ppm: 435.0,
            magnesium_ppm: 1350.0,
            nitrate_ppm: 0.8,
            phosphate_ppm: 0.01,
            temperature_c: 25.2,
            ph: 8.32
          }
        ]);
      } else {
        setCurrentTest(DEFAULT_CURRENT_TEST);
        setHistory([
          {
            timestamp: prev.toISOString(),
            salinity_sg: 1.0255,
            alkalinity_dkh: 8.45,
            calcium_ppm: 425.0,
            magnesium_ppm: 1365.0,
            nitrate_ppm: 4.8,
            phosphate_ppm: 0.04,
            temperature_c: 25.0,
            ph: 8.24
          }
        ]);
      }
    }
  };

  const handleNewTestLog = (newEntry) => {
    // Current test shifts to historical ledger
    setHistory((prev) => [currentTest, ...prev]);
    setCurrentTest(newEntry);
  };

  const handleApplyHardwareTelemetry = (syncedEntry, meta) => {
    setHistory((prev) => [currentTest, ...prev]);
    setCurrentTest(syncedEntry);
    setHardwareStatus('synced');
  };

  const handleDeleteHistoryEntry = (indexToDelete) => {
    setHistory((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleResetDefaults = () => {
    clearAllSavedData();
    setTankProfile(DEFAULT_TANK_PROFILE);
    setCurrentTest(DEFAULT_CURRENT_TEST);
    const now = new Date();
    const prev = new Date(now.getTime() - 2 * 86400000);
    setHistory([
      {
        timestamp: prev.toISOString(),
        salinity_sg: 1.0255,
        alkalinity_dkh: 8.45,
        calcium_ppm: 425.0,
        magnesium_ppm: 1365.0,
        nitrate_ppm: 4.8,
        phosphate_ppm: 0.04,
        temperature_c: 25.0,
        ph: 8.24
      }
    ]);
  };

  const handleExportData = () => {
    const exportObject = {
      app: 'Before It Turns White',
      exported_at: new Date().toISOString(),
      tank_profile: tankProfile,
      current_test: currentTest,
      history: history,
      latest_prediction: prediction
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reef_telemetry_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const risk = prediction?.risk_assessment || {
    crash_probability_48h: 0.06,
    risk_level: 'STABLE',
    confidence_score: 0.95,
    primary_driver: 'Calculating biological baseline...'
  };

  const indicators = prediction?.chemical_indicators || {
    mg_ca_ratio: 3.20,
    mg_ca_status: 'BALANCED (Nominal ~3.20)',
    alk_velocity_24h: 0.0,
    ca_velocity_24h: 0.0,
    mg_velocity_24h: 0.0,
    ionic_product_index: 1.0,
    aragonite_saturation_proxy: 3.2,
    redfield_nutrient_ratio: 16.0,
    nutrient_starvation_flag: 0
  };

  const getRiskBorderClass = () => {
    if (risk.risk_level === 'IMMINENT_COLLAPSE') return 'border-collapse';
    if (risk.risk_level === 'COUPLING_DRIFT') return 'border-drift';
    return 'border-stable';
  };

  const getStatusBadgeClass = () => {
    if (risk.risk_level === 'IMMINENT_COLLAPSE') return 'status-collapse';
    if (risk.risk_level === 'COUPLING_DRIFT') return 'status-drift';
    return 'status-stable';
  };

  return (
    <div className="app-container" id="app-root">
      {/* Top Header */}
      <Header
        tankProfile={tankProfile}
        onTankProfileChange={setTankProfile}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        onOpenProModal={() => setIsProModalOpen(true)}
        isPro={isPro}
        hardwareStatus={hardwareStatus}
      />

      {/* Sub-Header Engine Status Ribbon with Real-Time Computing State */}
      <div className="engine-status-bar" id="engine-status-ribbon">
        <div className="engine-left">
          <Cpu size={12} className="text-cyan" />
          <span className="engine-label">TabPFN 3.5 Engine</span>
          <span className="engine-dot">•</span>
          <span className="engine-status-text">
            {prediction?.engine_used ? 'Prior Labs Foundation Model' : 'Predictive Chemistry Guard'}
          </span>
        </div>

        <div className="engine-right">
          {loading ? (
            <div className="computing-inline">
              <RefreshCw size={11} className="animate-spin text-cyan" />
              <span>Computing 48h trajectory...</span>
            </div>
          ) : (
            <>
              <span className="engine-conf">Confidence {((risk.confidence_score || 0.92) * 100).toFixed(0)}%</span>
              <span className="engine-dot">•</span>
              {isOnline ? (
                <span className="engine-cloud-link">
                  <span className="live-pulse-dot" /> Cloud Connected
                </span>
              ) : (
                <span className="engine-offline-link">
                  <WifiOff size={11} color="#f59e0b" /> Local Guardrails
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero 48h Biological Threat Horizon (Responsive, Deduplicated & Direct) */}
      <div
        className={`hero-horizon-panel ${loading ? 'computing' : getRiskBorderClass()}`}
        id="hero-threat-horizon"
      >
        {loading ? (
          <div className="computing-content">
            <RefreshCw size={24} className="animate-spin text-cyan" style={{ flexShrink: 0 }} />
            <div>
              <div className="computing-title">Evaluating 48-Hour Chemical Trajectory...</div>
              <div className="computing-sub">
                Prior Labs TabPFN-3.5 foundation model is analyzing non-linear ion interactions and RTN crash boundaries.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Left Gauge Column */}
            <div className="threat-gauge-col">
              <div className="threat-meta-label">48H Crash Risk</div>
              <div className="threat-score-row">
                <div
                  className="threat-score-number"
                  style={{
                    color:
                      risk.risk_level === 'IMMINENT_COLLAPSE'
                        ? 'var(--status-collapse)'
                        : risk.risk_level === 'COUPLING_DRIFT'
                        ? 'var(--status-drift)'
                        : 'var(--status-stable)'
                  }}
                >
                  {(risk.crash_probability_48h * 100).toFixed(0)}%
                </div>
                <div
                  className="threat-score-label"
                  style={{
                    color:
                      risk.risk_level === 'IMMINENT_COLLAPSE'
                        ? 'var(--status-collapse)'
                        : risk.risk_level === 'COUPLING_DRIFT'
                        ? 'var(--status-drift)'
                        : 'var(--status-stable)'
                  }}
                >
                  {risk.risk_level === 'IMMINENT_COLLAPSE'
                    ? 'Critical Alert'
                    : risk.risk_level === 'COUPLING_DRIFT'
                    ? 'Drift Warning'
                    : 'All Systems Safe'}
                </div>
              </div>

              <div className="threat-micro-bar">
                <div
                  className="threat-micro-bar-fill"
                  style={{
                    width: `${Math.max(6, risk.crash_probability_48h * 100)}%`,
                    background:
                      risk.risk_level === 'IMMINENT_COLLAPSE'
                        ? 'var(--status-collapse)'
                        : risk.risk_level === 'COUPLING_DRIFT'
                        ? 'var(--status-drift)'
                        : 'var(--status-stable)'
                  }}
                />
              </div>
            </div>

            {/* Middle Diagnosis Column (Plain English & Tactical Consequence) */}
            <div className="threat-diagnosis-col">
              <div className="diagnosis-headline">
                <span
                  className={`status-chip ${
                    risk.risk_level === 'IMMINENT_COLLAPSE'
                      ? 'collapse'
                      : risk.risk_level === 'COUPLING_DRIFT'
                      ? 'drift'
                      : 'stable'
                  }`}
                >
                  {risk.risk_level === 'IMMINENT_COLLAPSE'
                    ? 'CRITICAL DANGER'
                    : risk.risk_level === 'COUPLING_DRIFT'
                    ? 'ELEVATED DRIFT'
                    : 'EQUILIBRIUM STABLE'}
                </span>
                <span className="diagnosis-headline-text">
                  {risk.risk_level === 'IMMINENT_COLLAPSE'
                    ? 'Immediate Chemical Intervention Required'
                    : risk.risk_level === 'COUPLING_DRIFT'
                    ? 'Water Chemistry Imbalance Detected'
                    : 'Reef Water Chemistry is Balanced & Stable'}
                </span>
              </div>

              <div className="diagnosis-driver-box">
                <div className="driver-title-row">
                  <AlertTriangle size={13} color="#f59e0b" />
                  <span>Physical Impact on Corals</span>
                </div>
                <p className="driver-text">{risk.primary_driver}</p>
                {risk.secondary_driver && (
                  <p className="driver-secondary">{risk.secondary_driver}</p>
                )}
              </div>
            </div>

            {/* Right Action Column: Single Action (No Duplicate +Log Test Button!) */}
            <div className="threat-action-col">
              {risk.risk_level !== 'STABLE' ? (
                <button
                  id="btn-view-dosing-plan"
                  className="btn btn-primary"
                  onClick={() => setActiveTab('dosing')}
                  style={{ justifyContent: 'center', whiteSpace: 'nowrap' }}
                >
                  <span>View Dosing Plan</span>
                </button>
              ) : (
                <div className="status-all-clear" title="All parameters within safe equilibrium">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Safe Window</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Progressive Disclosure Tab Rail (Scroll-Free & Mobile 4-Column Responsive) */}
      <nav className="tab-rail" aria-label="Dashboard Views">
        <button
          className={`tab-pill ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Sliders size={14} />
          <span className="tab-desktop-text">01 Water Chemistry</span>
          <span className="tab-mobile-text">01 Chem</span>
        </button>

        <button
          className={`tab-pill ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <Compass size={14} />
          <span className="tab-desktop-text">02 Bio-Radar &amp; Ratios</span>
          <span className="tab-mobile-text">02 Radar</span>
        </button>

        <button
          className={`tab-pill ${activeTab === 'dosing' ? 'active' : ''}`}
          onClick={() => setActiveTab('dosing')}
        >
          <FileText size={14} />
          <span className="tab-desktop-text">03 Safe Dosing Ramp</span>
          <span className="tab-mobile-text">03 Dose</span>
          {risk.risk_level !== 'STABLE' && <span className="tab-indicator-dot" />}
        </button>

        <button
          className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={14} />
          <span className="tab-desktop-text">04 Test Logs</span>
          <span className="tab-mobile-text">04 Logs</span>
          <span className="tab-count">{history.length}</span>
        </button>
      </nav>

      {/* TAB 1: Telemetry & Trends */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="section-meta-strip">
              <Activity size={14} className="text-cyan" />
              <span className="section-meta-text">Live Sensor Probes &amp; Stability Windows</span>
            </div>
            <TelemetryGrid
              current={currentTest}
              indicators={indicators}
              systemType={tankProfile.system_type}
            />
          </section>

          <ParameterTimeline current={currentTest} history={history} />
        </div>
      )}

      {/* TAB 2: Radar & Coupled Matrix */}
      {activeTab === 'radar' && (
        <div className="radar-view-container">
          <div className="timeline-card">
            <div className="timeline-header">
              <span className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={14} />
                <span>48-Hour Biological Phase Radar</span>
              </span>
              <Tooltip
                title="Biological Radar Sonar"
                text="Circular equilibrium phase space plotting multi-parameter drift."
                why="The outer ring means safe water. The inner red circle means a crash is happening now."
              />
            </div>
            <RadarChart
              riskProbability={risk.crash_probability_48h}
              riskLevel={risk.risk_level}
            />
          </div>

          <div className="timeline-card">
            <div className="timeline-header">
              <span className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} />
                <span>Coupled Chemical Matrix (Cross-Parameter Equilibrium)</span>
              </span>
            </div>

            <div className="coupled-list">
              <div className="coupled-item">
                <div>
                  <div className="coupled-label-row">
                    <span className="coupled-label">Magnesium Shield Health (Mg:Ca)</span>
                    <Tooltip
                      title="Magnesium-to-Calcium Ratio"
                      text="In natural seawater, Magnesium is ~1350 ppm and Calcium is ~420 ppm (3.21:1)."
                      why="Magnesium is your chemical bodyguard. If it falls below 2.85, calcium and alkalinity bind into chalk dust and crash your tank."
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{indicators.mg_ca_status}</div>
                </div>
                <span
                  className="coupled-value"
                  style={{
                    color: indicators.mg_ca_ratio < 2.85 ? 'var(--status-collapse)' : 'var(--text-primary)'
                  }}
                >
                  {indicators.mg_ca_ratio.toFixed(2)} : 1
                </span>
              </div>

              <div className="coupled-item">
                <div>
                  <div className="coupled-label-row">
                    <span className="coupled-label">Aragonite Saturation Proxy (Ω)</span>
                    <Tooltip
                      title="Aragonite Saturation Proxy"
                      text="Measures the chemical drive for calcium carbonate skeleton formation."
                      why="Above 1.0 means coral skeletons can grow. Below 1.0 means the water is acidic and literally dissolves the coral skeletons back into water."
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {indicators.aragonite_saturation_proxy < 1.0 ? 'Skeletal Dissolution' : 'Supersaturated Calcification'}
                  </div>
                </div>
                <span className="coupled-value">{indicators.aragonite_saturation_proxy.toFixed(2)}</span>
              </div>

              <div className="coupled-item">
                <div>
                  <div className="coupled-label-row">
                    <span className="coupled-label">Redfield Nutrient Ratio (N:P)</span>
                    <Tooltip
                      title="Redfield Nutrient Balance"
                      text="Ratio of Nitrate to Phosphate in the water column (baseline ~16:1)."
                      why="If phosphate drops to zero while alkalinity is high, coral polyps starve and burn their growing tips."
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {indicators.nutrient_starvation_flag ? 'Burnt Tip Hazard' : 'Balanced Buffer'}
                  </div>
                </div>
                <span className="coupled-value">{indicators.redfield_nutrient_ratio.toFixed(1)} : 1</span>
              </div>

              <div className="coupled-item">
                <div>
                  <div className="coupled-label-row">
                    <span className="coupled-label">Calcium : Buffer Balance (Ca : Alk)</span>
                    <Tooltip
                      title="Calcium to Alkalinity Coupling"
                      text="Ratio of dissolved calcium (ppm) to carbonate buffer (dKH). Baseline is ~50.0 ppm per 1 dKH."
                      why="Calcification consumes calcium and carbonate in a strict 20:1 meq/L (50:1 ppm/dKH) ratio. Imbalance causes spontaneous calcium carbonate precipitation."
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {(() => {
                      const alk = currentTest?.alkalinity_dkh || 8.4;
                      const ca = currentTest?.calcium_ppm || 420;
                      const ratio = alk > 0 ? ca / alk : 50;
                      if (ratio < 42) return 'Carbonate Excess Skew';
                      if (ratio > 58) return 'Alkalinity Depleted Skew';
                      return 'Stoichiometric Homeostasis';
                    })()}
                  </div>
                </div>
                <span className="coupled-value">
                  {(() => {
                    const alk = currentTest?.alkalinity_dkh || 8.4;
                    const ca = currentTest?.calcium_ppm || 420;
                    return (alk > 0 ? (ca / alk).toFixed(1) : '50.0');
                  })()} : 1
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Safe Dosing Protocol */}
      {activeTab === 'dosing' && (
        <RemediationDrawer
          plan={prediction?.remediation_plan}
          riskAssessment={risk}
          tankVolume={tankProfile.net_volume_liters}
        />
      )}

      {/* TAB 4: Test History Ledger */}
      {activeTab === 'history' && (
        <TestHistoryTable
          history={history}
          onDeleteEntry={handleDeleteHistoryEntry}
          onResetDefaults={handleResetDefaults}
          onExportData={handleExportData}
        />
      )}

      {/* Modals */}
      <LogTestModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmitTest={handleNewTestLog}
        initialValues={currentTest}
      />

      <DodoCheckoutModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onProActivated={() => setIsPro(true)}
      />

      <HardwareSyncModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        onApplyTelemetry={handleApplyHardwareTelemetry}
        activeTelemetry={currentTest}
      />
    </div>
  );
}
