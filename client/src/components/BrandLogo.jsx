import React from 'react';

/**
 * BrandLogo — Precision Bio-Chemical Aragonite Aperture Mark
 * Designed according to tech-branding-logo & brandkit guidelines:
 * Geometry: Interlocking hexagonal aragonite prisms converging on an equilibrium core.
 * Typography: Architectural uppercase sans paired with a technical monospace descriptor.
 */
export default function BrandLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', userSelect: 'none' }}
    >
      {/* Precision Geometric SVG Symbol */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 12px rgba(20, 184, 166, 0.25))' }}
        >
          {/* Outer Aragonite Hexagonal Ring */}
          <polygon
            points="22,3 38,12 38,32 22,41 6,32 6,12"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            fill="#0b0f15"
          />

          {/* Calcite Equilibrium Lattice Planes */}
          <path
            d="M22 3 L22 41"
            stroke="rgba(20, 184, 166, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <path
            d="M6 12 L38 32"
            stroke="rgba(20, 184, 166, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <path
            d="M6 32 L38 12"
            stroke="rgba(20, 184, 166, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Primary Coral Symbiont Prisms (Cyan & Emerald Gradient) */}
          <polygon
            points="22,10 32,16 22,22 12,16"
            fill="url(#brandGrad1)"
            opacity="0.85"
          />
          <polygon
            points="12,16 22,22 22,34 12,28"
            fill="url(#brandGrad2)"
            opacity="0.95"
          />
          <polygon
            points="32,16 32,28 22,34 22,22"
            fill="url(#brandGrad3)"
            opacity="0.75"
          />

          {/* Central Equilibrium Nucleus */}
          <circle cx="22" cy="22" r="2.5" fill="#ffffff" />
          <circle cx="22" cy="22" r="5" stroke="#2dd4bf" strokeWidth="1" opacity="0.6" />

          {/* Definitions */}
          <defs>
            <linearGradient id="brandGrad1" x1="12" y1="10" x2="32" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2dd4bf" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="brandGrad2" x1="12" y1="16" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f766e" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="brandGrad3" x1="32" y1="16" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14b8a6" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Editorial Tech Brand Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#f8fafc',
                textTransform: 'uppercase'
              }}
            >
              Before It Turns White
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.625rem',
                fontWeight: 600,
                color: '#2dd4bf',
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.25)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                letterSpacing: '0.06em'
              }}
            >
              48H BIO-GUARD
            </span>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6875rem',
              color: '#64748b',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            Predictive Coral Reef Water Chemistry System
          </div>
        </div>
      )}
    </div>
  );
}
