import React from 'react';

export default function ParameterTimeline({ current, history = [] }) {
  // Combine history and current in chronological order
  const allPoints = [...history, current].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  if (allPoints.length < 2) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <span className="card-title">SYNCHRONIZED CHEMICAL DRIFT TIMELINE</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
            Requires at least 2 historical logs
          </span>
        </div>
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
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

  return (
    <div className="card" id="parameter-timeline" style={{ padding: '1.25rem' }}>
      <div className="card-header">
        <span className="card-title">SYNCHRONIZED CHEMICAL DRIFT TIMELINE (ALKALINITY / MG BUFFER)</span>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
          <span style={{ color: '#38bdf8' }}>— Alkalinity (dKH)</span>
          <span style={{ color: '#10b981' }}>-- Safe Zone (7.8 - 9.0)</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Safe Band Background */}
          {minAlk <= 9.0 && maxAlk >= 7.8 && (
            <rect
              x={padding.left}
              y={getY(Math.min(maxAlk, 9.0))}
              width={chartW}
              height={Math.max(getY(Math.max(minAlk, 7.8)) - getY(Math.min(maxAlk, 9.0)), 0)}
              fill="#10b981"
              opacity="0.08"
            />
          )}

          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="#1e2c47" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2} stroke="#1e2c47" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="#1e2c47" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={padding.left - 8} y={padding.top + 4} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
            {maxAlk.toFixed(1)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH / 2 + 3} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
            {((maxAlk + minAlk) / 2).toFixed(1)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
            {minAlk.toFixed(1)}
          </text>

          {/* Alkalinity Trajectory Line */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            points={pointsString}
          />

          {/* Data Points */}
          {allPoints.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.alkalinity_dkh);
            const dateLabel = new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <text x={cx} y={padding.top + chartH + 18} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                  {dateLabel}
                </text>
                <text x={cx} y={cy - 8} fill="#f8fafc" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  {p.alkalinity_dkh.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
