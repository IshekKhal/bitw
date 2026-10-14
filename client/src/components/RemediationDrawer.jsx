import React from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RemediationDrawer({ plan, riskAssessment, tankVolume }) {
  if (!plan || !plan.rate_limited_schedule || plan.rate_limited_schedule.length === 0) {
    return null;
  }

  const isCritical = riskAssessment.risk_level === 'IMMINENT_COLLAPSE';

  return (
    <div className="remediation-card" id="remediation-plan-section">
      <div className="card-header">
        <span className="card-title">
          <ShieldAlert size={16} />
          <span>BIOLOGICAL SAFE DOSING PROTOCOL (RATE-LIMITED STAGGERED SCHEDULE)</span>
        </span>
        <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
          NET VOLUME: {tankVolume} LITERS
        </span>
      </div>

      {isCritical && (
        <div
          style={{
            background: 'var(--color-collapse-bg)',
            border: '1px solid var(--color-collapse-border)',
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
          <AlertOctagon size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong>DO NOT DOSE ALL AT ONCE:</strong> Sudden adjustments cause rapid tissue necrosis faster than low numbers. Follow the multi-day biological ramp below.
          </div>
        </div>
      )}

      <div className="schedule-table-wrap">
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
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    {step.date}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {step.action}
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
                  {step.chemical}
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 700,
                      color: step.amount_ml > 0 ? '#38bdf8' : '#64748b'
                    }}
                  >
                    {step.amount_ml > 0 ? `${step.amount_ml} ml` : '0 ml'}
                  </span>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
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
                <td style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {step.reasoning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
