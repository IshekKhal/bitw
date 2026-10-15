import React, { useState } from 'react';

const PARAM_CONFIGS = {
  alkalinity_dkh: {
    label: 'Alkalinity',
    unit: 'dKH',
    color: '#38bdf8',
    safeMin: 7.8,
    safeMax: 8.8,
    decimals: 2,
    buffer: 0.5
  },
  calcium_ppm: {
    label: 'Calcium',
    unit: 'ppm',
    color: '#2dd4bf',
    safeMin: 400,
    safeMax: 450,
    decimals: 0,
    buffer: 20
  },
  magnesium_ppm: {
    label: 'Magnesium',
    unit: 'ppm',
    color: '#a78bfa',
    safeMin: 1280,
    safeMax: 1420,
    decimals: 0,
    buffer: 40
  },
  salinity_sg: {
    label: 'Salinity',
    unit: 'SG',
    color: '#38bdf8',
    safeMin: 1.0245,
    safeMax: 1.0265,
    decimals: 4,
    buffer: 0.002
  },
  nitrate_ppm: {
    label: 'Nitrate',
    unit: 'ppm',
    color: '#f59e0b',
    safeMin: 2.0,
    safeMax: 10.0,
    decimals: 1,
    buffer: 2.0
  },
  phosphate_ppm: {
    label: 'Phosphate',
    unit: 'ppm',
    color: '#fb7185',
    safeMin: 0.030,
    safeMax: 0.080,
    decimals: 3,
    buffer: 0.02
  },
  temperature_c: {
    label: 'Temperature',
    unit: '°C',
    color: '#38bdf8',
    safeMin: 24.5,
    safeMax: 26.0,
    decimals: 1,
    buffer: 1.0
  },
  ph: {
    label: 'pH Index',
    unit: 'pH',
    color: '#34d399',
    safeMin: 8.10,
    safeMax: 8.35,
    decimals: 2,
    buffer: 0.15
  }
};

export default function ParameterTimeline({ current, history = [] }) {
  const [selectedParam, setSelectedParam] = useState('alkalinity_dkh');

  // Combine history and current in chronological order
  const allPoints = [...history, current].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const cfg = PARAM_CONFIGS[selectedParam] || PARAM_CONFIGS.alkalinity_dkh;
  const width = 800;
  const height = 180;
  const padding = { top: 24, right: 30, bottom: 32, left: 55 };

  if (allPoints.length < 2) {
    return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Parameter Trajectory Tracking
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Log at least 2 water test entries to activate historical chemical drift tracking.
        </div>
      </div>
    );
  }

  // Calculate scales for active parameter
  const values = allPoints.map((p) => p[selectedParam] ?? 0);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const minVal = Math.min(rawMin - cfg.buffer, cfg.safeMin - cfg.buffer);
  const maxVal = Math.max(rawMax + cfg.buffer, cfg.safeMax + cfg.buffer);

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (idx) => padding.left + (idx / (allPoints.length - 1)) * chartW;
  const getY = (val) => {
    if (maxVal === minVal) return padding.top + chartH / 2;
    return padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  };

  // Build SVG polyline points
  const pointsString = allPoints
    .map((p, idx) => `${getX(idx)},${getY(p[selectedParam] ?? 0)}`)
    .join(' ');

  // Area path for subtle gradient under the trajectory
  const firstX = getX(0);
  const lastX = getX(allPoints.length - 1);
  const baseY = padding.top + chartH;
  const areaPath = `M ${firstX},${baseY} L ${pointsString} L ${lastX},${baseY} Z`;

  return (
    <div className="card" id="parameter-timeline">
      {/* Header: Title + Parameter Selection Chips */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
        <div>
          <div className="card-title">Chemical Trajectory Timeline</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Multi-test drift velocity against safe biological target band
          </div>
        </div>

        {/* Legend Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: cfg.color }}>— {cfg.label} ({cfg.unit})</span>
          <span style={{ color: '#10b981' }}>-- Safe Window ({cfg.safeMin}–{cfg.safeMax})</span>
        </div>
      </div>

      {/* Parameter Switcher Chips */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem',
          borderBottom: '1px solid var(--border-hairline)',
          scrollbarWidth: 'none'
        }}
      >
        {Object.entries(PARAM_CONFIGS).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedParam(key)}
            style={{
              background: selectedParam === key ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
              border: `1px solid ${selectedParam === key ? '#38bdf8' : 'var(--border-hairline)'}`,
              color: selectedParam === key ? '#38bdf8' : 'var(--text-secondary)',
              padding: '0.25rem 0.55rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', minWidth: '500px' }}>
          <defs>
            <linearGradient id="timelineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Safe Band Envelope */}
          {minVal <= cfg.safeMax && maxVal >= cfg.safeMin && (
            <rect
              x={padding.left}
              y={getY(Math.min(maxVal, cfg.safeMax))}
              width={chartW}
              height={Math.max(getY(Math.max(minVal, cfg.safeMin)) - getY(Math.min(maxVal, cfg.safeMax)), 0)}
              fill="#10b981"
              opacity="0.08"
            />
          )}

          {/* Subtle Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Y Axis Numeric Labels */}
          <text x={padding.left - 8} y={padding.top + 4} fill="#94a3b8" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="end">
            {maxVal.toFixed(cfg.decimals)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH / 2 + 3} fill="#94a3b8" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="end">
            {((maxVal + minVal) / 2).toFixed(cfg.decimals)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH} fill="#94a3b8" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="end">
            {minVal.toFixed(cfg.decimals)}
          </text>

          {/* Shaded Area under Curve */}
          <path d={areaPath} fill="url(#timelineAreaGrad)" />

          {/* Trajectory Stroke */}
          <polyline
            fill="none"
            stroke={cfg.color}
            strokeWidth="2"
            points={pointsString}
          />

          {/* Data Points */}
          {allPoints.map((p, idx) => {
            const val = p[selectedParam] ?? 0;
            const cx = getX(idx);
            const cy = getY(val);
            const dateLabel = new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const inSafe = val >= cfg.safeMin && val <= cfg.safeMax;

            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="4" fill="#07090e" stroke={inSafe ? cfg.color : '#f43f5e'} strokeWidth="2" />
                <text x={cx} y={padding.top + chartH + 18} fill="#94a3b8" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="middle">
                  {dateLabel}
                </text>
                <text x={cx} y={cy - 8} fill="#f8fafc" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="600">
                  {val.toFixed(cfg.decimals)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
