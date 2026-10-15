import React, { useState } from 'react';
import { History, Trash2, Download, RefreshCw, Check, X } from 'lucide-react';

export default function TestHistoryTable({ history, onDeleteEntry, onResetDefaults, onExportData }) {
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="card" id="test-history-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <History size={32} style={{ margin: '0 auto', opacity: 0.6 }} />
        </div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: 700 }}>
          No Historical Logs Recorded Yet
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
          Every time you test your aquarium water and click "Log Test Kit", your entry is saved to your browser's local storage with timestamped velocities.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={onResetDefaults} style={{ margin: '0 auto' }}>
          <RefreshCw size={14} />
          <span>Load Demonstration Trajectory</span>
        </button>
      </div>
    );
  }

  const handleDeleteClick = (idx) => {
    if (confirmDeleteIdx === idx) {
      onDeleteEntry(idx);
      setConfirmDeleteIdx(null);
    } else {
      setConfirmDeleteIdx(idx);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteIdx(null);
  };

  return (
    <div className="card" id="test-history-card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={16} className="text-cyan" />
          <span className="card-title">Test History Ledger ({history.length} Logs Saved)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onExportData} title="Export data as JSON">
            <Download size={13} />
            <span>Export JSON</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onResetDefaults} title="Restore standard baseline">
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile via CSS) */}
      <div className="history-desktop-table schedule-table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Alkalinity</th>
              <th>Calcium</th>
              <th>Magnesium</th>
              <th>Salinity</th>
              <th>Nutrients (NO3 / PO4)</th>
              <th>Temp / pH</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, idx) => {
              const dateStr = new Date(entry.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isConfirming = confirmDeleteIdx === idx;

              return (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                    {dateStr}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      {entry.alkalinity_dkh.toFixed(2)} dKH
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {entry.calcium_ppm.toFixed(0)} ppm
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {entry.magnesium_ppm.toFixed(0)} ppm
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {entry.salinity_sg.toFixed(4)} SG
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    {entry.nitrate_ppm.toFixed(1)} / {entry.phosphate_ppm.toFixed(3)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    {entry.temperature_c.toFixed(1)}°C | {entry.ph.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isConfirming ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          className="btn-delete-confirm"
                          onClick={() => handleDeleteClick(idx)}
                          title="Confirm permanent deletion"
                          aria-label="Confirm delete"
                          style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.6875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Check size={12} /> Yes
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          title="Cancel deletion"
                          aria-label="Cancel delete"
                          style={{
                            background: 'var(--bg-surface)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-hairline)',
                            borderRadius: '4px',
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.6875rem',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(idx)}
                        title="Delete this historical entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Visible only on mobile via CSS) */}
      <div className="history-mobile-cards">
        {history.map((entry, idx) => {
          const dateStr = new Date(entry.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const isConfirming = confirmDeleteIdx === idx;

          return (
            <div key={idx} className="history-log-card">
              <div className="history-card-header">
                <span className="history-card-date">{dateStr}</span>
                {isConfirming ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleDeleteClick(idx)}
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.6875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete? Yes
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.6875rem',
                        cursor: 'pointer'
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteClick(idx)}
                    title="Delete entry"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* 4 Primary Parameters */}
              <div className="history-card-grid">
                <div className="history-card-metric">
                  <span className="metric-tag">Alk</span>
                  <span className="metric-val text-cyan">{entry.alkalinity_dkh.toFixed(2)} dKH</span>
                </div>
                <div className="history-card-metric">
                  <span className="metric-tag">Calcium</span>
                  <span className="metric-val">{entry.calcium_ppm.toFixed(0)} ppm</span>
                </div>
                <div className="history-card-metric">
                  <span className="metric-tag">Magnesium</span>
                  <span className="metric-val">{entry.magnesium_ppm.toFixed(0)} ppm</span>
                </div>
                <div className="history-card-metric">
                  <span className="metric-tag">Salinity</span>
                  <span className="metric-val">{entry.salinity_sg.toFixed(4)} SG</span>
                </div>
              </div>

              {/* Secondary Nutrients and Temp */}
              <div className="history-card-subrow">
                <span>NO3: {entry.nitrate_ppm.toFixed(1)} ppm</span>
                <span>•</span>
                <span>PO4: {entry.phosphate_ppm.toFixed(3)} ppm</span>
                <span>•</span>
                <span>{entry.temperature_c.toFixed(1)}°C / pH {entry.ph.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
