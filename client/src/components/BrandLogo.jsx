import React from 'react';

/**
 * BrandLogo — Iconic Coral Shield & Aragonite Crystal Mark
 * Represents the 48-hour threshold between vibrant living coral and bleached white calcium skeleton.
 * Designed to scale cleanly across mobile viewports (down to 24px) up to high-density desktop displays.
 */
export default function BrandLogo({ size = 32, showText = true, className = '' }) {
  return (
    <div
      className={`brand-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Precision Vector Emblem */}
      <div
        className="brand-logo-mark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Before It Turns White Emblem"
        >
          {/* Outer Protective Aragonite Shield Hexagon */}
          <path
            d="M20 2L35 10.5V29.5L20 38L5 29.5V10.5L20 2Z"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
            fill="#090D14"
          />

          {/* Living Bio-Coral Branch (Teal to Sapphire Gradient) */}
          <path
            d="M20 7V20M20 20L13 14M20 20L27 14M20 20V31M15 25L20 31L25 25"
            stroke="url(#coralGrad)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Living Polyp Nucleus Dots */}
          <circle cx="20" cy="7" r="2" fill="#2dd4bf" />
          <circle cx="13" cy="14" r="1.75" fill="#38bdf8" />
          <circle cx="27" cy="14" r="1.75" fill="#38bdf8" />
          <circle cx="20" cy="20" r="2.5" fill="#ffffff" />
          <circle cx="20" cy="31" r="1.75" fill="#0ea5e9" />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="coralGrad" x1="13" y1="7" x2="27" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2dd4bf" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark & Descriptor */}
      {showText && (
        <div className="brand-text-block">
          <div className="brand-title-row">
            <span className="brand-name">BEFORE IT TURNS WHITE</span>
            <span className="brand-tag">48H GUARD</span>
          </div>
          <span className="brand-subtitle">Predictive Reef Chemistry</span>
        </div>
      )}
    </div>
  );
}
