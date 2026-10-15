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
      rawValue: current.alkalinity_dkh,
      value: current.alkalinity_dkh.toFixed(2),
      unit: 'dKH',
      min: 5.0,
      max: 13.0,
      safeMin: 7.8,
      safeMax: 8.8,
      velocity: indicators.alk_velocity_24h,
      velocityUnit: 'dKH/24h',
      target: `${targets.alkalinity_dkh.toFixed(1)} dKH`,
      clamp: 'Max +0.5/24h',
      tooltip: {
        title: 'Alkalinity (Carbonate Buffer)',
        text: 'The concentration of carbonate and bicarbonate ions in the water.',
        why: 'Think of alkalinity as the "bricks" corals need to build stone skeletons. If alkalinity drops or jumps by more than 0.5 in a day, coral skin literally sloughs off in ribbons (RTN).'
      },
      isWarning: Math.abs(indicators.alk_velocity_24h) >= 0.50 || current.alkalinity_dkh < 7.5 || current.alkalinity_dkh > 9.5
    },
    {
      id: 'param-ca',
      name: 'Calcium',
      formula: 'Ca(2+)',
      rawValue: current.calcium_ppm,
      value: current.calcium_ppm.toFixed(0),
      unit: 'ppm',
      min: 320,
      max: 540,
      safeMin: 400,
      safeMax: 450,
      velocity: indicators.ca_velocity_24h,
      velocityUnit: 'ppm/24h',
      target: `${targets.calcium_ppm.toFixed(0)} ppm`,
      clamp: 'Max +20/24h',
      tooltip: {
        title: 'Dissolved Calcium',
        text: 'The mineral cation that binds with carbonate to form solid aragonite limestone.',
        why: 'If alkalinity is the brick, calcium is the "mortar". Corals need both in balance to grow stone houses.'
      },
      isWarning: current.calcium_ppm < 390 || current.calcium_ppm > 470
    },
    {
      id: 'param-mg',
      name: 'Magnesium',
      formula: 'Mg(2+)',
      rawValue: current.magnesium_ppm,
      value: current.magnesium_ppm.toFixed(0),
      unit: 'ppm',
      min: 1000,
      max: 1600,
      safeMin: 1280,
      safeMax: 1420,
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
      rawValue: current.salinity_sg,
      value: current.salinity_sg.toFixed(4),
      unit: 'SG',
      min: 1.0210,
      max: 1.0290,
      safeMin: 1.0245,
      safeMax: 1.0265,
      velocity: null,
      target: `${targets.salinity_sg.toFixed(4)} SG`,
      clamp: 'Max +0.001/24h',
      tooltip: {
        title: 'Salinity (Specific Gravity)',
        text: 'The density and total dissolved salt concentration of the saltwater.',
        why: 'Controls water pressure inside coral cells. If salinity drops suddenly from a stuck freshwater top-off, coral cells absorb water like water balloons until they pop.'
      },
      isWarning: current.salinity_sg < 1.0235 || current.salinity_sg > 1.0270
    },
    {
      id: 'param-no3',
      name: 'Nitrate',
      formula: 'NO3(-)',
      rawValue: current.nitrate_ppm,
      value: current.nitrate_ppm.toFixed(1),
      unit: 'ppm',
      min: 0.0,
      max: 30.0,
      safeMin: 2.0,
      safeMax: 12.0,
      velocity: null,
      target: '2.0 - 10.0 ppm',
      clamp: 'Bio Buffer',
      tooltip: {
        title: 'Nitrate (Coral Food A)',
        text: 'Dissolved inorganic nitrogen utilized by symbiotic zooxanthellae.',
        why: 'Corals are not pure animals; they house microscopic plant-like algae in their skin. These algae need nitrate to produce sugars that feed the coral polyp.'
      },
      isWarning: current.nitrate_ppm < 0.5 || current.nitrate_ppm > 20.0
    },
    {
      id: 'param-po4',
      name: 'Phosphate',
      formula: 'PO4(3-)',
      rawValue: current.phosphate_ppm,
      value: current.phosphate_ppm.toFixed(3),
      unit: 'ppm',
      min: 0.000,
      max: 0.150,
      safeMin: 0.030,
      safeMax: 0.080,
      velocity: null,
      target: '0.03 - 0.08 ppm',
      clamp: 'Bio Buffer',
      tooltip: {
        title: 'Phosphate (Coral Food B)',
        text: 'Dissolved inorganic phosphorus required for cellular ATP and nucleic acids.',
        why: 'Micro-nutrient for coral algae. If you strip phosphate to absolute zero (0.000) with chemical filters while alkalinity is high, coral growing tips burn black and detach.'
      },
      isWarning: current.phosphate_ppm < 0.015 || current.phosphate_ppm > 0.120
    },
    {
      id: 'param-temp',
      name: 'Temperature',
      formula: 'Thermal Pace',
      rawValue: current.temperature_c,
      value: current.temperature_c.toFixed(1),
      unit: '°C',
      min: 22.0,
      max: 28.0,
      safeMin: 24.5,
      safeMax: 26.0,
      velocity: null,
      target: `${targets.temperature_c.toFixed(1)} °C`,
      clamp: 'Max ±1.0/24h',
      tooltip: {
        title: 'Water Temperature',
        text: 'The thermal governor of coral metabolic rate and calcification enzymes.',
        why: 'Corals cannot regulate body temperature. Too cold slows down biological pumps; too hot triggers coral bleaching where polyps spit out their symbiotic algae and starve.'
      },
      isWarning: current.temperature_c < 23.8 || current.temperature_c > 27.0
    },
    {
      id: 'param-ph',
      name: 'pH Index',
      formula: 'Acidity Index',
      rawValue: current.ph,
      value: current.ph.toFixed(2),
      unit: 'pH',
      min: 7.7,
      max: 8.6,
      safeMin: 8.10,
      safeMax: 8.35,
      velocity: null,
      target: '8.10 - 8.35',
      clamp: 'Acid Base',
      tooltip: {
        title: 'pH (Water Acidity)',
        text: 'The logarithmic measure of hydrogen ion activity in the water column.',
        why: 'If pH drops below 7.80, the water becomes acidic enough that it literally starts dissolving the calcium carbonate skeleton back into liquid water.'
      },
      isWarning: current.ph < 7.95 || current.ph > 8.45
    }
  ];

  return (
    <div className="telemetry-instrument-grid" id="telemetry-grid">
      {params.map((p) => {
        const velFormatted =
          p.velocity !== null && p.velocity !== undefined
            ? `${p.velocity > 0 ? '+' : ''}${p.velocity.toFixed(2)} ${p.velocityUnit}`
            : null;

        // Calculate visual range positions
        const percentVal = Math.max(
          2,
          Math.min(98, ((p.rawValue - p.min) / (p.max - p.min)) * 100)
        );
        const safeLeft = Math.max(0, ((p.safeMin - p.min) / (p.max - p.min)) * 100);
        const safeWidth = Math.min(
          100 - safeLeft,
          ((p.safeMax - p.safeMin) / (p.max - p.min)) * 100
        );
        const inSafeZone = p.rawValue >= p.safeMin && p.rawValue <= p.safeMax;

        return (
          <div
            key={p.id}
            id={p.id}
            className={`telemetry-card ${p.isWarning ? 'card-warning' : ''}`}
          >
            {/* Card Header: Name + Formula + Tooltip */}
            <div className="telemetry-header">
              <div className="telemetry-name-row">
                <span className="telemetry-name">{p.name}</span>
                <Tooltip
                  title={p.tooltip.title}
                  text={p.tooltip.text}
                  whyItMatters={p.tooltip.why}
                />
              </div>
              <span className="telemetry-formula">{p.formula}</span>
            </div>

            {/* Primary Value & Drift Rate */}
            <div className="telemetry-value-row">
              <span className="telemetry-number">{p.value}</span>
              <span className="telemetry-unit">{p.unit}</span>

              {velFormatted && (
                <span
                  className={`velocity-badge ${p.isWarning ? 'warning' : 'safe'}`}
                  style={{ marginLeft: 'auto' }}
                  title="24-hour rate of change calculated from historical test logs"
                >
                  {velFormatted}
                </span>
              )}
            </div>

            {/* Visual Safe-Range Bracket Bar (ReefBeat / Aquarimate Standard) */}
            <div className="telemetry-range-container" title={`Safe Range: ${p.safeMin} - ${p.safeMax} ${p.unit}`}>
              <div className="telemetry-range-track">
                {/* Safe bracket span */}
                <div
                  className="telemetry-safe-bracket"
                  style={{ left: `${safeLeft}%`, width: `${safeWidth}%` }}
                />
                {/* Current value pin */}
                <div
                  className={`telemetry-range-pin ${inSafeZone ? 'pin-safe' : 'pin-warning'}`}
                  style={{ left: `${percentVal}%` }}
                />
              </div>
              <div className="range-bounds-row">
                <span>{p.min}</span>
                <span className="range-safe-label">Safe: {p.safeMin}–{p.safeMax}</span>
                <span>{p.max}</span>
              </div>
            </div>

            {/* Card Footer: Target & Speed Clamp */}
            <div className="telemetry-footer">
              <span className="telemetry-target">Target: {p.target}</span>
              <span className="telemetry-clamp" title="Biological maximum safe daily speed">
                {p.clamp}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
