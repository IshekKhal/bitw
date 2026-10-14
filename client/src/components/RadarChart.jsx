import React from 'react';

export default function RadarChart({ riskProbability, riskLevel }) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 100;

  // Calculate blip radius based on risk probability:
  // 0.0 risk = outer edge (maxRadius), 1.0 risk = near center (collapse)
  const clampedRisk = Math.min(Math.max(riskProbability, 0.0), 1.0);
  const blipRadius = (1.0 - clampedRisk) * (maxRadius - 20) + 15;
  
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
          {/* Background Grid Circles */}
          <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#1e2c47" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={maxRadius * 0.70} fill="none" stroke="#1e2c47" strokeWidth="1" />
          <circle cx={center} cy={center} r={maxRadius * 0.40} fill="none" stroke="#2a3d61" strokeWidth="1.5" />
          <circle cx={center} cy={center} r="4" fill="#38bdf8" />

          {/* Crosshair Axes */}
          <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="#1e2c47" strokeWidth="1" />
          <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="#1e2c47" strokeWidth="1" />

          {/* Zone Labels */}
          <text x={center + 4} y={center - maxRadius + 14} fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">
            STABLE [0-15%]
          </text>
          <text x={center + 4} y={center - maxRadius * 0.70 + 14} fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">
            DRIFT [15-45%]
          </text>
          <text x={center + 4} y={center - maxRadius * 0.40 + 12} fill="#ef4444" opacity="0.8" fontSize="8" fontFamily="JetBrains Mono">
            COLLAPSE [&gt;45%]
          </text>

          {/* Pulse Ripple on Target Blip */}
          <circle cx={blipX} cy={blipY} r="10" fill={themeColor} opacity="0.25">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Current Chemical Vector Blip */}
          <circle cx={blipX} cy={blipY} r="5" fill={themeColor} stroke="#ffffff" strokeWidth="1.5" />

          {/* Line from center to current vector */}
          <line x1={center} y1={center} x2={blipX} y2={blipY} stroke={themeColor} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
        </svg>
      </div>

      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
          EQUILIBRIUM HORIZON: 48 HOURS
        </span>
      </div>
    </div>
  );
}
