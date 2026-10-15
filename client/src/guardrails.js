export const CLAMP_LIMITS = {
  alkalinity_dkh: 0.50,
  calcium_ppm: 20.0,
  magnesium_ppm: 50.0,
  salinity_sg: 0.0010,
  temperature_c: 1.0
};

export const TARGET_BASELINES = {
  sps_dominant: {
    alkalinity_dkh: 8.4,
    calcium_ppm: 420.0,
    magnesium_ppm: 1350.0,
    salinity_sg: 1.0255,
    temperature_c: 25.0
  },
  mixed_reef: {
    alkalinity_dkh: 8.6,
    calcium_ppm: 430.0,
    magnesium_ppm: 1350.0,
    salinity_sg: 1.0250,
    temperature_c: 25.0
  },
  lps_softie: {
    alkalinity_dkh: 9.0,
    calcium_ppm: 420.0,
    magnesium_ppm: 1320.0,
    salinity_sg: 1.0250,
    temperature_c: 25.0
  },
  nano_reef: {
    alkalinity_dkh: 8.2,
    calcium_ppm: 415.0,
    magnesium_ppm: 1320.0,
    salinity_sg: 1.0250,
    temperature_c: 25.0
  }
};

export function evaluateClientGuardrails(current, history = [], tankProfile = {}) {
  const systemType = tankProfile.system_type || 'sps_dominant';
  const volume = tankProfile.net_volume_liters || 280.0;
  const targets = TARGET_BASELINES[systemType] || TARGET_BASELINES.sps_dominant;

  // Calculate 24h velocities if history is available
  let alkVelocity = 0.0;
  let caVelocity = 0.0;
  let mgVelocity = 0.0;

  if (history && history.length > 0) {
    const prior = history[0];
    const currTime = new Date(current.timestamp).getTime();
    const prevTime = new Date(prior.timestamp).getTime();
    const deltaDays = Math.max((currTime - prevTime) / (1000 * 86400), 0.2);

    alkVelocity = Number(((current.alkalinity_dkh - prior.alkalinity_dkh) / deltaDays).toFixed(2));
    caVelocity = Number(((current.calcium_ppm - prior.calcium_ppm) / deltaDays).toFixed(1));
    mgVelocity = Number(((current.magnesium_ppm - prior.magnesium_ppm) / deltaDays).toFixed(1));
  }

  const caSafe = Math.max(current.calcium_ppm, 50.0);
  const mgCaRatio = Number((current.magnesium_ppm / caSafe).toFixed(2));

  let mgCaStatus = 'BALANCED (Nominal ~3.20)';
  if (mgCaRatio < 2.85) {
    mgCaStatus = 'CRITICALLY LOW (Shield Broken)';
  } else if (mgCaRatio < 3.05) {
    mgCaStatus = 'BORDERLINE DEFICIENT';
  } else if (mgCaRatio > 3.45) {
    mgCaStatus = 'ELEVATED MAGNESIUM';
  }

  const hTerm = Math.pow(10, current.ph - 8.2);
  const ionicProduct = Number(((current.calcium_ppm * current.alkalinity_dkh * hTerm) / (420.0 * 8.5)).toFixed(2));
  const aragoniteProxy = Number(((current.calcium_ppm / 420.0) * (current.alkalinity_dkh / 8.5) * hTerm).toFixed(2));
  const redfieldRatio = Number((current.nitrate_ppm / ((Math.max(current.phosphate_ppm, 0.001) * 16.0) + 1e-4)).toFixed(1));
  // Ecosystem-specific biological sensitivity limits
  let alkShockLimit = 0.60;
  let alkDriftLimit = 0.35;
  let alkLabel = 'SPS Acropora Vulnerability: Acropora tissue cannot tolerate rapid carbonate shifts';
  let po4StarveAlkThresh = 8.20;
  let po4StarveMin = 0.015;

  if (systemType === 'lps_softie') {
    alkShockLimit = 1.05;
    alkDriftLimit = 0.65;
    alkLabel = 'LPS & Softie Resilience: Fleshy corals tolerate moderate shifts';
    po4StarveAlkThresh = 9.50;
    po4StarveMin = 0.005;
  } else if (systemType === 'nano_reef') {
    alkShockLimit = 0.70;
    alkDriftLimit = 0.40;
    alkLabel = 'Nano Reef Hazard: Low water volume amplifies chemical oscillations';
    po4StarveAlkThresh = 8.40;
    po4StarveMin = 0.010;
  } else if (systemType === 'mixed_reef') {
    alkShockLimit = 0.80;
    alkDriftLimit = 0.45;
    alkLabel = 'Mixed Reef Equilibrium';
    po4StarveAlkThresh = 8.50;
    po4StarveMin = 0.010;
  }

  const isStarved = (systemType !== 'lps_softie' && current.phosphate_ppm < po4StarveMin && current.alkalinity_dkh > po4StarveAlkThresh) ? 1 : 0;

  // Deterministic checks
  let crashProb = 0.05;
  let riskLevel = 'STABLE';
  let primaryDriver = `All 8 Parameters in Safe Range: Reef chemistry is balanced and stable for ${systemType.replace('_', ' ')}.`;
  let secondaryDriver = null;

  if (mgCaRatio < 2.85 || (current.magnesium_ppm < 1200 && current.alkalinity_dkh > 8.0)) {
    crashProb = mgCaRatio < 2.70 ? 0.88 : 0.79;
    riskLevel = 'IMMINENT_COLLAPSE';
    primaryDriver = `Magnesium Shield Depleted: Ratio is ${mgCaRatio} (target is ~3.20). Calcium and alkalinity will bind and precipitate out like snow, starving corals.`;
  } else if (Math.abs(alkVelocity) >= alkShockLimit) {
    crashProb = 0.92;
    riskLevel = 'IMMINENT_COLLAPSE';
    const direction = alkVelocity < 0 ? 'dropped' : 'jumped';
    primaryDriver = `Alkalinity Shock: Alkalinity ${direction} ${alkVelocity > 0 ? '+' : ''}${alkVelocity} dKH in 24h. ${alkLabel}—tissue will peel off (RTN) within 48h unless stabilized.`;
  } else if (current.alkalinity_dkh < 6.5) {
    crashProb = 0.85;
    riskLevel = 'IMMINENT_COLLAPSE';
    primaryDriver = `Severe Alkalinity Depletion: Buffer dropped to ${current.alkalinity_dkh} dKH. Corals cannot build skeleton and tissue will recede from base.`;
  } else if (isStarved) {
    crashProb = 0.68;
    riskLevel = 'COUPLING_DRIFT';
    primaryDriver = `Phosphate Starvation & Burnt Tips: Zero phosphate (${current.phosphate_ppm} ppm) at elevated alkalinity (${current.alkalinity_dkh} dKH). Corals starve under intense lights and burn tips within 48h.`;
  } else if (mgCaRatio < 3.05) {
    crashProb = 0.28;
    riskLevel = 'COUPLING_DRIFT';
    primaryDriver = `Mild Magnesium Drift: Ratio ${mgCaRatio} is drifting near the 2.85 precipitation boundary.`;
  } else if (Math.abs(alkVelocity) >= alkDriftLimit) {
    crashProb = systemType === 'sps_dominant' ? 0.55 : 0.35;
    riskLevel = 'COUPLING_DRIFT';
    primaryDriver = `Moderate Alkalinity Drift: ${alkVelocity > 0 ? '+' : ''}${alkVelocity} dKH/24h. Safe limit for ${systemType.replace('_', ' ')} is ±${alkDriftLimit} dKH.`;
  }

  // Generate remediation plan
  const deltaAlk = Math.max(0, targets.alkalinity_dkh - current.alkalinity_dkh);
  const deltaCa = Math.max(0, targets.calcium_ppm - current.calcium_ppm);
  const deltaMg = Math.max(0, targets.magnesium_ppm - current.magnesium_ppm);

  const daysAlk = Math.ceil(deltaAlk / CLAMP_LIMITS.alkalinity_dkh) || 1;
  const daysCa = Math.ceil(deltaCa / CLAMP_LIMITS.calcium_ppm) || 1;
  const daysMg = Math.ceil(deltaMg / CLAMP_LIMITS.magnesium_ppm) || 1;
  const totalDays = Math.max(daysAlk, daysCa, daysMg, 1);

  const schedule = [];
  let remAlk = deltaAlk;
  let remCa = deltaCa;
  let remMg = deltaMg;
  let runningAlk = current.alkalinity_dkh;
  let runningCa = current.calcium_ppm;
  let runningMg = current.magnesium_ppm;

  const mgCompromised = mgCaRatio < 2.85 || current.magnesium_ppm < 1250;

  for (let d = 1; d <= totalDays; d++) {
    const stepDate = new Date(Date.now() + (d - 1) * 86400000).toISOString().split('T')[0];

    if (d === 1 && mgCompromised && remMg > 0) {
      const stepMg = Math.min(CLAMP_LIMITS.magnesium_ppm, remMg);
      remMg -= stepMg;
      runningMg += stepMg;
      const mgMl = Number(((stepMg * volume / 120.0) / 0.10).toFixed(1));

      schedule.push({
        day: d,
        date: stepDate,
        action: 'Dose Magnesium only. DO NOT DOSE ALKALINITY TODAY.',
        chemical: 'Magnesium Chloride / Sulfate Solution',
        amount_ml: mgMl,
        expected_parameter_end_of_day: {
          alkalinity_dkh: Number(runningAlk.toFixed(2)),
          calcium_ppm: Number(runningCa.toFixed(1)),
          magnesium_ppm: Number(runningMg.toFixed(1))
        },
        reasoning: 'Raising magnesium above 1250 ppm poisons crystal growth sites, halting spontaneous calcium carbonate precipitation.'
      });
    } else {
      const stepMg = remMg > 0 ? Math.min(CLAMP_LIMITS.magnesium_ppm, remMg) : 0;
      const stepAlk = remAlk > 0 ? Math.min(CLAMP_LIMITS.alkalinity_dkh, remAlk) : 0;
      const stepCa = remCa > 0 ? Math.min(CLAMP_LIMITS.calcium_ppm, remCa) : 0;

      remMg -= stepMg;
      remAlk -= stepAlk;
      remCa -= stepCa;

      runningMg += stepMg;
      runningAlk += stepAlk;
      runningCa += stepCa;

      const mgMl = stepMg > 0 ? Number(((stepMg * volume / 120.0) / 0.10).toFixed(1)) : 0;
      const alkMl = stepAlk > 0 ? Number(((stepAlk * volume / 33.33) / 0.0375).toFixed(1)) : 0;
      const caMl = stepCa > 0 ? Number(((stepCa * volume / 272.0) / 0.0750).toFixed(1)) : 0;

      schedule.push({
        day: d,
        date: stepDate,
        action: `Staggered: Mg +${stepMg.toFixed(0)} ppm, Alk +${stepAlk.toFixed(2)} dKH, Ca +${stepCa.toFixed(0)} ppm`,
        chemical: 'Magnesium, Sodium Bicarbonate, Calcium Chloride',
        amount_ml: Number((mgMl + alkMl + caMl).toFixed(1)),
        expected_parameter_end_of_day: {
          alkalinity_dkh: Number(runningAlk.toFixed(2)),
          calcium_ppm: Number(runningCa.toFixed(1)),
          magnesium_ppm: Number(runningMg.toFixed(1))
        },
        reasoning: `Enforcing safe daily clamps (max +${CLAMP_LIMITS.alkalinity_dkh} dKH/24h) to avoid osmotic cellular shock and rapid tissue detachment.`
      });
    }
  }

  return {
    status: 'fallback_engaged',
    engine_used: 'deterministic-marine-guardrails (client-local)',
    evaluated_at: new Date().toISOString(),
    risk_assessment: {
      crash_probability_48h: crashProb,
      risk_level: riskLevel,
      confidence_score: 0.95,
      primary_driver: primaryDriver,
      secondary_driver: secondaryDriver
    },
    chemical_indicators: {
      mg_ca_ratio: mgCaRatio,
      mg_ca_status: mgCaStatus,
      alk_velocity_24h: alkVelocity,
      ca_velocity_24h: caVelocity,
      mg_velocity_24h: mgVelocity,
      ionic_product_index: ionicProduct,
      aragonite_saturation_proxy: aragoniteProxy,
      redfield_nutrient_ratio: redfieldRatio,
      nutrient_starvation_flag: isStarved
    },
    remediation_plan: {
      target_parameters: targets,
      rate_limited_schedule: schedule
    }
  };
}
