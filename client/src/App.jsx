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
  CheckCircle2
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

      {/* Engine Status & Latency Ribbon */}
      <div className="engine-status-bar" id="engine-status-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={14} color="#38bdf8" />
          <span>INFERENCE ENGINE:</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>
            {prediction?.engine_used || 'Prior Labs TabPFN-3.5 Foundation Model'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>MODEL CONFIDENCE: {((risk.confidence_score || 0.92) * 100).toFixed(0)}%</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isOnline ? (
              <>
                <Wifi size={13} color="#10b981" />
                <span style={{ color: '#10b981' }}>CLOUD CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff size={13} color="#f59e0b" />
                <span style={{ color: '#f59e0b' }}>LOCAL MARINE GUARDRAILS (OFFLINE)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Threat Banner (At-A-Glance Verdict) */}
      <div className={`card threat-main-card ${getRiskBorderClass()}`} style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div className={`status-badge ${getStatusBadgeClass()}`}>
                <span className="status-dot"></span>
                <span>{risk.risk_level.replace('_', ' ')}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                48-HOUR BIOLOGICAL THREAT HORIZON
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginTop: '0.35rem' }}>
              <div
                className="threat-score-value"
                style={{
                  color:
                    risk.risk_level === 'IMMINENT_COLLAPSE'
                      ? 'var(--color-collapse)'
                      : risk.risk_level === 'COUPLING_DRIFT'
                      ? 'var(--color-drift)'
                      : 'var(--color-stable)'
                }}
              >
                {(risk.crash_probability_48h * 100).toFixed(0)}%
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {risk.risk_level === 'IMMINENT_COLLAPSE'
                    ? 'Catastrophic Chemical Collapse Predicted'
                    : risk.risk_level === 'COUPLING_DRIFT'
                    ? 'Elevated Ionic Coupling Drift Detected'
                    : 'System Equilibrium Stable & Balanced'}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {risk.risk_level === 'IMMINENT_COLLAPSE'
                    ? 'Non-linear calcium carbonate precipitation or alkalinity shock will trigger coral tissue sloughing within 48h.'
                    : 'Active calcification is safe. Biological buffer remains intact.'}
                </p>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setIsLogModalOpen(true)}>
            <span>+ Enter New Test Kit Entry</span>
          </button>
        </div>

        {/* Primary Driver */}
        <div className="driver-box">
          <div className="driver-title">
            <AlertTriangle size={13} color="#f59e0b" />
            <span>Primary Vulnerability Driver &amp; Physical Mechanism</span>
          </div>
          <p className="driver-text">{risk.primary_driver}</p>
          {risk.secondary_driver && (
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {risk.secondary_driver}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tab Bar (Clean Startup-Grade UX) */}
      <nav className="tab-bar" aria-label="Dashboard Views">
        <button
          className={`tab-btn ${activeTab === 'telemetry' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Sliders size={15} />
          <span>Telemetry &amp; Trends</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'radar' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <Compass size={15} />
          <span>48h Biological Radar &amp; Coupled Matrix</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'dosing' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('dosing')}
        >
          <FileText size={15} />
          <span>Safe Dosing Protocol</span>
          {risk.risk_level !== 'STABLE' && (
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', marginLeft: '2px' }} />
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={15} />
          <span>Test History Ledger ({history.length})</span>
        </button>
      </nav>

      {/* TAB 1: Telemetry & Trends */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="telemetry-section-title">
              <Activity size={15} />
              <span>Eight Core Marine Parameters (Telemetry &amp; 24h Velocities)</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Compass size={16} />
                <span>48-Hour Biological Radar</span>
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

          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Shield size={16} />
                <span>Coupled Chemical Matrix (Cross-Parameter Equilibrium)</span>
              </span>
            </div>

            <div className="coupled-matrix-list">
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
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{indicators.mg_ca_status}</div>
                </div>
                <span
                  className="coupled-value"
                  style={{
                    color: indicators.mg_ca_ratio < 2.85 ? 'var(--color-collapse)' : 'var(--text-primary)'
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
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {indicators.aragonite_saturation_proxy < 1.0 ? 'Skeletal Dissolution' : 'Supersaturated'}
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
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {indicators.nutrient_starvation_flag ? 'Burnt Tip Hazard' : 'Redfield Buffer'}
                  </div>
                </div>
                <span className="coupled-value">{indicators.redfield_nutrient_ratio.toFixed(1)} : 1</span>
              </div>

              <div className="coupled-item">
                <div>
                  <div className="coupled-label-row">
                    <span className="coupled-label">Net Water Volume</span>
                    <Tooltip
                      title="Net System Water Volume"
                      text="Actual water volume excluding live rock and sand displacement."
                      why="All milliliter liquid chemical dosages are calculated stoichiometrically against this volume."
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dosing Calculation Basis</div>
                </div>
                <span className="coupled-value">{tankProfile.net_volume_liters} L</span>
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
