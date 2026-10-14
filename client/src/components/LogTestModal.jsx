import React, { useState } from 'react';
import { X, FlaskConical, Check } from 'lucide-react';
import { normalizeAlkalinity, normalizeSalinity, normalizeTemperature } from '../normalizer';

export default function LogTestModal({ isOpen, onClose, onSubmitTest, initialValues }) {
  if (!isOpen) return null;

  const [salinityVal, setSalinityVal] = useState(initialValues.salinity_sg || 1.025);
  const [salinityUnit, setSalinityUnit] = useState('sg');

  const [alkVal, setAlkVal] = useState(initialValues.alkalinity_dkh || 8.4);
  const [alkUnit, setAlkUnit] = useState('dkh');

  const [caVal, setCaVal] = useState(initialValues.calcium_ppm || 420);
  const [mgVal, setMgVal] = useState(initialValues.magnesium_ppm || 1350);
  const [no3Val, setNo3Val] = useState(initialValues.nitrate_ppm || 5.0);
  const [po4Val, setPo4Val] = useState(initialValues.phosphate_ppm || 0.04);

  const [tempVal, setTempVal] = useState(initialValues.temperature_c || 25.0);
  const [tempUnit, setTempUnit] = useState('c');

  const [phVal, setPhVal] = useState(initialValues.ph || 8.2);

  // Live normalized values
  const normSG = normalizeSalinity(salinityVal, salinityUnit);
  const normAlk = normalizeAlkalinity(alkVal, alkUnit);
  const normTemp = normalizeTemperature(tempVal, tempUnit);

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedEntry = {
      timestamp: new Date().toISOString(),
      salinity_sg: normSG,
      alkalinity_dkh: normAlk,
      calcium_ppm: parseFloat(caVal) || 420.0,
      magnesium_ppm: parseFloat(mgVal) || 1350.0,
      nitrate_ppm: parseFloat(no3Val) || 5.0,
      phosphate_ppm: parseFloat(po4Val) || 0.04,
      temperature_c: normTemp,
      ph: parseFloat(phVal) || 8.2
    };

    onSubmitTest(normalizedEntry);
    onClose();
  };

  return (
    <div className="modal-overlay" id="log-test-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FlaskConical size={20} color="#38bdf8" />
            <span>Log Test Kit Measurements</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            {/* Salinity */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-salinity">Salinity</label>
              <div className="input-with-unit">
                <input
                  id="input-salinity"
                  type="number"
                  step="0.0001"
                  className="form-input"
                  value={salinityVal}
                  onChange={(e) => setSalinityVal(e.target.value)}
                  required
                />
                <select
                  className="unit-select"
                  value={salinityUnit}
                  onChange={(e) => setSalinityUnit(e.target.value)}
                >
                  <option value="sg">SG</option>
                  <option value="ppt">ppt</option>
                </select>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                Normalized: {normSG} SG
              </span>
            </div>

            {/* Alkalinity */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-alkalinity">Alkalinity</label>
              <div className="input-with-unit">
                <input
                  id="input-alkalinity"
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={alkVal}
                  onChange={(e) => setAlkVal(e.target.value)}
                  required
                />
                <select
                  className="unit-select"
                  value={alkUnit}
                  onChange={(e) => setAlkUnit(e.target.value)}
                >
                  <option value="dkh">dKH</option>
                  <option value="meq_l">meq/L</option>
                  <option value="ppm">ppm</option>
                </select>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                Normalized: {normAlk} dKH
              </span>
            </div>

            {/* Calcium */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-calcium">Calcium (ppm)</label>
              <div className="input-with-unit">
                <input
                  id="input-calcium"
                  type="number"
                  step="1"
                  className="form-input"
                  value={caVal}
                  onChange={(e) => setCaVal(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Magnesium */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-magnesium">Magnesium (ppm)</label>
              <div className="input-with-unit">
                <input
                  id="input-magnesium"
                  type="number"
                  step="1"
                  className="form-input"
                  value={mgVal}
                  onChange={(e) => setMgVal(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Nitrate */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-nitrate">Nitrate NO3 (ppm)</label>
              <div className="input-with-unit">
                <input
                  id="input-nitrate"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={no3Val}
                  onChange={(e) => setNo3Val(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phosphate */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-phosphate">Phosphate PO4 (ppm)</label>
              <div className="input-with-unit">
                <input
                  id="input-phosphate"
                  type="number"
                  step="0.001"
                  className="form-input"
                  value={po4Val}
                  onChange={(e) => setPo4Val(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-temperature">Temperature</label>
              <div className="input-with-unit">
                <input
                  id="input-temperature"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={tempVal}
                  onChange={(e) => setTempVal(e.target.value)}
                  required
                />
                <select
                  className="unit-select"
                  value={tempUnit}
                  onChange={(e) => setTempUnit(e.target.value)}
                >
                  <option value="c">°C</option>
                  <option value="f">°F</option>
                </select>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                Normalized: {normTemp} °C
              </span>
            </div>

            {/* pH */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-ph">pH Scale</label>
              <div className="input-with-unit">
                <input
                  id="input-ph"
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={phVal}
                  onChange={(e) => setPhVal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="btn-submit-test" className="btn btn-primary">
              <Check size={16} />
              <span>Evaluate Crash Risk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
