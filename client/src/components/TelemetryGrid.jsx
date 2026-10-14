import React from 'react';
import { TARGET_BASELINES } from '../guardrails';

export default function TelemetryGrid({ current, indicators, systemType = 'sps_dominant' }) {
  const targets = TARGET_BASELINES[systemType] || TARGET_BASELINES.sps_dominant;

  const params = [
    {
      id: 'param-alk',
      name: 'Alkalinity',
      formula: 'CO3(2-) / HCO3(-)',
      value: current.alkalinity_dkh.toFixed(2),
      unit: 'dKH',
      velocity: indicators.alk_velocity_24h,
      velocityUnit: 'dKH/24h',
      target: `${targets.alkalinity_dkh.toFixed(1)} dKH`,
      clamp: 'Max +0.5/24h',
      isWarning: Math.abs(indicators.alk_velocity_24h) >= 0.50 || current.alkalinity_dkh < 7.0 || current.alkalinity_dkh > 10.5
    },
    {
      id: 'param-ca',
      name: 'Calcium',
      formula: 'Ca(2+)',
      value: current.calcium_ppm.toFixed(0),
      unit: 'ppm',
      velocity: indicators.ca_velocity_24h,
      velocityUnit: 'ppm/24h',
      target: `${targets.calcium_ppm.toFixed(0)} ppm`,
      clamp: 'Max +20/24h',
      isWarning: current.calcium_ppm < 380 || current.calcium_ppm > 480
    },
    {
      id: 'param-mg',
      name: 'Magnesium',
      formula: 'Mg(2+)',
      value: current.magnesium_ppm.toFixed(0),
      unit: 'ppm',
      velocity: indicators.mg_velocity_24h,
      velocityUnit: 'ppm/24h',
      target: `${targets.magnesium_ppm.toFixed(0)} ppm`,
      clamp: 'Max +50/24h',
      isWarning: current.magnesium_ppm < 1250 || indicators.mg_ca_ratio < 2.85
    },
    {
      id: 'param-sg',
      name: 'Salinity',
      formula: 'Density (NaCl)',
      value: current.salinity_sg.toFixed(4),
      unit: 'SG',
      velocity: null,
      target: `${targets.salinity_sg.toFixed(4)} SG`,
      clamp: 'Max +0.001/24h',
      isWarning: current.salinity_sg < 1.023 || current.salinity_sg > 1.027
    },
    {
      id: 'param-no3',
      name: 'Nitrate',
      formula: 'NO3(-)',
      value: current.nitrate_ppm.toFixed(1),
      unit: 'ppm',
      velocity: null,
      target: '2.0 - 10.0 ppm',
      clamp: 'Biological',
      isWarning: current.nitrate_ppm < 0.5 || current.nitrate_ppm > 25.0
    },
    {
      id: 'param-po4',
      name: 'Phosphate',
      formula: 'PO4(3-)',
      value: current.phosphate_ppm.toFixed(3),
      unit: 'ppm',
      velocity: null,
      target: '0.03 - 0.08 ppm',
      clamp: 'Biological',
      isWarning: current.phosphate_ppm < 0.010 || current.phosphate_ppm > 0.150
    },
    {
      id: 'param-temp',
      name: 'Temperature',
      formula: 'Thermal Pace',
      value: current.temperature_c.toFixed(1),
      unit: '°C',
      velocity: null,
      target: `${targets.temperature_c.toFixed(1)} °C`,
      clamp: 'Max ±1.0/24h',
      isWarning: current.temperature_c < 23.5 || current.temperature_c > 27.5
    },
    {
      id: 'param-ph',
      name: 'pH Index',
      formula: '-log[H+]',
      value: current.ph.toFixed(2),
      unit: 'pH',
      velocity: null,
      target: '8.10 - 8.35',
      clamp: 'Acid Base',
      isWarning: current.ph < 7.90 || current.ph > 8.50
    }
  ];

  return (
    <div className="telemetry-grid" id="telemetry-grid">
      {params.map((p) => {
        const velFormatted =
          p.velocity !== null && p.velocity !== undefined
            ? `${p.velocity > 0 ? '+' : ''}${p.velocity.toFixed(2)} ${p.velocityUnit}`
            : null;

        return (
          <div
            key={p.id}
            id={p.id}
            className="telemetry-card"
            style={{
              borderColor: p.isWarning ? 'var(--color-collapse-border)' : 'var(--border-subtle)'
            }}
          >
            <div className="telemetry-card-top">
              <span className="parameter-name">{p.name}</span>
              <span className="parameter-formula">{p.formula}</span>
            </div>

            <div className="parameter-reading-row">
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="parameter-value">{p.value}</span>
                <span className="parameter-unit">{p.unit}</span>
              </div>

              {velFormatted && (
                <span
                  className={`velocity-badge ${
                    Math.abs(p.velocity) >= 0.40 ? 'velocity-alert' : 'velocity-neutral'
                  }`}
                >
                  {velFormatted}
                </span>
              )}
            </div>

            <div className="telemetry-target-row">
              <span>Target: {p.target}</span>
              <span>{p.clamp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
