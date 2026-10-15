import React from 'react';

export default function RadarChart({ riskProbability, riskLevel }) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 96;

  // Standard Instrument Model:
  // Center (radius ~10) = 0% risk (Homeostasis / Target Equilibrium)
  // Outer perimeter (radius ~92) = 100% risk (Rapid Tissue Necrosis / Collapse Horizon)
  const clampedRisk = Math.min(Math.max(riskProbability, 0.0), 1.0);
  const blipRadius = clampedRisk * (maxRadius - 24) + 10;

  // Angle influenced by risk state
  const angleRad = (clampedRisk * 180 + 45) * (Math.PI / 180);
  const blipX = center + blipRadius * Math.cos(angleRad);
  const blipY = center + blipRadius * Math.sin(angleRad);

  const getThemeColor = () => {
    if (riskLevel === 'IMMINENT_COLLAPSE') return '#ef4444';
    if (riskLevel === 'COUPLING_DRIFT') return '#f59e0b';
    return '#10b981';
  };

  const themeColor = getThemeColor();

  return (
    <div className="radar-box" id="biological-radar">
      <div className="radar-canvas-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Concentric Risk Zones */}
          {/* Outer Danger Ring (>45% Collapse) */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Middle Drift Ring (15-45% Drift) */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius * 0.58}
            fill="none"
            stroke="rgba(245, 158, 11, 0.3)"
            strokeWidth="1"
          />

          {/* Inner Homeostasis Bullseye (0-15% Stable) */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius * 0.26}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="1.2"
          />

          {/* Center Origin Dot (Baseline Homeostasis) */}
          <circle cx={center} cy={center} r="3" fill="#10b981" />

          {/* Crosshair Radial Axes */}
          <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

          {/* Zone Labels (High Contrast, Human-Readable) */}
          <text x={center + 4} y={center - maxRadius * 0.26 + 10} fill="#10b981" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="600">
            STABLE [0-15%]
          </text>
          <text x={center + 4} y={center - maxRadius * 0.58 + 11} fill="#f59e0b" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="600">
            DRIFT [15-45%]
          </text>
          <text x={center + 4} y={center - maxRadius + 12} fill="#ef4444" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="700">
            COLLAPSE [&gt;45%]
          </text>

          {/* Pulse Ripple on Current Vector */}
          <circle cx={blipX} cy={blipY} r="10" fill={themeColor} opacity="0.25">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Current Chemical Vector Blip */}
          <circle cx={blipX} cy={blipY} r="5" fill={themeColor} stroke="#ffffff" strokeWidth="1.5" />

          {/* Line from center (baseline) to current vector */}
          <line x1={center} y1={center} x2={blipX} y2={blipY} stroke={themeColor} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.85" />
        </svg>
      </div>

      <div style={{ marginTop: '0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          EQUILIBRIUM HORIZON: 48 HOURS
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Center = Homeostasis • Perimeter = Collapse Hazard
        </span>
      </div>
    </div>
  );
}
