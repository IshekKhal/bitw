import React, { useState, useEffect } from 'react';
import { X, Cpu, Wifi, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, Radio } from 'lucide-react';
import { API_BASE } from '../apiConfig';

export default function HardwareSyncModal({ isOpen, onClose, onApplyTelemetry, activeTelemetry }) {
  if (!isOpen) return null;

  const [controllerType, setControllerType] = useState('neptune_apex');
  const [host, setHost] = useState('apex.local');
  const [port, setPort] = useState(80);
  const [autoPoll, setAutoPoll] = useState(false);
  const [pollInterval, setPollInterval] = useState(60); // seconds
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [activeTab, setActiveTab] = useState('poll'); // 'poll' | 'webhook'

  const handlePoll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hardware/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controller_type: controllerType,
          host: host,
          port: parseInt(port, 10) || 80
        })
      });

      if (!res.ok) throw new Error('Polling failed');
      const data = await res.json();
      setSyncResult(data);
    } catch (err) {
      setSyncResult({
        status: 'connection_failed',
        controller_type: controllerType,
        host: host,
        latency_ms: 0,
        error_message: 'Could not connect to controller host. Verify IP or try sandbox simulation.',
        probes_detected: {},
        normalized_telemetry: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (syncResult && syncResult.normalized_telemetry) {
      onApplyTelemetry(syncResult.normalized_telemetry, {
        controllerType,
        host,
        timestamp: syncResult.timestamp
      });
      onClose();
    }
  };

  const webhookUrl = `${window.location.origin}/api/hardware/ingest`;
  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"temp": 78.2, "ph": 8.25, "alk": 8.4, "ca": 425, "mg": 1360, "no3": 4.8, "po4": 0.04}'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="modal-title">Hardware Controller Link</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Direct LAN telemetry polling & automated webhook ingestion
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('poll')}
            style={{
              background: activeTab === 'poll' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'poll' ? '#38bdf8' : 'var(--text-muted)',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Radio size={14} /> Local LAN Poller
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            style={{
              background: activeTab === 'webhook' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'webhook' ? '#38bdf8' : 'var(--text-muted)',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Wifi size={14} /> Webhook Ingest
          </button>
        </div>

        {activeTab === 'poll' ? (
          <div>
            {/* Controller Model Select */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                Controller Model
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'neptune_apex', label: 'Neptune Apex + Trident' },
                  { id: 'ghl_profilux', label: 'GHL Profilux / KH Director' },
                  { id: 'coralvue_hydros', label: 'CoralVue Hydros' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setControllerType(item.id);
                      if (item.id === 'neptune_apex') setHost('apex.local');
                      if (item.id === 'ghl_profilux') setHost('profilux.local');
                      if (item.id === 'coralvue_hydros') setHost('hydros.local');
                    }}
                    style={{
                      background: controllerType === item.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-elevated)',
                      border: `1px solid ${controllerType === item.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      color: controllerType === item.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      borderRadius: '8px',
                      padding: '0.625rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      lineHeight: 1.3
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Host and Port */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Controller IP / LAN Hostname
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. 192.168.1.150 or apex.local"
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>
            </div>

            {/* Poll Action Button */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handlePoll}
                disabled={loading}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'var(--accent-cyan)',
                  color: '#020617',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.625rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Connecting & Reading Probes...' : 'Poll Controller Probes Now'}
              </button>
            </div>

            {/* Poll Result Feedback */}
            {syncResult && (
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${syncResult.status === 'connected' ? 'var(--status-stable)' : 'rgba(56, 189, 248, 0.4)'}`,
                  borderRadius: '8px',
                  padding: '0.875rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <CheckCircle2 size={16} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {syncResult.status === 'connected' ? 'Physical LAN Link Established' : 'Hardware Simulation Feed Active'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {syncResult.latency_ms} ms latency
                  </span>
                </div>

                {/* Probe Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {Object.entries(syncResult.probes_detected).map(([name, val]) => (
                    <div
                      key={name}
                      style={{
                        background: 'var(--bg-elevated)',
                        padding: '0.375rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.6875rem'
                      }}
                    >
                      <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{name}</div>
                      <div style={{ color: '#38bdf8', fontSize: '0.8125rem', fontWeight: 700 }}>{val}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  style={{
                    width: '100%',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid #38bdf8',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Apply Synced Probes to Active Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Webhook Tab */
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Have Home Assistant, reef-pi, or a Raspberry Pi monitoring your tank? Push readings automatically via REST:
            </p>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <pre
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.6875rem',
                  color: '#94a3b8',
                  overflowX: 'auto',
                  lineHeight: 1.4
                }}
              >
                {curlExample}
              </pre>
              <button
                type="button"
                onClick={copyToClipboard}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {copiedWebhook ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                {copiedWebhook ? 'Copied' : 'Copy cURL'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
