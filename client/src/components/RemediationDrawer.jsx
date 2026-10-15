import React from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RemediationDrawer({ plan, riskAssessment, tankVolume }) {
  // If no corrective dosing needed (tank in equilibrium), display reassuring status
  if (!plan || !plan.rate_limited_schedule || plan.rate_limited_schedule.length === 0) {
    return (
      <div className="card" id="remediation-stable-state" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '50%',
            background: 'var(--status-stable-bg)',
            border: '1px solid var(--status-stable-border)',
            color: 'var(--status-stable)',
            marginBottom: '1rem'
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: 700 }}>
          Aquarium in Biological Equilibrium
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
          All 8 water chemistry parameters and coupled ion ratios are within nominal baseline boundaries. No corrective emergency dosing is required.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span>Net Volume: {tankVolume} L</span>
          <span>•</span>
          <span>Safety Clamps Active</span>
        </div>
      </div>
    );
  }

  const isCritical = riskAssessment?.risk_level === 'IMMINENT_COLLAPSE';

  return (
    <div className="card" id="remediation-plan-section">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} className="text-cyan" />
            <span>Biological Safe Dosing Protocol</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Multi-day staggered schedule governed by biological rate clamps
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Net Volume: {tankVolume} Liters
        </span>
      </div>

      {isCritical && (
        <div
          style={{
            background: 'var(--status-collapse-bg)',
            border: '1px solid var(--status-collapse-border)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}
        >
          <AlertOctagon size={20} color="var(--status-collapse)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Do not dose all at once:</strong> Rapid chemical shifts cause tissue necrosis faster than depleted numbers. Follow the daily biological ramp below.
          </div>
        </div>
      )}

      {/* Desktop Dosing Table (Hidden on small mobile via CSS) */}
      <div className="dosing-desktop-table schedule-table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th style={{ width: '85px' }}>Timeline</th>
              <th>Action &amp; Target</th>
              <th>Chemical Agent</th>
              <th style={{ width: '100px' }}>Daily Dose</th>
              <th>End-of-Day Target</th>
              <th>Biochemical Rationale</th>
            </tr>
          </thead>
          <tbody>
            {plan.rate_limited_schedule.map((step) => (
              <tr key={step.day}>
                <td>
                  <span className="schedule-day-badge">Day {step.day}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.date}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {step.action}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {step.chemical}
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: step.amount_ml > 0 ? '#38bdf8' : 'var(--text-muted)'
                    }}
                  >
                    {step.amount_ml > 0 ? `${step.amount_ml} ml` : '0 ml'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                  {step.expected_parameter_end_of_day ? (
                    <>
                      Alk: {step.expected_parameter_end_of_day.alkalinity_dkh} dKH |{' '}
                      Ca: {step.expected_parameter_end_of_day.calcium_ppm} ppm |{' '}
                      Mg: {step.expected_parameter_end_of_day.magnesium_ppm} ppm
                    </>
                  ) : (
                    'Unchanged'
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {step.reasoning || step.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Dosing Cards (Visible on mobile via CSS) */}
      <div className="dosing-mobile-cards">
        {plan.rate_limited_schedule.map((step) => (
          <div key={step.day} className="dosing-card-step">
            <div className="dosing-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="schedule-day-badge">Day {step.day}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.date}</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: step.amount_ml > 0 ? '#38bdf8' : 'var(--text-muted)'
                }}
              >
                {step.amount_ml > 0 ? `${step.amount_ml} ml` : '0 ml dose'}
              </span>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              {step.action}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              Agent: {step.chemical}
            </div>

            {step.expected_parameter_end_of_day && (
              <div
                style={{
                  marginTop: '0.4rem',
                  padding: '0.35rem 0.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#94a3b8'
                }}
              >
                Target: Alk {step.expected_parameter_end_of_day.alkalinity_dkh} dKH • Ca {step.expected_parameter_end_of_day.calcium_ppm} • Mg {step.expected_parameter_end_of_day.magnesium_ppm}
              </div>
            )}

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.4rem' }}>
              {step.reasoning || step.rationale}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
