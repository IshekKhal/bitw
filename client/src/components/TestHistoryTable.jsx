import React from 'react';
import { History, Trash2, Download, AlertCircle, RefreshCw } from 'lucide-react';

export default function TestHistoryTable({ history, onDeleteEntry, onResetDefaults, onExportData }) {
  if (!history || history.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <History size={32} style={{ margin: '0 auto', opacity: 0.6 }} />
        </div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No Historical Logs Recorded Yet
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
          Every time you test your aquarium water and click "Log Test Kit", your entry is saved to your browser's local storage with timestamped velocities.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={onResetDefaults} style={{ margin: '0 auto' }}>
          <RefreshCw size={14} />
          <span>Load Demonstration Trajectory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card" id="test-history-card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={16} color="var(--color-ocean)" />
          <span className="card-title">Test History Ledger ({history.length} Logs Saved)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onExportData} title="Export data as JSON">
            <Download size={14} />
            <span>Export JSON</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onResetDefaults} title="Restore standard baseline">
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="schedule-table-wrap">
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
              <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
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
                    <button
                      className="btn-delete"
                      onClick={() => onDeleteEntry(idx)}
                      title="Delete this historical entry"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
