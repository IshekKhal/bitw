import React from 'react';
import Tooltip from './Tooltip';
import { TARGET_BASELINES } from '../guardrails';

export default function TelemetryGrid({ current, indicators, systemType = 'sps_dominant' }) {
  const targets = TARGET_BASELINES[systemType] || TARGET_BASELINES.sps_dominant;

  const params = [
    {
      id: 'param-alk',
      name: 'Alkalinity',
      formula: 'Carbonate (dKH)',
      value: current.alkalinity_dkh.toFixed(2),
      unit: 'dKH',
      velocity: indicators.alk_velocity_24h,
      velocityUnit: 'dKH/24h',
      target: `${targets.alkalinity_dkh.toFixed(1)} dKH`,
      clamp: 'Max +0.5/24h',
      tooltip: {
        title: 'Alkalinity (Carbonate Buffer)',
        text: 'The concentration of carbonate and bicarbonate ions in the water.',
        why: 'Think of alkalinity as the "bricks" corals need to build stone skeletons. If alkalinity drops or jumps by more than 0.5 in a day, coral skin literally sloughs off in ribbons (RTN).'
      },
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
      tooltip: {
        title: 'Dissolved Calcium',
        text: 'The mineral cation that binds with carbonate to form solid aragonite limestone.',
        why: 'If alkalinity is the brick, calcium is the "mortar". Corals need both in balance to grow stone houses.'
      },
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
      tooltip: {
        title: 'Magnesium (The Shield)',
        text: 'The key divalent cation preventing spontaneous abiotic calcite precipitation.',
        why: 'Magnesium is the "invisible bodyguard". In saltwater, calcium and alkalinity naturally want to stick together and fall to the bottom as chalk dust. Magnesium stops this from happening so corals can absorb them.'
      },
      isWarning: current.magnesium_ppm < 1250 || indicators.mg_ca_ratio < 2.85
    },
    {
      id: 'param-sg',
      name: 'Salinity',
      formula: 'Specific Gravity',
      value: current.salinity_sg.toFixed(4),
      unit: 'SG',
      velocity: null,
      target: `${targets.salinity_sg.toFixed(4)} SG`,
      clamp: 'Max +0.001/24h',
      tooltip: {
        title: 'Salinity (Specific Gravity)',
        text: 'The density and total dissolved salt concentration of the saltwater.',
        why: 'Controls water pressure inside coral cells. If salinity drops suddenly from a stuck freshwater top-off, coral cells absorb water like water balloons until they pop.'
      },
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
      clamp: 'Biological Buffer',
      tooltip: {
        title: 'Nitrate (Coral Food A)',
        text: 'Dissolved inorganic nitrogen utilized by symbiotic zooxanthellae.',
        why: 'Corals are not pure animals; they house microscopic plant-like algae in their skin. These algae need nitrate to produce sugars that feed the coral polyp.'
      },
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
      clamp: 'Biological Buffer',
      tooltip: {
        title: 'Phosphate (Coral Food B)',
        text: 'Dissolved inorganic phosphorus required for cellular ATP and nucleic acids.',
        why: 'Micro-nutrient for coral algae. If you strip phosphate to absolute zero (0.000) with chemical filters while alkalinity is high, coral growing tips burn black and detach.'
      },
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
      tooltip: {
        title: 'Water Temperature',
        text: 'The thermal governor of coral metabolic rate and calcification enzymes.',
        why: 'Corals cannot regulate body temperature. Too cold slows down biological pumps; too hot triggers coral bleaching where polyps spit out their symbiotic algae and starve.'
      },
      isWarning: current.temperature_c < 23.5 || current.temperature_c > 27.5
    },
    {
      id: 'param-ph',
      name: 'pH Index',
      formula: 'Acidity Index',
      value: current.ph.toFixed(2),
      unit: 'pH',
      velocity: null,
      target: '8.10 - 8.35',
      clamp: 'Acid Base',
      tooltip: {
        title: 'pH (Water Acidity)',
        text: 'The logarithmic measure of hydrogen ion activity in the water column.',
        why: 'If pH drops below 7.80, the water becomes acidic enough that it literally starts dissolving the calcium carbonate skeleton back into liquid water.'
      },
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="parameter-name">{p.name}</span>
                <Tooltip
                  title={p.tooltip.title}
                  text={p.tooltip.text}
                  whyItMatters={p.tooltip.why}
                />
              </div>
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
                  title="24-hour rate of change calculated from previous tests"
                >
                  {velFormatted}
                </span>
              )}
            </div>

            <div className="telemetry-target-row">
              <span>Target: {p.target}</span>
              <span title="Biological maximum safe adjustment rate per day">{p.clamp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
