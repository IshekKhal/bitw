import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import RadarChart from './components/RadarChart';
import TelemetryGrid from './components/TelemetryGrid';
import ParameterTimeline from './components/ParameterTimeline';
import RemediationDrawer from './components/RemediationDrawer';
import LogTestModal from './components/LogTestModal';
import DodoCheckoutModal from './components/DodoCheckoutModal';
import { evaluateClientGuardrails } from './guardrails';
import { Shield, Activity, Wifi, WifiOff, AlertTriangle, Cpu } from 'lucide-react';

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
  const [tankProfile, setTankProfile] = useState(DEFAULT_TANK_PROFILE);
  const [currentTest, setCurrentTest] = useState(DEFAULT_CURRENT_TEST);
  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load presets from API or use hardcoded fallbacks
  useEffect(() => {
    fetch('/api/presets')
      .then((res) => res.json())
      .then((data) => setPresets(data))
      .catch(() => {
        // Fallback presets
        setPresets([
          {
            id: 'preset_stable_sps',
            name: '120G Acropora Sanctuary (Equilibrium)'
          },
          {
            id: 'preset_mg_collapse',
            name: 'The Silent Magnesium Collapse'
          },
          {
            id: 'preset_alk_shock',
            name: 'Dosing Pump Clog (Alkalinity Shock & RTN)'
          },
          {
            id: 'preset_burnt_tips',
            name: 'Nutrient Bottom-Out (Burnt Tips)'
          }
        ]);
      });
  }, []);

  // Evaluate risk whenever test metrics or profile change
  const evaluateTelemetry = useCallback(async (testEntry, hist, profile) => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tank_profile: profile,
          current_test: testEntry,
          history: hist
        })
      });

      if (!res.ok) throw new Error('API server unavailable');
      const data = await res.json();
      setPrediction(data);
      setIsOnline(true);
    } catch (err) {
      // Automatic client-side deterministic fallback
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

  // Handle Preset Selection
  const handleSelectPreset = (presetId) => {
    const selected = presets.find((p) => p.id === presetId);
    if (selected && selected.current_test) {
      setTankProfile(selected.tank_profile);
      setCurrentTest(selected.current_test);
      setHistory(selected.history || []);
    } else {
      // Hardcoded archetypes if fetched list was minimal
      if (presetId === 'preset_mg_collapse') {
        const now = new Date();
        const prev = new Date(now.getTime() - 2 * 86400000);
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
        const now = new Date();
        const prev = new Date(now.getTime() - 2 * 86400000);
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
        const now = new Date();
        const prev = new Date(now.getTime() - 2 * 86400000);
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
        // Stable default
        const now = new Date();
        const prev = new Date(now.getTime() - 2 * 86400000);
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
    // Current test shifts to history
    setHistory((prev) => [currentTest, ...prev]);
    setCurrentTest(newEntry);
  };

  const risk = prediction?.risk_assessment || {
    crash_probability_48h: 0.06,
    risk_level: 'STABLE',
    confidence_score: 0.95,
    primary_driver: 'Calculating biological baseline...'
  };

  const indicators = prediction?.chemical_indicators || {
    mg_ca_ratio: 3.20,
    mg_ca_status: 'BALANCED',
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
      {/* Header */}
      <Header
        tankProfile={tankProfile}
        onTankProfileChange={setTankProfile}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenProModal={() => setIsProModalOpen(true)}
        isPro={isPro}
        isOnline={isOnline}
        engineMode={prediction?.engine_used || 'Initializing...'}
      />

      {/* Engine Status Ribbon */}
      <div className="engine-status-bar" id="engine-status-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu size={15} color="#38bdf8" />
          <span>INFERENCE ENGINE:</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>
            {prediction?.engine_used || 'Prior Labs TabPFN-3.5 Foundation In-Context'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>CONFIDENCE: {((risk.confidence_score || 0.92) * 100).toFixed(0)}%</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isOnline ? (
              <>
                <Wifi size={14} color="#10b981" />
                <span style={{ color: '#10b981' }}>CLOUD ACTIVE</span>
              </>
            ) : (
              <>
                <WifiOff size={14} color="#f59e0b" />
                <span style={{ color: '#f59e0b' }}>LOCAL GUARDRAILS (OFFLINE)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Threat Grid (Radar, Score, Coupled Matrix) */}
      <section className="threat-grid" id="threat-diagnostics-section">
        {/* Left: Biological Radar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Activity size={16} />
              <span>48-Hour Biological Radar</span>
            </span>
          </div>
          <RadarChart
            riskProbability={risk.crash_probability_48h}
            riskLevel={risk.risk_level}
          />
        </div>

        {/* Center: Threat Score & Primary Drivers */}
        <div className={`card threat-main-card ${getRiskBorderClass()}`}>
          <div>
            <div className="card-header" style={{ marginBottom: '0.5rem' }}>
              <span className="card-title">SYSTEM EQUILIBRIUM STATE</span>
              <div className={`status-badge ${getStatusBadgeClass()}`}>
                <span className="status-dot"></span>
                <span>{risk.risk_level.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="threat-score-block">
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
              <div className="threat-score-labels">
                <span className="threat-meta-label">48-Hour Crash Likelihood</span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Non-linear tissue detachment probability
                </span>
              </div>
            </div>

            <div className="driver-box">
              <div className="driver-title">
                <AlertTriangle size={14} color="#f59e0b" />
                <span>Primary Vulnerability Driver</span>
              </div>
              <p className="driver-text">{risk.primary_driver}</p>
              {risk.secondary_driver && (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  {risk.secondary_driver}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
              EVALUATED AT: {prediction?.evaluated_at ? new Date(prediction.evaluated_at).toLocaleTimeString() : 'Live'}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsLogModalOpen(true)}>
              Recalculate with New Kit Reading
            </button>
          </div>
        </div>

        {/* Right: Coupled Chemical Matrix */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Shield size={16} />
              <span>Coupled Matrix</span>
            </span>
          </div>

          <div className="coupled-matrix-list">
            <div className="coupled-item">
              <div>
                <div className="coupled-label">Magnesium Shield (Mg:Ca)</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {indicators.mg_ca_status}
                </div>
              </div>
              <span
                className="coupled-value"
                style={{
                  color: indicators.mg_ca_ratio < 2.85 ? 'var(--color-collapse)' : '#f8fafc'
                }}
              >
                {indicators.mg_ca_ratio.toFixed(2)} : 1
              </span>
            </div>

            <div className="coupled-item">
              <div>
                <div className="coupled-label">Aragonite Proxy (Ω)</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {indicators.aragonite_saturation_proxy < 1.0 ? 'Skeletal Dissolution' : 'Supersaturated'}
                </div>
              </div>
              <span className="coupled-value">
                {indicators.aragonite_saturation_proxy.toFixed(2)}
              </span>
            </div>

            <div className="coupled-item">
              <div>
                <div className="coupled-label">Nutrient Balance (N:P)</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {indicators.nutrient_starvation_flag ? 'Burnt Tip Hazard' : 'Redfield Buffer'}
                </div>
              </div>
              <span className="coupled-value">
                {indicators.redfield_nutrient_ratio.toFixed(1)} : 1
              </span>
            </div>

            <div className="coupled-item">
              <div>
                <div className="coupled-label">Net Water Volume</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Dosing Calculation Basis
                </div>
              </div>
              <span className="coupled-value">
                {tankProfile.net_volume_liters} L
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Parameter Telemetry Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="telemetry-section-title">
          <Activity size={16} />
          <span>Eight Core Marine Parameters (Telemetry &amp; 24h Velocities)</span>
        </div>
        <TelemetryGrid
          current={currentTest}
          indicators={indicators}
          systemType={tankProfile.system_type}
        />
      </section>

      {/* Synchronized Chemical Drift Timeline */}
      <ParameterTimeline current={currentTest} history={history} />

      {/* Multi-Day Remediation Schedule Drawer */}
      <RemediationDrawer
        plan={prediction?.remediation_plan}
        riskAssessment={risk}
        tankVolume={tankProfile.net_volume_liters}
      />

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
        onProActivated={(email) => {
          setIsPro(true);
        }}
      />
    </div>
  );
}
