import React from 'react';

export default function ParameterTimeline({ current, history = [] }) {
  // Combine history and current in chronological order
  const allPoints = [...history, current].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const width = 800;
  const height = 180;
  const padding = { top: 24, right: 30, bottom: 32, left: 45 };

  if (allPoints.length < 2) {
    return (
      <div className="timeline-card">
        <div className="timeline-header">
          <span className="timeline-title">Synchronized Chemical Drift Timeline</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Requires ≥2 historical test logs
          </span>
        </div>
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Log additional test kit entries to activate rate-of-change trajectory tracking.
        </div>
      </div>
    );
  }

  // Calculate scales for Alkalinity (dKH)
  const alkValues = allPoints.map((p) => p.alkalinity_dkh);
  const minAlk = Math.max(Math.min(...alkValues) - 0.5, 5.0);
  const maxAlk = Math.min(Math.max(...alkValues) + 0.5, 13.0);

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (idx) => padding.left + (idx / (allPoints.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minAlk) / (maxAlk - minAlk)) * chartH;

  // Build SVG polyline points
  const pointsString = allPoints
    .map((p, idx) => `${getX(idx)},${getY(p.alkalinity_dkh)}`)
    .join(' ');

  // Area path for subtle gradient under the trajectory
  const firstX = getX(0);
  const lastX = getX(allPoints.length - 1);
  const baseY = padding.top + chartH;
  const areaPath = `M ${firstX},${baseY} L ${pointsString} L ${lastX},${baseY} Z`;

  return (
    <div className="timeline-card" id="parameter-timeline">
      <div className="timeline-header">
        <span className="timeline-title">Synchronized Chemical Drift Timeline (Alkalinity / Buffer)</span>
        <div className="timeline-legend">
          <span style={{ color: '#38bdf8' }}>— Carbonate (dKH)</span>
          <span style={{ color: '#10b981' }}>-- Safe Window (7.8 – 9.0)</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="timelineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Safe Band Envelope */}
          {minAlk <= 9.0 && maxAlk >= 7.8 && (
            <rect
              x={padding.left}
              y={getY(Math.min(maxAlk, 9.0))}
              width={chartW}
              height={Math.max(getY(Math.max(minAlk, 7.8)) - getY(Math.min(maxAlk, 9.0)), 0)}
              fill="#10b981"
              opacity="0.06"
            />
          )}

          {/* Subtle Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Y Axis Numeric Labels */}
          <text x={padding.left - 8} y={padding.top + 4} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
            {maxAlk.toFixed(1)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH / 2 + 3} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
            {((maxAlk + minAlk) / 2).toFixed(1)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
            {minAlk.toFixed(1)}
          </text>

          {/* Shaded Area under Curve */}
          <path d={areaPath} fill="url(#timelineAreaGrad)" />

          {/* Alkalinity Trajectory Stroke */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            points={pointsString}
          />

          {/* Data Points */}
          {allPoints.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.alkalinity_dkh);
            const dateLabel = new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="4" fill="#07090e" stroke="#38bdf8" strokeWidth="2" />
                <text x={cx} y={padding.top + chartH + 18} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                  {dateLabel}
                </text>
                <text x={cx} y={cy - 8} fill="#f8fafc" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="600">
                  {p.alkalinity_dkh.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
